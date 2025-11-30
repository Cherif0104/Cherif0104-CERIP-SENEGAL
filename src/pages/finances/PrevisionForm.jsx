import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { tresorerieService } from '@/services/tresorerie.service'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './PrevisionForm.css'

export default function PrevisionForm() {
  const navigate = useNavigate()
  const [comptes, setComptes] = useState([])
  const [formData, setFormData] = useState({
    compte_bancaire_id: '',
    type_flux: 'ENCAISSEMENT',
    libelle: '',
    montant: 0,
    devise: 'XOF',
    date_prevue: new Date().toISOString().split('T')[0],
    periodicite: 'UNIQUE',
    date_fin_periode: '',
    programme_id: '',
    projet_id: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadComptes()
  }, [])

  const loadComptes = async () => {
    try {
      const { data, error: comptesError } = await tresorerieService.getComptes({ actif: true })
      if (!comptesError && data) {
        setComptes(data)
      }
    } catch (err) {
      logger.error('PREVISION_FORM', 'Erreur chargement comptes', err)
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

    if (!formData.compte_bancaire_id) {
      setError('Veuillez sélectionner un compte bancaire')
      setLoading(false)
      return
    }

    if (formData.montant <= 0) {
      setError('Le montant doit être supérieur à 0')
      setLoading(false)
      return
    }

    if (formData.periodicite !== 'UNIQUE' && !formData.date_fin_periode) {
      setError('Veuillez indiquer la date de fin de période pour les prévisions récurrentes')
      setLoading(false)
      return
    }

    try {
      const { data, error: createError } = await tresorerieService.createPrevision(formData)

      if (createError) {
        logger.error('PREVISION_FORM', 'Erreur création prévision', createError)
        setError(createError.message || 'Erreur lors de la création de la prévision')
        return
      }

      logger.info('PREVISION_FORM', 'Prévision créée avec succès', { id: data.id })
      navigate('/tresorerie')
    } catch (err) {
      logger.error('PREVISION_FORM', 'Erreur inattendue', err)
      setError('Une erreur est survenue lors de la création de la prévision')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="prevision-form-page">
      <div className="prevision-form-container">
        <div className="prevision-form-header">
          <Button variant="secondary" onClick={() => navigate('/tresorerie')}>
            <Icon name="ArrowLeft" size={16} />
            Retour
          </Button>
          <h1>Nouvelle Prévision de Trésorerie</h1>
        </div>

        <form onSubmit={handleSubmit} className="prevision-form">
          {error && (
            <div className="form-error">
              <Icon name="AlertCircle" size={16} />
              {error}
            </div>
          )}

          <Select
            label="Compte bancaire"
            value={formData.compte_bancaire_id}
            onChange={(e) => handleChange('compte_bancaire_id', e.target.value)}
            options={comptes.map((c) => ({ value: c.id, label: `${c.nom} (${c.banque})` }))}
            required
            placeholder="Sélectionner un compte"
          />

          <Select
            label="Type de flux"
            value={formData.type_flux}
            onChange={(e) => handleChange('type_flux', e.target.value)}
            options={[
              { value: 'ENCAISSEMENT', label: 'Encaissement' },
              { value: 'DECAISSEMENT', label: 'Décaissement' },
            ]}
            required
          />

          <Input
            label="Libellé"
            value={formData.libelle}
            onChange={(e) => handleChange('libelle', e.target.value)}
            required
            placeholder="Description de la prévision"
          />

          <div className="form-row">
            <Input
              label="Montant"
              type="number"
              value={formData.montant}
              onChange={(e) => handleChange('montant', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              required
            />

            <Select
              label="Devise"
              value={formData.devise}
              onChange={(e) => handleChange('devise', e.target.value)}
              options={[
                { value: 'XOF', label: 'XOF' },
                { value: 'EUR', label: 'EUR' },
                { value: 'USD', label: 'USD' },
              ]}
              required
            />
          </div>

          <Input
            label="Date prévue"
            type="date"
            value={formData.date_prevue}
            onChange={(e) => handleChange('date_prevue', e.target.value)}
            required
          />

          <Select
            label="Périodicité"
            value={formData.periodicite}
            onChange={(e) => handleChange('periodicite', e.target.value)}
            options={[
              { value: 'UNIQUE', label: 'Unique' },
              { value: 'MENSUEL', label: 'Mensuel' },
              { value: 'TRIMESTRIEL', label: 'Trimestriel' },
              { value: 'ANNUEL', label: 'Annuel' },
            ]}
            required
          />

          {formData.periodicite !== 'UNIQUE' && (
            <Input
              label="Date de fin de période"
              type="date"
              value={formData.date_fin_periode}
              onChange={(e) => handleChange('date_fin_periode', e.target.value)}
              required
              min={formData.date_prevue || undefined}
            />
          )}

          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => navigate('/tresorerie')}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" loading={loading} disabled={loading}>
              Créer la prévision
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

