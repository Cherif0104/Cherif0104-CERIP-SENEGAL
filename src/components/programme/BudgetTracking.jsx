import { useState, useEffect } from 'react'
import { programmeBudgetService } from '../../services/programme-budget.service'
import { toastService } from '../../services/toast.service'
import Icon from '../common/Icon'
import LoadingState from '../common/LoadingState'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import './ProgrammeComponents.css'

export default function BudgetTracking({ programmeId, programmeBudget = null }) {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    if (programmeId) {
      loadSummary()
    }
  }, [programmeId])

  const loadSummary = async () => {
    setLoading(true)
    try {
      const { data, error } = await programmeBudgetService.getBudgetSummary(programmeId)
      if (error) {
        toastService.error('Erreur lors du chargement du résumé budgétaire')
      } else {
        setSummary(data)
        
        // Préparer les données pour le graphique
        if (data && data.lignes) {
          const chart = data.lignes.map(line => ({
            name: line.libelle,
            alloue: parseFloat(line.budget_alloue || 0),
            engage: parseFloat(line.budget_engage || 0),
            depense: parseFloat(line.budget_depense || 0),
            disponible: parseFloat(line.budget_alloue || 0) - parseFloat(line.budget_engage || 0) - parseFloat(line.budget_depense || 0)
          }))
          setChartData(chart)
        }
      }
    } catch (error) {
      console.error('Error loading budget summary:', error)
      toastService.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
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

  const calculatePercentage = (value, total) => {
    if (!total || total === 0) return 0
    return ((value / total) * 100).toFixed(1)
  }

  if (loading) {
    return <LoadingState message="Chargement du suivi budgétaire..." />
  }

  if (!summary) {
    return (
      <div className="empty-state">
        <Icon name="DollarSign" size={32} />
        <p>Aucune donnée budgétaire disponible</p>
      </div>
    )
  }

  const tauxExecution = summary.total_alloue > 0 
    ? calculatePercentage(summary.total_depense, summary.total_alloue)
    : 0

  const tauxEngagement = summary.total_alloue > 0
    ? calculatePercentage(summary.total_engage, summary.total_alloue)
    : 0

  return (
    <div className="budget-tracking">
      <div className="budget-summary-cards">
        <div className="summary-card">
          <div className="summary-card-header">
            <Icon name="DollarSign" size={24} />
            <h4>Budget alloué</h4>
          </div>
          <div className="summary-card-value">
            {formatCurrency(summary.total_alloue)}
          </div>
          {programmeBudget && (
            <div className="summary-card-note">
              Budget programme: {formatCurrency(programmeBudget)}
            </div>
          )}
        </div>

        <div className="summary-card">
          <div className="summary-card-header">
            <Icon name="FileCheck" size={24} />
            <h4>Budget engagé</h4>
          </div>
          <div className="summary-card-value">
            {formatCurrency(summary.total_engage)}
          </div>
          <div className="summary-card-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill progress-fill--warning"
                style={{ width: `${tauxEngagement}%` }}
              />
            </div>
            <span>{tauxEngagement}%</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-header">
            <Icon name="Receipt" size={24} />
            <h4>Budget dépensé</h4>
          </div>
          <div className="summary-card-value">
            {formatCurrency(summary.total_depense)}
          </div>
          <div className="summary-card-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill progress-fill--primary"
                style={{ width: `${tauxExecution}%` }}
              />
            </div>
            <span>{tauxExecution}%</span>
          </div>
        </div>

        <div className={`summary-card ${summary.total_disponible < 0 ? 'summary-card--danger' : summary.total_disponible === 0 ? 'summary-card--warning' : 'summary-card--success'}`}>
          <div className="summary-card-header">
            <Icon name={summary.total_disponible < 0 ? 'AlertTriangle' : 'CheckCircle'} size={24} />
            <h4>Budget disponible</h4>
          </div>
          <div className="summary-card-value">
            {formatCurrency(summary.total_disponible)}
          </div>
          <div className="summary-card-note">
            {summary.total_disponible < 0 
              ? 'Dépassement budgétaire' 
              : summary.total_disponible === 0 
                ? 'Budget épuisé'
                : 'En cours d\'exécution'
            }
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="budget-chart">
          <h4>Répartition par ligne budgétaire</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                fontSize={12}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                labelStyle={{ color: '#333' }}
              />
              <Bar dataKey="alloue" fill="#3b82f6" name="Alloué" />
              <Bar dataKey="engage" fill="#f59e0b" name="Engagé" />
              <Bar dataKey="depense" fill="#10b981" name="Dépensé" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {summary.lignes && summary.lignes.length > 0 && (
        <div className="budget-details">
          <h4>Détail par ligne</h4>
          <div className="budget-details-list">
            {summary.lignes.map((line) => {
              const disponible = parseFloat(line.budget_alloue || 0) - 
                                parseFloat(line.budget_engage || 0) - 
                                parseFloat(line.budget_depense || 0)
              const tauxLigne = parseFloat(line.budget_alloue || 0) > 0
                ? calculatePercentage(parseFloat(line.budget_depense || 0), parseFloat(line.budget_alloue || 0))
                : 0

              return (
                <div key={line.id} className="budget-detail-item">
                  <div className="budget-detail-header">
                    <div>
                      <strong>{line.libelle}</strong>
                      <span className="budget-detail-code">{line.code_ligne}</span>
                    </div>
                    <span className={`badge ${disponible < 0 ? 'badge--danger' : disponible === 0 ? 'badge--warning' : 'badge--success'}`}>
                      {formatCurrency(disponible)} disponible
                    </span>
                  </div>
                  <div className="budget-detail-values">
                    <div className="budget-detail-value">
                      <span className="label">Alloué:</span>
                      <span>{formatCurrency(line.budget_alloue)}</span>
                    </div>
                    <div className="budget-detail-value">
                      <span className="label">Engagé:</span>
                      <span>{formatCurrency(line.budget_engage)}</span>
                    </div>
                    <div className="budget-detail-value">
                      <span className="label">Dépensé:</span>
                      <span>{formatCurrency(line.budget_depense)}</span>
                    </div>
                  </div>
                  <div className="budget-detail-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${tauxLigne}%` }}
                      />
                    </div>
                    <span>{tauxLigne}% exécuté</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

