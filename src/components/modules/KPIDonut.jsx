import { DonutChart } from './DonutChart'
import { formatCurrency } from '@/utils/format'
import './KPIDonut.css'

/**
 * Composant KPI avec Donut Chart - Style moderne et minimaliste
 * Permet la visualisation de métriques importantes avec un graphique en donut
 */
export const KPIDonut = ({
  title,
  value,
  total,
  label,
  color = '#4facfe',
  subtitle,
  onClick,
  className = '',
  formatValue = 'number', // 'number', 'currency', 'percentage'
  variant = 'default', // 'default', 'success', 'warning', 'danger'
}) => {
  const percentage = total > 0 ? (value / total) * 100 : 0
  
  // Formater la valeur selon le type
  const formatDisplayValue = (val) => {
    switch (formatValue) {
      case 'currency':
        return formatCurrency(val)
      case 'percentage':
        return `${val.toFixed(1)}%`
      default:
        return val.toLocaleString('fr-FR')
    }
  }

  const variants = {
    default: { color: '#4facfe', bg: '#eff6ff' },
    success: { color: '#10b981', bg: '#ecfdf5' },
    warning: { color: '#f59e0b', bg: '#fffbeb' },
    danger: { color: '#ef4444', bg: '#fef2f2' },
  }

  const variantStyle = variants[variant] || variants.default

  return (
    <div 
      className={`kpi-donut ${onClick ? 'clickable' : ''} ${className}`}
      onClick={onClick}
      style={{ '--kpi-color': variantStyle.color, '--kpi-bg': variantStyle.bg }}
    >
      <div className="kpi-donut-header">
        <h3 className="kpi-donut-title">{title}</h3>
      </div>
      
      <div className="kpi-donut-chart-wrapper">
        <DonutChart
          data={[
            { 
              name: 'value', 
              value: value, 
              color: variantStyle.color,
              label: label || 'Actuel'
            },
            { 
              name: 'remaining', 
              value: Math.max(0, total - value), 
              color: '#e5e7eb',
              label: 'Restant'
            }
          ]}
          centerValue={percentage.toFixed(1) + '%'}
          centerLabel={label || 'Progression'}
          height={200}
          className="kpi-donut-chart"
        />
      </div>
      
      <div className="kpi-donut-info">
        <div className="kpi-donut-values">
          <div className="kpi-donut-current-wrapper">
            <span className="kpi-donut-current">{formatDisplayValue(value)}</span>
            <span className="kpi-donut-separator">/</span>
            <span className="kpi-donut-total">{formatDisplayValue(total)}</span>
          </div>
        </div>
        {subtitle && (
          <p className="kpi-donut-subtitle">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
