import { competenceRepository } from '@/data/repositories'
import { logger } from '@/utils/logger'

/**
 * Service Competences - Gestion des compétences
 */
export const competencesService = {
  /**
   * Récupérer toutes les compétences
   */
  async getAll(options = {}) {
    return await competenceRepository.findAll(options)
  },

  /**
   * Récupérer une compétence par ID
   */
  async getById(id) {
    return await competenceRepository.findById(id)
  },

  /**
   * Créer une compétence
   */
  async create(competenceData) {
    logger.debug('COMPETENCES_SERVICE', 'create appelé', competenceData)
    return await competenceRepository.create(competenceData)
  },

  /**
   * Mettre à jour une compétence
   */
  async update(id, competenceData) {
    logger.debug('COMPETENCES_SERVICE', 'update appelé', { id, competenceData })
    return await competenceRepository.update(id, competenceData)
  },

  /**
   * Récupérer les compétences par catégorie
   */
  async getByCategorie(categorie) {
    return await competenceRepository.findByCategorie(categorie)
  },

  /**
   * Récupérer les compétences d'un employé
   */
  async getByEmploye(employeId) {
    return await competenceRepository.findByEmploye(employeId)
  },

  /**
   * Ajouter une compétence à un employé
   */
  async addToEmploye(employeId, competenceId, niveau, notes = null, evaluePar = null) {
    return await competenceRepository.addToEmploye(employeId, competenceId, niveau, notes, evaluePar)
  },

  /**
   * Mettre à jour le niveau d'une compétence d'un employé
   */
  async updateEmployeCompetence(id, niveau, notes = null) {
    return await competenceRepository.updateEmployeCompetence(id, niveau, notes)
  },
}

