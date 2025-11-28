import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { dossiersService } from '../services/dossiers.service'
import { appelsService } from '../services/appels.service'
import { candidatsService } from '../services/candidats.service'
import { projetsService } from '../services/projets.service'
import { toastService } from '../services/toast.service'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import LoadingState from '../components/common/LoadingState'
import './DossierForm.css'

export default function DossierForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [isDirty, setIsDirty] = useState(false)
  const [appels, setAppels] = useState([])
  const [candidats, setCandidats] = useState([])
  const [projets, setProjets] = useState([])
  const [formData, setFormData] = useState({
    candidat_id: '',
    appel_id: '',
    projet_id: '',
    statut: 'EN_ATTENTE',
    date_depot: '',
    date_traitement: '',
    date_decision: '',
    notes: '',
    motif_refus: ''
  })

  useEffect(() => {
    const init = async () => {
      try {
        const [appelsRes, candidatsRes, projetsRes] = await Promise.all([
          appelsService.getAll(),
          candidatsService.getAll(),
          projetsService.getAll()
        ])

        if (!appelsRes.error) setAppels(appelsRes.data || [])
        if (!candidatsRes.error) setCandidats(candidatsRes.data || [])
        if (!projetsRes.error) setProjets(projetsRes.data || [])

        if (isEdit) {
          await loadDossier()
        } else {
          // Par défaut, date_depot = aujourd'hui
          setFormData(prev => ({
            ...prev,
            date_depot: new Date().toISOString().split('T')[0]
          }))
        }
      } finally {
        setLoading(false)
      }
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadDossier = async () => {
    try {
      const { data, error } = await dossiersService.getById(id)
      if (error) {
        toastService.error('Erreur lors du chargement du dossier')
        navigate('/dossiers')
      } else if (data) {
        setFormData({
          candidat_id: data.candidat_id || '',
          appel_id: data.appel_id || '',
          projet_id: data.projet_id || '',
          statut: data.statut || 'EN_ATTENTE',
          date_depot: data.date_depot ? data.date_depot.split('T')[0] : '',
          date_traitement: data.date_traitement ? data.date_traitement.split('T')[0] : '',
          date_decision: data.date_decision ? data.date_decision.split('T')[0] : '',
          notes: data.notes || '',
          motif_refus: data.motif_refus || ''
        })
      }
    } catch (error) {
      console.error('Error loading dossier:', error)
      toastService.error('Erreur lors du chargement du dossier')
      navigate('/dossiers')
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.candidat_id) {
      newErrors.candidat_id = 'Le candidat est requis'
    }

    if (formData.date_traitement && formData.date_depot) {
      if (new Date(formData.date_traitement) < new Date(formData.date_depot)) {
        newErrors.date_traitement = 'La date de traitement doit être postérieure à la date de dépôt'
      }
    }

    if (formData.date_decision && formData.date_traitement) {
      if (new Date(formData.date_decision) < new Date(formData.date_traitement)) {
        newErrors.date_decision = 'La date de décision doit être postérieure à la date de traitement'
      }
    }

    if (formData.statut === 'REFUSE' && !formData.motif_refus) {
      newErrors.motif_refus = 'Le motif de refus est requis lorsque le statut est REFUSE'
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
      const dossierData = {
        ...formData,
        date_depot: formData.date_depot || null,
        date_traitement: formData.date_traitement || null,
        date_decision: formData.date_decision || null,
        candidat_id: formData.candidat_id || null,
        appel_id: formData.appel_id || null,
        projet_id: formData.projet_id || null,
        documents: [] // Pour l'instant, pas de gestion de documents
      }

      let result
      if (isEdit) {
        result = await dossiersService.update(id, dossierData)
      } else {
        result = await dossiersService.create(dossierData)
      }

      if (result.error) {
        const errorMessage = result.error.message || 
          `Erreur lors de la ${isEdit ? 'modification' : 'création'} du dossier`
        toastService.error(errorMessage)
        console.error('API Error:', result.error)
      } else {
        toastService.success(`Dossier ${isEdit ? 'modifié' : 'créé'} avec succès`)
        setIsDirty(false)
        navigate(`/dossiers/${result.data.id}`)
      }
    } catch (error) {
      console.error('Error saving dossier:', error)
      toastService.error(`Erreur lors de la ${isEdit ? 'modification' : 'création'} du dossier`)
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
      if (name === 'date_traitement' || name === 'date_decision' || name === 'date_depot') {
        const dateErrors = {}
        if (newData.date_traitement && newData.date_depot) {
          if (new Date(newData.date_traitement) < new Date(newData.date_depot)) {
            dateErrors.date_traitement = 'La date de traitement doit être postérieure à la date de dépôt'
          }
        }
        if (newData.date_decision && newData.date_traitement) {
          if (new Date(newData.date_decision) < new Date(newData.date_traitement)) {
            dateErrors.date_decision = 'La date de décision doit être postérieure à la date de traitement'
          }
        }
        setErrors(prev => ({ ...prev, ...dateErrors }))
      }
      
      return newData
    })
  }

  const STATUTS = ['ACCEPTE', 'EN_TRAITEMENT', 'REFUSE', 'EN_ATTENTE']

  if (loading) {
    return <LoadingState message="Chargement du dossier..." />
  }

  return (
    <div className="dossier-form-page">
      <div className="dossier-form-header">
        <BackButton to={isEdit ? `/dossiers/${id}` : '/dossiers'} label="Retour" />
        <h1>{isEdit ? 'Modifier le Dossier' : 'Nouveau Dossier'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="dossier-form">
        <div className="form-section">
          <h2>Informations générales</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="candidat_id">Candidat *</label>
              <select
                id="candidat_id"
                name="candidat_id"
                value={formData.candidat_id}
                onChange={handleChange}
                required
                className={`input ${errors.candidat_id ? 'input-error' : ''}`}
              >
                <option value="">Sélectionner un candidat</option>
                {candidats.map(c => (
                  <option key={c.id} value={c.id}>
                    {`${c.prenom || ''} ${c.nom || ''}`.trim() || 'Candidat sans nom'}
                  </option>
                ))}
              </select>
              {errors.candidat_id && <span className="error-message">{errors.candidat_id}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="appel_id">Appel à candidatures</label>
              <select
                id="appel_id"
                name="appel_id"
                value={formData.appel_id}
                onChange={handleChange}
                className="input"
              >
                <option value="">Sélectionner un appel</option>
                {appels.map(a => (
                  <option key={a.id} value={a.id}>{a.titre}</option>
                ))}
              </select>
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
              <label htmlFor="date_depot">Date de dépôt</label>
              <input
                type="date"
                id="date_depot"
                name="date_depot"
                value={formData.date_depot}
                onChange={handleChange}
                className={`input ${errors.date_depot ? 'input-error' : ''}`}
              />
            </div>

            <div className="form-group">
              <label htmlFor="date_traitement">Date de traitement</label>
              <input
                type="date"
                id="date_traitement"
                name="date_traitement"
                value={formData.date_traitement}
                onChange={handleChange}
                className={`input ${errors.date_traitement ? 'input-error' : ''}`}
                min={formData.date_depot || undefined}
              />
              {errors.date_traitement && <span className="error-message">{errors.date_traitement}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="date_decision">Date de décision</label>
              <input
                type="date"
                id="date_decision"
                name="date_decision"
                value={formData.date_decision}
                onChange={handleChange}
                className={`input ${errors.date_decision ? 'input-error' : ''}`}
                min={formData.date_traitement || formData.date_depot || undefined}
              />
              {errors.date_decision && <span className="error-message">{errors.date_decision}</span>}
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="input"
                placeholder="Notes sur le dossier..."
              />
            </div>

            {formData.statut === 'REFUSE' && (
              <div className="form-group form-group--full">
                <label htmlFor="motif_refus">Motif de refus *</label>
                <textarea
                  id="motif_refus"
                  name="motif_refus"
                  value={formData.motif_refus}
                  onChange={handleChange}
                  rows={3}
                  required
                  className={`input ${errors.motif_refus ? 'input-error' : ''}`}
                  placeholder="Expliquer le motif du refus..."
                />
                {errors.motif_refus && <span className="error-message">{errors.motif_refus}</span>}
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(isEdit ? `/dossiers/${id}` : '/dossiers')}
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
