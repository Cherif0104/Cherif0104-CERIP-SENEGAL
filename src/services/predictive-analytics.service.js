import { supabase } from '@/lib/supabase'
import { analyticsService } from './analytics.service'
import { programmesService } from './programmes.service'
import { projetsService } from './projets.service'
import { candidaturesService } from './candidatures.service'
import { beneficiairesService } from './beneficiaires.service'

/**
 * Service d'analytics prédictif
 * Fournit des prévisions, tendances et recommandations intelligentes
 */
export const predictiveAnalyticsService = {
  /**
   * Prévoir la consommation budgétaire future
   */
  async predictBudgetConsumption(months = 6) {
    try {
      const kpis = await analyticsService.getGlobalKPIs()
      const { data: depenses } = await supabase
        .from('programme_depenses')
        .select('montant, date')
        .order('date', { ascending: false })
        .limit(12)

      if (!depenses || depenses.length === 0) {
        return {
          currentConsumption: kpis.budgetConsomme || 0,
          predictedConsumption: kpis.budgetConsomme || 0,
          monthlyAverage: 0,
          riskLevel: 'LOW',
          recommendations: ['Pas assez de données pour une prévision précise']
        }
      }

      // Calculer la moyenne mensuelle
      const monthlyData = this.groupByMonth(depenses)
      const monthlyAverage = monthlyData.reduce((sum, m) => sum + m.total, 0) / monthlyData.length

      // Prévision linéaire simple
      const predictedConsumption = kpis.budgetConsomme + (monthlyAverage * months)
      const budgetRemaining = kpis.budgetTotal - predictedConsumption
      const riskLevel = budgetRemaining < 0 ? 'CRITICAL' : 
                       budgetRemaining < (kpis.budgetTotal * 0.1) ? 'HIGH' :
                       budgetRemaining < (kpis.budgetTotal * 0.3) ? 'MEDIUM' : 'LOW'

      const recommendations = []
      if (riskLevel === 'CRITICAL') {
        recommendations.push('⚠️ Risque de dépassement budgétaire critique. Révision urgente nécessaire.')
        recommendations.push('🔍 Analyser les postes de dépenses les plus importants')
      } else if (riskLevel === 'HIGH') {
        recommendations.push('⚡ Risque de dépassement budgétaire élevé dans les prochains mois')
        recommendations.push('💰 Optimiser les dépenses en cours')
      }

      return {
        currentConsumption: kpis.budgetConsomme,
        predictedConsumption: Math.round(predictedConsumption),
        monthlyAverage: Math.round(monthlyAverage),
        budgetRemaining: Math.round(budgetRemaining),
        riskLevel,
        recommendations,
        monthlyProjection: Array.from({ length: months }, (_, i) => ({
          month: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000).toLocaleString('fr-FR', { month: 'short' }),
          predicted: Math.round(kpis.budgetConsomme + (monthlyAverage * (i + 1)))
        }))
      }
    } catch (error) {
      console.error('Error predicting budget:', error)
      return { error }
    }
  },

  /**
   * Prévoir le taux de conversion candidats → bénéficiaires
   */
  async predictConversionRate() {
    try {
      const kpis = await analyticsService.getGlobalKPIs()
      const { data: candidats } = await supabase
        .from('candidats')
        .select('id, created_at, statut_global')
        .order('created_at', { ascending: false })
        .limit(100)

      if (!candidats || candidats.length < 10) {
        return {
          currentRate: kpis.tauxConversion || 0,
          predictedRate: kpis.tauxConversion || 0,
          trend: 'STABLE',
          recommendations: ['Pas assez de données pour une prévision']
        }
      }

      // Analyser les tendances récentes
      const recentCandidats = candidats.slice(0, 50)
      const olderCandidats = candidats.slice(50)
      
      const recentConversion = recentCandidats.filter(c => 
        c.statut_global && ['BENEFICIAIRE', 'SELECTIONNE'].includes(c.statut_global)
      ).length / recentCandidats.length

      const olderConversion = olderCandidats.filter(c => 
        c.statut_global && ['BENEFICIAIRE', 'SELECTIONNE'].includes(c.statut_global)
      ).length / olderCandidats.length

      const trend = recentConversion > olderConversion ? 'UP' : 
                   recentConversion < olderConversion ? 'DOWN' : 'STABLE'
      
      const predictedRate = Math.round((recentConversion * 100 + kpis.tauxConversion) / 2)

      const recommendations = []
      if (trend === 'DOWN') {
        recommendations.push('📉 Le taux de conversion baisse. Analyser les critères de sélection')
        recommendations.push('🎯 Revoir les critères d\'éligibilité')
      } else if (trend === 'UP') {
        recommendations.push('📈 Tendance positive observée')
      }

      return {
        currentRate: kpis.tauxConversion,
        predictedRate,
        trend,
        recentConversion: Math.round(recentConversion * 100),
        recommendations
      }
    } catch (error) {
      console.error('Error predicting conversion:', error)
      return { error }
    }
  },

  /**
   * Identifier les risques projet
   */
  async identifyProjectRisks() {
    try {
      const { data: projets } = await projetsService.getAll(null, {
        filters: {},
        pagination: { page: 1, pageSize: 100 }
      })

      if (!projets || projets.length === 0) {
        return { risks: [], recommendations: [] }
      }

      const risks = []
      const now = new Date()

      for (const projet of projets) {
        let riskScore = 0
        const riskFactors = []

        // Risque de retard
        if (projet.date_fin) {
          const endDate = new Date(projet.date_fin)
          const daysRemaining = (endDate - now) / (1000 * 60 * 60 * 24)
          
          if (daysRemaining < 30 && projet.statut !== 'TERMINE') {
            riskScore += 30
            riskFactors.push(`⏰ Date de fin dans ${Math.round(daysRemaining)} jours`)
          }
        }

        // Risque budgétaire
        if (projet.budget_alloue && projet.budget_consomme) {
          const consumptionRate = (projet.budget_consomme / projet.budget_alloue) * 100
          if (consumptionRate > 90) {
            riskScore += 25
            riskFactors.push(`💰 Budget consommé à ${Math.round(consumptionRate)}%`)
          }
        }

        // Projet sans statut clair
        if (!projet.statut || projet.statut === 'BROUILLON') {
          riskScore += 15
          riskFactors.push('📋 Statut indéfini')
        }

        if (riskScore > 0) {
          risks.push({
            projetId: projet.id,
            projetNom: projet.nom || projet.code || 'Sans nom',
            riskScore: Math.min(riskScore, 100),
            riskLevel: riskScore > 50 ? 'HIGH' : riskScore > 25 ? 'MEDIUM' : 'LOW',
            factors: riskFactors
          })
        }
      }

      risks.sort((a, b) => b.riskScore - a.riskScore)

      const recommendations = []
      if (risks.filter(r => r.riskLevel === 'HIGH').length > 0) {
        recommendations.push('🚨 Actions urgentes requises pour les projets à haut risque')
      }
      if (risks.length > projets.length * 0.3) {
        recommendations.push('⚠️ Plus de 30% des projets présentent des risques')
      }

      return {
        risks: risks.slice(0, 10), // Top 10 risques
        totalRisks: risks.length,
        recommendations
      }
    } catch (error) {
      console.error('Error identifying risks:', error)
      return { error }
    }
  },

  /**
   * Recommandations intelligentes basées sur les données
   */
  async getSmartRecommendations() {
    try {
      const recommendations = []
      
      // Budget
      const budgetPrediction = await this.predictBudgetConsumption(3)
      if (budgetPrediction.recommendations) {
        recommendations.push(...budgetPrediction.recommendations.map(r => ({
          type: 'BUDGET',
          priority: budgetPrediction.riskLevel === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
          message: r
        })))
      }

      // Conversion
      const conversionPrediction = await this.predictConversionRate()
      if (conversionPrediction.recommendations) {
        recommendations.push(...conversionPrediction.recommendations.map(r => ({
          type: 'CONVERSION',
          priority: conversionPrediction.trend === 'DOWN' ? 'HIGH' : 'LOW',
          message: r
        })))
      }

      // Risques projet
      const risks = await this.identifyProjectRisks()
      if (risks.recommendations) {
        recommendations.push(...risks.recommendations.map(r => ({
          type: 'RISK',
          priority: 'MEDIUM',
          message: r
        })))
      }

      // Recommandations générales
      const kpis = await analyticsService.getGlobalKPIs()
      
      if (kpis.programmesActifs === 0) {
        recommendations.push({
          type: 'PROGRAMME',
          priority: 'HIGH',
          message: '🎯 Aucun programme actif. Créer un nouveau programme pour démarrer'
        })
      }

      if (kpis.projetsEnCours === 0) {
        recommendations.push({
          type: 'PROJET',
          priority: 'MEDIUM',
          message: '📦 Aucun projet en cours. Lancer un nouveau projet'
        })
      }

      return {
        recommendations: recommendations.slice(0, 10), // Top 10
        totalRecommendations: recommendations.length
      }
    } catch (error) {
      console.error('Error getting recommendations:', error)
      return { error, recommendations: [] }
    }
  },

  /**
   * Prévoir la croissance
   */
  async predictGrowth(metric = 'programmes', months = 6) {
    try {
      const historical = []
      
      // Simuler des données historiques (à remplacer par de vraies données si disponibles)
      for (let i = months; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        
        // Ici, vous pourriez charger de vraies données historiques
        historical.push({
          month: date.toLocaleString('fr-FR', { month: 'short', year: 'numeric' }),
          value: Math.floor(Math.random() * 10) + 5 // Placeholder
        })
      }

      // Calcul de tendance simple (régression linéaire)
      const trend = this.calculateTrend(historical)
      
      const predictions = Array.from({ length: months }, (_, i) => {
        const value = historical[historical.length - 1].value + (trend * (i + 1))
        return {
          month: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000)
            .toLocaleString('fr-FR', { month: 'short', year: 'numeric' }),
          value: Math.max(0, Math.round(value))
        }
      })

      return {
        historical,
        predictions,
        trend: trend > 0 ? 'UP' : trend < 0 ? 'DOWN' : 'STABLE',
        trendValue: Math.round(trend * 10) / 10
      }
    } catch (error) {
      console.error('Error predicting growth:', error)
      return { error }
    }
  },

  // Helpers
  groupByMonth(data) {
    const grouped = {}
    data.forEach(item => {
      const month = new Date(item.date).toLocaleString('fr-FR', { year: 'numeric', month: 'numeric' })
      if (!grouped[month]) {
        grouped[month] = { month, total: 0, count: 0 }
      }
      grouped[month].total += parseFloat(item.montant || 0)
      grouped[month].count += 1
    })
    return Object.values(grouped)
  },

  calculateTrend(data) {
    if (data.length < 2) return 0
    const n = data.length
    const sumX = data.reduce((sum, _, i) => sum + i, 0)
    const sumY = data.reduce((sum, d) => sum + d.value, 0)
    const sumXY = data.reduce((sum, d, i) => sum + i * d.value, 0)
    const sumXX = data.reduce((sum, _, i) => sum + i * i, 0)
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  }
}

