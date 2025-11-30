import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'

/**
 * Service Accompagnements - Gestion des accompagnements (mentoring, coaching)
 */
export const accompagnementsService = {
  /**
   * Récupérer tous les accompagnements
   */
  async getAll(options = {}) {
    logger.debug('ACCOMPAGNEMENTS_SERVICE', 'getAll appelé', { options })
    try {
      let query = supabase
        .from('accompagnements')
        .select('*, mentors:mentor_id(id, user_id, specialite), beneficiaires:beneficiaire_id(*)')

      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      if (options.pagination) {
        const { page = 1, pageSize = 20 } = options.pagination
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1
        query = query.range(from, to)
      }

      const { data, error } = await query.order('date_prevue', { ascending: false })

      if (error) {
        logger.error('ACCOMPAGNEMENTS_SERVICE', 'Erreur getAll', error)
        throw error
      }

      logger.debug('ACCOMPAGNEMENTS_SERVICE', `getAll réussi: ${data?.length || 0} accompagnements`)
      return { data, error: null }
    } catch (error) {
      logger.error('ACCOMPAGNEMENTS_SERVICE', 'Erreur globale getAll', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer un accompagnement par ID
   */
  async getById(id) {
    logger.debug('ACCOMPAGNEMENTS_SERVICE', 'getById appelé', { id })
    try {
      const { data, error } = await supabase
        .from('accompagnements')
        .select('*, mentors:mentor_id(*), beneficiaires:beneficiaire_id(*)')
        .eq('id', id)
        .single()

      if (error) {
        logger.error('ACCOMPAGNEMENTS_SERVICE', 'Erreur getById', { id, error })
        throw error
      }

      logger.debug('ACCOMPAGNEMENTS_SERVICE', 'getById réussi', { id })
      return { data, error: null }
    } catch (error) {
      logger.error('ACCOMPAGNEMENTS_SERVICE', 'Erreur globale getById', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Créer un accompagnement
   */
  async create(accompagnementData) {
    logger.debug('ACCOMPAGNEMENTS_SERVICE', 'create appelé', accompagnementData)
    try {
      const { data, error } = await supabase
        .from('accompagnements')
        .insert(accompagnementData)
        .select()
        .single()

      if (error) {
        logger.error('ACCOMPAGNEMENTS_SERVICE', 'Erreur create', error)
        throw error
      }

      logger.info('ACCOMPAGNEMENTS_SERVICE', 'Accompagnement créé avec succès', { id: data.id })
      return { data, error: null }
    } catch (error) {
      logger.error('ACCOMPAGNEMENTS_SERVICE', 'Erreur globale create', error)
      return { data: null, error }
    }
  },

  /**
   * Mettre à jour un accompagnement
   */
  async update(id, accompagnementData) {
    logger.debug('ACCOMPAGNEMENTS_SERVICE', 'update appelé', { id, accompagnementData })
    try {
      const { data, error } = await supabase
        .from('accompagnements')
        .update(accompagnementData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logger.error('ACCOMPAGNEMENTS_SERVICE', 'Erreur update', { id, error })
        throw error
      }

      logger.info('ACCOMPAGNEMENTS_SERVICE', 'Accompagnement mis à jour avec succès', { id })
      return { data, error: null }
    } catch (error) {
      logger.error('ACCOMPAGNEMENTS_SERVICE', 'Erreur globale update', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Récupérer les accompagnements d'un bénéficiaire
   */
  async getByBeneficiaire(beneficiaireId) {
    return await this.getAll({
      filters: { beneficiaire_id: beneficiaireId },
    })
  },

  /**
   * Récupérer les accompagnements d'un mentor
   */
  async getByMentor(mentorId) {
    return await this.getAll({
      filters: { mentor_id: mentorId },
    })
  },
}

