import { useState, useEffect } from 'react'
import { programmePartenairesService } from '../../services/programme-partenaires.service'
import { toastService } from '../../services/toast.service'
import Icon from '../common/Icon'
import './ProgrammeComponents.css'

const ROLES = [
  { value: 'CO_FINANCEUR', label: 'Co-financeur' },
  { value: 'PARTENAIRE_TECHNIQUE', label: 'Partenaire technique' },
  { value: 'PARTENAIRE_IMPLEMENTATION', label: 'Partenaire d\'implémentation' },
  { value: 'PARTENAIRE_STRATEGIQUE', label: 'Partenaire stratégique' },
  { value: 'BENEFICIAIRE', label: 'Bénéficiaire' },
  { value: 'AUTRE', label: 'Autre' }
]

const STATUTS = [
  { value: 'ACTIF', label: 'Actif' },
  { value: 'INACTIF', label: 'Inactif' },
  { value: 'TERMINE', label: 'Terminé' },
  { value: 'ANNULE', label: 'Annulé' }
]

const PARTENAIRE_TYPES = [
  { value: 'ORGANISATION', label: 'Organisation' },
  { value: 'INDIVIDU', label: 'Individu' },
  { value: 'GOUVERNEMENT', label: 'Gouvernement' },
  { value: 'ONG', label: 'ONG' },
  { value: 'ENTREPRISE', label: 'Entreprise' },
  { value: 'AUTRE', label: 'Autre' }
]

const CONTRIBUTION_TYPES = [
  { value: 'FINANCIERE', label: 'Financière' },
  { value: 'TECHNIQUE', label: 'Technique' },
  { value: 'MATERIELLE', label: 'Matérielle' },
  { value: 'HUMAINE', label: 'Humaine' },
  { value: 'MIXTE', label: 'Mixte' }
]

export default function PartenaireForm({ programmeId, partenaire, onSave, onCancel }) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    partenaire_nom: '',
    partenaire_type: '',
    role: 'CO_FINANCEUR',
    contribution_budgetaire: '',
    contribution_type: '',
    date_debut: '',
    date_fin: '',
    statut: 'ACTIF',
    contact_nom: '',
    contact_email: '',
    contact_telephone: '',
    notes: ''
  })

  useEffect(() => {
    if (partenaire) {
      setFormData({
        partenaire_nom: partenaire.partenaire_nom || '',
        partenaire_type: partenaire.partenaire_type || '',
        role: partenaire.role || 'CO_FINANCEUR',
        contribution_budgetaire: partenaire.contribution_budgetaire || '',
        contribution_type: partenaire.contribution_type || '',
        date_debut: partenaire.date_debut || '',
        date_fin: partenaire.date_fin || '',
        statut: partenaire.statut || 'ACTIF',
        contact_nom: partenaire.contact_nom || '',
        contact_email: partenaire.contact_email || '',
        contact_telephone: partenaire.contact_telephone || '',
        notes: partenaire.notes || ''
      })
    }
  }, [partenaire])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.partenaire_nom || !formData.role) {
      toastService.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setSaving(true)
    try {
      const partenaireData = {
        ...formData,
        contribution_budgetaire: parseFloat(formData.contribution_budgetaire) || 0,
        date_debut: formData.date_debut || null,
        date_fin: formData.date_fin || null,
        partenaire_type: formData.partenaire_type || null,
        contribution_type: formData.contribution_type || null,
        contact_nom: formData.contact_nom || null,
        contact_email: formData.contact_email || null,
        contact_telephone: formData.contact_telephone || null,
        notes: formData.notes || null
      }

      let result
      if (partenaire) {
        result = await programmePartenairesService.update(partenaire.id, partenaireData)
      } else {
        result = await programmePartenairesService.create({
          ...partenaireData,
          programme_id: programmeId
        })
      }

      if (result.error) {
        toastService.error(result.error.message || 'Erreur lors de la sauvegarde')
      } else {
        toastService.success(`Partenaire ${partenaire ? 'modifié' : 'créé'} avec succès`)
        onSave()
      }
    } catch (error) {
      console.error('Error saving partenaire:', error)
      toastService.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content modal-content--large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{partenaire ? 'Modifier le partenaire' : 'Nouveau partenaire'}</h3>
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
            <label htmlFor="partenaire_nom">Nom du partenaire *</label>
            <input
              type="text"
              id="partenaire_nom"
              value={formData.partenaire_nom}
              onChange={(e) => setFormData({ ...formData, partenaire_nom: e.target.value })}
              className="input"
              placeholder="Ex: Organisation XYZ"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="partenaire_type">Type de partenaire</label>
              <select
                id="partenaire_type"
                value={formData.partenaire_type}
                onChange={(e) => setFormData({ ...formData, partenaire_type: e.target.value })}
                className="input"
              >
                <option value="">Sélectionner...</option>
                {PARTENAIRE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="role">Rôle *</label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="input"
                required
              >
                {ROLES.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contribution_budgetaire">Contribution budgétaire (FCFA)</label>
              <input
                type="number"
                id="contribution_budgetaire"
                value={formData.contribution_budgetaire}
                onChange={(e) => setFormData({ ...formData, contribution_budgetaire: e.target.value })}
                className="input"
                min="0"
                step="0.01"
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contribution_type">Type de contribution</label>
              <select
                id="contribution_type"
                value={formData.contribution_type}
                onChange={(e) => setFormData({ ...formData, contribution_type: e.target.value })}
                className="input"
              >
                <option value="">Sélectionner...</option>
                {CONTRIBUTION_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date_debut">Date de début</label>
              <input
                type="date"
                id="date_debut"
                value={formData.date_debut}
                onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                className="input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="date_fin">Date de fin</label>
              <input
                type="date"
                id="date_fin"
                value={formData.date_fin}
                onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                className="input"
                min={formData.date_debut}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="statut">Statut</label>
            <select
              id="statut"
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
              className="input"
            >
              {STATUTS.map(statut => (
                <option key={statut.value} value={statut.value}>{statut.label}</option>
              ))}
            </select>
          </div>

          <div className="form-section-divider">
            <h4>Contact</h4>
          </div>

          <div className="form-group">
            <label htmlFor="contact_nom">Nom du contact</label>
            <input
              type="text"
              id="contact_nom"
              value={formData.contact_nom}
              onChange={(e) => setFormData({ ...formData, contact_nom: e.target.value })}
              className="input"
              placeholder="Nom du responsable"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contact_email">Email</label>
              <input
                type="email"
                id="contact_email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="input"
                placeholder="contact@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact_telephone">Téléphone</label>
              <input
                type="tel"
                id="contact_telephone"
                value={formData.contact_telephone}
                onChange={(e) => setFormData({ ...formData, contact_telephone: e.target.value })}
                className="input"
                placeholder="+221 XX XXX XX XX"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input"
              rows={3}
              placeholder="Informations complémentaires..."
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
                  {partenaire ? 'Modifier' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

