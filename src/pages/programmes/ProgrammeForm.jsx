import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { programmesService } from '@/services/programmes.service'
import { EntityValidator } from '@/business/validators/EntityValidator'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { SelectCreatable } from '@/components/common/SelectCreatable'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { STATUTS_PROGRAMME } from '@/utils/constants'
import { toast } from '@/components/common/Toast'
import { logger } from '@/utils/logger'
import './ProgrammeForm.css'

export default function ProgrammeForm() {
  const navigate = useNavigate()
  const { id } = useParams() // Pour édition si ID présent
  const isEdit = !!id

  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    type: 'Incubation',
    date_debut: '',
    date_fin: '',
    budget: 0,
    statut: 'BROUILLON',
  })
  const [loading, setLoading] = useState(false)
  const [validation, setValidation] = useState({ valid: true, errors: [], warnings: [] })
  const [touched, setTouched] = useState({})

  // Charger les données si édition
  useEffect(() => {
    if (isEdit) {
      loadProgramme()
    }
  }, [id])

  const loadProgramme = async () => {
    setLoading(true)
    try {
      const { data, error } = await programmesService.getById(id)
      if (error) {
        logger.error('PROGRAMME_FORM', 'Erreur chargement programme', error)
        return
      }
      setFormData(data)
      logger.debug('PROGRAMME_FORM', 'Programme chargé pour édition', { id })
    } catch (error) {
      logger.error('PROGRAMME_FORM', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  // Validation en temps réel
  useEffect(() => {
    const validationResult = EntityValidator.validate('programme', formData, isEdit ? 'UPDATE' : 'CREATE')
    setValidation(validationResult)
  }, [formData, isEdit])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation finale
    const finalValidation = EntityValidator.validate('programme', formData, isEdit ? 'UPDATE' : 'CREATE')
    
    if (!finalValidation.valid) {
      setTouched({
        nom: true,
        date_debut: true,
        date_fin: true,
        statut: true,
      })
      logger.warn('PROGRAMME_FORM', 'Validation échouée', {
        errors: finalValidation.errors,
      })
      return
    }

    setLoading(true)
    try {
      if (isEdit) {
        const { data, error } = await programmesService.update(id, formData)
        if (error) {
          logger.error('PROGRAMME_FORM', 'Erreur mise à jour programme', error)
          toast.error(error.message || 'Erreur lors de la mise à jour du programme')
          return
        }
        logger.info('PROGRAMME_FORM', 'Programme mis à jour avec succès', { id })
        toast.success('Programme mis à jour avec succès')
        setTimeout(() => navigate('/programmes?tab=liste'), 1000)
      } else {
        const { data, error } = await programmesService.create(formData)
        if (error) {
          logger.error('PROGRAMME_FORM', 'Erreur création programme', error)
          toast.error(error.message || 'Erreur lors de la création du programme')
          return
        }
        logger.info('PROGRAMME_FORM', 'Programme créé avec succès')
        toast.success('Programme créé avec succès')
        setTimeout(() => navigate('/programmes?tab=liste'), 1000)
      }
    } catch (error) {
      logger.error('PROGRAMME_FORM', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  const getFieldError = (field) => {
    if (!touched[field]) return null
    return validation.errors.find((err) => err.field === field || err.ruleId?.includes(field.toUpperCase()))
  }

  const getFieldWarning = (field) => {
    if (!touched[field]) return null
    return validation.warnings.find((warn) => warn.field === field)
  }

  return (
    <div className="programme-form-container">
      <form onSubmit={handleSubmit} className="programme-form">
        <h2>{isEdit ? 'Modifier le programme' : 'Nouveau programme'}</h2>

        {/* Erreurs globales */}
        {!validation.valid && validation.errors.length > 0 && (
          <div className="form-errors">
            <Icon name="AlertCircle" size={20} />
            <div>
              <strong>Erreurs de validation :</strong>
              <ul>
                {validation.errors.map((error, index) => (
                  <li key={index}>{error.message || error.ruleName}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <Input
          label="Nom"
          value={formData.nom}
          onChange={(e) => handleChange('nom', e.target.value)}
          required
          error={getFieldError('nom')?.message}
          className={getFieldError('nom') ? 'input-error' : ''}
        />

        <div className="input-wrapper">
          <label className="input-label">Description</label>
          <textarea
            className="input-field"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
          />
          {getFieldError('description') && (
            <span className="input-error-message">{getFieldError('description')?.message}</span>
          )}
        </div>

        <div className="form-row">
          <Input
            label="Date début"
            type="date"
            value={formData.date_debut}
            onChange={(e) => handleChange('date_debut', e.target.value)}
            required
            error={getFieldError('date_debut')?.message}
            className={getFieldError('date_debut') ? 'input-error' : ''}
          />
          <Input
            label="Date fin"
            type="date"
            value={formData.date_fin}
            onChange={(e) => handleChange('date_fin', e.target.value)}
            required
            error={getFieldError('date_fin')?.message}
            className={getFieldError('date_fin') ? 'input-error' : ''}
            min={formData.date_debut || undefined}
          />
        </div>

        {formData.date_debut && formData.date_fin && new Date(formData.date_debut) > new Date(formData.date_fin) && (
          <div className="form-warning">
            <Icon name="AlertTriangle" size={16} />
            <span>La date de fin doit être postérieure à la date de début</span>
          </div>
        )}

        <Input
          label="Budget (XOF)"
          type="number"
          value={formData.budget}
          onChange={(e) => handleChange('budget', parseFloat(e.target.value) || 0)}
          min="0"
          step="0.01"
          error={getFieldError('budget')?.message}
          className={getFieldError('budget') ? 'input-error' : ''}
        />

        {formData.budget < 0 && (
          <div className="form-warning">
            <Icon name="AlertTriangle" size={16} />
            <span>Le budget doit être positif ou nul</span>
          </div>
        )}

        <SelectCreatable
          label="Type"
          referentielCode="types_programmes"
          value={formData.type}
          onChange={(e) => handleChange('type', e.target.value)}
          options={[
            { value: 'Incubation', label: 'Incubation' },
            { value: 'Formation', label: 'Formation' },
            { value: 'Financement', label: 'Financement' },
            { value: 'Accompagnement', label: 'Accompagnement' },
          ]}
          allowCreate={true}
          onCreateOption={(nouvelleValeur) => {
            logger.info('PROGRAMME_FORM', `Nouveau type de programme créé: ${nouvelleValeur}`)
          }}
          required
          error={getFieldError('type')?.message}
        />

        <SelectCreatable
          label="Statut"
          referentielCode="statuts_programme"
          value={formData.statut}
          onChange={(e) => handleChange('statut', e.target.value)}
          options={STATUTS_PROGRAMME.map((s) => ({ value: s, label: s }))}
          allowCreate={true}
          onCreateOption={(nouvelleValeur) => {
            logger.info('PROGRAMME_FORM', `Nouveau statut créé: ${nouvelleValeur}`)
          }}
          required
          error={getFieldError('statut')?.message}
          className={getFieldError('statut') ? 'input-error' : ''}
        />

        <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => navigate('/programmes?tab=liste')}>
            Annuler
          </Button>
          <Button type="submit" loading={loading} disabled={!validation.valid && Object.keys(touched).length > 0}>
            {isEdit ? 'Enregistrer' : 'Créer'}
          </Button>
        </div>

        {/* Indicateur de validation en temps réel */}
        {Object.keys(touched).length > 0 && (
          <div className={`form-validation-status ${validation.valid ? 'valid' : 'invalid'}`}>
            <Icon name={validation.valid ? 'CheckCircle' : 'XCircle'} size={16} />
            <span>
              {validation.valid
                ? 'Formulaire valide'
                : `${validation.errors.length} erreur(s) à corriger`}
            </span>
          </div>
        )}
      </form>
    </div>
  )
}

