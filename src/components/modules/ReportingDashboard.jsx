import { KPICard } from './KPICard'

export const ReportingDashboard = () => {
  return (
    <div className="kpi-grid-modern">
      <KPICard icon="FileText" value={0} label="Rapports générés" variant="primary" />
      <KPICard icon="Clock" value={0} label="En attente" variant="warning" />
      <KPICard icon="CheckCircle" value="0%" label="Taux de complétion" variant="success" />
      <KPICard icon="Download" value={0} label="Exports" variant="accent" />
    </div>
  )
}

