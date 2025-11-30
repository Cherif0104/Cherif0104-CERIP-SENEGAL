import { useEffect, useState } from 'react'
import { KPICard } from './KPICard'
import { analyticsService } from '@/services/analytics.service'
import { LoadingState } from '@/components/common/LoadingState'

export const CandidaturesDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const data = await analyticsService.getModuleStats('candidatures')
      setStats(data)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  return (
    <div className="kpi-grid-modern">
      <KPICard icon="UserCheck" value={stats?.appelsOuverts || 0} label="Appels ouverts" variant="primary" />
      <KPICard icon="Users" value={stats?.candidatsTotal || 0} label="Candidats" variant="secondary" />
      <KPICard icon="CheckCircle" value={stats?.candidatsEligibles || 0} label="Éligibles" variant="success" />
      <KPICard icon="TrendingUp" value={`${stats?.tauxEligibilite || 0}%`} label="Taux d'éligibilité" variant="accent" />
    </div>
  )
}

