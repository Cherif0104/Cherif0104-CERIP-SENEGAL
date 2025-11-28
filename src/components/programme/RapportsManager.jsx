import { useState, useEffect } from 'react'
import { programmeRapportsService } from '../../services/programme-rapports.service'
import { programmesService } from '../../services/programmes.service'
import { toastService } from '../../services/toast.service'
import Icon from '../common/Icon'
import LoadingState from '../common/LoadingState'
import RapportBuilder from './RapportBuilder'
import RapportViewer from './RapportViewer'
import './ProgrammeComponents.css'

const TYPES = [
  { value: 'NARRATIF', label: 'Narratif', icon: 'FileText', color: '#3b82f6' },
  { value: 'FINANCIER', label: 'Financier', icon: 'DollarSign', color: '#10b981' },
  { value: 'TECHNIQUE', label: 'Technique', icon: 'Settings', color: '#f59e0b' },
  { value: 'INTERMEDIAIRE', label: 'Intermédiaire', icon: 'Clock', color: '#6b7280' },
  { value: 'FINAL', label: 'Final', icon: 'CheckCircle', color: '#8b5cf6' }
]

const STATUTS = [
  { value: 'BROUILLON', label: 'Brouillon', color: '#6b7280' },
  { value: 'VALIDE', label: 'Validé', color: '#10b981' },
  { value: 'ENVOYE', label: 'Envoyé', color: '#3b82f6' },
  { value: 'REJETE', label: 'Rejeté', color: '#ef4444' }
]

