import { BaseRepository } from './BaseRepository'
import { logger } from '@/utils/logger'

/**
 * OrganismeRepository - Repository spécialisé pour les organismes internationaux
 */
export class OrganismeRepository extends BaseRepository {
  constructor() {
    super('organismes_internationaux', {
      enabled: true,
      ttl: 300000, // 5 minutes
      level: 'memory',
    })
    logger.debug('ORGANISME_REPOSITORY', 'OrganismeRepository initialisé')
  }

  /**
   * Récupérer les organismes actifs
   */
  async findActifs(options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        actif: true,
      },
    })
  }

  /**
   * Récupérer les organismes par type
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
   * Rechercher par nom
   */
  async search(searchTerm, options = {}) {
    // TODO: Implémenter recherche ILIKE une fois supporté dans BaseRepository
    return await this.findAll(options)
  }
}

export const organismeRepository = new OrganismeRepository()
export default organismeRepository

