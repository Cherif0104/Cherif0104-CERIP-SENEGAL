import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { tresorerieService } from '@/services/tresorerie.service'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './FluxForm.css'

export default function FluxForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const typeFlux = searchParams.get('type') || 'ENCAISSEMENT'
  const [comptes, setComptes] = useState([])
  const [formData, setFormData] = useState({
    compte_bancaire_id: '',
    type_flux: typeFlux,
    categorie: typeFlux === 'ENCAISSEMENT' ? 'FINANCEMENT' : 'DEPENSE',
    libelle: '',
    montant: 0,
    devise: 'XOF',
    date_operation: new Date().toISOString().split('T')[0],
    date_valeur: new Date().toISOString().split('T')[0],
    reference: '',
    moyen_paiement: 'VIREMENT',
    programme_id: '',
    projet_id: '',
    statut: 'PREVU',
    notes: '',
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
      logger.error('FLUX_FORM', 'Erreur chargement comptes', err)
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

    try {
      const { data, error: createError } = await tresorerieService.createFlux(formData)

      if (createError) {
        logger.error('FLUX_FORM', 'Erreur création flux', createError)
        setError(createError.message || 'Erreur lors de la création du flux')
        return
      }

      logger.info('FLUX_FORM', 'Flux créé avec succès', { id: data.id })
      navigate('/tresorerie')
    } catch (err) {
      logger.error('FLUX_FORM', 'Erreur inattendue', err)
      setError('Une erreur est survenue lors de la création du flux')
    } finally {
      setLoading(false)
    }
  }

  const categoriesEncaissement = [
    { value: 'FINANCEMENT', label: 'Financement' },
    { value: 'SUBVENTION', label: 'Subvention' },
    { value: 'DON', label: 'Don' },
    { value: 'AUTRE', label: 'Autre' },
  ]

  const categoriesDecaissement = [
    { value: 'DEPENSE', label: 'Dépense' },
    { value: 'SALAIRE', label: 'Salaires' },
    { value: 'FRAIS', label: 'Frais généraux' },
    { value: 'MATERIEL', label: 'Matériel' },
    { value: 'AUTRE', label: 'Autre' },
  ]

  return (
    <div className="flux-form-page">
      <div className="flux-form-container">
        <div className="flux-form-header">
          <Button variant="secondary" onClick={() => navigate('/tresorerie')}>
            <Icon name="ArrowLeft" size={16} />
            Retour
          </Button>
          <h1>{typeFlux === 'ENCAISSEMENT' ? 'Nouvel Encaissement' : 'Nouveau Décaissement'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="flux-form">
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

          <Input
            label="Libellé"
            value={formData.libelle}
            onChange={(e) => handleChange('libelle', e.target.value)}
            required
            placeholder={`Description de l'${typeFlux === 'ENCAISSEMENT' ? 'encaissement' : 'décaissement'}`}
          />

          <Select
            label="Catégorie"
            value={formData.categorie}
            onChange={(e) => handleChange('categorie', e.target.value)}
            options={
              typeFlux === 'ENCAISSEMENT' ? categoriesEncaissement : categoriesDecaissement
            }
            required
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

          <div className="form-row">
            <Input
              label="Date opération"
              type="date"
              value={formData.date_operation}
              onChange={(e) => handleChange('date_operation', e.target.value)}
              required
            />

            <Input
              label="Date valeur"
              type="date"
              value={formData.date_valeur}
              onChange={(e) => handleChange('date_valeur', e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <Select
              label="Moyen de paiement"
              value={formData.moyen_paiement}
              onChange={(e) => handleChange('moyen_paiement', e.target.value)}
              options={[
                { value: 'VIREMENT', label: 'Virement' },
                { value: 'CHEQUE', label: 'Chèque' },
                { value: 'ESPECES', label: 'Espèces' },
                { value: 'CARTE', label: 'Carte bancaire' },
                { value: 'AUTRE', label: 'Autre' },
              ]}
              required
            />

            <Select
              label="Statut"
              value={formData.statut}
              onChange={(e) => handleChange('statut', e.target.value)}
              options={[
                { value: 'PREVU', label: 'Prévu' },
                { value: 'EN_COURS', label: 'En cours' },
                { value: 'REALISE', label: 'Réalisé' },
              ]}
              required
            />
          </div>

          <Input
            label="Référence"
            value={formData.reference}
            onChange={(e) => handleChange('reference', e.target.value)}
            placeholder="Numéro de facture, chèque, etc."
          />

          <Input
            label="Notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            isTextArea={true}
            rows={3}
            placeholder="Notes supplémentaires..."
          />

          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => navigate('/tresorerie')}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" loading={loading} disabled={loading}>
              {typeFlux === 'ENCAISSEMENT' ? 'Enregistrer l\'encaissement' : 'Enregistrer le décaissement'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

