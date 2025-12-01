import { TipBox } from '@/components/common/Tooltip'

/**
 * FormStepBuilder - Helper pour créer facilement des étapes de formulaire
 */
export class FormStepBuilder {
  constructor() {
    this.steps = []
  }

  /**
   * Ajouter une étape au formulaire
   */
  addStep({
    id,
    title,
    icon = 'FileText',
    description,
    tip,
    validate,
    content,
    optional = false,
  }) {
    this.steps.push({
      id,
      title,
      icon,
      description,
      tip,
      validate,
      optional,
      content: ({ formData, onChange, errors, touched }) => (
        <div className="form-step-content">
          {(description || tip) && (
            <div className="form-step-header">
              {description && (
                <p className="form-step-description">{description}</p>
              )}
              {tip && (
                <TipBox
                  type="info"
                  title="Conseil"
                  content={tip}
                  closable={true}
                />
              )}
            </div>
          )}
          {content({ formData, onChange, errors, touched })}
        </div>
      ),
    })
    return this
  }

  /**
   * Construire les étapes pour MultiStepForm
   */
  build() {
    return this.steps.map(({ validate, content, ...rest }) => ({
      ...rest,
      validate,
      content,
    }))
  }

  /**
   * Obtenir le nombre d'étapes
   */
  getStepCount() {
    return this.steps.length
  }
}

/**
 * Validation helpers
 */
export const validators = {
  required: (field, label) => (data) => {
    const value = data[field]
    if (!value || (Array.isArray(value) && value.length === 0) || 
        (typeof value === 'string' && value.trim() === '')) {
      return { [field]: `${label} est requis` }
    }
    return null
  },

  minLength: (field, label, min) => (data) => {
    const value = data[field]
    if (value && typeof value === 'string' && value.length < min) {
      return { [field]: `${label} doit contenir au moins ${min} caractères` }
    }
    return null
  },

  maxLength: (field, label, max) => (data) => {
    const value = data[field]
    if (value && typeof value === 'string' && value.length > max) {
      return { [field]: `${label} ne doit pas dépasser ${max} caractères` }
    }
    return null
  },

  min: (field, label, min) => (data) => {
    const value = parseFloat(data[field])
    if (!isNaN(value) && value < min) {
      return { [field]: `${label} doit être supérieur ou égal à ${min}` }
    }
    return null
  },

  max: (field, label, max) => (data) => {
    const value = parseFloat(data[field])
    if (!isNaN(value) && value > max) {
      return { [field]: `${label} doit être inférieur ou égal à ${max}` }
    }
    return null
  },

  email: (field, label) => (data) => {
    const value = data[field]
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return { [field]: `${label} doit être une adresse email valide` }
    }
    return null
  },

  dateRange: (startField, endField, labels) => (data) => {
    const start = data[startField]
    const end = data[endField]
    if (start && end && new Date(start) > new Date(end)) {
      return {
        [endField]: `${labels.end} doit être après ${labels.start}`,
      }
    }
    return null
  },

  combine: (...validatorFunctions) => (data) => {
    let allErrors = {}
    for (const validator of validatorFunctions) {
      const errors = validator(data)
      if (errors) {
        allErrors = { ...allErrors, ...errors }
      }
    }
    return Object.keys(allErrors).length > 0 ? allErrors : null
  },
}

