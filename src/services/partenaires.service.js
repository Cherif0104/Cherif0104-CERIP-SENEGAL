import { partenaireRepository } from '@/data/repositories'
import { auditService } from './audit.service'
import { logger } from '@/utils/logger'

/**
 * Service Partenaires - Gestion des partenaires
 */
export const partenairesService = {
  /**
   * Récupérer tous les partenaires
   */
  async getAll(options = {}) {
    logger.debug('PARTENAIRES_SERVICE', 'getAll appelé', { options })
    try {
      const result = await partenaireRepository.findAll(options)
      if (result.error) {
        logger.error('PARTENAIRES_SERVICE', 'Erreur getAll', result.error)
        throw result.error
      }
      logger.debug('PARTENAIRES_SERVICE', `getAll réussi: ${result.data?.length || 0} partenaires`)
      return result
    } catch (error) {
      logger.error('PARTENAIRES_SERVICE', 'Erreur globale getAll', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer un partenaire par ID
   */
  async getById(id, options = {}) {
    logger.debug('PARTENAIRES_SERVICE', 'getById appelé', { id, options })
    try {
      const { data, error } = await partenaireRepository.findById(id, options)
      if (error) {
        logger.error('PARTENAIRES_SERVICE', 'Erreur getById', { id, error })
        throw error
      }
      logger.debug('PARTENAIRES_SERVICE', 'getById réussi', { id })
      return { data, error: null }
    } catch (error) {
      logger.error('PARTENAIRES_SERVICE', 'Erreur globale getById', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Créer un partenaire
   */
  async create(partenaireData) {
    logger.debug('PARTENAIRES_SERVICE', 'create appelé', partenaireData)

    if (!partenaireData.code) {
      const { data: existing } = await partenaireRepository.findAll({ pagination: { page: 1, pageSize: 1 } })
      const count = existing?.data?.length || 0
      partenaireData.code = `PAR-${String(count + 1).padStart(4, '0')}`
    }

    try {
      const { data, error } = await partenaireRepository.create(partenaireData)
      if (error) {
        logger.error('PARTENAIRES_SERVICE', 'Erreur create', error)
        throw error
      }

      await auditService.logAction('partenaires', data.id, 'INSERT', null, data, null, {
        metadata: 'Partenaire créé',
      })

      logger.info('PARTENAIRES_SERVICE', 'Partenaire créé avec succès', { id: data.id })
      return { data, error: null }
    } catch (error) {
      logger.error('PARTENAIRES_SERVICE', 'Erreur globale create', error)
      return { data: null, error }
    }
  },

  /**
   * Mettre à jour un partenaire
   */
  async update(id, partenaireData) {
    logger.debug('PARTENAIRES_SERVICE', 'update appelé', { id, partenaireData })

    try {
      const { data: oldData } = await partenaireRepository.findById(id)

      const { data, error } = await partenaireRepository.update(id, partenaireData)
      if (error) {
        logger.error('PARTENAIRES_SERVICE', 'Erreur update', { id, error })
        throw error
      }

      await auditService.logAction('partenaires', id, 'UPDATE', oldData, data, null, {
        metadata: 'Partenaire mis à jour',
      })

      logger.info('PARTENAIRES_SERVICE', 'Partenaire mis à jour avec succès', { id })
      return { data, error: null }
    } catch (error) {
      logger.error('PARTENAIRES_SERVICE', 'Erreur globale update', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Supprimer un partenaire
   */
  async delete(id) {
    logger.debug('PARTENAIRES_SERVICE', 'delete appelé', { id })

    try {
      const { data: oldData } = await partenaireRepository.findById(id)

      const { error } = await partenaireRepository.delete(id)
      if (error) {
        logger.error('PARTENAIRES_SERVICE', 'Erreur delete', { id, error })
        throw error
      }

      await auditService.logAction('partenaires', id, 'DELETE', oldData, null, null, {
        metadata: 'Partenaire supprimé',
      })

      logger.info('PARTENAIRES_SERVICE', 'Partenaire supprimé avec succès', { id })
      return { error: null }
    } catch (error) {
      logger.error('PARTENAIRES_SERVICE', 'Erreur globale delete', { id, error })
      return { error }
    }
  },

  /**
   * Récupérer les partenaires actifs
   */
  async getActifs(options = {}) {
    return await partenaireRepository.findActifs(options)
  },

  /**
   * Récupérer les partenaires par type
   */
  async getByType(typePartenariat, options = {}) {
    return await partenaireRepository.findByType(typePartenariat, options)
  },
}

