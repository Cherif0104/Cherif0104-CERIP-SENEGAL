import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'

/**
 * Service Formations - Gestion des formations
 */
export const formationsService = {
  /**
   * Récupérer toutes les formations
   */
  async getAll(options = {}) {
    logger.debug('FORMATIONS_SERVICE', 'getAll appelé', { options })
    try {
      let query = supabase
        .from('formations')
        .select('*, formateurs:formateur_id(id, nom, prenom, email), sessions_formations(*)')

      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      if (options.pagination) {
        const { page = 1, pageSize = 20 } = options.pagination
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1
        query = query.range(from, to)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        logger.error('FORMATIONS_SERVICE', 'Erreur getAll', error)
        throw error
      }

      logger.debug('FORMATIONS_SERVICE', `getAll réussi: ${data?.length || 0} formations`)
      return { data, error: null }
    } catch (error) {
      logger.error('FORMATIONS_SERVICE', 'Erreur globale getAll', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer une formation par ID
   */
  async getById(id) {
    logger.debug('FORMATIONS_SERVICE', 'getById appelé', { id })
    try {
      const { data, error } = await supabase
        .from('formations')
        .select('*, formateurs:formateur_id(id, nom, prenom, email), sessions_formations(*, participations_formation(*))')
        .eq('id', id)
        .single()

      if (error) {
        logger.error('FORMATIONS_SERVICE', 'Erreur getById', { id, error })
        throw error
      }

      logger.debug('FORMATIONS_SERVICE', 'getById réussi', { id })
      return { data, error: null }
    } catch (error) {
      logger.error('FORMATIONS_SERVICE', 'Erreur globale getById', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Créer une formation
   */
  async create(formationData) {
    logger.debug('FORMATIONS_SERVICE', 'create appelé', formationData)
    try {
      const { data, error } = await supabase
        .from('formations')
        .insert(formationData)
        .select()
        .single()

      if (error) {
        logger.error('FORMATIONS_SERVICE', 'Erreur create', error)
        throw error
      }

      logger.info('FORMATIONS_SERVICE', 'Formation créée avec succès', { id: data.id })
      return { data, error: null }
    } catch (error) {
      logger.error('FORMATIONS_SERVICE', 'Erreur globale create', error)
      return { data: null, error }
    }
  },

  /**
   * Mettre à jour une formation
   */
  async update(id, formationData) {
    logger.debug('FORMATIONS_SERVICE', 'update appelé', { id, formationData })
    try {
      const { data, error } = await supabase
        .from('formations')
        .update(formationData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logger.error('FORMATIONS_SERVICE', 'Erreur update', { id, error })
        throw error
      }

      logger.info('FORMATIONS_SERVICE', 'Formation mise à jour avec succès', { id })
      return { data, error: null }
    } catch (error) {
      logger.error('FORMATIONS_SERVICE', 'Erreur globale update', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Récupérer les formations actives
   */
  async getActives() {
    return await this.getAll({
      filters: { statut: 'OUVERT' },
    })
  },

  /**
   * Récupérer les sessions d'une formation
   */
  async getSessions(formationId) {
    try {
      const { data, error } = await supabase
        .from('sessions_formations')
        .select('*, participations_formation(*)')
        .eq('formation_id', formationId)
        .order('date_debut', { ascending: true })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      logger.error('FORMATIONS_SERVICE', 'Erreur getSessions', error)
      return { data: null, error }
    }
  },

  /**
   * Inscrire un bénéficiaire à une formation
   */
  async inscrireBeneficiaire(formationId, beneficiaireId, sessionId = null) {
    try {
      const inscriptionData = {
        formation_id: formationId,
        beneficiaire_id: beneficiaireId,
        statut: 'INSCRIT',
      }

      if (sessionId) {
        // Utiliser participations_formation si session spécifiée
        const { data, error } = await supabase
          .from('participations_formation')
          .insert({
            session_id: sessionId,
            beneficiaire_id: beneficiaireId,
            statut: 'INSCRIT',
          })
          .select()
          .single()

        if (error) throw error
        return { data, error: null }
      } else {
        // Utiliser inscriptions_formations
        const { data, error } = await supabase
          .from('inscriptions_formations')
          .insert(inscriptionData)
          .select()
          .single()

        if (error) throw error
        return { data, error: null }
      }
    } catch (error) {
      logger.error('FORMATIONS_SERVICE', 'Erreur inscrireBeneficiaire', error)
      return { data: null, error }
    }
  },
}

