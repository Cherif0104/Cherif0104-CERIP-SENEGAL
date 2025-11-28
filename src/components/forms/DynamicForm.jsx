import { useState, useEffect } from 'react'
import { referentielsService } from '../../services/referentiels.service'
import { toastService } from '../../services/toast.service'
import SelectWithCreate from '../common/SelectWithCreate'
import ComboboxWithCreate from '../common/ComboboxWithCreate'
import Icon from '../common/Icon'
import LoadingState from '../common/LoadingState'
import './DynamicForm.css'

/**
 * Composant générique pour générer des formulaires dynamiques à partir de référentiels
 * 
 * @param {string} referentielType - Type de référentiel (ex: 'FORMULAIRE_ELIGIBILITE_PROGRAMME')
 * @param {string} referentielCode - Code du référentiel spécifique à utiliser (optionnel, utilise le premier actif si non fourni)
 * @param {object} initialData - Données initiales pour pré-remplir le formulaire
 * @param {function} onSave - Callback appelé lors de la soumission (reçoit les données du formulaire)
 * @param {function} onCancel - Callback appelé lors de l'annulation (optionnel)
 * @param {string} saveLabel - Label du bouton de sauvegarde (défaut: "Enregistrer")
 */
export default function DynamicForm({
  referentielType,
  referentielCode = null,
  initialData = null,
  onSave,
  onCancel,
  saveLabel = 'Enregistrer'
}) {
  const [loading, setLoading] = useState(true)
  const [formConfig, setFormConfig] = useState(null)
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Charger la configuration du formulaire depuis les référentiels
  useEffect(() => {
    const loadFormConfig = async () => {
      setLoading(true)
      try {
        const { data, error } = await referentielsService.getByType(referentielType)
        
        if (error) {
          console.error('Erreur lors du chargement du formulaire:', error)
          toastService.error('Impossible de charger la configuration du formulaire')
          setLoading(false)
          return
        }

        // Utiliser le référentiel spécifié par code, ou le premier actif
        let config = null
        if (referentielCode) {
          config = data.find(r => r.code === referentielCode)
        } else {
          config = data[0]
        }

        if (!config || !config.meta) {
          console.warn('Aucune configuration de formulaire trouvée pour', referentielType)
          setLoading(false)
          return
        }

        setFormConfig(config)

        // Initialiser les données du formulaire
        const initial = {}
        
        // Détecter si c'est une structure multi-domaines ou simple
        if (config.meta.domaines && config.meta.domaines.length > 0) {
          // Structure multi-domaines
          config.meta.domaines.forEach(domain => {
            domain.champs.forEach(champ => {
              if (initialData && initialData[champ.name] !== undefined) {
                initial[champ.name] = initialData[champ.name]
              } else {
                initial[champ.name] = champ.type === 'multiselect' || champ.type === 'checkbox' ? [] : ''
              }
            })
          })
        } else if (config.meta.champs) {
          // Structure simple
          config.meta.champs.forEach(champ => {
            if (initialData && initialData[champ.name] !== undefined) {
              initial[champ.name] = initialData[champ.name]
            } else {
              initial[champ.name] = champ.type === 'multiselect' || champ.type === 'checkbox' ? [] : ''
            }
          })
        }
        
        setFormData(initial)
      } catch (error) {
        console.error('Erreur inattendue:', error)
        toastService.error('Erreur lors du chargement du formulaire')
      } finally {
        setLoading(false)
      }
    }

    if (referentielType) {
      loadFormConfig()
    }
  }, [referentielType, referentielCode, initialData])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formConfig || !formConfig.meta) {
      return false
    }

    // Récupérer tous les champs (multi-domaines ou simple)
    let allChamps = []
    if (formConfig.meta.domaines && formConfig.meta.domaines.length > 0) {
      formConfig.meta.domaines.forEach(domain => {
        allChamps = [...allChamps, ...domain.champs]
      })
    } else if (formConfig.meta.champs) {
      allChamps = formConfig.meta.champs
    } else {
      return false
    }

    allChamps.forEach(champ => {
      if (champ.required) {
        const value = formData[champ.name]
        if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && value.trim() === '')) {
          newErrors[champ.name] = `${champ.label} est requis`
        }
      }

      // Validation personnalisée si définie
      if (champ.validation && formData[champ.name]) {
        const value = formData[champ.name]
        if (champ.validation.min && (typeof value === 'number' || typeof value === 'string') && value.length < champ.validation.min) {
          newErrors[champ.name] = `${champ.label} doit contenir au moins ${champ.validation.min} caractères`
        }
        if (champ.validation.max && (typeof value === 'number' || typeof value === 'string') && value.length > champ.validation.max) {
          newErrors[champ.name] = `${champ.label} ne peut pas dépasser ${champ.validation.max} caractères`
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleMultiSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toastService.error('Veuillez corriger les erreurs dans le formulaire')
      return
    }

    setSaving(true)
    try {
      await onSave(formData)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toastService.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const renderField = (champ) => {
    const value = formData[champ.name] || (champ.type === 'multiselect' || champ.type === 'checkbox' ? [] : '')
    const hasError = errors[champ.name]

    switch (champ.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <input
            type={champ.type}
            id={champ.name}
            name={champ.name}
            value={value}
            onChange={handleChange}
            required={champ.required}
            className={`input ${hasError ? 'input-error' : ''}`}
            placeholder={champ.placeholder || `Saisir ${champ.label.toLowerCase()}...`}
            maxLength={champ.validation?.max}
            minLength={champ.validation?.min}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            id={champ.name}
            name={champ.name}
            value={value}
            onChange={handleChange}
            required={champ.required}
            className={`input ${hasError ? 'input-error' : ''}`}
            placeholder={champ.placeholder}
            min={champ.validation?.min}
            max={champ.validation?.max}
          />
        )

      case 'textarea':
        return (
          <textarea
            id={champ.name}
            name={champ.name}
            value={value}
            onChange={handleChange}
            required={champ.required}
            className={`input ${hasError ? 'input-error' : ''}`}
            placeholder={champ.placeholder || `Saisir ${champ.label.toLowerCase()}...`}
            rows={champ.rows || 3}
            maxLength={champ.validation?.max}
            minLength={champ.validation?.min}
          />
        )

      case 'date':
        return (
          <input
            type="date"
            id={champ.name}
            name={champ.name}
            value={value}
            onChange={handleChange}
            required={champ.required}
            className={`input ${hasError ? 'input-error' : ''}`}
            min={champ.validation?.min}
            max={champ.validation?.max}
          />
        )

      case 'select':
        // Si le champ référence un référentiel, utiliser SelectWithCreate
        if (champ.referentiel) {
          return (
            <SelectWithCreate
              name={champ.name}
              value={value}
              onChange={handleChange}
              options={[]} // Sera chargé par SelectWithCreate
              typeReferentiel={champ.referentiel}
              placeholder={champ.placeholder || 'Sélectionner...'}
              required={champ.required}
            />
          )
        }
        // Sinon, utiliser un select simple avec options
        return (
          <select
            id={champ.name}
            name={champ.name}
            value={value}
            onChange={handleChange}
            required={champ.required}
            className={`input ${hasError ? 'input-error' : ''}`}
          >
            <option value="">{champ.placeholder || 'Sélectionner...'}</option>
            {(champ.options || []).map(opt => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        )

      case 'multiselect':
        // Utiliser ComboboxWithCreate si référentiel, sinon select multiple
        if (champ.referentiel) {
          return (
            <ComboboxWithCreate
              name={champ.name}
              value={Array.isArray(value) ? value : []}
              onChange={(e) => handleMultiSelectChange(champ.name, e.target.value)}
              options={[]}
              typeReferentiel={champ.referentiel}
              placeholder={champ.placeholder || 'Sélectionner...'}
              required={champ.required}
              multiple={true}
            />
          )
        }
        return (
          <select
            id={champ.name}
            name={champ.name}
            multiple
            value={Array.isArray(value) ? value : []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, opt => opt.value)
              handleMultiSelectChange(champ.name, selected)
            }}
            required={champ.required}
            className={`input ${hasError ? 'input-error' : ''}`}
            size={Math.min(5, (champ.options || []).length)}
          >
            {(champ.options || []).map(opt => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        )

      case 'checkbox':
        return (
          <div className="dynamic-form-checkbox-group">
            {(champ.options || []).map(opt => {
              const optValue = opt.value || opt
              const checked = Array.isArray(value) && value.includes(optValue)
              return (
                <label key={optValue} className="dynamic-form-checkbox">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const current = Array.isArray(value) ? value : []
                      const newValue = e.target.checked
                        ? [...current, optValue]
                        : current.filter(v => v !== optValue)
                      handleMultiSelectChange(champ.name, newValue)
                    }}
                  />
                  <span>{opt.label || opt}</span>
                </label>
              )
            })}
          </div>
        )

      default:
        return (
          <input
            type="text"
            id={champ.name}
            name={champ.name}
            value={value}
            onChange={handleChange}
            required={champ.required}
            className={`input ${hasError ? 'input-error' : ''}`}
            placeholder={champ.placeholder || `Saisir ${champ.label.toLowerCase()}...`}
          />
        )
    }
  }

  if (loading) {
    return <LoadingState message="Chargement de la configuration du formulaire..." />
  }

  if (!formConfig || !formConfig.meta) {
    return (
      <div className="dynamic-form-empty">
        <Icon name="AlertCircle" size={24} />
        <p>Aucune configuration de formulaire disponible pour ce type.</p>
        <small>Créez une configuration dans Administration → Référentiels → {referentielType}</small>
      </div>
    )
  }

  // Récupérer tous les champs (multi-domaines ou simple)
  let allChamps = []
  if (formConfig.meta.domaines && formConfig.meta.domaines.length > 0) {
    // Pour les structures multi-domaines, on affiche tous les champs de tous les domaines
    // (le composant parent gère l'affichage par onglets)
    formConfig.meta.domaines.forEach(domain => {
      allChamps = [...allChamps, ...domain.champs]
    })
  } else if (formConfig.meta.champs) {
    allChamps = formConfig.meta.champs
  } else {
    return (
      <div className="dynamic-form-empty">
        <Icon name="AlertCircle" size={24} />
        <p>Aucune configuration de formulaire disponible pour ce type.</p>
        <small>Créez une configuration dans Administration → Référentiels → {referentielType}</small>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="dynamic-form">
      {allChamps
        .sort((a, b) => (a.ordre || 0) - (b.ordre || 0))
        .map((champ) => (
          <div
            key={champ.name}
            className={`dynamic-form-field ${champ.fullWidth ? 'dynamic-form-field--full' : ''}`}
          >
            <label htmlFor={champ.name}>
              {champ.label}
              {champ.required && <span className="required">*</span>}
            </label>
            {renderField(champ)}
            {errors[champ.name] && (
              <span className="error-message">{errors[champ.name]}</span>
            )}
            {champ.help && (
              <small className="field-help">{champ.help}</small>
            )}
          </div>
        ))}

      <div className="dynamic-form-actions">
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={saving}
          >
            Annuler
          </button>
        )}
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
              {saveLabel}
            </>
          )}
        </button>
      </div>
    </form>
  )
}

