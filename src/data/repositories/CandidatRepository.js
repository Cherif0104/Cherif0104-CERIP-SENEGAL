import { BaseRepository } from './BaseRepository'
import { logger } from '@/utils/logger'
import { supabase } from '@/lib/supabase'

/**
 * CandidatRepository - Repository spécialisé pour les candidats
 */
export class CandidatRepository extends BaseRepository {
  constructor() {
    super('candidats', {
      enabled: true,
      ttl: 300000, // 5 minutes
      level: 'memory',
    })
  }

  /**
   * Récupérer les candidats d'un appel à candidatures
   * @param {string} appelId - ID de l'appel
   * @param {Object} options - Options
   */
  async findByAppel(appelId, options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        appel_id: appelId,
      },
    })
  }

  /**
   * Récupérer les candidats par statut d'éligibilité
   * @param {string} statutEligibilite - Statut (ÉLIGIBLE, NON_ÉLIGIBLE, etc.)
   * @param {Object} options - Options
   */
  async findByStatutEligibilite(statutEligibilite, options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        statut_eligibilite: statutEligibilite,
      },
    })
  }

  /**
   * Récupérer les candidats éligibles
   */
  async findEligibles(options = {}) {
    return await this.findByStatutEligibilite('ÉLIGIBLE', options)
  }

  /**
   * Récupérer un candidat avec toutes ses relations
   * @param {string} id - ID du candidat
   */
  async findByIdWithRelations(id) {
    try {
      logger.debug('CANDIDAT_REPOSITORY', 'Récupération candidat avec relations', { id })

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*, appels_candidatures(*), personnes(*), projets(*)')
        .eq('id', id)
        .single()

      if (error) {
        logger.error('CANDIDAT_REPOSITORY', 'Erreur findByIdWithRelations', { id, error })
        throw error
      }

      return { data, error: null }
    } catch (error) {
      logger.error('CANDIDAT_REPOSITORY', 'Erreur globale findByIdWithRelations', { id, error })
      return { data: null, error }
    }
  }

  /**
   * Mettre à jour le statut d'éligibilité d'un candidat
   * @param {string} id - ID du candidat
   * @param {string} statutEligibilite - Nouveau statut
   * @param {string} motif - Motif de la décision
   */
  async updateStatutEligibilite(id, statutEligibilite, motif = null) {
    try {
      logger.debug('CANDIDAT_REPOSITORY', 'Mise à jour statut éligibilité', {
        id,
        statutEligibilite,
        motif,
      })

      const updateData = {
        statut_eligibilite: statutEligibilite,
        date_evaluation: new Date().toISOString(),
      }

      if (motif) {
        updateData.motif_non_eligibilite = motif
      }

      return await this.update(id, updateData)
    } catch (error) {
      logger.error('CANDIDAT_REPOSITORY', 'Erreur updateStatutEligibilite', { id, error })
      return { data: null, error }
    }
  }
}

// Instance singleton
export const candidatRepository = new CandidatRepository()
export default candidatRepository

