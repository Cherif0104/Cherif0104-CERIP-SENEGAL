import { useSearchParams } from 'react-router-dom'
import { ModuleHeader } from '@/components/modules/ModuleHeader'
import { ModuleTabs } from '@/components/modules/ModuleTabs'
import ProgrammesDashboard from './tabs/dashboard/ProgrammesDashboard'
import ProgrammesListe from './tabs/liste/ProgrammesListe'
import BudgetsProgramme from './tabs/budgets/BudgetsProgramme'
import FinancementsProgramme from './tabs/financements/FinancementsProgramme'
import RisquesProgramme from './tabs/risques/RisquesProgramme'
import JalonsProgramme from './tabs/jalons/JalonsProgramme'
import ReportingProgramme from './tabs/reporting/ReportingProgramme'
import './ProgrammesModule.css'

export default function ProgrammesModule() {
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'dashboard'

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'liste', label: 'Liste' },
    { id: 'budgets', label: 'Budgets' },
    { id: 'financements', label: 'Financements' },
    { id: 'risques', label: 'Risques' },
    { id: 'jalons', label: 'Jalons' },
    { id: 'reporting', label: 'Reporting' },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ProgrammesDashboard />
      case 'liste':
        return <ProgrammesListe />
      case 'budgets':
        return <BudgetsProgramme />
      case 'financements':
        return <FinancementsProgramme />
      case 'risques':
        return <RisquesProgramme />
      case 'jalons':
        return <JalonsProgramme />
      case 'reporting':
        return <ReportingProgramme />
      default:
        return <ProgrammesDashboard />
    }
  }

  return (
    <div className="programmes-module">
      <ModuleHeader
        title="Programmes"
        subtitle="Gestion des programmes d'insertion"
        onRefresh={() => window.location.reload()}
      />
      <ModuleTabs tabs={tabs} defaultTab="dashboard" />
      <div className="module-tab-content">{renderTabContent()}</div>
    </div>
  )
}

