import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { projetsService } from '../services/projets.service'
import { programmesService } from '../services/programmes.service'
import { referentielsService } from '../services/referentiels.service'
import { toastService } from '../services/toast.service'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import LoadingState from '../components/common/LoadingState'
import SelectWithCreate from '../components/common/SelectWithCreate'
import ComboboxWithCreate from '../components/common/ComboboxWithCreate'
import GeographicCascade from '../components/common/GeographicCascade'
import IntervenantsSelector from '../components/common/IntervenantsSelector'
import { getAllTypes } from '../data/types-activites'
import './ProjetForm.css'

export default function ProjetForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const programmeIdFromQuery = searchParams.get('programme')
  const isEdit = !!id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [isDirty, setIsDirty] = useState(false)
  const [programmes, setProgrammes] = useState([])
  const [statuts, setStatuts] = useState([])
  const [typesActivites, setTypesActivites] = useState([])
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    programme_id: programmeIdFromQuery || '',
    type_activite: '',
    date_debut: '',
    date_fin: '',
    budget: '',
    statut: 'EN_PREPARATION',
    chef_projet_id: '',
    mentors_ids: [],
    formateurs_ids: [],
    coaches_ids: [],
    regions: [],
    departements: [],
    communes: [],
    meta: '{}'
  })

  useEffect(() => {
    const init = async () => {
      try {
        // Charger les types d'activité depuis les référentiels et fusionner avec la liste statique
        const [programmesRes, statutsRes, typesActivitesRes] = await Promise.all([
          programmesService.getAll(),
          referentielsService.getByType('STATUT_PROJET'),
          referentielsService.getByType('TYPE_ACTIVITE')
        ])

        if (!programmesRes.error) setProgrammes(programmesRes.data || [])
        if (!statutsRes.error) setStatuts(statutsRes.data || [])
        
        // Fusionner les types statiques avec ceux de la base de données
        const staticTypes = getAllTypes()
        const dbTypes = (typesActivitesRes.data || []).map(t => ({
          id: t.code || t.label,
          label: t.label,
          code: t.code
        }))
        
        // Créer un Set pour éviter les doublons
        const allTypesMap = new Map()
        staticTypes.forEach(t => allTypesMap.set(t.id, { id: t.id, label: t.label, code: t.id }))
        dbTypes.forEach(t => {
          if (!allTypesMap.has(t.code || t.id)) {
            allTypesMap.set(t.code || t.id, t)
          }
        })
        
        setTypesActivites(Array.from(allTypesMap.values()))

        if (isEdit) {
          await loadProjet()
        }
      } finally {
        setLoading(false)
      }
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadProjet = async () => {
    try {
      const { data, error } = await projetsService.getById(id)
      if (error) {
        toastService.error('Erreur lors du chargement du projet')
        navigate('/projets')
      } else if (data) {
        setFormData({
          nom: data.nom || '',
          description: data.description || '',
          programme_id: data.programme_id || '',
          type_activite: data.type_activite || '',
          date_debut: data.date_debut ? data.date_debut.split('T')[0] : '',
          date_fin: data.date_fin ? data.date_fin.split('T')[0] : '',
          budget: data.budget || '',
          statut: data.statut || 'EN_PREPARATION',
          chef_projet_id: data.chef_projet_id || '',
          mentors_ids: data.mentors_ids || [],
          formateurs_ids: data.formateurs_ids || [],
          coaches_ids: data.coaches_ids || [],
          regions: data.regions || [],
          departements: data.departements || [],
          communes: data.communes || [],
          meta: JSON.stringify(data.meta || {}, null, 2)
        })
      }
    } catch (error) {
      console.error('Error loading projet:', error)
      toastService.error('Erreur lors du chargement du projet')
      navigate('/projets')
    }
  }

  // Validation des dates
  const validateDates = () => {
    const errors = {}
    if (formData.date_debut && formData.date_fin) {
      if (new Date(formData.date_fin) < new Date(formData.date_debut)) {
        errors.date_fin = 'La date de fin doit être postérieure à la date de début'
      }
    }
    return errors
  }

  // Validation du JSON meta
  const validateMeta = () => {
    const errors = {}
    if (formData.meta && formData.meta.trim() !== '') {
      try {
        JSON.parse(formData.meta)
      } catch (e) {
        errors.meta = 'JSON invalide. Veuillez corriger la syntaxe.'
      }
    }
    return errors
  }

  // Validation générale
  const validateForm = () => {
    const dateErrors = validateDates()
    const metaErrors = validateMeta()
    const newErrors = { ...dateErrors, ...metaErrors }
    
    // Validation nom (min 3, max 200)
    if (!formData.nom || formData.nom.trim().length < 3) {
      newErrors.nom = 'Le nom doit contenir au moins 3 caractères'
    } else if (formData.nom.length > 200) {
      newErrors.nom = 'Le nom ne peut pas dépasser 200 caractères'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Formatage du budget
  const formatBudget = (value) => {
    if (!value) return ''
    const num = parseFloat(value)
    if (isNaN(num)) return value
    return num.toLocaleString('fr-FR')
  }

  const handleBudgetChange = (e) => {
    const value = e.target.value.replace(/\s/g, '')
    handleChange({ ...e, target: { ...e.target, value } })
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
      const projetData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget.replace(/\s/g, '')) : null,
        date_debut: formData.date_debut || null,
        date_fin: formData.date_fin || null,
        programme_id: formData.programme_id || null,
        meta: safeParseJson(formData.meta)
      }

      let result
      if (isEdit) {
        result = await projetsService.update(id, projetData)
      } else {
        result = await projetsService.create(projetData)
      }

      if (result.error) {
        const errorMessage = result.error.message || 
          `Erreur lors de la ${isEdit ? 'modification' : 'création'} du projet`
        toastService.error(errorMessage)
        console.error('API Error:', result.error)
      } else {
        toastService.success(`Projet ${isEdit ? 'modifié' : 'créé'} avec succès`)
        setIsDirty(false)
        if (formData.programme_id) {
          navigate(`/programmes/${formData.programme_id}`)
        } else {
          navigate('/projets')
        }
      }
    } catch (error) {
      console.error('Error saving projet:', error)
      toastService.error(`Erreur lors de la ${isEdit ? 'modification' : 'création'} du projet`)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = { ...prev, [name]: value }
      setIsDirty(true)
      
      // Validation en temps réel pour meta JSON
      if (name === 'meta') {
        const metaErrors = validateMeta()
        setErrors(prev => ({ ...prev, ...metaErrors }))
      }
      
      // Validation en temps réel pour dates
      if (name === 'date_debut' || name === 'date_fin') {
        const dateErrors = validateDates()
        setErrors(prev => ({ ...prev, ...dateErrors }))
      }
      
      return newData
    })
  }

  const handleArrayChange = (e, fieldName) => {
    const values = Array.isArray(e.target.value) ? e.target.value : []
    setFormData(prev => ({ ...prev, [fieldName]: values }))
    setIsDirty(true)
  }

  if (loading) {
    return <LoadingState message="Chargement du projet..." />
  }

  return (
    <div className="projet-form-page">
      <div className="projet-form-header">
        <BackButton to={formData.programme_id ? `/programmes/${formData.programme_id}` : '/projets'} label="Retour" />
        <h1>{isEdit ? 'Modifier le Projet' : 'Nouveau Projet'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="projet-form">
        <div className="form-section">
          <h2>Informations générales</h2>
          <div className="form-grid">
            <div className="form-group form-group--full">
              <label htmlFor="nom">Nom du projet *</label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className={`input ${errors.nom ? 'input-error' : ''}`}
                placeholder="Ex: Projet d'entrepreneuriat digital"
                maxLength={200}
              />
              {errors.nom && <span className="error-message">{errors.nom}</span>}
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
                placeholder="Description détaillée du projet..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="programme_id">Programme *</label>
              <select
                id="programme_id"
                name="programme_id"
                value={formData.programme_id}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Sélectionner un programme</option>
                {programmes.map(p => (
                  <option key={p.id} value={p.id}>{p.nom}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <SelectWithCreate
                label="Type d'activité"
                name="type_activite"
                value={formData.type_activite}
                onChange={handleChange}
                options={typesActivites}
                typeReferentiel="TYPE_ACTIVITE"
                placeholder="Sélectionner ou créer un type d'activité"
              />
            </div>

            <div className="form-group">
              <SelectWithCreate
                label="Statut"
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                options={statuts}
                typeReferentiel="STATUT_PROJET"
                placeholder="Sélectionner un statut"
              />
            </div>

            <div className="form-group">
              <label htmlFor="budget">Budget (XOF)</label>
              <div className="input-with-suffix">
                <input
                  type="text"
                  id="budget"
                  name="budget"
                  value={formatBudget(formData.budget)}
                  onChange={handleBudgetChange}
                  className="input"
                  placeholder="0"
                  inputMode="numeric"
                />
                <span className="input-suffix">XOF</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="date_debut">Date de début</label>
              <input
                type="date"
                id="date_debut"
                name="date_debut"
                value={formData.date_debut}
                onChange={handleChange}
                className={`input ${errors.date_debut ? 'input-error' : ''}`}
                max={formData.date_fin || undefined}
              />
            </div>

            <div className="form-group">
              <label htmlFor="date_fin">Date de fin</label>
              <input
                type="date"
                id="date_fin"
                name="date_fin"
                value={formData.date_fin}
                onChange={handleChange}
                className={`input ${errors.date_fin ? 'input-error' : ''}`}
                min={formData.date_debut || undefined}
              />
              {errors.date_fin && <span className="error-message">{errors.date_fin}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Assignation des intervenants</h2>
          <IntervenantsSelector
            chefProjetId={formData.chef_projet_id}
            mentorsIds={formData.mentors_ids}
            formateursIds={formData.formateurs_ids}
            coachesIds={formData.coaches_ids}
            onChefProjetChange={handleChange}
            onMentorsChange={(e) => handleArrayChange(e, 'mentors_ids')}
            onFormateursChange={(e) => handleArrayChange(e, 'formateurs_ids')}
            onCoachesChange={(e) => handleArrayChange(e, 'coaches_ids')}
          />
        </div>

        <div className="form-section">
          <h2>Périmètre géographique</h2>
          <div className="form-grid">
            <div className="form-group form-group--full">
              <GeographicCascade
                regions={formData.regions}
                departements={formData.departements}
                communes={formData.communes}
                onRegionsChange={(e) => {
                  setFormData(prev => ({ ...prev, regions: Array.isArray(e.target.value) ? e.target.value : [] }))
                  setIsDirty(true)
                }}
                onDepartementsChange={(e) => {
                  setFormData(prev => ({ ...prev, departements: Array.isArray(e.target.value) ? e.target.value : [] }))
                  setIsDirty(true)
                }}
                onCommunesChange={(e) => {
                  setFormData(prev => ({ ...prev, communes: Array.isArray(e.target.value) ? e.target.value : [] }))
                  setIsDirty(true)
                }}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Paramètres avancés (meta JSON)</h2>
          <div className="form-grid">
            <div className="form-group form-group--full">
              <label>Meta (JSON)</label>
              <textarea
                name="meta"
                value={formData.meta}
                onChange={handleChange}
                rows={6}
                className={`input ${errors.meta ? 'input-error' : ''}`}
                placeholder='{"plafond_subvention": 500000, "apport_minimum": 10}'
              />
              {errors.meta ? (
                <span className="error-message">{errors.meta}</span>
              ) : (
                <small>
                  Utilisé pour des options spécifiques projet sans changer le code.
                </small>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(formData.programme_id ? `/programmes/${formData.programme_id}` : '/projets')}
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
                {isEdit ? 'Modifier' : 'Créer'} le projet
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

function safeParseJson(str) {
  if (!str) return {}
  try {
    return JSON.parse(str)
  } catch {
    return {}
  }
}
