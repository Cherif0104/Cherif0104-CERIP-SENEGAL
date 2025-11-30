import { useNavigate, useSearchParams } from 'react-router-dom'
import { ModuleHeader } from '@/components/modules/ModuleHeader'
import { ModuleTabs } from '@/components/modules/ModuleTabs'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import RHDashboard from './tabs/dashboard/RHDashboard'
import EmployesListe from './tabs/employes/EmployesListe'
import PostesListe from './tabs/postes/PostesListe'
import CompetencesListe from './tabs/competences/CompetencesListe'
import PlanningRH from './tabs/planning/PlanningRH'
import './RHModule.css'

export default function RHModule() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'dashboard'

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'employes', label: 'Employés' },
    { id: 'postes', label: 'Postes' },
    { id: 'competences', label: 'Compétences' },
    { id: 'planning', label: 'Planning' },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <RHDashboard />
      case 'employes':
        return <EmployesListe />
      case 'postes':
        return <PostesListe />
      case 'competences':
        return <CompetencesListe />
      case 'planning':
        return <PlanningRH />
      default:
        return <RHDashboard />
    }
  }

  return (
    <div className="rh-module">
      <ModuleHeader
        title="Ressources Humaines"
        subtitle="Gestion des employés, postes et compétences"
        actions={
          <PermissionGuard permission="rh.create">
            <Button onClick={() => navigate('/rh/employes/new')} variant="primary">
              <Icon name="Plus" size={16} />
              Nouvel employé
            </Button>
          </PermissionGuard>
        }
      />
      <ModuleTabs tabs={tabs} defaultTab="dashboard" />
      <div className="module-tab-content">{renderTabContent()}</div>
    </div>
  )
}

