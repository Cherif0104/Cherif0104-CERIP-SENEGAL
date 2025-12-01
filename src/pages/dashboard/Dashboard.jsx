import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/common/Icon'
import { Button } from '@/components/common/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { analyticsService } from '@/services/analytics.service'
import { predictiveAnalyticsService } from '@/services/predictive-analytics.service'
import { RecommendationsWidget } from '@/components/dashboard/RecommendationsWidget'
import { KPIDonut } from '@/components/modules/KPIDonut'
import { DonutChart } from '@/components/modules/DonutChart'
import { formatCurrency } from '@/utils/format'
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

      {/* Graphiques Donut */}
      <div className="dashboard-charts">
        <KPIDonut
          title="Budget Total"
          value={parseFloat(kpis?.budgetConsomme || 0)}
          total={parseFloat(kpis?.budgetTotal || 0)}
          label="Consommé"
          variant="danger"
          formatValue="currency"
          subtitle={`${formatCurrency((parseFloat(kpis?.budgetTotal || 0) - parseFloat(kpis?.budgetConsomme || 0)))} restant`}
          onClick={() => navigate('/programmes')}
        />
        <KPIDonut
          title="Programmes Actifs"
          value={kpis?.programmesActifs || 0}
          total={kpis?.programmesTotal || 0}
          label="Actifs"
          variant="default"
          formatValue="number"
          subtitle={`${(kpis?.programmesTotal || 0) - (kpis?.programmesActifs || 0)} inactifs`}
          onClick={() => navigate('/programmes')}
        />
        <KPIDonut
          title="Projets en Cours"
          value={kpis?.projetsEnCours || 0}
          total={kpis?.projetsTotal || 0}
          label="En cours"
          variant="success"
          formatValue="number"
          subtitle={`${(kpis?.projetsTotal || 0) - (kpis?.projetsEnCours || 0)} terminés`}
          onClick={() => navigate('/projets')}
        />
      </div>

      {/* Donuts supplémentaires */}
      <div className="dashboard-charts-row">
        <div className="donut-chart-card">
          <DonutChart
            title="Répartition des programmes"
            data={[
              {
                name: 'actifs',
                label: 'Actifs',
                value: kpis?.programmesActifs || 0,
                color: '#10b981'
              },
              {
                name: 'inactifs',
                label: 'Inactifs',
                value: (kpis?.programmesTotal || 0) - (kpis?.programmesActifs || 0),
                color: '#e5e7eb'
              }
            ]}
            centerValue={kpis?.programmesTotal || 0}
            centerLabel="Programmes"
            height={280}
          />
        </div>
        <div className="donut-chart-card">
          <DonutChart
            title="Répartition des projets"
            data={[
              {
                name: 'en_cours',
                label: 'En cours',
                value: kpis?.projetsEnCours || 0,
                color: '#3b82f6'
              },
              {
                name: 'termines',
                label: 'Terminés',
                value: (kpis?.projetsTotal || 0) - (kpis?.projetsEnCours || 0),
                color: '#10b981'
              }
            ]}
            centerValue={kpis?.projetsTotal || 0}
            centerLabel="Projets"
            height={280}
          />
        </div>
      </div>

      {/* Prévisions Prédictives en Donuts */}
      {budgetPrediction && budgetPrediction.monthlyProjection && (
        <div className="dashboard-charts-row">
          <div className="donut-chart-card">
            <DonutChart
              title="Prévision Budget (6 mois)"
              data={[
                {
                  name: 'predicted',
                  label: 'Prévu',
                  value: budgetPrediction.monthlyProjection.reduce((sum, m) => sum + (m.predicted || 0), 0),
                  color: '#dc2626'
                },
                {
                  name: 'available',
                  label: 'Disponible',
                  value: Math.max(0, parseFloat(kpis?.budgetTotal || 0) - budgetPrediction.monthlyProjection.reduce((sum, m) => sum + (m.predicted || 0), 0)),
                  color: '#10b981'
                }
              ]}
              centerValue={formatCurrency(budgetPrediction.monthlyProjection.reduce((sum, m) => sum + (m.predicted || 0), 0))}
              centerLabel="Prévision"
              height={280}
            />
          </div>
          <div className="donut-chart-card">
            <DonutChart
              title="Risque Budget"
              data={[
                {
                  name: 'at_risk',
                  label: 'À risque',
                  value: budgetPrediction.riskLevel === 'HIGH' ? 80 : budgetPrediction.riskLevel === 'MEDIUM' ? 50 : 20,
                  color: budgetPrediction.riskLevel === 'HIGH' ? '#ef4444' : budgetPrediction.riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981'
                },
                {
                  name: 'safe',
                  label: 'Sécurisé',
                  value: budgetPrediction.riskLevel === 'HIGH' ? 20 : budgetPrediction.riskLevel === 'MEDIUM' ? 50 : 80,
                  color: '#e5e7eb'
                }
              ]}
              centerValue={budgetPrediction.riskLevel || 'LOW'}
              centerLabel="Risque"
              height={280}
            />
          </div>
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
