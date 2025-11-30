import { useNavigate, useSearchParams } from 'react-router-dom'
import { ModuleHeader } from '@/components/modules/ModuleHeader'
import { ModuleTabs } from '@/components/modules/ModuleTabs'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import { CandidaturesDashboard } from '@/components/modules/CandidaturesDashboard'
import { AppelsTab } from '@/components/modules/AppelsTab'
import { PipelineTab } from '@/components/modules/PipelineTab'
import AppelsCandidatures from '@/pages/candidatures/AppelsCandidatures'

export default function CandidaturesModule() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'dashboard'

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'appels', label: 'Appels' },
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'dossiers', label: 'Dossiers' },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <CandidaturesDashboard />
      case 'appels':
        return <AppelsTab />
      case 'pipeline':
        return <PipelineTab />
      case 'dossiers':
        return <AppelsCandidatures />
      default:
        return <CandidaturesDashboard />
    }
  }

  return (
    <div>
      <ModuleHeader
        title="Candidatures"
        subtitle="Gestion des candidatures et appels"
        actions={
          <PermissionGuard permission="appels.create">
            <Button onClick={() => navigate('/appels/new')} variant="primary">
              <Icon name="Plus" size={16} />
              Nouvel appel
            </Button>
          </PermissionGuard>
        }
      />
      <ModuleTabs tabs={tabs} defaultTab="dashboard" />
      <div className="module-tab-content">{renderTabContent()}</div>
    </div>
  )
}

