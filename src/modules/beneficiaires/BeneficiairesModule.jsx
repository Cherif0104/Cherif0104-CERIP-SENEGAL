import { useSearchParams } from 'react-router-dom'
import { ModuleHeader } from '@/components/modules/ModuleHeader'
import { ModuleTabs } from '@/components/modules/ModuleTabs'
import { BeneficiairesDashboard } from '@/components/modules/BeneficiairesDashboard'
import Beneficiaires from '@/pages/beneficiaires/Beneficiaires'
import FormationsTab from './tabs/formations/FormationsTab'
import AccompagnementsTab from './tabs/accompagnements/AccompagnementsTab'
import SuiviTab from './tabs/suivi/SuiviTab'
import './BeneficiairesModule.css'

export default function BeneficiairesModule() {
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'dashboard'

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'liste', label: 'Liste' },
    { id: 'formations', label: 'Formations' },
    { id: 'accompagnements', label: 'Accompagnements' },
    { id: 'suivi', label: 'Suivi' },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <BeneficiairesDashboard />
      case 'liste':
        return <Beneficiaires />
      case 'formations':
        return <FormationsTab />
      case 'accompagnements':
        return <AccompagnementsTab />
      case 'suivi':
        return <SuiviTab />
      default:
        return <BeneficiairesDashboard />
    }
  }

  return (
    <div className="beneficiaires-module">
      <ModuleHeader title="Bénéficiaires" subtitle="Gestion des bénéficiaires" />
      <ModuleTabs tabs={tabs} defaultTab="dashboard" />
      <div className="module-tab-content">{renderTabContent()}</div>
    </div>
  )
}

