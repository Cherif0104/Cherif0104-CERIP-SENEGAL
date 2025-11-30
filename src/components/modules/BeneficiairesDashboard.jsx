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
      <KPICard icon="Users" value={stats?.beneficiairesActifs || 0} label="Bénéficiaires actifs" variant="primary" />
      <KPICard icon="TrendingUp" value={`${stats?.tauxInsertion || 0}%`} label="Taux d'insertion" variant="success" />
      <KPICard icon="GraduationCap" value={0} label="Formations" variant="secondary" />
      <KPICard icon="UserCog" value={0} label="Accompagnements" variant="accent" />
    </div>
  )
}

