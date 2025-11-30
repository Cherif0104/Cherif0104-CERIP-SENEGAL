import { Icon } from '@/components/common/Icon'
import './RapportCard.css'

export function RapportCard({ title, description, icon, onClick }) {
  return (
    <div className="rapport-card" onClick={onClick}>
      <div className="rapport-card-icon">
        <Icon name={icon} size={32} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="rapport-card-action">
        <span>Générer le rapport</span>
        <Icon name="ArrowRight" size={16} />
      </div>
    </div>
  )
}

