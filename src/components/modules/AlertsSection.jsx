import { Icon } from '@/components/common/Icon'
import './AlertsSection.css'

export const AlertsSection = ({ alerts = [], className = '' }) => {
  if (alerts.length === 0) {
    return null
  }

  const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
  const sortedAlerts = [...alerts].sort(
    (a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
  )

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'AlertCircle'
      case 'HIGH':
        return 'AlertTriangle'
      case 'MEDIUM':
        return 'Info'
      case 'LOW':
        return 'Bell'
      default:
        return 'Info'
    }
  }

  return (
    <div className={`alerts-section-modern ${className}`}>
      <h3 className="alerts-section-title">
        <Icon name="AlertCircle" size={20} />
        Alertes ({alerts.length})
      </h3>
      <div className="alerts-list">
        {sortedAlerts.map((alert, index) => (
          <div key={index} className={`alert-item ${alert.priority || 'LOW'}`}>
            <Icon
              name={getPriorityIcon(alert.priority)}
              size={20}
              className="alert-icon"
            />
            <div className="alert-content">
              <div className="alert-item-title">{alert.title}</div>
              {alert.description && (
                <div className="alert-item-description">{alert.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

