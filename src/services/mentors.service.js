import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'

/**
 * Service Mentors - Gestion des mentors
 */
export const mentorsService = {
  /**
   * Récupérer tous les mentors
   */
  async getAll(options = {}) {
    logger.debug('MENTORS_SERVICE', 'getAll appelé', { options })
    try {
      let query = supabase
        .from('mentors')
        .select('*, users:user_id(id, nom, prenom, email, telephone, role)')

      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        logger.error('MENTORS_SERVICE', 'Erreur getAll', error)
        throw error
      }

      logger.debug('MENTORS_SERVICE', `getAll réussi: ${data?.length || 0} mentors`)
      return { data, error: null }
    } catch (error) {
      logger.error('MENTORS_SERVICE', 'Erreur globale getAll', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer un mentor par ID
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('mentors')
        .select('*, users:user_id(id, nom, prenom, email, telephone, role)')
        .eq('id', id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      logger.error('MENTORS_SERVICE', 'Erreur getById', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Récupérer un mentor par user_id
   */
  async getByUserId(userId) {
    try {
      const { data, error } = await supabase
        .from('mentors')
        .select('*, users:user_id(*)')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      logger.error('MENTORS_SERVICE', 'Erreur getByUserId', { userId, error })
      return { data: null, error }
    }
  },

  /**
   * Récupérer les accompagnements d'un mentor
   */
  async getAccompagnements(mentorId) {
    try {
      const { data, error } = await supabase
        .from('accompagnements')
        .select('*, beneficiaires:beneficiaire_id(*)')
        .eq('mentor_id', mentorId)
        .order('date_prevue', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      logger.error('MENTORS_SERVICE', 'Erreur getAccompagnements', { mentorId, error })
      return { data: null, error }
    }
  },

  /**
   * Récupérer les bénéficiaires assignés à un mentor
   */
  async getBeneficiaires(mentorId) {
    try {
      const { data, error } = await supabase
        .from('beneficiaires')
        .select('*')
        .eq('mentor_id', mentorId)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      logger.error('MENTORS_SERVICE', 'Erreur getBeneficiaires', { mentorId, error })
      return { data: null, error }
    }
  },
}

