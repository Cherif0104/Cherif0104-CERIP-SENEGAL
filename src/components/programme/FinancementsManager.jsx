import { useState, useEffect } from 'react'
import { programmeFinancementsService } from '../../services/programme-financements.service'
import { referentielsService } from '../../services/referentiels.service'
import { toastService } from '../../services/toast.service'
import Icon from '../common/Icon'
import LoadingState from '../common/LoadingState'
import FinancementForm from './FinancementForm'
import FinancementTimeline from './FinancementTimeline'
import './ProgrammeComponents.css'

const STATUTS = [
  { value: 'PREVU', label: 'Prévu', color: '#6b7280', icon: 'Calendar' },
  { value: 'CONFIRME', label: 'Confirmé', color: '#3b82f6', icon: 'CheckCircle' },
  { value: 'RECU', label: 'Reçu', color: '#10b981', icon: 'CheckCircle2' },
  { value: 'RETARDE', label: 'Retardé', color: '#f59e0b', icon: 'Clock' },
  { value: 'ANNULE', label: 'Annulé', color: '#ef4444', icon: 'XCircle' }
]

export default function FinancementsManager({ programmeId, mode = 'edit' }) {
  const [loading, setLoading] = useState(true)
  const [financements, setFinancements] = useState([])
  const [summary, setSummary] = useState(null)
  const [financeurs, setFinanceurs] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [filterStatut, setFilterStatut] = useState('ALL')

  const isEditMode = mode === 'edit'

  useEffect(() => {
    if (programmeId) {
      loadAll()
    }
  }, [programmeId])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [financementsRes, summaryRes, financeursRes] = await Promise.all([
        programmeFinancementsService.getAll(programmeId),
        programmeFinancementsService.getSummary(programmeId),
        referentielsService.getByType('FINANCEUR_PROGRAMME')
      ])

      if (!financementsRes.error) {
        setFinancements(financementsRes.data || [])
      }

      if (!summaryRes.error) {
        setSummary(summaryRes.data)
      }

      if (!financeursRes.error) {
        setFinanceurs(financeursRes.data || [])
      }
    } catch (error) {
      console.error('Error loading financements:', error)
      toastService.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingId(null)
    setShowForm(true)
  }

  const handleEdit = (financement) => {
    setEditingId(financement.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    await loadAll()
    setShowForm(false)
    setEditingId(null)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce financement ?')) {
      return
    }

    try {
      const { error } = await programmeFinancementsService.delete(id)
      if (error) {
        toastService.error('Erreur lors de la suppression')
      } else {
        toastService.success('Financement supprimé avec succès')
        await loadAll()
      }
    } catch (error) {
      console.error('Error deleting financement:', error)
      toastService.error('Erreur lors de la suppression')
    }
  }

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '0'
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(value)
  }

  const getStatutInfo = (statut) => {
    return STATUTS.find(s => s.value === statut) || STATUTS[0]
  }

  const getFinanceurLabel = (financeurId) => {
    if (!financeurId) return 'Non spécifié'
    const financeur = financeurs.find(f => f.code === financeurId || f.id === financeurId)
    return financeur ? financeur.label : financeurId
  }

  const filteredFinancements = filterStatut === 'ALL'
    ? financements
    : financements.filter(f => f.statut === filterStatut)

  if (loading) {
    return <LoadingState message="Chargement des financements..." />
  }

  return (
    <div className="financements-manager">
      <div className="financements-header">
        <div>
          <h3>Financements</h3>
          {summary && (
            <div className="financements-summary">
              <span className="summary-item">
                <strong>Total prévu:</strong> {formatCurrency(summary.total_prevu)}
              </span>
              <span className="summary-item">
                <strong>Reçu:</strong> {formatCurrency(summary.total_recu)}
              </span>
              <span className="summary-item">
                <strong>En attente:</strong> {formatCurrency(summary.total_attendu - summary.total_recu)}
              </span>
            </div>
          )}
        </div>
        {isEditMode && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleAdd}
          >
            <Icon name="Plus" size={16} />
            Ajouter un financement
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="financements-filters">
        <button
          className={`filter-btn ${filterStatut === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilterStatut('ALL')}
        >
          Tous ({financements.length})
        </button>
        {STATUTS.map(statut => {
          const count = financements.filter(f => f.statut === statut.value).length
          return (
            <button
              key={statut.value}
              className={`filter-btn ${filterStatut === statut.value ? 'active' : ''}`}
              onClick={() => setFilterStatut(statut.value)}
            >
              {statut.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Timeline */}
      {financements.length > 0 && (
        <div className="financements-timeline-section">
          <FinancementTimeline financements={financements} />
        </div>
      )}

      {/* Liste des financements */}
      {filteredFinancements.length === 0 ? (
        <div className="empty-state">
          <Icon name="DollarSign" size={32} />
          <p>Aucun financement {filterStatut !== 'ALL' ? `avec le statut "${getStatutInfo(filterStatut).label}"` : ''}</p>
          {isEditMode && filterStatut === 'ALL' && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAdd}
            >
              Créer le premier financement
            </button>
          )}
        </div>
      ) : (
        <div className="financements-list">
          {filteredFinancements.map(financement => {
            const statutInfo = getStatutInfo(financement.statut)
            const isRetard = financement.date_prevue && 
                           new Date(financement.date_prevue) < new Date() && 
                           financement.statut !== 'RECU' && 
                           financement.statut !== 'ANNULE'

            return (
              <div key={financement.id} className={`financement-card ${isRetard ? 'financement-card--retard' : ''}`}>
                <div className="financement-card-header">
                  <div className="financement-card-title">
                    <Icon name={statutInfo.icon} size={20} style={{ color: statutInfo.color }} />
                    <div>
                      <h4>{formatCurrency(financement.montant)}</h4>
                      <span className="financement-financeur">
                        {getFinanceurLabel(financement.financeur_id)}
                      </span>
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

                <div className="financement-card-body">
                  <div className="financement-info-grid">
                    <div className="financement-info-item">
                      <Icon name="Calendar" size={16} />
                      <div>
                        <label>Date prévue</label>
                        <span>{financement.date_prevue ? new Date(financement.date_prevue).toLocaleDateString('fr-FR') : 'Non définie'}</span>
                      </div>
                    </div>
                    {financement.date_effective && (
                      <div className="financement-info-item">
                        <Icon name="CheckCircle" size={16} />
                        <div>
                          <label>Date effective</label>
                          <span>{new Date(financement.date_effective).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    )}
                    {financement.numero_versement && (
                      <div className="financement-info-item">
                        <Icon name="Hash" size={16} />
                        <div>
                          <label>N° versement</label>
                          <span>{financement.numero_versement}</span>
                        </div>
                      </div>
                    )}
                    {financement.reference_financeur && (
                      <div className="financement-info-item">
                        <Icon name="FileText" size={16} />
                        <div>
                          <label>Référence financeur</label>
                          <span>{financement.reference_financeur}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {financement.description && (
                    <div className="financement-description">
                      <p>{financement.description}</p>
                    </div>
                  )}

                  {isRetard && (
                    <div className="financement-alert">
                      <Icon name="AlertTriangle" size={16} />
                      <span>Financement en retard</span>
                    </div>
                  )}
                </div>

                {isEditMode && (
                  <div className="financement-card-actions">
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => handleEdit(financement)}
                      title="Modifier"
                    >
                      <Icon name="Edit" size={16} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon btn-icon--danger"
                      onClick={() => handleDelete(financement.id)}
                      title="Supprimer"
                    >
                      <Icon name="Trash2" size={16} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Formulaire modal */}
      {showForm && (
        <FinancementForm
          programmeId={programmeId}
          financementId={editingId}
          financeurs={financeurs}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}

