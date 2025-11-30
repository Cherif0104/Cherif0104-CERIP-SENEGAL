import { useSearchParams } from 'react-router-dom'
import { ModuleHeader } from '@/components/modules/ModuleHeader'
import { ModuleTabs } from '@/components/modules/ModuleTabs'
import ProjetsDashboard from './tabs/dashboard/ProjetsDashboard'
import ProjetsListe from './tabs/liste/ProjetsListe'
import BudgetsProjet from './tabs/budgets/BudgetsProjet'
import AppelsProjet from './tabs/appels/AppelsProjet'
import RisquesProjet from './tabs/risques/RisquesProjet'
import JalonsProjet from './tabs/jalons/JalonsProjet'
import ReportingProjet from './tabs/reporting/ReportingProjet'
import './ProjetsModule.css'

export default function ProjetsModule() {
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'dashboard'

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'liste', label: 'Liste' },
    { id: 'budgets', label: 'Budgets' },
    { id: 'appels', label: 'Appels' },
    { id: 'risques', label: 'Risques' },
    { id: 'jalons', label: 'Jalons' },
    { id: 'reporting', label: 'Reporting' },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ProjetsDashboard />
      case 'liste':
        return <ProjetsListe />
      case 'budgets':
        return <BudgetsProjet />
      case 'appels':
        return <AppelsProjet />
      case 'risques':
        return <RisquesProjet />
      case 'jalons':
        return <JalonsProjet />
      case 'reporting':
        return <ReportingProjet />
      default:
        return <ProjetsDashboard />
    }
  }

  return (
    <div className="projets-module">
      <ModuleHeader
        title="Projets"
        subtitle="Gestion des projets d'insertion"
        onRefresh={() => window.location.reload()}
      />
      <ModuleTabs tabs={tabs} defaultTab="dashboard" />
      <div className="module-tab-content">{renderTabContent()}</div>
    </div>
  )
}

