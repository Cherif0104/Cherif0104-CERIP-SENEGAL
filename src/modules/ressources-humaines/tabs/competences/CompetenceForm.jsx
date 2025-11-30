import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { competencesService } from '@/services/competences.service'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './CompetenceForm.css'

export default function CompetenceForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const isNew = !id

  const [formData, setFormData] = useState({
    code: '',
    nom: '',
    categorie: '',
    description: '',
    niveau_max: 5,
    actif: true,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit) {
      loadCompetence()
    }
  }, [id])

  const loadCompetence = async () => {
    setLoading(true)
    try {
      const result = await competencesService.getById(id)
      if (result.error) {
        logger.error('COMPETENCE_FORM', 'Erreur chargement compétence', result.error)
        setError('Erreur lors du chargement')
        return
      }

      const data = result.data
      setFormData({
        code: data.code || '',
        nom: data.nom || '',
        categorie: data.categorie || '',
        description: data.description || '',
        niveau_max: data.niveau_max || 5,
        actif: data.actif !== undefined ? data.actif : true,
      })
    } catch (error) {
      logger.error('COMPETENCE_FORM', 'Erreur inattendue', error)
      setError('Erreur inattendue')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const generateCode = async () => {
    try {
      const result = await competencesService.getAll({ pagination: { page: 1, pageSize: 1 } })
      const count = result.data?.length || 0
      const newCode = `COMP-${String(count + 1).padStart(4, '0')}`
      setFormData((prev) => ({ ...prev, code: newCode }))
    } catch (error) {
      logger.error('COMPETENCE_FORM', 'Erreur génération code', error)
    }
  }

  useEffect(() => {
    if (isNew && !formData.code) {
      generateCode()
    }
  }, [isNew])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (!formData.nom) {
      setError('Le nom est requis')
      setLoading(false)
      return
    }

    if (!formData.code) {
      setError('Le code est requis')
      setLoading(false)
      return
    }

    if (formData.niveau_max < 1 || formData.niveau_max > 10) {
      setError('Le niveau maximum doit être entre 1 et 10')
      setLoading(false)
      return
    }

    try {
      const dataToSave = {
        ...formData,
        niveau_max: parseInt(formData.niveau_max),
      }

      if (isEdit) {
        const result = await competencesService.update(id, dataToSave)
        if (result.error) {
          setError(result.error.message || 'Erreur lors de la mise à jour')
          return
        }
        logger.info('COMPETENCE_FORM', 'Compétence mise à jour', { id })
        navigate(`/rh/competences/${id}`)
      } else {
        const result = await competencesService.create(dataToSave)
        if (result.error) {
          setError(result.error.message || 'Erreur lors de la création')
          return
        }
        logger.info('COMPETENCE_FORM', 'Compétence créée', { id: result.data?.id })
        navigate(`/rh/competences/${result.data?.id}`)
      }
    } catch (error) {
      logger.error('COMPETENCE_FORM', 'Erreur inattendue', error)
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEdit) {
    return <div className="loading-container">Chargement...</div>
  }

  return (
    <div className="competence-form-page">
      <div className="competence-form-container">
        <div className="competence-form-header">
          <Button variant="secondary" onClick={() => navigate('/rh?tab=competences')}>
            <Icon name="ArrowLeft" size={16} />
            Retour
          </Button>
          <h1>{isEdit ? 'Modifier la compétence' : 'Nouvelle compétence'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="competence-form">
          {error && (
            <div className="form-error">
              <Icon name="AlertCircle" size={16} />
              {error}
            </div>
          )}

          {/* Section Informations générales */}
          <div className="form-section">
            <h2>Informations générales</h2>
            <div className="form-grid">
              <Input
                label="Code"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                required
                disabled={!isNew}
                placeholder="Généré automatiquement"
              />
              <Input
                label="Nom"
                value={formData.nom}
                onChange={(e) => handleChange('nom', e.target.value)}
                required
                placeholder="Ex: JavaScript, Management, Communication"
              />
              <Select
                label="Catégorie"
                value={formData.categorie}
                onChange={(e) => handleChange('categorie', e.target.value)}
                options={[
                  { value: '', label: 'Sélectionner...' },
                  { value: 'TECHNIQUE', label: 'Technique' },
                  { value: 'MANAGEMENT', label: 'Management' },
                  { value: 'COMMUNICATION', label: 'Communication' },
                  { value: 'LANGUE', label: 'Langue' },
                  { value: 'LOGICIEL', label: 'Logiciel' },
                  { value: 'METIER', label: 'Métier' },
                  { value: 'AUTRE', label: 'Autre' },
                ]}
              />
              <Input
                label="Niveau maximum"
                type="number"
                value={formData.niveau_max}
                onChange={(e) => handleChange('niveau_max', parseInt(e.target.value) || 5)}
                min="1"
                max="10"
                required
                placeholder="5"
              />
            </div>
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              isTextArea
              placeholder="Description détaillée de la compétence..."
            />
          </div>

          {/* Section État */}
          <div className="form-section">
            <h2>État</h2>
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="actif"
                checked={formData.actif}
                onChange={(e) => handleChange('actif', e.target.checked)}
              />
              <label htmlFor="actif">Compétence active</label>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => navigate('/rh?tab=competences')}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

