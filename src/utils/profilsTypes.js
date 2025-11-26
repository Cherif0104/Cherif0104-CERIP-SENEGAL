// Types de profils partagés entre Candidats et Bénéficiaires
// Organisation des types de profils par catégories pour faciliter la sélection

export const TYPES_PROFIL_BY_CATEGORY = {
  individus: [
    'Individu',
    'Étudiant',
    'Étudiant en recherche d\'emploi',
    'Étudiant entrepreneur',
    'Chômeur',
    'Chômeur en reconversion',
    'Demandeur d\'emploi',
    'Femme au foyer',
    'Femme entrepreneure',
    'Jeune diplômé',
    'Jeune sans qualification',
    'Retraité',
    'Personne en situation de handicap',
    'Personne vulnérable',
    'Migrant/Refugié'
  ],
  entrepreneurs: [
    'Entrepreneur',
    'Micro-entrepreneur',
    'Auto-entrepreneur',
    'Porteur de projet',
    'Créateur d\'entreprise',
    'Repreneur d\'entreprise',
    'Artisan',
    'Commerçant',
    'Commerçant ambulant',
    'Vendeur',
    'Prestataire de services',
    'Consultant indépendant',
    'Freelance'
  ],
  secteurs: [
    'Agriculteur',
    'Éleveur',
    'Pêcheur',
    'Ouvrier agricole',
    'Ouvrier',
    'Ouvrier qualifié',
    'Technicien',
    'Technicien spécialisé'
  ],
  professionnels: [
    'Professionnel',
    'Cadre',
    'Manager',
    'Dirigeant',
    'Chef d\'entreprise'
  ],
  organisations: [
    'Entreprise',
    'PME',
    'TPE',
    'Startup',
    'Coopérative',
    'Organisation',
    'Association',
    'ONG',
    'GIE (Groupement d\'Intérêt Économique)',
    'Mutuelle',
    'Fondation'
  ],
  autres: [
    'Autre',
    'Non spécifié'
  ]
}

// Liste plate pour compatibilité
export const TYPES_PROFIL = Object.values(TYPES_PROFIL_BY_CATEGORY).flat()

// Fonction utilitaire pour obtenir la catégorie d'un type de profil
export function getProfilCategory(typeProfil) {
  if (!typeProfil) return 'autres'
  
  for (const [category, types] of Object.entries(TYPES_PROFIL_BY_CATEGORY)) {
    if (types.includes(typeProfil)) {
      return category
    }
  }
  return 'autres'
}

// Fonction pour vérifier si un type est un individu
export function isIndividu(typeProfil) {
  return TYPES_PROFIL_BY_CATEGORY.individus.includes(typeProfil)
}

// Fonction pour vérifier si un type est une entreprise/organisation
export function isOrganisation(typeProfil) {
  return TYPES_PROFIL_BY_CATEGORY.organisations.includes(typeProfil) ||
         typeProfil === 'Entreprise' ||
         typeProfil === 'PME' ||
         typeProfil === 'TPE' ||
         typeProfil === 'Startup'
}

// Fonction pour vérifier si un type est un entrepreneur
export function isEntrepreneur(typeProfil) {
  return TYPES_PROFIL_BY_CATEGORY.entrepreneurs.includes(typeProfil)
}




