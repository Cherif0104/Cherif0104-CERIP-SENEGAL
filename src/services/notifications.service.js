// Service de gestion des notifications avec Supabase
import { supabase } from '../lib/supabase'

const TABLE = 'notifications'

export const notificationsService = {
  async getAll(filters = {}) {
    try {
      let query = supabase
        .from(TABLE)
        .select('*')
        .order('created_at', { ascending: false })

      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id)
      }
      if (filters.type) {
        query = query.eq('type', filters.type)
      }
      if (filters.lu !== undefined) {
        query = query.eq('lu', filters.lu)
      }

      const { data, error } = await query

      if (error) {
        return { data: [], error }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return { data: [], error }
    }
  },

  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from(TABLE)
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('lu', false)

      if (error) {
        return { count: 0, error }
      }

      return { count: count || 0, error: null }
    } catch (error) {
      console.error('Error counting unread notifications:', error)
      return { count: 0, error }
    }
  },

  async markAsRead(id) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .update({ lu: true, read_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return { data: null, error }
    }
  },

  async markAllAsRead(userId) {
    try {
      const { error } = await supabase
        .from(TABLE)
        .update({ lu: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('lu', false)

      return { data: { success: true }, error }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return { data: null, error }
    }
  },

  async create(notification) {
    try {
      const notificationData = {
        user_id: notification.user_id,
        type: notification.type || 'INFO',
        titre: notification.titre,
        message: notification.message,
        lien: notification.lien || null,
        lu: false
      }

      const { data, error } = await supabase
        .from(TABLE)
        .insert(notificationData)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating notification:', error)
      return { data: null, error }
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from(TABLE)
        .delete()
        .eq('id', id)

      return { data: { id }, error }
    } catch (error) {
      console.error('Error deleting notification:', error)
      return { data: null, error }
    }
  }
}
