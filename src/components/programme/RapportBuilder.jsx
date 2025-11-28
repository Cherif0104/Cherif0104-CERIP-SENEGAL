import { useState, useEffect } from 'react'
import { programmeRapportsService } from '../../services/programme-rapports.service'
import { programmeBudgetService } from '../../services/programme-budget.service'
import { programmeIndicateursService } from '../../services/programme-indicateurs.service'
import { toastService } from '../../services/toast.service'
import Icon from '../common/Icon'
import LoadingState from '../common/LoadingState'
import './ProgrammeComponents.css'

const TYPES = [
  { value: 'NARRATIF', label: 'Narratif' },
  { value: 'FINANCIER', label: 'Financier' },
  { value: 'TECHNIQUE', label: 'Technique' },
  { value: 'INTERMEDIAIRE', label: 'Intermédiaire' },
  { value: 'FINAL', label: 'Final' }
]

export default function RapportBuilder({ programme, rapport, onSave, onCancel }) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    type: rapport?.type || 'NARRATIF',
    periode_debut: rapport?.periode_debut || '',
    periode_fin: rapport?.periode_fin || '',
    titre: rapport?.titre || '',
    description: rapport?.description || ''
  })
  const [rapportData, setRapportData] = useState(null)

  useEffect(() => {
    if (rapport) {
      setFormData({
        type: rapport.type,
        periode_debut: rapport.periode_debut,
        periode_fin: rapport.periode_fin,
        titre: rapport.titre || '',
        description: rapport.description || ''
      })
      setRapportData(rapport.contenu || {})
    } else {
      loadDefaultData()
    }
  }, [rapport])

  const loadDefaultData = async () => {
    setLoading(true)
    try {
      // Charger les données du programme pour pré-remplir le rapport
      const [budgetRes, indicateursRes] = await Promise.all([
        programmeBudgetService.getBudgetSummary(programme.id),
        programmeIndicateursService.getDashboard(programme.id)
      ])

      const defaultData = {
        programme: {
          nom: programme.nom,
          description: programme.description,
          budget: programme.budget,
          date_debut: programme.date_debut,
          date_fin: programme.date_fin
        },
        budget: budgetRes.data || null,
        indicateurs: indicateursRes.data || null
      }

      setRapportData(defaultData)
    } catch (error) {
      console.error('Error loading default data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.periode_debut || !formData.periode_fin) {
      toastService.error('Veuillez définir la période du rapport')
      return
    }

    if (new Date(formData.periode_debut) > new Date(formData.periode_fin)) {
      toastService.error('La date de début doit être antérieure à la date de fin')
      return
    }

    setSaving(true)
    try {
      const rapportPayload = {
        programme_id: programme.id,
        type: formData.type,
        periode_debut: formData.periode_debut,
        periode_fin: formData.periode_fin,
        statut: 'BROUILLON',
        contenu: rapportData || {},
        titre: formData.titre || `${formData.type} - ${formData.periode_debut} à ${formData.periode_fin}`,
        description: formData.description || null
      }

      let result
      if (rapport) {
        result = await programmeRapportsService.update(rapport.id, rapportPayload)
      } else {
        result = await programmeRapportsService.create(rapportPayload)
      }

      if (result.error) {
        toastService.error(result.error.message || 'Erreur lors de la sauvegarde')
      } else {
        toastService.success(`Rapport ${rapport ? 'modifié' : 'créé'} avec succès`)
        onSave()
      }
    } catch (error) {
      console.error('Error saving rapport:', error)
      toastService.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <LoadingState message="Chargement des données..." />
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content modal-content--large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{rapport ? 'Modifier le rapport' : 'Nouveau rapport'}</h3>
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
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="type">Type de rapport *</label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input"
                required
                disabled={!!rapport}
              >
                {TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="titre">Titre</label>
              <input
                type="text"
                id="titre"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                className="input"
                placeholder="Titre du rapport"
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="periode_debut">Période début *</label>
              <input
                type="date"
                id="periode_debut"
                value={formData.periode_debut}
                onChange={(e) => setFormData({ ...formData, periode_debut: e.target.value })}
                className="input"
                required
                max={formData.periode_fin || undefined}
              />
            </div>

            <div className="form-group">
              <label htmlFor="periode_fin">Période fin *</label>
              <input
                type="date"
                id="periode_fin"
                value={formData.periode_fin}
                onChange={(e) => setFormData({ ...formData, periode_fin: e.target.value })}
                className="input"
                required
                min={formData.periode_debut || undefined}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={3}
              placeholder="Description optionnelle du rapport..."
            />
          </div>

          {rapportData && (
            <div className="rapport-preview">
              <h4>Données disponibles pour le rapport</h4>
              <div className="preview-section">
                <strong>Programme:</strong> {rapportData.programme?.nom || programme.nom}
              </div>
              {rapportData.budget && (
                <div className="preview-section">
                  <strong>Budget:</strong> Données budgétaires chargées
                </div>
              )}
              {rapportData.indicateurs && (
                <div className="preview-section">
                  <strong>Indicateurs:</strong> {rapportData.indicateurs.total_indicateurs} indicateur(s)
                </div>
              )}
            </div>
          )}

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
                  {rapport ? 'Modifier' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

