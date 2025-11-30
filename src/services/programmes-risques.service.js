import { programmesService } from './programmes.service'
import { projetsService } from './projets.service'
import { financementsService } from './financements.service'
import { logger } from '@/utils/logger'

/**
 * Service pour calculer les risques au niveau des programmes
 * Extension du riskManagement.service pour les programmes
 */
export const programmesRisquesService = {
  /**
   * Calculer le risque budgétaire d'un programme
   */
  async calculateBudgetRisk(programmeId) {
    try {
      const { data: programme } = await programmesService.getById(programmeId)
      if (!programme) return null

      const budget = parseFloat(programme.budget || 0)
      const budgetConsomme = parseFloat(programme.budget_consomme || 0)

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
      logger.error('PROGRAMMES_RISQUES_SERVICE', 'Erreur calculateBudgetRisk', error)
      return null
    }
  },

  /**
   * Calculer le risque financier (financements)
   */
  async calculateFinancialRisk(programmeId) {
    try {
      const { data: financements } = await financementsService.getByProgramme(programmeId)
      const { data: programme } = await programmesService.getById(programmeId)

      if (!programme) return null

      const budget = parseFloat(programme.budget || 0)
      const totalFinancements = (financements || []).reduce(
        (sum, f) => sum + parseFloat(f.montant_accorde || 0),
        0
      )

      let probabilite = 50
      let impact = 40

      if (budget > 0) {
        const ratio = (totalFinancements / budget) * 100
        if (ratio < 50) {
          probabilite = 80 // Risque élevé si peu de financements
          impact = 70
        } else if (ratio < 75) {
          probabilite = 50
          impact = 40
        } else {
          probabilite = 20
          impact = 20
        }
      }

      const score = (probabilite * impact) / 100

      return {
        type: 'financier',
        probabilite,
        impact,
        score: Math.round(score),
        niveau: this.getNiveau(score),
      }
    } catch (error) {
      logger.error('PROGRAMMES_RISQUES_SERVICE', 'Erreur calculateFinancialRisk', error)
      return null
    }
  },

  /**
   * Calculer le risque opérationnel (projets associés)
   */
  async calculateOperationalRisk(programmeId) {
    try {
      const { data: projets } = await projetsService.getAll({ programme_id: programmeId })

      if (!projets || projets.length === 0) {
        return {
          type: 'operationnel',
          probabilite: 30,
          impact: 30,
          score: 9,
          niveau: 'LOW',
        }
      }

      // Analyser les statuts des projets
      const projetsEnRetard = projets.filter(
        (p) => new Date(p.date_fin) < new Date() && p.statut !== 'TERMINE'
      ).length
      const tauxRetard = (projetsEnRetard / projets.length) * 100

      let probabilite = 20
      let impact = 30

      if (tauxRetard > 50) {
        probabilite = 80
        impact = 70
      } else if (tauxRetard > 25) {
        probabilite = 50
        impact = 50
      } else if (tauxRetard > 10) {
        probabilite = 30
        impact = 40
      }

      const score = (probabilite * impact) / 100

      return {
        type: 'operationnel',
        probabilite,
        impact,
        score: Math.round(score),
        niveau: this.getNiveau(score),
        details: {
          totalProjets: projets.length,
          projetsEnRetard,
          tauxRetard: Math.round(tauxRetard),
        },
      }
    } catch (error) {
      logger.error('PROGRAMMES_RISQUES_SERVICE', 'Erreur calculateOperationalRisk', error)
      return null
    }
  },

  /**
   * Calculer le risque global d'un programme
   */
  async calculateGlobalRisk(programmeId) {
    try {
      const [budgetRisk, financialRisk, operationalRisk] = await Promise.all([
        this.calculateBudgetRisk(programmeId),
        this.calculateFinancialRisk(programmeId),
        this.calculateOperationalRisk(programmeId),
      ])

      const risks = [budgetRisk, financialRisk, operationalRisk].filter((r) => r !== null)

      if (risks.length === 0) return null

      // Ponderer les risques
      const weights = { budget: 0.40, financier: 0.35, operationnel: 0.25 }
      const scoreGlobal = risks.reduce((sum, r) => {
        const weight = weights[r.type] || 0.33
        return sum + r.score * weight
      }, 0)

      return {
        scoreGlobal: Math.round(scoreGlobal),
        niveau: this.getNiveau(scoreGlobal),
        risques,
      }
    } catch (error) {
      logger.error('PROGRAMMES_RISQUES_SERVICE', 'Erreur calculateGlobalRisk', error)
      return null
    }
  },

  /**
   * Récupérer tous les risques d'un programme
   */
  async getRisksForProgramme(programmeId) {
    return await this.calculateGlobalRisk(programmeId)
  },

  /**
   * Récupérer les risques de tous les programmes
   */
  async getAllProgrammesRisks() {
    try {
      const { data: programmes } = await programmesService.getAll()
      if (!programmes || programmes.length === 0) return { data: [], error: null }

      const risksPromises = programmes.map(async (prog) => {
        const risk = await this.calculateGlobalRisk(prog.id)
        return {
          programme: {
            id: prog.id,
            nom: prog.nom,
          },
          risque: risk,
        }
      })

      const risks = await Promise.all(risksPromises)

      return { data: risks.filter((r) => r.risque !== null), error: null }
    } catch (error) {
      logger.error('PROGRAMMES_RISQUES_SERVICE', 'Erreur getAllProgrammesRisks', error)
      return { data: null, error }
    }
  },

  /**
   * Déterminer le niveau de risque
   */
  getNiveau(score) {
    if (score >= 75) return 'CRITICAL'
    if (score >= 50) return 'HIGH'
    if (score >= 25) return 'MEDIUM'
    return 'LOW'
  },
}

