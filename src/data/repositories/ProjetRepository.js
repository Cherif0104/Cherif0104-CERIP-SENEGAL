import { BaseRepository } from './BaseRepository'
import { logger } from '@/utils/logger'
import { supabase } from '@/lib/supabase'

/**
 * ProjetRepository - Repository spécialisé pour les projets
 * Hérite de BaseRepository avec méthodes spécifiques
 */
export class ProjetRepository extends BaseRepository {
  constructor() {
    super('projets', {
      enabled: true,
      ttl: 300000, // 5 minutes
      level: 'memory',
    })
  }

  /**
   * Récupérer les projets d'un programme
   * @param {string} programmeId - ID du programme
   * @param {Object} options - Options de pagination et filtres
   */
  async findByProgramme(programmeId, options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        programme_id: programmeId,
      },
    })
  }

  /**
   * Récupérer les projets par statut
   * @param {string} statut - Statut du projet
   * @param {Object} options - Options
   */
  async findByStatut(statut, options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        statut,
      },
    })
  }

  /**
   * Récupérer les projets en cours
   */
  async findEnCours(options = {}) {
    return await this.findByStatut('EN_COURS', options)
  }

  /**
   * Récupérer les projets avec leurs relations (programme)
   * @param {string} id - ID du projet
   */
  async findByIdWithRelations(id) {
    try {
      logger.debug('PROJET_REPOSITORY', 'Récupération projet avec relations', { id })

      // Spécifier explicitement la contrainte pour éviter l'ambiguïté
      // Il y a deux contraintes FK : projets_programme_fk et projets_programme_id_fkey
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*, programmes!projets_programme_id_fkey(*)')
        .eq('id', id)
        .single()

      if (error) {
        logger.error('PROJET_REPOSITORY', 'Erreur findByIdWithRelations', { id, error })
        throw error
      }

      return { data, error: null }
    } catch (error) {
      logger.error('PROJET_REPOSITORY', 'Erreur globale findByIdWithRelations', { id, error })
      return { data: null, error }
    }
  }

  /**
   * Rechercher les projets (par nom, description)
   */
  async search(searchTerm, options = {}) {
    try {
      const { pagination = { page: 1, pageSize: 50 } } = options

      logger.debug('PROJET_REPOSITORY', 'Recherche projets', { searchTerm, options })

      // Spécifier explicitement la contrainte pour éviter l'ambiguïté
      let query = supabase
        .from(this.tableName)
        .select('*, programmes!projets_programme_id_fkey(*)')
        .or(`nom.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)

      // Pagination
      const from = (pagination.page - 1) * pagination.pageSize
      const to = from + pagination.pageSize - 1
      query = query.range(from, to)

      const { data, error } = await query

      if (error) {
        logger.error('PROJET_REPOSITORY', 'Erreur search', { searchTerm, error })
        throw error
      }

      return { data: data || [], error: null }
    } catch (error) {
      logger.error('PROJET_REPOSITORY', 'Erreur globale search', { searchTerm, error })
      return { data: null, error }
    }
  }
}

// Instance singleton
export const projetRepository = new ProjetRepository()
export default projetRepository

