import { Icon } from '@/components/common/Icon'
import './KPIWithChart.css'

/**
 * Composant KPI avec mini graphique de tendance (inspiré du dashboard healthcare)
 */
export const KPIWithChart = ({
  icon,
  value,
  label,
  trend,
  chartData = [],
  variant = 'primary',
  className = '',
  subtitle,
}) => {
  // Générer les points du mini graphique si des données sont fournies
  const renderMiniChart = () => {
    if (!chartData || chartData.length === 0) return null

    const maxValue = Math.max(...chartData.map(d => d.value || 0), 1)
    const points = chartData.map((d, index) => {
      const x = (index / (chartData.length - 1 || 1)) * 100
      const y = 100 - ((d.value || 0) / maxValue) * 80 // 80% de la hauteur pour laisser de la marge
      return `${x},${y}`
    }).join(' ')

    return (
      <svg className="kpi-mini-chart" viewBox="0 0 100 60" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />
        <polygon
          points={`0,60 ${points} 100,60`}
          fill="currentColor"
          opacity="0.1"
        />
      </svg>
    )
  }

  return (
    <div className={`kpi-with-chart ${variant} ${className}`}>
      <div className="kpi-with-chart-header">
        <div className="kpi-with-chart-icon">
          <Icon name={icon} size={20} />
        </div>
        {trend && (
          <div className={`kpi-with-chart-trend ${trend.type || 'positive'}`}>
            <Icon
              name={trend.type === 'negative' ? 'TrendingDown' : 'TrendingUp'}
              size={14}
            />
            <span>{trend.value}</span>
          </div>
        )}
      </div>
      <div className="kpi-with-chart-value">{value}</div>
      <div className="kpi-with-chart-label">{label}</div>
      {subtitle && <div className="kpi-with-chart-subtitle">{subtitle}</div>}
      {renderMiniChart()}
    </div>
  )
}

