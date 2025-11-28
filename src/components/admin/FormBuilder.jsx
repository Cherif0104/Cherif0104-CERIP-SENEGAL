import { useState, useEffect } from 'react'
import Icon from '../common/Icon'
import './FormBuilder.css'

const FIELD_TYPES = [
  { value: 'text', label: 'Texte', icon: 'FileText' },
  { value: 'textarea', label: 'Texte long', icon: 'ScrollText' },
  { value: 'number', label: 'Nombre', icon: 'Hash' },
  { value: 'date', label: 'Date', icon: 'Calendar' },
  { value: 'email', label: 'Email', icon: 'Mail' },
  { value: 'tel', label: 'Téléphone', icon: 'Phone' },
  { value: 'select', label: 'Liste déroulante', icon: 'ChevronDown' },
  { value: 'multiselect', label: 'Liste multiple', icon: 'List' },
  { value: 'checkbox', label: 'Cases à cocher', icon: 'CheckSquare' }
]

const TEMPLATES = {
  'FORMULAIRE_ELIGIBILITE_PROGRAMME': {
    label: 'Éligibilité Programme Standard',
    champs: [
      {
        name: 'age_min',
        label: 'Âge minimum',
        type: 'number',
        required: true,
        ordre: 1,
        validation: { min: 0, max: 100 },
        help: 'Âge minimum requis pour participer au programme'
      },
      {
        name: 'age_max',
        label: 'Âge maximum',
        type: 'number',
        required: false,
        ordre: 2,
        validation: { min: 0, max: 100 },
        help: 'Âge maximum autorisé'
      },
      {
        name: 'genres_autorises',
        label: 'Genres autorisés',
        type: 'multiselect',
        referentiel: 'GENRE_CIBLE',
        required: false,
        ordre: 3
      },
      {
        name: 'zones',
        label: 'Zones éligibles',
        type: 'multiselect',
        referentiel: 'REGION',
        required: false,
        ordre: 4,
        help: 'Régions où le programme est accessible'
      }
    ]
  },
  'FICHE_DIAGNOSTIC_ENTREPRENEURIAT': {
    label: 'Diagnostic Entrepreneuriat Complet',
    domaines: [
      {
        id: 'reglementaire_juridique',
        label: 'Réglementaire & Juridique',
        icone: 'Scale',
        champs: [
          {
            name: 'statut_legal',
            label: 'Statut légal de l\'entreprise',
            type: 'select',
            required: true,
            ordre: 1,
            options: [
              { value: 'EI', label: 'Entreprise Individuelle' },
              { value: 'SARL', label: 'SARL' },
              { value: 'SA', label: 'SA' },
              { value: 'GIE', label: 'GIE' },
              { value: 'AUTRE', label: 'Autre' }
            ]
          },
          {
            name: 'immatriculation',
            label: 'Numéro d\'immatriculation',
            type: 'text',
            required: false,
            ordre: 2
          },
          {
            name: 'conformite_reglementaire',
            label: 'Niveau de conformité réglementaire',
            type: 'select',
            required: false,
            ordre: 3,
            options: [
              { value: 'Faible', label: 'Faible' },
              { value: 'Moyen', label: 'Moyen' },
              { value: 'Bon', label: 'Bon' },
              { value: 'Excellent', label: 'Excellent' }
            ]
          },
          {
            name: 'observations_reglementaire',
            label: 'Observations',
            type: 'textarea',
            required: false,
            ordre: 4,
            rows: 3
          }
        ]
      },
      {
        id: 'comptabilite_finances',
        label: 'Comptabilité & Finances',
        icone: 'DollarSign',
        champs: [
          {
            name: 'systeme_comptable',
            label: 'Système comptable en place',
            type: 'select',
            required: false,
            ordre: 1,
            options: [
              { value: 'Aucun', label: 'Aucun' },
              { value: 'Manuel', label: 'Manuel' },
              { value: 'Informatisé', label: 'Informatisé' }
            ]
          },
          {
            name: 'ca_annuel',
            label: 'Chiffre d\'affaires annuel (XOF)',
            type: 'number',
            required: false,
            ordre: 2,
            validation: { min: 0 }
          },
          {
            name: 'niveau_financier',
            label: 'Niveau de gestion financière',
            type: 'select',
            required: false,
            ordre: 3,
            options: [
              { value: 'Faible', label: 'Faible' },
              { value: 'Moyen', label: 'Moyen' },
              { value: 'Bon', label: 'Bon' },
              { value: 'Excellent', label: 'Excellent' }
            ]
          },
          {
            name: 'besoins_financiers',
            label: 'Besoins financiers identifiés',
            type: 'textarea',
            required: false,
            ordre: 4,
            rows: 3
          }
        ]
      },
      {
        id: 'marketing_commercial',
        label: 'Marketing & Commercial',
        icone: 'TrendingUp',
        champs: [
          {
            name: 'strategie_marketing',
            label: 'Stratégie marketing en place',
            type: 'select',
            required: false,
            ordre: 1,
            options: [
              { value: 'Aucune', label: 'Aucune' },
              { value: 'Informelle', label: 'Informelle' },
              { value: 'Formalisée', label: 'Formalisée' }
            ]
          },
          {
            name: 'canaux_vente',
            label: 'Canaux de vente',
            type: 'multiselect',
            required: false,
            ordre: 2,
            options: [
              { value: 'Physique', label: 'Point de vente physique' },
              { value: 'Online', label: 'Vente en ligne' },
              { value: 'Reseaux', label: 'Réseaux sociaux' },
              { value: 'B2B', label: 'B2B' }
            ]
          },
          {
            name: 'niveau_marketing',
            label: 'Niveau marketing',
            type: 'select',
            required: false,
            ordre: 3,
            options: [
              { value: 'Faible', label: 'Faible' },
              { value: 'Moyen', label: 'Moyen' },
              { value: 'Bon', label: 'Bon' },
              { value: 'Excellent', label: 'Excellent' }
            ]
          },
          {
            name: 'observations_marketing',
            label: 'Observations',
            type: 'textarea',
            required: false,
            ordre: 4,
            rows: 3
          }
        ]
      },
      {
        id: 'organisationnel',
        label: 'Organisationnel',
        icone: 'Building',
        champs: [
          {
            name: 'effectif',
            label: 'Effectif',
            type: 'number',
            required: false,
            ordre: 1,
            validation: { min: 0 }
          },
          {
            name: 'structure_organisationnelle',
            label: 'Structure organisationnelle',
            type: 'select',
            required: false,
            ordre: 2,
            options: [
              { value: 'Informelle', label: 'Informelle' },
              { value: 'En cours', label: 'En cours de structuration' },
              { value: 'Formalisée', label: 'Formalisée' }
            ]
          },
          {
            name: 'niveau_organisationnel',
            label: 'Niveau organisationnel',
            type: 'select',
            required: false,
            ordre: 3,
            options: [
              { value: 'Faible', label: 'Faible' },
              { value: 'Moyen', label: 'Moyen' },
              { value: 'Bon', label: 'Bon' },
              { value: 'Excellent', label: 'Excellent' }
            ]
          },
          {
            name: 'observations_organisationnel',
            label: 'Observations',
            type: 'textarea',
            required: false,
            ordre: 4,
            rows: 3
          }
        ]
      },
      {
        id: 'digital',
        label: 'Digital',
        icone: 'Smartphone',
        champs: [
          {
            name: 'presence_digitale',
            label: 'Présence digitale',
            type: 'multiselect',
            required: false,
            ordre: 1,
            options: [
              { value: 'Site web', label: 'Site web' },
              { value: 'Reseaux sociaux', label: 'Réseaux sociaux' },
              { value: 'E-commerce', label: 'E-commerce' },
              { value: 'Application mobile', label: 'Application mobile' }
            ]
          },
          {
            name: 'niveau_digital',
            label: 'Niveau de maturité digitale',
            type: 'select',
            required: false,
            ordre: 2,
            options: [
              { value: 'Faible', label: 'Faible' },
              { value: 'Moyen', label: 'Moyen' },
              { value: 'Bon', label: 'Bon' },
              { value: 'Excellent', label: 'Excellent' }
            ]
          },
          {
            name: 'besoins_digitaux',
            label: 'Besoins digitaux identifiés',
            type: 'textarea',
            required: false,
            ordre: 3,
            rows: 3
          }
        ]
      }
    ],
    scoring: {
      enabled: true,
      method: 'weighted',
      weights: {
        reglementaire_juridique: 0.2,
        comptabilite_finances: 0.25,
        marketing_commercial: 0.2,
        organisationnel: 0.15,
        digital: 0.2
      }
    },
    contexte_utilisation: ['PROGRAMME_*', 'PROJET_*']
  },
  'FICHE_DIAGNOSTIC_FORMATION': {
    label: 'Diagnostic Formation',
    champs: [
      {
        name: 'besoins_formation',
        label: 'Besoins en formation identifiés',
        type: 'textarea',
        required: true,
        ordre: 1,
        rows: 4
      },
      {
        name: 'niveau_actuel',
        label: 'Niveau actuel',
        type: 'select',
        required: false,
        ordre: 2,
        options: [
          { value: 'Débutant', label: 'Débutant' },
          { value: 'Intermédiaire', label: 'Intermédiaire' },
          { value: 'Avancé', label: 'Avancé' }
        ]
      },
      {
        name: 'domaines_formation',
        label: 'Domaines de formation souhaités',
        type: 'multiselect',
        required: false,
        ordre: 3,
        options: [
          { value: 'Gestion', label: 'Gestion' },
          { value: 'Marketing', label: 'Marketing' },
          { value: 'Finance', label: 'Finance' },
          { value: 'Digital', label: 'Digital' },
          { value: 'Juridique', label: 'Juridique' }
        ]
      },
      {
        name: 'delai_souhaite',
        label: 'Délai souhaité',
        type: 'date',
        required: false,
        ordre: 4
      }
    ]
  },
  'RECUEIL_BESOINS_ENTREPRENEUR': {
    label: 'Recueil Besoins Entrepreneur',
    domaines: [
      {
        id: 'besoins_generaux',
        label: 'Besoins généraux',
        icone: 'MessageSquare',
        champs: [
          {
            name: 'besoin_principal',
            label: 'Quel est votre besoin principal ?',
            type: 'textarea',
            required: true,
            ordre: 1,
            rows: 4
          },
          {
            name: 'secteur_activite',
            label: 'Secteur d\'activité',
            type: 'select',
            referentiel: 'SECTEUR_ACTIVITE',
            required: true,
            ordre: 2
          }
        ]
      },
      {
        id: 'besoins_financiers',
        label: 'Besoins financiers',
        icone: 'DollarSign',
        champs: [
          {
            name: 'montant_souhaite',
            label: 'Montant souhaité (XOF)',
            type: 'number',
            required: false,
            ordre: 1,
            validation: { min: 0 }
          },
          {
            name: 'type_financement',
            label: 'Type de financement',
            type: 'select',
            required: false,
            ordre: 2,
            options: [
              { value: 'Subvention', label: 'Subvention' },
              { value: 'Prêt', label: 'Prêt' },
              { value: 'Equity', label: 'Equity' },
              { value: 'Autre', label: 'Autre' }
            ]
          }
        ]
      },
      {
        id: 'besoins_accompagnement',
        label: 'Besoins d\'accompagnement',
        icone: 'HandHeart',
        champs: [
          {
            name: 'type_accompagnement',
            label: 'Type d\'accompagnement souhaité',
            type: 'multiselect',
            required: false,
            ordre: 1,
            options: [
              { value: 'Mentorat', label: 'Mentorat' },
              { value: 'Formation', label: 'Formation' },
              { value: 'Coaching', label: 'Coaching' },
              { value: 'Conseil', label: 'Conseil' }
            ]
          },
          {
            name: 'duree_souhaitee',
            label: 'Durée souhaitée (mois)',
            type: 'number',
            required: false,
            ordre: 2,
            validation: { min: 1 }
          }
        ]
      }
    ]
  },
  'QUESTIONNAIRE_VALIDATION_COMPETENCES': {
    label: 'Questionnaire Validation Compétences',
    champs: [
      {
        name: 'competence_evaluee',
        label: 'Compétence évaluée',
        type: 'text',
        required: true,
        ordre: 1
      },
      {
        name: 'niveau_avant',
        label: 'Niveau avant formation',
        type: 'select',
        required: false,
        ordre: 2,
        options: [
          { value: '1', label: '1 - Débutant' },
          { value: '2', label: '2 - Intermédiaire' },
          { value: '3', label: '3 - Avancé' },
          { value: '4', label: '4 - Expert' }
        ]
      },
      {
        name: 'niveau_apres',
        label: 'Niveau après formation',
        type: 'select',
        required: false,
        ordre: 3,
        options: [
          { value: '1', label: '1 - Débutant' },
          { value: '2', label: '2 - Intermédiaire' },
          { value: '3', label: '3 - Avancé' },
          { value: '4', label: '4 - Expert' }
        ]
      },
      {
        name: 'commentaires',
        label: 'Commentaires',
        type: 'textarea',
        required: false,
        ordre: 4,
        rows: 3
      }
    ]
  }
}

