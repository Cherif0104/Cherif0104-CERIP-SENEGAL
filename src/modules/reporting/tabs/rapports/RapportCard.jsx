import { Icon } from '@/components/common/Icon'
import './RapportCard.css'

export function RapportCard({ title, description, icon, color = '#3b82f6', onClick }) {
  return (
    <div className="rapport-card-modern" onClick={onClick} style={{ '--card-color': color }}>
      <div className="rapport-card-icon-modern">
        <Icon name={icon} size={32} />
      </div>
      <div className="rapport-card-content">
        <h3 className="rapport-card-title">{title}</h3>
        <p className="rapport-card-description">{description}</p>
      </div>
      <div className="rapport-card-action-modern">
        <span>Générer le rapport</span>
        <Icon name="ArrowRight" size={16} />
      </div>
    </div>
  )
}
