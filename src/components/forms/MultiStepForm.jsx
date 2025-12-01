import { useState, useEffect } from 'react'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import './MultiStepForm.css'

/**
 * MultiStepForm - Composant réutilisable pour formulaires multi-étapes
 * Remplace les modals par des pages dédiées avec navigation
 */
export function MultiStepForm({
  steps = [],
  initialData = {},
  onSubmit,
  onCancel,
  title = 'Formulaire',
  loading = false,
  className = '',
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState(initialData)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  useEffect(() => {
    setFormData(initialData)
  }, [initialData])

  const currentStepConfig = steps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const handleNext = () => {
    // Valider l'étape actuelle
    if (currentStepConfig.validate) {
      const stepErrors = currentStepConfig.validate(formData)
      if (stepErrors && Object.keys(stepErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...stepErrors }))
        return
      }
    }

    // Passer à l'étape suivante
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      // Scroll en haut
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      // Scroll en haut
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation finale
    let allErrors = {}
    steps.forEach(step => {
      if (step.validate) {
        const stepErrors = step.validate(formData)
        if (stepErrors) {
          allErrors = { ...allErrors, ...stepErrors }
        }
      }
    })

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors)
      // Aller à la première étape avec erreur
      const firstErrorStep = steps.findIndex(step => {
        if (!step.validate) return false
        const stepErrors = step.validate(formData)
        return stepErrors && Object.keys(stepErrors).length > 0
      })
      if (firstErrorStep >= 0) {
        setCurrentStep(firstErrorStep)
      }
      return
    }

    // Soumettre
    if (onSubmit) {
      await onSubmit(formData)
    }
  }

  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed'
    if (stepIndex === currentStep) return 'active'
    return 'pending'
  }

  return (
    <div className={`multi-step-form ${className}`}>
      <div className="multi-step-form-header">
        <div className="multi-step-form-title">
          <h1>{title}</h1>
          <p className="multi-step-form-subtitle">
            Étape {currentStep + 1} sur {steps.length}
          </p>
        </div>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="multi-step-form-cancel"
          >
            <Icon name="X" size={16} />
            Annuler
          </Button>
        )}
      </div>

      {/* Progress bar */}
      <div className="multi-step-progress">
        <div className="multi-step-progress-bar">
          <div
            className="multi-step-progress-fill"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        <div className="multi-step-indicators">
          {steps.map((step, index) => (
            <button
              key={index}
              type="button"
              className={`multi-step-indicator ${getStepStatus(index)}`}
              onClick={() => goToStep(index)}
              disabled={index > currentStep}
              title={step.title}
            >
              <div className="multi-step-indicator-circle">
                {getStepStatus(index) === 'completed' ? (
                  <Icon name="Check" size={16} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className="multi-step-indicator-label">{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="multi-step-form-content">
        {/* Contenu de l'étape actuelle */}
        <div className="multi-step-step-content">
          {currentStepConfig.content && (
            <currentStepConfig.content
              formData={formData}
              onChange={handleChange}
              errors={errors}
              touched={touched}
              step={currentStep}
              totalSteps={steps.length}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="multi-step-form-navigation">
          <Button
            type="button"
            variant="outline"
            onClick={isFirstStep ? onCancel : handlePrevious}
            disabled={loading}
          >
            <Icon name="ArrowLeft" size={16} />
            {isFirstStep ? 'Annuler' : 'Précédent'}
          </Button>

          <div className="multi-step-form-navigation-info">
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrevious}
                className="multi-step-form-nav-link"
                disabled={loading}
              >
                ← Étape précédente
              </button>
            )}
            <span className="multi-step-form-nav-dots">
              {steps.map((_, index) => (
                <span
                  key={index}
                  className={`multi-step-form-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                  onClick={() => goToStep(index)}
                />
              ))}
            </span>
            {!isLastStep && (
              <button
                type="button"
                onClick={handleNext}
                className="multi-step-form-nav-link"
                disabled={loading}
              >
                Étape suivante →
              </button>
            )}
          </div>

          {isLastStep ? (
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              <Icon name="Check" size={16} />
              Enregistrer
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
              disabled={loading}
            >
              Suivant
              <Icon name="ArrowRight" size={16} />
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

