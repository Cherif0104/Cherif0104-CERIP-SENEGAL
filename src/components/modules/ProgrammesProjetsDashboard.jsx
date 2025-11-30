import { useEffect, useState } from 'react'
import { KPICard } from './KPICard'
import { MetricCard } from './MetricCard'
import { FunnelVisualization } from './FunnelVisualization'
import { AlertsSection } from './AlertsSection'
import { analyticsService } from '@/services/analytics.service'
import { LoadingState } from '@/components/common/LoadingState'
import './ProgrammesProjetsDashboard.css'

export const ProgrammesProjetsDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const data = await analyticsService.getModuleStats('programmes-projets')
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingState message="Chargement des statistiques..." />
  }

  const funnelData = [
    { name: 'Programmes', value: stats?.totalProgrammes || 0 },
    { name: 'Projets', value: stats?.totalProjets || 0 },
    { name: 'Appels', value: 0 },
    { name: 'Candidats', value: 0 },
  ]

  const alerts = []

  if (stats?.budgetConsomme && stats?.budgetTotal) {
    const tauxConsommation = (parseFloat(stats.budgetConsomme) / parseFloat(stats.budgetTotal)) * 100
    if (tauxConsommation > 90) {
      alerts.push({
        priority: 'CRITICAL',
        title: 'Budget critique',
        description: `Budget consommé à ${Math.round(tauxConsommation)}%`,
      })
    } else if (tauxConsommation > 75) {
      alerts.push({
        priority: 'HIGH',
        title: 'Budget élevé',
        description: `Budget consommé à ${Math.round(tauxConsommation)}%`,
      })
    }
  }

  return (
    <div className="programmes-projets-dashboard">
      <div className="kpi-grid-modern">
        <KPICard
          icon="FolderKanban"
          value={stats?.programmesActifs || 0}
          label="Programmes actifs"
          variant="primary"
          trend={{ type: 'positive', value: '+5%' }}
        />
        <KPICard
          icon="Briefcase"
          value={stats?.projetsEnCours || 0}
          label="Projets en cours"
          variant="secondary"
          trend={{ type: 'positive', value: '+3%' }}
        />
        <KPICard
          icon="DollarSign"
          value={new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
          }).format(parseFloat(stats?.budgetTotal || 0))}
          label="Budget total"
          variant="accent"
        />
        <KPICard
          icon="TrendingUp"
          value={
            parseFloat(stats?.budgetTotal || 0) > 0
              ? Math.round((parseFloat(stats.budgetConsomme || 0) / parseFloat(stats.budgetTotal)) * 100)
              : 0
          }
          label="Taux d'avancement"
          variant="success"
          trend={{ type: 'positive', value: '+2%' }}
        />
      </div>

      <div className="metrics-grid-modern">
        <MetricCard
          title="Budget consommé"
          value={new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
          }).format(parseFloat(stats?.budgetConsomme || 0))}
          detail={`Sur ${new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
          }).format(parseFloat(stats?.budgetTotal || 0))}`}
          progress={
            parseFloat(stats?.budgetTotal || 0) > 0
              ? (parseFloat(stats.budgetConsomme || 0) / parseFloat(stats.budgetTotal)) * 100
              : 0
          }
        />
      </div>

      <FunnelVisualization data={funnelData} />

      {alerts.length > 0 && <AlertsSection alerts={alerts} />}
    </div>
  )
}

