import { useState, useEffect } from 'react'
import { referentielsService } from '../../services/referentiels.service'
import { toastService } from '../../services/toast.service'
import Icon from '../common/Icon'
import LoadingState from '../common/LoadingState'
import DynamicForm from './DynamicForm'
import './DiagnosticForm.css'

/**
 * Composant spécialisé pour les diagnostics multi-domaines
 * Affiche les domaines sous forme d'onglets et calcule les scores si activé
 * 
 * @param {string} referentielType - Type de référentiel (ex: 'FICHE_DIAGNOSTIC_ENTREPRENEURIAT')
 * @param {string} referentielCode - Code du référentiel spécifique (optionnel)
 * @param {object} initialData - Données initiales pour pré-remplir
 * @param {function} onSave - Callback appelé lors de la soumission
 * @param {function} onCancel - Callback appelé lors de l'annulation
 */
export default function DiagnosticForm({
  referentielType,
  referentielCode = null,
  initialData = null,
  onSave,
  onCancel
}) {
  const [loading, setLoading] = useState(true)
  const [formConfig, setFormConfig] = useState(null)
  const [activeDomain, setActiveDomain] = useState(null)
  const [formData, setFormData] = useState({})
  const [scores, setScores] = useState({})

  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true)
      try {
        const { data, error } = await referentielsService.getByType(referentielType)
        
        if (error) {
          console.error('Erreur lors du chargement du diagnostic:', error)
          toastService.error('Impossible de charger la configuration du diagnostic')
          setLoading(false)
          return
        }

        let config = null
        if (referentielCode) {
          config = data.find(r => r.code === referentielCode)
        } else {
          config = data[0]
        }

        if (!config || !config.meta || !config.meta.domaines) {
          console.warn('Aucune configuration de diagnostic trouvée pour', referentielType)
          setLoading(false)
          return
        }

        setFormConfig(config)
        if (config.meta.domaines.length > 0) {
          setActiveDomain(config.meta.domaines[0].id)
        }

        // Initialiser les données du formulaire
        const initial = {}
        config.meta.domaines.forEach(domain => {
          domain.champs.forEach(champ => {
            if (initialData && initialData[champ.name] !== undefined) {
              initial[champ.name] = initialData[champ.name]
            } else {
              initial[champ.name] = champ.type === 'multiselect' || champ.type === 'checkbox' ? [] : ''
            }
          })
        })
        setFormData(initial)
      } catch (error) {
        console.error('Erreur inattendue:', error)
        toastService.error('Erreur lors du chargement du diagnostic')
      } finally {
        setLoading(false)
      }
    }

    if (referentielType) {
      loadConfig()
    }
  }, [referentielType, referentielCode, initialData])

  // Calculer les scores par domaine si activé
  const calculateScores = (data) => {
    if (!formConfig?.meta?.scoring?.enabled) return {}

    const domainScores = {}
    formConfig.meta.domaines.forEach(domain => {
      let domainScore = 0
      let totalWeight = 0

      domain.champs.forEach(champ => {
        const value = data[champ.name]
        if (value !== undefined && value !== '' && value !== null) {
          // Calcul simple basé sur les valeurs sélectionnées
          if (champ.type === 'select' && champ.options) {
            const optionIndex = champ.options.findIndex(opt => 
              (opt.value || opt) === value
            )
            if (optionIndex >= 0) {
              // Score de 0 à 4 basé sur la position dans les options
              const score = optionIndex / (champ.options.length - 1) * 4
              domainScore += score
              totalWeight += 1
            }
          }
        }
      })

      if (totalWeight > 0) {
        domainScores[domain.id] = {
          score: Math.round((domainScore / totalWeight) * 100) / 100,
          max: 4,
          percentage: Math.round((domainScore / totalWeight / 4) * 100)
        }
      }
    })

    // Calcul du score global pondéré
    if (formConfig.meta.scoring.weights) {
      let globalScore = 0
      let totalWeight = 0
      Object.entries(formConfig.meta.scoring.weights).forEach(([domainId, weight]) => {
        if (domainScores[domainId]) {
          globalScore += domainScores[domainId].score * weight
          totalWeight += weight
        }
      })
      if (totalWeight > 0) {
        domainScores._global = {
          score: Math.round((globalScore / totalWeight) * 100) / 100,
          max: 4,
          percentage: Math.round((globalScore / totalWeight / 4) * 100)
        }
      }
    }

    return domainScores
  }

  const handleDomainDataChange = (domainId, data) => {
    const newFormData = { ...formData, ...data }
    setFormData(newFormData)
    
    // Recalculer les scores
    if (formConfig?.meta?.scoring?.enabled) {
      const newScores = calculateScores(newFormData)
      setScores(newScores)
    }
  }

  const handleSave = async (data) => {
    const finalData = {
      ...formData,
      ...data,
      _scores: formConfig?.meta?.scoring?.enabled ? calculateScores({ ...formData, ...data }) : undefined,
      _metadata: {
        referentielType,
        referentielCode,
        date: new Date().toISOString()
      }
    }
    await onSave(finalData)
  }

  if (loading) {
    return <LoadingState message="Chargement de la configuration du diagnostic..." />
  }

  if (!formConfig || !formConfig.meta || !formConfig.meta.domaines) {
    return (
      <div className="diagnostic-form-empty">
        <Icon name="AlertCircle" size={24} />
        <p>Aucune configuration de diagnostic disponible pour ce type.</p>
        <small>Créez une configuration dans Administration → Référentiels → {referentielType}</small>
      </div>
    )
  }

  const currentDomain = formConfig.meta.domaines.find(d => d.id === activeDomain)

  return (
    <div className="diagnostic-form">
      <div className="diagnostic-form-header">
        <h3>Diagnostic {formConfig.label || referentielType}</h3>
        {formConfig.meta.scoring?.enabled && (
          <div className="diagnostic-form-scoring-info">
            <Icon name="BarChart" size={16} />
            <span>Scoring activé</span>
          </div>
        )}
      </div>

      {/* Onglets des domaines */}
      <div className="diagnostic-form-domains-tabs">
        {formConfig.meta.domaines.map((domain) => (
          <button
            key={domain.id}
            type="button"
            className={`diagnostic-form-domain-tab ${activeDomain === domain.id ? 'active' : ''}`}
            onClick={() => setActiveDomain(domain.id)}
          >
            <Icon name={domain.icone || 'FileText'} size={18} />
            {domain.label}
            {formConfig.meta.scoring?.enabled && scores[domain.id] && (
              <span className="diagnostic-form-domain-score">
                {scores[domain.id].percentage}%
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Formulaire du domaine actif */}
      {currentDomain && (
        <div className="diagnostic-form-domain-content">
          <div className="diagnostic-form-domain-header">
            <h4>
              <Icon name={currentDomain.icone || 'FileText'} size={20} />
              {currentDomain.label}
            </h4>
            {formConfig.meta.scoring?.enabled && scores[currentDomain.id] && (
              <div className="diagnostic-form-domain-score-display">
                <div className="diagnostic-form-score-bar">
                  <div 
                    className="diagnostic-form-score-fill"
                    style={{ width: `${scores[currentDomain.id].percentage}%` }}
                  />
                </div>
                <span className="diagnostic-form-score-text">
                  Score: {scores[currentDomain.id].score}/{scores[currentDomain.id].max} 
                  ({scores[currentDomain.id].percentage}%)
                </span>
              </div>
            )}
          </div>

          <DynamicForm
            referentielType={referentielType}
            referentielCode={referentielCode}
            initialData={formData}
            onSave={(data) => {
              handleDomainDataChange(activeDomain, data)
              handleSave(data)
            }}
            onCancel={onCancel}
            saveLabel="Enregistrer le diagnostic"
          />
        </div>
      )}

      {/* Score global si activé */}
      {formConfig.meta.scoring?.enabled && scores._global && (
        <div className="diagnostic-form-global-score">
          <div className="diagnostic-form-global-score-header">
            <Icon name="BarChart" size={24} />
            <h4>Score global</h4>
          </div>
          <div className="diagnostic-form-score-bar">
            <div 
              className="diagnostic-form-score-fill"
              style={{ width: `${scores._global.percentage}%` }}
            />
          </div>
          <div className="diagnostic-form-global-score-value">
            {scores._global.score}/{scores._global.max} ({scores._global.percentage}%)
          </div>
        </div>
      )}
    </div>
  )
}

