import { useState, useEffect } from 'react'
import { programmeIndicateursService } from '../../services/programme-indicateurs.service'
import { toastService } from '../../services/toast.service'
import Icon from '../common/Icon'
import LoadingState from '../common/LoadingState'
import ConfirmModal from '../common/ConfirmModal'
import IndicateurMesureForm from './IndicateurMesureForm'
import './ProgrammeComponents.css'

const TYPES = [
  { value: 'QUANTITATIF', label: 'Quantitatif', icon: 'BarChart' },
  { value: 'QUALITATIF', label: 'Qualitatif', icon: 'FileText' }
]

const FREQUENCES = [
  { value: 'MENSUEL', label: 'Mensuel' },
  { value: 'TRIMESTRIEL', label: 'Trimestriel' },
  { value: 'SEMESTRIEL', label: 'Semestriel' },
  { value: 'ANNUEL', label: 'Annuel' },
  { value: 'PONCTUEL', label: 'Ponctuel' }
]

export default function IndicateursManager({ programmeId, mode = 'edit' }) {
  const [loading, setLoading] = useState(true)
  const [indicateurs, setIndicateurs] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showMesureForm, setShowMesureForm] = useState(false)
  const [selectedIndicateur, setSelectedIndicateur] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    libelle: '',
    type: 'QUANTITATIF',
    cible: '',
    unite: '',
    source_verification: '',
    frequence_mesure: 'TRIMESTRIEL',
    description: '',
    ordre: 0
  })

  const isEditMode = mode === 'edit'

  useEffect(() => {
    if (programmeId) {
      loadIndicateurs()
    }
  }, [programmeId])

  const loadIndicateurs = async () => {
    setLoading(true)
    try {
      const { data, error } = await programmeIndicateursService.getAll(programmeId)
      if (error) {
        toastService.error('Erreur lors du chargement des indicateurs')
      } else {
        setIndicateurs(data || [])
      }
    } catch (error) {
      console.error('Error loading indicateurs:', error)
      toastService.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingId(null)
    setFormData({
      code: '',
      libelle: '',
      type: 'QUANTITATIF',
      cible: '',
      unite: '',
      source_verification: '',
      frequence_mesure: 'TRIMESTRIEL',
      description: '',
      ordre: indicateurs.length + 1
    })
    setShowForm(true)
  }

  const handleEdit = (indicateur) => {
    setEditingId(indicateur.id)
    setFormData({
      code: indicateur.code,
      libelle: indicateur.libelle,
      type: indicateur.type,
      cible: indicateur.cible?.toString() || '',
      unite: indicateur.unite || '',
      source_verification: indicateur.source_verification || '',
      frequence_mesure: indicateur.frequence_mesure || 'TRIMESTRIEL',
      description: indicateur.description || '',
      ordre: indicateur.ordre || 0
    })
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()

    if (!formData.code || !formData.libelle) {
      toastService.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (formData.type === 'QUANTITATIF' && !formData.cible) {
      toastService.error('Veuillez définir une cible pour un indicateur quantitatif')
      return
    }

    try {
      const indicateurData = {
        programme_id: programmeId,
        code: formData.code.toUpperCase(),
        libelle: formData.libelle,
        type: formData.type,
        cible: formData.cible ? parseFloat(formData.cible) : null,
        unite: formData.unite || null,
        source_verification: formData.source_verification || null,
        frequence_mesure: formData.frequence_mesure || null,
        description: formData.description || null,
        ordre: parseInt(formData.ordre) || 0
      }

      let result
      if (editingId) {
        result = await programmeIndicateursService.update(editingId, indicateurData)
      } else {
        result = await programmeIndicateursService.create(indicateurData)
      }

      if (result.error) {
        toastService.error(result.error.message || 'Erreur lors de la sauvegarde')
      } else {
        toastService.success(`Indicateur ${editingId ? 'modifié' : 'créé'} avec succès`)
        setShowForm(false)
        setEditingId(null)
        loadIndicateurs()
      }
    } catch (error) {
      console.error('Error saving indicateur:', error)
      toastService.error('Erreur lors de la sauvegarde')
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return

    try {
      const { error } = await programmeIndicateursService.delete(deletingId)
      if (error) {
        toastService.error('Erreur lors de la suppression')
      } else {
        toastService.success('Indicateur supprimé avec succès')
        setDeletingId(null)
        loadIndicateurs()
      }
    } catch (error) {
      console.error('Error deleting indicateur:', error)
      toastService.error('Erreur lors de la suppression')
    }
  }

  const handleAddMesure = (indicateur) => {
    setSelectedIndicateur(indicateur)
    setShowMesureForm(true)
  }

  const handleMesureSaved = () => {
    setShowMesureForm(false)
    setSelectedIndicateur(null)
    loadIndicateurs()
  }

  if (loading) {
    return <LoadingState message="Chargement des indicateurs..." />
  }

  return (
    <div className="indicateurs-manager">
      {isEditMode && (
        <div className="indicateurs-header">
          <h3>Indicateurs de performance</h3>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleAdd}
          >
            <Icon name="Plus" size={16} />
            Ajouter un indicateur
          </button>
        </div>
      )}

      {indicateurs.length === 0 && (
        <div className="empty-state">
          <Icon name="BarChart" size={32} />
          <p>Aucun indicateur défini</p>
          {isEditMode && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAdd}
            >
              Créer le premier indicateur
            </button>
          )}
        </div>
      )}

      {indicateurs.length > 0 && (
        <div className="indicateurs-list">
          {indicateurs.map((indicateur) => {
            const typeInfo = TYPES.find(t => t.value === indicateur.type)
            const tauxRealisation = indicateur.stats?.taux_realisation
            const derniereMesure = indicateur.stats?.derniere_mesure

            return (
              <div key={indicateur.id} className="indicateur-card">
                <div className="indicateur-card-header">
                  <div className="indicateur-card-title">
                    <Icon name={typeInfo?.icon || 'BarChart'} size={20} />
                    <div>
                      <h4>{indicateur.libelle}</h4>
                      <span className="indicateur-code">{indicateur.code}</span>
                    </div>
                  </div>
                  <div className="indicateur-card-badges">
                    <span className="badge badge--type">
                      {typeInfo?.label}
                    </span>
                    {!indicateur.actif && (
                      <span className="badge badge--warning">Inactif</span>
                    )}
                  </div>
                </div>

                <div className="indicateur-card-body">
                  {indicateur.type === 'QUANTITATIF' && (
                    <div className="indicateur-stats">
                      <div className="stat-item">
                        <label>Cible:</label>
                        <span>{indicateur.cible} {indicateur.unite || ''}</span>
                      </div>
                      {derniereMesure && (
                        <div className="stat-item">
                          <label>Dernière mesure:</label>
                          <span>{derniereMesure.valeur_quantitative} {indicateur.unite || ''}</span>
                        </div>
                      )}
                      {tauxRealisation !== null && tauxRealisation !== undefined && (
                        <div className="stat-item">
                          <label>Taux de réalisation:</label>
                          <span className={tauxRealisation >= 100 ? 'text-success' : tauxRealisation >= 80 ? 'text-warning' : 'text-danger'}>
                            {tauxRealisation.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {indicateur.type === 'QUALITATIF' && derniereMesure && (
                    <div className="indicateur-qualitatif">
                      <label>Dernière évaluation:</label>
                      <p>{derniereMesure.valeur_qualitative}</p>
                    </div>
                  )}

                  {indicateur.description && (
                    <div className="indicateur-description">
                      <p>{indicateur.description}</p>
                    </div>
                  )}

                  <div className="indicateur-meta">
                    {indicateur.frequence_mesure && (
                      <span className="meta-item">
                        <Icon name="Calendar" size={14} />
                        {FREQUENCES.find(f => f.value === indicateur.frequence_mesure)?.label}
                      </span>
                    )}
                    {indicateur.source_verification && (
                      <span className="meta-item">
                        <Icon name="FileCheck" size={14} />
                        {indicateur.source_verification}
                      </span>
                    )}
                  </div>
                </div>

                {isEditMode && (
                  <div className="indicateur-card-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleAddMesure(indicateur)}
                    >
                      <Icon name="Plus" size={14} />
                      Ajouter mesure
                    </button>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => handleEdit(indicateur)}
                        title="Modifier"
                      >
                        <Icon name="Edit" size={16} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon btn-icon--danger"
                        onClick={() => setDeletingId(indicateur.id)}
                        title="Supprimer"
                      >
                        <Icon name="Trash2" size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Formulaire modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Modifier l\'indicateur' : 'Nouvel indicateur'}</h3>
              <button
                type="button"
                className="btn-icon"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                }}
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="modal-body">
              <div className="form-group">
                <label htmlFor="code">Code *</label>
                <input
                  type="text"
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="input"
                  placeholder="Ex: IND-001"
                  required
                  disabled={!!editingId}
                />
                <small>Code unique pour cet indicateur (ne peut pas être modifié)</small>
              </div>

              <div className="form-group">
                <label htmlFor="libelle">Libellé *</label>
                <input
                  type="text"
                  id="libelle"
                  value={formData.libelle}
                  onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                  className="input"
                  placeholder="Ex: Nombre de bénéficiaires formés"
                  required
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="type">Type *</label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input"
                    required
                  >
                    {TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="frequence_mesure">Fréquence de mesure</label>
                  <select
                    id="frequence_mesure"
                    value={formData.frequence_mesure}
                    onChange={(e) => setFormData({ ...formData, frequence_mesure: e.target.value })}
                    className="input"
                  >
                    {FREQUENCES.map(freq => (
                      <option key={freq.value} value={freq.value}>{freq.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.type === 'QUANTITATIF' && (
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="cible">Cible *</label>
                    <input
                      type="number"
                      id="cible"
                      value={formData.cible}
                      onChange={(e) => setFormData({ ...formData, cible: e.target.value })}
                      className="input"
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required={formData.type === 'QUANTITATIF'}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="unite">Unité</label>
                    <input
                      type="text"
                      id="unite"
                      value={formData.unite}
                      onChange={(e) => setFormData({ ...formData, unite: e.target.value })}
                      className="input"
                      placeholder="Ex: personnes, %, etc."
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="source_verification">Source de vérification</label>
                <input
                  type="text"
                  id="source_verification"
                  value={formData.source_verification}
                  onChange={(e) => setFormData({ ...formData, source_verification: e.target.value })}
                  className="input"
                  placeholder="Ex: Registre de présence, enquête..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={3}
                  placeholder="Description de l'indicateur..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="ordre">Ordre</label>
                <input
                  type="number"
                  id="ordre"
                  value={formData.ordre}
                  onChange={(e) => setFormData({ ...formData, ordre: parseInt(e.target.value) || 0 })}
                  className="input"
                  min="0"
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <Icon name="Save" size={16} />
                  {editingId ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Formulaire de mesure */}
      {showMesureForm && selectedIndicateur && (
        <IndicateurMesureForm
          indicateur={selectedIndicateur}
          onSave={handleMesureSaved}
          onCancel={() => {
            setShowMesureForm(false)
            setSelectedIndicateur(null)
          }}
        />
      )}

      <ConfirmModal
        open={deletingId !== null}
        title="Supprimer l'indicateur"
        description="Êtes-vous sûr de vouloir supprimer cet indicateur ? Cette action est irréversible. Toutes les mesures associées seront également supprimées."
        variant="danger"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  )
}

