import { KPICard } from './KPICard'

export const AdministrationDashboard = () => {
  return (
    <div className="kpi-grid-modern">
      <KPICard icon="Users" value={0} label="Utilisateurs actifs" variant="primary" />
      <KPICard icon="Database" value={0} label="Référentiels" variant="secondary" />
      <KPICard icon="Settings" value={0} label="Configuration" variant="accent" />
    </div>
  )
}

