import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { tempsService } from '@/services/temps.service'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './AbsenceForm.css'

export default function AbsenceForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    type_absence: 'CONGE',
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: new Date().toISOString().split('T')[0],
    motif: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const calculateJours = () => {
    if (formData.date_debut && formData.date_fin) {
      const debut = new Date(formData.date_debut)
      const fin = new Date(formData.date_fin)
      const diffTime = Math.abs(fin - debut)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      return diffDays
    }
    return 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (new Date(formData.date_fin) < new Date(formData.date_debut)) {
      setError('La date de fin doit être postérieure à la date de début')
      setLoading(false)
      return
    }

    if (!formData.motif) {
      setError('Veuillez indiquer le motif de l\'absence')
      setLoading(false)
      return
    }

    try {
      const { data, error: createError } = await tempsService.createAbsence(formData)

      if (createError) {
        logger.error('ABSENCE_FORM', 'Erreur création absence', createError)
        setError(createError.message || 'Erreur lors de la création de la demande')
        return
      }

      logger.info('ABSENCE_FORM', 'Absence créée avec succès', { id: data.id })
      navigate('/gestion-temps?tab=absences')
    } catch (err) {
      logger.error('ABSENCE_FORM', 'Erreur inattendue', err)
      setError('Une erreur est survenue lors de la création de la demande')
    } finally {
      setLoading(false)
    }
  }

  const nombreJours = calculateJours()

  return (
    <div className="absence-form-page">
      <div className="absence-form-container">
        <div className="absence-form-header">
          <Button variant="secondary" onClick={() => navigate('/gestion-temps')}>
            <Icon name="ArrowLeft" size={16} />
            Retour
          </Button>
          <h1>Demande d'Absence</h1>
        </div>

        <form onSubmit={handleSubmit} className="absence-form">
          {error && (
            <div className="form-error">
              <Icon name="AlertCircle" size={16} />
              {error}
            </div>
          )}

          <Select
            label="Type d'absence"
            value={formData.type_absence}
            onChange={(e) => handleChange('type_absence', e.target.value)}
            options={[
              { value: 'CONGE', label: 'Congé' },
              { value: 'MALADIE', label: 'Maladie' },
              { value: 'FORMATION', label: 'Formation' },
              { value: 'CONGES_EXCEPTIONNELS', label: 'Congés exceptionnels' },
              { value: 'AUTRE', label: 'Autre' },
            ]}
            required
          />

          <div className="form-row">
            <Input
              label="Date de début"
              type="date"
              value={formData.date_debut}
              onChange={(e) => handleChange('date_debut', e.target.value)}
              required
            />

            <Input
              label="Date de fin"
              type="date"
              value={formData.date_fin}
              onChange={(e) => handleChange('date_fin', e.target.value)}
              required
              min={formData.date_debut || undefined}
            />
          </div>

          {nombreJours > 0 && (
            <div className="jours-calcule">
              <Icon name="Calendar" size={16} />
              <span>
                <strong>{nombreJours}</strong> jour{nombreJours > 1 ? 's' : ''} demandé{nombreJours > 1 ? 's' : ''}
              </span>
            </div>
          )}

          <Input
            label="Motif"
            value={formData.motif}
            onChange={(e) => handleChange('motif', e.target.value)}
            isTextArea={true}
            rows={4}
            required
            placeholder="Détails de la demande d'absence..."
          />

          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => navigate('/gestion-temps')}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" loading={loading} disabled={loading}>
              Soumettre la demande
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

