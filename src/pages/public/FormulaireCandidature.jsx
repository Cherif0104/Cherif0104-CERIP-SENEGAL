import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { appelsService } from '@/services/appels.service'
import { candidaturesPublicService } from '@/services/candidatures-public.service'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import UploadDocuments from '@/components/public/UploadDocuments'
import { LoadingState } from '@/components/common/LoadingState'
import { logger } from '@/utils/logger'
import './FormulaireCandidature.css'

export default function FormulaireCandidature() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const appelId = searchParams.get('appel')

  const [appel, setAppel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    raison_sociale: '',
    secteur: '',
    adresse: '',
    region_id: '',
    departement_id: '',
    commune_id: '',
  })

  const [documents, setDocuments] = useState([])

  useEffect(() => {
    if (appelId) {
      loadAppel()
    } else {
      setError('Aucun appel à candidatures spécifié')
      setLoading(false)
    }
  }, [appelId])

  const loadAppel = async () => {
    setLoading(true)
    try {
      const { data, error } = await appelsService.getById(appelId)
      if (error) {
        logger.error('FORMULAIRE_CANDIDATURE', 'Erreur chargement appel', error)
        setError('Impossible de charger les informations de l\'appel')
        return
      }
      setAppel(data)

      // Vérifier si l'appel est ouvert
      const today = new Date()
      const ouverture = data.date_ouverture ? new Date(data.date_ouverture) : null
      const fermeture = data.date_fermeture ? new Date(data.date_fermeture) : null

      if (ouverture && fermeture && (today < ouverture || today > fermeture)) {
        setError('Cet appel à candidatures est fermé')
      }
    } catch (error) {
      logger.error('FORMULAIRE_CANDIDATURE', 'Erreur inattendue', error)
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    // Validation de base
    if (!formData.email || !formData.telephone) {
      setError('L\'email et le téléphone sont obligatoires')
      setSubmitting(false)
      return
    }

    if (!formData.nom && !formData.raison_sociale) {
      setError('Veuillez renseigner votre nom ou la raison sociale')
      setSubmitting(false)
      return
    }

    try {
      const candidatureData = {
        appel_id: appelId,
        ...formData,
      }

      const { data, error: submitError } = await candidaturesPublicService.submitCandidature(
        candidatureData,
        documents
      )

      if (submitError) {
        setError(submitError.message || 'Erreur lors de la soumission de votre candidature')
        logger.error('FORMULAIRE_CANDIDATURE', 'Erreur soumission', submitError)
        return
      }

      logger.info('FORMULAIRE_CANDIDATURE', 'Candidature soumise avec succès', { candidatId: data.candidat.id })
      setSuccess(true)
    } catch (error) {
      logger.error('FORMULAIRE_CANDIDATURE', 'Erreur inattendue soumission', error)
      setError('Une erreur inattendue est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingState />

  if (!appel) {
    return (
      <div className="formulaire-candidature-error">
        <Icon name="AlertCircle" size={48} />
        <h2>Appel non trouvé</h2>
        <p>{error || 'L\'appel à candidatures demandé n\'existe pas ou n\'est plus disponible.'}</p>
        <Button onClick={() => navigate('/appels')}>Retour à la liste</Button>
      </div>
    )
  }

  if (success) {
    return (
      <div className="formulaire-candidature-success">
        <Icon name="CheckCircle" size={64} />
        <h1>Merci pour votre candidature !</h1>
        <p>
          Votre candidature a été soumise avec succès. Nous vous contacterons prochainement pour la suite du
          processus.
        </p>
        <div className="success-actions">
          <Button variant="secondary" onClick={() => navigate('/appels')}>
            Voir d'autres appels
          </Button>
        </div>
      </div>
    )
  }

  const documentsRequis = Array.isArray(appel.documents_requis) ? appel.documents_requis : []

  return (
    <div className="formulaire-candidature">
      <div className="formulaire-header">
        <Button variant="secondary" onClick={() => navigate(`/appel/${appelId}`)}>
          <Icon name="ArrowLeft" size={16} />
          Retour
        </Button>
        <h1>Formulaire de Candidature</h1>
        <p className="appel-title">{appel.titre}</p>
      </div>

      <form onSubmit={handleSubmit} className="candidature-form">
        {error && (
          <div className="form-error">
            <Icon name="AlertCircle" size={16} />
            {error}
          </div>
        )}

        <div className="form-section">
          <h2>Informations personnelles / Entreprise</h2>
          <div className="form-row">
            <Input
              label="Nom"
              value={formData.nom}
              onChange={(e) => handleChange('nom', e.target.value)}
              placeholder="Nom de famille"
            />
            <Input
              label="Prénom"
              value={formData.prenom}
              onChange={(e) => handleChange('prenom', e.target.value)}
              placeholder="Prénom"
            />
          </div>

          <div className="form-row">
            <Input
              label="Raison sociale (si entreprise)"
              value={formData.raison_sociale}
              onChange={(e) => handleChange('raison_sociale', e.target.value)}
              placeholder="Nom de l'entreprise"
            />
            <Input
              label="Secteur d'activité"
              value={formData.secteur}
              onChange={(e) => handleChange('secteur', e.target.value)}
              placeholder="Ex: Agriculture, Commerce, Services..."
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Coordonnées</h2>
          <div className="form-row">
            <Input
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
              placeholder="email@exemple.com"
            />
            <Input
              label="Téléphone *"
              value={formData.telephone}
              onChange={(e) => handleChange('telephone', e.target.value)}
              required
              placeholder="+221 XX XXX XX XX"
            />
          </div>

          <Input
            label="Adresse"
            value={formData.adresse}
            onChange={(e) => handleChange('adresse', e.target.value)}
            placeholder="Adresse complète"
          />

          <div className="form-row">
            <Input
              label="Région"
              value={formData.region_id}
              onChange={(e) => handleChange('region_id', e.target.value)}
              placeholder="Région"
            />
            <Input
              label="Département"
              value={formData.departement_id}
              onChange={(e) => handleChange('departement_id', e.target.value)}
              placeholder="Département"
            />
            <Input
              label="Commune"
              value={formData.commune_id}
              onChange={(e) => handleChange('commune_id', e.target.value)}
              placeholder="Commune"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Documents à joindre</h2>
          <UploadDocuments
            documents={documents}
            onChange={setDocuments}
            documentsRequis={documentsRequis}
          />
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={() => navigate(`/appel/${appelId}`)}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" loading={submitting} disabled={submitting}>
            <Icon name="Send" size={16} />
            {submitting ? 'Envoi en cours...' : 'Soumettre ma candidature'}
          </Button>
        </div>
      </form>
    </div>
  )
}

