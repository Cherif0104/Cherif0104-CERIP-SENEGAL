/**
 * Utilitaires pour l'export de données
 */

/**
 * Exporte des données en CSV
 * @param {Array} data - Tableau d'objets à exporter
 * @param {string} filename - Nom du fichier (avec extension .csv)
 */
export function exportCSV(data, filename = 'export.csv') {
  if (!data || data.length === 0) {
    throw new Error('Aucune donnée à exporter')
  }

  // Obtenir les clés (colonnes) du premier objet
  const headers = Object.keys(data[0])

  // Créer la ligne d'en-tête
  const headerRow = headers.map(h => `"${h}"`).join(',')

  // Créer les lignes de données
  const dataRows = data.map(row => {
    return headers.map(header => {
      const value = row[header]
      // Échapper les guillemets et les virgules
      if (value === null || value === undefined) {
        return '""'
      }
      const stringValue = String(value).replace(/"/g, '""')
      return `"${stringValue}"`
    }).join(',')
  })

  // Combiner tout
  const csvContent = [headerRow, ...dataRows].join('\n')

  // Créer un blob et télécharger
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * Exporte des données en Excel (format CSV avec extension .xlsx)
 * Note: Pour un vrai export Excel, utiliser une bibliothèque comme xlsx
 * @param {Array} data - Tableau d'objets à exporter
 * @param {string} filename - Nom du fichier
 */
export function exportExcel(data, filename = 'export.xlsx') {
  // Pour l'instant, on utilise CSV avec extension .xlsx
  // Pour un vrai export Excel, utiliser xlsx library
  exportCSV(data, filename.replace('.xlsx', '.csv'))
}

/**
 * Formate une date pour l'export
 * @param {string|Date} date - Date à formater
 * @returns {string} Date formatée
 */
export function formatDateForExport(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
