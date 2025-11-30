import { employeRepository } from '@/data/repositories'
import { logger } from '@/utils/logger'

/**
 * Service Employes - Gestion des employés
 */
export const employesService = {
  /**
   * Récupérer tous les employés
   */
  async getAll(options = {}) {
    return await employeRepository.findAll(options)
  },

  /**
   * Récupérer un employé par ID
   */
  async getById(id) {
    return await employeRepository.findById(id)
  },

  /**
   * Récupérer un employé avec toutes ses relations
   */
  async getByIdWithRelations(id) {
    return await employeRepository.findByIdWithRelations(id)
  },

  /**
   * Créer un employé
   */
  async create(employeData) {
    logger.debug('EMPLOYES_SERVICE', 'create appelé', employeData)
    return await employeRepository.create(employeData)
  },

  /**
   * Mettre à jour un employé
   */
  async update(id, employeData) {
    logger.debug('EMPLOYES_SERVICE', 'update appelé', { id, employeData })
    return await employeRepository.update(id, employeData)
  },

  /**
   * Récupérer les employés actifs
   */
  async getActifs(options = {}) {
    return await employeRepository.findActifs(options)
  },

  /**
   * Récupérer les employés par poste
   */
  async getByPoste(posteId) {
    return await employeRepository.findByPoste(posteId)
  },

  /**
   * Récupérer les employés par manager
   */
  async getByManager(managerId) {
    return await employeRepository.findByManager(managerId)
  },

  /**
   * Récupérer les employés par type (PROFESSEUR, FORMATEUR, etc.)
   */
  async getByType(type) {
    return await employeRepository.findByType(type)
  },

  /**
   * Récupérer les employés par type de contrat
   */
  async getByTypeContrat(typeContrat) {
    return await employeRepository.findByTypeContrat(typeContrat)
  },

  /**
   * Récupérer les prestataires
   */
  async getPrestataires() {
    return await employeRepository.findPrestataires()
  },

  /**
   * Récupérer les employés liés à un projet
   */
  async getByProjet(projetId) {
    return await employeRepository.findByProjet(projetId)
  },

  /**
   * Récupérer les employés liés à un programme
   */
  async getByProgramme(programmeId) {
    return await employeRepository.findByProgramme(programmeId)
  },
}

