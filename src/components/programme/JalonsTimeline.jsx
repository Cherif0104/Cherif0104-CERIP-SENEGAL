import { useState, useEffect } from 'react'
import { programmeJalonsService } from '../../services/programme-jalons.service'
import { toastService } from '../../services/toast.service'
import Icon from '../common/Icon'
import LoadingState from '../common/LoadingState'
import './ProgrammeComponents.css'

const STATUTS = [
  { value: 'PREVU', label: 'Prévu', color: '#6b7280' },
  { value: 'EN_COURS', label: 'En cours', color: '#3b82f6' },
  { value: 'ATTEINT', label: 'Atteint', color: '#10b981' },
  { value: 'RETARDE', label: 'Retardé', color: '#f59e0b' },
  { value: 'ANNULE', label: 'Annulé', color: '#ef4444' }
]

export default function JalonsTimeline({ programmeId }) {
  const [loading, setLoading] = useState(true)
  const [jalons, setJalons] = useState([])
  const [avancement, setAvancement] = useState(null)
  const [jalonsRetardes, setJalonsRetardes] = useState([])

  useEffect(() => {
    if (programmeId) {
      loadData()
    }
  }, [programmeId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [jalonsRes, avancementRes, retardesRes] = await Promise.all([
        programmeJalonsService.getAll(programmeId),
        programmeJalonsService.getAvancement(programmeId),
        programmeJalonsService.getJalonsRetardes(programmeId)
      ])

      if (!jalonsRes.error) {
        setJalons(jalonsRes.data || [])
      }

      if (!avancementRes.error) {
        setAvancement(avancementRes.data)
      }

      if (!retardesRes.error) {
        setJalonsRetardes(retardesRes.data || [])
      }
    } catch (error) {
      console.error('Error loading timeline data:', error)
      toastService.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
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

  const getDaysDifference = (date1, date2) => {
    if (!date1 || !date2) return 0
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24))
  }

  const getTimelineRange = () => {
    if (jalons.length === 0) return { min: null, max: null }

    const dates = jalons
      .map(j => [j.date_prevue, j.date_reelle])
      .flat()
      .filter(Boolean)
      .map(d => new Date(d))

    if (dates.length === 0) return { min: null, max: null }

    return {
      min: new Date(Math.min(...dates)),
      max: new Date(Math.max(...dates))
    }
  }

  const getPositionOnTimeline = (date, range) => {
    if (!date || !range.min || !range.max) return 0
    const dateObj = new Date(date)
    const total = range.max - range.min
    const position = dateObj - range.min
    return (position / total) * 100
  }

  if (loading) {
    return <LoadingState message="Chargement de la timeline..." />
  }

  const range = getTimelineRange()

  return (
    <div className="jalons-timeline">
      <div className="timeline-header">
        <h3>Timeline des jalons</h3>
        {avancement && (
          <div className="timeline-summary">
            <div className="summary-badge">
              <Icon name="Target" size={16} />
              <span>{avancement.taux_avancement?.toFixed(1) || 0}%</span>
            </div>
            {jalonsRetardes.length > 0 && (
              <div className="summary-badge summary-badge--warning">
                <Icon name="AlertTriangle" size={16} />
                <span>{jalonsRetardes.length} en retard</span>
              </div>
            )}
          </div>
        )}
      </div>

      {jalons.length === 0 ? (
        <div className="empty-state">
          <Icon name="Calendar" size={32} />
          <p>Aucun jalon défini</p>
        </div>
      ) : (
        <>
          {/* Timeline visuelle */}
          <div className="timeline-container">
            <div className="timeline-line">
              {jalons.map((jalon, index) => {
                const statutInfo = getStatutInfo(jalon.statut)
                const positionPrevue = getPositionOnTimeline(jalon.date_prevue, range)
                const positionReelle = jalon.date_reelle ? getPositionOnTimeline(jalon.date_reelle, range) : null
                const isRetarde = jalon.statut !== 'ATTEINT' && jalon.statut !== 'ANNULE' && 
                                  new Date(jalon.date_prevue) < new Date()

                return (
                  <div
                    key={jalon.id}
                    className="timeline-marker"
                    style={{ left: `${positionPrevue}%` }}
                  >
                    <div
                      className={`timeline-dot ${isRetarde ? 'timeline-dot--retarde' : ''}`}
                      style={{
                        background: statutInfo.color,
                        borderColor: statutInfo.color
                      }}
                      title={jalon.libelle}
                    >
                      <Icon name={statutInfo.value === 'ATTEINT' ? 'CheckCircle' : 'Circle'} size={12} />
                    </div>
                    {positionReelle && positionReelle !== positionPrevue && (
                      <div
                        className="timeline-dot timeline-dot--reelle"
                        style={{ left: `${positionReelle - positionPrevue}%` }}
                        title={`Atteint le ${formatDate(jalon.date_reelle)}`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Liste des jalons avec dates */}
          <div className="timeline-jalons-list">
            {jalons.map((jalon, index) => {
              const statutInfo = getStatutInfo(jalon.statut)
              const isRetarde = jalon.statut !== 'ATTEINT' && jalon.statut !== 'ANNULE' && 
                                new Date(jalon.date_prevue) < new Date()
              const joursRetard = isRetarde ? getDaysDifference(jalon.date_prevue, new Date()) : 0

              return (
                <div key={jalon.id} className={`timeline-jalon-item ${isRetarde ? 'timeline-jalon-item--retarde' : ''}`}>
                  <div className="timeline-jalon-marker">
                    <div
                      className="timeline-jalon-dot"
                      style={{
                        background: statutInfo.color,
                        borderColor: statutInfo.color
                      }}
                    >
                      <Icon name={statutInfo.value === 'ATTEINT' ? 'CheckCircle' : 'Circle'} size={14} />
                    </div>
                    {index < jalons.length - 1 && <div className="timeline-jalon-line" />}
                  </div>

                  <div className="timeline-jalon-content">
                    <div className="timeline-jalon-header">
                      <div>
                        <h4>{jalon.libelle}</h4>
                        <div className="timeline-jalon-dates">
                          <span>
                            <Icon name="Calendar" size={12} />
                            Prévu: {formatDate(jalon.date_prevue)}
                          </span>
                          {jalon.date_reelle && (
                            <span>
                              <Icon name="CheckCircle" size={12} />
                              Atteint: {formatDate(jalon.date_reelle)}
                            </span>
                          )}
                          {isRetarde && (
                            <span className="text-warning">
                              <Icon name="AlertTriangle" size={12} />
                              {joursRetard} jour{joursRetard > 1 ? 's' : ''} de retard
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className="badge"
                        style={{
                          background: statutInfo.color,
                          color: 'white',
                          borderColor: statutInfo.color
                        }}
                      >
                        {statutInfo.label}
                      </span>
                    </div>

                    {jalon.description && (
                      <p className="timeline-jalon-description">{jalon.description}</p>
                    )}

                    {jalon.livrables && (
                      <div className="timeline-jalon-livrables">
                        <Icon name="Package" size={12} />
                        <span>{jalon.livrables}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

