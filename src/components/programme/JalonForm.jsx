import { useState, useEffect } from 'react'
import { programmeJalonsService } from '../../services/programme-jalons.service'
import { toastService } from '../../services/toast.service'
import Icon from '../common/Icon'
import './ProgrammeComponents.css'

const STATUTS = [
  { value: 'PREVU', label: 'Prévu' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'ATTEINT', label: 'Atteint' },
  { value: 'RETARDE', label: 'Retardé' },
  { value: 'ANNULE', label: 'Annulé' }
]

export default function JalonForm({ programmeId, jalon, onSave, onCancel }) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    libelle: '',
    description: '',
    date_prevue: '',
    date_reelle: '',
    statut: 'PREVU',
    livrables: '',
    ordre: 0
  })

  useEffect(() => {
    if (jalon) {
      setFormData({
        libelle: jalon.libelle || '',
        description: jalon.description || '',
        date_prevue: jalon.date_prevue || '',
        date_reelle: jalon.date_reelle || '',
        statut: jalon.statut || 'PREVU',
        livrables: jalon.livrables || '',
        ordre: jalon.ordre || 0
      })
    }
  }, [jalon])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.libelle || !formData.date_prevue) {
      toastService.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setSaving(true)
    try {
      let result
      if (jalon) {
        result = await programmeJalonsService.update(jalon.id, formData)
      } else {
        result = await programmeJalonsService.create({
          ...formData,
          programme_id: programmeId
        })
      }

      if (result.error) {
        toastService.error(result.error.message || 'Erreur lors de la sauvegarde')
      } else {
        toastService.success(`Jalon ${jalon ? 'modifié' : 'créé'} avec succès`)
        onSave()
      }
    } catch (error) {
      console.error('Error saving jalon:', error)
      toastService.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{jalon ? 'Modifier le jalon' : 'Nouveau jalon'}</h3>
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
            <label htmlFor="libelle">Libellé *</label>
            <input
              type="text"
              id="libelle"
              value={formData.libelle}
              onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
              className="input"
              placeholder="Ex: Lancement du programme"
              required
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
              placeholder="Description du jalon..."
            />
          </div>

          <div className="form-row">
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
              <label htmlFor="date_reelle">Date réelle</label>
              <input
                type="date"
                id="date_reelle"
                value={formData.date_reelle}
                onChange={(e) => setFormData({ ...formData, date_reelle: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div className="form-row">
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
          </div>

          <div className="form-group">
            <label htmlFor="livrables">Livrables</label>
            <textarea
              id="livrables"
              value={formData.livrables}
              onChange={(e) => setFormData({ ...formData, livrables: e.target.value })}
              className="input"
              rows={2}
              placeholder="Livrables attendus pour ce jalon..."
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
                  {jalon ? 'Modifier' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

