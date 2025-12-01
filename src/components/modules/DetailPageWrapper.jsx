import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import './DetailPageWrapper.css'

/**
 * Composant wrapper générique pour les pages de détail
 * Permet de créer des pages détaillées cohérentes avec sections, graphiques, actions et timeline
 */
export const DetailPageWrapper = ({
  title,
  subtitle,
  data,
  sections = [],
  actions = [],
  charts = [],
  timeline = null,
  onBack,
  className = '',
}) => {
  return (
    <div className={`detail-page-wrapper ${className}`}>
      {/* Header */}
      <div className="detail-page-header">
        <div className="detail-page-header-left">
          {onBack && (
            <Button variant="outline" onClick={onBack} className="detail-page-back">
              <Icon name="ArrowLeft" size={16} />
              Retour
            </Button>
          )}
          <div className="detail-page-title-section">
            <h1 className="detail-page-title">{title}</h1>
            {subtitle && <p className="detail-page-subtitle">{subtitle}</p>}
          </div>
        </div>
        {actions.length > 0 && (
          <div className="detail-page-actions">
            {actions.map((action, idx) => (
              <Button key={idx} {...action} />
            ))}
          </div>
        )}
      </div>

      {/* Charts Section */}
      {charts.length > 0 && (
        <div className="detail-page-charts">
          {charts.map((chart, idx) => (
            <div key={idx} className="detail-chart-card">
              {chart}
            </div>
          ))}
        </div>
      )}

      {/* Sections */}
      {sections.length > 0 && (
        <div className="detail-page-sections">
          {sections.map((section, idx) => (
            <div key={idx} className="detail-section">
              {section.title && <h2 className="detail-section-title">{section.title}</h2>}
              <div className="detail-section-content">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timeline */}
      {timeline && (
        <div className="detail-page-timeline">
          <h2 className="detail-timeline-title">Historique et Événements</h2>
          <div className="detail-timeline-content">
            {timeline}
          </div>
        </div>
      )}
    </div>
  )
}
