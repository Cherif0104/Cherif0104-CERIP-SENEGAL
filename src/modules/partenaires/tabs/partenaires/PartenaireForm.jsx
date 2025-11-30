import { useState, useEffect } from 'react'
import { partenairesService } from '@/services/partenaires.service'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import '../organismes/OrganismeForm.css'

export default function PartenaireForm({ id, onClose }) {
  const isEdit = !!id
  const [formData, setFormData] = useState({
    code: '',
    nom: '',
    type_partenariat: '',
    domaines_collaboration: [],
    pays: '',
    adresse: '',
    site_web: '',
    email: '',
    telephone: '',
    contacts: [],
    notes: '',
    actif: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [nouveauDomaine, setNouveauDomaine] = useState('')

  useEffect(() => {
    if (isEdit) {
      loadPartenaire()
    }
  }, [id])

  const loadPartenaire = async () => {
    setLoading(true)
    try {
      const { data, error } = await partenairesService.getById(id)
      if (error) {
        logger.error('PARTENAIRE_FORM', 'Erreur chargement partenaire', error)
        setError('Erreur lors du chargement')
        return
      }
      setFormData({
        ...data,
        contacts: Array.isArray(data.contacts) ? data.contacts : [],
        domaines_collaboration: Array.isArray(data.domaines_collaboration) ? data.domaines_collaboration : [],
      })
    } catch (error) {
      logger.error('PARTENAIRE_FORM', 'Erreur inattendue', error)
      setError('Erreur inattendue')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleAddDomaine = () => {
    if (nouveauDomaine.trim()) {
      setFormData((prev) => ({
        ...prev,
        domaines_collaboration: [...prev.domaines_collaboration, nouveauDomaine.trim()],
      }))
      setNouveauDomaine('')
    }
  }

  const handleRemoveDomaine = (index) => {
    setFormData((prev) => ({
      ...prev,
      domaines_collaboration: prev.domaines_collaboration.filter((_, i) => i !== index),
    }))
  }

  const handleAddContact = () => {
    setFormData((prev) => ({
      ...prev,
      contacts: [...prev.contacts, { nom: '', fonction: '', email: '', telephone: '' }],
    }))
  }

  const handleContactChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact
      ),
    }))
  }

  const handleRemoveContact = (index) => {
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.nom) {
      setError('Le nom est requis')
      setLoading(false)
      return
    }

    try {
      const dataToSave = {
        ...formData,
        contacts: formData.contacts.filter((c) => c.nom || c.email),
      }

      if (isEdit) {
        const { error } = await partenairesService.update(id, dataToSave)
        if (error) {
          setError(error.message || 'Erreur lors de la mise à jour')
          return
        }
        logger.info('PARTENAIRE_FORM', 'Partenaire mis à jour', { id })
      } else {
        const { error } = await partenairesService.create(dataToSave)
        if (error) {
          setError(error.message || 'Erreur lors de la création')
          return
        }
        logger.info('PARTENAIRE_FORM', 'Partenaire créé')
      }

      onClose()
    } catch (error) {
      logger.error('PARTENAIRE_FORM', 'Erreur inattendue', error)
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEdit) {
    return <div>Chargement...</div>
  }

  return (
    <div className="organisme-form-page">
      <div className="organisme-form-container">
        <div className="organisme-form-header">
          <Button variant="secondary" onClick={onClose}>
            <Icon name="ArrowLeft" size={16} />
            Retour
          </Button>
          <h1>{isEdit ? 'Modifier le partenaire' : 'Nouveau partenaire'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="organisme-form">
          {error && (
            <div className="form-error">
              <Icon name="AlertCircle" size={16} />
              {error}
            </div>
          )}

          <div className="form-row">
            <Input
              label="Code"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value)}
              placeholder="Auto-généré si vide"
            />
            <Input
              label="Nom"
              value={formData.nom}
              onChange={(e) => handleChange('nom', e.target.value)}
              required
              placeholder="Nom du partenaire"
            />
          </div>

          <div className="form-row">
            <Select
              label="Type de partenariat"
              value={formData.type_partenariat}
              onChange={(e) => handleChange('type_partenariat', e.target.value)}
              options={[
                { value: '', label: '-- Sélectionner --' },
                { value: 'Technique', label: 'Technique' },
                { value: 'Financier', label: 'Financier' },
                { value: 'Stratégique', label: 'Stratégique' },
                { value: 'Opérationnel', label: 'Opérationnel' },
                { value: 'Autre', label: 'Autre' },
              ]}
            />
            <Input
              label="Pays"
              value={formData.pays}
              onChange={(e) => handleChange('pays', e.target.value)}
              placeholder="Pays"
            />
          </div>

          <div className="contacts-section">
            <div className="section-header">
              <h3>Domaines de collaboration</h3>
            </div>
            <div className="domaines-form">
              <div className="domaines-list-form">
                {formData.domaines_collaboration.map((domaine, index) => (
                  <div key={index} className="domaine-item-form">
                    <span>{domaine}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDomaine(index)}
                      className="remove-btn"
                    >
                      <Icon name="X" size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="add-domaine-form">
                <Input
                  value={nouveauDomaine}
                  onChange={(e) => setNouveauDomaine(e.target.value)}
                  placeholder="Nouveau domaine"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddDomaine()
                    }
                  }}
                />
                <Button type="button" variant="secondary" onClick={handleAddDomaine}>
                  <Icon name="Plus" size={14} />
                  Ajouter
                </Button>
              </div>
            </div>
          </div>

          <Input
            label="Adresse"
            value={formData.adresse}
            onChange={(e) => handleChange('adresse', e.target.value)}
            placeholder="Adresse complète"
          />

          <div className="form-row">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="email@exemple.com"
            />
            <Input
              label="Téléphone"
              value={formData.telephone}
              onChange={(e) => handleChange('telephone', e.target.value)}
              placeholder="+221 XX XXX XX XX"
            />
          </div>

          <Input
            label="Site web"
            type="url"
            value={formData.site_web}
            onChange={(e) => handleChange('site_web', e.target.value)}
            placeholder="https://..."
          />

          <div className="contacts-section">
            <div className="section-header">
              <h3>Contacts</h3>
              <Button type="button" variant="secondary" size="sm" onClick={handleAddContact}>
                <Icon name="Plus" size={14} />
                Ajouter un contact
              </Button>
            </div>
            {formData.contacts.map((contact, index) => (
              <div key={index} className="contact-form-row">
                <Input
                  label="Nom"
                  value={contact.nom || ''}
                  onChange={(e) => handleContactChange(index, 'nom', e.target.value)}
                  placeholder="Nom complet"
                />
                <Input
                  label="Fonction"
                  value={contact.fonction || ''}
                  onChange={(e) => handleContactChange(index, 'fonction', e.target.value)}
                  placeholder="Fonction"
                />
                <Input
                  label="Email"
                  type="email"
                  value={contact.email || ''}
                  onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                  placeholder="email@exemple.com"
                />
                <Input
                  label="Téléphone"
                  value={contact.telephone || ''}
                  onChange={(e) => handleContactChange(index, 'telephone', e.target.value)}
                  placeholder="+221 XX XXX XX XX"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRemoveContact(index)}
                  className="remove-contact-btn"
                >
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
            ))}
          </div>

          <Input
            label="Notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            isTextArea={true}
            rows={4}
            placeholder="Notes supplémentaires..."
          />

          <div className="form-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.actif}
                onChange={(e) => handleChange('actif', e.target.checked)}
              />
              <span>Actif</span>
            </label>
          </div>

          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" loading={loading} disabled={loading}>
              {isEdit ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

