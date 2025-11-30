import { financeurRepository } from '@/data/repositories'
import { auditService } from './audit.service'
import { logger } from '@/utils/logger'

/**
 * Service Financeurs - Gestion des financeurs
 */
export const financeursService = {
  /**
   * Récupérer tous les financeurs
   */
  async getAll(options = {}) {
    logger.debug('FINANCEURS_SERVICE', 'getAll appelé', { options })
    try {
      const result = await financeurRepository.findAll(options)
      if (result.error) {
        logger.error('FINANCEURS_SERVICE', 'Erreur getAll', result.error)
        throw result.error
      }
      logger.debug('FINANCEURS_SERVICE', `getAll réussi: ${result.data?.length || 0} financeurs`)
      return result
    } catch (error) {
      logger.error('FINANCEURS_SERVICE', 'Erreur globale getAll', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer un financeur par ID
   */
  async getById(id, options = {}) {
    logger.debug('FINANCEURS_SERVICE', 'getById appelé', { id, options })
    try {
      const { data, error } = await financeurRepository.findById(id, options)
      if (error) {
        logger.error('FINANCEURS_SERVICE', 'Erreur getById', { id, error })
        throw error
      }
      logger.debug('FINANCEURS_SERVICE', 'getById réussi', { id })
      return { data, error: null }
    } catch (error) {
      logger.error('FINANCEURS_SERVICE', 'Erreur globale getById', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Créer un financeur
   */
  async create(financeurData) {
    logger.debug('FINANCEURS_SERVICE', 'create appelé', financeurData)

    // Générer un code si non fourni
    if (!financeurData.code) {
      const { data: existing } = await financeurRepository.findAll({ pagination: { page: 1, pageSize: 1 } })
      const count = existing?.data?.length || 0
      financeurData.code = `FIN-${String(count + 1).padStart(4, '0')}`
    }

    try {
      const { data, error } = await financeurRepository.create(financeurData)
      if (error) {
        logger.error('FINANCEURS_SERVICE', 'Erreur create', error)
        throw error
      }

      // Audit trail
      await auditService.logAction('financeurs', data.id, 'INSERT', null, data, null, {
        metadata: 'Financeur créé',
      })

      logger.info('FINANCEURS_SERVICE', 'Financeur créé avec succès', { id: data.id })
      return { data, error: null }
    } catch (error) {
      logger.error('FINANCEURS_SERVICE', 'Erreur globale create', error)
      return { data: null, error }
    }
  },

  /**
   * Mettre à jour un financeur
   */
  async update(id, financeurData) {
    logger.debug('FINANCEURS_SERVICE', 'update appelé', { id, financeurData })

    try {
      const { data: oldData } = await financeurRepository.findById(id)

      const { data, error } = await financeurRepository.update(id, financeurData)
      if (error) {
        logger.error('FINANCEURS_SERVICE', 'Erreur update', { id, error })
        throw error
      }

      await auditService.logAction('financeurs', id, 'UPDATE', oldData, data, null, {
        metadata: 'Financeur mis à jour',
      })

      logger.info('FINANCEURS_SERVICE', 'Financeur mis à jour avec succès', { id })
      return { data, error: null }
    } catch (error) {
      logger.error('FINANCEURS_SERVICE', 'Erreur globale update', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Supprimer un financeur
   */
  async delete(id) {
    logger.debug('FINANCEURS_SERVICE', 'delete appelé', { id })

    try {
      const { data: oldData } = await financeurRepository.findById(id)

      const { error } = await financeurRepository.delete(id)
      if (error) {
        logger.error('FINANCEURS_SERVICE', 'Erreur delete', { id, error })
        throw error
      }

      await auditService.logAction('financeurs', id, 'DELETE', oldData, null, null, {
        metadata: 'Financeur supprimé',
      })

      logger.info('FINANCEURS_SERVICE', 'Financeur supprimé avec succès', { id })
      return { error: null }
    } catch (error) {
      logger.error('FINANCEURS_SERVICE', 'Erreur globale delete', { id, error })
      return { error }
    }
  },

  /**
   * Récupérer les financeurs actifs
   */
  async getActifs(options = {}) {
    return await financeurRepository.findActifs(options)
  },

  /**
   * Récupérer les financeurs par type
   */
  async getByType(type, options = {}) {
    return await financeurRepository.findByType(type, options)
  },
}

