import { useState, useEffect } from 'react'
import { referentielsService } from '../../services/referentiels.service'
import { toastService } from '../../services/toast.service'
import Icon from '../common/Icon'
import LoadingState from '../common/LoadingState'
import DynamicForm from './DynamicForm'
import './RecueilBesoinsForm.css'

/**
 * Composant spécialisé pour les recueils de besoins
 * Affiche les domaines sous forme d'onglets et génère un plan d'action
 * 
 * @param {string} referentielType - Type de référentiel (ex: 'RECUEIL_BESOINS_ENTREPRENEUR')
 * @param {string} referentielCode - Code du référentiel spécifique (optionnel)
 * @param {object} initialData - Données initiales pour pré-remplir
 * @param {function} onSave - Callback appelé lors de la soumission
 * @param {function} onCancel - Callback appelé lors de l'annulation
 */
export default function RecueilBesoinsForm({
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
  const [planAction, setPlanAction] = useState([])

  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true)
      try {
        const { data, error } = await referentielsService.getByType(referentielType)
        
        if (error) {
          console.error('Erreur lors du chargement du recueil de besoins:', error)
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

        if (!config || !config.meta) {
          console.warn('Aucune configuration de recueil de besoins trouvée pour', referentielType)
          setLoading(false)
          return
        }

        setFormConfig(config)
        
        // Si structure multi-domaines
        if (config.meta.domaines && config.meta.domaines.length > 0) {
          setActiveDomain(config.meta.domaines[0].id)
          // Initialiser les données
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
        } else if (config.meta.champs) {
          // Structure simple
          const initial = {}
          config.meta.champs.forEach(champ => {
            if (initialData && initialData[champ.name] !== undefined) {
              initial[champ.name] = initialData[champ.name]
            } else {
              initial[champ.name] = champ.type === 'multiselect' || champ.type === 'checkbox' ? [] : ''
            }
          })
          setFormData(initial)
        }
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

  // Générer un plan d'action basé sur les besoins identifiés
  const generatePlanAction = (data) => {
    const plan = []
    
    if (formConfig?.meta?.domaines) {
      formConfig.meta.domaines.forEach(domain => {
        domain.champs.forEach(champ => {
          const value = data[champ.name]
          if (value && value !== '' && value !== null && value !== undefined) {
            // Identifier les besoins à partir des champs remplis
            if (champ.type === 'textarea' && value.trim()) {
              plan.push({
                domaine: domain.label,
                besoin: champ.label,
                description: value,
                priorite: champ.required ? 'Haute' : 'Moyenne',
                statut: 'À traiter'
              })
            } else if ((champ.type === 'select' || champ.type === 'multiselect') && value) {
              plan.push({
                domaine: domain.label,
                besoin: champ.label,
                description: Array.isArray(value) ? value.join(', ') : value,
                priorite: champ.required ? 'Haute' : 'Moyenne',
                statut: 'À traiter'
              })
            }
          }
        })
      })
    } else if (formConfig?.meta?.champs) {
      formConfig.meta.champs.forEach(champ => {
        const value = data[champ.name]
        if (value && value !== '' && value !== null && value !== undefined) {
          if (champ.type === 'textarea' && value.trim()) {
            plan.push({
              besoin: champ.label,
              description: value,
              priorite: champ.required ? 'Haute' : 'Moyenne',
              statut: 'À traiter'
            })
          }
        }
      })
    }

    return plan
  }

  const handleDataChange = (data) => {
    const newFormData = { ...formData, ...data }
    setFormData(newFormData)
    
    // Générer le plan d'action
    const plan = generatePlanAction(newFormData)
    setPlanAction(plan)
  }

  const handleSave = async (data) => {
    const finalData = {
      ...formData,
      ...data,
      _planAction: generatePlanAction({ ...formData, ...data }),
      _metadata: {
        referentielType,
        referentielCode,
        date: new Date().toISOString()
      }
    }
    await onSave(finalData)
  }

  if (loading) {
    return <LoadingState message="Chargement de la configuration..." />
  }

  if (!formConfig || !formConfig.meta) {
    return (
      <div className="recueil-besoins-form-empty">
        <Icon name="AlertCircle" size={24} />
        <p>Aucune configuration de recueil de besoins disponible.</p>
        <small>Créez une configuration dans Administration → Référentiels → {referentielType}</small>
      </div>
    )
  }

  const isMultiDomain = formConfig.meta.domaines && formConfig.meta.domaines.length > 0
  const currentDomain = isMultiDomain ? formConfig.meta.domaines.find(d => d.id === activeDomain) : null

  return (
    <div className="recueil-besoins-form">
      <div className="recueil-besoins-form-header">
        <h3>Recueil de besoins</h3>
        <p className="recueil-besoins-form-subtitle">
          Identifiez vos besoins pour générer un plan d'action personnalisé
        </p>
      </div>

      {isMultiDomain ? (
        <>
          {/* Onglets des domaines */}
          <div className="recueil-besoins-form-domains-tabs">
            {formConfig.meta.domaines.map((domain) => (
              <button
                key={domain.id}
                type="button"
                className={`recueil-besoins-form-domain-tab ${activeDomain === domain.id ? 'active' : ''}`}
                onClick={() => setActiveDomain(domain.id)}
              >
                <Icon name={domain.icone || 'MessageSquare'} size={18} />
                {domain.label}
              </button>
            ))}
          </div>

          {/* Formulaire du domaine actif */}
          {currentDomain && (
            <div className="recueil-besoins-form-domain-content">
              <div className="recueil-besoins-form-domain-header">
                <h4>
                  <Icon name={currentDomain.icone || 'MessageSquare'} size={20} />
                  {currentDomain.label}
                </h4>
              </div>

              <DynamicForm
                referentielType={referentielType}
                referentielCode={referentielCode}
                initialData={formData}
                onSave={(data) => handleSave(data)}
                onCancel={onCancel}
                saveLabel="Enregistrer les besoins"
              />
            </div>
          )}
        </>
      ) : (
        <DynamicForm
          referentielType={referentielType}
          referentielCode={referentielCode}
          initialData={formData}
          onSave={(data) => handleSave(data)}
          onCancel={onCancel}
          saveLabel="Enregistrer les besoins"
        />
      )}

      {/* Plan d'action généré */}
      {planAction.length > 0 && (
        <div className="recueil-besoins-form-plan-action">
          <div className="recueil-besoins-form-plan-action-header">
            <Icon name="CheckSquare" size={24} />
            <h4>Plan d'action généré</h4>
            <span className="recueil-besoins-form-plan-action-count">
              {planAction.length} besoin{planAction.length > 1 ? 's' : ''} identifié{planAction.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="recueil-besoins-form-plan-action-list">
            {planAction.map((action, index) => (
              <div key={index} className="recueil-besoins-form-plan-action-item">
                <div className="recueil-besoins-form-plan-action-item-header">
                  <div>
                    <strong>{action.besoin}</strong>
                    {action.domaine && <span className="recueil-besoins-form-plan-action-domain">{action.domaine}</span>}
                  </div>
                  <span className={`recueil-besoins-form-plan-action-priority priority-${action.priorite.toLowerCase()}`}>
                    {action.priorite}
                  </span>
                </div>
                <p className="recueil-besoins-form-plan-action-description">{action.description}</p>
                <div className="recueil-besoins-form-plan-action-footer">
                  <span className="recueil-besoins-form-plan-action-status">{action.statut}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

