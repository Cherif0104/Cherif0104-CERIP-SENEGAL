import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'

/**
 * Service Coaches - Gestion des coaches
 */
export const coachesService = {
  /**
   * Récupérer tous les coaches
   */
  async getAll(options = {}) {
    logger.debug('COACHES_SERVICE', 'getAll appelé', { options })
    try {
      let query = supabase
        .from('users')
        .select('*')
        .eq('role', 'COACH')

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        logger.error('COACHES_SERVICE', 'Erreur getAll', error)
        throw error
      }

      logger.debug('COACHES_SERVICE', `getAll réussi: ${data?.length || 0} coaches`)
      return { data, error: null }
    } catch (error) {
      logger.error('COACHES_SERVICE', 'Erreur globale getAll', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer un coach par ID
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .eq('role', 'COACH')
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      logger.error('COACHES_SERVICE', 'Erreur getById', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Récupérer les bénéficiaires assignés à un coach
   */
  async getBeneficiaires(coachId) {
    try {
      const { data, error } = await supabase
        .from('beneficiaires')
        .select('*')
        .eq('coach_id', coachId)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      logger.error('COACHES_SERVICE', 'Erreur getBeneficiaires', { coachId, error })
      return { data: null, error }
    }
  },
}

