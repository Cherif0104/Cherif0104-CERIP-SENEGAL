import { programmeRepository } from '@/data/repositories/ProgrammeRepository'
import { EntityValidator } from '@/business/validators/EntityValidator'
import { logger } from '@/utils/logger'

/**
 * Service Programmes - Refactorisé pour utiliser Repository pattern
 * Cette version utilise ProgrammeRepository au lieu d'accéder directement à Supabase
 */
export const programmesService = {
  /**
   * Récupérer tous les programmes avec pagination
   * @param {Object} options - Options de pagination et filtres
   */
  async getAll(options = {}) {
    try {
      logger.debug('PROGRAMMES_SERVICE', 'getAll appelé', { options })
      const result = await programmeRepository.findAll(options)
      
      if (result.error) {
        logger.error('PROGRAMMES_SERVICE', 'Erreur getAll', result.error)
        throw result.error
      }

      logger.debug('PROGRAMMES_SERVICE', `getAll réussi: ${result.data?.length || 0} programmes`)
      return result
    } catch (error) {
      logger.error('PROGRAMMES_SERVICE', 'Erreur globale getAll', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer un programme par ID
   */
  async getById(id) {
    try {
      logger.debug('PROGRAMMES_SERVICE', 'getById appelé', { id })
      const result = await programmeRepository.findById(id)
      
      if (result.error) {
        logger.error('PROGRAMMES_SERVICE', 'Erreur getById', { id, error: result.error })
        throw result.error
      }

      logger.debug('PROGRAMMES_SERVICE', 'getById réussi', { id })
      return result
    } catch (error) {
      logger.error('PROGRAMMES_SERVICE', 'Erreur globale getById', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Créer un programme avec validation
   */
  async create(programmeData) {
    try {
      logger.debug('PROGRAMMES_SERVICE', 'create appelé', { data: programmeData })

      // Validation
      const validation = EntityValidator.validate('programme', programmeData, 'CREATE')
      if (!validation.valid) {
        logger.warn('PROGRAMMES_SERVICE', 'Validation échouée lors de create', {
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

      // Exécuter avec repository
      const result = await programmeRepository.create(programmeData)

      if (result.error) {
        logger.error('PROGRAMMES_SERVICE', 'Erreur create', result.error)
        throw result.error
      }

      logger.info('PROGRAMMES_SERVICE', 'Programme créé avec succès', { id: result.data?.id })
      return result
    } catch (error) {
      logger.error('PROGRAMMES_SERVICE', 'Erreur globale create', error)
      return { data: null, error }
    }
  },

  /**
   * Mettre à jour un programme avec validation
   */
  async update(id, programmeData) {
    try {
      logger.debug('PROGRAMMES_SERVICE', 'update appelé', { id, data: programmeData })

      // Récupérer l'ancien programme pour validation transitions
      const { data: oldProgramme } = await programmeRepository.findById(id)
      const context = oldProgramme ? { oldStatut: oldProgramme.statut } : {}

      // Validation
      const validation = EntityValidator.validate('programme', programmeData, 'UPDATE', context)
      if (!validation.valid) {
        logger.warn('PROGRAMMES_SERVICE', 'Validation échouée lors de update', {
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

      // Exécuter avec repository
      const result = await programmeRepository.update(id, programmeData)

      if (result.error) {
        logger.error('PROGRAMMES_SERVICE', 'Erreur update', { id, error: result.error })
        throw result.error
      }

      logger.info('PROGRAMMES_SERVICE', 'Programme mis à jour avec succès', { id })
      return result
    } catch (error) {
      logger.error('PROGRAMMES_SERVICE', 'Erreur globale update', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Supprimer un programme
   */
  async delete(id) {
    try {
      logger.debug('PROGRAMMES_SERVICE', 'delete appelé', { id })
      const result = await programmeRepository.delete(id)

      if (result.error) {
        logger.error('PROGRAMMES_SERVICE', 'Erreur delete', { id, error: result.error })
        throw result.error
      }

      logger.info('PROGRAMMES_SERVICE', 'Programme supprimé avec succès', { id })
      return result
    } catch (error) {
      logger.error('PROGRAMMES_SERVICE', 'Erreur globale delete', { id, error })
      return { error }
    }
  },

  /**
   * Récupérer les programmes actifs
   */
  async getActifs(options = {}) {
    try {
      logger.debug('PROGRAMMES_SERVICE', 'getActifs appelé', { options })
      const result = await programmeRepository.findActifs(options)

      if (result.error) {
        logger.error('PROGRAMMES_SERVICE', 'Erreur getActifs', result.error)
        throw result.error
      }

      return result
    } catch (error) {
      logger.error('PROGRAMMES_SERVICE', 'Erreur globale getActifs', error)
      return { data: null, error }
    }
  },

  /**
   * Rechercher des programmes
   */
  async search(searchTerm, options = {}) {
    try {
      logger.debug('PROGRAMMES_SERVICE', 'search appelé', { searchTerm, options })
      const result = await programmeRepository.search(searchTerm, options)

      if (result.error) {
        logger.error('PROGRAMMES_SERVICE', 'Erreur search', { searchTerm, error: result.error })
        throw result.error
      }

      return result
    } catch (error) {
      logger.error('PROGRAMMES_SERVICE', 'Erreur globale search', { searchTerm, error })
      return { data: null, error }
    }
  },
}

