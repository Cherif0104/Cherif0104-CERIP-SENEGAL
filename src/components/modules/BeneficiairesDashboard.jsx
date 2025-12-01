import { useEffect, useState } from 'react'
import { KPICard } from './KPICard'
import { analyticsService } from '@/services/analytics.service'
import { LoadingState } from '@/components/common/LoadingState'

export const BeneficiairesDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const data = await analyticsService.getModuleStats('beneficiaires')
      setStats(data)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  return (
    <div className="kpi-grid-modern">
      <KPICard icon="Users" value={stats?.beneficiairesActifs || stats?.actifs || 0} label="Bénéficiaires actifs" variant="primary" />
      <KPICard icon="TrendingUp" value={`${stats?.tauxInsertion || 0}%`} label="Taux d'insertion" variant="success" />
      <KPICard icon="UserCheck" value={stats?.accompagnes || 0} label="Accompagnés" variant="secondary" />
      <KPICard icon="Target" value={stats?.inserts || stats?.insertionsTotal || 0} label="Insérés" variant="accent" />
    </div>
  )
}

