import { useState, useEffect } from 'react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Icon } from '@/components/common/Icon'
import { configurationService } from '@/services/configuration.service'
import { logger } from '@/utils/logger'
import './ConfigurationSysteme.css'

export default function ConfigurationSysteme() {
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [config, setConfig] = useState({
    // Général
    nom_organisme: 'CERIP Senegal',
    adresse: '',
    telephone: '',
    email: '',
    site_web: '',

    // Sécurité
    duree_session: 24, // heures
    complexite_mot_de_passe: 'medium',
    tentatives_max: 5,

    // Localisation
    devise: 'XOF',
    format_date: 'DD/MM/YYYY',
    langue: 'fr',

    // Email
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    email_from: '',
  })

  useEffect(() => {
    loadConfiguration()
  }, [])

  const loadConfiguration = async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error: loadError } = await configurationService.getAllAsObject()
      
      if (loadError) {
        logger.error('CONFIGURATION', 'Erreur chargement', loadError)
        setError('Erreur lors du chargement de la configuration')
        return
      }

      if (data) {
        setConfig((prev) => ({
          ...prev,
          nom_organisme: data.nom_organisme || prev.nom_organisme,
          adresse: data.adresse || prev.adresse,
          telephone: data.telephone || prev.telephone,
          email: data.email || prev.email,
          site_web: data.site_web || prev.site_web,
          duree_session: data.duree_session || prev.duree_session,
          complexite_mot_de_passe: data.complexite_mot_de_passe || prev.complexite_mot_de_passe,
          tentatives_max: data.tentatives_max || prev.tentatives_max,
          devise: data.devise || prev.devise,
          format_date: data.format_date || prev.format_date,
          langue: data.langue || prev.langue,
          smtp_host: data.smtp_host || prev.smtp_host,
          smtp_port: data.smtp_port || prev.smtp_port,
          smtp_user: data.smtp_user || prev.smtp_user,
          smtp_password: data.smtp_password || prev.smtp_password,
          email_from: data.email_from || prev.email_from,
        }))
      }
    } catch (error) {
      logger.error('CONFIGURATION', 'Erreur inattendue chargement', error)
      setError('Erreur inattendue lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
    setError('')
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaved(false)

    try {
      // Préparer les configurations à sauvegarder
      const configsToSave = [
        { cle: 'nom_organisme', valeur: config.nom_organisme, type: 'string', categorie: 'general' },
        { cle: 'adresse', valeur: config.adresse || null, type: 'string', categorie: 'general' },
        { cle: 'telephone', valeur: config.telephone || null, type: 'string', categorie: 'general' },
        { cle: 'email', valeur: config.email || null, type: 'string', categorie: 'general' },
        { cle: 'site_web', valeur: config.site_web || null, type: 'string', categorie: 'general' },
        { cle: 'duree_session', valeur: config.duree_session, type: 'number', categorie: 'securite' },
        { cle: 'complexite_mot_de_passe', valeur: config.complexite_mot_de_passe, type: 'string', categorie: 'securite' },
        { cle: 'tentatives_max', valeur: config.tentatives_max, type: 'number', categorie: 'securite' },
        { cle: 'devise', valeur: config.devise, type: 'string', categorie: 'localisation' },
        { cle: 'format_date', valeur: config.format_date, type: 'string', categorie: 'localisation' },
        { cle: 'langue', valeur: config.langue, type: 'string', categorie: 'localisation' },
        { cle: 'smtp_host', valeur: config.smtp_host || null, type: 'string', categorie: 'email' },
        { cle: 'smtp_port', valeur: config.smtp_port, type: 'number', categorie: 'email' },
        { cle: 'smtp_user', valeur: config.smtp_user || null, type: 'string', categorie: 'email' },
        { cle: 'smtp_password', valeur: config.smtp_password || null, type: 'string', categorie: 'email' },
        { cle: 'email_from', valeur: config.email_from || null, type: 'string', categorie: 'email' },
      ]

      const result = await configurationService.saveBatch(configsToSave)

      if (result.errors.length > 0) {
        logger.error('CONFIGURATION', 'Erreurs sauvegarde', result.errors)
        setError('Certaines configurations n\'ont pas pu être sauvegardées')
        return
      }

      logger.info('CONFIGURATION', 'Configuration sauvegardée avec succès', { saved: result.data.length })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      logger.error('CONFIGURATION', 'Erreur sauvegarde', error)
      setError('Erreur lors de la sauvegarde de la configuration')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'general', label: 'Général' },
    { id: 'securite', label: 'Sécurité' },
    { id: 'localisation', label: 'Localisation' },
    { id: 'email', label: 'Email' },
  ]

  return (
    <div className="configuration-systeme">
      <div className="configuration-header">
        <h2>Configuration Système</h2>
        <p className="subtitle">Paramètres généraux du système</p>
      </div>

      <div className="configuration-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`config-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-container">Chargement de la configuration...</div>
      ) : (
        <div className="configuration-content">
          {error && (
            <div className="error-message">
              <Icon name="AlertCircle" size={16} />
              {error}
            </div>
          )}

          {activeTab === 'general' && (
          <div className="config-section">
            <h3>Informations générales</h3>
            <div className="config-grid">
              <Input
                label="Nom de l'organisme"
                value={config.nom_organisme}
                onChange={(e) => handleChange('nom_organisme', e.target.value)}
              />
              <Input
                label="Adresse"
                value={config.adresse}
                onChange={(e) => handleChange('adresse', e.target.value)}
                isTextArea
              />
              <Input
                label="Téléphone"
                value={config.telephone}
                onChange={(e) => handleChange('telephone', e.target.value)}
              />
              <Input label="Email" type="email" value={config.email} onChange={(e) => handleChange('email', e.target.value)} />
              <Input
                label="Site web"
                value={config.site_web}
                onChange={(e) => handleChange('site_web', e.target.value)}
                placeholder="https://"
              />
            </div>
          </div>
        )}

        {activeTab === 'securite' && (
          <div className="config-section">
            <h3>Paramètres de sécurité</h3>
            <div className="config-grid">
              <Input
                label="Durée de session (heures)"
                type="number"
                value={config.duree_session}
                onChange={(e) => handleChange('duree_session', parseInt(e.target.value))}
              />
              <Select
                label="Complexité mot de passe"
                value={config.complexite_mot_de_passe}
                onChange={(e) => handleChange('complexite_mot_de_passe', e.target.value)}
                options={[
                  { value: 'low', label: 'Faible (6 caractères)' },
                  { value: 'medium', label: 'Moyen (8 caractères + lettres/chiffres)' },
                  { value: 'high', label: 'Élevé (12 caractères + majuscules/minuscules/chiffres/symboles)' },
                ]}
              />
              <Input
                label="Tentatives max avant blocage"
                type="number"
                value={config.tentatives_max}
                onChange={(e) => handleChange('tentatives_max', parseInt(e.target.value))}
              />
            </div>
          </div>
        )}

        {activeTab === 'localisation' && (
          <div className="config-section">
            <h3>Localisation et format</h3>
            <div className="config-grid">
              <Select
                label="Devise"
                value={config.devise}
                onChange={(e) => handleChange('devise', e.target.value)}
                options={[
                  { value: 'XOF', label: 'XOF (Franc CFA)' },
                  { value: 'EUR', label: 'EUR (Euro)' },
                  { value: 'USD', label: 'USD (Dollar)' },
                ]}
              />
              <Select
                label="Format de date"
                value={config.format_date}
                onChange={(e) => handleChange('format_date', e.target.value)}
                options={[
                  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                ]}
              />
              <Select
                label="Langue"
                value={config.langue}
                onChange={(e) => handleChange('langue', e.target.value)}
                options={[
                  { value: 'fr', label: 'Français' },
                  { value: 'en', label: 'English' },
                  { value: 'wo', label: 'Wolof' },
                ]}
              />
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="config-section">
            <h3>Configuration Email (SMTP)</h3>
            <div className="config-grid">
              <Input label="SMTP Host" value={config.smtp_host} onChange={(e) => handleChange('smtp_host', e.target.value)} />
              <Input
                label="SMTP Port"
                type="number"
                value={config.smtp_port}
                onChange={(e) => handleChange('smtp_port', parseInt(e.target.value))}
              />
              <Input
                label="SMTP User"
                value={config.smtp_user}
                onChange={(e) => handleChange('smtp_user', e.target.value)}
              />
              <Input
                label="SMTP Password"
                type="password"
                value={config.smtp_password}
                onChange={(e) => handleChange('smtp_password', e.target.value)}
              />
              <Input
                label="Email From"
                type="email"
                value={config.email_from}
                onChange={(e) => handleChange('email_from', e.target.value)}
              />
            </div>
            <div className="info-box">
              <Icon name="Info" size={20} />
              <div>
                Les paramètres SMTP seront utilisés pour envoyer les emails automatiques (notifications, rappels, etc.)
              </div>
            </div>
          </div>
        )}

        <div className="config-actions">
          {saved && (
            <div className="saved-message">
              <Icon name="CheckCircle" size={16} />
              Configuration sauvegardée
            </div>
          )}
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
        </div>
      )}
    </div>
  )
}

