import { useState, useEffect } from 'react'
import { programmeBudgetService } from '../../services/programme-budget.service'
import { programmeFinancementsService } from '../../services/programme-financements.service'
import { programmeIndicateursService } from '../../services/programme-indicateurs.service'
import { programmeJalonsService } from '../../services/programme-jalons.service'
import { programmeDocumentsService } from '../../services/programme-documents.service'
import { programmeRapportsService } from '../../services/programme-rapports.service'
import { toastService } from '../../services/toast.service'
import Icon from '../common/Icon'
import LoadingState from '../common/LoadingState'
import './ProgrammeComponents.css'

export default function ProgrammeDashboard({ programmeId, programme }) {
  const [loading, setLoading] = useState(true)
  const [riskScore, setRiskScore] = useState(0) // 0-100, 0 = aucun risque, 100 = risque critique
  const [riskLevel, setRiskLevel] = useState('LOW') // LOW, MEDIUM, HIGH, CRITICAL
  const [riskMatrix, setRiskMatrix] = useState([])
  const [criticalActions, setCriticalActions] = useState([])
  const [budgetSummary, setBudgetSummary] = useState(null)
  const [financementsSummary, setFinancementsSummary] = useState(null)
  const [indicateurs, setIndicateurs] = useState([])
  const [jalonsAvancement, setJalonsAvancement] = useState(null)
  const [documentsCount, setDocumentsCount] = useState(0)
  const [rapportsCount, setRapportsCount] = useState(0)

  useEffect(() => {
    if (programmeId) {
      loadAllData()
    }
  }, [programmeId])

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [
        budgetRes,
        financementsRes,
        indicateursRes,
        jalonsRes,
        documentsRes,
        rapportsRes
      ] = await Promise.all([
        programmeBudgetService.getBudgetSummary(programmeId),
        programmeFinancementsService.getSummary(programmeId),
        programmeIndicateursService.getIndicateurs(programmeId),
        programmeJalonsService.getAvancement(programmeId),
        programmeDocumentsService.getAll(programmeId),
        programmeRapportsService.getRapports(programmeId)
      ])

      if (!budgetRes.error) setBudgetSummary(budgetRes.data)
      if (!financementsRes.error) setFinancementsSummary(financementsRes.data)
      if (!indicateursRes.error) setIndicateurs(indicateursRes.data || [])
      if (!jalonsRes.error) setJalonsAvancement(jalonsRes.data)
      if (!documentsRes.error) setDocumentsCount(documentsRes.data?.length || 0)
      if (!rapportsRes.error) setRapportsCount(rapportsRes.data?.length || 0)

      // Calculer le score de risque global
      calculateRiskScore(budgetRes.data, financementsRes.data, jalonsRes.data, indicateursRes.data, documentsRes.data, rapportsRes.data)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toastService.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const getRiskLevel = (score) => {
    if (score >= 75) return 'CRITICAL'
    if (score >= 50) return 'HIGH'
    if (score >= 25) return 'MEDIUM'
    return 'LOW'
  }

  const getRiskColor = (score) => {
    if (score >= 75) return '#ef4444' // Rouge
    if (score >= 50) return '#f59e0b' // Orange
    if (score >= 25) return '#eab308' // Jaune
    return '#10b981' // Vert
  }

  const calculateRiskScore = (budget, financements, jalons, indicateurs, documents, rapports) => {
    let totalRisk = 0
    let riskCount = 0
    const risks = []

    // 1. RISQUE BUDGÉTAIRE (Poids: 30%)
    if (budget) {
      const tauxEngagement = budget.total_alloue > 0 
        ? (budget.total_engage / budget.total_alloue) * 100 
        : 0
      const tauxDepense = budget.total_alloue > 0 
        ? (budget.total_depense / budget.total_alloue) * 100 
        : 0
      
      let budgetRisk = 0
      if (budget.total_disponible < 0) {
        budgetRisk = 100
      } else if (tauxDepense > 90) {
        budgetRisk = 90
      } else if (tauxDepense > 75) {
        budgetRisk = 70
      } else if (tauxEngagement > 90) {
        budgetRisk = 60
      } else if (tauxEngagement > 75) {
        budgetRisk = 40
      } else if (tauxDepense > 50) {
        budgetRisk = 20
      }

      totalRisk += budgetRisk * 0.3
      riskCount += 0.3
      risks.push({
        category: 'Budget',
        score: budgetRisk,
        level: getRiskLevel(budgetRisk),
        icon: 'DollarSign',
        color: getRiskColor(budgetRisk),
        details: budget.total_disponible < 0 
          ? 'Budget dépassé' 
          : `Dépensé: ${tauxDepense.toFixed(1)}% | Engagé: ${tauxEngagement.toFixed(1)}%`
      })
    }

    // 2. RISQUE JALONS (Poids: 25%)
    if (jalons) {
      let jalonsRisk = 0
      if (jalons.jalons_retardes > 0 && jalons.total_jalons > 0) {
        const pourcentageRetard = (jalons.jalons_retardes / jalons.total_jalons) * 100
        jalonsRisk = Math.min(100, pourcentageRetard + 30)
      } else if (jalons.taux_avancement < 50) {
        jalonsRisk = 50
      } else if (jalons.taux_avancement < 70) {
        jalonsRisk = 30
      }

      totalRisk += jalonsRisk * 0.25
      riskCount += 0.25
      risks.push({
        category: 'Jalons',
        score: jalonsRisk,
        level: getRiskLevel(jalonsRisk),
        icon: 'Calendar',
        color: getRiskColor(jalonsRisk),
        details: jalons.jalons_retardes > 0
          ? `${jalons.jalons_retardes} jalons en retard`
          : `Avancement: ${jalons.taux_avancement?.toFixed(1) || 0}%`
      })
    }

    // 3. RISQUE FINANCEMENTS (Poids: 20%)
    if (financements && financements.total_attendu > 0) {
      const tauxRecu = (financements.total_recu / financements.total_attendu) * 100
      const financementRisk = tauxRecu < 50 ? 80 
        : tauxRecu < 70 ? 50 
        : tauxRecu < 85 ? 30 
        : 0

      totalRisk += financementRisk * 0.2
      riskCount += 0.2
      risks.push({
        category: 'Financements',
        score: financementRisk,
        level: getRiskLevel(financementRisk),
        icon: 'TrendingUp',
        color: getRiskColor(financementRisk),
        details: `${tauxRecu.toFixed(1)}% reçus (${formatCurrency(financements.total_recu)} / ${formatCurrency(financements.total_attendu)})`
      })
    }

    // 4. RISQUE INDICATEURS (Poids: 15%)
    if (indicateurs && indicateurs.length > 0) {
      // Calculer le risque basé sur les indicateurs avec mesures
      let indicateursRisk = 0
      let indicateursAvecMesures = 0
      let indicateursEnRetard = 0

      // Pour chaque indicateur, vérifier s'il y a des mesures et calculer l'écart
      for (const ind of indicateurs) {
        if (ind.type === 'QUANTITATIF' && ind.cible && ind.cible > 0) {
          indicateursAvecMesures++
          // Ici on devrait charger les mesures, pour l'instant on utilise une valeur par défaut
          // Dans une vraie implémentation, on chargerait les mesures et calculerait l'écart
        }
      }

      // Si moins de 50% des indicateurs ont des mesures, c'est un risque
      if (indicateursAvecMesures < indicateurs.length * 0.5) {
        indicateursRisk = 40
      }

      totalRisk += indicateursRisk * 0.15
      riskCount += 0.15
      risks.push({
        category: 'Indicateurs',
        score: indicateursRisk,
        level: getRiskLevel(indicateursRisk),
        icon: 'BarChart',
        color: getRiskColor(indicateursRisk),
        details: `${indicateurs.length} indicateurs suivis`
      })
    }

    // 5. RISQUE CONFORMITÉ (Poids: 10%) - Documents, rapports
    let conformiteRisk = 0
    // Si pas de documents ou pas de rapports récents, c'est un risque faible
    if (documents && documents.length === 0) {
      conformiteRisk = 20
    }
    if (rapports && rapports.length === 0) {
      conformiteRisk = Math.max(conformiteRisk, 15)
    }

    totalRisk += conformiteRisk * 0.1
    riskCount += 0.1
    risks.push({
      category: 'Conformité',
      score: conformiteRisk,
      level: getRiskLevel(conformiteRisk),
      icon: 'FileCheck',
      color: getRiskColor(conformiteRisk),
      details: `${documents?.length || 0} documents, ${rapports?.length || 0} rapports`
    })

    const finalScore = riskCount > 0 ? totalRisk / riskCount : 0
    setRiskScore(Math.round(finalScore))
    setRiskLevel(getRiskLevel(finalScore))
    setRiskMatrix(risks)

    // Générer les actions critiques
    generateCriticalActions(risks, budget, jalons, financements)
  }

  const generateCriticalActions = (risks, budget, jalons, financements) => {
    const actions = []
    
    // Actions prioritaires basées sur les risques
    risks.forEach(risk => {
      if (risk.score >= 50) {
        actions.push({
          priority: risk.score >= 75 ? 'URGENT' : 'HAUTE',
          category: risk.category,
          action: getActionForRisk(risk),
          impact: risk.score >= 75 ? 'Critique' : 'Élevé',
          icon: risk.icon,
          color: risk.color
        })
      }
    })

    // Actions spécifiques
    if (budget && budget.total_disponible < 0) {
      actions.push({
        priority: 'URGENT',
        category: 'Budget',
        action: 'Arrêter immédiatement les nouvelles dépenses',
        impact: 'Critique',
        icon: 'AlertTriangle',
        color: '#ef4444'
      })
    }

    if (jalons && jalons.jalons_retardes > 0) {
      actions.push({
        priority: 'HAUTE',
        category: 'Jalons',
        action: `Réviser ${jalons.jalons_retardes} jalon(s) en retard`,
        impact: 'Élevé',
        icon: 'Clock',
        color: '#f59e0b'
      })
    }

    if (financements && financements.total_attendu > financements.total_recu) {
      const montantManquant = financements.total_attendu - financements.total_recu
      if (montantManquant > financements.total_attendu * 0.3) {
        actions.push({
          priority: 'HAUTE',
          category: 'Financements',
          action: `Suivre ${formatCurrency(montantManquant)} de financements en attente`,
          impact: 'Élevé',
          icon: 'TrendingUp',
          color: '#f59e0b'
        })
      }
    }

    setCriticalActions(actions.sort((a, b) => {
      const priorityOrder = { 'URGENT': 0, 'HAUTE': 1, 'MOYENNE': 2, 'FAIBLE': 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }))
  }

  const getActionForRisk = (risk) => {
    switch (risk.category) {
      case 'Budget':
        return 'Réviser le budget et contrôler les dépenses'
      case 'Jalons':
        return 'Accélérer les activités ou réviser les échéances'
      case 'Financements':
        return 'Suivre les financements en attente'
      case 'Indicateurs':
        return 'Analyser les écarts de performance'
      case 'Conformité':
        return 'Mettre à jour les documents et rapports'
      default:
        return 'Action corrective requise'
    }
  }

  const formatCurrency = (amount) => {
    if (!amount) return '0 FCFA'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return <LoadingState message="Analyse des risques en cours..." />
  }

  const riskColor = getRiskColor(riskScore)
  const riskLevelLabel = riskLevel === 'CRITICAL' ? 'CRITIQUE' : 
                         riskLevel === 'HIGH' ? 'ÉLEVÉ' :
                         riskLevel === 'MEDIUM' ? 'MOYEN' : 'FAIBLE'
  const riskStatusText = riskLevel === 'CRITICAL' ? '⚠️ Action immédiate requise' :
                         riskLevel === 'HIGH' ? '⚠️ Attention nécessaire' :
                         riskLevel === 'MEDIUM' ? '⚡ Surveillance recommandée' :
                         '✅ Situation sous contrôle'

  return (
    <div className="risk-dashboard">
      {/* SCORE DE RISQUE GLOBAL - VUE IMMÉDIATE */}
      <div className="risk-score-hero" style={{ '--risk-color': riskColor }}>
        <div className="risk-score-circle" style={{ '--risk-score': riskScore }}>
          <div className="risk-score-inner">
            <div className="risk-score-value" style={{ color: riskColor }}>{riskScore}</div>
            <div className="risk-score-label">Score de Risque</div>
            <div className={`risk-level-badge risk-level--${riskLevel.toLowerCase()}`}>
              {riskLevelLabel}
            </div>
          </div>
        </div>
        <div className="risk-summary">
          <h2>État du Programme</h2>
          <p className="risk-status-text">{riskStatusText}</p>
          {programme && (
            <div className="programme-name">{programme.nom}</div>
          )}
        </div>
      </div>

      {/* ACTIONS CRITIQUES - PRIORITÉS */}
      {criticalActions.length > 0 && (
        <div className="critical-actions-panel">
          <div className="panel-header">
            <Icon name="AlertTriangle" size={24} />
            <h3>Actions Prioritaires</h3>
            <span className="action-count">{criticalActions.length}</span>
          </div>
          <div className="actions-list">
            {criticalActions.slice(0, 3).map((action, index) => (
              <div key={index} className="action-card" style={{ borderLeftColor: action.color }}>
                <div className="action-priority" style={{ backgroundColor: action.color }}>
                  {action.priority}
                </div>
                <div className="action-content">
                  <div className="action-category">
                    <Icon name={action.icon} size={16} />
                    {action.category}
                  </div>
                  <div className="action-text">{action.action}</div>
                  <div className="action-impact">Impact: {action.impact}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MATRICE DE RISQUE - VUE DÉTAILLÉE */}
      <div className="risk-matrix-panel">
        <h3>Analyse des Risques par Domaine</h3>
        <div className="risk-matrix-grid">
          {riskMatrix.map((risk, index) => (
            <div key={index} className="risk-card" style={{ borderTopColor: risk.color }}>
              <div className="risk-card-header">
                <Icon name={risk.icon} size={20} />
                <span className="risk-category">{risk.category}</span>
                <span className={`risk-badge risk-badge--${risk.level.toLowerCase()}`}>
                  {risk.level}
                </span>
              </div>
              <div className="risk-score-bar">
                <div 
                  className="risk-score-fill" 
                  style={{ 
                    width: `${risk.score}%`, 
                    backgroundColor: risk.color 
                  }}
                />
              </div>
              <div className="risk-details">{risk.details}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MÉTRIQUES DE DÉCISION - KPIs RAPIDES */}
      <div className="decision-metrics">
        <h3>Métriques de Décision</h3>
        <div className="metrics-grid">
          <div className="metric-card metric-card--budget">
            <div className="metric-icon">
              <Icon name="DollarSign" size={24} />
            </div>
            <div className="metric-content">
              <div className="metric-label">Budget Disponible</div>
              <div className="metric-value">
                {formatCurrency(budgetSummary?.total_disponible || 0)}
              </div>
              <div className="metric-trend">
                {budgetSummary && budgetSummary.total_alloue > 0 && (
                  <>
                    {((budgetSummary.total_disponible / budgetSummary.total_alloue) * 100).toFixed(1)}% restant
                    {budgetSummary.total_disponible < 0 && (
                      <span className="trend-negative"> - Budget dépassé</span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="metric-card metric-card--jalons">
            <div className="metric-icon">
              <Icon name="Calendar" size={24} />
            </div>
            <div className="metric-content">
              <div className="metric-label">Avancement</div>
              <div className="metric-value">
                {jalonsAvancement?.taux_avancement?.toFixed(0) || 0}%
              </div>
              <div className="metric-trend">
                {jalonsAvancement?.jalons_retardes > 0 && (
                  <span className="trend-negative">
                    {jalonsAvancement.jalons_retardes} retard(s)
                  </span>
                )}
                {jalonsAvancement && jalonsAvancement.jalons_retardes === 0 && (
                  <span>{jalonsAvancement.jalons_atteints}/{jalonsAvancement.total_jalons} jalons atteints</span>
                )}
              </div>
            </div>
          </div>

          <div className="metric-card metric-card--financements">
            <div className="metric-icon">
              <Icon name="TrendingUp" size={24} />
            </div>
            <div className="metric-content">
              <div className="metric-label">Financements</div>
              <div className="metric-value">
                {financementsSummary && financementsSummary.total_attendu > 0
                  ? `${((financementsSummary.total_recu / financementsSummary.total_attendu) * 100).toFixed(0)}%`
                  : '0%'}
              </div>
              <div className="metric-trend">
                {formatCurrency(financementsSummary?.total_recu || 0)} reçus
                {financementsSummary && financementsSummary.total_attendu > financementsSummary.total_recu && (
                  <span className="trend-negative">
                    {' '}/ {formatCurrency(financementsSummary.total_attendu - financementsSummary.total_recu)} en attente
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