export default function RapportsManager({ programmeId, mode = 'edit' }) {
  const [loading, setLoading] = useState(true)
  const [rapports, setRapports] = useState([])
  const [programme, setProgramme] = useState(null)
  const [filterType, setFilterType] = useState('ALL')
  const [filterStatut, setFilterStatut] = useState('ALL')
  const [showBuilder, setShowBuilder] = useState(false)
  const [showViewer, setShowViewer] = useState(false)
  const [selectedRapport, setSelectedRapport] = useState(null)
  const [editingRapport, setEditingRapport] = useState(null)

  const isEditMode = mode === 'edit'

  useEffect(() => {
    if (programmeId) {
      loadAll()
    }
  }, [programmeId])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [rapportsRes, programmeRes] = await Promise.all([
        programmeRapportsService.getAll(programmeId),
        programmesService.getById(programmeId)
      ])

      if (!rapportsRes.error) {
        setRapports(rapportsRes.data || [])
      }

      if (!programmeRes.error) {
        setProgramme(programmeRes.data)
      }
    } catch (error) {
      console.error('Error loading rapports:', error)
      toastService.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = (type) => {
    setEditingRapport(null)
    setShowBuilder(true)
  }

  const handleEdit = (rapport) => {
    setEditingRapport(rapport)
    setShowBuilder(true)
  }

  const handleView = (rapport) => {
    setSelectedRapport(rapport)
    setShowViewer(true)
  }

  const handleSave = async () => {
    await loadAll()
    setShowBuilder(false)
    setEditingRapport(null)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      return
    }

    try {
      const { error } = await programmeRapportsService.delete(id)
      if (error) {
        toastService.error('Erreur lors de la suppression')
      } else {
        toastService.success('Rapport supprimé avec succès')
        await loadAll()
      }
    } catch (error) {
      console.error('Error deleting rapport:', error)
      toastService.error('Erreur lors de la suppression')
    }
  }

  const handleValidate = async (id) => {
    try {
      const { error } = await programmeRapportsService.validate(id, null) // TODO: passer l'utilisateur connecté
      if (error) {
        toastService.error('Erreur lors de la validation')
      } else {
        toastService.success('Rapport validé avec succès')
        await loadAll()
      }
    } catch (error) {
      console.error('Error validating rapport:', error)
      toastService.error('Erreur lors de la validation')
    }
  }

  const handleSend = async (id) => {
    try {
      const { error } = await programmeRapportsService.send(id)
      if (error) {
        toastService.error('Erreur lors de l\'envoi')
      } else {
        toastService.success('Rapport envoyé avec succès')
        await loadAll()
      }
    } catch (error) {
      console.error('Error sending rapport:', error)
      toastService.error('Erreur lors de l\'envoi')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const getTypeInfo = (type) => {
    return TYPES.find(t => t.value === type) || TYPES[0]
  }

  const getStatutInfo = (statut) => {
    return STATUTS.find(s => s.value === statut) || STATUTS[0]
  }

  const filteredRapports = rapports.filter(r => {
    if (filterType !== 'ALL' && r.type !== filterType) return false
    if (filterStatut !== 'ALL' && r.statut !== filterStatut) return false
    return true
  })

  if (loading) {
    return <LoadingState message="Chargement des rapports..." />
  }

  return (
    <div className="rapports-manager">
      <div className="rapports-header">
        <div>
          <h3>Rapports</h3>
          <p className="rapports-subtitle">Gérez les rapports narratifs, financiers et techniques du programme</p>
        </div>
        {isEditMode && (
          <div className="rapports-actions">
            {TYPES.slice(0, 3).map(type => (
              <button
                key={type.value}
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handleCreate(type.value)}
                style={{ borderLeft: `3px solid ${type.color}` }}
              >
                <Icon name={type.icon} size={16} />
                Nouveau {type.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filtres */}
      <div className="rapports-filters">
        <div className="filter-group">
          <label>Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input input-sm"
          >
            <option value="ALL">Tous les types</option>
            {TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

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

      {/* Liste des rapports */}
      {filteredRapports.length === 0 ? (
        <div className="empty-state">
          <Icon name="FileText" size={32} />
          <p>Aucun rapport {filterType !== 'ALL' || filterStatut !== 'ALL' ? 'correspondant aux filtres' : ''}</p>
          {isEditMode && filterType === 'ALL' && filterStatut === 'ALL' && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleCreate('NARRATIF')}
            >
              Créer le premier rapport
            </button>
          )}
        </div>
      ) : (
        <div className="rapports-list">
          {filteredRapports.map(rapport => {
            const typeInfo = getTypeInfo(rapport.type)
            const statutInfo = getStatutInfo(rapport.statut)

            return (
              <div key={rapport.id} className="rapport-card">
                <div className="rapport-card-header">
                  <div className="rapport-card-title">
                    <Icon name={typeInfo.icon} size={20} style={{ color: typeInfo.color }} />
                    <div>
                      <h4>{rapport.titre || `${typeInfo.label} - ${formatDate(rapport.periode_debut)}`}</h4>
                      <span className="rapport-card-meta">
                        {formatDate(rapport.periode_debut)} - {formatDate(rapport.periode_fin)}
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

                {rapport.description && (
                  <div className="rapport-card-body">
                    <p>{rapport.description}</p>
                  </div>
                )}

                <div className="rapport-card-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleView(rapport)}
                  >
                    <Icon name="Eye" size={14} />
                    Voir
                  </button>
                  {isEditMode && (
                    <>
                      {rapport.statut === 'BROUILLON' && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEdit(rapport)}
                        >
                          <Icon name="Edit" size={14} />
                          Modifier
                        </button>
                      )}
                      {rapport.statut === 'BROUILLON' && (
                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          onClick={() => handleValidate(rapport.id)}
                        >
                          <Icon name="CheckCircle" size={14} />
                          Valider
                        </button>
                      )}
                      {rapport.statut === 'VALIDE' && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleSend(rapport.id)}
                        >
                          <Icon name="Send" size={14} />
                          Envoyer
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-icon btn-icon--danger"
                        onClick={() => handleDelete(rapport.id)}
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

      {/* Builder modal */}
      {showBuilder && programme && (
        <RapportBuilder
          programme={programme}
          rapport={editingRapport}
          onSave={handleSave}
          onCancel={() => {
            setShowBuilder(false)
            setEditingRapport(null)
          }}
        />
      )}

      {/* Viewer modal */}
      {showViewer && selectedRapport && (
        <RapportViewer
          rapport={selectedRapport}
          programme={programme}
          onClose={() => {
            setShowViewer(false)
            setSelectedRapport(null)
          }}
        />
      )}
    </div>
  )
}

