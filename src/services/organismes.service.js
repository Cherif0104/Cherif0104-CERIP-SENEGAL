import { organismeRepository } from '@/data/repositories'
import { EntityValidator } from '@/business/validators/EntityValidator'
import { auditService } from './audit.service'
import { logger } from '@/utils/logger'

/**
 * Service Organismes - Gestion des organismes internationaux
 */
export const organismesService = {
  /**
   * Récupérer tous les organismes
   */
  async getAll(options = {}) {
    logger.debug('ORGANISMES_SERVICE', 'getAll appelé', { options })
    try {
      const result = await organismeRepository.findAll(options)
      if (result.error) {
        logger.error('ORGANISMES_SERVICE', 'Erreur getAll', result.error)
        throw result.error
      }
      logger.debug('ORGANISMES_SERVICE', `getAll réussi: ${result.data?.length || 0} organismes`)
      return result
    } catch (error) {
      logger.error('ORGANISMES_SERVICE', 'Erreur globale getAll', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer un organisme par ID
   */
  async getById(id, options = {}) {
    logger.debug('ORGANISMES_SERVICE', 'getById appelé', { id, options })
    try {
      const { data, error } = await organismeRepository.findById(id, options)
      if (error) {
        logger.error('ORGANISMES_SERVICE', 'Erreur getById', { id, error })
        throw error
      }
      logger.debug('ORGANISMES_SERVICE', 'getById réussi', { id })
      return { data, error: null }
    } catch (error) {
      logger.error('ORGANISMES_SERVICE', 'Erreur globale getById', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Créer un organisme
   */
  async create(organismeData) {
    logger.debug('ORGANISMES_SERVICE', 'create appelé', organismeData)

    // Générer un code si non fourni
    if (!organismeData.code) {
      const { data: existing } = await organismeRepository.findAll({ pagination: { page: 1, pageSize: 1 } })
      const count = existing?.data?.length || 0
      organismeData.code = `ORG-${String(count + 1).padStart(4, '0')}`
    }

    try {
      const { data, error } = await organismeRepository.create(organismeData)
      if (error) {
        logger.error('ORGANISMES_SERVICE', 'Erreur create', error)
        throw error
      }

      // Audit trail
      await auditService.logAction('organismes_internationaux', data.id, 'INSERT', null, data, null, {
        metadata: 'Organisme créé',
      })

      logger.info('ORGANISMES_SERVICE', 'Organisme créé avec succès', { id: data.id })
      return { data, error: null }
    } catch (error) {
      logger.error('ORGANISMES_SERVICE', 'Erreur globale create', error)
      return { data: null, error }
    }
  },

  /**
   * Mettre à jour un organisme
   */
  async update(id, organismeData) {
    logger.debug('ORGANISMES_SERVICE', 'update appelé', { id, organismeData })

    try {
      // Récupérer les anciennes données pour l'audit
      const { data: oldData } = await organismeRepository.findById(id)

      const { data, error } = await organismeRepository.update(id, organismeData)
      if (error) {
        logger.error('ORGANISMES_SERVICE', 'Erreur update', { id, error })
        throw error
      }

      // Audit trail
      await auditService.logAction('organismes_internationaux', id, 'UPDATE', oldData, data, null, {
        metadata: 'Organisme mis à jour',
      })

      logger.info('ORGANISMES_SERVICE', 'Organisme mis à jour avec succès', { id })
      return { data, error: null }
    } catch (error) {
      logger.error('ORGANISMES_SERVICE', 'Erreur globale update', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Supprimer un organisme
   */
  async delete(id) {
    logger.debug('ORGANISMES_SERVICE', 'delete appelé', { id })

    try {
      // Récupérer les données avant suppression pour l'audit
      const { data: oldData } = await organismeRepository.findById(id)

      const { error } = await organismeRepository.delete(id)
      if (error) {
        logger.error('ORGANISMES_SERVICE', 'Erreur delete', { id, error })
        throw error
      }

      // Audit trail
      await auditService.logAction('organismes_internationaux', id, 'DELETE', oldData, null, null, {
        metadata: 'Organisme supprimé',
      })

      logger.info('ORGANISMES_SERVICE', 'Organisme supprimé avec succès', { id })
      return { error: null }
    } catch (error) {
      logger.error('ORGANISMES_SERVICE', 'Erreur globale delete', { id, error })
      return { error }
    }
  },

  /**
   * Récupérer les organismes actifs
   */
  async getActifs(options = {}) {
    return await organismeRepository.findActifs(options)
  },

  /**
   * Récupérer les organismes par type
   */
  async getByType(type, options = {}) {
    return await organismeRepository.findByType(type, options)
  },
}

