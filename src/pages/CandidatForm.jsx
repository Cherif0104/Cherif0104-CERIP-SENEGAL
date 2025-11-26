import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { candidatsService } from '../services/candidats.service'
import { appelsService } from '../services/appels.service'
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
import './CandidatForm.css'

export default function CandidatForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const appelIdFromQuery = searchParams.get('appel')
  const isEdit = !!id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [isDirty, setIsDirty] = useState(false)
  const [appels, setAppels] = useState([])
  const [statuts, setStatuts] = useState([])
  const [genres, setGenres] = useState([])
  const [eligibiliteStatus, setEligibiliteStatus] = useState(null)
  const [selectedAppel, setSelectedAppel] = useState(null)
  const [selectedProjet, setSelectedProjet] = useState(null)
  const [selectedProgramme, setSelectedProgramme] = useState(null)
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    date_naissance: '',
    genre: '',
    adresse: '',
    ville: '',
    region: '',
    departement: '',
    commune: '',
    appel_id: appelIdFromQuery || '',
    statut: 'NOUVEAU'
  })

  useEffect(() => {
    const init = async () => {
      try {
        const [appelsRes, statutsRes, genresRes] = await Promise.all([
          appelsService.getAll(),
          referentielsService.getByType('STATUT_CANDIDAT'),
          referentielsService.getByType('GENRE')
        ])

        if (!appelsRes.error) setAppels(appelsRes.data || [])
        if (!statutsRes.error) setStatuts(statutsRes.data || [])
        if (!genresRes.error) setGenres(genresRes.data || [])

        if (isEdit) {
          await loadCandidat()
        } else if (appelIdFromQuery) {
          await loadAppelContext(appelIdFromQuery)
        }
      } finally {
        setLoading(false)
      }
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadAppelContext = async (appelId) => {
    try {
      const { data } = await appelsService.getById(appelId)
      if (data) {
        setSelectedAppel(data)
        if (data.projet_id) {
          const { data: projetData } = await projetsService.getById(data.projet_id)
          setSelectedProjet(projetData)
          if (projetData?.programme_id) {
            const { data: programmeData } = await programmesService.getById(projetData.programme_id)
            setSelectedProgramme(programmeData)
          }
        }
      }
    } catch (error) {
      console.error('Error loading appel context:', error)
    }
  }

  const loadCandidat = async () => {
    try {
      const { data, error } = await candidatsService.getById(id)
      if (error) {
        toastService.error('Erreur lors du chargement du candidat')
        navigate('/candidats')
      } else if (data) {
        setFormData({
          nom: data.nom || '',
          prenom: data.prenom || '',
          email: data.email || '',
          telephone: data.telephone || '',
          date_naissance: data.date_naissance ? data.date_naissance.split('T')[0] : '',
          genre: data.genre || '',
          adresse: data.adresse || '',
          ville: data.ville || '',
          region: data.region || '',
          departement: data.departement || '',
          commune: data.commune || '',
          appel_id: data.appel_id || '',
          statut: data.statut || 'NOUVEAU'
        })
        
        if (data.appel_id) {
          await loadAppelContext(data.appel_id)
        }
      }
    } catch (error) {
      console.error('Error loading candidat:', error)
      toastService.error('Erreur lors du chargement du candidat')
      navigate('/candidats')
    }
  }

  // Vérification éligibilité en temps réel
  useEffect(() => {
    if (formData.appel_id && formData.date_naissance && formData.genre && formData.region) {
      checkEligibilite()
    } else {
      setEligibiliteStatus(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.appel_id, formData.date_naissance, formData.genre, formData.region])

  const checkEligibilite = async () => {
    try {
      const result = await candidatsService.evaluateEligibility({
        appel_id: formData.appel_id,
        date_naissance: formData.date_naissance,
        genre: formData.genre,
        region: formData.region,
        departement: formData.departement,
        commune: formData.commune
      })
      
      if (result.statut_eligibilite) {
        setEligibiliteStatus(result.statut_eligibilite)
      }
    } catch (error) {
      console.error('Error checking eligibility:', error)
    }
  }

  // Validation
  const validateForm = () => {
    const newErrors = {}
    
    // Validation nom/prénom (min 2 caractères)
    if (!formData.nom || formData.nom.trim().length < 2) {
      newErrors.nom = 'Le nom doit contenir au moins 2 caractères'
    }
    if (!formData.prenom || formData.prenom.trim().length < 2) {
      newErrors.prenom = 'Le prénom doit contenir au moins 2 caractères'
    }

    // Validation email
    if (!formData.email) {
      newErrors.email = 'L\'email est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide'
    }

    // Validation date de naissance (doit être dans le passé)
    if (formData.date_naissance) {
      const birthDate = new Date(formData.date_naissance)
      const today = new Date()
      if (birthDate >= today) {
        newErrors.date_naissance = 'La date de naissance doit être dans le passé'
      }
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
      const candidatData = {
        ...formData,
        date_naissance: formData.date_naissance || null,
        appel_id: formData.appel_id || null
      }

      let result
      if (isEdit) {
        result = await candidatsService.update(id, candidatData)
      } else {
        result = await candidatsService.create(candidatData)
      }

      if (result.error) {
        const errorMessage = result.error.message || 
          `Erreur lors de la ${isEdit ? 'modification' : 'création'} du candidat`
        toastService.error(errorMessage)
        console.error('API Error:', result.error)
      } else {
        toastService.success(`Candidat ${isEdit ? 'modifié' : 'créé'} avec succès`)
        setIsDirty(false)
        if (formData.appel_id) {
          navigate(`/appels-candidatures/${formData.appel_id}`)
        } else {
          navigate('/candidats')
        }
      }
    } catch (error) {
      console.error('Error saving candidat:', error)
      toastService.error(`Erreur lors de la ${isEdit ? 'modification' : 'création'} du candidat`)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = { ...prev, [name]: value }
      setIsDirty(true)
      
      // Si l'appel change, charger le contexte
      if (name === 'appel_id' && value) {
        loadAppelContext(value)
      }
      
      return newData
    })
  }

  const handleArrayChange = (e, fieldName) => {
    const values = Array.isArray(e.target.value) ? e.target.value : []
    setFormData(prev => ({ ...prev, [fieldName]: values }))
    setIsDirty(true)
  }

  const getEligibiliteBadgeClass = (status) => {
    if (!status) return ''
    const statusLower = status.toLowerCase()
    return `eligibilite-badge eligibilite--${statusLower}`
  }

  if (loading) {
    return <LoadingState message="Chargement du candidat..." />
  }

  return (
    <div className="candidat-form-page">
      <div className="candidat-form-header">
        <BackButton to={formData.appel_id ? `/appels-candidatures/${formData.appel_id}` : '/candidats'} label="Retour" />
        <h1>{isEdit ? 'Modifier le Candidat' : 'Nouveau Candidat'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="candidat-form">
        {selectedAppel && selectedProjet && selectedProgramme && (
          <div className="form-context-banner">
            <Icon name="Info" size={18} />
            <div>
              <strong>Contexte :</strong> {selectedProgramme.nom} → {selectedProjet.nom} → {selectedAppel.titre}
            </div>
          </div>
        )}

        {eligibiliteStatus && (
          <div className={`eligibilite-alert ${getEligibiliteBadgeClass(eligibiliteStatus)}`}>
            <Icon name={eligibiliteStatus === 'ELIGIBLE' ? 'CheckCircle' : 'AlertCircle'} size={18} />
            <div>
              <strong>Statut d'éligibilité :</strong> {eligibiliteStatus}
            </div>
          </div>
        )}

        <div className="form-section">
          <h2>Informations personnelles</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nom">Nom *</label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className={`input ${errors.nom ? 'input-error' : ''}`}
                placeholder="Nom"
                maxLength={100}
              />
              {errors.nom && <span className="error-message">{errors.nom}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="prenom">Prénom *</label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
                className={`input ${errors.prenom ? 'input-error' : ''}`}
                placeholder="Prénom"
                maxLength={100}
              />
              {errors.prenom && <span className="error-message">{errors.prenom}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="email@example.com"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="telephone">Téléphone</label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="input"
                placeholder="+221 77 123 45 67"
              />
            </div>

            <div className="form-group">
              <label htmlFor="date_naissance">Date de naissance</label>
              <input
                type="date"
                id="date_naissance"
                name="date_naissance"
                value={formData.date_naissance}
                onChange={handleChange}
                className={`input ${errors.date_naissance ? 'input-error' : ''}`}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.date_naissance && <span className="error-message">{errors.date_naissance}</span>}
            </div>

            <div className="form-group">
              <SelectWithCreate
                label="Genre"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                options={genres}
                typeReferentiel="GENRE"
                placeholder="Sélectionner un genre"
              />
            </div>

            <div className="form-group">
              <label htmlFor="appel_id">Appel à candidatures *</label>
              <select
                id="appel_id"
                name="appel_id"
                value={formData.appel_id}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Sélectionner un appel</option>
                {appels.map(a => (
                  <option key={a.id} value={a.id}>{a.titre}</option>
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
                typeReferentiel="STATUT_CANDIDAT"
                placeholder="Sélectionner un statut"
              />
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="adresse">Adresse</label>
              <input
                type="text"
                id="adresse"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                className="input"
                placeholder="Adresse complète"
              />
            </div>

            <div className="form-group">
              <label htmlFor="ville">Ville</label>
              <input
                type="text"
                id="ville"
                name="ville"
                value={formData.ville}
                onChange={handleChange}
                className="input"
                placeholder="Ville"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Localisation géographique</h2>
          <div className="form-grid">
            <div className="form-group form-group--full">
              <GeographicCascade
                regions={formData.region ? [formData.region] : []}
                departements={formData.departement ? [formData.departement] : []}
                communes={formData.commune ? [formData.commune] : []}
                onRegionsChange={(e) => {
                  const regions = Array.isArray(e.target.value) ? e.target.value : []
                  setFormData(prev => ({ ...prev, region: regions[0] || '' }))
                  setIsDirty(true)
                }}
                onDepartementsChange={(e) => {
                  const depts = Array.isArray(e.target.value) ? e.target.value : []
                  setFormData(prev => ({ ...prev, departement: depts[0] || '' }))
                  setIsDirty(true)
                }}
                onCommunesChange={(e) => {
                  const communes = Array.isArray(e.target.value) ? e.target.value : []
                  setFormData(prev => ({ ...prev, commune: communes[0] || '' }))
                  setIsDirty(true)
                }}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(formData.appel_id ? `/appels-candidatures/${formData.appel_id}` : '/candidats')}
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
                {isEdit ? 'Modifier' : 'Créer'} le candidat
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
