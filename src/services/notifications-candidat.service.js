import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'

/**
 * Service Notifications Candidat
 * Gère les notifications pour les candidats
 */
export const notificationsCandidatService = {
  /**
   * Créer une notification pour un candidat
   */
  async createNotification(userId, type, titre, message, lien = null, metadata = {}) {
    try {
      logger.debug('NOTIFICATIONS_CANDIDAT_SERVICE', 'createNotification appelé', {
        userId,
        type,
        titre,
      })

      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          titre,
          message,
          lien,
          metadata,
          lu: false,
        })
        .select()
        .single()

      if (error) {
        logger.error('NOTIFICATIONS_CANDIDAT_SERVICE', 'Erreur création notification', error)
        throw error
      }

      logger.info('NOTIFICATIONS_CANDIDAT_SERVICE', 'Notification créée', { id: data.id })
      return { data, error: null }
    } catch (error) {
      logger.error('NOTIFICATIONS_CANDIDAT_SERVICE', 'Erreur globale createNotification', error)
      return { data: null, error }
    }
  },

  /**
   * Notifier un changement de statut de candidature
   */
  async notifyStatutChange(candidatId, ancienStatut, nouveauStatut) {
    try {
      // Récupérer le candidat et son user_id
      const { data: candidat } = await supabase
        .from('candidats')
        .select('user_id, email, nom, prenom, appels_candidatures(titre)')
        .eq('id', candidatId)
        .single()

      if (!candidat || !candidat.user_id) {
        logger.warn('NOTIFICATIONS_CANDIDAT_SERVICE', 'Pas de user_id pour le candidat', {
          candidatId,
        })
        return { error: null } // Non bloquant
      }

      const titre = 'Changement de statut de candidature'
      const message = `Votre candidature "${candidat.appels_candidatures?.titre || ''}" est passée de "${ancienStatut}" à "${nouveauStatut}"`

      return await this.createNotification(
        candidat.user_id,
        'STATUT_CHANGE',
        titre,
        message,
        `/candidat/candidature/${candidatId}`,
        {
          candidat_id: candidatId,
          ancien_statut: ancienStatut,
          nouveau_statut: nouveauStatut,
        }
      )
    } catch (error) {
      logger.error('NOTIFICATIONS_CANDIDAT_SERVICE', 'Erreur notifyStatutChange', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer les notifications d'un candidat
   */
  async getNotifications(userId, options = {}) {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (options.unreadOnly) {
        query = query.eq('lu', false)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      logger.error('NOTIFICATIONS_CANDIDAT_SERVICE', 'Erreur getNotifications', error)
      return { data: null, error }
    }
  },

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ lu: true })
        .eq('id', notificationId)

      if (error) throw error

      return { error: null }
    } catch (error) {
      logger.error('NOTIFICATIONS_CANDIDAT_SERVICE', 'Erreur markAsRead', error)
      return { error }
    }
  },

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(userId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ lu: true })
        .eq('user_id', userId)
        .eq('lu', false)

      if (error) throw error

      return { error: null }
    } catch (error) {
      logger.error('NOTIFICATIONS_CANDIDAT_SERVICE', 'Erreur markAllAsRead', error)
      return { error }
    }
  },
}

