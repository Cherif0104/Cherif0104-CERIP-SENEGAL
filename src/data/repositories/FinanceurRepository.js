import { BaseRepository } from './BaseRepository'
import { logger } from '@/utils/logger'

/**
 * FinanceurRepository - Repository spécialisé pour les financeurs
 */
export class FinanceurRepository extends BaseRepository {
  constructor() {
    super('financeurs', {
      enabled: true,
      ttl: 300000, // 5 minutes
      level: 'memory',
    })
    logger.debug('FINANCEUR_REPOSITORY', 'FinanceurRepository initialisé')
  }

  /**
   * Récupérer les financeurs actifs
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
   * Récupérer les financeurs par type
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
    return await this.findAll(options)
  }
}

export const financeurRepository = new FinanceurRepository()
export default financeurRepository

