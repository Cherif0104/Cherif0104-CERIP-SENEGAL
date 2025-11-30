import { useSearchParams } from 'react-router-dom'
import { ModuleHeader } from '@/components/modules/ModuleHeader'
import { ModuleTabs } from '@/components/modules/ModuleTabs'
import PartenairesDashboard from './tabs/dashboard/PartenairesDashboard'
import OrganismesListe from './tabs/organismes/OrganismesListe'
import FinanceursListe from './tabs/financeurs/FinanceursListe'
import PartenairesListe from './tabs/partenaires/PartenairesListe'
import StructuresListe from './tabs/structures/StructuresListe'
import './PartenairesModule.css'

export default function PartenairesModule() {
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'dashboard'

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'organismes', label: 'Organismes Internationaux' },
    { id: 'financeurs', label: 'Financeurs' },
    { id: 'partenaires', label: 'Partenaires' },
    { id: 'structures', label: 'Structures' },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <PartenairesDashboard />
      case 'organismes':
        return <OrganismesListe />
      case 'financeurs':
        return <FinanceursListe />
      case 'partenaires':
        return <PartenairesListe />
      case 'structures':
        return <StructuresListe />
      default:
        return <PartenairesDashboard />
    }
  }

  return (
    <div className="partenaires-module">
      <ModuleHeader
        title="Partenaires & Structures"
        subtitle="Gestion des partenaires, financeurs et structures"
        onRefresh={() => window.location.reload()}
      />
      <ModuleTabs tabs={tabs} defaultTab="dashboard" />
      <div className="module-tab-content">{renderTabContent()}</div>
    </div>
  )
}

