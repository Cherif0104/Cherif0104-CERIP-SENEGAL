import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/common/Icon'
import { Button } from '@/components/common/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { analyticsService } from '@/services/analytics.service'
import { predictiveAnalyticsService } from '@/services/predictive-analytics.service'
import { RecommendationsWidget } from '@/components/dashboard/RecommendationsWidget'
import { PredictiveChart } from '@/components/dashboard/PredictiveChart'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const [kpis, setKpis] = useState(null)
  const [budgetPrediction, setBudgetPrediction] = useState(null)
  const [projectRisks, setProjectRisks] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [kpisData, budgetPred, risks] = await Promise.all([
        analyticsService.getGlobalKPIs(),
        predictiveAnalyticsService.predictBudgetConsumption(6).catch(() => null),
        predictiveAnalyticsService.identifyProjectRisks().catch(() => null)
      ])
      setKpis(kpisData)
      setBudgetPrediction(budgetPred)
      setProjectRisks(risks)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingState message="Chargement du tableau de bord..." />
  }

  const chartData = [
    { name: 'Jan', programmes: kpis?.programmesActifs || 0, projets: kpis?.projetsEnCours || 0 },
    { name: 'Fév', programmes: 5, projets: 12 },
    { name: 'Mar', programmes: 7, projets: 15 },
    { name: 'Avr', programmes: 8, projets: 18 },
    { name: 'Mai', programmes: 10, projets: 20 },
    { name: 'Juin', programmes: kpis?.programmesActifs || 0, projets: kpis?.projetsEnCours || 0 },
  ]

  const budgetData = [
    { name: 'Budget', alloué: parseFloat(kpis?.budgetTotal) || 0, consommé: parseFloat(kpis?.budgetConsomme || 0) },
  ]

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'HIGH': return '#dc2626'
      case 'MEDIUM': return '#f59e0b'
      case 'LOW': return '#10b981'
      default: return '#6b7280'
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Tableau de bord</h1>
          <p className="dashboard-subtitle">Vue d'ensemble et analytics prédictifs</p>
        </div>
        <div className="dashboard-header-actions">
          <Button onClick={() => navigate('/programmes/new')} variant="primary">
            <Icon name="Plus" size={16} />
            Nouveau programme
          </Button>
          <Button onClick={() => navigate('/projets/new')} variant="secondary">
            <Icon name="Plus" size={16} />
            Nouveau projet
          </Button>
          <button onClick={loadAllData} className="dashboard-refresh">
            <Icon name="RefreshCw" size={18} />
            Actualiser
          </button>
        </div>
      </div>

      {/* KPIs Principaux */}
      <div className="dashboard-kpis">
        <div className="kpi-card-modern">
          <div className="kpi-card-header">
            <div className="kpi-card-icon primary">
              <Icon name="FolderKanban" size={24} />
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/programmes')}
              className="kpi-card-action"
            >
              Voir
            </Button>
          </div>
          <div className="kpi-card-value">{kpis?.programmesActifs || 0}</div>
          <div className="kpi-card-label">Programmes actifs</div>
        </div>

        <div className="kpi-card-modern">
          <div className="kpi-card-header">
            <div className="kpi-card-icon secondary">
              <Icon name="Briefcase" size={24} />
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/projets')}
              className="kpi-card-action"
            >
              Voir
            </Button>
          </div>
          <div className="kpi-card-value">{kpis?.projetsEnCours || 0}</div>
          <div className="kpi-card-label">Projets en cours</div>
        </div>

        <div className="kpi-card-modern">
          <div className="kpi-card-header">
            <div className="kpi-card-icon accent">
              <Icon name="DollarSign" size={24} />
            </div>
            <div className={`kpi-card-risk ${budgetPrediction?.riskLevel?.toLowerCase() || 'low'}`}>
              {budgetPrediction?.riskLevel === 'CRITICAL' && <Icon name="AlertTriangle" size={14} />}
              {budgetPrediction?.riskLevel || 'LOW'}
            </div>
          </div>
          <div className="kpi-card-value">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XOF',
              minimumFractionDigits: 0,
            }).format(parseFloat(kpis?.budgetTotal) || 0)}
          </div>
          <div className="kpi-card-label">Budget total</div>
          {budgetPrediction && (
            <div className="kpi-card-prediction">
              Prévision 6 mois: {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'XOF',
                minimumFractionDigits: 0,
              }).format(budgetPrediction.predictedConsumption)}
            </div>
          )}
        </div>

        <div className="kpi-card-modern">
          <div className="kpi-card-header">
            <div className="kpi-card-icon success">
              <Icon name="UserCheck" size={24} />
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/candidatures')}
              className="kpi-card-action"
            >
              Voir
            </Button>
          </div>
          <div className="kpi-card-value">{kpis?.tauxConversion || 0}%</div>
          <div className="kpi-card-label">Taux de conversion</div>
        </div>
      </div>

      {/* Recommandations et Risques */}
      <div className="dashboard-widgets-row">
        <RecommendationsWidget />
        
        {projectRisks && projectRisks.risks && projectRisks.risks.length > 0 && (
          <div className="risks-widget">
            <div className="risks-widget-header">
              <Icon name="AlertTriangle" size={20} />
              <h3>Risques Projets</h3>
            </div>
            <div className="risks-list">
              {projectRisks.risks.slice(0, 5).map((risk, index) => (
                <div key={index} className="risk-item">
                  <div className="risk-indicator" style={{ backgroundColor: getRiskLevelColor(risk.riskLevel) }}></div>
                  <div className="risk-content">
                    <div className="risk-title">{risk.projetNom}</div>
                    <div className="risk-factors">
                      {risk.factors.map((factor, i) => (
                        <span key={i} className="risk-factor">{factor}</span>
                      ))}
                    </div>
                  </div>
                  <div className="risk-score">{risk.riskScore}%</div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/projets?tab=risques')}
              className="view-all-risks"
            >
              Voir tous les risques
            </Button>
          </div>
        )}
      </div>

      {/* Graphiques */}
      <div className="dashboard-charts">
        <div className="dashboard-chart-card">
          <h3 className="dashboard-chart-title">Évolution Programmes & Projets</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="programmes" stroke="#dc2626" name="Programmes" strokeWidth={2} />
              <Line type="monotone" dataKey="projets" stroke="#2563eb" name="Projets" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-chart-card">
          <h3 className="dashboard-chart-title">Budget Alloué vs Consommé</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="alloué" fill="#dc2626" name="Budget alloué" />
              <Bar dataKey="consommé" fill="#10b981" name="Budget consommé" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Prévisions Prédictives */}
      {budgetPrediction && budgetPrediction.monthlyProjection && (
        <div className="dashboard-charts">
          <div className="dashboard-chart-card">
            <h3 className="dashboard-chart-title">Prévision Budget (6 mois)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={budgetPrediction.monthlyProjection}>
                <defs>
                  <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                  minimumFractionDigits: 0,
                }).format(value)} />
                <Area 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#dc2626" 
                  fillOpacity={1} 
                  fill="url(#budgetGradient)"
                  name="Budget prévu"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="chart-notes">
              <Icon name="Info" size={14} />
              <span>Basé sur la consommation moyenne mensuelle</span>
            </div>
          </div>

          <PredictiveChart title="Prévision Programmes" metric="programmes" />
        </div>
      )}

      {/* Métriques Détaillées */}
      <div className="dashboard-metrics">
        <div className="metric-card-modern">
          <div className="metric-card-header">
            <span className="metric-card-title">Budget consommé</span>
            {budgetPrediction && (
              <span className={`risk-badge risk-${budgetPrediction.riskLevel?.toLowerCase()}`}>
                {budgetPrediction.riskLevel}
              </span>
            )}
          </div>
          <div className="metric-card-value">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XOF',
              minimumFractionDigits: 0,
            }).format(parseFloat(kpis?.budgetConsomme || 0))}
          </div>
          <div className="metric-card-detail">
            Sur {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XOF',
              minimumFractionDigits: 0,
            }).format(parseFloat(kpis?.budgetTotal || 0))}
          </div>
          <div className="metric-card-progress">
            <div
              className="metric-card-progress-bar"
              style={{
                width: `${parseFloat(kpis?.budgetTotal || 0) > 0
                  ? Math.round((parseFloat(kpis.budgetConsomme || 0) / parseFloat(kpis.budgetTotal)) * 100)
                  : 0}%`,
              }}
            />
          </div>
          {budgetPrediction && budgetPrediction.budgetRemaining !== undefined && (
            <div className="metric-card-footer">
              Reste: {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'XOF',
                minimumFractionDigits: 0,
              }).format(budgetPrediction.budgetRemaining)}
            </div>
          )}
        </div>

        <div className="metric-card-modern">
          <div className="metric-card-header">
            <span className="metric-card-title">Candidats</span>
          </div>
          <div className="metric-card-value">{kpis?.candidatsTotal || 0}</div>
          <div className="metric-card-detail">Total des candidats enregistrés</div>
          <div className="metric-card-progress">
            <div
              className="metric-card-progress-bar"
              style={{ width: '75%' }}
            />
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/candidatures')}
            className="metric-card-action"
          >
            Voir les candidatures →
          </Button>
        </div>

        <div className="metric-card-modern">
          <div className="metric-card-header">
            <span className="metric-card-title">Bénéficiaires</span>
          </div>
          <div className="metric-card-value">{kpis?.beneficiairesTotal || 0}</div>
          <div className="metric-card-detail">Total des bénéficiaires actifs</div>
          <div className="metric-card-progress">
            <div
              className="metric-card-progress-bar"
              style={{ width: '68%' }}
            />
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/beneficiaires')}
            className="metric-card-action"
          >
            Voir les bénéficiaires →
          </Button>
        </div>
      </div>
    </div>
  )
}
