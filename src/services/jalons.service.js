import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'

/**
 * Service Jalons - Gestion des jalons de programmes
 */
export const jalonsService = {
  /**
   * Récupérer un jalon par ID
   */
  async getById(id) {
    try {
      logger.debug('JALONS_SERVICE', 'getById appelé', { id })
      const { data, error } = await supabase
        .from('programme_jalons')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        logger.error('JALONS_SERVICE', 'Erreur getById', { id, error })
        throw error
      }

      return { data: data || null, error: null }
    } catch (error) {
      logger.error('JALONS_SERVICE', 'Erreur globale getById', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Récupérer tous les jalons d'un programme
   */
  async getByProgramme(programmeId) {
    try {
      logger.debug('JALONS_SERVICE', 'getByProgramme appelé', { programmeId })
      const { data, error } = await supabase
        .from('programme_jalons')
        .select('*')
        .eq('programme_id', programmeId)
        .order('ordre', { ascending: true })

      if (error) {
        logger.error('JALONS_SERVICE', 'Erreur getByProgramme', { programmeId, error })
        throw error
      }

      return { data: data || [], error: null }
    } catch (error) {
      logger.error('JALONS_SERVICE', 'Erreur globale getByProgramme', { programmeId, error })
      return { data: null, error }
    }
  },

  /**
   * Créer un jalon
   */
  async create(jalonData) {
    try {
      logger.debug('JALONS_SERVICE', 'create appelé', { data: jalonData })
      const { data, error } = await supabase
        .from('programme_jalons')
        .insert(jalonData)
        .select()
        .single()

      if (error) {
        logger.error('JALONS_SERVICE', 'Erreur create', error)
        throw error
      }

      logger.info('JALONS_SERVICE', 'Jalon créé avec succès', { id: data?.id })
      return { data, error: null }
    } catch (error) {
      logger.error('JALONS_SERVICE', 'Erreur globale create', error)
      return { data: null, error }
    }
  },

  /**
   * Mettre à jour un jalon
   */
  async update(id, jalonData) {
    try {
      logger.debug('JALONS_SERVICE', 'update appelé', { id, data: jalonData })
      const { data, error } = await supabase
        .from('programme_jalons')
        .update(jalonData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logger.error('JALONS_SERVICE', 'Erreur update', { id, error })
        throw error
      }

      logger.info('JALONS_SERVICE', 'Jalon mis à jour avec succès', { id })
      return { data, error: null }
    } catch (error) {
      logger.error('JALONS_SERVICE', 'Erreur globale update', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Supprimer un jalon
   */
  async delete(id) {
    try {
      logger.debug('JALONS_SERVICE', 'delete appelé', { id })
      const { error } = await supabase
        .from('programme_jalons')
        .delete()
        .eq('id', id)

      if (error) {
        logger.error('JALONS_SERVICE', 'Erreur delete', { id, error })
        throw error
      }

      logger.info('JALONS_SERVICE', 'Jalon supprimé avec succès', { id })
      return { data: { message: 'Jalon supprimé avec succès' }, error: null }
    } catch (error) {
      logger.error('JALONS_SERVICE', 'Erreur globale delete', { id, error })
      return { data: null, error }
    }
  },
}

