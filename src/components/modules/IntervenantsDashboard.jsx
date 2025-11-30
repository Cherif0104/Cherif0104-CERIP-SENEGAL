import { useEffect, useState } from 'react'
import { KPICard } from './KPICard'
import { analyticsService } from '@/services/analytics.service'
import { LoadingState } from '@/components/common/LoadingState'

export const IntervenantsDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const data = await analyticsService.getModuleStats('intervenants')
      setStats(data)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  return (
    <div className="kpi-grid-modern">
      <KPICard icon="UserCog" value={stats?.mentors || 0} label="Mentors" variant="primary" />
      <KPICard icon="GraduationCap" value={stats?.formateurs || 0} label="Formateurs" variant="secondary" />
      <KPICard icon="UserCheck" value={stats?.coaches || 0} label="Coaches" variant="accent" />
      <KPICard icon="Users" value={stats?.total || 0} label="Total intervenants" variant="success" />
    </div>
  )
}

