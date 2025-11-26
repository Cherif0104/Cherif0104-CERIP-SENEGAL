import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { appelsService } from '../services/appels.service'
import { projetsService } from '../services/projets.service'
import { programmesService } from '../services/programmes.service'
import { referentielsService } from '../services/referentiels.service'
import { toastService } from '../services/toast.service'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import LoadingState from '../components/common/LoadingState'
import SelectWithCreate from '../components/common/SelectWithCreate'
import './AppelForm.css'

export default function AppelForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const projetIdFromQuery = searchParams.get('projet')
  const isEdit = !!id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [isDirty, setIsDirty] = useState(false)
  const [projets, setProjets] = useState([])
  const [statuts, setStatuts] = useState([])
  const [selectedProjet, setSelectedProjet] = useState(null)
  const [selectedProgramme, setSelectedProgramme] = useState(null)
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    projet_id: projetIdFromQuery || '',
    date_ouverture: '',
    date_fermeture: '',
    criteres: '',
    statut: 'OUVERT'
  })

  useEffect(() => {
    const init = async () => {
      try {
        const [projetsRes, statutsRes] = await Promise.all([
          projetsService.getAll(),
          referentielsService.getByType('STATUT_APPEL')
        ])

        if (!projetsRes.error) setProjets(projetsRes.data || [])
        if (!statutsRes.error) setStatuts(statutsRes.data || [])

        if (isEdit) {
          await loadAppel()
        } else if (projetIdFromQuery) {
          await loadProjetContext(projetIdFromQuery)
        }
      } finally {
        setLoading(false)
      }
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadProjetContext = async (projetId) => {
    try {
      const { data } = await projetsService.getById(projetId)
      if (data) {
        setSelectedProjet(data)
        if (data.programme_id) {
          const { data: programmeData } = await programmesService.getById(data.programme_id)
          setSelectedProgramme(programmeData)
        }
      }
    } catch (error) {
      console.error('Error loading projet context:', error)
    }
  }

  const loadAppel = async () => {
    try {
      const { data, error } = await appelsService.getById(id)
      if (error) {
        toastService.error('Erreur lors du chargement de l\'appel')
        navigate('/appels-candidatures')
      } else if (data) {
        setFormData({
          titre: data.titre || '',
          description: data.description || '',
          projet_id: data.projet_id || '',
          date_ouverture: data.date_ouverture ? data.date_ouverture.split('T')[0] : '',
          date_fermeture: data.date_fermeture ? data.date_fermeture.split('T')[0] : '',
          criteres: data.criteres || '',
          statut: data.statut || 'OUVERT'
        })
        
        if (data.projet_id) {
          await loadProjetContext(data.projet_id)
        }
      }
    } catch (error) {
      console.error('Error loading appel:', error)
      toastService.error('Erreur lors du chargement de l\'appel')
      navigate('/appels-candidatures')
    }
  }

  // Validation des dates
  const validateDates = () => {
    const errors = {}
    if (formData.date_ouverture && formData.date_fermeture) {
      if (new Date(formData.date_fermeture) < new Date(formData.date_ouverture)) {
        errors.date_fermeture = 'La date de fermeture doit être postérieure à la date d\'ouverture'
      }
    }
    return errors
  }

  // Validation générale
  const validateForm = () => {
    const dateErrors = validateDates()
    const newErrors = { ...dateErrors }
    
    // Validation titre (min 3, max 200)
    if (!formData.titre || formData.titre.trim().length < 3) {
      newErrors.titre = 'Le titre doit contenir au moins 3 caractères'
    } else if (formData.titre.length > 200) {
      newErrors.titre = 'Le titre ne peut pas dépasser 200 caractères'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation avant soumission
    if (!validateForm()) {
      toastService.error('Veuillez corriger les erreurs dans le formulaire')
      return
    }

    setSaving(true)

    try {
      const appelData = {
        ...formData,
        date_ouverture: formData.date_ouverture || null,
        date_fermeture: formData.date_fermeture || null,
        projet_id: formData.projet_id || null
      }

      let result
      if (isEdit) {
        result = await appelsService.update(id, appelData)
      } else {
        result = await appelsService.create(appelData)
      }

      if (result.error) {
        const errorMessage = result.error.message || 
          `Erreur lors de la ${isEdit ? 'modification' : 'création'} de l'appel`
        toastService.error(errorMessage)
        console.error('API Error:', result.error)
      } else {
        toastService.success(`Appel à candidatures ${isEdit ? 'modifié' : 'créé'} avec succès`)
        setIsDirty(false)
        if (formData.projet_id) {
          navigate(`/projets/${formData.projet_id}`)
        } else {
          navigate('/appels-candidatures')
        }
      }
    } catch (error) {
      console.error('Error saving appel:', error)
      toastService.error(`Erreur lors de la ${isEdit ? 'modification' : 'création'} de l'appel`)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = { ...prev, [name]: value }
      setIsDirty(true)
      
      // Si le projet change, charger le contexte
      if (name === 'projet_id' && value) {
        loadProjetContext(value)
      }
      
      // Validation en temps réel pour dates
      if (name === 'date_ouverture' || name === 'date_fermeture') {
        const dateErrors = validateDates()
        setErrors(prev => ({ ...prev, ...dateErrors }))
      }
      
      return newData
    })
  }

  if (loading) {
    return <LoadingState message="Chargement de l'appel..." />
  }

  return (
    <div className="appel-form-page">
      <div className="appel-form-header">
        <BackButton to={formData.projet_id ? `/projets/${formData.projet_id}` : '/appels-candidatures'} label="Retour" />
        <h1>{isEdit ? 'Modifier l\'Appel à Candidatures' : 'Nouvel Appel à Candidatures'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="appel-form">
        {selectedProjet && selectedProgramme && (
          <div className="form-context-banner">
            <Icon name="Info" size={18} />
            <div>
              <strong>Contexte :</strong> {selectedProgramme.nom} → {selectedProjet.nom}
            </div>
          </div>
        )}

        <div className="form-section">
          <h2>Informations générales</h2>
          <div className="form-grid">
            <div className="form-group form-group--full">
              <label htmlFor="titre">Titre de l'appel *</label>
              <input
                type="text"
                id="titre"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                required
                className={`input ${errors.titre ? 'input-error' : ''}`}
                placeholder="Ex: Appel à candidatures - Entrepreneuriat Digital"
                maxLength={200}
              />
              {errors.titre && <span className="error-message">{errors.titre}</span>}
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="input"
                placeholder="Description détaillée de l'appel à candidatures..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="projet_id">Projet *</label>
              <select
                id="projet_id"
                name="projet_id"
                value={formData.projet_id}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Sélectionner un projet</option>
                {projets.map(p => (
                  <option key={p.id} value={p.id}>{p.nom}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <SelectWithCreate
                label="Statut"
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                options={statuts}
                typeReferentiel="STATUT_APPEL"
                placeholder="Sélectionner un statut"
              />
            </div>

            <div className="form-group">
              <label htmlFor="date_ouverture">Date d'ouverture</label>
              <input
                type="date"
                id="date_ouverture"
                name="date_ouverture"
                value={formData.date_ouverture}
                onChange={handleChange}
                className={`input ${errors.date_ouverture ? 'input-error' : ''}`}
                max={formData.date_fermeture || undefined}
              />
            </div>

            <div className="form-group">
              <label htmlFor="date_fermeture">Date de fermeture</label>
              <input
                type="date"
                id="date_fermeture"
                name="date_fermeture"
                value={formData.date_fermeture}
                onChange={handleChange}
                className={`input ${errors.date_fermeture ? 'input-error' : ''}`}
                min={formData.date_ouverture || undefined}
              />
              {errors.date_fermeture && <span className="error-message">{errors.date_fermeture}</span>}
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="criteres">Critères de sélection</label>
              <textarea
                id="criteres"
                name="criteres"
                value={formData.criteres}
                onChange={handleChange}
                rows={3}
                className="input"
                placeholder="Critères de sélection des candidats..."
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(formData.projet_id ? `/projets/${formData.projet_id}` : '/appels-candidatures')}
            disabled={saving}
          >
            Annuler
          </button>
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
                {isEdit ? 'Modifier' : 'Créer'} l'appel
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

