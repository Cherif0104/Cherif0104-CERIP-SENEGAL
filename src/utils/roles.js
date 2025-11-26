export const ROLE_THEMES = {
  'ADMIN_SERIP': 'serip',
  'CHEF_PROJET': 'chef-projet',
  'MENTOR': 'mentor',
  'FORMATEUR': 'formateur',
  'COACH': 'coach'
}

export const ROLE_LABELS = {
  'ADMIN_SERIP': 'Administrateur SERIP-CAS',
  'CHEF_PROJET': 'Chef de Projet',
  'MENTOR': 'Mentor',
  'FORMATEUR': 'Formateur',
  'COACH': 'Coach'
}

export function getThemeFromRole(role) {
  return ROLE_THEMES[role] || 'serip'
}

export function getLabelFromRole(role) {
  return ROLE_LABELS[role] || 'Espace Utilisateur'
}

