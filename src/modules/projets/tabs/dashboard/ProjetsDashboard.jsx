import { useEffect, useState } from 'react'
import { KPICard } from '@/components/modules/KPICard'
import { MetricCard } from '@/components/modules/MetricCard'
import { FunnelVisualization } from '@/components/modules/FunnelVisualization'
import { AlertsSection } from '@/components/modules/AlertsSection'
import { projetsService } from '@/services/projets.service'
import { LoadingState } from '@/components/common/LoadingState'
import { logger } from '@/utils/logger'
import './ProjetsDashboard.css'

export default function ProjetsDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      // Optimisation : Limiter la pagination
      const { data, error } = await projetsService.getAll(null, {
        pagination: { page: 1, pageSize: 100 },
      })
      if (error) {
        logger.error('PROJETS_DASHBOARD', 'Erreur chargement stats', error)
        return
      }

      const projets = data || []
      const projetsActifs = projets.filter(p => ['EN_COURS', 'OUVERT'].includes(p.statut)).length
      const budgetTotal = projets.reduce((sum, p) => sum + parseFloat(p.budget_alloue || 0), 0)
      const budgetConsomme = projets.reduce((sum, p) => sum + parseFloat(p.budget_consomme || 0), 0)

      setStats({
        totalProjets: projets.length,
        projetsActifs,
        budgetTotal,
        budgetConsomme,
      })

      logger.debug('PROJETS_DASHBOARD', 'Statistiques chargées', { stats })
    } catch (error) {
      logger.error('PROJETS_DASHBOARD', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingState message="Chargement des statistiques..." />
  }

  const funnelData = [
    { name: 'Projets', value: stats?.totalProjets || 0 },
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
    <div className="projets-dashboard">
      <div className="kpi-grid-modern">
        <KPICard
          icon="Briefcase"
          value={stats?.projetsActifs || 0}
          label="Projets actifs"
          variant="primary"
        />
        <KPICard
          icon="DollarSign"
          value={new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
          }).format(stats?.budgetTotal || 0)}
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
        />
        <KPICard
          icon="FolderKanban"
          value={stats?.totalProjets || 0}
          label="Total projets"
          variant="secondary"
        />
      </div>

      <div className="metrics-grid-modern">
        <MetricCard
          title="Budget consommé"
          value={new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
          }).format(stats?.budgetConsomme || 0)}
          detail={`Sur ${new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
          }).format(stats?.budgetTotal || 0)}`}
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

