import { useEffect, useState } from 'react'
import { useAuthCandidat } from '@/hooks/useAuthCandidat'
import { supabase } from '@/lib/supabase'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './NotificationsCandidat.css'

export default function NotificationsCandidat() {
  const { user } = useAuthCandidat()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadNotifications()
      
      // Écouter les nouvelles notifications en temps réel
      const subscription = supabase
        .channel('notifications_candidat')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            logger.debug('NOTIFICATIONS_CANDIDAT', 'Nouvelle notification reçue', payload)
            setNotifications((prev) => [payload.new, ...prev])
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('NOTIFICATIONS_CANDIDAT', 'Erreur chargement notifications', error)
        return
      }

      setNotifications(data || [])
      logger.debug('NOTIFICATIONS_CANDIDAT', `${data?.length || 0} notifications chargées`)
    } catch (error) {
      logger.error('NOTIFICATIONS_CANDIDAT', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ lu: true })
        .eq('id', notificationId)

      if (error) throw error

      setNotifications((prev) =>
        prev.map((notif) => (notif.id === notificationId ? { ...notif, lu: true } : notif))
      )
    } catch (error) {
      logger.error('NOTIFICATIONS_CANDIDAT', 'Erreur marquer comme lu', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ lu: true })
        .eq('user_id', user.id)
        .eq('lu', false)

      if (error) throw error

      setNotifications((prev) => prev.map((notif) => ({ ...notif, lu: true })))
    } catch (error) {
      logger.error('NOTIFICATIONS_CANDIDAT', 'Erreur marquer toutes comme lues', error)
    }
  }

  const unreadCount = notifications.filter((n) => !n.lu).length

  if (loading) return <LoadingState />

  return (
    <div className="notifications-candidat">
      <div className="page-header">
        <div>
          <h1>Mes Notifications</h1>
          <p>Restez informé de l'évolution de vos candidatures</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="mark-all-read-btn">
            <Icon name="Check" size={16} />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {unreadCount > 0 && (
        <div className="unread-badge">
          {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
        </div>
      )}

      {notifications.length === 0 ? (
        <EmptyState
          icon="Bell"
          title="Aucune notification"
          message="Vous recevrez des notifications lorsque le statut de vos candidatures change."
        />
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.lu ? 'unread' : ''}`}
              onClick={() => !notification.lu && markAsRead(notification.id)}
            >
              <div className="notification-icon">
                <Icon name={getNotificationIcon(notification.type)} size={24} />
              </div>
              <div className="notification-content">
                <div className="notification-header">
                  <h3>{notification.titre}</h3>
                  {!notification.lu && <span className="unread-dot" />}
                </div>
                {notification.message && <p className="notification-message">{notification.message}</p>}
                <span className="notification-time">
                  {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function getNotificationIcon(type) {
  const iconMap = {
    STATUT_CHANGE: 'CheckCircle',
    DOCUMENT_REQUIRED: 'FileText',
    MESSAGE: 'Mail',
    REMINDER: 'Clock',
    default: 'Bell',
  }
  return iconMap[type] || iconMap.default
}

