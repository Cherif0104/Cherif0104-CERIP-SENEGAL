import { useEffect, useState } from 'react'
import { KPICard } from './KPICard'
import { analyticsService } from '@/services/analytics.service'
import { LoadingState } from '@/components/common/LoadingState'

export const ReportingDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const data = await analyticsService.getModuleStats('reporting')
      setStats(data)
    } catch (error) {
      console.error('Error loading reporting stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  return (
    <div className="kpi-grid-modern">
      <KPICard 
        icon="FileText" 
        value={stats?.rapportsGeneres || stats?.rapportsTotal || 0} 
        label="Rapports générés" 
        variant="primary" 
      />
      <KPICard 
        icon="Clock" 
        value={stats?.rapportsEnAttente || 0} 
        label="En attente" 
        variant="warning" 
      />
      <KPICard 
        icon="CheckCircle" 
        value={`${stats?.tauxCompletion || 0}%`} 
        label="Taux de complétion" 
        variant="success" 
      />
      <KPICard 
        icon="Download" 
        value={stats?.exportsTotal || 0} 
        label="Exports" 
        variant="accent" 
      />
    </div>
  )
}

