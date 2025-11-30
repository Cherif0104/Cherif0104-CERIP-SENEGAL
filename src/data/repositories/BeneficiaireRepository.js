import { BaseRepository } from './BaseRepository'
import { logger } from '@/utils/logger'
import { supabase } from '@/lib/supabase'

/**
 * BeneficiaireRepository - Repository spécialisé pour les bénéficiaires
 */
export class BeneficiaireRepository extends BaseRepository {
  constructor() {
    super('beneficiaires', {
      enabled: true,
      ttl: 300000, // 5 minutes
      level: 'memory',
    })
  }

  /**
   * Récupérer les bénéficiaires d'un projet
   * @param {string} projetId - ID du projet
   * @param {Object} options - Options
   */
  async findByProjet(projetId, options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        projet_id: projetId,
      },
    })
  }

  /**
   * Récupérer les bénéficiaires d'un candidat
   * @param {string} candidatId - ID du candidat
   * @param {Object} options - Options
   */
  async findByCandidat(candidatId, options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        candidat_id: candidatId,
      },
    })
  }

  /**
   * Récupérer les bénéficiaires par statut
   * @param {string} statut - Statut du bénéficiaire
   * @param {Object} options - Options
   */
  async findByStatut(statut, options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        statut,
      },
    })
  }

  /**
   * Récupérer les bénéficiaires actifs
   */
  async findActifs(options = {}) {
    return await this.findByStatut('ACTIF', options)
  }

  /**
   * Récupérer un bénéficiaire avec toutes ses relations
   * @param {string} id - ID du bénéficiaire
   */
  async findByIdWithRelations(id) {
    try {
      logger.debug('BENEFICIAIRE_REPOSITORY', 'Récupération bénéficiaire avec relations', { id })

      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          '*, candidats(*), personnes(*), projets(*), mentors(*), users(*), appels_candidatures(*)'
        )
        .eq('id', id)
        .single()

      if (error) {
        logger.error('BENEFICIAIRE_REPOSITORY', 'Erreur findByIdWithRelations', { id, error })
        throw error
      }

      return { data, error: null }
    } catch (error) {
      logger.error('BENEFICIAIRE_REPOSITORY', 'Erreur globale findByIdWithRelations', { id, error })
      return { data: null, error }
    }
  }

  /**
   * Récupérer les bénéficiaires d'un mentor
   * @param {string} mentorId - ID du mentor
   * @param {Object} options - Options
   */
  async findByMentor(mentorId, options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        mentor_id: mentorId,
      },
    })
  }

  /**
   * Récupérer les bénéficiaires ayant un taux d'insertion
   * @param {Object} options - Options avec filtres
   */
  async findAvecInsertion(options = {}) {
    // Cette méthode nécessiterait une jointure avec la table suivi_insertion
    // Pour l'instant, on retourne tous les bénéficiaires
    return await this.findAll(options)
  }
}

// Instance singleton
export const beneficiaireRepository = new BeneficiaireRepository()
export default beneficiaireRepository

