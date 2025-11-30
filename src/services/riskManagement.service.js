import { supabase } from '@/lib/supabase'

// Poids des risques selon ISO 31000
const RISK_WEIGHTS = {
  budget: 0.30,
  operationnel: 0.25,
  financier: 0.20,
  conformite: 0.15,
  performance: 0.10,
}

export const riskManagementService = {
  // Calcul du risque budgétaire (30%)
  async calculateBudgetRisk(projetId) {
    try {
      const { data: projet, error } = await supabase
        .from('projets')
        .select('budget_alloue, budget_consomme')
        .eq('id', projetId)
        .single()

      if (error) throw error

      const budgetAlloue = projet.budget_alloue || 0
      const budgetConsomme = projet.budget_consomme || 0

      let probabilite = 0
      let impact = 0

      if (budgetAlloue > 0) {
        const ratio = (budgetConsomme / budgetAlloue) * 100

        // Probabilité basée sur le ratio de consommation
        if (ratio > 100) probabilite = 100
        else if (ratio > 90) probabilite = 80
        else if (ratio > 75) probabilite = 60
        else if (ratio > 50) probabilite = 40
        else probabilite = 20

        // Impact basé sur le dépassement
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
        score,
        poids: RISK_WEIGHTS.budget,
        scorePondere: score * RISK_WEIGHTS.budget,
      }
    } catch (error) {
      console.error('Error calculating budget risk:', error)
      return null
    }
  },

  // Calcul du risque opérationnel (25%)
  async calculateOperationalRisk(projetId) {
    try {
      // Placeholder - à implémenter avec jalons et indicateurs
      const probabilite = 30
      const impact = 50
      const score = (probabilite * impact) / 100

      return {
        type: 'operationnel',
        probabilite,
        impact,
        score,
        poids: RISK_WEIGHTS.operationnel,
        scorePondere: score * RISK_WEIGHTS.operationnel,
      }
    } catch (error) {
      console.error('Error calculating operational risk:', error)
      return null
    }
  },

  // Calcul du risque financier (20%)
  async calculateFinancialRisk(projetId) {
    try {
      // Placeholder - à implémenter avec financements
      const probabilite = 25
      const impact = 40
      const score = (probabilite * impact) / 100

      return {
        type: 'financier',
        probabilite,
        impact,
        score,
        poids: RISK_WEIGHTS.financier,
        scorePondere: score * RISK_WEIGHTS.financier,
      }
    } catch (error) {
      console.error('Error calculating financial risk:', error)
      return null
    }
  },

  // Calcul du risque de conformité (15%)
  async calculateComplianceRisk(projetId) {
    try {
      // Placeholder - à implémenter avec rapports et documents
      const probabilite = 20
      const impact = 30
      const score = (probabilite * impact) / 100

      return {
        type: 'conformite',
        probabilite,
        impact,
        score,
        poids: RISK_WEIGHTS.conformite,
        scorePondere: score * RISK_WEIGHTS.conformite,
      }
    } catch (error) {
      console.error('Error calculating compliance risk:', error)
      return null
    }
  },

  // Calcul du risque de performance (10%)
  async calculatePerformanceRisk(projetId) {
    try {
      // Placeholder - à implémenter avec indicateurs de performance
      const probabilite = 15
      const impact = 25
      const score = (probabilite * impact) / 100

      return {
        type: 'performance',
        probabilite,
        impact,
        score,
        poids: RISK_WEIGHTS.performance,
        scorePondere: score * RISK_WEIGHTS.performance,
      }
    } catch (error) {
      console.error('Error calculating performance risk:', error)
      return null
    }
  },

  // Calcul du score de risque global
  async calculateGlobalRisk(projetId) {
    try {
      const risks = await Promise.all([
        this.calculateBudgetRisk(projetId),
        this.calculateOperationalRisk(projetId),
        this.calculateFinancialRisk(projetId),
        this.calculateComplianceRisk(projetId),
        this.calculatePerformanceRisk(projetId),
      ])

      const validRisks = risks.filter((r) => r !== null)
      const scoreGlobal = validRisks.reduce((sum, r) => sum + r.scorePondere, 0)

      let niveau = 'LOW'
      if (scoreGlobal >= 75) niveau = 'CRITICAL'
      else if (scoreGlobal >= 50) niveau = 'HIGH'
      else if (scoreGlobal >= 25) niveau = 'MEDIUM'

      return {
        scoreGlobal: Math.round(scoreGlobal),
        niveau,
        risques: validRisks,
      }
    } catch (error) {
      console.error('Error calculating global risk:', error)
      return null
    }
  },

  // Récupérer les risques d'un projet
  async getRisks(projetId) {
    try {
      const { data, error } = await supabase
        .from('risques')
        .select('*')
        .eq('projet_id', projetId)
        .order('score', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error getting risks:', error)
      return { data: null, error }
    }
  },
}

