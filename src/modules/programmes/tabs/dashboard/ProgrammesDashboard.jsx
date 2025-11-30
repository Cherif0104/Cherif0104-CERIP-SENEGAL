import { useEffect, useState } from 'react'
import { KPICard } from '@/components/modules/KPICard'
import { MetricCard } from '@/components/modules/MetricCard'
import { FunnelVisualization } from '@/components/modules/FunnelVisualization'
import { AlertsSection } from '@/components/modules/AlertsSection'
import { programmesService } from '@/services/programmes.service'
import { projetsService } from '@/services/projets.service'
import { LoadingState } from '@/components/common/LoadingState'
import { logger } from '@/utils/logger'
import './ProgrammesDashboard.css'

export default function ProgrammesDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      // Optimisation : Charger seulement les données nécessaires avec limite
      const { data: programmes, error: progError } = await programmesService.getAll({
        pagination: { page: 1, pageSize: 100 }, // Limite pour éviter surcharge
      })

      if (progError) {
        logger.error('PROGRAMMES_DASHBOARD', 'Erreur chargement programmes', progError)
        return
      }

      const programmesActifs = programmes?.filter(p => ['ACTIF', 'EN_COURS', 'OUVERT'].includes(p.statut))?.length || 0
      const budgetTotal = programmes?.reduce((sum, p) => sum + parseFloat(p.budget || 0), 0) || 0
      const budgetConsomme = programmes?.reduce((sum, p) => sum + parseFloat(p.budget_consomme || 0), 0) || 0

      // Compter projets par programme - Optimisé : compter seulement les programmes avec projets
      const programmeIds = programmes?.map(p => p.id) || []
      let totalProjets = 0
      
      if (programmeIds.length > 0) {
        // Compter projets par programme en une seule requête groupée
        const { data: projets } = await projetsService.getAll({
          pagination: { page: 1, pageSize: 1000 }, // Limite
        })
        
        const projetsParProgramme = projets?.reduce((acc, projet) => {
          const progId = projet.programme_id
          if (progId && programmeIds.includes(progId)) {
            if (!acc[progId]) acc[progId] = 0
            acc[progId]++
          }
          return acc
        }, {}) || {}

        totalProjets = Object.keys(projetsParProgramme).length
      }

      setStats({
        totalProgrammes: programmes?.length || 0,
        programmesActifs,
        budgetTotal,
        budgetConsomme,
        totalProjets,
      })

      logger.debug('PROGRAMMES_DASHBOARD', 'Statistiques chargées', { stats })
    } catch (error) {
      logger.error('PROGRAMMES_DASHBOARD', 'Erreur chargement stats', error)
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
    <div className="programmes-dashboard">
      <div className="kpi-grid-modern">
        <KPICard
          icon="FolderKanban"
          value={stats?.programmesActifs || 0}
          label="Programmes actifs"
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
          icon="Briefcase"
          value={stats?.totalProjets || 0}
          label="Projets associés"
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

