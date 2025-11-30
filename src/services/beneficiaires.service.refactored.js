import { beneficiaireRepository } from '@/data/repositories/BeneficiaireRepository'
import { EntityValidator } from '@/business/validators/EntityValidator'
import { logger } from '@/utils/logger'

/**
 * Service Bénéficiaires - Refactorisé pour utiliser Repository pattern
 * Gère les bénéficiaires des projets
 */
export const beneficiairesService = {
  /**
   * Récupérer tous les bénéficiaires avec pagination
   * @param {Object} options - Options de pagination et filtres
   */
  async getAll(options = {}) {
    try {
      logger.debug('BENEFICIAIRES_SERVICE', 'getAll appelé', { options })
      const result = await beneficiaireRepository.findAll(options)

      if (result.error) {
        logger.error('BENEFICIAIRES_SERVICE', 'Erreur getAll', result.error)
        throw result.error
      }

      logger.debug(
        'BENEFICIAIRES_SERVICE',
        `getAll réussi: ${result.data?.length || 0} bénéficiaires`
      )
      return result
    } catch (error) {
      logger.error('BENEFICIAIRES_SERVICE', 'Erreur globale getAll', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer un bénéficiaire par ID
   */
  async getById(id) {
    try {
      logger.debug('BENEFICIAIRES_SERVICE', 'getById appelé', { id })

      // Utiliser findByIdWithRelations pour avoir toutes les relations
      const result = await beneficiaireRepository.findByIdWithRelations(id)

      if (result.error) {
        logger.error('BENEFICIAIRES_SERVICE', 'Erreur getById', { id, error: result.error })
        throw result.error
      }

      logger.debug('BENEFICIAIRES_SERVICE', 'getById réussi', { id })
      return result
    } catch (error) {
      logger.error('BENEFICIAIRES_SERVICE', 'Erreur globale getById', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Créer un bénéficiaire avec validation
   */
  async create(beneficiaireData) {
    try {
      logger.debug('BENEFICIAIRES_SERVICE', 'create appelé', { data: beneficiaireData })

      // Validation
      const validation = EntityValidator.validate('beneficiaire', beneficiaireData, 'CREATE')
      if (!validation.valid) {
        logger.warn('BENEFICIAIRES_SERVICE', 'Validation échouée lors de create', {
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

      const result = await beneficiaireRepository.create(beneficiaireData)

      if (result.error) {
        logger.error('BENEFICIAIRES_SERVICE', 'Erreur create', result.error)
        throw result.error
      }

      logger.info('BENEFICIAIRES_SERVICE', 'Bénéficiaire créé avec succès', {
        id: result.data?.id,
      })
      return result
    } catch (error) {
      logger.error('BENEFICIAIRES_SERVICE', 'Erreur globale create', error)
      return { data: null, error }
    }
  },

  /**
   * Mettre à jour un bénéficiaire avec validation
   */
  async update(id, beneficiaireData) {
    try {
      logger.debug('BENEFICIAIRES_SERVICE', 'update appelé', { id, data: beneficiaireData })

      // Récupérer l'ancien bénéficiaire pour validation transitions
      const { data: oldBeneficiaire } = await beneficiaireRepository.findById(id)
      const context = oldBeneficiaire ? { oldStatut: oldBeneficiaire.statut } : {}

      // Validation
      const validation = EntityValidator.validate(
        'beneficiaire',
        beneficiaireData,
        'UPDATE',
        context
      )
      if (!validation.valid) {
        logger.warn('BENEFICIAIRES_SERVICE', 'Validation échouée lors de update', {
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

      const result = await beneficiaireRepository.update(id, beneficiaireData)

      if (result.error) {
        logger.error('BENEFICIAIRES_SERVICE', 'Erreur update', { id, error: result.error })
        throw result.error
      }

      logger.info('BENEFICIAIRES_SERVICE', 'Bénéficiaire mis à jour avec succès', { id })
      return result
    } catch (error) {
      logger.error('BENEFICIAIRES_SERVICE', 'Erreur globale update', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Supprimer un bénéficiaire
   */
  async delete(id) {
    try {
      logger.debug('BENEFICIAIRES_SERVICE', 'delete appelé', { id })
      const result = await beneficiaireRepository.delete(id)

      if (result.error) {
        logger.error('BENEFICIAIRES_SERVICE', 'Erreur delete', { id, error: result.error })
        throw result.error
      }

      logger.info('BENEFICIAIRES_SERVICE', 'Bénéficiaire supprimé avec succès', { id })
      return result
    } catch (error) {
      logger.error('BENEFICIAIRES_SERVICE', 'Erreur globale delete', { id, error })
      return { error }
    }
  },

  /**
   * Récupérer les bénéficiaires d'un projet
   */
  async getByProjet(projetId, options = {}) {
    try {
      logger.debug('BENEFICIAIRES_SERVICE', 'getByProjet appelé', { projetId, options })
      const result = await beneficiaireRepository.findByProjet(projetId, options)

      if (result.error) {
        logger.error('BENEFICIAIRES_SERVICE', 'Erreur getByProjet', {
          projetId,
          error: result.error,
        })
        throw result.error
      }

      return result
    } catch (error) {
      logger.error('BENEFICIAIRES_SERVICE', 'Erreur globale getByProjet', { projetId, error })
      return { data: null, error }
    }
  },

  /**
   * Récupérer les bénéficiaires d'un candidat
   */
  async getByCandidat(candidatId, options = {}) {
    try {
      logger.debug('BENEFICIAIRES_SERVICE', 'getByCandidat appelé', { candidatId, options })
      const result = await beneficiaireRepository.findByCandidat(candidatId, options)

      if (result.error) {
        logger.error('BENEFICIAIRES_SERVICE', 'Erreur getByCandidat', {
          candidatId,
          error: result.error,
        })
        throw result.error
      }

      return result
    } catch (error) {
      logger.error('BENEFICIAIRES_SERVICE', 'Erreur globale getByCandidat', { candidatId, error })
      return { data: null, error }
    }
  },

  /**
   * Récupérer les bénéficiaires d'un mentor
   */
  async getByMentor(mentorId, options = {}) {
    try {
      logger.debug('BENEFICIAIRES_SERVICE', 'getByMentor appelé', { mentorId, options })
      const result = await beneficiaireRepository.findByMentor(mentorId, options)

      if (result.error) {
        logger.error('BENEFICIAIRES_SERVICE', 'Erreur getByMentor', {
          mentorId,
          error: result.error,
        })
        throw result.error
      }

      return result
    } catch (error) {
      logger.error('BENEFICIAIRES_SERVICE', 'Erreur globale getByMentor', { mentorId, error })
      return { data: null, error }
    }
  },

  /**
   * Récupérer les bénéficiaires actifs
   */
  async getActifs(options = {}) {
    try {
      logger.debug('BENEFICIAIRES_SERVICE', 'getActifs appelé', { options })
      const result = await beneficiaireRepository.findActifs(options)

      if (result.error) {
        logger.error('BENEFICIAIRES_SERVICE', 'Erreur getActifs', result.error)
        throw result.error
      }

      return result
    } catch (error) {
      logger.error('BENEFICIAIRES_SERVICE', 'Erreur globale getActifs', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer les bénéficiaires par statut
   */
  async getByStatut(statut, options = {}) {
    try {
      logger.debug('BENEFICIAIRES_SERVICE', 'getByStatut appelé', { statut, options })
      const result = await beneficiaireRepository.findByStatut(statut, options)

      if (result.error) {
        logger.error('BENEFICIAIRES_SERVICE', 'Erreur getByStatut', { statut, error: result.error })
        throw result.error
      }

      return result
    } catch (error) {
      logger.error('BENEFICIAIRES_SERVICE', 'Erreur globale getByStatut', { statut, error })
      return { data: null, error }
    }
  },
}

