export const ROLE_THEMES = {
  CERIP: 'cerip'
}

export const ROLE_LABELS = {
  CERIP: 'Espace CERIP'
}

export function getThemeFromRole(role) {
  return ROLE_THEMES[role] || 'cerip'
}

export function getLabelFromRole(role) {
  return ROLE_LABELS[role] || 'Espace CERIP'
}

