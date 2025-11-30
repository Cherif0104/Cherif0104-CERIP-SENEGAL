import { useSearchParams } from 'react-router-dom'
import { ModuleHeader } from '@/components/modules/ModuleHeader'
import { ModuleTabs } from '@/components/modules/ModuleTabs'
import { ReportingDashboard } from '@/components/modules/ReportingDashboard'
import RapportsTab from './tabs/rapports/RapportsTab'
import './ReportingModule.css'

export default function ReportingModule() {
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'dashboard'

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'rapports', label: 'Rapports' },
    { id: 'analytics', label: 'Analytics' },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ReportingDashboard />
      case 'rapports':
        return <RapportsTab />
      case 'analytics':
        return <ReportingDashboard />
      default:
        return <ReportingDashboard />
    }
  }

  return (
    <div className="reporting-module">
      <ModuleHeader title="Reporting & Analytics" subtitle="Rapports et analyses" />
      <ModuleTabs tabs={tabs} defaultTab="dashboard" />
      <div className="module-tab-content">{renderTabContent()}</div>
    </div>
  )
}

