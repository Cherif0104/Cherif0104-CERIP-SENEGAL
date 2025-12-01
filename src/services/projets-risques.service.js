import { projetsService } from './projets.service'
import { projetDepensesService } from './projet-depenses.service'
import { logger } from '@/utils/logger'
import { supabase } from '@/lib/supabase'

/**
 * Service pour calculer les risques au niveau des projets
 * Extension du riskManagement.service pour les projets avec remontée au programme
 */
export const projetsRisquesService = {
  /**
   * Calculer le risque budgétaire d'un projet
   */
  async calculateBudgetRisk(projetId) {
    try {
      const { data: projet } = await projetsService.getById(projetId)
      if (!projet) return null

      const budget = parseFloat(projet.budget_alloue || 0)
      const stats = await projetDepensesService.getStats(projetId, 'reporting')
      const budgetConsomme = stats.data?.budgetConsomme || 0

      let probabilite = 0
      let impact = 0

      if (budget > 0) {
        const ratio = (budgetConsomme / budget) * 100

        if (ratio > 100) probabilite = 100
        else if (ratio > 90) probabilite = 80
        else if (ratio > 75) probabilite = 60
        else if (ratio > 50) probabilite = 40
        else probabilite = 20

        if (ratio > 100) impact = 100
        else if (ratio > 90) impact = 80
        else if (ratio > 75) impact = 60
        else impact = 40
      }

      const score = (probabilite * impact) / 100

      return {
        type: 'budget',
        probabilite,
        impact,
        score: Math.round(score),
        niveau: this.getNiveau(score),
      }
    } catch (error) {
      logger.error('PROJETS_RISQUES_SERVICE', 'Erreur calculateBudgetRisk', error)
      return null
    }
  },

  /**
   * Calculer le risque de retard (jalons)
   */
  async calculateDelayRisk(projetId) {
    try {
      const { data: jalons } = await supabase
        .from('jalons')
        .select('*')
        .eq('projet_id', projetId)

      if (!jalons || jalons.length === 0) return null

      const now = new Date()
      const jalonsEnRetard = jalons.filter(j => {
        if (!j.date_prevue) return false
        const datePrevue = new Date(j.date_prevue)
        return datePrevue < now && j.statut !== 'TERMINE'
      })

      const tauxRetard = jalons.length > 0 ? (jalonsEnRetard.length / jalons.length) * 100 : 0

      let probabilite = 0
      let impact = 0

      if (tauxRetard > 50) {
        probabilite = 80
        impact = 70
      } else if (tauxRetard > 30) {
        probabilite = 60
        impact = 50
      } else if (tauxRetard > 10) {
        probabilite = 40
        impact = 30
      } else {
        probabilite = 20
        impact = 20
      }

      const score = (probabilite * impact) / 100

      return {
        type: 'retard',
        probabilite,
        impact,
        score: Math.round(score),
        niveau: this.getNiveau(score),
        details: {
          jalonsTotal: jalons.length,
          jalonsEnRetard: jalonsEnRetard.length,
          tauxRetard,
        },
      }
    } catch (error) {
      logger.error('PROJETS_RISQUES_SERVICE', 'Erreur calculateDelayRisk', error)
      return null
    }
  },

  /**
   * Calculer le risque d'assiduité
   */
  async calculateAssiduiteRisk(projetId) {
    try {
      const { data: assiduite } = await supabase
        .from('beneficiaire_assiduite')
        .select('score_assiduite, statut')
        .eq('projet_id', projetId)

      if (!assiduite || assiduite.length === 0) return null

      const scores = assiduite.map(a => parseFloat(a.score_assiduite || 0))
      const moyenne = scores.reduce((sum, s) => sum + s, 0) / scores.length
      const enAlerte = assiduite.filter(a => a.statut === 'ALERTE' || a.statut === 'CRITIQUE').length
      const tauxAlerte = assiduite.length > 0 ? (enAlerte / assiduite.length) * 100 : 0

      let probabilite = 0
      let impact = 0

      if (moyenne < 50 || tauxAlerte > 50) {
        probabilite = 80
        impact = 70
      } else if (moyenne < 70 || tauxAlerte > 30) {
        probabilite = 60
        impact = 50
      } else if (moyenne < 80 || tauxAlerte > 10) {
        probabilite = 40
        impact = 30
      } else {
        probabilite = 20
        impact = 20
      }

      const score = (probabilite * impact) / 100

      return {
        type: 'assiduite',
        probabilite,
        impact,
        score: Math.round(score),
        niveau: this.getNiveau(score),
        details: {
          moyenne,
          enAlerte,
          tauxAlerte,
        },
      }
    } catch (error) {
      logger.error('PROJETS_RISQUES_SERVICE', 'Erreur calculateAssiduiteRisk', error)
      return null
    }
  },

  /**
   * Calculer le score global de risque d'un projet
   */
  async calculateGlobalRisk(projetId) {
    try {
      const risques = []

      const budgetRisk = await this.calculateBudgetRisk(projetId)
      if (budgetRisk) risques.push(budgetRisk)

      const delayRisk = await this.calculateDelayRisk(projetId)
      if (delayRisk) risques.push(delayRisk)

      const assiduiteRisk = await this.calculateAssiduiteRisk(projetId)
      if (assiduiteRisk) risques.push(assiduiteRisk)

      if (risques.length === 0) {
        return {
          scoreGlobal: 0,
          niveau: 'LOW',
          risques: [],
        }
      }

      // Score global = moyenne pondérée des risques
      const scoreGlobal = Math.round(
        risques.reduce((sum, r) => sum + r.score, 0) / risques.length
      )

      return {
        scoreGlobal,
        niveau: this.getNiveau(scoreGlobal),
        risques,
      }
    } catch (error) {
      logger.error('PROJETS_RISQUES_SERVICE', 'Erreur calculateGlobalRisk', error)
      return null
    }
  },

  /**
   * Déterminer le niveau de risque
   */
  getNiveau(score) {
    if (score >= 70) return 'CRITICAL'
    if (score >= 50) return 'HIGH'
    if (score >= 30) return 'MEDIUM'
    return 'LOW'
  },

  /**
   * Remonter un risque critique au programme
   */
  async remonterRisqueAuProgramme(projetId, risqueId = null) {
    try {
      logger.debug('PROJETS_RISQUES_SERVICE', 'Remontée risque au programme', { projetId, risqueId })

      // Récupérer le projet pour obtenir le programme_id
      const { data: projet } = await projetsService.getById(projetId)
      if (!projet || !projet.programme_id) {
        throw new Error('Projet non trouvé ou sans programme associé')
      }

      // Calculer le risque global du projet
      const risqueGlobal = await this.calculateGlobalRisk(projetId)
      if (!risqueGlobal || risqueGlobal.niveau !== 'CRITICAL') {
        return {
          data: null,
          error: {
            message: 'Le risque n\'est pas critique, pas de remontée nécessaire',
          },
        }
      }

      // Enregistrer la remontée (créer un enregistrement dans une table de remontées ou log)
      const { data: { user } } = await supabase.auth.getUser()

      // Pour l'instant, on log juste l'action
      // TODO: Créer une table projet_risques_remontees si nécessaire
      logger.warn('PROJETS_RISQUES_SERVICE', 'Risque critique remonté au programme', {
        projetId,
        programmeId: projet.programme_id,
        scoreGlobal: risqueGlobal.scoreGlobal,
        niveau: risqueGlobal.niveau,
        userId: user?.id,
      })

      return {
        data: {
          projetId,
          programmeId: projet.programme_id,
          risque: risqueGlobal,
          remonteLe: new Date().toISOString(),
        },
        error: null,
      }
    } catch (error) {
      logger.error('PROJETS_RISQUES_SERVICE', 'Erreur remonterRisqueAuProgramme', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer les risques d'un projet
   */
  async getRisksForProjet(projetId) {
    try {
      const risqueGlobal = await this.calculateGlobalRisk(projetId)
      return risqueGlobal
    } catch (error) {
      logger.error('PROJETS_RISQUES_SERVICE', 'Erreur getRisksForProjet', error)
      return null
    }
  },
}

