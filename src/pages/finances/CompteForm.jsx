import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { tresorerieService } from '@/services/tresorerie.service'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './CompteForm.css'

export default function CompteForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nom: '',
    numero_compte: '',
    banque: '',
    type_compte: 'COURANT',
    devise: 'XOF',
    solde_initial: 0,
    responsable_id: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Créer le compte via Supabase directement
      const { data, error: insertError } = await supabase
        .from('comptes_bancaires')
        .insert([
          {
            ...formData,
            solde_actuel: formData.solde_initial, // Initialiser avec solde initial
            actif: true,
          },
        ])
        .select()
        .single()

      if (insertError) {
        logger.error('COMPTE_FORM', 'Erreur création compte', insertError)
        setError(insertError.message || 'Erreur lors de la création du compte')
        return
      }

      logger.info('COMPTE_FORM', 'Compte créé avec succès', { id: data.id })
      navigate('/tresorerie')
    } catch (err) {
      logger.error('COMPTE_FORM', 'Erreur inattendue', err)
      setError('Une erreur est survenue lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="compte-form-page">
      <div className="compte-form-container">
        <div className="compte-form-header">
          <Button variant="secondary" onClick={() => navigate('/tresorerie')}>
            <Icon name="ArrowLeft" size={16} />
            Retour
          </Button>
          <h1>Nouveau Compte Bancaire</h1>
        </div>

        <form onSubmit={handleSubmit} className="compte-form">
          {error && (
            <div className="form-error">
              <Icon name="AlertCircle" size={16} />
              {error}
            </div>
          )}

          <Input
            label="Nom du compte"
            value={formData.nom}
            onChange={(e) => handleChange('nom', e.target.value)}
            required
            placeholder="Ex: Compte Principal"
          />

          <Input
            label="Numéro de compte"
            value={formData.numero_compte}
            onChange={(e) => handleChange('numero_compte', e.target.value)}
            placeholder="Numéro de compte bancaire"
          />

          <Input
            label="Banque"
            value={formData.banque}
            onChange={(e) => handleChange('banque', e.target.value)}
            required
            placeholder="Ex: UBA, SGBS, etc."
          />

          <Select
            label="Type de compte"
            value={formData.type_compte}
            onChange={(e) => handleChange('type_compte', e.target.value)}
            options={[
              { value: 'COURANT', label: 'Compte Courant' },
              { value: 'EPARGNE', label: 'Compte Épargne' },
              { value: 'CAISSE', label: 'Caisse' },
              { value: 'AUTRE', label: 'Autre' },
            ]}
            required
          />

          <Select
            label="Devise"
            value={formData.devise}
            onChange={(e) => handleChange('devise', e.target.value)}
            options={[
              { value: 'XOF', label: 'XOF (Franc CFA)' },
              { value: 'EUR', label: 'EUR (Euro)' },
              { value: 'USD', label: 'USD (Dollar)' },
            ]}
            required
          />

          <Input
            label="Solde initial"
            type="number"
            value={formData.solde_initial}
            onChange={(e) => handleChange('solde_initial', parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            placeholder="0"
          />

          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => navigate('/tresorerie')}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" loading={loading} disabled={loading}>
              Créer le compte
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

