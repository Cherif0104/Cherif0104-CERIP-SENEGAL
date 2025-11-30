import { useSearchParams } from 'react-router-dom'
import { ModuleHeader } from '@/components/modules/ModuleHeader'
import { ModuleTabs } from '@/components/modules/ModuleTabs'
import { AdministrationDashboard } from '@/components/modules/AdministrationDashboard'
import Referentiels from '@/pages/admin/Referentiels'
import UtilisateursListe from './tabs/utilisateurs/UtilisateursListe'
import RolesPermissions from './tabs/roles/RolesPermissions'
import ConfigurationSysteme from './tabs/configuration/ConfigurationSysteme'
import LogsAudit from './tabs/logs/LogsAudit'
import { EmptyState } from '@/components/common/EmptyState'

export default function AdministrationModule() {
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'dashboard'

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'referentiels', label: 'Référentiels' },
    { id: 'utilisateurs', label: 'Utilisateurs' },
    { id: 'roles', label: 'Rôles & Permissions' },
    { id: 'configuration', label: 'Configuration' },
    { id: 'logs', label: 'Logs & Audit' },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdministrationDashboard />
      case 'referentiels':
        return <Referentiels />
      case 'utilisateurs':
        return <UtilisateursListe />
      case 'roles':
        return <RolesPermissions />
      case 'configuration':
        return <ConfigurationSysteme />
      case 'logs':
        return <LogsAudit />
      default:
        return <EmptyState icon="Settings" title={`Onglet ${activeTab}`} message="À implémenter" />
    }
  }

  return (
    <div>
      <ModuleHeader title="Administration" subtitle="Gestion administrative" />
      <ModuleTabs tabs={tabs} defaultTab="dashboard" />
      <div className="module-tab-content">{renderTabContent()}</div>
    </div>
  )
}

