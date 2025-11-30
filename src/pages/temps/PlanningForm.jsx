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
import './PlanningForm.css'

export default function PlanningForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [projets, setProjets] = useState([])
  const [programmes, setProgrammes] = useState([])
  const [formData, setFormData] = useState({
    projet_id: '',
    programme_id: '',
    type_intervention: 'MENTORAT',
    date_prevue: new Date().toISOString().split('T')[0],
    heure_debut: '09:00',
    heure_fin: '17:00',
    duree_prevue: 0,
    lieu: '',
    modalite: 'PRESENTIEL',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProjets()
    loadProgrammes()
    calculateDuree()
  }, [formData.heure_debut, formData.heure_fin])

  const loadProjets = async () => {
    try {
      const { data, error: projetsError } = await projetsService.getAll({ pagination: { page: 1, pageSize: 100 } })
      if (!projetsError && data) {
        setProjets(data)
      }
    } catch (err) {
      logger.error('PLANNING_FORM', 'Erreur chargement projets', err)
    }
  }

  const loadProgrammes = async () => {
    try {
      const { data, error: programmesError } = await programmesService.getAll({ pagination: { page: 1, pageSize: 100 } })
      if (!programmesError && data) {
        setProgrammes(data)
      }
    } catch (err) {
      logger.error('PLANNING_FORM', 'Erreur chargement programmes', err)
    }
  }

  const calculateDuree = () => {
    if (formData.heure_debut && formData.heure_fin) {
      const [debutH, debutM] = formData.heure_debut.split(':').map(Number)
      const [finH, finM] = formData.heure_fin.split(':').map(Number)
      const debutMinutes = debutH * 60 + debutM
      const finMinutes = finH * 60 + finM
      const diffMinutes = finMinutes - debutMinutes
      const heures = diffMinutes > 0 ? diffMinutes / 60 : 0
      handleChange('duree_prevue', heures.toFixed(2))
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

    if (!formData.projet_id && !formData.programme_id) {
      setError('Veuillez sélectionner un projet ou un programme')
      setLoading(false)
      return
    }

    if (formData.duree_prevue <= 0) {
      setError('La durée prévue doit être supérieure à 0')
      setLoading(false)
      return
    }

    try {
      const planningData = {
        ...formData,
        user_id: user?.id,
      }

      const { data, error: createError } = await tempsService.createPlanning(planningData)

      if (createError) {
        logger.error('PLANNING_FORM', 'Erreur création planning', createError)
        setError(createError.message || 'Erreur lors de la création du planning')
        return
      }

      logger.info('PLANNING_FORM', 'Planning créé avec succès', { id: data.id })
      navigate('/gestion-temps?tab=planning')
    } catch (err) {
      logger.error('PLANNING_FORM', 'Erreur inattendue', err)
      setError('Une erreur est survenue lors de la création du planning')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="planning-form-page">
      <div className="planning-form-container">
        <div className="planning-form-header">
          <Button variant="secondary" onClick={() => navigate('/gestion-temps')}>
            <Icon name="ArrowLeft" size={16} />
            Retour
          </Button>
          <h1>Nouvelle Intervention Planifiée</h1>
        </div>

        <form onSubmit={handleSubmit} className="planning-form">
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
                if (e.target.value) handleChange('projet_id', '')
              }}
              options={[{ value: '', label: '-- Aucun --' }, ...programmes.map((p) => ({ value: p.id, label: p.nom }))]}
              placeholder="Sélectionner un programme"
            />

            <Select
              label="Projet"
              value={formData.projet_id}
              onChange={(e) => {
                handleChange('projet_id', e.target.value)
                if (e.target.value) handleChange('programme_id', '')
              }}
              options={[{ value: '', label: '-- Aucun --' }, ...projets.map((p) => ({ value: p.id, label: p.nom }))]}
              placeholder="Sélectionner un projet"
            />
          </div>

          <Select
            label="Type d'intervention"
            value={formData.type_intervention}
            onChange={(e) => handleChange('type_intervention', e.target.value)}
            options={[
              { value: 'MENTORAT', label: 'Mentorat' },
              { value: 'FORMATION', label: 'Formation' },
              { value: 'ACCOMPAGNEMENT', label: 'Accompagnement' },
              { value: 'REUNION', label: 'Réunion' },
              { value: 'AUTRE', label: 'Autre' },
            ]}
            required
          />

          <div className="form-row">
            <Input
              label="Date prévue"
              type="date"
              value={formData.date_prevue}
              onChange={(e) => handleChange('date_prevue', e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
            />

            <Select
              label="Modalité"
              value={formData.modalite}
              onChange={(e) => handleChange('modalite', e.target.value)}
              options={[
                { value: 'PRESENTIEL', label: 'Présentiel' },
                { value: 'VISIO', label: 'Visioconférence' },
                { value: 'TELEPHONE', label: 'Téléphone' },
                { value: 'AUTRE', label: 'Autre' },
              ]}
              required
            />
          </div>

          <div className="form-row">
            <Input
              label="Heure début"
              type="time"
              value={formData.heure_debut}
              onChange={(e) => handleChange('heure_debut', e.target.value)}
              required
            />

            <Input
              label="Heure fin"
              type="time"
              value={formData.heure_fin}
              onChange={(e) => handleChange('heure_fin', e.target.value)}
              required
            />

            <div className="duree-preview">
              <label>Durée calculée</label>
              <div className="duree-value">{parseFloat(formData.duree_prevue || 0).toFixed(2)}h</div>
            </div>
          </div>

          <Input
            label="Lieu"
            value={formData.lieu}
            onChange={(e) => handleChange('lieu', e.target.value)}
            placeholder="Lieu de l'intervention (si présentiel)"
          />

          <Input
            label="Notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            isTextArea={true}
            rows={4}
            placeholder="Notes sur l'intervention planifiée..."
          />

          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => navigate('/gestion-temps')}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" loading={loading} disabled={loading}>
              Planifier l'intervention
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

