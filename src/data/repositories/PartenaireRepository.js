import { BaseRepository } from './BaseRepository'
import { logger } from '@/utils/logger'

/**
 * PartenaireRepository - Repository spécialisé pour les partenaires
 */
export class PartenaireRepository extends BaseRepository {
  constructor() {
    super('partenaires', {
      enabled: true,
      ttl: 300000, // 5 minutes
      level: 'memory',
    })
    logger.debug('PARTENAIRE_REPOSITORY', 'PartenaireRepository initialisé')
  }

  /**
   * Récupérer les partenaires actifs
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
   * Récupérer les partenaires par type
   */
  async findByType(typePartenariat, options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        type_partenariat: typePartenariat,
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

export const partenaireRepository = new PartenaireRepository()
export default partenaireRepository

