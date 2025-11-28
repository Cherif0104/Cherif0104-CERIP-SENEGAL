import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { programmesService } from '../services/programmes.service'
import { referentielsService } from '../services/referentiels.service'
import { toastService } from '../services/toast.service'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import LoadingState from '../components/common/LoadingState'
import SelectWithCreate from '../components/common/SelectWithCreate'
import ComboboxWithCreate from '../components/common/ComboboxWithCreate'
import GeographicCascade from '../components/common/GeographicCascade'
import ModularSections from '../components/admin/ModularSections'
import ReferentielIntegrator from '../components/admin/ReferentielIntegrator'
import BudgetLinesManager from '../components/programme/BudgetLinesManager'
import './ProgrammeForm.css'

export default function ProgrammeForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [isDirty, setIsDirty] = useState(false)
  const [financeurs, setFinanceurs] = useState([])
  const [statuts, setStatuts] = useState([])
  const [typesProgramme, setTypesProgramme] = useState([])
  const [thematiques, setThematiques] = useState([])
  const [regions, setRegions] = useState([])
  const [departements, setDepartements] = useState([])
  const [communes, setCommunes] = useState([])
  const [secteurs, setSecteurs] = useState([])
  const [genres, setGenres] = useState([])
  const [niveauxRisque, setNiveauxRisque] = useState([])
  const [frequencesReporting, setFrequencesReporting] = useState([])
  const [sectionsComplementaires, setSectionsComplementaires] = useState([])
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    financeur: '',
    chef_projet: '',
    date_debut: '',
    date_fin: '',
    budget: '',
    statut: 'EN_PREPARATION',
    type_programme: '',
    thematiques: [],
    pays: 'SN',
    regions: [],
    departements: [],
    communes: [],
    secteurs_cibles: [],
    genres_cibles: [],
    objectif_beneficiaires: '',
    objectif_emplois: '',
    niveau_risque: '',
    frequence_reporting: ''
  })

  useEffect(() => {
    const init = async () => {
      try {
        // Charger les référentiels nécessaires
        const [
          financeursRes,
          statutsRes,
          typesRes,
          thematiquesRes,
          regionsRes,
          departementsRes,
          communesRes,
          secteursRes,
          genresRes,
          risquesRes,
          freqRes
        ] = await Promise.all([
          referentielsService.getByType('FINANCEUR_PROGRAMME'),
          referentielsService.getByType('STATUT_PROGRAMME'),
          referentielsService.getByType('TYPE_PROGRAMME'),
          referentielsService.getByType('THEMATIQUE_PROGRAMME'),
          referentielsService.getByType('REGION'),
          referentielsService.getByType('DEPARTEMENT'),
          referentielsService.getByType('COMMUNE'),
          referentielsService.getByType('SECTEUR_ACTIVITE'),
          referentielsService.getByType('GENRE_CIBLE'),
          referentielsService.getByType('NIVEAU_RISQUE'),
          referentielsService.getByType('FREQUENCE_REPORTING')
        ])

        if (!financeursRes.error) setFinanceurs(financeursRes.data)
        if (!statutsRes.error) setStatuts(statutsRes.data)
        if (!typesRes.error) setTypesProgramme(typesRes.data)
        if (!thematiquesRes.error) setThematiques(thematiquesRes.data)
        if (!regionsRes.error) setRegions(regionsRes.data)
        if (!departementsRes.error) setDepartements(departementsRes.data)
        if (!communesRes.error) setCommunes(communesRes.data)
        if (!secteursRes.error) setSecteurs(secteursRes.data)
        if (!genresRes.error) setGenres(genresRes.data)
        if (!risquesRes.error) setNiveauxRisque(risquesRes.data)
        if (!freqRes.error) setFrequencesReporting(freqRes.data)

        if (isEdit) {
          await loadProgramme()
        }
      } finally {
        setLoading(false)
      }
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadProgramme = async () => {
    try {
      const { data, error } = await programmesService.getById(id)
      if (error) {
        toastService.error('Erreur lors du chargement du programme')
        navigate('/programmes')
      } else if (data) {
        setFormData({
          nom: data.nom || '',
          description: data.description || '',
          financeur: data.financeur || '',
          chef_projet: data.chef_projet || '',
          date_debut: data.date_debut ? data.date_debut.split('T')[0] : '',
          date_fin: data.date_fin ? data.date_fin.split('T')[0] : '',
          budget: data.budget || '',
          statut: data.statut || 'EN_PREPARATION',
          type_programme: data.type_programme || '',
          thematiques: data.thematiques || [],
          pays: data.pays || 'SN',
          regions: data.regions || [],
          departements: data.departements || [],
          communes: data.communes || [],
          secteurs_cibles: data.secteurs_cibles || [],
          genres_cibles: data.genres_cibles || [],
          objectif_beneficiaires: data.objectif_beneficiaires || '',
          objectif_emplois: data.objectif_emplois || '',
          niveau_risque: data.niveau_risque || '',
          frequence_reporting: data.frequence_reporting || ''
        })
        
        // Charger les sections complémentaires depuis meta
        if (data.meta && data.meta.sections_complementaires) {
          setSectionsComplementaires(data.meta.sections_complementaires)
        }
      }
    } catch (error) {
      console.error('Error loading programme:', error)
      toastService.error('Erreur lors du chargement du programme')
      navigate('/programmes')
    }
  }

  // Validation des dates
  const validateDates = () => {
    const errors = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (formData.date_debut) {
      const dateDebut = new Date(formData.date_debut)
      if (isNaN(dateDebut.getTime())) {
        errors.date_debut = 'Date de début invalide'
      }
    }

    if (formData.date_fin) {
      const dateFin = new Date(formData.date_fin)
      if (isNaN(dateFin.getTime())) {
        errors.date_fin = 'Date de fin invalide'
      } else if (formData.date_debut) {
        const dateDebut = new Date(formData.date_debut)
        if (dateFin < dateDebut) {
          errors.date_fin = 'La date de fin doit être postérieure à la date de début'
        }
        // Vérifier que la durée est raisonnable (max 10 ans)
        const diffYears = (dateFin - dateDebut) / (1000 * 60 * 60 * 24 * 365)
        if (diffYears > 10) {
          errors.date_fin = 'La durée du programme ne peut pas dépasser 10 ans'
        }
        if (diffYears < 0.1) {
          errors.date_fin = 'La durée du programme doit être d\'au moins 1 mois'
        }
      }
    }

    return errors
  }

  // Validation du budget
  const validateBudget = () => {
    const errors = {}
    if (formData.budget) {
      const budgetValue = parseFloat(formData.budget.replace(/\s/g, ''))
      if (isNaN(budgetValue)) {
        errors.budget = 'Le budget doit être un nombre valide'
      } else if (budgetValue < 0) {
        errors.budget = 'Le budget ne peut pas être négatif'
      } else if (budgetValue > 1000000000000) {
        errors.budget = 'Le budget est trop élevé (max 1 000 000 000 000 FCFA)'
      }
    }
    return errors
  }

  // Validation des objectifs
  const validateObjectifs = () => {
    const errors = {}
    if (formData.objectif_beneficiaires) {
      const value = parseInt(formData.objectif_beneficiaires, 10)
      if (isNaN(value) || value < 0) {
        errors.objectif_beneficiaires = 'L\'objectif doit être un nombre positif'
      } else if (value > 10000000) {
        errors.objectif_beneficiaires = 'L\'objectif est trop élevé (max 10 000 000)'
      }
    }
    if (formData.objectif_emplois) {
      const value = parseInt(formData.objectif_emplois, 10)
      if (isNaN(value) || value < 0) {
        errors.objectif_emplois = 'L\'objectif doit être un nombre positif'
      } else if (value > 1000000) {
        errors.objectif_emplois = 'L\'objectif est trop élevé (max 1 000 000)'
      }
    }
    return errors
  }

  // Validation du chef de projet (email si fourni)
  const validateChefProjet = () => {
    const errors = {}
    if (formData.chef_projet) {
      // Vérifier si c'est un email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (emailRegex.test(formData.chef_projet)) {
        // C'est un email, validation OK
      } else if (formData.chef_projet.trim().length < 2) {
        errors.chef_projet = 'Le nom du chef de projet doit contenir au moins 2 caractères'
      } else if (formData.chef_projet.length > 100) {
        errors.chef_projet = 'Le nom ne peut pas dépasser 100 caractères'
      }
    }
    return errors
  }

  // Validation générale
  const validateForm = (fieldName = null) => {
    const dateErrors = validateDates()
    const budgetErrors = validateBudget()
    const objectifsErrors = validateObjectifs()
    const chefProjetErrors = validateChefProjet()
    const newErrors = { ...dateErrors, ...budgetErrors, ...objectifsErrors, ...chefProjetErrors }
    
    // Validation nom (min 3, max 200)
    if (!formData.nom || formData.nom.trim().length < 3) {
      newErrors.nom = 'Le nom doit contenir au moins 3 caractères'
    } else if (formData.nom.length > 200) {
      newErrors.nom = 'Le nom ne peut pas dépasser 200 caractères'
    }

    // Validation description (max 5000 caractères)
    if (formData.description && formData.description.length > 5000) {
      newErrors.description = 'La description ne peut pas dépasser 5000 caractères'
    }

    // Validation financeur (requis)
    if (!formData.financeur || formData.financeur.trim() === '') {
      newErrors.financeur = 'Le financeur est obligatoire'
    }

    // Si on valide un champ spécifique, ne garder que les erreurs de ce champ
    if (fieldName) {
      const fieldErrors = {}
      if (newErrors[fieldName]) {
        fieldErrors[fieldName] = newErrors[fieldName]
      }
      setErrors(prev => ({ ...prev, ...fieldErrors }))
      return !fieldErrors[fieldName]
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Formatage du budget
  const formatBudget = (value) => {
    if (!value) return ''
    const num = parseFloat(value)
    if (isNaN(num)) return value
    return num.toLocaleString('fr-FR')
  }

  const handleBudgetChange = (e) => {
    const value = e.target.value.replace(/\s/g, '')
    handleChange({ ...e, target: { ...e.target, value } })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation avant soumission
    if (!validateForm()) {
      toastService.error('Veuillez corriger les erreurs dans le formulaire')
      return
    }

    setSaving(true)

    try {
      const programmeData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget.replace(/\s/g, '')) : null,
        date_debut: formData.date_debut || null,
        date_fin: formData.date_fin || null,
        objectif_beneficiaires: formData.objectif_beneficiaires
          ? parseInt(formData.objectif_beneficiaires, 10)
          : null,
        objectif_emplois: formData.objectif_emplois
          ? parseInt(formData.objectif_emplois, 10)
          : null,
        meta: {
          sections_complementaires: sectionsComplementaires
        }
      }

      let result
      if (isEdit) {
        result = await programmesService.update(id, programmeData)
      } else {
        result = await programmesService.create(programmeData)
      }

      if (result.error) {
        // Afficher l'erreur détaillée
        const errorMessage = result.error.message || 
          `Erreur lors de la ${isEdit ? 'modification' : 'création'} du programme`
        toastService.error(errorMessage)
        console.error('API Error:', result.error)
      } else {
        toastService.success(`Programme ${isEdit ? 'modifié' : 'créé'} avec succès`)
        setIsDirty(false)
        navigate('/programmes')
      }
    } catch (error) {
      console.error('Error saving programme:', error)
      toastService.error(`Erreur lors de la ${isEdit ? 'modification' : 'création'} du programme`)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = { ...prev, [name]: value }
      setIsDirty(true)

      // Validation en temps réel pour tous les champs
      validateForm(name)
      
      return newData
    })
  }

  // Validation au blur (quand on quitte le champ)
  const handleBlur = (e) => {
    const { name } = e.target
    validateForm(name)
  }

  const handleMultiSelectChange = (e, fieldName) => {
    const values = Array.from(e.target.selectedOptions).map(o => o.value)
    setFormData(prev => ({ ...prev, [fieldName]: values }))
  }

  // Recharger les référentiels après création d'une nouvelle valeur
  const refreshReferentiels = async (type) => {
    const { data, error } = await referentielsService.getByType(type)
    if (!error && data) {
      switch (type) {
        case 'FINANCEUR_PROGRAMME':
          setFinanceurs(data)
          break
        case 'TYPE_PROGRAMME':
          setTypesProgramme(data)
          break
        case 'THEMATIQUE_PROGRAMME':
          setThematiques(data)
          break
        case 'SECTEUR_ACTIVITE':
          setSecteurs(data)
          break
        case 'GENRE_CIBLE':
          setGenres(data)
          break
        case 'NIVEAU_RISQUE':
          setNiveauxRisque(data)
          break
        case 'FREQUENCE_REPORTING':
          setFrequencesReporting(data)
          break
        default:
          break
      }
    }
  }

  if (loading) {
    return <LoadingState message="Chargement du programme..." />
  }

  return (
    <div className="programme-form-page">
      <div className="programme-form-header">
        <BackButton to="/programmes" label="Retour à la liste" />
        <h1>{isEdit ? 'Modifier le Programme' : 'Nouveau Programme'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="programme-form">
        <div className="form-section">
          <h2>Informations générales</h2>
          <div className="form-grid">
            <div className="form-group form-group--full">
              <label htmlFor="nom">Nom du programme *</label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`input ${errors.nom ? 'input-error' : formData.nom && formData.nom.length >= 3 ? 'input-success' : ''}`}
                placeholder="Ex: Programme d'entrepreneuriat digital"
                maxLength={200}
              />
              {errors.nom && <span className="error-message">{errors.nom}</span>}
              {!errors.nom && formData.nom && (
                <span className="help-text">{formData.nom.length}/200 caractères</span>
              )}
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={4}
                className={`input ${errors.description ? 'input-error' : ''}`}
                placeholder="Description détaillée du programme..."
                maxLength={5000}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
              {!errors.description && formData.description && (
                <span className="help-text">{formData.description.length}/5000 caractères</span>
              )}
            </div>

            <div className="form-group">
              <SelectWithCreate
                label="Financeur"
                name="financeur"
                value={formData.financeur}
                onChange={handleChange}
                options={financeurs}
                typeReferentiel="FINANCEUR_PROGRAMME"
                placeholder="Sélectionner un financeur"
                required
              />
            </div>

            <div className="form-group">
              <SelectWithCreate
                label="Statut"
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                options={statuts}
                typeReferentiel="STATUT_PROGRAMME"
                placeholder="Sélectionner un statut"
              />
            </div>

            <div className="form-group">
              <label htmlFor="chef_projet">Chef de projet</label>
              <input
                type="text"
                id="chef_projet"
                name="chef_projet"
                value={formData.chef_projet}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`input ${errors.chef_projet ? 'input-error' : formData.chef_projet && formData.chef_projet.length >= 2 ? 'input-success' : ''}`}
                placeholder="Nom du chef de projet ou email"
                maxLength={100}
              />
              {errors.chef_projet && <span className="error-message">{errors.chef_projet}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="budget">Budget (XOF)</label>
              <div className="input-with-suffix">
                <input
                  type="text"
                  id="budget"
                  name="budget"
                  value={formatBudget(formData.budget)}
                  onChange={handleBudgetChange}
                  onBlur={handleBlur}
                  className={`input ${errors.budget ? 'input-error' : formData.budget && !errors.budget ? 'input-success' : ''}`}
                  placeholder="0"
                  inputMode="numeric"
                />
                <span className="input-suffix">XOF</span>
              </div>
              {errors.budget && <span className="error-message">{errors.budget}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="date_debut">Date de début</label>
              <input
                type="date"
                id="date_debut"
                name="date_debut"
                value={formData.date_debut}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`input ${errors.date_debut ? 'input-error' : formData.date_debut && !errors.date_debut ? 'input-success' : ''}`}
                max={formData.date_fin || undefined}
              />
              {errors.date_debut && <span className="error-message">{errors.date_debut}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="date_fin">Date de fin</label>
              <input
                type="date"
                id="date_fin"
                name="date_fin"
                value={formData.date_fin}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`input ${errors.date_fin ? 'input-error' : formData.date_fin && !errors.date_fin ? 'input-success' : ''}`}
                min={formData.date_debut || undefined}
              />
              {errors.date_fin && <span className="error-message">{errors.date_fin}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Périmètre géographique</h2>
          <div className="form-grid">
            <div className="form-group form-group--full">
              <GeographicCascade
                regions={formData.regions}
                departements={formData.departements}
                communes={formData.communes}
                onRegionsChange={(e) => {
                  setFormData(prev => ({ ...prev, regions: Array.isArray(e.target.value) ? e.target.value : [] }))
                }}
                onDepartementsChange={(e) => {
                  setFormData(prev => ({ ...prev, departements: Array.isArray(e.target.value) ? e.target.value : [] }))
                }}
                onCommunesChange={(e) => {
                  setFormData(prev => ({ ...prev, communes: Array.isArray(e.target.value) ? e.target.value : [] }))
                }}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Public cible & thématiques</h2>
          <div className="form-grid">
            <div className="form-group">
              <SelectWithCreate
                label="Type de programme"
                name="type_programme"
                value={formData.type_programme}
                onChange={handleChange}
                options={typesProgramme}
                typeReferentiel="TYPE_PROGRAMME"
                placeholder="Non spécifié"
              />
            </div>

            <div className="form-group form-group--full">
              <ComboboxWithCreate
                label="Thématiques"
                name="thematiques"
                value={formData.thematiques}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, thematiques: Array.isArray(e.target.value) ? e.target.value : [] }))
                }}
                options={thematiques}
                typeReferentiel="THEMATIQUE_PROGRAMME"
                placeholder="Sélectionner ou créer des thématiques"
                multiple={true}
              />
            </div>

            <div className="form-group form-group--full">
              <ComboboxWithCreate
                label="Secteurs d'activité ciblés"
                name="secteurs_cibles"
                value={formData.secteurs_cibles}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, secteurs_cibles: Array.isArray(e.target.value) ? e.target.value : [] }))
                }}
                options={secteurs}
                typeReferentiel="SECTEUR_ACTIVITE"
                placeholder="Sélectionner ou créer des secteurs"
                multiple={true}
              />
            </div>

            <div className="form-group form-group--full">
              <ComboboxWithCreate
                label="Genres ciblés"
                name="genres_cibles"
                value={formData.genres_cibles}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, genres_cibles: Array.isArray(e.target.value) ? e.target.value : [] }))
                }}
                options={genres}
                typeReferentiel="GENRE_CIBLE"
                placeholder="Sélectionner ou créer des genres"
                multiple={true}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Objectifs & risques</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Objectif bénéficiaires</label>
              <input
                type="number"
                name="objectif_beneficiaires"
                value={formData.objectif_beneficiaires}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`input ${errors.objectif_beneficiaires ? 'input-error' : formData.objectif_beneficiaires && !errors.objectif_beneficiaires ? 'input-success' : ''}`}
                min="0"
                max="10000000"
              />
              {errors.objectif_beneficiaires && (
                <span className="error-message">{errors.objectif_beneficiaires}</span>
              )}
            </div>
            <div className="form-group">
              <label>Objectif emplois créés</label>
              <input
                type="number"
                name="objectif_emplois"
                value={formData.objectif_emplois}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`input ${errors.objectif_emplois ? 'input-error' : formData.objectif_emplois && !errors.objectif_emplois ? 'input-success' : ''}`}
                min="0"
                max="1000000"
              />
              {errors.objectif_emplois && (
                <span className="error-message">{errors.objectif_emplois}</span>
              )}
            </div>
            <div className="form-group">
              <SelectWithCreate
                label="Niveau de risque"
                name="niveau_risque"
                value={formData.niveau_risque}
                onChange={handleChange}
                options={niveauxRisque}
                typeReferentiel="NIVEAU_RISQUE"
                placeholder="Non évalué"
              />
            </div>
            <div className="form-group">
              <SelectWithCreate
                label="Fréquence de reporting"
                name="frequence_reporting"
                value={formData.frequence_reporting}
                onChange={handleChange}
                options={frequencesReporting}
                typeReferentiel="FREQUENCE_REPORTING"
                placeholder="Par défaut"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <ModularSections
            sections={sectionsComplementaires}
            onSectionsChange={setSectionsComplementaires}
            mode="edit"
          />
        </div>

        <div className="form-section">
          <ReferentielIntegrator
            entityType="programme"
            entityId={id}
            mode="edit"
          />
        </div>

        {isEdit && id && (
          <div className="form-section">
            <h2>Gestion budgétaire</h2>
            <p className="form-section-description">
              Gérez les lignes budgétaires détaillées de ce programme. Le budget global est défini ci-dessus.
            </p>
            <BudgetLinesManager programmeId={id} mode="edit" />
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/programmes')}
            disabled={saving}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="spinner-small"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Icon name="Save" size={18} />
                {isEdit ? 'Modifier' : 'Créer'} le programme
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

