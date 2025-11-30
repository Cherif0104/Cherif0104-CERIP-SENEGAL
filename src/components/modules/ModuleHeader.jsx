import { Icon } from '@/components/common/Icon'
import './ModuleHeader.css'

export const ModuleHeader = ({
  title,
  subtitle,
  actions,
  onRefresh,
  lastUpdate,
  className = '',
}) => {
  return (
    <div className={`module-header ${className}`}>
      <div className="module-header-content">
        <h1 className="module-header-title">{title}</h1>
        {subtitle && <p className="module-header-subtitle">{subtitle}</p>}
      </div>
      <div className="module-header-actions">
        {lastUpdate && (
          <div className="module-header-badge">
            Dernière MAJ : {new Date(lastUpdate).toLocaleTimeString('fr-FR')}
          </div>
        )}
        {onRefresh && (
          <button onClick={onRefresh} className="module-header-refresh">
            <Icon name="RefreshCw" size={16} />
            Actualiser
          </button>
        )}
        {actions && <div className="module-header-custom-actions">{actions}</div>}
      </div>
    </div>
  )
}

