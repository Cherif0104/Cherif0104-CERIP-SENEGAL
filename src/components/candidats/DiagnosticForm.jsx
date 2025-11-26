import { useState, useEffect } from 'react'
import { diagnosticsService } from '../../services/diagnostics.service'
import { toastService } from '../../services/toast.service'
import Icon from '../common/Icon'
import './DiagnosticForm.css'

// Formulaire de diagnostic modulable
// Les champs peuvent être personnalisés selon le type de programme/projet
const CHAMPS_DIAGNOSTIC = [
  { id: 'besoins_identifies', label: 'Besoins identifiés', type: 'textarea', required: true },
  { id: 'points_forts', label: 'Points forts', type: 'textarea' },
  { id: 'points_faibles', label: 'Points faibles', type: 'textarea' },
  { id: 'niveau_marketing', label: 'Niveau Marketing', type: 'select', options: ['Faible', 'Moyen', 'Bon', 'Excellent'] },
  { id: 'niveau_financier', label: 'Niveau Financier', type: 'select', options: ['Faible', 'Moyen', 'Bon', 'Excellent'] },
  { id: 'niveau_comptabilite', label: 'Niveau Comptabilité', type: 'select', options: ['Faible', 'Moyen', 'Bon', 'Excellent'] },
  { id: 'niveau_management', label: 'Niveau Management', type: 'select', options: ['Faible', 'Moyen', 'Bon', 'Excellent'] },
  { id: 'niveau_organisationnel', label: 'Niveau Organisationnel', type: 'select', options: ['Faible', 'Moyen', 'Bon', 'Excellent'] },
  { id: 'observations', label: 'Observations', type: 'textarea' }
]

export default function DiagnosticForm({ candidatId, onSave, onCancel, initialData = null }) {
  const [formData, setFormData] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      // Initialiser avec des valeurs vides
      const initial = {}
      CHAMPS_DIAGNOSTIC.forEach(champ => {
        initial[champ.id] = ''
      })
      setFormData(initial)
    }
  }, [initialData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      let result
      if (initialData) {
        result = await diagnosticsService.update(candidatId, formData)
      } else {
        result = await diagnosticsService.create(candidatId, formData)
      }

      if (result.error) {
        toastService.error('Erreur lors de l\'enregistrement du diagnostic')
      } else {
        toastService.success('Diagnostic enregistré avec succès')
        onSave()
      }
    } catch (error) {
      console.error('Error saving diagnostic:', error)
      toastService.error('Erreur lors de l\'enregistrement du diagnostic')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="diagnostic-form">
      <div className="diagnostic-form-grid">
        {CHAMPS_DIAGNOSTIC.map((champ) => (
          <div key={champ.id} className={`form-group ${champ.type === 'textarea' ? 'form-group--full' : ''}`}>
            <label htmlFor={champ.id}>
              {champ.label}
              {champ.required && <span className="required">*</span>}
            </label>
            {champ.type === 'textarea' ? (
              <textarea
                id={champ.id}
                name={champ.id}
                value={formData[champ.id] || ''}
                onChange={handleChange}
                required={champ.required}
                className="input"
                rows={3}
                placeholder={`Saisir ${champ.label.toLowerCase()}...`}
              />
            ) : champ.type === 'select' ? (
              <select
                id={champ.id}
                name={champ.id}
                value={formData[champ.id] || ''}
                onChange={handleChange}
                className="input"
              >
                <option value="">Sélectionner...</option>
                {champ.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={champ.type || 'text'}
                id={champ.id}
                name={champ.id}
                value={formData[champ.id] || ''}
                onChange={handleChange}
                required={champ.required}
                className="input"
                placeholder={`Saisir ${champ.label.toLowerCase()}...`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="diagnostic-form-actions">
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
              <Icon name="Save" size={18} />
              Enregistrer le diagnostic
            </>
          )}
        </button>
      </div>
    </form>
  )
}

