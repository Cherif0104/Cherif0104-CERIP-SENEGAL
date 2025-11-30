import { lazy, Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ModuleHeader } from '@/components/modules/ModuleHeader'
import { ModuleTabs } from '@/components/modules/ModuleTabs'
import { AdministrationDashboard } from '@/components/modules/AdministrationDashboard'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'

// Lazy loading pour améliorer les performances
const Referentiels = lazy(() => import('@/pages/admin/Referentiels'))
const UtilisateursListe = lazy(() => import('./tabs/utilisateurs/UtilisateursListe'))
const RolesPermissions = lazy(() => import('./tabs/roles/RolesPermissions'))
const ConfigurationSysteme = lazy(() => import('./tabs/configuration/ConfigurationSysteme'))
const LogsAudit = lazy(() => import('@/modules/administration/tabs/logs/LogsAudit'))

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
        return (
          <Suspense fallback={<LoadingState message="Chargement..." />}>
            <Referentiels />
          </Suspense>
        )
      case 'utilisateurs':
        return (
          <Suspense fallback={<LoadingState message="Chargement..." />}>
            <UtilisateursListe />
          </Suspense>
        )
      case 'roles':
        return (
          <Suspense fallback={<LoadingState message="Chargement..." />}>
            <RolesPermissions />
          </Suspense>
        )
      case 'configuration':
        return (
          <Suspense fallback={<LoadingState message="Chargement..." />}>
            <ConfigurationSysteme />
          </Suspense>
        )
      case 'logs':
        return (
          <Suspense fallback={<LoadingState message="Chargement..." />}>
            <LogsAudit />
          </Suspense>
        )
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

