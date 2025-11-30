import { useSearchParams } from 'react-router-dom'
import { ModuleHeader } from '@/components/modules/ModuleHeader'
import { ModuleTabs } from '@/components/modules/ModuleTabs'
import RHDashboard from './tabs/dashboard/RHDashboard'
import EmployesListe from './tabs/employes/EmployesListe'
import PostesListe from './tabs/postes/PostesListe'
import CompetencesListe from './tabs/competences/CompetencesListe'
import PlanningRH from './tabs/planning/PlanningRH'
import './RHModule.css'

export default function RHModule() {
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
      <ModuleHeader title="Ressources Humaines" subtitle="Gestion des employés, postes et compétences" />
      <ModuleTabs tabs={tabs} defaultTab="dashboard" />
      <div className="module-tab-content">{renderTabContent()}</div>
    </div>
  )
}

