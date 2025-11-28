import { useMemo } from 'react'
import Icon from '../common/Icon'
import './ProgrammeComponents.css'

const STATUTS = [
  { value: 'PREVU', label: 'Prévu', color: '#6b7280', icon: 'Calendar' },
  { value: 'CONFIRME', label: 'Confirmé', color: '#3b82f6', icon: 'CheckCircle' },
  { value: 'RECU', label: 'Reçu', color: '#10b981', icon: 'CheckCircle2' },
  { value: 'RETARDE', label: 'Retardé', color: '#f59e0b', icon: 'Clock' },
  { value: 'ANNULE', label: 'Annulé', color: '#ef4444', icon: 'XCircle' }
]

export default function FinancementTimeline({ financements = [] }) {
  const sortedFinancements = useMemo(() => {
    return [...financements].sort((a, b) => {
      const dateA = new Date(a.date_prevue || 0)
      const dateB = new Date(b.date_prevue || 0)
      return dateA - dateB
    })
  }, [financements])

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '0'
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatutInfo = (statut) => {
    return STATUTS.find(s => s.value === statut) || STATUTS[0]
  }

  const isRetard = (financement) => {
    if (!financement.date_prevue) return false
    if (financement.statut === 'RECU' || financement.statut === 'ANNULE') return false
    return new Date(financement.date_prevue) < new Date()
  }

  if (sortedFinancements.length === 0) {
    return null
  }

  return (
    <div className="financement-timeline">
      <h4>Timeline des versements</h4>
      <div className="timeline-container">
        {sortedFinancements.map((financement, index) => {
          const statutInfo = getStatutInfo(financement.statut)
          const retard = isRetard(financement)
          const isLast = index === sortedFinancements.length - 1

          return (
            <div key={financement.id} className="timeline-item">
              <div className="timeline-marker">
                <div 
                  className="timeline-dot"
                  style={{ 
                    background: statutInfo.color,
                    borderColor: statutInfo.color
                  }}
                >
                  <Icon name={statutInfo.icon} size={12} />
                </div>
                {!isLast && <div className="timeline-line" />}
              </div>

              <div className="timeline-content">
                <div className={`timeline-card ${retard ? 'timeline-card--retard' : ''}`}>
                  <div className="timeline-card-header">
                    <div className="timeline-card-title">
                      <Icon name={statutInfo.icon} size={18} style={{ color: statutInfo.color }} />
                      <div>
                        <h5>{formatCurrency(financement.montant)}</h5>
                        <span className="timeline-card-statut" style={{ color: statutInfo.color }}>
                          {statutInfo.label}
                        </span>
                      </div>
                    </div>
                    {retard && (
                      <span className="badge badge--warning">
                        <Icon name="AlertTriangle" size={12} />
                        Retard
                      </span>
                    )}
                  </div>

                  <div className="timeline-card-body">
                    <div className="timeline-card-info">
                      <div className="info-row">
                        <Icon name="Calendar" size={14} />
                        <span><strong>Prévu:</strong> {formatDate(financement.date_prevue)}</span>
                      </div>
                      {financement.date_effective && (
                        <div className="info-row">
                          <Icon name="CheckCircle" size={14} />
                          <span><strong>Effectif:</strong> {formatDate(financement.date_effective)}</span>
                        </div>
                      )}
                      {financement.numero_versement && (
                        <div className="info-row">
                          <Icon name="Hash" size={14} />
                          <span><strong>N°:</strong> {financement.numero_versement}</span>
                        </div>
                      )}
                    </div>

                    {financement.description && (
                      <div className="timeline-card-description">
                        <p>{financement.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

