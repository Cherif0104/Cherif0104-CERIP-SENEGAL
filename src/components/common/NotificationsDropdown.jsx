import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationsService } from '../../services/notifications.service'
import useAuth from '../../hooks/useAuth'
import Icon from './Icon'
import './NotificationsDropdown.css'

export default function NotificationsDropdown() {
  const navigate = useNavigate()
  const { userProfile, userId, loading: authLoading } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (userId) {
      loadNotifications()
      loadUnreadCount()
      
      // Rafraîchir toutes les 30 secondes
      const interval = setInterval(() => {
        loadNotifications()
        loadUnreadCount()
      }, 30000)

      return () => clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  useEffect(() => {
    // Fermer le dropdown si on clique en dehors
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const loadNotifications = async () => {
    if (!userId) return

    try {
      const { data } = await notificationsService.getAll({
        user_id: userId,
        lu: false
      })
      setNotifications(data || [])
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUnreadCount = async () => {
    if (!userId) return

    try {
      const { count } = await notificationsService.getUnreadCount(userId)
      setUnreadCount(count || 0)
    } catch (error) {
      console.error('Error loading unread count:', error)
    }
  }

  const handleMarkAsRead = async (notificationId, lien) => {
    try {
      await notificationsService.markAsRead(notificationId)
      await loadNotifications()
      await loadUnreadCount()
      
      if (lien) {
        navigate(lien)
      }
      setIsOpen(false)
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!userId) return

    try {
      await notificationsService.markAllAsRead(userId)
      await loadNotifications()
      await loadUnreadCount()
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getTypeIcon = (type) => {
    const icons = {
      'INFO': 'Info',
      'WARNING': 'AlertTriangle',
      'SUCCESS': 'CheckCircle',
      'ERROR': 'AlertCircle'
    }
    return icons[type] || 'Bell'
  }

  const getTypeColor = (type) => {
    const colors = {
      'INFO': 'var(--color-primary)',
      'WARNING': 'var(--color-warning)',
      'SUCCESS': 'var(--color-success)',
      'ERROR': 'var(--color-danger)'
    }
    return colors[type] || 'var(--color-gray-500)'
  }

  if (authLoading || !userId) {
    return null
  }

  return (
    <div className="notifications-dropdown" ref={dropdownRef}>
      <button
        className="notifications-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Icon name="Bell" size={20} />
        {unreadCount > 0 && (
          <span className="notifications-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-panel">
          <div className="notifications-panel-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button
                className="notifications-mark-all"
                onClick={handleMarkAllAsRead}
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="notifications-list">
            {loading ? (
              <div className="notifications-loading">Chargement...</div>
            ) : notifications.length === 0 ? (
              <div className="notifications-empty">
                <Icon name="Bell" size={32} />
                <p>Aucune notification</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.lu ? 'notification-item--unread' : ''}`}
                  onClick={() => handleMarkAsRead(notification.id, notification.lien)}
                >
                  <div
                    className="notification-icon"
                    style={{ backgroundColor: getTypeColor(notification.type) }}
                  >
                    <Icon name={getTypeIcon(notification.type)} size={16} />
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.titre}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">
                      {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  {!notification.lu && <div className="notification-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

