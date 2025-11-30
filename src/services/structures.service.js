import { structureRepository } from '@/data/repositories'
import { auditService } from './audit.service'
import { logger } from '@/utils/logger'

/**
 * Service Structures - Gestion des structures locales
 */
export const structuresService = {
  /**
   * Récupérer toutes les structures
   */
  async getAll(options = {}) {
    logger.debug('STRUCTURES_SERVICE', 'getAll appelé', { options })
    try {
      const result = await structureRepository.findAll(options)
      if (result.error) {
        logger.error('STRUCTURES_SERVICE', 'Erreur getAll', result.error)
        throw result.error
      }
      logger.debug('STRUCTURES_SERVICE', `getAll réussi: ${result.data?.length || 0} structures`)
      return result
    } catch (error) {
      logger.error('STRUCTURES_SERVICE', 'Erreur globale getAll', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer une structure par ID
   */
  async getById(id, options = {}) {
    logger.debug('STRUCTURES_SERVICE', 'getById appelé', { id, options })
    try {
      const { data, error } = await structureRepository.findById(id, options)
      if (error) {
        logger.error('STRUCTURES_SERVICE', 'Erreur getById', { id, error })
        throw error
      }
      logger.debug('STRUCTURES_SERVICE', 'getById réussi', { id })
      return { data, error: null }
    } catch (error) {
      logger.error('STRUCTURES_SERVICE', 'Erreur globale getById', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Créer une structure
   */
  async create(structureData) {
    logger.debug('STRUCTURES_SERVICE', 'create appelé', structureData)

    if (!structureData.code) {
      const { data: existing } = await structureRepository.findAll({ pagination: { page: 1, pageSize: 1 } })
      const count = existing?.data?.length || 0
      structureData.code = `STR-${String(count + 1).padStart(4, '0')}`
    }

    try {
      const { data, error } = await structureRepository.create(structureData)
      if (error) {
        logger.error('STRUCTURES_SERVICE', 'Erreur create', error)
        throw error
      }

      await auditService.logAction('structures', data.id, 'INSERT', null, data, null, {
        metadata: 'Structure créée',
      })

      logger.info('STRUCTURES_SERVICE', 'Structure créée avec succès', { id: data.id })
      return { data, error: null }
    } catch (error) {
      logger.error('STRUCTURES_SERVICE', 'Erreur globale create', error)
      return { data: null, error }
    }
  },

  /**
   * Mettre à jour une structure
   */
  async update(id, structureData) {
    logger.debug('STRUCTURES_SERVICE', 'update appelé', { id, structureData })

    try {
      const { data: oldData } = await structureRepository.findById(id)

      const { data, error } = await structureRepository.update(id, structureData)
      if (error) {
        logger.error('STRUCTURES_SERVICE', 'Erreur update', { id, error })
        throw error
      }

      await auditService.logAction('structures', id, 'UPDATE', oldData, data, null, {
        metadata: 'Structure mise à jour',
      })

      logger.info('STRUCTURES_SERVICE', 'Structure mise à jour avec succès', { id })
      return { data, error: null }
    } catch (error) {
      logger.error('STRUCTURES_SERVICE', 'Erreur globale update', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Supprimer une structure
   */
  async delete(id) {
    logger.debug('STRUCTURES_SERVICE', 'delete appelé', { id })

    try {
      const { data: oldData } = await structureRepository.findById(id)

      const { error } = await structureRepository.delete(id)
      if (error) {
        logger.error('STRUCTURES_SERVICE', 'Erreur delete', { id, error })
        throw error
      }

      await auditService.logAction('structures', id, 'DELETE', oldData, null, null, {
        metadata: 'Structure supprimée',
      })

      logger.info('STRUCTURES_SERVICE', 'Structure supprimée avec succès', { id })
      return { error: null }
    } catch (error) {
      logger.error('STRUCTURES_SERVICE', 'Erreur globale delete', { id, error })
      return { error }
    }
  },

  /**
   * Récupérer les structures actives
   */
  async getActives(options = {}) {
    return await structureRepository.findActives(options)
  },

  /**
   * Récupérer les structures par type
   */
  async getByType(type, options = {}) {
    return await structureRepository.findByType(type, options)
  },

  /**
   * Récupérer les structures par secteur
   */
  async getBySecteur(secteur, options = {}) {
    return await structureRepository.findBySecteur(secteur, options)
  },
}