export default function FormBuilder({ initialConfig = null, onSave, onCancel, referentielType }) {
  // Détecter si on utilise la structure domaines ou champs simples
  const isMultiDomain = referentielType?.startsWith('FICHE_DIAGNOSTIC_') || 
                        referentielType?.startsWith('RECUEIL_BESOINS_')
  
  const [champs, setChamps] = useState([])
  const [domaines, setDomaines] = useState([])
  const [scoring, setScoring] = useState({ enabled: false, method: 'weighted', weights: {} })
  const [activeDomain, setActiveDomain] = useState(null)
  const [editingIndex, setEditingIndex] = useState(null)
  const [editingDomainIndex, setEditingDomainIndex] = useState(null)
  const [showAddField, setShowAddField] = useState(false)
  const [showAddDomain, setShowAddDomain] = useState(false)
  const [newField, setNewField] = useState({
    name: '',
    label: '',
    type: 'text',
    required: false,
    ordre: 0,
    placeholder: '',
    help: '',
    referentiel: '',
    options: [],
    validation: {}
  })
  const [newDomain, setNewDomain] = useState({
    id: '',
    label: '',
    icone: 'FileText',
    champs: []
  })

  useEffect(() => {
    if (initialConfig && initialConfig.meta) {
      if (initialConfig.meta.domaines) {
        // Structure multi-domaines
        setDomaines(initialConfig.meta.domaines)
        setScoring(initialConfig.meta.scoring || { enabled: false, method: 'weighted', weights: {} })
        if (initialConfig.meta.domaines.length > 0) {
          setActiveDomain(initialConfig.meta.domaines[0].id)
        }
      } else if (initialConfig.meta.champs) {
        // Structure simple
        setChamps(initialConfig.meta.champs)
      }
    }
  }, [initialConfig])

  const handleAddField = () => {
    if (!newField.name || !newField.label) {
      alert('Veuillez remplir au moins le nom et le label du champ')
      return
    }

    const field = {
      ...newField,
      ordre: champs.length + 1,
      name: newField.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    }

    setChamps([...champs, field])
    setNewField({
      name: '',
      label: '',
      type: 'text',
      required: false,
      ordre: 0,
      placeholder: '',
      help: '',
      referentiel: '',
      options: [],
      validation: {}
    })
    setShowAddField(false)
  }

  const handleRemoveField = (index) => {
    if (window.confirm('Supprimer ce champ ?')) {
      const newChamps = champs.filter((_, i) => i !== index)
      // Réorganiser les ordres
      const reordered = newChamps.map((champ, i) => ({ ...champ, ordre: i + 1 }))
      setChamps(reordered)
    }
  }

  const handleMoveField = (index, direction) => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === champs.length - 1)) {
      return
    }

    const newChamps = [...champs]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newChamps[index], newChamps[targetIndex]] = [newChamps[targetIndex], newChamps[index]]
    
    // Réorganiser les ordres
    const reordered = newChamps.map((champ, i) => ({ ...champ, ordre: i + 1 }))
    setChamps(reordered)
  }

  const handleEditField = (index) => {
    setEditingIndex(index)
    setNewField({ ...champs[index] })
    setShowAddField(true)
  }

  const handleUpdateField = () => {
    if (!newField.name || !newField.label) {
      alert('Veuillez remplir au moins le nom et le label du champ')
      return
    }

    const updated = [...champs]
    updated[editingIndex] = {
      ...newField,
      name: newField.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    }
    setChamps(updated)
    setEditingIndex(null)
    setShowAddField(false)
    setNewField({
      name: '',
      label: '',
      type: 'text',
      required: false,
      ordre: 0,
      placeholder: '',
      help: '',
      referentiel: '',
      options: [],
      validation: {}
    })
  }

  const handleAddDomain = () => {
    if (!newDomain.id || !newDomain.label) {
      alert('Veuillez remplir au moins l\'ID et le label du domaine')
      return
    }

    const domain = {
      ...newDomain,
      id: newDomain.id.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      champs: []
    }

    setDomaines([...domaines, domain])
    if (!activeDomain) {
      setActiveDomain(domain.id)
    }
    setNewDomain({
      id: '',
      label: '',
      icone: 'FileText',
      champs: []
    })
    setShowAddDomain(false)
  }

  const handleRemoveDomain = (domainId) => {
    if (window.confirm('Supprimer ce domaine ? Tous les champs associés seront également supprimés.')) {
      const newDomaines = domaines.filter(d => d.id !== domainId)
      setDomaines(newDomaines)
      if (activeDomain === domainId && newDomaines.length > 0) {
        setActiveDomain(newDomaines[0].id)
      } else if (newDomaines.length === 0) {
        setActiveDomain(null)
      }
    }
  }

  const handleAddFieldToDomain = (domainId) => {
    if (!newField.name || !newField.label) {
      alert('Veuillez remplir au moins le nom et le label du champ')
      return
    }

    const field = {
      ...newField,
      ordre: (domaines.find(d => d.id === domainId)?.champs?.length || 0) + 1,
      name: newField.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    }

    setDomaines(domaines.map(d => 
      d.id === domainId 
        ? { ...d, champs: [...(d.champs || []), field] }
        : d
    ))

    setNewField({
      name: '',
      label: '',
      type: 'text',
      required: false,
      ordre: 0,
      placeholder: '',
      help: '',
      referentiel: '',
      options: [],
      validation: {}
    })
    setShowAddField(false)
  }

  const handleRemoveFieldFromDomain = (domainId, fieldIndex) => {
    if (window.confirm('Supprimer ce champ ?')) {
      setDomaines(domaines.map(d => 
        d.id === domainId 
          ? { 
              ...d, 
              champs: d.champs.filter((_, i) => i !== fieldIndex).map((champ, i) => ({ ...champ, ordre: i + 1 }))
            }
          : d
      ))
    }
  }

  const handleSave = () => {
    if (isMultiDomain && domaines.length > 0) {
      const config = {
        domaines: domaines.map(d => ({
          ...d,
          champs: d.champs.sort((a, b) => (a.ordre || 0) - (b.ordre || 0))
        })),
        scoring: scoring.enabled ? scoring : undefined,
        contexte_utilisation: ['PROGRAMME_*', 'PROJET_*']
      }
      onSave(config)
    } else {
      const config = {
        champs: champs.sort((a, b) => (a.ordre || 0) - (b.ordre || 0))
      }
      onSave(config)
    }
  }

  const availableTemplates = TEMPLATES[referentielType] ? [TEMPLATES[referentielType]] : []
  
  const handleApplyTemplate = (template) => {
    if (window.confirm(`Appliquer le template "${template.label}" ? Cela remplacera la configuration actuelle.`)) {
      if (template.domaines) {
        setDomaines(template.domaines)
        setScoring(template.scoring || { enabled: false, method: 'weighted', weights: {} })
        if (template.domaines.length > 0) {
          setActiveDomain(template.domaines[0].id)
        }
      } else if (template.champs) {
        setChamps(template.champs)
      }
    }
  }

  const currentDomainChamps = activeDomain 
    ? domaines.find(d => d.id === activeDomain)?.champs || []
    : []

  return (
    <div className="form-builder">
      <div className="form-builder-header">
        <h3>Constructeur de formulaire</h3>
        <p className="form-builder-subtitle">
          {isMultiDomain 
            ? 'Créez votre formulaire multi-domaines en organisant les champs par domaine d\'évaluation.'
            : 'Créez votre formulaire en ajoutant des champs. Aucune connaissance technique requise.'}
        </p>
      </div>

      {availableTemplates.length > 0 && (
        <div className="form-builder-templates-bar">
          <span>Templates disponibles :</span>
          {availableTemplates.map((template, idx) => (
            <button
              key={idx}
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => handleApplyTemplate(template)}
            >
              <Icon name="FileText" size={14} />
              {template.label}
            </button>
          ))}
        </div>
      )}

      <div className="form-builder-content">
        {isMultiDomain ? (
          // Mode multi-domaines
          <>
            {/* Onglets des domaines */}
            <div className="form-builder-domains-tabs">
              {domaines.map((domain) => (
                <button
                  key={domain.id}
                  type="button"
                  className={`form-builder-domain-tab ${activeDomain === domain.id ? 'active' : ''}`}
                  onClick={() => setActiveDomain(domain.id)}
                >
                  <Icon name={domain.icone || 'FileText'} size={16} />
                  {domain.label}
                </button>
              ))}
              <button
                type="button"
                className="form-builder-domain-tab form-builder-domain-tab--add"
                onClick={() => setShowAddDomain(true)}
              >
                <Icon name="Plus" size={16} />
                Ajouter un domaine
              </button>
            </div>

            {/* Prévisualisation du domaine actif */}
            <div className="form-builder-preview">
              <h4>
                {activeDomain 
                  ? `Aperçu - ${domaines.find(d => d.id === activeDomain)?.label || 'Domaine'}`
                  : 'Aperçu du formulaire'}
              </h4>
              <div className="form-builder-preview-content">
                {activeDomain && currentDomainChamps.length === 0 ? (
                  <div className="form-builder-empty">
                    <Icon name="FileText" size={32} />
                    <p>Aucun champ dans ce domaine</p>
                    <small>Ajoutez des champs ci-dessous</small>
                  </div>
                ) : activeDomain ? (
                  currentDomainChamps
                    .sort((a, b) => (a.ordre || 0) - (b.ordre || 0))
                    .map((champ, index) => (
                      <div key={index} className="form-builder-preview-field">
                        <label>
                          {champ.label}
                          {champ.required && <span className="required">*</span>}
                        </label>
                        {champ.type === 'textarea' ? (
                          <textarea
                            className="input"
                            placeholder={champ.placeholder || `Saisir ${champ.label.toLowerCase()}...`}
                            rows={champ.rows || 3}
                            disabled
                          />
                        ) : champ.type === 'select' || champ.type === 'multiselect' ? (
                          <select className="input" disabled>
                            <option>{champ.placeholder || 'Sélectionner...'}</option>
                          </select>
                        ) : (
                          <input
                            type={champ.type === 'number' ? 'number' : champ.type === 'date' ? 'date' : 'text'}
                            className="input"
                            placeholder={champ.placeholder || `Saisir ${champ.label.toLowerCase()}...`}
                            disabled
                          />
                        )}
                        {champ.help && <small className="field-help">{champ.help}</small>}
                      </div>
                    ))
                ) : (
                  <div className="form-builder-empty">
                    <Icon name="FileText" size={32} />
                    <p>Aucun domaine configuré</p>
                    <small>Ajoutez un domaine pour commencer</small>
                  </div>
                )}
              </div>
            </div>

            {/* Configuration des champs du domaine actif */}
            {activeDomain && (
              <div className="form-builder-config">
                <div className="form-builder-config-header">
                  <h4>Champs du domaine "{domaines.find(d => d.id === activeDomain)?.label}"</h4>
                </div>

                <div className="form-builder-fields-list">
                  {currentDomainChamps.length === 0 ? (
                    <div className="form-builder-empty-list">
                      <p>Aucun champ configuré dans ce domaine</p>
                      <small>Cliquez sur "Ajouter un champ" pour commencer</small>
                    </div>
                  ) : (
                    currentDomainChamps
                      .sort((a, b) => (a.ordre || 0) - (b.ordre || 0))
                      .map((champ, index) => (
                        <div key={index} className="form-builder-field-item">
                          <div className="form-builder-field-info">
                            <div className="form-builder-field-number">{index + 1}</div>
                            <div className="form-builder-field-details">
                              <strong>{champ.label}</strong>
                              <small>
                                {FIELD_TYPES.find(t => t.value === champ.type)?.label || champ.type}
                                {champ.required && ' • Requis'}
                                {champ.referentiel && ` • Référentiel: ${champ.referentiel}`}
                              </small>
                            </div>
                          </div>
                          <div className="form-builder-field-actions">
                            <button
                              type="button"
                              className="btn-icon"
                              onClick={() => handleEditField(index)}
                              title="Modifier"
                            >
                              <Icon name="Edit" size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn-icon btn-icon--danger"
                              onClick={() => handleRemoveFieldFromDomain(activeDomain, index)}
                              title="Supprimer"
                            >
                              <Icon name="Trash2" size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>

                {!showAddField && (
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={() => setShowAddField(true)}
                  >
                    <Icon name="Plus" size={18} />
                    Ajouter un champ
                  </button>
                )}
              </div>
            )}

            {/* Formulaire d'ajout/modification de domaine */}
            {showAddDomain && (
              <div className="form-builder-add-domain">
                <div className="form-builder-add-domain-header">
                  <h5>Ajouter un domaine</h5>
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => {
                      setShowAddDomain(false)
                      setNewDomain({ id: '', label: '', icone: 'FileText', champs: [] })
                    }}
                  >
                    <Icon name="X" size={16} />
                  </button>
                </div>
                <div className="form-builder-add-domain-form">
                  <div className="form-group">
                    <label>Label du domaine *</label>
                    <input
                      type="text"
                      className="input"
                      value={newDomain.label}
                      onChange={(e) => setNewDomain({ ...newDomain, label: e.target.value })}
                      placeholder="Ex: Réglementaire & Juridique"
                    />
                  </div>
                  <div className="form-group">
                    <label>Icône</label>
                    <select
                      className="input"
                      value={newDomain.icone}
                      onChange={(e) => setNewDomain({ ...newDomain, icone: e.target.value })}
                    >
                      <option value="FileText">Document</option>
                      <option value="Scale">Balance</option>
                      <option value="DollarSign">Finance</option>
                      <option value="TrendingUp">Marketing</option>
                      <option value="Building">Organisation</option>
                      <option value="Smartphone">Digital</option>
                      <option value="MessageSquare">Besoins</option>
                      <option value="HandHeart">Accompagnement</option>
                    </select>
                  </div>
                  <div className="form-builder-add-domain-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowAddDomain(false)
                        setNewDomain({ id: '', label: '', icone: 'FileText', champs: [] })
                      }}
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleAddDomain}
                    >
                      <Icon name="Plus" size={16} />
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          // Mode simple (champs)
          <>
            {/* Prévisualisation */}
            <div className="form-builder-preview">
              <h4>Aperçu du formulaire</h4>
              <div className="form-builder-preview-content">
                {champs.length === 0 ? (
                  <div className="form-builder-empty">
                    <Icon name="FileText" size={32} />
                    <p>Aucun champ pour le moment</p>
                    <small>Ajoutez des champs ci-dessous pour voir l'aperçu</small>
                  </div>
                ) : (
                  champs
                    .sort((a, b) => (a.ordre || 0) - (b.ordre || 0))
                    .map((champ, index) => (
                      <div key={index} className="form-builder-preview-field">
                        <label>
                          {champ.label}
                          {champ.required && <span className="required">*</span>}
                        </label>
                        {champ.type === 'textarea' ? (
                          <textarea
                            className="input"
                            placeholder={champ.placeholder || `Saisir ${champ.label.toLowerCase()}...`}
                            rows={champ.rows || 3}
                            disabled
                          />
                        ) : champ.type === 'select' || champ.type === 'multiselect' ? (
                          <select className="input" disabled>
                            <option>{champ.placeholder || 'Sélectionner...'}</option>
                          </select>
                        ) : (
                          <input
                            type={champ.type === 'number' ? 'number' : champ.type === 'date' ? 'date' : 'text'}
                            className="input"
                            placeholder={champ.placeholder || `Saisir ${champ.label.toLowerCase()}...`}
                            disabled
                          />
                        )}
                        {champ.help && <small className="field-help">{champ.help}</small>}
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Liste des champs et configuration */}
            <div className="form-builder-config">
              <div className="form-builder-config-header">
                <h4>Champs du formulaire</h4>
              </div>

              <div className="form-builder-fields-list">
                {champs.length === 0 ? (
                  <div className="form-builder-empty-list">
                    <p>Aucun champ configuré</p>
                    <small>Cliquez sur "Ajouter un champ" pour commencer</small>
                  </div>
                ) : (
                  champs
                    .sort((a, b) => (a.ordre || 0) - (b.ordre || 0))
                    .map((champ, index) => (
                      <div key={index} className="form-builder-field-item">
                        <div className="form-builder-field-info">
                          <div className="form-builder-field-number">{index + 1}</div>
                          <div className="form-builder-field-details">
                            <strong>{champ.label}</strong>
                            <small>
                              {FIELD_TYPES.find(t => t.value === champ.type)?.label || champ.type}
                              {champ.required && ' • Requis'}
                              {champ.referentiel && ` • Référentiel: ${champ.referentiel}`}
                            </small>
                          </div>
                        </div>
                        <div className="form-builder-field-actions">
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => handleMoveField(index, 'up')}
                            disabled={index === 0}
                            title="Déplacer vers le haut"
                          >
                            <Icon name="ChevronUp" size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => handleMoveField(index, 'down')}
                            disabled={index === champs.length - 1}
                            title="Déplacer vers le bas"
                          >
                            <Icon name="ChevronDown" size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => handleEditField(index)}
                            title="Modifier"
                          >
                            <Icon name="Edit" size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon btn-icon--danger"
                            onClick={() => handleRemoveField(index)}
                            title="Supprimer"
                          >
                            <Icon name="Trash2" size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* Formulaire d'ajout/modification de champ */}
              {showAddField && (
                <div className="form-builder-add-field">
                  <div className="form-builder-add-field-header">
                    <h5>{editingIndex !== null ? 'Modifier le champ' : 'Ajouter un champ'}</h5>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => {
                        setShowAddField(false)
                        setEditingIndex(null)
                        setNewField({
                          name: '',
                          label: '',
                          type: 'text',
                          required: false,
                          ordre: 0,
                          placeholder: '',
                          help: '',
                          referentiel: '',
                          options: [],
                          validation: {}
                        })
                      }}
                    >
                      <Icon name="X" size={16} />
                    </button>
                  </div>

              <div className="form-builder-add-field-form">
                <div className="form-group">
                  <label>Label du champ *</label>
                  <input
                    type="text"
                    className="input"
                    value={newField.label}
                    onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                    placeholder="Ex: Âge minimum"
                  />
                  <small>Le nom affiché dans le formulaire</small>
                </div>

                <div className="form-group">
                  <label>Type de champ *</label>
                  <select
                    className="input"
                    value={newField.type}
                    onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                  >
                    {FIELD_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={newField.required}
                      onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                    />
                    <span>Champ obligatoire</span>
                  </label>
                </div>

                {(newField.type === 'select' || newField.type === 'multiselect' || newField.type === 'checkbox') && (
                  <div className="form-group">
                    <label>
                      Utiliser un référentiel existant (optionnel)
                    </label>
                    <select
                      className="input"
                      value={newField.referentiel}
                      onChange={(e) => setNewField({ ...newField, referentiel: e.target.value })}
                    >
                      <option value="">Aucun (définir des options manuelles)</option>
                      <option value="GENRE_CIBLE">Genres ciblés</option>
                      <option value="SECTEUR_ACTIVITE">Secteurs d'activité</option>
                      <option value="REGION">Régions</option>
                      <option value="DEPARTEMENT">Départements</option>
                      <option value="COMMUNE">Communes</option>
                      <option value="THEMATIQUE_PROGRAMME">Thématiques</option>
                      <option value="TYPE_PROGRAMME">Types de programme</option>
                    </select>
                    <small>Si vous choisissez un référentiel, les options seront chargées automatiquement</small>
                  </div>
                )}

                {!newField.referentiel && (newField.type === 'select' || newField.type === 'multiselect' || newField.type === 'checkbox') && (
                  <div className="form-group">
                    <label>Options (une par ligne)</label>
                    <textarea
                      className="input"
                      rows={4}
                      value={newField.options.map(opt => typeof opt === 'string' ? opt : opt.label || opt.value).join('\n')}
                      onChange={(e) => {
                        const options = e.target.value.split('\n').filter(line => line.trim()).map(line => ({
                          value: line.trim(),
                          label: line.trim()
                        }))
                        setNewField({ ...newField, options })
                      }}
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                    />
                    <small>Saisissez une option par ligne</small>
                  </div>
                )}

                {newField.type === 'textarea' && (
                  <div className="form-group">
                    <label>Nombre de lignes</label>
                    <input
                      type="number"
                      className="input"
                      value={newField.rows || 3}
                      onChange={(e) => setNewField({ ...newField, rows: parseInt(e.target.value) || 3 })}
                      min={1}
                      max={20}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Texte d'aide (optionnel)</label>
                  <input
                    type="text"
                    className="input"
                    value={newField.help}
                    onChange={(e) => setNewField({ ...newField, help: e.target.value })}
                    placeholder="Ex: Saisissez votre âge en années"
                  />
                  <small>Texte affiché sous le champ pour guider l'utilisateur</small>
                </div>

                  <div className="form-builder-add-field-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowAddField(false)
                        setEditingIndex(null)
                        setNewField({
                          name: '',
                          label: '',
                          type: 'text',
                          required: false,
                          ordre: 0,
                          placeholder: '',
                          help: '',
                          referentiel: '',
                          options: [],
                          validation: {}
                        })
                      }}
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        if (isMultiDomain && activeDomain) {
                          if (editingIndex !== null) {
                            // Modifier un champ existant dans un domaine
                            const domain = domaines.find(d => d.id === activeDomain)
                            const updatedChamps = [...domain.champs]
                            updatedChamps[editingIndex] = {
                              ...newField,
                              name: newField.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
                            }
                            setDomaines(domaines.map(d => 
                              d.id === activeDomain ? { ...d, champs: updatedChamps } : d
                            ))
                            setEditingIndex(null)
                          } else {
                            handleAddFieldToDomain(activeDomain)
                          }
                        } else {
                          editingIndex !== null ? handleUpdateField() : handleAddField()
                        }
                        setShowAddField(false)
                        setNewField({
                          name: '',
                          label: '',
                          type: 'text',
                          required: false,
                          ordre: 0,
                          placeholder: '',
                          help: '',
                          referentiel: '',
                          options: [],
                          validation: {}
                        })
                      }}
                    >
                      <Icon name={editingIndex !== null ? 'Check' : 'Plus'} size={16} />
                      {editingIndex !== null ? 'Modifier' : 'Ajouter'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!showAddField && (
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => setShowAddField(true)}
            >
              <Icon name="Plus" size={18} />
              Ajouter un champ
            </button>
          )}
        </div>
          </>
        )}
      </div>

      <div className="form-builder-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
        >
          Annuler
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={isMultiDomain ? domaines.length === 0 : champs.length === 0}
        >
          <Icon name="Save" size={18} />
          Enregistrer le formulaire
        </button>
      </div>
    </div>
  )
}

