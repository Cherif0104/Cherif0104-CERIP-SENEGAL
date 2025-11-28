import { useState, useEffect } from 'react'
import { programmePartenairesService } from '../../services/programme-partenaires.service'
import { toastService } from '../../services/toast.service'
import Icon from '../common/Icon'
import LoadingState from '../common/LoadingState'
import PartenaireForm from './PartenaireForm'
import './ProgrammeComponents.css'

const ROLES = [
  { value: 'CO_FINANCEUR', label: 'Co-financeur', icon: 'DollarSign', color: '#10b981' },
  { value: 'PARTENAIRE_TECHNIQUE', label: 'Partenaire technique', icon: 'Settings', color: '#3b82f6' },
  { value: 'PARTENAIRE_IMPLEMENTATION', label: 'Partenaire d\'implémentation', icon: 'Briefcase', color: '#8b5cf6' },
  { value: 'PARTENAIRE_STRATEGIQUE', label: 'Partenaire stratégique', icon: 'Target', color: '#f59e0b' },
  { value: 'BENEFICIAIRE', label: 'Bénéficiaire', icon: 'Users', color: '#6366f1' },
  { value: 'AUTRE', label: 'Autre', icon: 'User', color: '#6b7280' }
]

const STATUTS = [
  { value: 'ACTIF', label: 'Actif', color: '#10b981' },
  { value: 'INACTIF', label: 'Inactif', color: '#6b7280' },
  { value: 'TERMINE', label: 'Terminé', color: '#8b5cf6' },
  { value: 'ANNULE', label: 'Annulé', color: '#ef4444' }
]

const CONTRIBUTION_TYPES = [
  { value: 'FINANCIERE', label: 'Financière', icon: 'DollarSign' },
  { value: 'TECHNIQUE', label: 'Technique', icon: 'Settings' },
  { value: 'MATERIELLE', label: 'Matérielle', icon: 'Package' },
  { value: 'HUMAINE', label: 'Humaine', icon: 'Users' },
  { value: 'MIXTE', label: 'Mixte', icon: 'Layers' }
]

