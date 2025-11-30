import { useSearchParams } from 'react-router-dom'
import { ModuleHeader } from '@/components/modules/ModuleHeader'
import { ModuleTabs } from '@/components/modules/ModuleTabs'
import { IntervenantsDashboard } from '@/components/modules/IntervenantsDashboard'
import MentorsListe from './tabs/mentors/MentorsListe'
import PortailMentor from './tabs/portails/PortailMentor'
import PortailFormateur from './tabs/portails/PortailFormateur'
import PortailCoach from './tabs/portails/PortailCoach'
import './IntervenantsModule.css'

export default function IntervenantsModule() {
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'dashboard'

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'mentors', label: 'Mentors' },
    { id: 'portail-mentor', label: 'Portail Mentor' },
    { id: 'portail-formateur', label: 'Portail Formateur' },
    { id: 'portail-coach', label: 'Portail Coach' },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <IntervenantsDashboard />
      case 'mentors':
        return <MentorsListe />
      case 'portail-mentor':
        return <PortailMentor />
      case 'portail-formateur':
        return <PortailFormateur />
      case 'portail-coach':
        return <PortailCoach />
      default:
        return <IntervenantsDashboard />
    }
  }

  return (
    <div className="intervenants-module">
      <ModuleHeader title="Intervenants" subtitle="Gestion des intervenants" />
      <ModuleTabs tabs={tabs} defaultTab="dashboard" />
      <div className="module-tab-content">{renderTabContent()}</div>
    </div>
  )
}

