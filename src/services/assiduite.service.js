import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'

/**
 * Service Assiduité - Calcul des scores d'assiduité des bénéficiaires
 */
export const assiduiteService = {
  /**
   * Calculer le score d'assiduité pour un bénéficiaire sur une période
   */
  async calculerScore(beneficiaireId, projetId, periodeDebut, periodeFin) {
    try {
      logger.debug('ASSIDUITE_SERVICE', 'Calcul score assiduité', { beneficiaireId, projetId, periodeDebut, periodeFin })

      // Utiliser la fonction SQL si elle existe, sinon calculer manuellement
      const { data: scoreData, error: functionError } = await supabase.rpc('calculer_score_assiduite', {
        p_beneficiaire_id: beneficiaireId,
        p_projet_id: projetId,
        p_periode_debut: periodeDebut,
        p_periode_fin: periodeFin,
      })

      if (!functionError && scoreData !== null) {
        return { data: { score: scoreData }, error: null }
      }

      // Calcul manuel si fonction SQL n'existe pas
      const { data: activites } = await supabase
        .from('projet_activites')
        .select('id, date_activite, statut')
        .eq('projet_id', projetId)
        .eq('statut', 'TERMINE')
        .gte('date_activite', periodeDebut)
        .lte('date_activite', periodeFin)

      const totalActivites = activites?.length || 0
      if (totalActivites === 0) {
        return { data: { score: 0, totalActivites: 0, presentes: 0 }, error: null }
      }

      const activiteIds = activites.map(a => a.id)
      const { data: presences } = await supabase
        .from('activite_presences')
        .select('activite_id, present')
        .eq('beneficiaire_id', beneficiaireId)
        .in('activite_id', activiteIds)
        .eq('present', true)

      const presentes = presences?.length || 0
      const score = totalActivites > 0 ? (presentes / totalActivites) * 100 : 0

      return {
        data: {
          score: Math.round(score * 100) / 100,
          totalActivites,
          presentes,
          absentes: totalActivites - presentes,
        },
        error: null
      }
    } catch (error) {
      logger.error('ASSIDUITE_SERVICE', 'Erreur calcul score', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer ou créer le score d'assiduité pour une période
   */
  async getOrCreateScore(beneficiaireId, projetId, periodeDebut, periodeFin, seuilAlerte = 80) {
    try {
      // Vérifier si un score existe déjà
      const { data: existing } = await supabase
        .from('beneficiaire_assiduite')
        .select('*')
        .eq('beneficiaire_id', beneficiaireId)
        .eq('projet_id', projetId)
        .eq('periode_debut', periodeDebut)
        .eq('periode_fin', periodeFin)
        .single()

      if (existing) {
        return { data: existing, error: null }
      }

      // Calculer le score
      const scoreResult = await this.calculerScore(beneficiaireId, projetId, periodeDebut, periodeFin)
      if (scoreResult.error) {
        return scoreResult
      }

      const { score, totalActivites, presentes, absentes } = scoreResult.data
      
      // Déterminer le statut
      let statut = 'NORMAL'
      if (score < seuilAlerte * 0.5) {
        statut = 'CRITIQUE'
      } else if (score < seuilAlerte) {
        statut = 'ALERTE'
      }

      // Créer l'enregistrement
      const { data, error } = await supabase
        .from('beneficiaire_assiduite')
        .insert({
          beneficiaire_id: beneficiaireId,
          projet_id: projetId,
          periode_debut: periodeDebut,
          periode_fin: periodeFin,
          activites_total: totalActivites,
          activites_presentes: presentes,
          activites_absentes: absentes,
          score_assiduite: score,
          seuil_alerte: seuilAlerte,
          statut: statut,
        })
        .select()
        .single()

      if (error) {
        logger.error('ASSIDUITE_SERVICE', 'Erreur création score', error)
        throw error
      }

      return { data, error: null }
    } catch (error) {
      logger.error('ASSIDUITE_SERVICE', 'Erreur getOrCreateScore', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer tous les scores d'assiduité pour un projet
   */
  async getByProjet(projetId, periodeDebut = null, periodeFin = null) {
    try {
      logger.debug('ASSIDUITE_SERVICE', 'getByProjet appelé', { projetId, periodeDebut, periodeFin })

      let query = supabase
        .from('beneficiaire_assiduite')
        .select(`
          *,
          beneficiaires (
            id,
            code,
            personne
          )
        `)
        .eq('projet_id', projetId)
        .order('score_assiduite', { ascending: true })

      if (periodeDebut) {
        query = query.gte('periode_debut', periodeDebut)
      }
      if (periodeFin) {
        query = query.lte('periode_fin', periodeFin)
      }

      const { data, error } = await query

      if (error) {
        logger.error('ASSIDUITE_SERVICE', 'Erreur getByProjet', error)
        throw error
      }

      logger.debug('ASSIDUITE_SERVICE', `getByProjet réussi: ${data?.length || 0} scores`)
      return { data: data || [], error: null }
    } catch (error) {
      logger.error('ASSIDUITE_SERVICE', 'Erreur globale getByProjet', error)
      return { data: [], error }
    }
  },

  /**
   * Mettre à jour le seuil d'alerte
   */
  async updateSeuilAlerte(id, seuilAlerte) {
    try {
      // Récupérer le score actuel
      const { data: scoreData } = await supabase
        .from('beneficiaire_assiduite')
        .select('score_assiduite')
        .eq('id', id)
        .single()

      if (!scoreData) {
        throw new Error('Score non trouvé')
      }

      // Déterminer le nouveau statut
      let statut = 'NORMAL'
      if (scoreData.score_assiduite < seuilAlerte * 0.5) {
        statut = 'CRITIQUE'
      } else if (scoreData.score_assiduite < seuilAlerte) {
        statut = 'ALERTE'
      }

      const { data, error } = await supabase
        .from('beneficiaire_assiduite')
        .update({
          seuil_alerte: seuilAlerte,
          statut: statut,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      logger.error('ASSIDUITE_SERVICE', 'Erreur updateSeuilAlerte', error)
      return { data: null, error }
    }
  },

  /**
   * Recalculer tous les scores pour un projet
   */
  async recalculerProjet(projetId, periodeDebut, periodeFin, seuilAlerte = 80) {
    try {
      logger.debug('ASSIDUITE_SERVICE', 'Recalcul projet', { projetId, periodeDebut, periodeFin })

      // Récupérer tous les bénéficiaires du projet
      const { data: beneficiaires } = await supabase
        .from('beneficiaires')
        .select('id')
        .eq('projet_id', projetId)

      if (!beneficiaires || beneficiaires.length === 0) {
        return { data: [], error: null }
      }

      const results = []
      for (const beneficiaire of beneficiaires) {
        const result = await this.getOrCreateScore(
          beneficiaire.id,
          projetId,
          periodeDebut,
          periodeFin,
          seuilAlerte
        )
        if (!result.error) {
          results.push(result.data)
        }
      }

      return { data: results, error: null }
    } catch (error) {
      logger.error('ASSIDUITE_SERVICE', 'Erreur recalculerProjet', error)
      return { data: [], error }
    }
  },
}

