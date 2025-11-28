import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { mentorsService } from '../services/mentors.service'
import { usersService } from '../services/users.service'
import { toastService } from '../services/toast.service'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import LoadingState from '../components/common/LoadingState'
import './MentorForm.css'

export default function MentorForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [isDirty, setIsDirty] = useState(false)
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState({
    user_id: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    specialite: '',
    experience_annees: '',
    statut: 'ACTIF',
    capacite_max: '',
    bio: '',
    competences: [],
    certifications: []
  })
  const [competenceInput, setCompetenceInput] = useState('')
  const [certificationInput, setCertificationInput] = useState('')

  useEffect(() => {
    const init = async () => {
      try {
        const usersRes = await usersService.getAll()
        if (!usersRes.error) {
          // Filtrer les utilisateurs qui ne sont pas déjà mentors ou qui n'ont pas de rôle MENTOR
          setUsers(usersRes.data || [])
        }

        if (isEdit) {
          await loadMentor()
        }
      } finally {
        setLoading(false)
      }
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadMentor = async () => {
    try {
      const { data, error } = await mentorsService.getById(id)
      if (error) {
        toastService.error('Erreur lors du chargement du mentor')
        navigate('/mentors')
      } else if (data) {
        setFormData({
          user_id: data.user_id || '',
          nom: data.nom || '',
          prenom: data.prenom || '',
          email: data.email || '',
          telephone: data.telephone || '',
          specialite: data.specialite || '',
          experience_annees: data.experience_annees || '',
          statut: data.statut || 'ACTIF',
          capacite_max: data.capacite_max || '',
          bio: data.bio || '',
          competences: data.competences || [],
          certifications: data.certifications || []
        })
      }
    } catch (error) {
      console.error('Error loading mentor:', error)
      toastService.error('Erreur lors du chargement du mentor')
      navigate('/mentors')
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.nom || formData.nom.trim().length < 2) {
      newErrors.nom = 'Le nom doit contenir au moins 2 caractères'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide'
    }

    if (formData.experience_annees && parseFloat(formData.experience_annees) < 0) {
      newErrors.experience_annees = 'L\'expérience doit être positive'
    }

    if (formData.capacite_max && parseInt(formData.capacite_max) < 1) {
      newErrors.capacite_max = 'La capacité doit être au moins de 1'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toastService.error('Veuillez corriger les erreurs dans le formulaire')
      return
    }

    setSaving(true)

    try {
      const mentorData = {
        ...formData,
        experience_annees: formData.experience_annees ? parseFloat(formData.experience_annees) : null,
        capacite_max: formData.capacite_max ? parseInt(formData.capacite_max) : null,
        user_id: formData.user_id || null
      }

      let result
      if (isEdit) {
        result = await mentorsService.update(id, mentorData)
      } else {
        result = await mentorsService.create(mentorData)
      }

      if (result.error) {
        const errorMessage = result.error.message || 
          `Erreur lors de la ${isEdit ? 'modification' : 'création'} du mentor`
        toastService.error(errorMessage)
        console.error('API Error:', result.error)
      } else {
        toastService.success(`Mentor ${isEdit ? 'modifié' : 'créé'} avec succès`)
        setIsDirty(false)
        navigate(`/mentors/${result.data.id}`)
      }
    } catch (error) {
      console.error('Error saving mentor:', error)
      toastService.error(`Erreur lors de la ${isEdit ? 'modification' : 'création'} du mentor`)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = { ...prev, [name]: value }
      setIsDirty(true)
      return newData
    })
  }

  const handleAddCompetence = () => {
    if (competenceInput.trim()) {
      setFormData(prev => ({
        ...prev,
        competences: [...(prev.competences || []), competenceInput.trim()]
      }))
      setCompetenceInput('')
      setIsDirty(true)
    }
  }

  const handleRemoveCompetence = (index) => {
    setFormData(prev => ({
      ...prev,
      competences: prev.competences.filter((_, i) => i !== index)
    }))
    setIsDirty(true)
  }

  const handleAddCertification = () => {
    if (certificationInput.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...(prev.certifications || []), certificationInput.trim()]
      }))
      setCertificationInput('')
      setIsDirty(true)
    }
  }

  const handleRemoveCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }))
    setIsDirty(true)
  }

  const STATUTS = ['ACTIF', 'INACTIF', 'SUSPENDU']

  if (loading) {
    return <LoadingState message="Chargement du mentor..." />
  }

  return (
    <div className="mentor-form-page">
      <div className="mentor-form-header">
        <BackButton to={isEdit ? `/mentors/${id}` : '/mentors'} label="Retour" />
        <h1>{isEdit ? 'Modifier le Mentor' : 'Nouveau Mentor'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="mentor-form">
        <div className="form-section">
          <h2>Informations personnelles</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="user_id">Utilisateur</label>
              <select
                id="user_id"
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                className="input"
              >
                <option value="">Sélectionner un utilisateur (optionnel)</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {`${u.prenom || ''} ${u.nom || ''}`.trim() || u.email}
                  </option>
                ))}
              </select>
            </div>

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
                placeholder="Nom du mentor"
              />
              {errors.nom && <span className="error-message">{errors.nom}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="prenom">Prénom</label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className="input"
                placeholder="Prénom du mentor"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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
                placeholder="+221 XX XXX XX XX"
              />
            </div>

            <div className="form-group">
              <label htmlFor="statut">Statut</label>
              <select
                id="statut"
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className="input"
              >
                {STATUTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Informations professionnelles</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="specialite">Spécialité</label>
              <input
                type="text"
                id="specialite"
                name="specialite"
                value={formData.specialite}
                onChange={handleChange}
                className="input"
                placeholder="Ex: Entrepreneuriat, Gestion d'entreprise"
              />
            </div>

            <div className="form-group">
              <label htmlFor="experience_annees">Expérience (années)</label>
              <input
                type="number"
                id="experience_annees"
                name="experience_annees"
                value={formData.experience_annees}
                onChange={handleChange}
                className={`input ${errors.experience_annees ? 'input-error' : ''}`}
                placeholder="0"
                min="0"
              />
              {errors.experience_annees && <span className="error-message">{errors.experience_annees}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="capacite_max">Capacité maximale</label>
              <input
                type="number"
                id="capacite_max"
                name="capacite_max"
                value={formData.capacite_max}
                onChange={handleChange}
                className={`input ${errors.capacite_max ? 'input-error' : ''}`}
                placeholder="0"
                min="1"
              />
              {errors.capacite_max && <span className="error-message">{errors.capacite_max}</span>}
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="bio">Biographie</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="input"
                placeholder="Biographie du mentor..."
              />
            </div>

            <div className="form-group form-group--full">
              <label>Compétences</label>
              <div className="tags-input">
                <div className="tags-list">
                  {formData.competences.map((comp, index) => (
                    <span key={index} className="tag">
                      {comp}
                      <button
                        type="button"
                        onClick={() => handleRemoveCompetence(index)}
                        className="tag-remove"
                      >
                        <Icon name="X" size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="tag-input-group">
                  <input
                    type="text"
                    value={competenceInput}
                    onChange={(e) => setCompetenceInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddCompetence()
                      }
                    }}
                    className="input"
                    placeholder="Ajouter une compétence..."
                  />
                  <button
                    type="button"
                    onClick={handleAddCompetence}
                    className="btn btn-secondary"
                  >
                    <Icon name="Plus" size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group form-group--full">
              <label>Certifications</label>
              <div className="tags-input">
                <div className="tags-list">
                  {formData.certifications.map((cert, index) => (
                    <span key={index} className="tag">
                      {cert}
                      <button
                        type="button"
                        onClick={() => handleRemoveCertification(index)}
                        className="tag-remove"
                      >
                        <Icon name="X" size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="tag-input-group">
                  <input
                    type="text"
                    value={certificationInput}
                    onChange={(e) => setCertificationInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddCertification()
                      }
                    }}
                    className="input"
                    placeholder="Ajouter une certification..."
                  />
                  <button
                    type="button"
                    onClick={handleAddCertification}
                    className="btn btn-secondary"
                  >
                    <Icon name="Plus" size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(isEdit ? `/mentors/${id}` : '/mentors')}
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
                <Icon name="Loader" size={18} />
                {isEdit ? 'Modification...' : 'Création...'}
              </>
            ) : (
              <>
                <Icon name="Save" size={18} />
                {isEdit ? 'Enregistrer' : 'Créer'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
