// Référentiel modulable des types d'activités SERIP-CAS
// Permet d'ajouter dynamiquement de nouveaux types de formations/accompagnements

export const TYPES_ACTIVITES = {
  ENTREPRENEURIAT: {
    id: 'ENTREPRENEURIAT',
    label: 'Entrepreneuriat',
    description: 'Formation et accompagnement à la création d\'entreprise',
    categories: [
      'Création d\'entreprise',
      'Gestion d\'entreprise',
      'Marketing & Communication',
      'Finance & Comptabilité',
      'Management',
      'Business Plan',
      'Stratégie commerciale'
    ],
    icon: '💼',
    color: '#3b82f6'
  },
  ENERGIE_VERTE: {
    id: 'ENERGIE_VERTE',
    label: 'Énergie Verte',
    description: 'Formation dans les énergies renouvelables et durables',
    categories: [
      'Solaire',
      'Éolien',
      'Biomasse',
      'Efficacité énergétique',
      'Installation panneaux solaires',
      'Maintenance énergies renouvelables'
    ],
    icon: '🌱',
    color: '#10b981'
  },
  DIGITAL: {
    id: 'DIGITAL',
    label: 'Digital & Technologies',
    description: 'Formation aux technologies numériques',
    categories: [
      'Développement Web',
      'Développement Mobile',
      'Design Graphique',
      'Marketing Digital',
      'E-commerce',
      'Infographie',
      'Montage vidéo',
      'Community Management',
      'Référencement SEO',
      'Cybersécurité'
    ],
    icon: '💻',
    color: '#8b5cf6'
  },
  RESTAURATION: {
    id: 'RESTAURATION',
    label: 'Restauration & Hôtellerie',
    description: 'Formation en restauration et hôtellerie',
    categories: [
      'Cuisine',
      'Service en salle',
      'Gestion de restaurant',
      'Pâtisserie',
      'Boulangerie',
      'Traiteur',
      'Réception hôtelière',
      'Bar & Mixologie'
    ],
    icon: '🍽️',
    color: '#f59e0b'
  },
  ARTISANAT: {
    id: 'ARTISANAT',
    label: 'Artisanat',
    description: 'Formation aux métiers de l\'artisanat',
    categories: [
      'Menuiserie',
      'Couture',
      'Poterie',
      'Bijouterie',
      'Tissage',
      'Tannerie',
      'Sculpture',
      'Maroquinerie',
      'Broderie',
      'Vannerie'
    ],
    icon: '🔨',
    color: '#ef4444'
  },
  AGRICULTURE: {
    id: 'AGRICULTURE',
    label: 'Agriculture & Élevage',
    description: 'Formation en agriculture et élevage',
    categories: [
      'Agriculture durable',
      'Élevage',
      'Transformation agroalimentaire',
      'Commercialisation',
      'Apiculture',
      'Pisciculture',
      'Maraîchage',
      'Arboriculture',
      'Gestion des ressources naturelles'
    ],
    icon: '🌾',
    color: '#84cc16'
  },
  SANTE: {
    id: 'SANTE',
    label: 'Santé & Bien-être',
    description: 'Formation dans le domaine de la santé',
    categories: [
      'Aide-soignant',
      'Infirmier',
      'Sage-femme',
      'Hygiène & Salubrité',
      'Premiers secours',
      'Nutrition',
      'Médecine traditionnelle',
      'Pharmacie communautaire'
    ],
    icon: '🏥',
    color: '#ec4899'
  },
  EDUCATION: {
    id: 'EDUCATION',
    label: 'Éducation & Formation',
    description: 'Formation dans le domaine éducatif',
    categories: [
      'Enseignement primaire',
      'Enseignement secondaire',
      'Alphabétisation',
      'Formation professionnelle',
      'Animation socio-éducative',
      'Garde d\'enfants',
      'Soutien scolaire'
    ],
    icon: '📚',
    color: '#06b6d4'
  },
  BTP: {
    id: 'BTP',
    label: 'Bâtiment & Travaux Publics',
    description: 'Formation dans le bâtiment et travaux publics',
    categories: [
      'Maçonnerie',
      'Plomberie',
      'Électricité',
      'Peinture',
      'Carrelage',
      'Menuiserie BTP',
      'Charpenterie',
      'Couverture',
      'Isolation',
      'Énergétique du bâtiment'
    ],
    icon: '🏗️',
    color: '#f97316'
  },
  TRANSPORT: {
    id: 'TRANSPORT',
    label: 'Transport & Logistique',
    description: 'Formation dans le transport et la logistique',
    categories: [
      'Conduite de véhicules',
      'Transport de marchandises',
      'Transport de personnes',
      'Logistique',
      'Manutention',
      'Mécanique automobile',
      'Maintenance véhicules'
    ],
    icon: '🚚',
    color: '#6366f1'
  },
  COMMERCE: {
    id: 'COMMERCE',
    label: 'Commerce & Vente',
    description: 'Formation en commerce et vente',
    categories: [
      'Vente au détail',
      'Vente en gros',
      'Commerce ambulant',
      'Gestion de magasin',
      'Négociation commerciale',
      'Relation client',
      'E-commerce',
      'Commerce international'
    ],
    icon: '🛒',
    color: '#14b8a6'
  },
  BEAUTE: {
    id: 'BEAUTE',
    label: 'Beauté & Esthétique',
    description: 'Formation en beauté et esthétique',
    categories: [
      'Coiffure',
      'Maquillage',
      'Soins du visage',
      'Soins du corps',
      'Manucure & Pédicure',
      'Épilation',
      'Massage bien-être',
      'Barbier'
    ],
    icon: '💅',
    color: '#a855f7'
  },
  TEXTILE: {
    id: 'TEXTILE',
    label: 'Textile & Mode',
    description: 'Formation dans le textile et la mode',
    categories: [
      'Couture',
      'Confection',
      'Design de mode',
      'Teinture',
      'Broderie',
      'Sérigraphie',
      'Modélisme',
      'Stylisme'
    ],
    icon: '👗',
    color: '#f43f5e'
  },
  TOURISME: {
    id: 'TOURISME',
    label: 'Tourisme & Animation',
    description: 'Formation dans le tourisme et l\'animation',
    categories: [
      'Guide touristique',
      'Animation culturelle',
      'Accueil touristique',
      'Organisation d\'événements',
      'Gestion d\'hébergement',
      'Agence de voyage',
      'Écotourisme'
    ],
    icon: '✈️',
    color: '#0ea5e9'
  },
  FINANCE: {
    id: 'FINANCE',
    label: 'Finance & Microfinance',
    description: 'Formation en finance et microfinance',
    categories: [
      'Gestion financière',
      'Comptabilité',
      'Microfinance',
      'Épargne & Crédit',
      'Banque',
      'Assurance',
      'Analyse financière'
    ],
    icon: '💰',
    color: '#22c55e'
  },
  ENVIRONNEMENT: {
    id: 'ENVIRONNEMENT',
    label: 'Environnement & Développement Durable',
    description: 'Formation en environnement et développement durable',
    categories: [
      'Gestion des déchets',
      'Recyclage',
      'Protection de l\'environnement',
      'Énergies renouvelables',
      'Agriculture biologique',
      'Éco-construction',
      'Sensibilisation environnementale'
    ],
    icon: '🌍',
    color: '#10b981'
  },
  MEDIA: {
    id: 'MEDIA',
    label: 'Médias & Communication',
    description: 'Formation dans les médias et la communication',
    categories: [
      'Journalisme',
      'Radio',
      'Télévision',
      'Photographie',
      'Vidéographie',
      'Communication',
      'Relations publiques',
      'Production audiovisuelle'
    ],
    icon: '📺',
    color: '#8b5cf6'
  },
  SPORT: {
    id: 'SPORT',
    label: 'Sport & Animation',
    description: 'Formation dans le sport et l\'animation',
    categories: [
      'Éducation physique',
      'Animation sportive',
      'Coaching sportif',
      'Gestion d\'équipements sportifs',
      'Organisation d\'événements sportifs',
      'Kinésithérapie sportive'
    ],
    icon: '⚽',
    color: '#f59e0b'
  },
  SECURITE: {
    id: 'SECURITE',
    label: 'Sécurité & Protection',
    description: 'Formation en sécurité et protection',
    categories: [
      'Agent de sécurité',
      'Sécurité incendie',
      'Sécurité routière',
      'Protection civile',
      'Sécurité privée',
      'Garde du corps'
    ],
    icon: '🛡️',
    color: '#ef4444'
  },
  METIERS_SERVICE: {
    id: 'METIERS_SERVICE',
    label: 'Métiers de Service',
    description: 'Formation dans les métiers de service',
    categories: [
      'Service à la personne',
      'Aide à domicile',
      'Ménage & Nettoyage',
      'Blanchisserie',
      'Repassage',
      'Jardinage',
      'Bricolage',
      'Livraison'
    ],
    icon: '🧹',
    color: '#64748b'
  },
  INNOVATION: {
    id: 'INNOVATION',
    label: 'Innovation & Recherche',
    description: 'Formation en innovation et recherche',
    categories: [
      'Innovation technologique',
      'Recherche & Développement',
      'Transfert de technologie',
      'Innovation sociale',
      'Fab Lab',
      'Impression 3D',
      'Robotique'
    ],
    icon: '🔬',
    color: '#6366f1'
  },
  CULTURE: {
    id: 'CULTURE',
    label: 'Culture & Arts',
    description: 'Formation dans la culture et les arts',
    categories: [
      'Musique',
      'Danse',
      'Théâtre',
      'Arts plastiques',
      'Cinéma',
      'Littérature',
      'Patrimoine culturel',
      'Animation culturelle'
    ],
    icon: '🎭',
    color: '#ec4899'
  },
  AUTRE: {
    id: 'AUTRE',
    label: 'Autre',
    description: 'Autre type d\'activité non listé',
    categories: [],
    icon: '📋',
    color: '#6b7280'
  }
}

// Fonction pour ajouter un nouveau type d'activité dynamiquement
export function addTypeActivite(type) {
  if (type.id && type.label) {
    TYPES_ACTIVITES[type.id] = type
    return true
  }
  return false
}

// Fonction pour récupérer tous les types
export function getAllTypes() {
  return Object.values(TYPES_ACTIVITES)
}

// Fonction pour récupérer un type par ID
export function getTypeById(id) {
  return TYPES_ACTIVITES[id] || null
}

// Fonction pour rechercher des types par mot-clé
export function searchTypes(keyword) {
  const lowerKeyword = keyword.toLowerCase()
  return getAllTypes().filter(type =>
    type.label.toLowerCase().includes(lowerKeyword) ||
    type.description.toLowerCase().includes(lowerKeyword) ||
    type.categories.some(cat => cat.toLowerCase().includes(lowerKeyword))
  )
}
