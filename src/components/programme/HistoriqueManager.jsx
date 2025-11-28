import { useState, useEffect } from 'react'
import { programmeAuditService } from '../../services/programme-audit.service'
import { toastService } from '../../services/toast.service'
import Icon from '../common/Icon'
import LoadingState from '../common/LoadingState'
import './ProgrammeComponents.css'

const ACTIONS = [
  { value: 'ALL', label: 'Toutes les actions' },
  { value: 'CREATE', label: 'Création', icon: 'Plus', color: '#10b981' },
  { value: 'UPDATE', label: 'Modification', icon: 'Edit', color: '#3b82f6' },
  { value: 'DELETE', label: 'Suppression', icon: 'Trash2', color: '#ef4444' }
]

export default function HistoriqueManager({ programmeId }) {
  const [loading, setLoading] = useState(true)
  const [historique, setHistorique] = useState([])
  const [summary, setSummary] = useState(null)
  const [filterAction, setFilterAction] = useState('ALL')
  const [filterDateDebut, setFilterDateDebut] = useState('')
  const [filterDateFin, setFilterDateFin] = useState('')

  useEffect(() => {
    if (programmeId) {
      loadHistorique()
      loadSummary()
    }
  }, [programmeId])

  useEffect(() => {
    if (programmeId) {
      loadHistorique()
    }
  }, [filterAction, filterDateDebut, filterDateFin])

  const loadHistorique = async () => {
    setLoading(true)
    try {
      const filters = {}
      if (filterAction !== 'ALL') {
        filters.action = filterAction
      }
      if (filterDateDebut) {
        filters.date_debut = filterDateDebut
      }
      if (filterDateFin) {
        filters.date_fin = filterDateFin
      }

      const { data, error } = await programmeAuditService.getAuditTrail(programmeId, filters)
      if (error) {
        toastService.error('Erreur lors du chargement de l\'historique')
      } else {
        setHistorique(data || [])
      }
    } catch (error) {
      console.error('Error loading historique:', error)
      toastService.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const loadSummary = async () => {
    try {
      const { data, error } = await programmeAuditService.getAuditSummary(programmeId)
      if (!error) {
        setSummary(data)
      }
    } catch (error) {
      console.error('Error loading summary:', error)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActionInfo = (action) => {
    return ACTIONS.find(a => a.value === action) || { label: action, icon: 'Circle', color: '#6b7280' }
  }

  const getFieldChanges = (entry) => {
    if (!entry.ancienne_valeur || !entry.nouvelle_valeur) return []
    
    const changes = []
    const oldVal = entry.ancienne_valeur
    const newVal = entry.nouvelle_valeur

    Object.keys(newVal).forEach(key => {
      if (oldVal[key] !== newVal[key]) {
        changes.push({
          champ: key,
          ancienne: oldVal[key],
          nouvelle: newVal[key]
        })
      }
    })

    return changes
  }

  const filteredHistorique = historique

  if (loading) {
    return <LoadingState message="Chargement de l'historique..." />
  }

  return (
    <div className="historique-manager">
      <div className="historique-header">
        <div>
          <h3>Historique des modifications</h3>
          <p className="historique-subtitle">Traçabilité complète de toutes les actions sur le programme</p>
        </div>
        {summary && (
          <div className="historique-summary">
            <div className="summary-card">
              <Icon name="Activity" size={20} />
              <div>
                <strong>{summary.total_actions}</strong>
                <span>Actions totales</span>
              </div>
            </div>
            {summary.derniere_modification && (
              <div className="summary-card">
                <Icon name="Clock" size={20} />
                <div>
                  <strong>{formatDate(summary.derniere_modification.created_at)}</strong>
                  <span>Dernière modification</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filtres */}
      <div className="historique-filters">
        <div className="filter-group">
          <label>Action:</label>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="input input-sm"
          >
            {ACTIONS.map(action => (
              <option key={action.value} value={action.value}>{action.label}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Date début:</label>
          <input
            type="date"
            value={filterDateDebut}
            onChange={(e) => setFilterDateDebut(e.target.value)}
            className="input input-sm"
          />
        </div>

        <div className="filter-group">
          <label>Date fin:</label>
          <input
            type="date"
            value={filterDateFin}
            onChange={(e) => setFilterDateFin(e.target.value)}
            className="input input-sm"
          />
        </div>
      </div>

      {/* Liste de l'historique */}
      {filteredHistorique.length === 0 ? (
        <div className="empty-state">
          <Icon name="History" size={32} />
          <p>Aucune action enregistrée</p>
        </div>
      ) : (
        <div className="historique-timeline">
          {filteredHistorique.map(entry => {
            const actionInfo = getActionInfo(entry.action)
            const fieldChanges = getFieldChanges(entry)

            return (
              <div key={entry.id} className="historique-item">
                <div className="historique-item-marker">
                  <div
                    className="historique-item-dot"
                    style={{
                      background: actionInfo.color,
                      borderColor: actionInfo.color
                    }}
                  >
                    <Icon name={actionInfo.icon} size={14} />
                  </div>
                  <div className="historique-item-line" />
                </div>

                <div className="historique-item-content">
                  <div className="historique-card">
                    <div className="historique-card-header">
                      <div className="historique-card-title">
                        <Icon name={actionInfo.icon} size={18} style={{ color: actionInfo.color }} />
                        <div>
                          <h4>{actionInfo.label}</h4>
                          <span className="historique-card-meta">
                            {formatDate(entry.created_at)}
                            {entry.entite_type && ` • ${entry.entite_type}`}
                          </span>
                        </div>
                      </div>
                      <span
                        className="badge"
                        style={{
                          background: actionInfo.color,
                          color: 'white',
                          borderColor: actionInfo.color
                        }}
                      >
                        {entry.action}
                      </span>
                    </div>

                    {entry.commentaire && (
                      <div className="historique-card-comment">
                        <Icon name="MessageSquare" size={14} />
                        <span>{entry.commentaire}</span>
                      </div>
                    )}

                    {fieldChanges.length > 0 && (
                      <div className="historique-card-changes">
                        <h5>Champs modifiés:</h5>
                        <div className="changes-list">
                          {fieldChanges.map((change, idx) => (
                            <div key={idx} className="change-item">
                              <strong>{change.champ}:</strong>
                              <span className="change-old">{String(change.ancienne || 'N/A')}</span>
                              <Icon name="ArrowRight" size={12} />
                              <span className="change-new">{String(change.nouvelle || 'N/A')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.champ_modifie && (
                      <div className="historique-card-field">
                        <Icon name="Hash" size={14} />
                        <span>Champ: <strong>{entry.champ_modifie}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

