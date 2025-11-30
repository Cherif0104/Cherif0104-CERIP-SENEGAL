import { BaseRepository } from './BaseRepository'
import { logger } from '@/utils/logger'

/**
 * StructureRepository - Repository spécialisé pour les structures
 */
export class StructureRepository extends BaseRepository {
  constructor() {
    super('structures', {
      enabled: true,
      ttl: 300000, // 5 minutes
      level: 'memory',
    })
    logger.debug('STRUCTURE_REPOSITORY', 'StructureRepository initialisé')
  }

  /**
   * Récupérer les structures actives
   */
  async findActives(options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        actif: true,
      },
    })
  }

  /**
   * Récupérer les structures par type
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
   * Récupérer les structures par secteur
   */
  async findBySecteur(secteur, options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        secteur,
      },
    })
  }

  /**
   * Rechercher par nom
   */
  async search(searchTerm, options = {}) {
    return await this.findAll(options)
  }
}

export const structureRepository = new StructureRepository()
export default structureRepository

