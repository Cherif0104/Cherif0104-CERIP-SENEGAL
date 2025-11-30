import { BaseRepository } from './BaseRepository'
import { logger } from '@/utils/logger'
import { supabase } from '@/lib/supabase'

/**
 * AppelCandidatureRepository - Repository spécialisé pour les appels à candidatures
 */
export class AppelCandidatureRepository extends BaseRepository {
  constructor() {
    super('appels_candidatures', {
      enabled: true,
      ttl: 300000, // 5 minutes
      level: 'memory',
    })
  }

  /**
   * Récupérer les appels d'un projet
   * @param {string} projetId - ID du projet
   * @param {Object} options - Options
   */
  async findByProjet(projetId, options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        projet_id: projetId,
      },
    })
  }

  /**
   * Récupérer les appels ouverts
   */
  async findOuverts(options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        statut: 'OUVERT',
      },
    })
  }

  /**
   * Récupérer un appel avec ses relations (projet)
   * @param {string} id - ID de l'appel
   */
  async findByIdWithRelations(id) {
    try {
      logger.debug('APPEL_REPOSITORY', 'Récupération appel avec relations', { id })

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*, projets(*)')
        .eq('id', id)
        .single()

      if (error) {
        logger.error('APPEL_REPOSITORY', 'Erreur findByIdWithRelations', { id, error })
        throw error
      }

      return { data, error: null }
    } catch (error) {
      logger.error('APPEL_REPOSITORY', 'Erreur globale findByIdWithRelations', { id, error })
      return { data: null, error }
    }
  }

  /**
   * Vérifier si un appel est ouvert
   * @param {string} id - ID de l'appel
   */
  async isOuvert(id) {
    try {
      const { data, error } = await this.findById(id)
      if (error) return { isOuvert: false, error }
      return {
        isOuvert: data?.statut === 'OUVERT',
        data,
        error: null,
      }
    } catch (error) {
      logger.error('APPEL_REPOSITORY', 'Erreur isOuvert', { id, error })
      return { isOuvert: false, error }
    }
  }
}

// Instance singleton
export const appelCandidatureRepository = new AppelCandidatureRepository()
export default appelCandidatureRepository

