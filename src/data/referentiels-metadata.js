// Métadonnées pour les types de référentiels
// Utilisé pour l'affichage moderne avec catégorisation, icônes, descriptions

export const REFERENTIELS_CATEGORIES = {
  LISTES: {
    id: 'LISTES',
    label: 'Listes simples',
    icon: 'List',
    color: '#3b82f6',
    description: 'Listes de valeurs réutilisables dans les formulaires'
  },
  FORMULAIRES: {
    id: 'FORMULAIRES',
    label: 'Formulaires dynamiques',
    icon: 'FileText',
    color: '#10b981',
    description: 'Formulaires configurables pour recueil de données'
  },
  CONFIGURATION: {
    id: 'CONFIGURATION',
    label: 'Configuration avancée',
    icon: 'Settings',
    color: '#8b5cf6',
    description: 'Paramètres et règles métier avancées'
  }
}

export const REFERENTIELS_METADATA = {
  // LISTES SIMPLES
  FINANCEUR_PROGRAMME: {
    type: 'FINANCEUR_PROGRAMME',
    label: 'Financeurs',
    category: 'LISTES',
    icon: 'DollarSign',
    description: 'Organismes financeurs des programmes',
    color: '#3b82f6'
  },
  STATUT_PROGRAMME: {
    type: 'STATUT_PROGRAMME',
    label: 'Statuts de programme',
    category: 'LISTES',
    icon: 'CheckCircle',
    description: 'Statuts possibles d\'un programme (Actif, En préparation, etc.)',
    color: '#3b82f6'
  },
  TYPE_PROGRAMME: {
    type: 'TYPE_PROGRAMME',
    label: 'Types de programme',
    category: 'LISTES',
    icon: 'Briefcase',
    description: 'Types de programmes (Formation, Incubation, Financement, etc.)',
    color: '#3b82f6'
  },
  THEMATIQUE_PROGRAMME: {
    type: 'THEMATIQUE_PROGRAMME',
    label: 'Thématiques',
    category: 'LISTES',
    icon: 'BookOpen',
    description: 'Thématiques couvertes par les programmes',
    color: '#3b82f6'
  },
  SECTEUR_ACTIVITE: {
    type: 'SECTEUR_ACTIVITE',
    label: 'Secteurs d\'activité',
    category: 'LISTES',
    icon: 'Building2',
    description: 'Secteurs d\'activité ciblés',
    color: '#3b82f6'
  },
  GENRE_CIBLE: {
    type: 'GENRE_CIBLE',
    label: 'Genres ciblés',
    category: 'LISTES',
    icon: 'Users',
    description: 'Genres ciblés par les programmes',
    color: '#3b82f6'
  },
  NIVEAU_RISQUE: {
    type: 'NIVEAU_RISQUE',
    label: 'Niveaux de risque',
    category: 'LISTES',
    icon: 'AlertTriangle',
    description: 'Niveaux de risque des projets',
    color: '#3b82f6'
  },
  FREQUENCE_REPORTING: {
    type: 'FREQUENCE_REPORTING',
    label: 'Fréquences de reporting',
    category: 'LISTES',
    icon: 'Calendar',
    description: 'Fréquences de rapport pour les programmes',
    color: '#3b82f6'
  },

  // FORMULAIRES DYNAMIQUES
  FORMULAIRE_RECUEIL_BESOINS: {
    type: 'FORMULAIRE_RECUEIL_BESOINS',
    label: 'Recueil de besoins',
    category: 'FORMULAIRES',
    icon: 'ClipboardList',
    description: 'Formulaire pour recueillir les besoins des candidats',
    color: '#10b981'
  },
  FORMULAIRE_DIAGNOSTIC: {
    type: 'FORMULAIRE_DIAGNOSTIC',
    label: 'Diagnostic',
    category: 'FORMULAIRES',
    icon: 'FileEdit',
    description: 'Formulaire de diagnostic pour évaluer les candidats',
    color: '#10b981'
  },
  FORMULAIRE_ELIGIBILITE_PROGRAMME: {
    type: 'FORMULAIRE_ELIGIBILITE_PROGRAMME',
    label: 'Éligibilité programme',
    category: 'FORMULAIRES',
    icon: 'Target',
    description: 'Critères d\'éligibilité pour les programmes',
    color: '#10b981'
  },
  FORMULAIRE_ELIGIBILITE_PROJET: {
    type: 'FORMULAIRE_ELIGIBILITE_PROJET',
    label: 'Éligibilité projet',
    category: 'FORMULAIRES',
    icon: 'Target',
    description: 'Critères d\'éligibilité pour les projets',
    color: '#10b981'
  },
  FORMULAIRE_DIAGNOSTIC_FORMATION: {
    type: 'FORMULAIRE_DIAGNOSTIC_FORMATION',
    label: 'Diagnostic formation',
    category: 'FORMULAIRES',
    icon: 'GraduationCap',
    description: 'Formulaire de diagnostic pour les formations',
    color: '#10b981'
  },

  // CONFIGURATION AVANCEE
  CRITERE_ELIGIBILITE: {
    type: 'CRITERE_ELIGIBILITE',
    label: 'Critères d\'éligibilité',
    category: 'CONFIGURATION',
    icon: 'CheckSquare',
    description: 'Critères réutilisables pour l\'éligibilité',
    color: '#8b5cf6'
  },
  WORKFLOW_CANDIDATURE: {
    type: 'WORKFLOW_CANDIDATURE',
    label: 'Workflows candidature',
    category: 'CONFIGURATION',
    icon: 'ArrowRight',
    description: 'Définition des workflows de traitement des candidatures',
    color: '#8b5cf6'
  },
  CHAMP_FORMULAIRE: {
    type: 'CHAMP_FORMULAIRE',
    label: 'Champs de formulaire',
    category: 'CONFIGURATION',
    icon: 'LayoutGrid',
    description: 'Champs réutilisables pour les formulaires',
    color: '#8b5cf6'
  }
}

// Fonction utilitaire pour obtenir les métadonnées d'un type
export const getReferentielMetadata = (type) => {
  return REFERENTIELS_METADATA[type] || {
    type,
    label: type,
    category: 'LISTES',
    icon: 'FileText',
    description: 'Type de référentiel',
    color: '#64748b'
  }
}

// Fonction pour obtenir tous les types d'une catégorie
export const getTypesByCategory = (categoryId) => {
  return Object.values(REFERENTIELS_METADATA)
    .filter(meta => meta.category === categoryId)
    .map(meta => meta.type)
}

// Fonction pour obtenir toutes les catégories avec leurs types
export const getCategoriesWithTypes = () => {
  return Object.values(REFERENTIELS_CATEGORIES).map(category => ({
    ...category,
    types: getTypesByCategory(category.id)
  }))
}

