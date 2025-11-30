import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { postesService } from '@/services/postes.service'
import { competencesService } from '@/services/competences.service'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './PosteForm.css'

export default function PosteForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const isNew = !id

  const [formData, setFormData] = useState({
    code: '',
    titre: '',
    description: '',
    departement: '',
    type_contrat: '',
    salaire_min: '',
    salaire_max: '',
    niveau_requis: '',
    competences_requises: [],
    statut: 'OUVERT',
    actif: true,
  })

  const [competences, setCompetences] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadCompetences()
    if (isEdit) {
      loadPoste()
    }
  }, [id])

  const loadCompetences = async () => {
    try {
      const result = await competencesService.getAll()
      if (!result.error && result.data) {
        setCompetences(result.data)
      }
    } catch (error) {
      logger.error('POSTE_FORM', 'Erreur chargement compétences', error)
    } finally {
      setLoadingData(false)
    }
  }

  const loadPoste = async () => {
    setLoading(true)
    try {
      const result = await postesService.getById(id)
      if (result.error) {
        logger.error('POSTE_FORM', 'Erreur chargement poste', result.error)
        setError('Erreur lors du chargement')
        return
      }

      const data = result.data
      setFormData({
        code: data.code || '',
        titre: data.titre || '',
        description: data.description || '',
        departement: data.departement || '',
        type_contrat: data.type_contrat || '',
        salaire_min: data.salaire_min || '',
        salaire_max: data.salaire_max || '',
        niveau_requis: data.niveau_requis || '',
        competences_requises: Array.isArray(data.competences_requises) ? data.competences_requises : [],
        statut: data.statut || 'OUVERT',
        actif: data.actif !== undefined ? data.actif : true,
      })
    } catch (error) {
      logger.error('POSTE_FORM', 'Erreur inattendue', error)
      setError('Erreur inattendue')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleCompetenceToggle = (competenceId) => {
    setFormData((prev) => {
      const competences = prev.competences_requises || []
      const isSelected = competences.includes(competenceId)
      return {
        ...prev,
        competences_requises: isSelected
          ? competences.filter((id) => id !== competenceId)
          : [...competences, competenceId],
      }
    })
  }

  const generateCode = async () => {
    try {
      const result = await postesService.getAll({ pagination: { page: 1, pageSize: 1 } })
      const count = result.data?.length || 0
      const newCode = `POST-${String(count + 1).padStart(4, '0')}`
      setFormData((prev) => ({ ...prev, code: newCode }))
    } catch (error) {
      logger.error('POSTE_FORM', 'Erreur génération code', error)
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
    if (!formData.titre) {
      setError('Le titre est requis')
      setLoading(false)
      return
    }

    if (!formData.code) {
      setError('Le code est requis')
      setLoading(false)
      return
    }

    try {
      const dataToSave = {
        ...formData,
        salaire_min: formData.salaire_min ? parseFloat(formData.salaire_min) : null,
        salaire_max: formData.salaire_max ? parseFloat(formData.salaire_max) : null,
        competences_requises: formData.competences_requises || [],
      }

      if (isEdit) {
        const result = await postesService.update(id, dataToSave)
        if (result.error) {
          setError(result.error.message || 'Erreur lors de la mise à jour')
          return
        }
        logger.info('POSTE_FORM', 'Poste mis à jour', { id })
        navigate(`/rh/postes/${id}`)
      } else {
        const result = await postesService.create(dataToSave)
        if (result.error) {
          setError(result.error.message || 'Erreur lors de la création')
          return
        }
        logger.info('POSTE_FORM', 'Poste créé', { id: result.data?.id })
        navigate(`/rh/postes/${result.data?.id}`)
      }
    } catch (error) {
      logger.error('POSTE_FORM', 'Erreur inattendue', error)
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData || (loading && isEdit)) {
    return <div className="loading-container">Chargement...</div>
  }

  return (
    <div className="poste-form-page">
      <div className="poste-form-container">
        <div className="poste-form-header">
          <Button variant="secondary" onClick={() => navigate('/rh?tab=postes')}>
            <Icon name="ArrowLeft" size={16} />
            Retour
          </Button>
          <h1>{isEdit ? 'Modifier le poste' : 'Nouveau poste'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="poste-form">
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
                label="Titre"
                value={formData.titre}
                onChange={(e) => handleChange('titre', e.target.value)}
                required
                placeholder="Ex: Développeur Full Stack"
              />
              <Input
                label="Département"
                value={formData.departement}
                onChange={(e) => handleChange('departement', e.target.value)}
                placeholder="Ex: IT, RH, Marketing"
              />
              <Select
                label="Type de contrat"
                value={formData.type_contrat}
                onChange={(e) => handleChange('type_contrat', e.target.value)}
                options={[
                  { value: '', label: 'Sélectionner...' },
                  { value: 'CDI', label: 'CDI' },
                  { value: 'CDD', label: 'CDD' },
                  { value: 'STAGE', label: 'Stage' },
                  { value: 'PRESTATION', label: 'Prestation' },
                  { value: 'PROJET', label: 'Contrat projet' },
                  { value: 'PROGRAMME', label: 'Contrat programme' },
                ]}
              />
              <Select
                label="Niveau requis"
                value={formData.niveau_requis}
                onChange={(e) => handleChange('niveau_requis', e.target.value)}
                options={[
                  { value: '', label: 'Sélectionner...' },
                  { value: 'JUNIOR', label: 'Junior' },
                  { value: 'INTERMEDIAIRE', label: 'Intermédiaire' },
                  { value: 'SENIOR', label: 'Senior' },
                  { value: 'EXPERT', label: 'Expert' },
                ]}
              />
              <Select
                label="Statut"
                value={formData.statut}
                onChange={(e) => handleChange('statut', e.target.value)}
                required
                options={[
                  { value: 'OUVERT', label: 'Ouvert' },
                  { value: 'FERME', label: 'Fermé' },
                  { value: 'SUSPENDU', label: 'Suspendu' },
                ]}
              />
            </div>
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              isTextArea
              placeholder="Description détaillée du poste..."
            />
          </div>

          {/* Section Salaire */}
          <div className="form-section">
            <h2>Salaire</h2>
            <div className="form-grid">
              <Input
                label="Salaire minimum"
                type="number"
                value={formData.salaire_min}
                onChange={(e) => handleChange('salaire_min', e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
              <Input
                label="Salaire maximum"
                type="number"
                value={formData.salaire_max}
                onChange={(e) => handleChange('salaire_max', e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>

          {/* Section Compétences requises */}
          <div className="form-section">
            <h2>Compétences requises</h2>
            {competences.length > 0 ? (
              <div className="competences-selector">
                {competences.map((competence) => {
                  const isSelected = formData.competences_requises.includes(competence.id)
                  return (
                    <div key={competence.id} className="competence-checkbox-item">
                      <input
                        type="checkbox"
                        id={`competence-${competence.id}`}
                        checked={isSelected}
                        onChange={() => handleCompetenceToggle(competence.id)}
                      />
                      <label htmlFor={`competence-${competence.id}`}>
                        <div className="competence-label-content">
                          <span className="competence-name">{competence.nom}</span>
                          {competence.categorie && (
                            <span className="competence-category">({competence.categorie})</span>
                          )}
                        </div>
                      </label>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="no-competences">Aucune compétence disponible. Créez d'abord des compétences.</p>
            )}
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
              <label htmlFor="actif">Poste actif</label>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => navigate('/rh?tab=postes')}>
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

