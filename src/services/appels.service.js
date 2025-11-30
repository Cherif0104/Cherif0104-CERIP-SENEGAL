import { appelCandidatureRepository } from '@/data/repositories/AppelCandidatureRepository'
import { EntityValidator } from '@/business/validators/EntityValidator'
import { logger } from '@/utils/logger'

/**
 * Service Appels - Gère les appels à candidatures
 * Utilise AppelCandidatureRepository
 */
export const appelsService = {
  /**
   * Récupérer tous les appels avec pagination
   * @param {string} projetId - Filtrer par projet (optionnel)
   * @param {Object} options - Options de pagination et filtres
   */
  async getAll(projetId = null, options = {}) {
    try {
      logger.debug('APPELS_SERVICE', 'getAll appelé', { projetId, options })

      if (projetId) {
        const result = await appelCandidatureRepository.findByProjet(projetId, options)
        if (result.error) throw result.error
        return result
      }

      const result = await appelCandidatureRepository.findAll(options)
      if (result.error) throw result.error

      logger.debug('APPELS_SERVICE', `getAll réussi: ${result.data?.length || 0} appels`)
      return result
    } catch (error) {
      logger.error('APPELS_SERVICE', 'Erreur getAll', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer un appel par ID
   */
  async getById(id) {
    try {
      logger.debug('APPELS_SERVICE', 'getById appelé', { id })

      // Utiliser findByIdWithRelations pour avoir le projet
      const result = await appelCandidatureRepository.findByIdWithRelations(id)

      if (result.error) {
        logger.error('APPELS_SERVICE', 'Erreur getById', { id, error: result.error })
        throw result.error
      }

      logger.debug('APPELS_SERVICE', 'getById réussi', { id })
      return result
    } catch (error) {
      logger.error('APPELS_SERVICE', 'Erreur globale getById', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Créer un appel avec validation
   */
  async create(appelData) {
    try {
      logger.debug('APPELS_SERVICE', 'create appelé', { data: appelData })

      // Validation
      const validation = EntityValidator.validate('appel_candidature', appelData, 'CREATE')
      if (!validation.valid) {
        logger.warn('APPELS_SERVICE', 'Validation échouée lors de create', {
          errors: validation.errors,
        })
        return {
          data: null,
          error: {
            message: 'Validation échouée',
            errors: validation.errors,
          },
        }
      }

      const result = await appelCandidatureRepository.create(appelData)

      if (result.error) {
        logger.error('APPELS_SERVICE', 'Erreur create', result.error)
        throw result.error
      }

      logger.info('APPELS_SERVICE', 'Appel créé avec succès', { id: result.data?.id })
      return result
    } catch (error) {
      logger.error('APPELS_SERVICE', 'Erreur globale create', error)
      return { data: null, error }
    }
  },

  /**
   * Mettre à jour un appel avec validation
   */
  async update(id, appelData) {
    try {
      logger.debug('APPELS_SERVICE', 'update appelé', { id, data: appelData })

      // Récupérer l'ancien appel pour validation transitions
      const { data: oldAppel } = await appelCandidatureRepository.findById(id)
      const context = oldAppel ? { oldStatut: oldAppel.statut } : {}

      // Validation
      const validation = EntityValidator.validate('appel_candidature', appelData, 'UPDATE', context)
      if (!validation.valid) {
        logger.warn('APPELS_SERVICE', 'Validation échouée lors de update', {
          id,
          errors: validation.errors,
        })
        return {
          data: null,
          error: {
            message: 'Validation échouée',
            errors: validation.errors,
          },
        }
      }

      const result = await appelCandidatureRepository.update(id, appelData)

      if (result.error) {
        logger.error('APPELS_SERVICE', 'Erreur update', { id, error: result.error })
        throw result.error
      }

      logger.info('APPELS_SERVICE', 'Appel mis à jour avec succès', { id })
      return result
    } catch (error) {
      logger.error('APPELS_SERVICE', 'Erreur globale update', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Supprimer un appel
   */
  async delete(id) {
    try {
      logger.debug('APPELS_SERVICE', 'delete appelé', { id })
      const result = await appelCandidatureRepository.delete(id)

      if (result.error) {
        logger.error('APPELS_SERVICE', 'Erreur delete', { id, error: result.error })
        throw result.error
      }

      logger.info('APPELS_SERVICE', 'Appel supprimé avec succès', { id })
      return result
    } catch (error) {
      logger.error('APPELS_SERVICE', 'Erreur globale delete', { id, error })
      return { error }
    }
  },

  /**
   * Récupérer les appels d'un projet
   */
  async getByProjet(projetId, options = {}) {
    try {
      logger.debug('APPELS_SERVICE', 'getByProjet appelé', { projetId, options })
      const result = await appelCandidatureRepository.findByProjet(projetId, options)

      if (result.error) {
        logger.error('APPELS_SERVICE', 'Erreur getByProjet', { projetId, error: result.error })
        throw result.error
      }

      return result
    } catch (error) {
      logger.error('APPELS_SERVICE', 'Erreur globale getByProjet', { projetId, error })
      return { data: null, error }
    }
  },

  /**
   * Récupérer les appels ouverts
   */
  async getOuverts(options = {}) {
    try {
      logger.debug('APPELS_SERVICE', 'getOuverts appelé', { options })
      const result = await appelCandidatureRepository.findOuverts(options)

      if (result.error) {
        logger.error('APPELS_SERVICE', 'Erreur getOuverts', result.error)
        throw result.error
      }

      return result
    } catch (error) {
      logger.error('APPELS_SERVICE', 'Erreur globale getOuverts', error)
      return { data: null, error }
    }
  },

  /**
   * Vérifier si un appel est ouvert
   */
  async isOuvert(id) {
    try {
      logger.debug('APPELS_SERVICE', 'isOuvert appelé', { id })
      const result = await appelCandidatureRepository.isOuvert(id)

      if (result.error) {
        logger.error('APPELS_SERVICE', 'Erreur isOuvert', { id, error: result.error })
        throw result.error
      }

      return result
    } catch (error) {
      logger.error('APPELS_SERVICE', 'Erreur globale isOuvert', { id, error })
      return { isOuvert: false, error }
    }
  },
}

