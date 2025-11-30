import { candidatRepository } from '@/data/repositories/CandidatRepository'
import { EntityValidator } from '@/business/validators/EntityValidator'
import { logger } from '@/utils/logger'

/**
 * Service Candidatures - Refactorisé pour utiliser Repository pattern
 * Gère les candidats aux appels à candidatures
 */
export const candidaturesService = {
  /**
   * Récupérer tous les candidats avec pagination
   * @param {Object} options - Options de pagination et filtres
   */
  async getAll(options = {}) {
    try {
      logger.debug('CANDIDATURES_SERVICE', 'getAll appelé', { options })
      const result = await candidatRepository.findAll(options)

      if (result.error) {
        logger.error('CANDIDATURES_SERVICE', 'Erreur getAll', result.error)
        throw result.error
      }

      logger.debug('CANDIDATURES_SERVICE', `getAll réussi: ${result.data?.length || 0} candidats`)
      return result
    } catch (error) {
      logger.error('CANDIDATURES_SERVICE', 'Erreur globale getAll', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer un candidat par ID
   */
  async getById(id) {
    try {
      logger.debug('CANDIDATURES_SERVICE', 'getById appelé', { id })

      // Utiliser findByIdWithRelations pour avoir toutes les relations
      const result = await candidatRepository.findByIdWithRelations(id)

      if (result.error) {
        logger.error('CANDIDATURES_SERVICE', 'Erreur getById', { id, error: result.error })
        throw result.error
      }

      logger.debug('CANDIDATURES_SERVICE', 'getById réussi', { id })
      return result
    } catch (error) {
      logger.error('CANDIDATURES_SERVICE', 'Erreur globale getById', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Créer un candidat avec validation
   */
  async create(candidatData) {
    try {
      logger.debug('CANDIDATURES_SERVICE', 'create appelé', { data: candidatData })

      // Validation
      const validation = EntityValidator.validate('candidat', candidatData, 'CREATE')
      if (!validation.valid) {
        logger.warn('CANDIDATURES_SERVICE', 'Validation échouée lors de create', {
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

      const result = await candidatRepository.create(candidatData)

      if (result.error) {
        logger.error('CANDIDATURES_SERVICE', 'Erreur create', result.error)
        throw result.error
      }

      logger.info('CANDIDATURES_SERVICE', 'Candidat créé avec succès', { id: result.data?.id })
      return result
    } catch (error) {
      logger.error('CANDIDATURES_SERVICE', 'Erreur globale create', error)
      return { data: null, error }
    }
  },

  /**
   * Mettre à jour un candidat avec validation
   */
  async update(id, candidatData) {
    try {
      logger.debug('CANDIDATURES_SERVICE', 'update appelé', { id, data: candidatData })

      // Récupérer l'ancien candidat pour validation transitions
      const { data: oldCandidat } = await candidatRepository.findById(id)
      const context = oldCandidat ? { oldStatut: oldCandidat.statut_eligibilite } : {}

      // Validation
      const validation = EntityValidator.validate('candidat', candidatData, 'UPDATE', context)
      if (!validation.valid) {
        logger.warn('CANDIDATURES_SERVICE', 'Validation échouée lors de update', {
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

      const result = await candidatRepository.update(id, candidatData)

      if (result.error) {
        logger.error('CANDIDATURES_SERVICE', 'Erreur update', { id, error: result.error })
        throw result.error
      }

      logger.info('CANDIDATURES_SERVICE', 'Candidat mis à jour avec succès', { id })
      return result
    } catch (error) {
      logger.error('CANDIDATURES_SERVICE', 'Erreur globale update', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Supprimer un candidat
   */
  async delete(id) {
    try {
      logger.debug('CANDIDATURES_SERVICE', 'delete appelé', { id })
      const result = await candidatRepository.delete(id)

      if (result.error) {
        logger.error('CANDIDATURES_SERVICE', 'Erreur delete', { id, error: result.error })
        throw result.error
      }

      logger.info('CANDIDATURES_SERVICE', 'Candidat supprimé avec succès', { id })
      return result
    } catch (error) {
      logger.error('CANDIDATURES_SERVICE', 'Erreur globale delete', { id, error })
      return { error }
    }
  },

  /**
   * Récupérer les candidats d'un appel à candidatures
   */
  async getByAppel(appelId, options = {}) {
    try {
      logger.debug('CANDIDATURES_SERVICE', 'getByAppel appelé', { appelId, options })
      const result = await candidatRepository.findByAppel(appelId, options)

      if (result.error) {
        logger.error('CANDIDATURES_SERVICE', 'Erreur getByAppel', { appelId, error: result.error })
        throw result.error
      }

      return result
    } catch (error) {
      logger.error('CANDIDATURES_SERVICE', 'Erreur globale getByAppel', { appelId, error })
      return { data: null, error }
    }
  },

  /**
   * Récupérer les candidats éligibles
   */
  async getEligibles(options = {}) {
    try {
      logger.debug('CANDIDATURES_SERVICE', 'getEligibles appelé', { options })
      const result = await candidatRepository.findEligibles(options)

      if (result.error) {
        logger.error('CANDIDATURES_SERVICE', 'Erreur getEligibles', result.error)
        throw result.error
      }

      return result
    } catch (error) {
      logger.error('CANDIDATURES_SERVICE', 'Erreur globale getEligibles', error)
      return { data: null, error }
    }
  },

  /**
   * Mettre à jour le statut d'éligibilité d'un candidat
   * @param {string} id - ID du candidat
   * @param {string} statutEligibilite - Nouveau statut (ÉLIGIBLE, NON_ÉLIGIBLE, etc.)
   * @param {string} motif - Motif de la décision (optionnel)
   */
  async updateStatutEligibilite(id, statutEligibilite, motif = null) {
    try {
      logger.debug('CANDIDATURES_SERVICE', 'updateStatutEligibilite appelé', {
        id,
        statutEligibilite,
        motif,
      })

      const result = await candidatRepository.updateStatutEligibilite(
        id,
        statutEligibilite,
        motif
      )

      if (result.error) {
        logger.error('CANDIDATURES_SERVICE', 'Erreur updateStatutEligibilite', {
          id,
          error: result.error,
        })
        throw result.error
      }

      logger.info('CANDIDATURES_SERVICE', 'Statut éligibilité mis à jour avec succès', {
        id,
        statutEligibilite,
      })
      return result
    } catch (error) {
      logger.error('CANDIDATURES_SERVICE', 'Erreur globale updateStatutEligibilite', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Récupérer les candidats par statut d'éligibilité
   */
  async getByStatutEligibilite(statutEligibilite, options = {}) {
    try {
      logger.debug('CANDIDATURES_SERVICE', 'getByStatutEligibilite appelé', {
        statutEligibilite,
        options,
      })
      const result = await candidatRepository.findByStatutEligibilite(statutEligibilite, options)

      if (result.error) {
        logger.error('CANDIDATURES_SERVICE', 'Erreur getByStatutEligibilite', {
          statutEligibilite,
          error: result.error,
        })
        throw result.error
      }

      return result
    } catch (error) {
      logger.error('CANDIDATURES_SERVICE', 'Erreur globale getByStatutEligibilite', {
        statutEligibilite,
        error,
      })
      return { data: null, error }
    }
  },
}

