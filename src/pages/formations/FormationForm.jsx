import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { formationsService } from '@/services/formations.service'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { logger } from '@/utils/logger'
import './FormationForm.css'

export default function FormationForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type: '',
    categorie: '',
    formateur_id: '',
    lieu: '',
    date_debut: '',
    date_fin: '',
    duree: '',
    participants_max: '',
    cout: '',
    statut: 'BROUILLON',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isEdit) {
      loadFormation()
    }
  }, [id, isEdit])

  const loadFormation = async () => {
    setLoading(true)
    try {
      const { data, error } = await formationsService.getById(id)
      if (error) {
        logger.error('FORMATION_FORM', 'Erreur chargement', error)
        navigate('/beneficiaires?tab=formations')
        return
      }

      if (data) {
        setFormData({
          titre: data.titre || '',
          description: data.description || '',
          type: data.type || '',
          categorie: data.categorie || '',
          formateur_id: data.formateur_id || '',
          lieu: data.lieu || '',
          date_debut: data.date_debut ? data.date_debut.split('T')[0] : '',
          date_fin: data.date_fin ? data.date_fin.split('T')[0] : '',
          duree: data.duree || '',
          participants_max: data.participants_max || '',
          cout: data.cout || '',
          statut: data.statut || 'BROUILLON',
        })
      }
    } catch (error) {
      logger.error('FORMATION_FORM', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.titre?.trim()) {
      newErrors.titre = 'Le titre est requis'
    }

    if (!formData.date_debut) {
      newErrors.date_debut = 'La date de début est requise'
    }

    if (!formData.date_fin) {
      newErrors.date_fin = 'La date de fin est requise'
    }

    if (formData.date_debut && formData.date_fin) {
      if (new Date(formData.date_debut) > new Date(formData.date_fin)) {
        newErrors.date_fin = 'La date de fin doit être après la date de début'
      }
    }

    if (formData.duree && formData.duree < 0) {
      newErrors.duree = 'La durée doit être positive'
    }

    if (formData.participants_max && formData.participants_max < 1) {
      newErrors.participants_max = 'Le nombre de participants doit être au moins 1'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...formData,
        duree: formData.duree ? parseInt(formData.duree) : null,
        participants_max: formData.participants_max ? parseInt(formData.participants_max) : null,
        cout: formData.cout ? parseFloat(formData.cout) : null,
        formateur_id: formData.formateur_id || null,
      }

      let result
      if (isEdit) {
        result = await formationsService.update(id, payload)
      } else {
        result = await formationsService.create(payload)
      }

      if (result.error) {
        logger.error('FORMATION_FORM', 'Erreur sauvegarde', result.error)
        alert('Erreur lors de la sauvegarde')
        return
      }

      logger.info('FORMATION_FORM', 'Formation sauvegardée avec succès')
      navigate('/beneficiaires?tab=formations')
    } catch (error) {
      logger.error('FORMATION_FORM', 'Erreur inattendue', error)
      alert('Erreur inattendue lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState />

  return (
    <div className="formation-form-page">
      <div className="form-header">
        <h1>{isEdit ? 'Modifier la formation' : 'Nouvelle formation'}</h1>
        <Button variant="secondary" onClick={() => navigate('/beneficiaires?tab=formations')}>
          Annuler
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="formation-form">
        <div className="form-section">
          <h2>Informations générales</h2>
          <div className="form-grid">
            <Input
              label="Titre *"
              value={formData.titre}
              onChange={(e) => handleChange('titre', e.target.value)}
              error={errors.titre}
              required
            />

            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              isTextArea
              rows={4}
            />

            <Select
              label="Type"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              options={[
                { value: '', label: 'Sélectionner...' },
                { value: 'FORMATION', label: 'Formation' },
                { value: 'ATELIER', label: 'Atelier' },
                { value: 'SEMINAIRE', label: 'Séminaire' },
                { value: 'WEBINAR', label: 'Webinaire' },
              ]}
            />

            <Select
              label="Catégorie"
              value={formData.categorie}
              onChange={(e) => handleChange('categorie', e.target.value)}
              options={[
                { value: '', label: 'Sélectionner...' },
                { value: 'ENTREPRENEURIAT', label: 'Entrepreneuriat' },
                { value: 'TECHNIQUE', label: 'Technique' },
                { value: 'MANAGEMENT', label: 'Management' },
                { value: 'DIGITAL', label: 'Digital' },
                { value: 'FINANCE', label: 'Finance' },
              ]}
            />

            <Input
              label="Lieu"
              value={formData.lieu}
              onChange={(e) => handleChange('lieu', e.target.value)}
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Planning</h2>
          <div className="form-grid">
            <Input
              label="Date de début *"
              type="date"
              value={formData.date_debut}
              onChange={(e) => handleChange('date_debut', e.target.value)}
              error={errors.date_debut}
              required
            />

            <Input
              label="Date de fin *"
              type="date"
              value={formData.date_fin}
              onChange={(e) => handleChange('date_fin', e.target.value)}
              error={errors.date_fin}
              required
            />

            <Input
              label="Durée (heures)"
              type="number"
              value={formData.duree}
              onChange={(e) => handleChange('duree', e.target.value)}
              error={errors.duree}
              min="0"
            />

            <Input
              label="Participants maximum"
              type="number"
              value={formData.participants_max}
              onChange={(e) => handleChange('participants_max', e.target.value)}
              error={errors.participants_max}
              min="1"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Paramètres</h2>
          <div className="form-grid">
            <Input
              label="Coût (FCFA)"
              type="number"
              value={formData.cout}
              onChange={(e) => handleChange('cout', e.target.value)}
              min="0"
            />

            <Select
              label="Statut"
              value={formData.statut}
              onChange={(e) => handleChange('statut', e.target.value)}
              options={[
                { value: 'BROUILLON', label: 'Brouillon' },
                { value: 'OUVERT', label: 'Ouvert' },
                { value: 'EN_COURS', label: 'En cours' },
                { value: 'TERMINE', label: 'Terminé' },
                { value: 'ANNULE', label: 'Annulé' },
              ]}
            />
          </div>
        </div>

        <div className="form-actions">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/beneficiaires?tab=formations')}>
            Annuler
          </Button>
        </div>
      </form>
    </div>
  )
}

