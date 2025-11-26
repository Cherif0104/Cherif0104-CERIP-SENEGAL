import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/common/Icon'
import { analyticsService } from '../../services/analytics.service'
import './Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    programmesActifs: 0,
    projetsEnCours: 0,
    candidatsEnAttente: 0,
    beneficiairesActifs: 0,
    budgetTotal: 0,
    budgetConsomme: 0,
    tauxConversion: 0,
    tauxInsertion: 0,
    funnel: {
      candidats: 0,
      eligibles: 0,
      beneficiaires: 0,
      insertions: 0
    }
  })
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    loadStats()
    loadAlerts()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    const { data } = await analyticsService.getDashboardStats()
    if (data) {
      setStats(data)
    }
    setLoading(false)
  }

  const loadAlerts = async () => {
    const { data } = await analyticsService.getAlerts()
    if (data) {
      setAlerts(data)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div className="spinner"></div>
      </div>
    )
  }

  const { 
    programmesActifs, 
    projetsEnCours, 
    candidatsEnAttente, 
    beneficiairesActifs, 
    budgetTotal,
    budgetConsomme,
    tauxConversion,
    tauxInsertion,
    funnel 
  } = stats

  const budgetPercentage = budgetTotal > 0 ? (budgetConsomme / budgetTotal * 100).toFixed(1) : 0

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Tableau de bord SERIP-CAS</h1>
        <p>Vue d'ensemble de vos programmes, projets, candidats et bénéficiaires</p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-stats">
          <button
            type="button"
            className="stat-card"
            onClick={() => navigate('/programmes')}
          >
            <div className="stat-icon">
              <Icon name="ClipboardList" size={32} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{programmesActifs}</div>
              <div className="stat-label">Programmes</div>
            </div>
          </button>

          <button
            type="button"
            className="stat-card"
            onClick={() => navigate('/projets')}
          >
            <div className="stat-icon">
              <Icon name="Briefcase" size={32} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{projetsEnCours}</div>
              <div className="stat-label">Projets</div>
            </div>
          </button>

          <button
            type="button"
            className="stat-card"
            onClick={() => navigate('/candidats')}
          >
            <div className="stat-icon">
              <Icon name="Sparkles" size={32} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{candidatsEnAttente}</div>
              <div className="stat-label">Candidats en pipeline</div>
            </div>
          </button>

          <button
            type="button"
            className="stat-card"
            onClick={() => navigate('/beneficiaires')}
          >
            <div className="stat-icon">
              <Icon name="Users" size={32} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{beneficiairesActifs}</div>
              <div className="stat-label">Bénéficiaires actifs</div>
            </div>
          </button>
        </div>

        <div className="dashboard-metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <Icon name="DollarSign" size={20} />
              <span>Budget</span>
            </div>
            <div className="metric-value">
              {budgetTotal.toLocaleString('fr-FR')} XOF
            </div>
            <div className="metric-detail">
              {budgetConsomme > 0 && (
                <div className="metric-progress">
                  <div className="metric-progress-bar">
                    <div 
                      className="metric-progress-fill" 
                      style={{ width: `${budgetPercentage}%` }}
                    />
                  </div>
                  <span>{budgetPercentage}% consommé</span>
                </div>
              )}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <Icon name="TrendingUp" size={20} />
              <span>Taux de conversion</span>
            </div>
            <div className="metric-value">
              {tauxConversion}%
            </div>
            <div className="metric-detail">
              {funnel.candidats > 0 && (
                <span>{beneficiairesActifs} bénéficiaires / {funnel.candidats} candidats</span>
              )}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <Icon name="Target" size={20} />
              <span>Taux d'insertion</span>
            </div>
            <div className="metric-value">
              {tauxInsertion}%
            </div>
            <div className="metric-detail">
              {beneficiairesActifs > 0 && (
                <span>{funnel.insertions} insérés / {beneficiairesActifs} bénéficiaires</span>
              )}
            </div>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="dashboard-alerts">
            <div className="alerts-header">
              <Icon name="AlertTriangle" size={20} />
              <h2>Alertes ({alerts.length})</h2>
            </div>
            <div className="alerts-list">
              {alerts.map((alert, idx) => (
                <div 
                  key={idx} 
                  className={`alert-item alert-${alert.type}`}
                  onClick={() => alert.link && navigate(alert.link)}
                >
                  <Icon name={alert.type === 'warning' ? 'AlertTriangle' : 'Info'} size={16} />
                  <div className="alert-content">
                    <div className="alert-title">{alert.title}</div>
                    <div className="alert-message">{alert.message}</div>
                  </div>
                  {alert.link && (
                    <Icon name="ChevronRight" size={16} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="dashboard-funnel">
          <h2>Parcours global</h2>
          <div className="funnel-steps">
            <div className="funnel-step">
              <span className="funnel-label">Candidats</span>
              <span className="funnel-value">{funnel.candidats}</span>
            </div>
            <div className="funnel-arrow">
              <Icon name="ArrowRight" size={20} />
            </div>
            <div className="funnel-step">
              <span className="funnel-label">Éligibles</span>
              <span className="funnel-value">{funnel.eligibles}</span>
            </div>
            <div className="funnel-arrow">
              <Icon name="ArrowRight" size={20} />
            </div>
            <div className="funnel-step">
              <span className="funnel-label">Bénéficiaires</span>
              <span className="funnel-value">{funnel.beneficiaires}</span>
            </div>
            <div className="funnel-arrow">
              <Icon name="ArrowRight" size={20} />
            </div>
            <div className="funnel-step">
              <span className="funnel-label">Insertions</span>
              <span className="funnel-value">{funnel.insertions}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-welcome">
          <h2>Bienvenue sur l'ERP SERIP-CAS</h2>
          <p>Cette plateforme vous permet de gérer tous les aspects de votre incubateur :</p>
          <ul>
            <li>Gestion des programmes et projets</li>
            <li>Suivi des appels à candidatures et du pipeline</li>
            <li>Accompagnement des bénéficiaires et interventions</li>
            <li>Portails pour les intervenants (Mentors, Formateurs, Coaches)</li>
          </ul>
          <p className="dashboard-note">
            Utilisez les cartes ci-dessus pour accéder rapidement aux modules clés.
          </p>
        </div>
      </div>
    </div>
  )
}

