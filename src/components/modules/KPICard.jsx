import { Icon } from '@/components/common/Icon'
import './KPICard.css'

export const KPICard = ({
  icon,
  value,
  label,
  trend,
  variant = 'primary',
  className = '',
}) => {
  return (
    <div className={`kpi-card-modern ${className}`}>
      <div className="kpi-card-header">
        <div className={`kpi-card-icon ${variant}`}>
          <Icon name={icon} size={24} />
        </div>
        {trend && (
          <div className={`kpi-card-trend ${trend.type || 'positive'}`}>
            <Icon
              name={trend.type === 'negative' ? 'TrendingDown' : 'TrendingUp'}
              size={16}
            />
            <span>{trend.value}</span>
          </div>
        )}
      </div>
      <div className="kpi-card-value">{value}</div>
      <div className="kpi-card-label">{label}</div>
    </div>
  )
}

