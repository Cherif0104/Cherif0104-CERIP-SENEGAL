import { BaseRepository } from './BaseRepository'
import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'

/**
 * ProgrammeRepository - Repository spécialisé pour les programmes
 * Hérite de BaseRepository avec méthodes spécifiques
 */
export class ProgrammeRepository extends BaseRepository {
  constructor() {
    super('programmes', {
      enabled: true,
      ttl: 300000, // 5 minutes
      level: 'memory',
    })
  }

  /**
   * Récupérer les programmes actifs
   */
  async findActifs(options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        statut: ['ACTIF', 'EN_COURS', 'OUVERT'],
      },
    })
  }

  /**
   * Récupérer les programmes par type
   */
  async findByType(type, options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        type,
      },
    })
  }

  /**
   * Récupérer les programmes par statut
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
   * Rechercher les programmes (par nom, description)
   */
  async search(searchTerm, options = {}) {
    try {
      const { pagination = { page: 1, pageSize: 50 } } = options

      // Supabase ne supporte pas la recherche full-text native, on fait une requête simple
      // Pour une vraie recherche, il faudrait utiliser PostgreSQL full-text search
      let query = supabase
        .from(this.tableName)
        .select('*')
        .or(`nom.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)

      // Pagination
      const from = (pagination.page - 1) * pagination.pageSize
      const to = from + pagination.pageSize - 1
      query = query.range(from, to)

      const { data, error } = await query

      if (error) {
        logger.error('PROGRAMME_REPOSITORY', 'Erreur search', { searchTerm, error })
        throw error
      }

      return { data: data || [], error: null }
    } catch (error) {
      logger.error('PROGRAMME_REPOSITORY', 'Erreur globale search', { searchTerm, error })
      return { data: null, error }
    }
  }
}

// Instance singleton
export const programmeRepository = new ProgrammeRepository()
export default programmeRepository