export default function PartenairesManager({ programmeId, mode = 'edit' }) {
  const [loading, setLoading] = useState(true)
  const [partenaires, setPartenaires] = useState([])
  const [summary, setSummary] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingPartenaire, setEditingPartenaire] = useState(null)
  const [filterRole, setFilterRole] = useState('ALL')
  const [filterStatut, setFilterStatut] = useState('ALL')

  const isEditMode = mode === 'edit'

  useEffect(() => {
    if (programmeId) {
      loadPartenaires()
      loadSummary()
    }
  }, [programmeId])

  useEffect(() => {
    if (programmeId) {
      loadPartenaires()
    }
  }, [filterRole, filterStatut])

  const loadPartenaires = async () => {
    setLoading(true)
    try {
      const filters = {}
      if (filterRole !== 'ALL') {
        filters.role = filterRole
      }
      if (filterStatut !== 'ALL') {
        filters.statut = filterStatut
      }

      const { data, error } = await programmePartenairesService.getAll(programmeId, filters)
      if (error) {
        toastService.error('Erreur lors du chargement des partenaires')
      } else {
        setPartenaires(data || [])
      }
    } catch (error) {
      console.error('Error loading partenaires:', error)
      toastService.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const loadSummary = async () => {
    try {
      const { data, error } = await programmePartenairesService.getContributionsSummary(programmeId)
      if (!error) {
        setSummary(data)
      }
    } catch (error) {
      console.error('Error loading summary:', error)
    }
  }

  const handleCreate = () => {
    setEditingPartenaire(null)
    setShowForm(true)
  }

  const handleEdit = (partenaire) => {
    setEditingPartenaire(partenaire)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce partenaire ?')) {
      return
    }

    try {
      const { error } = await programmePartenairesService.delete(id)
      if (error) {
        toastService.error('Erreur lors de la suppression')
      } else {
        toastService.success('Partenaire supprimé avec succès')
        await loadPartenaires()
        await loadSummary()
      }
    } catch (error) {
      console.error('Error deleting partenaire:', error)
      toastService.error('Erreur lors de la suppression')
    }
  }

  const formatCurrency = (amount) => {
    if (!amount) return '0 FCFA'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const getRoleInfo = (role) => {
    return ROLES.find(r => r.value === role) || ROLES[0]
  }

  const getStatutInfo = (statut) => {
    return STATUTS.find(s => s.value === statut) || STATUTS[0]
  }

  const getContributionTypeInfo = (type) => {
    return CONTRIBUTION_TYPES.find(t => t.value === type) || CONTRIBUTION_TYPES[0]
  }

  const filteredPartenaires = partenaires

  if (loading) {
    return <LoadingState message="Chargement des partenaires..." />
  }

  return (
    <div className="partenaires-manager">
      <div className="partenaires-header">
        <div>
          <h3>Partenaires du programme</h3>
          {summary && (
            <div className="partenaires-summary">
              <div className="summary-item">
                <strong>{summary.nombre_partenaires || 0}</strong> partenaire{summary.nombre_partenaires > 1 ? 's' : ''}
              </div>
              {summary.total_contributions > 0 && (
                <div className="summary-item summary-item--success">
                  <Icon name="DollarSign" size={14} />
                  <strong>{formatCurrency(summary.total_contributions)}</strong> de contributions
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
            Ajouter un partenaire
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="partenaires-filters">
        <div className="filter-group">
          <label>Rôle:</label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="input input-sm"
          >
            <option value="ALL">Tous les rôles</option>
            {ROLES.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
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

      {/* Liste des partenaires */}
      {filteredPartenaires.length === 0 ? (
        <div className="empty-state">
          <Icon name="Users" size={32} />
          <p>Aucun partenaire {filterRole !== 'ALL' || filterStatut !== 'ALL' ? 'correspondant aux filtres' : ''}</p>
          {isEditMode && filterRole === 'ALL' && filterStatut === 'ALL' && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreate}
            >
              Ajouter le premier partenaire
            </button>
          )}
        </div>
      ) : (
        <div className="partenaires-list">
          {filteredPartenaires.map(partenaire => {
            const roleInfo = getRoleInfo(partenaire.role)
            const statutInfo = getStatutInfo(partenaire.statut)
            const contributionInfo = partenaire.contribution_type ? getContributionTypeInfo(partenaire.contribution_type) : null

            return (
              <div key={partenaire.id} className="partenaire-card">
                <div className="partenaire-card-header">
                  <div className="partenaire-card-title">
                    <Icon name={roleInfo.icon} size={20} style={{ color: roleInfo.color }} />
                    <div>
                      <h4>{partenaire.partenaire_nom}</h4>
                      <span className="partenaire-card-meta">
                        {roleInfo.label}
                        {partenaire.partenaire_type && ` • ${partenaire.partenaire_type}`}
                      </span>
                    </div>
                  </div>
                  <div className="partenaire-card-badges">
                    <span
                      className="badge"
                      style={{
                        background: roleInfo.color,
                        color: 'white',
                        borderColor: roleInfo.color
                      }}
                    >
                      {roleInfo.label}
                    </span>
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
                </div>

                <div className="partenaire-card-body">
                  {partenaire.contribution_budgetaire > 0 && (
                    <div className="partenaire-contribution">
                      <Icon name="DollarSign" size={16} />
                      <div>
                        <strong>Contribution:</strong> {formatCurrency(partenaire.contribution_budgetaire)}
                        {contributionInfo && (
                          <span className="contribution-type">
                            <Icon name={contributionInfo.icon} size={12} />
                            {contributionInfo.label}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {(partenaire.date_debut || partenaire.date_fin) && (
                    <div className="partenaire-dates">
                      <Icon name="Calendar" size={16} />
                      <span>
                        {partenaire.date_debut && `Du ${formatDate(partenaire.date_debut)}`}
                        {partenaire.date_debut && partenaire.date_fin && ' au '}
                        {partenaire.date_fin && formatDate(partenaire.date_fin)}
                      </span>
                    </div>
                  )}

                  {partenaire.contact_nom && (
                    <div className="partenaire-contact">
                      <Icon name="User" size={16} />
                      <div>
                        <strong>{partenaire.contact_nom}</strong>
                        {partenaire.contact_email && (
                          <span>
                            <Icon name="Mail" size={12} />
                            {partenaire.contact_email}
                          </span>
                        )}
                        {partenaire.contact_telephone && (
                          <span>
                            <Icon name="Phone" size={12} />
                            {partenaire.contact_telephone}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {partenaire.notes && (
                    <div className="partenaire-notes">
                      <Icon name="FileText" size={16} />
                      <p>{partenaire.notes}</p>
                    </div>
                  )}
                </div>

                {isEditMode && (
                  <div className="partenaire-card-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleEdit(partenaire)}
                    >
                      <Icon name="Edit" size={14} />
                      Modifier
                    </button>
                    <button
                      type="button"
                      className="btn-icon btn-icon--danger"
                      onClick={() => handleDelete(partenaire.id)}
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
        <PartenaireForm
          programmeId={programmeId}
          partenaire={editingPartenaire}
          onSave={() => {
            setShowForm(false)
            setEditingPartenaire(null)
            loadPartenaires()
            loadSummary()
          }}
          onCancel={() => {
            setShowForm(false)
            setEditingPartenaire(null)
          }}
        />
      )}
    </div>
  )
}

