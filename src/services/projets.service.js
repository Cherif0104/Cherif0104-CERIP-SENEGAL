import { projetRepository } from '@/data/repositories/ProjetRepository'
import { EntityValidator } from '@/business/validators/EntityValidator'
import { logger } from '@/utils/logger'

/**
 * Service Projets - Refactorisé pour utiliser Repository pattern
 */
export const projetsService = {
  /**
   * Récupérer tous les projets avec pagination
   */
  async getAll(programmeId = null, options = {}) {
    try {
      logger.debug('PROJETS_SERVICE', 'getAll appelé', { programmeId, options })

      if (programmeId) {
        const result = await projetRepository.findByProgramme(programmeId, options)
        if (result.error) throw result.error
        return result
      }

      const result = await projetRepository.findAll(options)
      if (result.error) throw result.error
      return result
    } catch (error) {
      logger.error('PROJETS_SERVICE', 'Erreur getAll', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer un projet par ID
   */
  async getById(id) {
    try {
      logger.debug('PROJETS_SERVICE', 'getById appelé', { id })
      
      // Utiliser findByIdWithRelations pour avoir le programme
      const result = await projetRepository.findByIdWithRelations(id)

      if (result.error) {
        logger.error('PROJETS_SERVICE', 'Erreur getById', { id, error: result.error })
        throw result.error
      }

      return result
    } catch (error) {
      logger.error('PROJETS_SERVICE', 'Erreur globale getById', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Créer un projet avec validation
   */
  async create(projetData) {
    try {
      logger.debug('PROJETS_SERVICE', 'create appelé', { data: projetData })

      // Validation
      const validation = EntityValidator.validate('projet', projetData, 'CREATE')
      if (!validation.valid) {
        logger.warn('PROJETS_SERVICE', 'Validation échouée lors de create', {
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

      const result = await projetRepository.create(projetData)

      if (result.error) {
        logger.error('PROJETS_SERVICE', 'Erreur create', result.error)
        throw result.error
      }

      logger.info('PROJETS_SERVICE', 'Projet créé avec succès', { id: result.data?.id })
      return result
    } catch (error) {
      logger.error('PROJETS_SERVICE', 'Erreur globale create', error)
      return { data: null, error }
    }
  },

  /**
   * Mettre à jour un projet avec validation
   */
  async update(id, projetData) {
    try {
      logger.debug('PROJETS_SERVICE', 'update appelé', { id, data: projetData })

      // Récupérer l'ancien projet pour validation transitions
      const { data: oldProjet } = await projetRepository.findById(id)
      const context = oldProjet ? { oldStatut: oldProjet.statut } : {}

      // Validation
      const validation = EntityValidator.validate('projet', projetData, 'UPDATE', context)
      if (!validation.valid) {
        logger.warn('PROJETS_SERVICE', 'Validation échouée lors de update', {
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

      const result = await projetRepository.update(id, projetData)

      if (result.error) {
        logger.error('PROJETS_SERVICE', 'Erreur update', { id, error: result.error })
        throw result.error
      }

      logger.info('PROJETS_SERVICE', 'Projet mis à jour avec succès', { id })
      return result
    } catch (error) {
      logger.error('PROJETS_SERVICE', 'Erreur globale update', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Supprimer un projet
   */
  async delete(id) {
    try {
      logger.debug('PROJETS_SERVICE', 'delete appelé', { id })
      const result = await projetRepository.delete(id)

      if (result.error) {
        logger.error('PROJETS_SERVICE', 'Erreur delete', { id, error: result.error })
        throw result.error
      }

      logger.info('PROJETS_SERVICE', 'Projet supprimé avec succès', { id })
      return result
    } catch (error) {
      logger.error('PROJETS_SERVICE', 'Erreur globale delete', { id, error })
      return { error }
    }
  },

  /**
   * Récupérer les projets en cours
   */
  async getEnCours(options = {}) {
    try {
      logger.debug('PROJETS_SERVICE', 'getEnCours appelé', { options })
      const result = await projetRepository.findEnCours(options)

      if (result.error) {
        logger.error('PROJETS_SERVICE', 'Erreur getEnCours', result.error)
        throw result.error
      }

      return result
    } catch (error) {
      logger.error('PROJETS_SERVICE', 'Erreur globale getEnCours', error)
      return { data: null, error }
    }
  },

  /**
   * Rechercher des projets
   */
  async search(searchTerm, options = {}) {
    try {
      logger.debug('PROJETS_SERVICE', 'search appelé', { searchTerm, options })
      const result = await projetRepository.search(searchTerm, options)

      if (result.error) {
        logger.error('PROJETS_SERVICE', 'Erreur search', { searchTerm, error: result.error })
        throw result.error
      }

      return result
    } catch (error) {
      logger.error('PROJETS_SERVICE', 'Erreur globale search', { searchTerm, error })
      return { data: null, error }
    }
  },
}

