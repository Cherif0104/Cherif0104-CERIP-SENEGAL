import { useState, useEffect } from 'react'
import { planActionService } from '../../services/plan-action.service'
import { toastService } from '../../services/toast.service'
import Icon from '../common/Icon'
import EmptyState from '../common/EmptyState'
import './PlanAction.css'

export default function PlanAction({ beneficiaireId, planAction: initialPlanAction, onUpdate }) {
  const [planAction, setPlanAction] = useState(initialPlanAction)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(!initialPlanAction)

  useEffect(() => {
    if (initialPlanAction) {
      setPlanAction(initialPlanAction)
      setShowForm(false)
    }
  }, [initialPlanAction])

  const handleValidateEtape = async (etapeId) => {
    setLoading(true)
    try {
      const { error } = await planActionService.validateEtape(beneficiaireId, etapeId)
      if (error) {
        toastService.error('Erreur lors de la validation')
      } else {
        toastService.success('Étape validée avec succès')
        if (onUpdate) {
          onUpdate()
        }
        // Recharger le plan d'action
        const { data } = await planActionService.get(beneficiaireId)
        setPlanAction(data)
      }
    } catch (error) {
      console.error('Error validating etape:', error)
      toastService.error('Erreur lors de la validation')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlan = async (planData) => {
    setLoading(true)
    try {
      const { error } = await planActionService.create(beneficiaireId, planData)
      if (error) {
        toastService.error('Erreur lors de la création du plan')
      } else {
        toastService.success('Plan d\'action créé avec succès')
        setShowForm(false)
        if (onUpdate) {
          onUpdate()
        }
        // Recharger le plan d'action
        const { data } = await planActionService.get(beneficiaireId)
        setPlanAction(data)
      }
    } catch (error) {
      console.error('Error creating plan:', error)
      toastService.error('Erreur lors de la création du plan')
    } finally {
      setLoading(false)
    }
  }

  if (showForm) {
    return <PlanActionForm beneficiaireId={beneficiaireId} onSubmit={handleCreatePlan} onCancel={() => setShowForm(false)} />
  }

  if (!planAction) {
    return (
      <EmptyState
        icon="CheckCircle2"
        title="Aucun plan d'action"
        message="Créez un plan d'action pour ce bénéficiaire"
        action={{
          label: "Créer un plan d'action",
          onClick: () => setShowForm(true)
        }}
      />
    )
  }

  return (
    <div className="plan-action-view">
      <div className="plan-action-header">
        <h3>Plan d'action</h3>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowForm(true)}
        >
          <Icon name="Edit" size={16} />
          Modifier
        </button>
      </div>

      <div className="plan-action-etapes">
        {planAction.etapes && planAction.etapes.length > 0 ? (
          planAction.etapes.map((etape, index) => (
            <div key={etape.id || index} className={`etape-item ${etape.valide ? 'etape-valide' : ''}`}>
              <div className="etape-header">
                <div className="etape-number">{index + 1}</div>
                <div className="etape-content">
                  <h4>{etape.titre}</h4>
                  {etape.description && <p>{etape.description}</p>}
                  {etape.date_limite && (
                    <span className="etape-date">
                      <Icon name="Calendar" size={14} />
                      Échéance: {new Date(etape.date_limite).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
                <div className="etape-actions">
                  {etape.valide ? (
                    <span className="etape-badge valide">
                      <Icon name="CheckCircle2" size={18} />
                      Validé
                    </span>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleValidateEtape(etape.id)}
                      disabled={loading}
                    >
                      <Icon name="Check" size={16} />
                      Valider
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon="List"
            title="Aucune étape"
            message="Le plan d'action n'a pas encore d'étapes définies"
          />
        )}
      </div>
    </div>
  )
}

function PlanActionForm({ beneficiaireId, onSubmit, onCancel }) {
  const [etapes, setEtapes] = useState([
    { titre: '', description: '', date_limite: '' }
  ])

  const handleAddEtape = () => {
    setEtapes([...etapes, { titre: '', description: '', date_limite: '' }])
  }

  const handleRemoveEtape = (index) => {
    setEtapes(etapes.filter((_, i) => i !== index))
  }

  const handleEtapeChange = (index, field, value) => {
    const newEtapes = [...etapes]
    newEtapes[index][field] = value
    setEtapes(newEtapes)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const planData = {
      etapes: etapes.filter(e => e.titre.trim() !== '')
    }
    onSubmit(planData)
  }

  return (
    <form onSubmit={handleSubmit} className="plan-action-form">
      <h3>Créer un plan d'action</h3>
      <div className="etapes-list">
        {etapes.map((etape, index) => (
          <div key={index} className="etape-form-item">
            <div className="etape-form-header">
              <span className="etape-form-number">Étape {index + 1}</span>
              {etapes.length > 1 && (
                <button
                  type="button"
                  className="btn-icon-small btn-icon--danger"
                  onClick={() => handleRemoveEtape(index)}
                >
                  <Icon name="X" size={16} />
                </button>
              )}
            </div>
            <div className="etape-form-fields">
              <input
                type="text"
                placeholder="Titre de l'étape *"
                value={etape.titre}
                onChange={(e) => handleEtapeChange(index, 'titre', e.target.value)}
                required
                className="input"
              />
              <textarea
                placeholder="Description"
                value={etape.description}
                onChange={(e) => handleEtapeChange(index, 'description', e.target.value)}
                rows={2}
                className="input"
              />
              <input
                type="date"
                placeholder="Date limite"
                value={etape.date_limite}
                onChange={(e) => handleEtapeChange(index, 'date_limite', e.target.value)}
                className="input"
              />
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={handleAddEtape}
      >
        <Icon name="Plus" size={18} />
        Ajouter une étape
      </button>
      <div className="plan-action-form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="btn btn-primary"
        >
          <Icon name="Save" size={18} />
          Créer le plan d'action
        </button>
      </div>
    </form>
  )
}

