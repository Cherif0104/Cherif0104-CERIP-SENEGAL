import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'

/**
 * Service Formateurs - Gestion des formateurs
 */
export const formateursService = {
  /**
   * Récupérer tous les formateurs
   */
  async getAll(options = {}) {
    logger.debug('FORMATEURS_SERVICE', 'getAll appelé', { options })
    try {
      // Les formateurs sont dans la table users avec role='FORMATEUR'
      // ou dans une table formateurs si elle existe
      let query = supabase
        .from('users')
        .select('*')
        .eq('role', 'FORMATEUR')

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        logger.error('FORMATEURS_SERVICE', 'Erreur getAll', error)
        throw error
      }

      logger.debug('FORMATEURS_SERVICE', `getAll réussi: ${data?.length || 0} formateurs`)
      return { data, error: null }
    } catch (error) {
      logger.error('FORMATEURS_SERVICE', 'Erreur globale getAll', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer un formateur par ID
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .eq('role', 'FORMATEUR')
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      logger.error('FORMATEURS_SERVICE', 'Erreur getById', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Récupérer les formations d'un formateur
   */
  async getFormations(formateurId) {
    try {
      const { data, error } = await supabase
        .from('formations')
        .select('*, sessions_formations(*)')
        .eq('formateur_id', formateurId)
        .order('date_debut', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      logger.error('FORMATEURS_SERVICE', 'Erreur getFormations', { formateurId, error })
      return { data: null, error }
    }
  },
}

