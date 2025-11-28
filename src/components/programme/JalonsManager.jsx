import { useState, useEffect } from 'react'
import { programmeJalonsService } from '../../services/programme-jalons.service'
import { toastService } from '../../services/toast.service'
import Icon from '../common/Icon'
import LoadingState from '../common/LoadingState'
import JalonForm from './JalonForm'
import './ProgrammeComponents.css'

const STATUTS = [
  { value: 'PREVU', label: 'Prévu', color: '#6b7280', icon: 'Clock' },
  { value: 'EN_COURS', label: 'En cours', color: '#3b82f6', icon: 'Loader' },
  { value: 'ATTEINT', label: 'Atteint', color: '#10b981', icon: 'CheckCircle' },
  { value: 'RETARDE', label: 'Retardé', color: '#f59e0b', icon: 'AlertTriangle' },
  { value: 'ANNULE', label: 'Annulé', color: '#ef4444', icon: 'XCircle' }
]

export default function JalonsManager({ programmeId, mode = 'edit' }) {
  const [loading, setLoading] = useState(true)
  const [jalons, setJalons] = useState([])
  const [avancement, setAvancement] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingJalon, setEditingJalon] = useState(null)
  const [filterStatut, setFilterStatut] = useState('ALL')

  const isEditMode = mode === 'edit'

  useEffect(() => {
    if (programmeId) {
      loadJalons()
      loadAvancement()
    }
  }, [programmeId])

  const loadJalons = async () => {
    setLoading(true)
    try {
      const filters = filterStatut !== 'ALL' ? { statut: filterStatut } : {}
      const { data, error } = await programmeJalonsService.getAll(programmeId, filters)
      if (error) {
        toastService.error('Erreur lors du chargement des jalons')
      } else {
        setJalons(data || [])
      }
    } catch (error) {
      console.error('Error loading jalons:', error)
      toastService.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const loadAvancement = async () => {
    try {
      const { data, error } = await programmeJalonsService.getAvancement(programmeId)
      if (!error) {
        setAvancement(data)
      }
    } catch (error) {
      console.error('Error loading avancement:', error)
    }
  }

  useEffect(() => {
    if (programmeId) {
      loadJalons()
    }
  }, [filterStatut])

  const handleCreate = () => {
    setEditingJalon(null)
    setShowForm(true)
  }

  const handleEdit = (jalon) => {
    setEditingJalon(jalon)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce jalon ?')) {
      return
    }

    try {
      const { error } = await programmeJalonsService.delete(id)
      if (error) {
        toastService.error('Erreur lors de la suppression')
      } else {
        toastService.success('Jalon supprimé avec succès')
        await loadJalons()
        await loadAvancement()
      }
    } catch (error) {
      console.error('Error deleting jalon:', error)
      toastService.error('Erreur lors de la suppression')
    }
  }

  const handleMarkAtteint = async (id) => {
    try {
      const { error } = await programmeJalonsService.markAtteint(id)
      if (error) {
        toastService.error('Erreur lors de la mise à jour')
      } else {
        toastService.success('Jalon marqué comme atteint')
        await loadJalons()
        await loadAvancement()
      }
    } catch (error) {
      console.error('Error marking jalon:', error)
      toastService.error('Erreur lors de la mise à jour')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const getStatutInfo = (statut) => {
    return STATUTS.find(s => s.value === statut) || STATUTS[0]
  }

  const isRetarde = (jalon) => {
    if (jalon.statut === 'ATTEINT' || jalon.statut === 'ANNULE') return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const datePrevue = new Date(jalon.date_prevue)
    datePrevue.setHours(0, 0, 0, 0)
    return datePrevue < today
  }

  const filteredJalons = jalons

  if (loading) {
    return <LoadingState message="Chargement des jalons..." />
  }

  return (
    <div className="jalons-manager">
      <div className="jalons-header">
        <div>
          <h3>Jalons du programme</h3>
          {avancement && (
            <div className="jalons-summary">
              <div className="summary-item">
                <strong>{avancement.jalons_atteints}</strong>/{avancement.total_jalons} atteints
              </div>
              <div className="summary-item summary-item--progress">
                <strong>{avancement.taux_avancement?.toFixed(1) || 0}%</strong> d'avancement
              </div>
              {avancement.jalons_retardes > 0 && (
                <div className="summary-item summary-item--warning">
                  <Icon name="AlertTriangle" size={14} />
                  <strong>{avancement.jalons_retardes}</strong> en retard
                </div>
              )}
            </div>
          )}
        </div>
        {isEditMode && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCreate}
          >
            <Icon name="Plus" size={16} />
            Ajouter un jalon
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="jalons-filters">
        <div className="filter-group">
          <label>Statut:</label>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="input input-sm"
          >
            <option value="ALL">Tous les statuts</option>
            {STATUTS.map(statut => (
              <option key={statut.value} value={statut.value}>{statut.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste des jalons */}
      {filteredJalons.length === 0 ? (
        <div className="empty-state">
          <Icon name="Calendar" size={32} />
          <p>Aucun jalon {filterStatut !== 'ALL' ? 'correspondant au filtre' : ''}</p>
          {isEditMode && filterStatut === 'ALL' && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreate}
            >
              Ajouter le premier jalon
            </button>
          )}
        </div>
      ) : (
        <div className="jalons-list">
          {filteredJalons.map(jalon => {
            const statutInfo = getStatutInfo(jalon.statut)
            const retard = isRetarde(jalon)

            return (
              <div key={jalon.id} className={`jalon-card ${retard ? 'jalon-card--retarde' : ''}`}>
                <div className="jalon-card-header">
                  <div className="jalon-card-title">
                    <Icon name={statutInfo.icon} size={20} style={{ color: statutInfo.color }} />
                    <div>
                      <h4>{jalon.libelle}</h4>
                      <span className="jalon-card-meta">
                        Prévu le: {formatDate(jalon.date_prevue)}
                        {jalon.date_reelle && ` • Atteint le: ${formatDate(jalon.date_reelle)}`}
                      </span>
                    </div>
                  </div>
                  <div className="jalon-card-badges">
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
                    {retard && (
                      <span className="badge badge--warning">
                        <Icon name="AlertTriangle" size={12} />
                        En retard
                      </span>
                    )}
                  </div>
                </div>

                {jalon.description && (
                  <div className="jalon-card-body">
                    <p>{jalon.description}</p>
                  </div>
                )}

                {jalon.livrables && (
                  <div className="jalon-card-livrables">
                    <Icon name="Package" size={14} />
                    <span><strong>Livrables:</strong> {jalon.livrables}</span>
                  </div>
                )}

                <div className="jalon-card-actions">
                  {jalon.statut !== 'ATTEINT' && isEditMode && (
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      onClick={() => handleMarkAtteint(jalon.id)}
                    >
                      <Icon name="CheckCircle" size={14} />
                      Marquer atteint
                    </button>
                  )}
                  {isEditMode && (
                    <>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleEdit(jalon)}
                      >
                        <Icon name="Edit" size={14} />
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="btn-icon btn-icon--danger"
                        onClick={() => handleDelete(jalon.id)}
                        title="Supprimer"
                      >
                        <Icon name="Trash2" size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Formulaire modal */}
      {showForm && (
        <JalonForm
          programmeId={programmeId}
          jalon={editingJalon}
          onSave={() => {
            setShowForm(false)
            setEditingJalon(null)
            loadJalons()
            loadAvancement()
          }}
          onCancel={() => {
            setShowForm(false)
            setEditingJalon(null)
          }}
        />
      )}
    </div>
  )
}

