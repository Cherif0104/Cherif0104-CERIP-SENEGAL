import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { formationsService } from '../services/formations.service'
import { projetsService } from '../services/projets.service'
import { usersService } from '../services/users.service'
import { toastService } from '../services/toast.service'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import LoadingState from '../components/common/LoadingState'
import './FormationForm.css'

export default function FormationForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [isDirty, setIsDirty] = useState(false)
  const [projets, setProjets] = useState([])
  const [formateurs, setFormateurs] = useState([])
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    projet_id: '',
    formateur_id: '',
    date_debut: '',
    date_fin: '',
    duree_heures: '',
    statut: 'OUVERT',
    capacite_max: '',
    lieu: '',
    modalite: 'PRESENTIEL',
    cout: '',
    objectifs: '',
    programme: ''
  })

  useEffect(() => {
    const init = async () => {
      try {
        const [projetsRes, usersRes] = await Promise.all([
          projetsService.getAll(),
          usersService.getAll()
        ])

        if (!projetsRes.error) setProjets(projetsRes.data || [])
        
        // Filtrer les formateurs
        if (!usersRes.error) {
          const formateursList = (usersRes.data || []).filter(u => u.role === 'FORMATEUR')
          setFormateurs(formateursList)
        }

        if (isEdit) {
          await loadFormation()
        }
      } finally {
        setLoading(false)
      }
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadFormation = async () => {
    try {
      const { data, error } = await formationsService.getById(id)
      if (error) {
        toastService.error('Erreur lors du chargement de la formation')
        navigate('/formations')
      } else if (data) {
        setFormData({
          nom: data.nom || '',
          description: data.description || '',
          projet_id: data.projet_id || '',
          formateur_id: data.formateur_id || '',
          date_debut: data.date_debut ? data.date_debut.split('T')[0] : '',
          date_fin: data.date_fin ? data.date_fin.split('T')[0] : '',
          duree_heures: data.duree_heures || '',
          statut: data.statut || 'OUVERT',
          capacite_max: data.capacite_max || '',
          lieu: data.lieu || '',
          modalite: data.modalite || 'PRESENTIEL',
          cout: data.cout || '',
          objectifs: data.objectifs || '',
          programme: data.programme || ''
        })
      }
    } catch (error) {
      console.error('Error loading formation:', error)
      toastService.error('Erreur lors du chargement de la formation')
      navigate('/formations')
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.nom || formData.nom.trim().length < 3) {
      newErrors.nom = 'Le nom doit contenir au moins 3 caractères'
    } else if (formData.nom.length > 200) {
      newErrors.nom = 'Le nom ne peut pas dépasser 200 caractères'
    }

    if (formData.date_debut && formData.date_fin) {
      if (new Date(formData.date_fin) < new Date(formData.date_debut)) {
        newErrors.date_fin = 'La date de fin doit être postérieure à la date de début'
      }
    }

    if (formData.duree_heures && parseFloat(formData.duree_heures) < 0) {
      newErrors.duree_heures = 'La durée doit être positive'
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
      const formationData = {
        ...formData,
        duree_heures: formData.duree_heures ? parseFloat(formData.duree_heures) : null,
        capacite_max: formData.capacite_max ? parseInt(formData.capacite_max) : null,
        cout: formData.cout ? parseFloat(formData.cout.replace(/\s/g, '')) : null,
        date_debut: formData.date_debut || null,
        date_fin: formData.date_fin || null,
        projet_id: formData.projet_id || null,
        formateur_id: formData.formateur_id || null
      }

      let result
      if (isEdit) {
        result = await formationsService.update(id, formationData)
      } else {
        result = await formationsService.create(formationData)
      }

      if (result.error) {
        const errorMessage = result.error.message || 
          `Erreur lors de la ${isEdit ? 'modification' : 'création'} de la formation`
        toastService.error(errorMessage)
        console.error('API Error:', result.error)
      } else {
        toastService.success(`Formation ${isEdit ? 'modifiée' : 'créée'} avec succès`)
        setIsDirty(false)
        navigate(`/formations/${result.data.id}`)
      }
    } catch (error) {
      console.error('Error saving formation:', error)
      toastService.error(`Erreur lors de la ${isEdit ? 'modification' : 'création'} de la formation`)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = { ...prev, [name]: value }
      setIsDirty(true)
      
      // Validation en temps réel pour dates
      if (name === 'date_debut' || name === 'date_fin') {
        const dateErrors = {}
        if (newData.date_debut && newData.date_fin) {
          if (new Date(newData.date_fin) < new Date(newData.date_debut)) {
            dateErrors.date_fin = 'La date de fin doit être postérieure à la date de début'
          }
        }
        setErrors(prev => ({ ...prev, ...dateErrors }))
      }
      
      return newData
    })
  }

  const MODALITES = ['PRESENTIEL', 'DISTANCIEL', 'HYBRIDE']
  const STATUTS = ['OUVERT', 'EN_COURS', 'TERMINE', 'ANNULE']

  if (loading) {
    return <LoadingState message="Chargement de la formation..." />
  }

  return (
    <div className="formation-form-page">
      <div className="formation-form-header">
        <BackButton to={isEdit ? `/formations/${id}` : '/formations'} label="Retour" />
        <h1>{isEdit ? 'Modifier la Formation' : 'Nouvelle Formation'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="formation-form">
        <div className="form-section">
          <h2>Informations générales</h2>
          <div className="form-grid">
            <div className="form-group form-group--full">
              <label htmlFor="nom">Nom de la formation *</label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className={`input ${errors.nom ? 'input-error' : ''}`}
                placeholder="Ex: Formation en gestion d'entreprise"
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
                placeholder="Description détaillée de la formation..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="projet_id">Projet</label>
              <select
                id="projet_id"
                name="projet_id"
                value={formData.projet_id}
                onChange={handleChange}
                className="input"
              >
                <option value="">Sélectionner un projet</option>
                {projets.map(p => (
                  <option key={p.id} value={p.id}>{p.nom}</option>
                ))}
              </select>
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
                    {`${f.prenom || ''} ${f.nom || ''}`.trim() || f.email}
                  </option>
                ))}
              </select>
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
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="modalite">Modalité</label>
              <select
                id="modalite"
                name="modalite"
                value={formData.modalite}
                onChange={handleChange}
                className="input"
              >
                {MODALITES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
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

            <div className="form-group">
              <label htmlFor="duree_heures">Durée (heures)</label>
              <input
                type="number"
                id="duree_heures"
                name="duree_heures"
                value={formData.duree_heures}
                onChange={handleChange}
                className={`input ${errors.duree_heures ? 'input-error' : ''}`}
                placeholder="0"
                min="0"
              />
              {errors.duree_heures && <span className="error-message">{errors.duree_heures}</span>}
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

            <div className="form-group">
              <label htmlFor="lieu">Lieu</label>
              <input
                type="text"
                id="lieu"
                name="lieu"
                value={formData.lieu}
                onChange={handleChange}
                className="input"
                placeholder="Ex: Centre de formation, Dakar"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cout">Coût (XOF)</label>
              <input
                type="text"
                id="cout"
                name="cout"
                value={formData.cout}
                onChange={handleChange}
                className="input"
                placeholder="0"
                inputMode="numeric"
              />
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="objectifs">Objectifs</label>
              <textarea
                id="objectifs"
                name="objectifs"
                value={formData.objectifs}
                onChange={handleChange}
                rows={3}
                className="input"
                placeholder="Objectifs de la formation..."
              />
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="programme">Programme</label>
              <textarea
                id="programme"
                name="programme"
                value={formData.programme}
                onChange={handleChange}
                rows={4}
                className="input"
                placeholder="Programme détaillé de la formation..."
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(isEdit ? `/formations/${id}` : '/formations')}
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

