import { useState, useEffect } from 'react'
import { programmeBudgetService } from '../../services/programme-budget.service'
import Icon from '../common/Icon'
import './ProgrammeComponents.css'

export default function BudgetAlerts({ programmeId }) {
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    if (programmeId) {
      checkAlerts()
    }
  }, [programmeId])

  const checkAlerts = async () => {
    try {
      const { data: summary, error } = await programmeBudgetService.getBudgetSummary(programmeId)
      if (error || !summary) {
        return
      }

      const newAlerts = []

      // Alerte dépassement budgétaire global
      if (summary.total_disponible < 0) {
        newAlerts.push({
          type: 'danger',
          icon: 'AlertTriangle',
          title: 'Dépassement budgétaire',
          message: `Le budget disponible est négatif: ${formatCurrency(summary.total_disponible)}`,
          severity: 'high'
        })
      }

      // Alerte budget épuisé
      if (summary.total_disponible === 0 && summary.total_alloue > 0) {
        newAlerts.push({
          type: 'warning',
          icon: 'AlertCircle',
          title: 'Budget épuisé',
          message: 'Le budget disponible est à zéro. Aucune nouvelle dépense ne peut être engagée.',
          severity: 'medium'
        })
      }

      // Alerte taux d'engagement élevé (> 80%)
      const tauxEngagement = summary.total_alloue > 0
        ? (summary.total_engage / summary.total_alloue) * 100
        : 0

      if (tauxEngagement > 80 && tauxEngagement <= 100) {
        newAlerts.push({
          type: 'warning',
          icon: 'TrendingUp',
          title: 'Taux d\'engagement élevé',
          message: `${tauxEngagement.toFixed(1)}% du budget est déjà engagé. Attention aux dépassements.`,
          severity: 'medium'
        })
      }

      // Alerte taux d'exécution faible (< 20% alors que le programme est en cours)
      const tauxExecution = summary.total_alloue > 0
        ? (summary.total_depense / summary.total_alloue) * 100
        : 0

      if (tauxExecution < 20 && summary.total_alloue > 0) {
        newAlerts.push({
          type: 'info',
          icon: 'Info',
          title: 'Exécution budgétaire faible',
          message: `Seulement ${tauxExecution.toFixed(1)}% du budget a été dépensé. Vérifiez l'avancement du programme.`,
          severity: 'low'
        })
      }

      // Alertes par ligne budgétaire
      if (summary.lignes) {
        summary.lignes.forEach(line => {
          const alloue = parseFloat(line.budget_alloue || 0)
          const engage = parseFloat(line.budget_engage || 0)
          const depense = parseFloat(line.budget_depense || 0)
          const disponible = alloue - engage - depense

          // Ligne en dépassement
          if (disponible < 0) {
            newAlerts.push({
              type: 'danger',
              icon: 'AlertTriangle',
              title: `Dépassement: ${line.libelle}`,
              message: `La ligne "${line.code_ligne}" a un budget disponible négatif: ${formatCurrency(disponible)}`,
              severity: 'high',
              ligneId: line.id
            })
          }

          // Ligne épuisée
          if (disponible === 0 && alloue > 0) {
            newAlerts.push({
              type: 'warning',
              icon: 'AlertCircle',
              title: `Budget épuisé: ${line.libelle}`,
              message: `La ligne "${line.code_ligne}" n'a plus de budget disponible.`,
              severity: 'medium',
              ligneId: line.id
            })
          }

          // Taux d'engagement élevé par ligne (> 90%)
          const tauxLigne = alloue > 0 ? (engage / alloue) * 100 : 0
          if (tauxLigne > 90 && tauxLigne <= 100) {
            newAlerts.push({
              type: 'warning',
              icon: 'TrendingUp',
              title: `Engagement élevé: ${line.libelle}`,
              message: `${tauxLigne.toFixed(1)}% du budget de la ligne "${line.code_ligne}" est engagé.`,
              severity: 'medium',
              ligneId: line.id
            })
          }
        })
      }

      setAlerts(newAlerts)
    } catch (error) {
      console.error('Error checking budget alerts:', error)
    }
  }

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '0'
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  if (alerts.length === 0) {
    return (
      <div className="budget-alerts budget-alerts--empty">
        <Icon name="CheckCircle" size={24} />
        <p>Aucune alerte budgétaire</p>
      </div>
    )
  }

  // Trier les alertes par sévérité
  const sortedAlerts = alerts.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 }
    return severityOrder[b.severity] - severityOrder[a.severity]
  })

  return (
    <div className="budget-alerts">
      <h4>Alertes budgétaires</h4>
      <div className="alerts-list">
        {sortedAlerts.map((alert, index) => (
          <div key={index} className={`alert alert--${alert.type}`}>
            <div className="alert-icon">
              <Icon name={alert.icon} size={20} />
            </div>
            <div className="alert-content">
              <div className="alert-title">{alert.title}</div>
              <div className="alert-message">{alert.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

