import { Icon } from './Icon'
import './EmptyState.css'

export const EmptyState = ({ 
  icon = 'Inbox', 
  title = 'Aucun élément', 
  message = 'Il n\'y a pas encore d\'éléments à afficher.',
  action,
  actionLabel
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon name={icon} size={64} color="var(--text-tertiary)" />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {action && actionLabel && (
        <button onClick={action} className="empty-state-action">
          {actionLabel}
        </button>
      )}
    </div>
  )
}

