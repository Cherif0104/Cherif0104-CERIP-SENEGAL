import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'

/**
 * Service Projet Critères Éligibilité - Gestion des critères d'éligibilité modulables
 */
export const projetCriteresEligibiliteService = {
  /**
   * Récupérer tous les critères d'un projet ou d'un appel
   */
  async getByProjet(projetId) {
    try {
      logger.debug('PROJET_CRITERES_ELIGIBILITE_SERVICE', 'getByProjet appelé', { projetId })
      
      const { data, error } = await supabase
        .from('projet_criteres_eligibilite')
        .select('*')
        .eq('projet_id', projetId)
        .eq('actif', true)
        .order('ordre', { ascending: true })

      if (error) {
        logger.error('PROJET_CRITERES_ELIGIBILITE_SERVICE', 'Erreur getByProjet', error)
        throw error
      }

      logger.debug('PROJET_CRITERES_ELIGIBILITE_SERVICE', `getByProjet réussi: ${data?.length || 0} critères`)
      return { data: data || [], error: null }
    } catch (error) {
      logger.error('PROJET_CRITERES_ELIGIBILITE_SERVICE', 'Erreur globale getByProjet', error)
      return { data: [], error }
    }
  },

  /**
   * Récupérer tous les critères d'un appel (via le projet)
   */
  async getByAppel(appelId) {
    try {
      logger.debug('PROJET_CRITERES_ELIGIBILITE_SERVICE', 'getByAppel appelé', { appelId })
      
      // Les critères sont liés au projet, pas directement à l'appel
      // On récupère d'abord l'appel pour obtenir le projet_id
      const { data: appel } = await supabase
        .from('appels_candidatures')
        .select('projet_id')
        .eq('id', appelId)
        .single()

      if (!appel || !appel.projet_id) {
        return { data: [], error: null }
      }

      const { data, error } = await supabase
        .from('projet_criteres_eligibilite')
        .select('*')
        .eq('projet_id', appel.projet_id)
        .eq('actif', true)
        .order('ordre', { ascending: true })

      if (error) {
        logger.error('PROJET_CRITERES_ELIGIBILITE_SERVICE', 'Erreur getByAppel', error)
        throw error
      }

      logger.debug('PROJET_CRITERES_ELIGIBILITE_SERVICE', `getByAppel réussi: ${data?.length || 0} critères`)
      return { data: data || [], error: null }
    } catch (error) {
      logger.error('PROJET_CRITERES_ELIGIBILITE_SERVICE', 'Erreur globale getByAppel', error)
      return { data: [], error }
    }
  },

  /**
   * Récupérer un critère par ID
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('projet_criteres_eligibilite')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      logger.error('PROJET_CRITERES_ELIGIBILITE_SERVICE', 'Erreur getById', error)
      return { data: null, error }
    }
  },

  /**
   * Créer un critère d'éligibilité
   */
  async create(critereData) {
    try {
      logger.debug('PROJET_CRITERES_ELIGIBILITE_SERVICE', 'create appelé', { critereData })
      
      if (!critereData.critere_nom || !critereData.critere_nom.trim()) {
        throw new Error('critere_nom est requis')
      }
      
      if (!critereData.critere_type || !['AGE', 'GENRE', 'SITUATION', 'COMPETENCE', 'DIPLOME', 'EXPERIENCE', 'LOCALISATION', 'AUTRE'].includes(critereData.critere_type)) {
        throw new Error('critere_type doit être AGE, GENRE, SITUATION, COMPETENCE, DIPLOME, EXPERIENCE, LOCALISATION ou AUTRE')
      }
      
      if (!critereData.projet_id) {
        throw new Error('projet_id est requis')
      }

      const dataToInsert = {
        projet_id: critereData.projet_id,
        critere_nom: critereData.critere_nom.trim(),
        critere_type: critereData.critere_type,
        critere_config: critereData.critere_config || {},
        poids: critereData.poids ? parseInt(critereData.poids) : 1,
        obligatoire: critereData.obligatoire !== undefined ? critereData.obligatoire : false,
        actif: critereData.actif !== undefined ? critereData.actif : true,
        ordre: critereData.ordre ? parseInt(critereData.ordre) : 0,
      }

      const { data, error } = await supabase
        .from('projet_criteres_eligibilite')
        .insert(dataToInsert)
        .select()
        .single()

      if (error) {
        logger.error('PROJET_CRITERES_ELIGIBILITE_SERVICE', 'Erreur création critère', error)
        throw error
      }

      logger.info('PROJET_CRITERES_ELIGIBILITE_SERVICE', 'Critère créé avec succès', { id: data.id })
      return { data, error: null }
    } catch (error) {
      logger.error('PROJET_CRITERES_ELIGIBILITE_SERVICE', 'Erreur create', error)
      return { 
        data: null, 
        error: {
          message: error?.message || 'Erreur lors de la création du critère',
          details: error?.details,
          hint: error?.hint
        }
      }
    }
  },

  /**
   * Mettre à jour un critère
   */
  async update(id, critereData) {
    try {
      logger.debug('PROJET_CRITERES_ELIGIBILITE_SERVICE', 'update appelé', { id, critereData })

      const updates = {}
      if (critereData.critere_nom !== undefined) updates.critere_nom = critereData.critere_nom.trim()
      if (critereData.critere_type !== undefined) updates.critere_type = critereData.critere_type
      if (critereData.critere_config !== undefined) updates.critere_config = critereData.critere_config
      if (critereData.poids !== undefined) updates.poids = parseInt(critereData.poids)
      if (critereData.obligatoire !== undefined) updates.obligatoire = critereData.obligatoire
      if (critereData.actif !== undefined) updates.actif = critereData.actif
      if (critereData.ordre !== undefined) updates.ordre = parseInt(critereData.ordre)

      const { data, error } = await supabase
        .from('projet_criteres_eligibilite')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logger.error('PROJET_CRITERES_ELIGIBILITE_SERVICE', 'Erreur update', error)
        throw error
      }

      logger.info('PROJET_CRITERES_ELIGIBILITE_SERVICE', 'Critère mis à jour avec succès', { id })
      return { data, error: null }
    } catch (error) {
      logger.error('PROJET_CRITERES_ELIGIBILITE_SERVICE', 'Erreur update', error)
      return { data: null, error }
    }
  },

  /**
   * Supprimer un critère
   */
  async delete(id) {
    try {
      logger.debug('PROJET_CRITERES_ELIGIBILITE_SERVICE', 'delete appelé', { id })

      const { error } = await supabase
        .from('projet_criteres_eligibilite')
        .delete()
        .eq('id', id)

      if (error) {
        logger.error('PROJET_CRITERES_ELIGIBILITE_SERVICE', 'Erreur delete', error)
        throw error
      }

      logger.info('PROJET_CRITERES_ELIGIBILITE_SERVICE', 'Critère supprimé avec succès', { id })
      return { data: { id }, error: null }
    } catch (error) {
      logger.error('PROJET_CRITERES_ELIGIBILITE_SERVICE', 'Erreur delete', error)
      return { 
        data: null, 
        error: {
          message: error?.message || 'Erreur lors de la suppression du critère',
          details: error?.details,
          hint: error?.hint
        }
      }
    }
  },

  /**
   * Évaluer un candidat selon les critères
   */
  async evaluerCandidat(candidatId, projetId, appelId, criteres, evaluations) {
    try {
      logger.debug('PROJET_CRITERES_ELIGIBILITE_SERVICE', 'evaluerCandidat appelé', { candidatId, projetId, appelId, criteres, evaluations })

      const { data: { user } } = await supabase.auth.getUser()

      // Supprimer l'évaluation existante pour ce candidat/projet/appel
      await supabase
        .from('candidat_evaluations')
        .delete()
        .eq('candidat_id', candidatId)
        .eq('projet_id', projetId)
        .eq('appel_id', appelId || null)

      // Calculer le score global pondéré
      const scoreGlobal = criteres.reduce((sum, critere) => {
        const evaluation = evaluations.find(e => e.critere_id === critere.id)
        if (!evaluation || !evaluation.score) return sum
        return sum + (parseFloat(evaluation.score) * parseFloat(critere.poids || 1))
      }, 0) / criteres.reduce((sum, c) => sum + parseFloat(c.poids || 1), 0)

      // Construire le JSONB des scores détaillés
      const scoresDetail = {}
      criteres.forEach(critere => {
        const evaluation = evaluations.find(e => e.critere_id === critere.id)
        if (evaluation) {
          scoresDetail[critere.id] = {
            critere_nom: critere.critere_nom,
            score: evaluation.score,
            valeur: evaluation.valeur_obtenue,
          }
        }
      })

      // Déterminer le statut d'éligibilité
      let statutEligibilite = 'EN_ATTENTE'
      const criteresObligatoires = criteres.filter(c => c.obligatoire)
      const criteresObligatoiresValides = criteresObligatoires.every(c => {
        const evaluation = evaluations.find(e => e.critere_id === c.id)
        return evaluation && evaluation.score > 0
      })

      if (criteresObligatoiresValides && scoreGlobal >= 50) {
        statutEligibilite = 'ELIGIBLE'
      } else if (!criteresObligatoiresValides || scoreGlobal < 30) {
        statutEligibilite = 'NON_ELIGIBLE'
      }

      // Insérer la nouvelle évaluation
      const { data, error } = await supabase
        .from('candidat_evaluations')
        .insert({
          candidat_id: candidatId,
          projet_id: projetId,
          appel_id: appelId || null,
          score_total: Math.round(scoreGlobal * 100) / 100,
          scores_detail: scoresDetail,
          statut_eligibilite: statutEligibilite,
          notes: evaluations.find(e => e.commentaire)?.commentaire?.trim() || null,
          evalue_par: user?.id || null,
        })
        .select()
        .single()

      if (error) {
        logger.error('PROJET_CRITERES_ELIGIBILITE_SERVICE', 'Erreur évaluation candidat', error)
        throw error
      }

      logger.info('PROJET_CRITERES_ELIGIBILITE_SERVICE', 'Candidat évalué avec succès', { candidatId, scoreGlobal, statutEligibilite })
      return { data: { evaluation: data, scoreGlobal, statutEligibilite }, error: null }
    } catch (error) {
      logger.error('PROJET_CRITERES_ELIGIBILITE_SERVICE', 'Erreur evaluerCandidat', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer les évaluations d'un candidat
   */
  async getEvaluationsByCandidat(candidatId, projetId = null, appelId = null) {
    try {
      let query = supabase
        .from('candidat_evaluations')
        .select('*')
        .eq('candidat_id', candidatId)

      if (projetId) {
        query = query.eq('projet_id', projetId)
      }
      if (appelId) {
        query = query.eq('appel_id', appelId)
      }

      const { data, error } = await query

      if (error) throw error
      return { data: data || [], error: null }
    } catch (error) {
      logger.error('PROJET_CRITERES_ELIGIBILITE_SERVICE', 'Erreur getEvaluationsByCandidat', error)
      return { data: [], error }
    }
  },
}

