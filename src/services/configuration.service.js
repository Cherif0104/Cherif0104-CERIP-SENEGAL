import { configurationRepository } from '@/data/repositories'
import { logger } from '@/utils/logger'

/**
 * Service Configuration - Gestion de la configuration système
 */
export const configurationService = {
  /**
   * Récupérer toutes les configurations
   */
  async getAll() {
    return await configurationRepository.findAll()
  },

  /**
   * Récupérer toutes les configurations comme objet
   */
  async getAllAsObject() {
    return await configurationRepository.getAllAsObject()
  },

  /**
   * Récupérer une configuration par clé
   */
  async getByCle(cle) {
    return await configurationRepository.findByCle(cle)
  },

  /**
   * Récupérer les configurations par catégorie
   */
  async getByCategorie(categorie) {
    return await configurationRepository.findByCategorie(categorie)
  },

  /**
   * Sauvegarder une configuration
   */
  async save(cle, valeur, type = 'string', categorie = 'general', description = null) {
    logger.debug('CONFIGURATION_SERVICE', 'save appelé', { cle, valeur, type, categorie })
    return await configurationRepository.upsert(cle, valeur, type, categorie, description)
  },

  /**
   * Sauvegarder plusieurs configurations
   */
  async saveBatch(configs) {
    logger.debug('CONFIGURATION_SERVICE', 'saveBatch appelé', { count: configs.length })
    
    const results = []
    for (const config of configs) {
      const result = await this.save(
        config.cle,
        config.valeur,
        config.type,
        config.categorie,
        config.description
      )
      results.push(result)
    }

    return {
      data: results.filter((r) => !r.error).map((r) => r.data),
      errors: results.filter((r) => r.error),
    }
  },

  /**
   * Récupérer la valeur d'une configuration avec valeur par défaut
   */
  async getValue(cle, defaultValue = null) {
    const { data, error } = await this.getByCle(cle)
    if (error || !data) return defaultValue

    try {
      return JSON.parse(data.valeur)
    } catch {
      return data.valeur || defaultValue
    }
  },
}

