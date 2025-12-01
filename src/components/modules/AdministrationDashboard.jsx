import { useEffect, useState } from 'react'
import { KPICard } from './KPICard'
import { globalMetricsService } from '@/services/global-metrics.service'
import { LoadingState } from '@/components/common/LoadingState'

export const AdministrationDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const data = await globalMetricsService.getModuleKPIs('administration')
      setStats(data)
    } catch (error) {
      console.error('Error loading administration stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  return (
    <div className="kpi-grid-modern">
      <KPICard 
        icon="Users" 
        value={stats?.utilisateursActifs || 0} 
        label="Utilisateurs actifs" 
        variant="primary" 
      />
      <KPICard 
        icon="Database" 
        value={stats?.referentiels || 0} 
        label="Référentiels" 
        variant="secondary" 
      />
      <KPICard 
        icon="FileText" 
        value={stats?.logsAudit || 0} 
        label="Logs d'audit (mois)" 
        variant="accent" 
      />
      <KPICard 
        icon="Shield" 
        value={stats?.administrateurs || 0} 
        label="Administrateurs" 
        variant="warning" 
      />
    </div>
  )
}

