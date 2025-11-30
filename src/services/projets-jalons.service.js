import { supabase } from '@/lib/supabase'
import { projetsService } from './projets.service'
import { logger } from '@/utils/logger'

/**
 * Service Jalons Projets - Gestion des jalons pour projets
 * Utilise programme_jalons via le programme du projet
 */
export const projetsJalonsService = {
  /**
   * Récupérer tous les jalons d'un projet (via son programme)
   */
  async getByProjet(projetId) {
    try {
      logger.debug('PROJETS_JALONS_SERVICE', 'getByProjet appelé', { projetId })
      
      // Récupérer le projet pour obtenir son programme_id
      const { data: projet, error: projetError } = await projetsService.getById(projetId)
      if (projetError || !projet) {
        logger.error('PROJETS_JALONS_SERVICE', 'Erreur récupération projet', projetError)
        return { data: [], error: projetError }
      }

      if (!projet.programme_id) {
        logger.warn('PROJETS_JALONS_SERVICE', 'Projet sans programme_id', { projetId })
        return { data: [], error: null }
      }

      // Récupérer les jalons du programme
      const { data, error } = await supabase
        .from('programme_jalons')
        .select('*')
        .eq('programme_id', projet.programme_id)
        .order('ordre', { ascending: true })

      if (error) {
        logger.error('PROJETS_JALONS_SERVICE', 'Erreur getByProjet', { projetId, error })
        throw error
      }

      return { data: data || [], error: null }
    } catch (error) {
      logger.error('PROJETS_JALONS_SERVICE', 'Erreur globale getByProjet', { projetId, error })
      return { data: null, error }
    }
  },

  /**
   * Créer un jalon pour un projet (via son programme)
   */
  async create(projetId, jalonData) {
    try {
      logger.debug('PROJETS_JALONS_SERVICE', 'create appelé', { projetId, data: jalonData })
      
      // Récupérer le projet pour obtenir son programme_id
      const { data: projet } = await projetsService.getById(projetId)
      if (!projet || !projet.programme_id) {
        throw new Error('Projet non trouvé ou sans programme associé')
      }

      const jalonDataWithProgramme = {
        ...jalonData,
        programme_id: projet.programme_id,
      }

      const { data, error } = await supabase
        .from('programme_jalons')
        .insert(jalonDataWithProgramme)
        .select()
        .single()

      if (error) {
        logger.error('PROJETS_JALONS_SERVICE', 'Erreur create', error)
        throw error
      }

      logger.info('PROJETS_JALONS_SERVICE', 'Jalon créé avec succès', { id: data?.id })
      return { data, error: null }
    } catch (error) {
      logger.error('PROJETS_JALONS_SERVICE', 'Erreur globale create', error)
      return { data: null, error }
    }
  },

  /**
   * Mettre à jour un jalon
   */
  async update(id, jalonData) {
    try {
      logger.debug('PROJETS_JALONS_SERVICE', 'update appelé', { id, data: jalonData })
      const { data, error } = await supabase
        .from('programme_jalons')
        .update(jalonData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logger.error('PROJETS_JALONS_SERVICE', 'Erreur update', { id, error })
        throw error
      }

      logger.info('PROJETS_JALONS_SERVICE', 'Jalon mis à jour avec succès', { id })
      return { data, error: null }
    } catch (error) {
      logger.error('PROJETS_JALONS_SERVICE', 'Erreur globale update', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Supprimer un jalon
   */
  async delete(id) {
    try {
      logger.debug('PROJETS_JALONS_SERVICE', 'delete appelé', { id })
      const { error } = await supabase
        .from('programme_jalons')
        .delete()
        .eq('id', id)

      if (error) {
        logger.error('PROJETS_JALONS_SERVICE', 'Erreur delete', { id, error })
        throw error
      }

      logger.info('PROJETS_JALONS_SERVICE', 'Jalon supprimé avec succès', { id })
      return { data: { message: 'Jalon supprimé avec succès' }, error: null }
    } catch (error) {
      logger.error('PROJETS_JALONS_SERVICE', 'Erreur globale delete', { id, error })
      return { data: null, error }
    }
  },
}

