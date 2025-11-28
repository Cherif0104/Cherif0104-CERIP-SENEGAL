import { useState } from 'react'
import { programmeIndicateursService } from '../../services/programme-indicateurs.service'
import { toastService } from '../../services/toast.service'
import Icon from '../common/Icon'
import './ProgrammeComponents.css'

export default function IndicateurMesureForm({ indicateur, onSave, onCancel }) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    valeur_quantitative: '',
    valeur_qualitative: '',
    date_mesure: new Date().toISOString().split('T')[0],
    commentaire: '',
    source_donnees: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.date_mesure) {
      toastService.error('Veuillez sélectionner une date de mesure')
      return
    }

    if (indicateur.type === 'QUANTITATIF' && !formData.valeur_quantitative) {
      toastService.error('Veuillez saisir une valeur quantitative')
      return
    }

    if (indicateur.type === 'QUALITATIF' && !formData.valeur_qualitative) {
      toastService.error('Veuillez saisir une valeur qualitative')
      return
    }

    setSaving(true)
    try {
      const mesureData = {
        indicateur_id: indicateur.id,
        valeur_quantitative: indicateur.type === 'QUANTITATIF' ? parseFloat(formData.valeur_quantitative) : null,
        valeur_qualitative: indicateur.type === 'QUALITATIF' ? formData.valeur_qualitative : null,
        date_mesure: formData.date_mesure,
        commentaire: formData.commentaire || null,
        source_donnees: formData.source_donnees || null
      }

      const { error } = await programmeIndicateursService.createMesure(mesureData)

      if (error) {
        toastService.error(error.message || 'Erreur lors de la sauvegarde')
      } else {
        toastService.success('Mesure enregistrée avec succès')
        onSave()
      }
    } catch (error) {
      console.error('Error saving mesure:', error)
      toastService.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Nouvelle mesure - {indicateur.libelle}</h3>
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
            <label htmlFor="date_mesure">Date de mesure *</label>
            <input
              type="date"
              id="date_mesure"
              value={formData.date_mesure}
              onChange={(e) => setFormData({ ...formData, date_mesure: e.target.value })}
              className="input"
              required
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {indicateur.type === 'QUANTITATIF' ? (
            <div className="form-group">
              <label htmlFor="valeur_quantitative">
                Valeur * {indicateur.unite && `(${indicateur.unite})`}
              </label>
              <input
                type="number"
                id="valeur_quantitative"
                value={formData.valeur_quantitative}
                onChange={(e) => setFormData({ ...formData, valeur_quantitative: e.target.value })}
                className="input"
                placeholder="0"
                step="0.01"
                required
              />
              {indicateur.cible && (
                <small>
                  Cible: {indicateur.cible} {indicateur.unite || ''}
                </small>
              )}
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="valeur_qualitative">Évaluation *</label>
              <textarea
                id="valeur_qualitative"
                value={formData.valeur_qualitative}
                onChange={(e) => setFormData({ ...formData, valeur_qualitative: e.target.value })}
                className="input"
                rows={4}
                placeholder="Décrivez l'évaluation qualitative..."
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="source_donnees">Source des données</label>
            <input
              type="text"
              id="source_donnees"
              value={formData.source_donnees}
              onChange={(e) => setFormData({ ...formData, source_donnees: e.target.value })}
              className="input"
              placeholder="Ex: Enquête, registre, rapport..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="commentaire">Commentaire</label>
            <textarea
              id="commentaire"
              value={formData.commentaire}
              onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
              className="input"
              rows={3}
              placeholder="Commentaires optionnels..."
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
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

