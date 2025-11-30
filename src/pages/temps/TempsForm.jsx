import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { tempsService } from '@/services/temps.service'
import { projetsService } from '@/services/projets.service'
import { programmesService } from '@/services/programmes.service'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './TempsForm.css'

export default function TempsForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [projets, setProjets] = useState([])
  const [programmes, setProgrammes] = useState([])
  const [formData, setFormData] = useState({
    projet_id: '',
    programme_id: '',
    activite: '',
    date_travail: new Date().toISOString().split('T')[0],
    heures: 0,
    description: '',
    taux_horaire: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProjets()
    loadProgrammes()
  }, [])

  const loadProjets = async () => {
    try {
      const { data, error: projetsError } = await projetsService.getAll({ pagination: { page: 1, pageSize: 100 } })
      if (!projetsError && data) {
        setProjets(data)
      }
    } catch (err) {
      logger.error('TEMPS_FORM', 'Erreur chargement projets', err)
    }
  }

  const loadProgrammes = async () => {
    try {
      const { data, error: programmesError } = await programmesService.getAll({ pagination: { page: 1, pageSize: 100 } })
      if (!programmesError && data) {
        setProgrammes(data)
      }
    } catch (err) {
      logger.error('TEMPS_FORM', 'Erreur chargement programmes', err)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.activite) {
      setError('Veuillez indiquer l\'activité')
      setLoading(false)
      return
    }

    if (formData.heures <= 0 || formData.heures > 24) {
      setError('Le nombre d\'heures doit être entre 0 et 24')
      setLoading(false)
      return
    }

    if (!formData.projet_id && !formData.programme_id) {
      setError('Veuillez sélectionner un projet ou un programme')
      setLoading(false)
      return
    }

    try {
      const { data, error: createError } = await tempsService.saisirTemps(formData)

      if (createError) {
        logger.error('TEMPS_FORM', 'Erreur saisie temps', createError)
        setError(createError.message || 'Erreur lors de la saisie du temps')
        return
      }

      logger.info('TEMPS_FORM', 'Temps saisi avec succès', { id: data.id })
      navigate('/gestion-temps?tab=temps')
    } catch (err) {
      logger.error('TEMPS_FORM', 'Erreur inattendue', err)
      setError('Une erreur est survenue lors de la saisie du temps')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="temps-form-page">
      <div className="temps-form-container">
        <div className="temps-form-header">
          <Button variant="secondary" onClick={() => navigate('/gestion-temps')}>
            <Icon name="ArrowLeft" size={16} />
            Retour
          </Button>
          <h1>Saisir du Temps</h1>
        </div>

        <form onSubmit={handleSubmit} className="temps-form">
          {error && (
            <div className="form-error">
              <Icon name="AlertCircle" size={16} />
              {error}
            </div>
          )}

          <div className="form-row">
            <Select
              label="Programme"
              value={formData.programme_id}
              onChange={(e) => {
                handleChange('programme_id', e.target.value)
                if (e.target.value) handleChange('projet_id', '') // Reset projet si programme sélectionné
              }}
              options={[{ value: '', label: '-- Aucun --' }, ...programmes.map((p) => ({ value: p.id, label: p.nom }))]}
              placeholder="Sélectionner un programme"
            />

            <Select
              label="Projet"
              value={formData.projet_id}
              onChange={(e) => {
                handleChange('projet_id', e.target.value)
                if (e.target.value) handleChange('programme_id', '') // Reset programme si projet sélectionné
              }}
              options={[{ value: '', label: '-- Aucun --' }, ...projets.map((p) => ({ value: p.id, label: p.nom }))]}
              placeholder="Sélectionner un projet"
            />
          </div>

          <Input
            label="Activité"
            value={formData.activite}
            onChange={(e) => handleChange('activite', e.target.value)}
            required
            placeholder="Ex: Mentorat, Formation, Réunion, etc."
          />

          <div className="form-row">
            <Input
              label="Date"
              type="date"
              value={formData.date_travail}
              onChange={(e) => handleChange('date_travail', e.target.value)}
              required
            />

            <Input
              label="Heures travaillées"
              type="number"
              value={formData.heures}
              onChange={(e) => handleChange('heures', parseFloat(e.target.value) || 0)}
              min="0"
              max="24"
              step="0.25"
              required
            />
          </div>

          <div className="form-row">
            <Input
              label="Taux horaire (XOF)"
              type="number"
              value={formData.taux_horaire}
              onChange={(e) => handleChange('taux_horaire', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              placeholder="0"
            />

            <div className="cout-preview">
              <label>Coût estimé</label>
              <div className="cout-value">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                  minimumFractionDigits: 0,
                }).format((formData.heures || 0) * (formData.taux_horaire || 0))}
              </div>
            </div>
          </div>

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            isTextArea={true}
            rows={4}
            placeholder="Détails de l'activité effectuée..."
          />

          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => navigate('/gestion-temps')}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" loading={loading} disabled={loading}>
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

