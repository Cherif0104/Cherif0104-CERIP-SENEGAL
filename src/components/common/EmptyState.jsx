import { Inbox, Search, AlertCircle, FileX } from 'lucide-react'
import Icon from './Icon'
import './EmptyState.css'

/**
 * Composant EmptyState - Affiche un état vide avec message et action
 * 
 * @param {string} variant - Variante: 'no-data' | 'no-results' | 'error' | 'loading'
 * @param {string} icon - Nom de l'icône Lucide ou composant icône personnalisé
 * @param {string} title - Titre principal
 * @param {string} description - Description détaillée
 * @param {object} action - Action suggérée { label, onClick, variant }
 */
export default function EmptyState({ 
  variant = 'no-data',
  icon: IconProp = null,
  title = "Aucune donnée",
  description = "Il n'y a pas encore de données à afficher.",
  action = null
}) {
  // Icône par défaut selon la variante
  const getDefaultIcon = () => {
    switch (variant) {
      case 'no-results':
        return Search
      case 'error':
        return AlertCircle
      case 'loading':
        return FileX
      case 'no-data':
      default:
        return Inbox
    }
  }

  const renderIcon = () => {
    // Si on a passé un nom d'icône (string), on utilise le composant Icon centralisé
    if (typeof IconProp === 'string') {
      return <Icon name={IconProp} size={64} />
    }

    // Si on a passé un composant React, on l'utilise directement
    if (IconProp) {
      const CustomIcon = IconProp
      return <CustomIcon size={64} />
    }

    // Sinon, icône par défaut Lucide
    const DefaultIcon = getDefaultIcon()
    const DefaultIconComponent = DefaultIcon
    return <DefaultIconComponent size={64} />
  }

  return (
    <div className={`empty-state empty-state--${variant}`}>
      <div className="empty-state__icon">
        {renderIcon()}
      </div>
      <h3 className="empty-state__title">{title}</h3>
      {description && (
        <p className="empty-state__description">{description}</p>
      )}
      {action && (
        <button
          className={`cta cta-${action.variant || 'primary'}`}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

