import { posteRepository } from '@/data/repositories'
import { logger } from '@/utils/logger'

/**
 * Service Postes - Gestion des postes
 */
export const postesService = {
  /**
   * Récupérer tous les postes
   */
  async getAll(options = {}) {
    return await posteRepository.findAll(options)
  },

  /**
   * Récupérer un poste par ID
   */
  async getById(id) {
    return await posteRepository.findById(id)
  },

  /**
   * Récupérer un poste avec le nombre d'employés
   */
  async getByIdWithCount(id) {
    return await posteRepository.findByIdWithCount(id)
  },

  /**
   * Créer un poste
   */
  async create(posteData) {
    logger.debug('POSTES_SERVICE', 'create appelé', posteData)
    return await posteRepository.create(posteData)
  },

  /**
   * Mettre à jour un poste
   */
  async update(id, posteData) {
    logger.debug('POSTES_SERVICE', 'update appelé', { id, posteData })
    return await posteRepository.update(id, posteData)
  },

  /**
   * Récupérer les postes ouverts
   */
  async getOuverts(options = {}) {
    return await posteRepository.findOuverts(options)
  },

  /**
   * Récupérer les postes par département
   */
  async getByDepartement(departement) {
    return await posteRepository.findByDepartement(departement)
  },
}

