import { formatDate } from '@/utils/format'
import './Timeline.css'

/**
 * Timeline - Composant pour afficher une timeline de jalons
 * @param {Object} props
 * @param {Array} props.jalons - Array de jalons {id, libelle, date_prevue, date_reelle, statut, ordre}
 * @param {Function} props.onJalonClick - Callback appelé quand on clique sur un jalon
 */
export function Timeline({ jalons = [], onJalonClick = null }) {
  if (!jalons || jalons.length === 0) {
    return <div className="timeline-empty">Aucun jalon à afficher</div>
  }

  // Trier par ordre ou date
  const sortedJalons = [...jalons].sort((a, b) => {
    if (a.ordre !== undefined && b.ordre !== undefined) {
      return a.ordre - b.ordre
    }
    return new Date(a.date_prevue) - new Date(b.date_prevue)
  })

  const getStatutClass = (statut) => {
    const statutLower = statut?.toLowerCase() || ''
    if (statutLower.includes('termine') || statutLower.includes('reussi')) return 'statut-success'
    if (statutLower.includes('en_cours') || statutLower.includes('en cours')) return 'statut-active'
    if (statutLower.includes('retard') || statutLower.includes('en_retard')) return 'statut-warning'
    if (statutLower.includes('annule')) return 'statut-cancelled'
    return 'statut-pending'
  }

  const isRetard = (jalon) => {
    if (!jalon.date_prevue) return false
    const datePrevue = new Date(jalon.date_prevue)
    const aujourdhui = new Date()
    const estEnRetard = datePrevue < aujourdhui
    const pasTermine = !jalon.statut?.toLowerCase().includes('termine')
    return estEnRetard && pasTermine
  }

  return (
    <div className="timeline-container">
      {sortedJalons.map((jalon, index) => (
        <div key={jalon.id || index} className={`timeline-item ${isRetard(jalon) ? 'timeline-retard' : ''}`}>
          <div className="timeline-marker">
            <div className={`timeline-dot ${getStatutClass(jalon.statut)}`} />
            {index < sortedJalons.length - 1 && <div className="timeline-line" />}
          </div>
          <div className="timeline-content">
            <div className="timeline-header">
              <h4 
                className={`timeline-title ${onJalonClick ? 'clickable' : ''}`}
                onClick={onJalonClick ? () => onJalonClick(jalon) : undefined}
                style={onJalonClick ? { cursor: 'pointer' } : {}}
              >
                {jalon.libelle}
              </h4>
              <span className={`timeline-statut ${getStatutClass(jalon.statut)}`}>
                {jalon.statut || 'En attente'}
              </span>
            </div>
            {jalon.description && (
              <p className="timeline-description">{jalon.description}</p>
            )}
            <div className="timeline-dates">
              <span className="timeline-date">
                <strong>Prévu :</strong> {formatDate(jalon.date_prevue)}
              </span>
              {jalon.date_reelle && (
                <span className="timeline-date">
                  <strong>Réalisé :</strong> {formatDate(jalon.date_reelle)}
                </span>
              )}
            </div>
            {jalon.livrables && (
              <div className="timeline-livrables">
                <strong>Livrables :</strong> {jalon.livrables}
              </div>
            )}
            {isRetard(jalon) && (
              <div className="timeline-alert">
                ⚠️ Jalon en retard
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

