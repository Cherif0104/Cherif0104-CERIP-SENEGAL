import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'

/**
 * Service d'audit trail pour traçabilité complète (conformité ISO 9001)
 */
export const auditService = {
  /**
   * Récupérer l'historique d'audit pour une table et un enregistrement spécifique
   * @param {string} tableName - Nom de la table
   * @param {string} recordId - ID de l'enregistrement
   * @param {Object} options - Options de pagination et filtres
   * @returns {Promise<{data: Array, error: Error|null}>}
   */
  async getHistory(tableName, recordId, options = {}) {
    try {
      const { limit = 50, offset = 0, action = null } = options

      logger.debug('AUDIT_SERVICE', 'Récupération historique audit', {
        tableName,
        recordId,
        options,
      })

      let query = supabase
        .from('audit_log')
        .select('*')
        .eq('table_name', tableName)
        .eq('record_id', recordId)
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1)

      if (action) {
        query = query.eq('action', action)
      }

      const { data, error } = await query

      if (error) {
        logger.error('AUDIT_SERVICE', 'Erreur récupération historique audit', error)
        throw error
      }

      logger.debug('AUDIT_SERVICE', `Historique audit récupéré (${data?.length || 0} entrées)`)
      return { data: data || [], error: null }
    } catch (error) {
      logger.error('AUDIT_SERVICE', 'Erreur globale getHistory', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer tous les logs d'audit pour un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} options - Options de pagination et filtres
   * @returns {Promise<{data: Array, error: Error|null}>}
   */
  async getUserActivity(userId, options = {}) {
    try {
      const { limit = 100, offset = 0, tableName = null, action = null, startDate = null, endDate = null } = options

      logger.debug('AUDIT_SERVICE', 'Récupération activité utilisateur', {
        userId,
        options,
      })

      let query = supabase
        .from('audit_log')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1)

      if (tableName) {
        query = query.eq('table_name', tableName)
      }

      if (action) {
        query = query.eq('action', action)
      }

      if (startDate) {
        query = query.gte('timestamp', startDate)
      }

      if (endDate) {
        query = query.lte('timestamp', endDate)
      }

      const { data, error } = await query

      if (error) {
        logger.error('AUDIT_SERVICE', 'Erreur récupération activité utilisateur', error)
        throw error
      }

      logger.debug('AUDIT_SERVICE', `Activité utilisateur récupérée (${data?.length || 0} entrées)`)
      return { data: data || [], error: null }
    } catch (error) {
      logger.error('AUDIT_SERVICE', 'Erreur globale getUserActivity', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer les logs d'audit pour une table spécifique
   * @param {string} tableName - Nom de la table
   * @param {Object} options - Options de pagination et filtres
   * @returns {Promise<{data: Array, error: Error|null}>}
   */
  async getTableHistory(tableName, options = {}) {
    try {
      const { limit = 100, offset = 0, action = null, startDate = null, endDate = null } = options

      logger.debug('AUDIT_SERVICE', 'Récupération historique table', {
        tableName,
        options,
      })

      let query = supabase
        .from('audit_log')
        .select('*')
        .eq('table_name', tableName)
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1)

      if (action) {
        query = query.eq('action', action)
      }

      if (startDate) {
        query = query.gte('timestamp', startDate)
      }

      if (endDate) {
        query = query.lte('timestamp', endDate)
      }

      const { data, error } = await query

      if (error) {
        logger.error('AUDIT_SERVICE', 'Erreur récupération historique table', error)
        throw error
      }

      logger.debug('AUDIT_SERVICE', `Historique table récupéré (${data?.length || 0} entrées)`)
      return { data: data || [], error: null }
    } catch (error) {
      logger.error('AUDIT_SERVICE', 'Erreur globale getTableHistory', error)
      return { data: null, error }
    }
  },

  /**
   * Logger manuellement une action (pour actions spéciales comme EXPORT, VIEW)
   * @param {string} tableName - Nom de la table
   * @param {string} recordId - ID de l'enregistrement
   * @param {string} action - Type d'action (VIEW, EXPORT, etc.)
   * @param {Object} metadata - Métadonnées additionnelles
   * @returns {Promise<{data: Object, error: Error|null}>}
   */
  async logAction(tableName, recordId, action, metadata = {}) {
    try {
      logger.debug('AUDIT_SERVICE', 'Logging action manuelle', {
        tableName,
        recordId,
        action,
        metadata,
      })

      const { data, error } = await supabase
        .from('audit_log')
        .insert([
          {
            table_name: tableName,
            record_id: recordId,
            action: action,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            metadata: metadata,
            timestamp: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) {
        logger.error('AUDIT_SERVICE', 'Erreur logging action manuelle', error)
        throw error
      }

      logger.debug('AUDIT_SERVICE', 'Action loggée avec succès')
      return { data, error: null }
    } catch (error) {
      logger.error('AUDIT_SERVICE', 'Erreur globale logAction', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer les statistiques d'audit (pour dashboard)
   * @param {Object} options - Options de filtres
   * @returns {Promise<{data: Object, error: Error|null}>}
   */
  async getStats(options = {}) {
    try {
      const { startDate = null, endDate = null, userId = null } = options

      logger.debug('AUDIT_SERVICE', 'Récupération statistiques audit', { options })

      let query = supabase.from('audit_log').select('action, table_name, timestamp')

      if (startDate) {
        query = query.gte('timestamp', startDate)
      }

      if (endDate) {
        query = query.lte('timestamp', endDate)
      }

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) {
        logger.error('AUDIT_SERVICE', 'Erreur récupération statistiques audit', error)
        throw error
      }

      // Calculer statistiques
      const stats = {
        total: data?.length || 0,
        byAction: {},
        byTable: {},
        recentActivity: data?.slice(0, 10) || [],
      }

      data?.forEach((log) => {
        // Compter par action
        stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1

        // Compter par table
        stats.byTable[log.table_name] = (stats.byTable[log.table_name] || 0) + 1
      })

      logger.debug('AUDIT_SERVICE', 'Statistiques audit calculées', stats)
      return { data: stats, error: null }
    } catch (error) {
      logger.error('AUDIT_SERVICE', 'Erreur globale getStats', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer tous les logs d'audit avec filtres
   * @param {Object} filters - Filtres (table, action, user_id, date_from, date_to)
   * @returns {Promise<{data: Array, error: Error|null}>}
   */
  async getLogs(filters = {}) {
    try {
      const { table, action, user_id, date_from, date_to } = filters

      logger.debug('AUDIT_SERVICE', 'Récupération logs audit', { filters })

      let query = supabase
        .from('audit_log')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000) // Limiter à 1000 pour l'affichage

      if (table) query = query.eq('table_name', table)
      if (action) query = query.eq('action', action)
      if (user_id) query = query.eq('user_id', user_id)
      if (date_from) query = query.gte('timestamp', date_from)
      if (date_to) query = query.lte('timestamp', date_to)

      const { data, error } = await query

      if (error) {
        logger.error('AUDIT_SERVICE', 'Erreur récupération logs audit', error)
        throw error
      }

      logger.debug('AUDIT_SERVICE', `Logs audit récupérés (${data?.length || 0} entrées)`)
      return { data: data || [], error: null }
    } catch (error) {
      logger.error('AUDIT_SERVICE', 'Erreur globale getLogs', error)
      return { data: null, error }
    }
  },

  /**
   * Exporter l'audit trail (pour conformité ISO 9001)
   * @param {Object} filters - Filtres d'export
   * @returns {Promise<{data: Array, error: Error|null}>}
   */
  async exportAuditTrail(filters = {}) {
    try {
      logger.info('AUDIT_SERVICE', 'Export audit trail demandé', { filters })

      // Logger l'export lui-même
      await this.logAction('audit_log', 'export', 'EXPORT', { filters })

      const { tableName, recordId, userId, startDate, endDate, action } = filters

      let query = supabase.from('audit_log').select('*').order('timestamp', { ascending: false })

      if (tableName) query = query.eq('table_name', tableName)
      if (recordId) query = query.eq('record_id', recordId)
      if (userId) query = query.eq('user_id', userId)
      if (action) query = query.eq('action', action)
      if (startDate) query = query.gte('timestamp', startDate)
      if (endDate) query = query.lte('timestamp', endDate)

      // Limiter à 10000 enregistrements pour l'export
      query = query.limit(10000)

      const { data, error } = await query

      if (error) {
        logger.error('AUDIT_SERVICE', 'Erreur export audit trail', error)
        throw error
      }

      logger.info('AUDIT_SERVICE', `Audit trail exporté (${data?.length || 0} entrées)`)
      return { data: data || [], error: null }
    } catch (error) {
      logger.error('AUDIT_SERVICE', 'Erreur globale exportAuditTrail', error)
      return { data: null, error }
    }
  },
}

