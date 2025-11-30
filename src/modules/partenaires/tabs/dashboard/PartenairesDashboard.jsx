import { useEffect, useState } from 'react'
import { KPICard } from '@/components/modules/KPICard'
import { organismesService } from '@/services/organismes.service'
import { financeursService } from '@/services/financeurs.service'
import { partenairesService } from '@/services/partenaires.service'
import { structuresService } from '@/services/structures.service'
import { LoadingState } from '@/components/common/LoadingState'
import { logger } from '@/utils/logger'
import './PartenairesDashboard.css'

export default function PartenairesDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const [organismes, financeurs, partenaires, structures] = await Promise.all([
        organismesService.getActifs(),
        financeursService.getActifs(),
        partenairesService.getActifs(),
        structuresService.getActives(),
      ])

      setStats({
        totalOrganismes: organismes.data?.length || 0,
        totalFinanceurs: financeurs.data?.length || 0,
        totalPartenaires: partenaires.data?.length || 0,
        totalStructures: structures.data?.length || 0,
      })

      logger.debug('PARTENAIRES_DASHBOARD', 'Statistiques chargées', { stats })
    } catch (error) {
      logger.error('PARTENAIRES_DASHBOARD', 'Erreur chargement stats', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingState message="Chargement des statistiques..." />
  }

  return (
    <div className="partenaires-dashboard">
      <div className="kpi-grid-modern">
        <KPICard
          icon="Globe"
          value={stats?.totalOrganismes || 0}
          label="Organismes Internationaux"
          variant="primary"
        />
        <KPICard
          icon="DollarSign"
          value={stats?.totalFinanceurs || 0}
          label="Financeurs"
          variant="accent"
        />
        <KPICard
          icon="Handshake"
          value={stats?.totalPartenaires || 0}
          label="Partenaires"
          variant="success"
        />
        <KPICard
          icon="Building"
          value={stats?.totalStructures || 0}
          label="Structures"
          variant="secondary"
        />
      </div>

      <div className="partenaires-summary">
        <div className="summary-card">
          <h3>Total Partenaires & Structures</h3>
          <p className="summary-value">
            {(stats?.totalOrganismes || 0) +
              (stats?.totalFinanceurs || 0) +
              (stats?.totalPartenaires || 0) +
              (stats?.totalStructures || 0)}
          </p>
        </div>
      </div>
    </div>
  )
}

