import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { employesService } from '@/services/employes.service'
import { postesService } from '@/services/postes.service'
import { programmesService } from '@/services/programmes.service'
import { projetsService } from '@/services/projets.service'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './EmployeForm.css'

export default function EmployeForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const isNew = !id

  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    date_naissance: '',
    date_embauche: '',
    date_fin_contrat: '',
    poste_id: '',
    salaire: '',
    type_contrat: '',
    type_employe: '',
    statut: 'ACTIF',
    manager_id: '',
    projet_id: '',
    programme_id: '',
    est_prestataire: false,
    est_lie_projet: false,
    est_lie_programme: false,
    adresse: '',
    ville: '',
    pays: 'Sénégal',
    photo_url: '',
  })

  const [postes, setPostes] = useState([])
  const [employes, setEmployes] = useState([])
  const [projets, setProjets] = useState([])
  const [programmes, setProgrammes] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadInitialData()
    if (isEdit) {
      loadEmploye()
    }
  }, [id])

  const loadInitialData = async () => {
    setLoadingData(true)
    try {
      // Charger postes
      const postesResult = await postesService.getAll()
      if (!postesResult.error && postesResult.data) {
        setPostes(postesResult.data)
      }

      // Charger employés (pour manager)
      const employesResult = await employesService.getActifs()
      if (!employesResult.error && employesResult.data) {
        setEmployes(employesResult.data)
      }

      // Charger projets
      const projetsResult = await projetsService.getAll(null, {})
      if (!projetsResult.error && projetsResult.data) {
        setProjets(projetsResult.data)
      }

      // Charger programmes
      const programmesResult = await programmesService.getAll()
      if (!programmesResult.error && programmesResult.data) {
        setProgrammes(programmesResult.data)
      }
    } catch (error) {
      logger.error('EMPLOYE_FORM', 'Erreur chargement données initiales', error)
    } finally {
      setLoadingData(false)
    }
  }

  const loadEmploye = async () => {
    setLoading(true)
    try {
      const result = await employesService.getByIdWithRelations(id)
      if (result.error) {
        logger.error('EMPLOYE_FORM', 'Erreur chargement employé', result.error)
        setError('Erreur lors du chargement')
        return
      }

      const data = result.data
      setFormData({
        matricule: data.matricule || '',
        nom: data.nom || '',
        prenom: data.prenom || '',
        email: data.email || '',
        telephone: data.telephone || '',
        date_naissance: data.date_naissance ? data.date_naissance.split('T')[0] : '',
        date_embauche: data.date_embauche ? data.date_embauche.split('T')[0] : '',
        date_fin_contrat: data.date_fin_contrat ? data.date_fin_contrat.split('T')[0] : '',
        poste_id: data.poste_id || '',
        salaire: data.salaire || '',
        type_contrat: data.type_contrat || '',
        type_employe: data.type_employe || '',
        statut: data.statut || 'ACTIF',
        manager_id: data.manager_id || '',
        projet_id: data.projet_id || '',
        programme_id: data.programme_id || '',
        est_prestataire: data.est_prestataire || false,
        est_lie_projet: data.est_lie_projet || false,
        est_lie_programme: data.est_lie_programme || false,
        adresse: data.adresse || '',
        ville: data.ville || '',
        pays: data.pays || 'Sénégal',
        photo_url: data.photo_url || '',
      })
    } catch (error) {
      logger.error('EMPLOYE_FORM', 'Erreur inattendue', error)
      setError('Erreur inattendue')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }

      // Logique conditionnelle selon le type de contrat
      if (field === 'type_contrat') {
        // Réinitialiser les indicateurs
        newData.est_lie_projet = false
        newData.est_lie_programme = false
        newData.est_prestataire = false
        newData.date_fin_contrat = ''
        newData.projet_id = ''
        newData.programme_id = ''

        // Définir les indicateurs selon le type de contrat
        if (value === 'PROJET') {
          newData.est_lie_projet = true
        } else if (value === 'PROGRAMME') {
          newData.est_lie_programme = true
        } else if (value === 'PRESTATION') {
          newData.est_prestataire = true
        }

        // Afficher date_fin_contrat pour CDD, STAGE, PRESTATION, PROJET, PROGRAMME
        if (['CDD', 'STAGE', 'PRESTATION', 'PROJET', 'PROGRAMME'].includes(value)) {
          // La date sera saisie par l'utilisateur
        }
      }

      return newData
    })
    setError('')
  }

  const generateMatricule = async () => {
    try {
      const result = await employesService.getAll({ pagination: { page: 1, pageSize: 1 } })
      const count = result.data?.length || 0
      const newMatricule = `EMP-${String(count + 1).padStart(4, '0')}`
      setFormData((prev) => ({ ...prev, matricule: newMatricule }))
    } catch (error) {
      logger.error('EMPLOYE_FORM', 'Erreur génération matricule', error)
    }
  }

  useEffect(() => {
    if (isNew && !formData.matricule) {
      generateMatricule()
    }
  }, [isNew])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (!formData.nom || !formData.prenom) {
      setError('Le nom et le prénom sont requis')
      setLoading(false)
      return
    }

    if (!formData.type_contrat) {
      setError('Le type de contrat est requis')
      setLoading(false)
      return
    }

    if (!formData.date_embauche) {
      setError('La date d\'embauche est requise')
      setLoading(false)
      return
    }

    // Validation selon type de contrat
    if (formData.type_contrat === 'PROJET' && !formData.projet_id) {
      setError('Un projet doit être sélectionné pour un contrat PROJET')
      setLoading(false)
      return
    }

    if (formData.type_contrat === 'PROGRAMME' && !formData.programme_id) {
      setError('Un programme doit être sélectionné pour un contrat PROGRAMME')
      setLoading(false)
      return
    }

    try {
      const dataToSave = {
        ...formData,
        salaire: formData.salaire ? parseFloat(formData.salaire) : null,
        date_fin_contrat: formData.date_fin_contrat || null,
        projet_id: formData.projet_id || null,
        programme_id: formData.programme_id || null,
        manager_id: formData.manager_id || null,
        poste_id: formData.poste_id || null,
      }

      if (isEdit) {
        const result = await employesService.update(id, dataToSave)
        if (result.error) {
          setError(result.error.message || 'Erreur lors de la mise à jour')
          return
        }
        logger.info('EMPLOYE_FORM', 'Employé mis à jour', { id })
        navigate(`/rh/employes/${id}`)
      } else {
        const result = await employesService.create(dataToSave)
        if (result.error) {
          setError(result.error.message || 'Erreur lors de la création')
          return
        }
        logger.info('EMPLOYE_FORM', 'Employé créé', { id: result.data?.id })
        navigate(`/rh/employes/${result.data?.id}`)
      }
    } catch (error) {
      logger.error('EMPLOYE_FORM', 'Erreur inattendue', error)
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const isContratTemporaire = ['CDD', 'STAGE', 'PRESTATION', 'PROJET', 'PROGRAMME'].includes(formData.type_contrat)
  const showProjet = formData.est_lie_projet || formData.type_contrat === 'PROJET'
  const showProgramme = formData.est_lie_programme || formData.type_contrat === 'PROGRAMME'

  if (loadingData || (loading && isEdit)) {
    return <div className="loading-container">Chargement...</div>
  }

  return (
    <div className="employe-form-page">
      <div className="employe-form-container">
        <div className="employe-form-header">
          <Button variant="secondary" onClick={() => navigate('/rh?tab=employes')}>
            <Icon name="ArrowLeft" size={16} />
            Retour
          </Button>
          <h1>{isEdit ? 'Modifier l\'employé' : 'Nouvel employé'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="employe-form">
          {error && (
            <div className="form-error">
              <Icon name="AlertCircle" size={16} />
              {error}
            </div>
          )}

          {/* Section Informations personnelles */}
          <div className="form-section">
            <h2>Informations personnelles</h2>
            <div className="form-grid">
              <Input
                label="Matricule"
                value={formData.matricule}
                onChange={(e) => handleChange('matricule', e.target.value)}
                required
                disabled={!isNew}
                placeholder="Généré automatiquement"
              />
              <Input
                label="Prénom"
                value={formData.prenom}
                onChange={(e) => handleChange('prenom', e.target.value)}
                required
              />
              <Input
                label="Nom"
                value={formData.nom}
                onChange={(e) => handleChange('nom', e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
              <Input
                label="Téléphone"
                value={formData.telephone}
                onChange={(e) => handleChange('telephone', e.target.value)}
              />
              <Input
                label="Date de naissance"
                type="date"
                value={formData.date_naissance}
                onChange={(e) => handleChange('date_naissance', e.target.value)}
              />
            </div>
          </div>

          {/* Section Type d'employé et contrat */}
          <div className="form-section">
            <h2>Type d'employé et contrat</h2>
            <div className="form-grid">
              <Select
                label="Type d'employé"
                value={formData.type_employe}
                onChange={(e) => handleChange('type_employe', e.target.value)}
                options={[
                  { value: '', label: 'Sélectionner...' },
                  { value: 'PROFESSEUR', label: 'Professeur' },
                  { value: 'FORMATEUR', label: 'Formateur' },
                  { value: 'CHARGE_PROJET', label: 'Chargé de projet' },
                  { value: 'DIRECTEUR', label: 'Directeur' },
                  { value: 'COORDINATEUR', label: 'Coordinateur' },
                  { value: 'COACH', label: 'Coach' },
                  { value: 'MENTOR', label: 'Mentor' },
                ]}
              />
              <Select
                label="Type de contrat"
                value={formData.type_contrat}
                onChange={(e) => handleChange('type_contrat', e.target.value)}
                required
                options={[
                  { value: '', label: 'Sélectionner...' },
                  { value: 'CDI', label: 'CDI' },
                  { value: 'CDD', label: 'CDD' },
                  { value: 'STAGE', label: 'Stage' },
                  { value: 'PRESTATION', label: 'Prestation' },
                  { value: 'PROJET', label: 'Contrat projet' },
                  { value: 'PROGRAMME', label: 'Contrat programme' },
                ]}
              />
              <Select
                label="Statut"
                value={formData.statut}
                onChange={(e) => handleChange('statut', e.target.value)}
                required
                options={[
                  { value: 'ACTIF', label: 'Actif' },
                  { value: 'INACTIF', label: 'Inactif' },
                  { value: 'CONGE', label: 'Congé' },
                  { value: 'DEMISSION', label: 'Démission' },
                ]}
              />
            </div>
          </div>

          {/* Section Poste et salaire */}
          <div className="form-section">
            <h2>Poste et salaire</h2>
            <div className="form-grid">
              <Select
                label="Poste"
                value={formData.poste_id}
                onChange={(e) => handleChange('poste_id', e.target.value)}
                options={[
                  { value: '', label: 'Sélectionner...' },
                  ...postes.map((poste) => ({
                    value: poste.id,
                    label: poste.titre || poste.nom || poste.id,
                  })),
                ]}
              />
              <Input
                label="Salaire"
                type="number"
                value={formData.salaire}
                onChange={(e) => handleChange('salaire', e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
              <Select
                label="Manager"
                value={formData.manager_id}
                onChange={(e) => handleChange('manager_id', e.target.value)}
                options={[
                  { value: '', label: 'Aucun' },
                  ...employes
                    .filter((e) => e.id !== id) // Exclure l'employé lui-même
                    .map((emp) => ({
                      value: emp.id,
                      label: `${emp.prenom || ''} ${emp.nom || ''}`.trim() || emp.matricule,
                    })),
                ]}
              />
            </div>
          </div>

          {/* Section Dates */}
          <div className="form-section">
            <h2>Dates</h2>
            <div className="form-grid">
              <Input
                label="Date d'embauche"
                type="date"
                value={formData.date_embauche}
                onChange={(e) => handleChange('date_embauche', e.target.value)}
                required
              />
              {isContratTemporaire && (
                <Input
                  label="Date de fin de contrat"
                  type="date"
                  value={formData.date_fin_contrat}
                  onChange={(e) => handleChange('date_fin_contrat', e.target.value)}
                  required={isContratTemporaire}
                />
              )}
            </div>
          </div>

          {/* Section Liens projet/programme */}
          {(showProjet || showProgramme) && (
            <div className="form-section">
              <h2>Liens projet/programme</h2>
              <div className="form-grid">
                {showProjet && (
                  <Select
                    label="Projet"
                    value={formData.projet_id}
                    onChange={(e) => handleChange('projet_id', e.target.value)}
                    required={formData.type_contrat === 'PROJET'}
                    options={[
                      { value: '', label: 'Sélectionner...' },
                      ...projets.map((projet) => ({
                        value: projet.id,
                        label: projet.nom || projet.titre || projet.id,
                      })),
                    ]}
                  />
                )}
                {showProgramme && (
                  <Select
                    label="Programme"
                    value={formData.programme_id}
                    onChange={(e) => handleChange('programme_id', e.target.value)}
                    required={formData.type_contrat === 'PROGRAMME'}
                    options={[
                      { value: '', label: 'Sélectionner...' },
                      ...programmes.map((programme) => ({
                        value: programme.id,
                        label: programme.nom || programme.titre || programme.id,
                      })),
                    ]}
                  />
                )}
              </div>
            </div>
          )}

          {/* Section Indicateurs */}
          <div className="form-section">
            <h2>Indicateurs</h2>
            <div className="form-grid">
              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="est_prestataire"
                  checked={formData.est_prestataire}
                  onChange={(e) => handleChange('est_prestataire', e.target.checked)}
                  disabled={formData.type_contrat === 'PRESTATION'}
                />
                <label htmlFor="est_prestataire">Prestataire</label>
              </div>
              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="est_lie_projet"
                  checked={formData.est_lie_projet}
                  onChange={(e) => handleChange('est_lie_projet', e.target.checked)}
                  disabled={formData.type_contrat === 'PROJET'}
                />
                <label htmlFor="est_lie_projet">Lié à un projet</label>
              </div>
              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="est_lie_programme"
                  checked={formData.est_lie_programme}
                  onChange={(e) => handleChange('est_lie_programme', e.target.checked)}
                  disabled={formData.type_contrat === 'PROGRAMME'}
                />
                <label htmlFor="est_lie_programme">Lié à un programme</label>
              </div>
            </div>
          </div>

          {/* Section Adresse */}
          <div className="form-section">
            <h2>Adresse</h2>
            <div className="form-grid">
              <Input
                label="Adresse"
                value={formData.adresse}
                onChange={(e) => handleChange('adresse', e.target.value)}
                isTextArea
              />
              <Input
                label="Ville"
                value={formData.ville}
                onChange={(e) => handleChange('ville', e.target.value)}
              />
              <Input
                label="Pays"
                value={formData.pays}
                onChange={(e) => handleChange('pays', e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => navigate('/rh?tab=employes')}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

