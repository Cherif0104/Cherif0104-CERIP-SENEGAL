import { useState, useEffect } from 'react'
import { programmeFinancementsService } from '../../services/programme-financements.service'
import { toastService } from '../../services/toast.service'
import Icon from '../common/Icon'
import LoadingState from '../common/LoadingState'
import './ProgrammeComponents.css'

const STATUTS = [
  { value: 'PREVU', label: 'Prévu' },
  { value: 'CONFIRME', label: 'Confirmé' },
  { value: 'RECU', label: 'Reçu' },
  { value: 'RETARDE', label: 'Retardé' },
  { value: 'ANNULE', label: 'Annulé' }
]

export default function FinancementForm({ programmeId, financementId, financeurs = [], onSave, onCancel }) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    financeur_id: '',
    montant: '',
    date_prevue: '',
    date_effective: '',
    statut: 'PREVU',
    numero_versement: '',
    reference_financeur: '',
    justificatif_url: '',
    description: ''
  })

  useEffect(() => {
    if (financementId) {
      loadFinancement()
    }
  }, [financementId])

  const loadFinancement = async () => {
    setLoading(true)
    try {
      const { data, error } = await programmeFinancementsService.getById(financementId)
      if (error) {
        toastService.error('Erreur lors du chargement du financement')
        onCancel()
      } else if (data) {
        setFormData({
          financeur_id: data.financeur_id || '',
          montant: data.montant?.toString() || '',
          date_prevue: data.date_prevue || '',
          date_effective: data.date_effective || '',
          statut: data.statut || 'PREVU',
          numero_versement: data.numero_versement || '',
          reference_financeur: data.reference_financeur || '',
          justificatif_url: data.justificatif_url || '',
          description: data.description || ''
        })
      }
    } catch (error) {
      console.error('Error loading financement:', error)
      toastService.error('Erreur lors du chargement')
      onCancel()
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.montant || !formData.date_prevue) {
      toastService.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setSaving(true)
    try {
      const financementData = {
        programme_id: programmeId,
        financeur_id: formData.financeur_id || null,
        montant: parseFloat(formData.montant),
        date_prevue: formData.date_prevue,
        date_effective: formData.date_effective || null,
        statut: formData.statut,
        numero_versement: formData.numero_versement || null,
        reference_financeur: formData.reference_financeur || null,
        justificatif_url: formData.justificatif_url || null,
        description: formData.description || null
      }

      let result
      if (financementId) {
        result = await programmeFinancementsService.update(financementId, financementData)
      } else {
        result = await programmeFinancementsService.create(financementData)
      }

      if (result.error) {
        toastService.error(result.error.message || 'Erreur lors de la sauvegarde')
      } else {
        toastService.success(`Financement ${financementId ? 'modifié' : 'créé'} avec succès`)
        onSave()
      }
    } catch (error) {
      console.error('Error saving financement:', error)
      toastService.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <LoadingState message="Chargement du financement..." />
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{financementId ? 'Modifier le financement' : 'Nouveau financement'}</h3>
          <button
            type="button"
            className="btn-icon"
            onClick={onCancel}
            disabled={saving}
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="financeur_id">Financeur</label>
            <select
              id="financeur_id"
              value={formData.financeur_id}
              onChange={(e) => setFormData({ ...formData, financeur_id: e.target.value })}
              className="input"
            >
              <option value="">Sélectionner un financeur</option>
              {financeurs.map(financeur => (
                <option key={financeur.id || financeur.code} value={financeur.code || financeur.id}>
                  {financeur.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="montant">Montant (XOF) *</label>
            <input
              type="number"
              id="montant"
              value={formData.montant}
              onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
              className="input"
              placeholder="0"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="date_prevue">Date prévue *</label>
              <input
                type="date"
                id="date_prevue"
                value={formData.date_prevue}
                onChange={(e) => setFormData({ ...formData, date_prevue: e.target.value })}
                className="input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date_effective">Date effective</label>
              <input
                type="date"
                id="date_effective"
                value={formData.date_effective}
                onChange={(e) => setFormData({ ...formData, date_effective: e.target.value })}
                className="input"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="statut">Statut *</label>
            <select
              id="statut"
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
              className="input"
              required
            >
              {STATUTS.map(statut => (
                <option key={statut.value} value={statut.value}>{statut.label}</option>
              ))}
            </select>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="numero_versement">N° versement</label>
              <input
                type="text"
                id="numero_versement"
                value={formData.numero_versement}
                onChange={(e) => setFormData({ ...formData, numero_versement: e.target.value })}
                className="input"
                placeholder="Ex: VERS-2024-001"
              />
            </div>

            <div className="form-group">
              <label htmlFor="reference_financeur">Référence financeur</label>
              <input
                type="text"
                id="reference_financeur"
                value={formData.reference_financeur}
                onChange={(e) => setFormData({ ...formData, reference_financeur: e.target.value })}
                className="input"
                placeholder="Référence du financeur"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="justificatif_url">URL justificatif</label>
            <input
              type="url"
              id="justificatif_url"
              value={formData.justificatif_url}
              onChange={(e) => setFormData({ ...formData, justificatif_url: e.target.value })}
              className="input"
              placeholder="https://..."
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
              placeholder="Description optionnelle..."
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={saving}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="spinner-small"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Icon name="Save" size={16} />
                  {financementId ? 'Modifier' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

