import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { projetsService } from '@/services/projets.service'
import { programmesService } from '@/services/programmes.service'
import { EntityValidator } from '@/business/validators/EntityValidator'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'
import { STATUTS_PROJET } from '@/utils/constants'
import { toast } from '@/components/common/Toast'
import { logger } from '@/utils/logger'

export default function ProjetForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const programmeIdFromUrl = searchParams.get('programme_id')
  const isEdit = !!id
  
  const [programmes, setProgrammes] = useState([])
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    programme_id: programmeIdFromUrl || '',
    type_activite: '',
    date_debut: '',
    date_fin: '',
    budget_alloue: 0,
    statut: 'PLANIFIE',
  })
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({})

  useEffect(() => {
    loadProgrammes()
    if (isEdit && id) {
      loadProjet()
    }
  }, [id, isEdit])

  const loadProgrammes = async () => {
    const { data } = await programmesService.getAll()
    setProgrammes(data || [])
  }

  const loadProjet = async () => {
    setLoading(true)
    try {
      const { data, error } = await projetsService.getById(id)
      if (error) {
        logger.error('PROJET_FORM', 'Erreur chargement projet', error)
        toast.error('Erreur lors du chargement du projet')
        return
      }
      if (data) {
        setFormData({
          nom: data.nom || '',
          description: data.description || '',
          programme_id: data.programme_id || '',
          type_activite: data.type_activite || '',
          date_debut: data.date_debut || '',
          date_fin: data.date_fin || '',
          budget_alloue: data.budget_alloue || 0,
          statut: data.statut || 'PLANIFIE',
        })
      }
    } catch (error) {
      logger.error('PROJET_FORM', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation finale
    const finalValidation = EntityValidator.validate('projet', formData, isEdit ? 'UPDATE' : 'CREATE')
    
    if (!finalValidation.valid) {
      setTouched({
        nom: true,
        programme_id: true,
        date_debut: true,
        date_fin: true,
        statut: true,
      })
      logger.warn('PROJET_FORM', 'Validation échouée', {
        errors: finalValidation.errors,
      })
      toast.error('Veuillez corriger les erreurs du formulaire')
      return
    }

    setLoading(true)
    try {
      if (isEdit) {
        const { data, error } = await projetsService.update(id, formData)
        if (error) {
          logger.error('PROJET_FORM', 'Erreur mise à jour projet', error)
          toast.error(error.message || 'Erreur lors de la mise à jour du projet')
          return
        }
        logger.info('PROJET_FORM', 'Projet mis à jour avec succès', { id })
        toast.success('Projet mis à jour avec succès')
        setTimeout(() => navigate('/projets?tab=liste'), 1000)
      } else {
        const { data, error } = await projetsService.create(formData)
        if (error) {
          logger.error('PROJET_FORM', 'Erreur création projet', error)
          toast.error(error.message || 'Erreur lors de la création du projet')
          return
        }
        logger.info('PROJET_FORM', 'Projet créé avec succès')
        toast.success('Projet créé avec succès')
        setTimeout(() => navigate('/projets?tab=liste'), 1000)
      }
    } catch (error) {
      logger.error('PROJET_FORM', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Nouveau projet</h2>
      <Select
        label="Programme"
        value={formData.programme_id}
        onChange={(e) => setFormData({ ...formData, programme_id: e.target.value })}
        options={programmes.map((p) => ({ value: p.id, label: p.nom }))}
        required
      />
      <Input
        label="Nom"
        value={formData.nom}
        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
        required
      />
      <Input
        label="Date début"
        type="date"
        value={formData.date_debut}
        onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
        required
      />
      <Input
        label="Date fin"
        type="date"
        value={formData.date_fin}
        onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
        required
      />
      <Input
        label="Type d'activité"
        value={formData.type_activite}
        onChange={(e) => setFormData({ ...formData, type_activite: e.target.value })}
      />
      <Input
        label="Budget alloué"
        type="number"
        value={formData.budget_alloue}
        onChange={(e) => setFormData({ ...formData, budget_alloue: parseFloat(e.target.value) || 0 })}
      />
      <Input
        label="Description"
        isTextArea
        rows={4}
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />
      <Select
        label="Statut"
        value={formData.statut}
        onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
        options={STATUTS_PROJET.map((s) => ({ value: s, label: s }))}
        required
      />
      <Button type="submit" loading={loading}>
        {isEdit ? 'Modifier' : 'Créer'}
      </Button>
    </form>
  )
}

