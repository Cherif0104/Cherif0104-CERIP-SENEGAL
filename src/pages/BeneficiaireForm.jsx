import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { beneficiairesService } from '../services/beneficiaires.service'
import { projetsService } from '../services/projets.service'
import { programmesService } from '../services/programmes.service'
import { referentielsService } from '../services/referentiels.service'
import { usersService } from '../services/users.service'
import { toastService } from '../services/toast.service'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import LoadingState from '../components/common/LoadingState'
import SelectWithCreate from '../components/common/SelectWithCreate'
import GeographicCascade from '../components/common/GeographicCascade'
import './BeneficiaireForm.css'

export default function BeneficiaireForm() {
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
  const [genres, setGenres] = useState([])
  const [mentors, setMentors] = useState([])
  const [formateurs, setFormateurs] = useState([])
  const [coaches, setCoaches] = useState([])
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
    projet_id: projetIdFromQuery || '',
    statut: 'ACTIF',
    mentor_id: '',
    formateur_id: '',
    coach_id: ''
  })

  useEffect(() => {
    const init = async () => {
      try {
        const [
          projetsRes,
          statutsRes,
          genresRes,
          mentorsRes,
          formateursRes,
          coachesRes
        ] = await Promise.all([
          projetsService.getAll(),
          referentielsService.getByType('STATUT_BENEFICIAIRE'),
          referentielsService.getByType('GENRE'),
          usersService.getByRole('MENTOR'),
          usersService.getByRole('FORMATEUR'),
          usersService.getByRole('COACH')
        ])

        if (!projetsRes.error) setProjets(projetsRes.data || [])
        if (!statutsRes.error) setStatuts(statutsRes.data || [])
        if (!genresRes.error) setGenres(genresRes.data || [])
        if (!mentorsRes.error) setMentors(mentorsRes.data || [])
        if (!formateursRes.error) setFormateurs(formateursRes.data || [])
        if (!coachesRes.error) setCoaches(coachesRes.data || [])

        if (isEdit) {
          await loadBeneficiaire()
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

  const loadBeneficiaire = async () => {
    try {
      const { data, error } = await beneficiairesService.getById(id)
      if (error) {
        toastService.error('Erreur lors du chargement du bénéficiaire')
        navigate('/beneficiaires')
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
          projet_id: data.projet_id || '',
          statut: data.statut || 'ACTIF',
          mentor_id: data.mentor_id || '',
          formateur_id: data.formateur_id || '',
          coach_id: data.coach_id || ''
        })
        
        if (data.projet_id) {
          await loadProjetContext(data.projet_id)
        }
      }
    } catch (error) {
      console.error('Error loading beneficiaire:', error)
      toastService.error('Erreur lors du chargement du bénéficiaire')
      navigate('/beneficiaires')
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

    // Validation date de naissance
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
      const beneficiaireData = {
        ...formData,
        date_naissance: formData.date_naissance || null,
        projet_id: formData.projet_id || null,
        mentor_id: formData.mentor_id || null,
        formateur_id: formData.formateur_id || null,
        coach_id: formData.coach_id || null
      }

      let result
      if (isEdit) {
        result = await beneficiairesService.update(id, beneficiaireData)
      } else {
        result = await beneficiairesService.create(beneficiaireData)
      }

      if (result.error) {
        const errorMessage = result.error.message || 
          `Erreur lors de la ${isEdit ? 'modification' : 'création'} du bénéficiaire`
        toastService.error(errorMessage)
        console.error('API Error:', result.error)
      } else {
        toastService.success(`Bénéficiaire ${isEdit ? 'modifié' : 'créé'} avec succès`)
        setIsDirty(false)
        navigate(`/beneficiaires/${result.data?.id || id}`)
      }
    } catch (error) {
      console.error('Error saving beneficiaire:', error)
      toastService.error(`Erreur lors de la ${isEdit ? 'modification' : 'création'} du bénéficiaire`)
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
      
      return newData
    })
  }

  const getUserName = (userId, usersList) => {
    const user = usersList.find(u => u.id === userId)
    return user ? `${user.nom} ${user.prenom}` : userId
  }

  if (loading) {
    return <LoadingState message="Chargement du bénéficiaire..." />
  }

  return (
    <div className="beneficiaire-form-page">
      <div className="beneficiaire-form-header">
        <BackButton to={formData.projet_id ? `/projets/${formData.projet_id}` : '/beneficiaires'} label="Retour" />
        <h1>{isEdit ? 'Modifier le Bénéficiaire' : 'Nouveau Bénéficiaire'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="beneficiaire-form">
        {selectedProjet && selectedProgramme && (
          <div className="form-context-banner">
            <Icon name="Info" size={18} />
            <div>
              <strong>Contexte :</strong> {selectedProgramme.nom} → {selectedProjet.nom}
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
              <label htmlFor="projet_id">Projet *</label>
              <select
                id="projet_id"
                name="projet_id"
                value={formData.projet_id}
                onChange={handleChange}
                className="input"
                required
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
                typeReferentiel="STATUT_BENEFICIAIRE"
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

        <div className="form-section">
          <h2>Assignation des intervenants</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="mentor_id">Mentor</label>
              <select
                id="mentor_id"
                name="mentor_id"
                value={formData.mentor_id}
                onChange={handleChange}
                className="input"
              >
                <option value="">Sélectionner un mentor</option>
                {mentors.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.nom} {m.prenom} ({m.email})
                  </option>
                ))}
              </select>
              {formData.mentor_id && (
                <div className="selected-user-badge">
                  <Icon name="Handshake" size={14} />
                  <span>{getUserName(formData.mentor_id, mentors)}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="formateur_id">Formateur</label>
              <select
                id="formateur_id"
                name="formateur_id"
                value={formData.formateur_id}
                onChange={handleChange}
                className="input"
              >
                <option value="">Sélectionner un formateur</option>
                {formateurs.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.nom} {f.prenom} ({f.email})
                  </option>
                ))}
              </select>
              {formData.formateur_id && (
                <div className="selected-user-badge">
                  <Icon name="GraduationCap" size={14} />
                  <span>{getUserName(formData.formateur_id, formateurs)}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="coach_id">Coach</label>
              <select
                id="coach_id"
                name="coach_id"
                value={formData.coach_id}
                onChange={handleChange}
                className="input"
              >
                <option value="">Sélectionner un coach</option>
                {coaches.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nom} {c.prenom} ({c.email})
                  </option>
                ))}
              </select>
              {formData.coach_id && (
                <div className="selected-user-badge">
                  <Icon name="UserCircle" size={14} />
                  <span>{getUserName(formData.coach_id, coaches)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(formData.projet_id ? `/projets/${formData.projet_id}` : '/beneficiaires')}
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
                {isEdit ? 'Modifier' : 'Créer'} le bénéficiaire
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

