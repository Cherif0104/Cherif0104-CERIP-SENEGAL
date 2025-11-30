import { useEffect, useState } from 'react'
import { Icon } from '@/components/common/Icon'
import { LoadingState } from '@/components/common/LoadingState'
import { analyticsService } from '@/services/analytics.service'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './Dashboard.css'

export default function Dashboard() {
  const [kpis, setKpis] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadKPIs()
  }, [])

  const loadKPIs = async () => {
    setLoading(true)
    try {
      const data = await analyticsService.getGlobalKPIs()
      setKpis(data)
    } catch (error) {
      console.error('Error loading KPIs:', error)
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

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Tableau de bord</h1>
        <button onClick={loadKPIs} className="dashboard-refresh">
          <Icon name="RefreshCw" size={18} />
          Actualiser
        </button>
      </div>

      <div className="dashboard-kpis">
        <div className="kpi-card-modern">
          <div className="kpi-card-header">
            <div className="kpi-card-icon primary">
              <Icon name="FolderKanban" size={24} />
            </div>
            <div className="kpi-card-trend positive">
              <Icon name="TrendingUp" size={16} />
              <span>+12%</span>
            </div>
          </div>
          <div className="kpi-card-value">{kpis?.programmesActifs || 0}</div>
          <div className="kpi-card-label">Programmes actifs</div>
        </div>

        <div className="kpi-card-modern">
          <div className="kpi-card-header">
            <div className="kpi-card-icon secondary">
              <Icon name="Briefcase" size={24} />
            </div>
            <div className="kpi-card-trend positive">
              <Icon name="TrendingUp" size={16} />
              <span>+8%</span>
            </div>
          </div>
          <div className="kpi-card-value">{kpis?.projetsEnCours || 0}</div>
          <div className="kpi-card-label">Projets en cours</div>
        </div>

        <div className="kpi-card-modern">
          <div className="kpi-card-header">
            <div className="kpi-card-icon accent">
              <Icon name="DollarSign" size={24} />
            </div>
            <div className="kpi-card-trend positive">
              <Icon name="TrendingUp" size={16} />
              <span>+5%</span>
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
        </div>

        <div className="kpi-card-modern">
          <div className="kpi-card-header">
            <div className="kpi-card-icon success">
              <Icon name="UserCheck" size={24} />
            </div>
            <div className="kpi-card-trend positive">
              <Icon name="TrendingUp" size={16} />
              <span>+{kpis?.tauxConversion || 0}%</span>
            </div>
          </div>
          <div className="kpi-card-value">{kpis?.tauxConversion || 0}%</div>
          <div className="kpi-card-label">Taux de conversion</div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="dashboard-chart-card">
          <h3 className="dashboard-chart-title">Évolution Programmes & Projets</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="programmes" stroke="#dc2626" name="Programmes" />
              <Line type="monotone" dataKey="projets" stroke="#2563eb" name="Projets" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-chart-card">
          <h3 className="dashboard-chart-title">Budget Alloué vs Consommé</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetData}>
              <CartesianGrid strokeDasharray="3 3" />
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

      <div className="dashboard-metrics">
        <div className="metric-card-modern">
          <div className="metric-card-header">
            <span className="metric-card-title">Budget consommé</span>
          </div>
          <div className="metric-card-value">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XOF',
              minimumFractionDigits: 0,
            }).format(parseFloat(kpis?.budgetConsomme || 0))}
          </div>
          <div className="metric-card-detail">{`Sur ${new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
          }).format(parseFloat(kpis?.budgetTotal || 0))}`}</div>
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
        </div>
      </div>
    </div>
  )
}

