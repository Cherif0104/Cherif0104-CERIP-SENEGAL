export const generateCode = (prefix, id) => {
  const paddedId = String(id).padStart(4, '0')
  return `${prefix}-${paddedId}`
}

export const STATUTS_PROGRAMME = [
  'BROUILLON',
  'PLANIFIÉ',
  'OUVERT',
  'EN_COURS',
  'FERMÉ',
  'ARCHIVÉ',
  'EN_PREPARATION',
  'ACTIF',
  'TERMINE',
  'SUSPENDU',
]

export const STATUTS_PROJET = [
  'PLANIFIE',
  'EN_COURS',
  'TERMINE',
  'ANNULE',
]

export const STATUTS_CANDIDAT = [
  'NOUVEAU',
  'EN_EVALUATION',
  'ÉLIGIBLE',
  'NON_ÉLIGIBLE',
  'CONVERTI',
]

export const STATUTS_BENEFICIAIRE = [
  'ACTIF',
  'INACTIF',
  'TERMINE',
  'SUSPENDU',
]

export const TYPES_INTERVENANT = [
  'Mentor',
  'Formateur',
  'Coach',
]

