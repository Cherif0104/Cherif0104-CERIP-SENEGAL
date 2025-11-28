import { useState, useEffect } from 'react'
import { referentielsService } from '../../services/referentiels.service'
import { toastService } from '../../services/toast.service'
import Icon from '../common/Icon'
import LoadingState from '../common/LoadingState'
import DynamicForm from './DynamicForm'
import './QuestionnaireForm.css'

/**
 * Composant spécialisé pour les questionnaires et quiz
 * Calcule les résultats et affiche un score final
 * 
 * @param {string} referentielType - Type de référentiel (ex: 'QUESTIONNAIRE_VALIDATION_COMPETENCES')
 * @param {string} referentielCode - Code du référentiel spécifique (optionnel)
 * @param {object} initialData - Données initiales pour pré-remplir
 * @param {function} onSave - Callback appelé lors de la soumission
 * @param {function} onCancel - Callback appelé lors de l'annulation
 */
export default function QuestionnaireForm({
  referentielType,
  referentielCode = null,
  initialData = null,
  onSave,
  onCancel
}) {
  const [loading, setLoading] = useState(true)
  const [formConfig, setFormConfig] = useState(null)
  const [formData, setFormData] = useState({})
  const [score, setScore] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true)
      try {
        const { data, error } = await referentielsService.getByType(referentielType)
        
        if (error) {
          console.error('Erreur lors du chargement du questionnaire:', error)
          toastService.error('Impossible de charger la configuration')
          setLoading(false)
          return
        }

        let config = null
        if (referentielCode) {
          config = data.find(r => r.code === referentielCode)
        } else {
          config = data[0]
        }

        if (!config || !config.meta || !config.meta.champs) {
          console.warn('Aucune configuration de questionnaire trouvée pour', referentielType)
          setLoading(false)
          return
        }

        setFormConfig(config)

        // Initialiser les données
        const initial = {}
        config.meta.champs.forEach(champ => {
          if (initialData && initialData[champ.name] !== undefined) {
            initial[champ.name] = initialData[champ.name]
          } else {
            initial[champ.name] = champ.type === 'multiselect' || champ.type === 'checkbox' ? [] : ''
          }
        })
        setFormData(initial)
      } catch (error) {
        console.error('Erreur inattendue:', error)
        toastService.error('Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }

    if (referentielType) {
      loadConfig()
    }
  }, [referentielType, referentielCode, initialData])

  // Calculer le score et le résultat
  const calculateResult = (data) => {
    if (!formConfig?.meta?.champs) return null

    let totalScore = 0
    let maxScore = 0
    const answers = []

    formConfig.meta.champs.forEach(champ => {
      const value = data[champ.name]
      if (value !== undefined && value !== '' && value !== null) {
        let questionScore = 0
        let questionMax = 0

        if (champ.type === 'select' && champ.options) {
          questionMax = champ.options.length - 1
          const optionIndex = champ.options.findIndex(opt => 
            (opt.value || opt) === value
          )
          if (optionIndex >= 0) {
            questionScore = optionIndex
          }
        } else if (champ.type === 'multiselect' || champ.type === 'checkbox') {
          questionMax = Array.isArray(champ.options) ? champ.options.length : 0
          questionScore = Array.isArray(value) ? value.length : 0
        } else if (champ.type === 'number') {
          questionMax = champ.validation?.max || 100
          questionScore = parseFloat(value) || 0
        }

        totalScore += questionScore
        maxScore += questionMax

        answers.push({
          question: champ.label,
          answer: Array.isArray(value) ? value.join(', ') : value,
          score: questionScore,
          max: questionMax
        })
      }
    })

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
    let level = 'Non évalué'
    let color = 'var(--text-secondary)'

    if (percentage >= 80) {
      level = 'Excellent'
      color = 'var(--success)'
    } else if (percentage >= 60) {
      level = 'Bon'
      color = 'var(--info)'
    } else if (percentage >= 40) {
      level = 'Moyen'
      color = 'var(--warning)'
    } else if (percentage > 0) {
      level = 'À améliorer'
      color = 'var(--danger)'
    }

    return {
      score: totalScore,
      maxScore,
      percentage,
      level,
      color,
      answers
    }
  }

  const handleDataChange = (data) => {
    const newFormData = { ...formData, ...data }
    setFormData(newFormData)
    
    // Calculer le résultat en temps réel
    const calculatedResult = calculateResult(newFormData)
    setResult(calculatedResult)
    if (calculatedResult) {
      setScore(calculatedResult.percentage)
    }
  }

  const handleSave = async (data) => {
    const finalResult = calculateResult({ ...formData, ...data })
    const finalData = {
      ...formData,
      ...data,
      _result: finalResult,
      _metadata: {
        referentielType,
        referentielCode,
        date: new Date().toISOString()
      }
    }
    await onSave(finalData)
  }

  if (loading) {
    return <LoadingState message="Chargement de la configuration du questionnaire..." />
  }

  if (!formConfig || !formConfig.meta || !formConfig.meta.champs) {
    return (
      <div className="questionnaire-form-empty">
        <Icon name="AlertCircle" size={24} />
        <p>Aucune configuration de questionnaire disponible.</p>
        <small>Créez une configuration dans Administration → Référentiels → {referentielType}</small>
      </div>
    )
  }

  return (
    <div className="questionnaire-form">
      <div className="questionnaire-form-header">
        <h3>Questionnaire {formConfig.label || referentielType}</h3>
        <p className="questionnaire-form-subtitle">
          Répondez aux questions pour évaluer vos compétences
        </p>
      </div>

      <div className="questionnaire-form-content">
        <DynamicForm
          referentielType={referentielType}
          referentielCode={referentielCode}
          initialData={formData}
          onSave={(data) => handleSave(data)}
          onCancel={onCancel}
          saveLabel="Valider le questionnaire"
        />
      </div>

      {/* Résultat en temps réel */}
      {result && (
        <div className="questionnaire-form-result">
          <div className="questionnaire-form-result-header">
            <Icon name="Award" size={24} />
            <h4>Résultat</h4>
          </div>
          <div className="questionnaire-form-result-score">
            <div className="questionnaire-form-result-score-circle">
              <div 
                className="questionnaire-form-result-score-fill"
                style={{ 
                  '--percentage': result.percentage,
                  '--color': result.color
                }}
              >
                <span className="questionnaire-form-result-score-value">
                  {result.percentage}%
                </span>
              </div>
            </div>
            <div className="questionnaire-form-result-details">
              <div className="questionnaire-form-result-level" style={{ color: result.color }}>
                {result.level}
              </div>
              <div className="questionnaire-form-result-score-text">
                {result.score} / {result.maxScore} points
              </div>
            </div>
          </div>
          {result.answers.length > 0 && (
            <div className="questionnaire-form-result-answers">
              <h5>Détail des réponses</h5>
              <div className="questionnaire-form-result-answers-list">
                {result.answers.map((answer, index) => (
                  <div key={index} className="questionnaire-form-result-answer-item">
                    <div className="questionnaire-form-result-answer-question">
                      {answer.question}
                    </div>
                    <div className="questionnaire-form-result-answer-details">
                      <span className="questionnaire-form-result-answer-value">{answer.answer}</span>
                      {answer.max > 0 && (
                        <span className="questionnaire-form-result-answer-score">
                          {answer.score} / {answer.max}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

