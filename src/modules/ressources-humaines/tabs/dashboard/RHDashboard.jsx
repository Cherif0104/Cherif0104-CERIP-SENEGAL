import { useEffect, useState } from 'react'
import { employesService } from '@/services/employes.service'
import { postesService } from '@/services/postes.service'
import { competencesService } from '@/services/competences.service'
import { KPICard } from '@/components/modules/KPICard'
import { LoadingState } from '@/components/common/LoadingState'
import { logger } from '@/utils/logger'
import './RHDashboard.css'

export default function RHDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const [employes, postes, competences] = await Promise.all([
        employesService.getAll(),
        postesService.getAll(),
        competencesService.getAll(),
      ])

      const employesActifs = employes.data?.filter((e) => e.statut === 'ACTIF') || []
      const postesOuverts = postes.data?.filter((p) => p.statut === 'OUVERT') || []

      setStats({
        totalEmployes: employes.data?.length || 0,
        employesActifs: employesActifs.length,
        totalPostes: postes.data?.length || 0,
        postesOuverts: postesOuverts.length,
        totalCompetences: competences.data?.length || 0,
      })
    } catch (error) {
      logger.error('RH_DASHBOARD', 'Erreur chargement stats', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  return (
    <div className="rh-dashboard">
      <div className="kpi-grid-modern">
        <KPICard icon="Users" value={stats?.totalEmployes || 0} label="Total employés" variant="primary" />
        <KPICard
          icon="UserCheck"
          value={stats?.employesActifs || 0}
          label="Employés actifs"
          variant="success"
        />
        <KPICard icon="Briefcase" value={stats?.totalPostes || 0} label="Total postes" variant="secondary" />
        <KPICard
          icon="FolderOpen"
          value={stats?.postesOuverts || 0}
          label="Postes ouverts"
          variant="accent"
        />
        <KPICard
          icon="Award"
          value={stats?.totalCompetences || 0}
          label="Compétences"
          variant="warning"
        />
      </div>
    </div>
  )
}

