// Structure de catégorisation des référentiels avec métadonnées
export const REFERENTIEL_CATEGORIES = {
  LISTES: {
    label: 'Listes simples',
    icon: 'ClipboardList',
    color: '#3b82f6',
    description: 'Listes de valeurs réutilisables dans les formulaires',
    types: [
      {
        value: 'FINANCEUR_PROGRAMME',
        label: 'Financeurs',
        icon: 'DollarSign',
        description: 'Organismes financeurs des programmes'
      },
      {
        value: 'STATUT_PROGRAMME',
        label: 'Statuts',
        icon: 'Circle',
        description: 'Statuts des programmes (Actif, Terminé, etc.)'
      },
      {
        value: 'TYPE_PROGRAMME',
        label: 'Types de programme',
        icon: 'Briefcase',
        description: 'Types de programmes (Formation, Incubation, etc.)'
      },
      {
        value: 'THEMATIQUE_PROGRAMME',
        label: 'Thématiques',
        icon: 'Lightbulb',
        description: 'Thématiques couvertes par les programmes'
      },
      {
        value: 'SECTEUR_ACTIVITE',
        label: 'Secteurs d\'activité',
        icon: 'Building2',
        description: 'Secteurs économiques ciblés'
      },
      {
        value: 'GENRE_CIBLE',
        label: 'Genres ciblés',
        icon: 'Users',
        description: 'Genres ciblés par les programmes'
      },
      {
        value: 'NIVEAU_RISQUE',
        label: 'Niveaux de risque',
        icon: 'AlertTriangle',
        description: 'Niveaux d\'évaluation des risques'
      },
      {
        value: 'FREQUENCE_REPORTING',
        label: 'Fréquences de reporting',
        icon: 'Calendar',
        description: 'Fréquences de suivi et reporting'
      }
    ]
  },
  FORMULAIRES_ADMIN: {
    label: 'Formulaires administratifs',
    icon: 'FileText',
    color: '#10b981',
    description: 'Formulaires d\'inscription, candidature, dossiers et contrats',
    types: [
      {
        value: 'FORMULAIRE_INSCRIPTION',
        label: 'Formulaire d\'inscription',
        icon: 'UserPlus',
        description: 'Formulaire d\'inscription aux programmes'
      },
      {
        value: 'FORMULAIRE_CANDIDATURE',
        label: 'Formulaire de candidature',
        icon: 'FileCheck',
        description: 'Formulaire de candidature aux projets'
      },
      {
        value: 'FORMULAIRE_DOSSIER_BENEFICIAIRE',
        label: 'Dossier bénéficiaire',
        icon: 'FolderOpen',
        description: 'Formulaire de constitution du dossier bénéficiaire'
      },
      {
        value: 'FORMULAIRE_CONTRAT',
        label: 'Formulaire de contrat',
        icon: 'FileSignature',
        description: 'Formulaire de contrat d\'accompagnement'
      },
      {
        value: 'FORMULAIRE_ELIGIBILITE_PROGRAMME',
        label: 'Éligibilité programme',
        icon: 'CheckCircle',
        description: 'Critères d\'éligibilité pour les programmes',
        contexte_utilisation: ['PROGRAMME']
      },
      {
        value: 'FORMULAIRE_ELIGIBILITE_PROJET',
        label: 'Éligibilité projet',
        icon: 'Target',
        description: 'Critères d\'éligibilité pour les projets',
        contexte_utilisation: ['PROJET']
      },
      {
        value: 'FORMULAIRE_INSCRIPTION',
        label: 'Formulaire d\'inscription',
        icon: 'UserPlus',
        description: 'Formulaire d\'inscription aux programmes',
        contexte_utilisation: ['PROGRAMME']
      },
      {
        value: 'FORMULAIRE_CANDIDATURE',
        label: 'Formulaire de candidature',
        icon: 'FileCheck',
        description: 'Formulaire de candidature aux projets',
        contexte_utilisation: ['PROJET']
      }
    ]
  },
  FICHES_DIAGNOSTIC: {
    label: 'Fiches de diagnostic',
    icon: 'ClipboardCheck',
    color: '#f59e0b',
    description: 'Diagnostics multi-domaines pour évaluer les besoins et compétences',
    types: [
      {
        value: 'FICHE_DIAGNOSTIC_ENTREPRENEURIAT',
        label: 'Diagnostic Entrepreneuriat',
        icon: 'Briefcase',
        description: 'Diagnostic complet entrepreneuriat (réglementaire, financier, marketing, organisationnel, digital)',
        contexte_utilisation: ['PROGRAMME', 'PROJET']
      },
      {
        value: 'FICHE_DIAGNOSTIC_FORMATION',
        label: 'Diagnostic Formation',
        icon: 'GraduationCap',
        description: 'Diagnostic des besoins en formation',
        contexte_utilisation: ['PROGRAMME', 'PROJET']
      },
      {
        value: 'FICHE_DIAGNOSTIC_COMPETENCES',
        label: 'Diagnostic Compétences',
        icon: 'Award',
        description: 'Évaluation des compétences et savoir-faire'
      },
      {
        value: 'FICHE_DIAGNOSTIC_ORGANISATIONNEL',
        label: 'Diagnostic Organisationnel',
        icon: 'Building',
        description: 'Évaluation de la structure organisationnelle'
      },
      {
        value: 'FICHE_DIAGNOSTIC_FINANCIER',
        label: 'Diagnostic Financier',
        icon: 'DollarSign',
        description: 'Analyse de la situation financière'
      },
      {
        value: 'FICHE_DIAGNOSTIC_MARKETING',
        label: 'Diagnostic Marketing',
        icon: 'TrendingUp',
        description: 'Évaluation des capacités marketing et commerciales'
      },
      {
        value: 'FICHE_DIAGNOSTIC_DIGITAL',
        label: 'Diagnostic Digital',
        icon: 'Smartphone',
        description: 'Évaluation de la maturité digitale'
      }
    ]
  },
  QUESTIONNAIRES: {
    label: 'Questionnaires & Quiz',
    icon: 'HelpCircle',
    color: '#8b5cf6',
    description: 'Questionnaires d\'évaluation, quiz de validation et auto-évaluations',
    types: [
      {
        value: 'QUESTIONNAIRE_VALIDATION_COMPETENCES',
        label: 'Validation Compétences',
        icon: 'CheckSquare',
        description: 'Questionnaire de validation des compétences acquises'
      },
      {
        value: 'QUIZ_FORMATION',
        label: 'Quiz Formation',
        icon: 'BookOpen',
        description: 'Quiz d\'évaluation des connaissances en formation'
      },
      {
        value: 'QUESTIONNAIRE_EVALUATION',
        label: 'Questionnaire d\'évaluation',
        icon: 'ClipboardList',
        description: 'Questionnaire général d\'évaluation'
      },
      {
        value: 'QUESTIONNAIRE_AUTO_EVALUATION',
        label: 'Auto-évaluation',
        icon: 'UserCheck',
        description: 'Questionnaire d\'auto-évaluation des compétences'
      }
    ]
  },
  RECUEILS_BESOINS: {
    label: 'Recueils de besoins',
    icon: 'MessageSquare',
    color: '#ec4899',
    description: 'Formulaires pour identifier et analyser les besoins spécifiques',
    types: [
      {
        value: 'RECUEIL_BESOINS_ENTREPRENEUR',
        label: 'Recueil Besoins Entrepreneur',
        icon: 'User',
        description: 'Identification des besoins de l\'entrepreneur (multi-domaines)',
        contexte_utilisation: ['PROGRAMME', 'PROJET']
      },
      {
        value: 'RECUEIL_BESOINS_FORMATION',
        label: 'Recueil Besoins Formation',
        icon: 'GraduationCap',
        description: 'Identification des besoins en formation',
        contexte_utilisation: ['PROGRAMME', 'PROJET']
      },
      {
        value: 'RECUEIL_BESOINS_ACCOMPAGNEMENT',
        label: 'Recueil Besoins Accompagnement',
        icon: 'HandHeart',
        description: 'Identification des besoins en accompagnement',
        contexte_utilisation: ['PROGRAMME', 'PROJET']
      }
    ]
  },
  CONFIGURATION: {
    label: 'Configuration avancée',
    icon: 'Settings',
    color: '#64748b',
    description: 'Paramètres et configurations avancées du système',
    types: [
      {
        value: 'CRITERE_ELIGIBILITE',
        label: 'Critères d\'éligibilité',
        icon: 'CheckSquare',
        description: 'Critères réutilisables pour l\'éligibilité'
      },
      {
        value: 'WORKFLOW_CANDIDATURE',
        label: 'Workflows candidature',
        icon: 'ArrowRight',
        description: 'Définition des workflows de traitement des candidatures'
      },
      {
        value: 'CHAMP_FORMULAIRE',
        label: 'Champs de formulaire',
        icon: 'List',
        description: 'Champs réutilisables pour les formulaires'
      }
    ]
  }
}

// Fonction utilitaire pour obtenir les métadonnées d'un type
export const getReferentielMetadata = (type) => {
  for (const category of Object.values(REFERENTIEL_CATEGORIES)) {
    const found = category.types.find(t => t.value === type)
    if (found) {
      return {
        ...found,
        category: category.label,
        categoryColor: category.color,
        categoryIcon: category.icon
      }
    }
  }
  return {
    value: type,
    label: type,
    icon: 'FileText',
    description: 'Type de référentiel',
    category: 'Autre',
    categoryColor: '#64748b',
    categoryIcon: 'FileText'
  }
}

// Fonction pour obtenir tous les types d'une catégorie
export const getTypesByCategory = (categoryKey) => {
  return REFERENTIEL_CATEGORIES[categoryKey]?.types.map(t => t.value) || []
}

// Fonction pour obtenir tous les types
export const getAllReferentielTypes = () => {
  return Object.values(REFERENTIEL_CATEGORIES).flatMap(cat => cat.types.map(t => t.value))
}
