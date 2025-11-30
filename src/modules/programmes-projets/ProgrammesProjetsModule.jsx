import { useSearchParams } from 'react-router-dom'
import { ModuleHeader } from '@/components/modules/ModuleHeader'
import { ModuleTabs } from '@/components/modules/ModuleTabs'
import { ProgrammesProjetsDashboard } from '@/components/modules/ProgrammesProjetsDashboard'
import { ProgrammesTab } from '@/components/modules/ProgrammesTab'
import { ProjetsTab } from '@/components/modules/ProjetsTab'
import { AppelsTab } from '@/components/modules/AppelsTab'
import { PipelineTab } from '@/components/modules/PipelineTab'
import './ProgrammesProjetsModule.css'

export default function ProgrammesProjetsModule() {
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'dashboard'

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'programmes', label: 'Programmes' },
    { id: 'projets', label: 'Projets' },
    { id: 'appels', label: 'Appels' },
    { id: 'pipeline', label: 'Pipeline' },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ProgrammesProjetsDashboard />
      case 'programmes':
        return <ProgrammesTab />
      case 'projets':
        return <ProjetsTab />
      case 'appels':
        return <AppelsTab />
      case 'pipeline':
        return <PipelineTab />
      default:
        return <ProgrammesProjetsDashboard />
    }
  }

  return (
    <div className="programmes-projets-module">
      <ModuleHeader
        title="Programmes & Projets"
        subtitle="Gestion des programmes et projets d'insertion"
        onRefresh={() => window.location.reload()}
      />
      <ModuleTabs tabs={tabs} defaultTab="dashboard" />
      <div className="module-tab-content">{renderTabContent()}</div>
    </div>
  )
}

