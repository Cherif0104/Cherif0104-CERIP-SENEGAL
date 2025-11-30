/**
 * Utilitaires pour l'export de données (Excel, PDF)
 */

/**
 * Convertir un tableau de données en format Excel (CSV pour l'instant)
 */
export const exportToExcel = (data, filename = 'export.xlsx') => {
  if (!data || data.length === 0) {
    alert('Aucune donnée à exporter')
    return
  }

  // Récupérer les colonnes depuis le premier objet
  const columns = Object.keys(data[0])

  // Créer le header CSV
  const header = columns.join(',') + '\n'

  // Créer les lignes de données
  const rows = data
    .map((row) => {
      return columns
        .map((col) => {
          const value = row[col]
          // Gérer les valeurs null/undefined et échapper les virgules
          if (value === null || value === undefined) return ''
          const stringValue = String(value).replace(/"/g, '""')
          return `"${stringValue}"`
        })
        .join(',')
    })
    .join('\n')

  const csv = header + rows

  // Créer un blob et télécharger
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename.replace('.xlsx', '.csv'))
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Formater des données pour l'affichage dans un tableau
 */
export const formatDataForExport = (data, columns) => {
  if (!data || data.length === 0) return []

  return data.map((row) => {
    const formattedRow = {}
    columns.forEach((col) => {
      const value = row[col.key]
      formattedRow[col.label || col.key] = col.format ? col.format(value, row) : value || ''
    })
    return formattedRow
  })
}

/**
 * Générer un PDF simple (version basique)
 */
export const exportToPDF = (title, content, filename = 'rapport.pdf') => {
  // Pour une vraie implémentation PDF, utiliser jsPDF ou html2canvas
  // Pour l'instant, on ouvre une nouvelle fenêtre avec le contenu HTML
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1e3a8a; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${content}
      </body>
    </html>
  `

  const printWindow = window.open('', '_blank')
  printWindow.document.write(htmlContent)
  printWindow.document.close()
  printWindow.print()
}

/**
 * Exporter des données en PDF (format tableau)
 * @param {Array} data - Données à exporter (array d'objets)
 * @param {string} title - Titre du rapport
 * @param {string} filename - Nom du fichier
 */
export const exportToPdf = (data, title, filename = 'rapport.pdf') => {
  if (!data || data.length === 0) {
    alert('Aucune donnée à exporter')
    return
  }

  // Créer le contenu HTML du tableau
  const columns = Object.keys(data[0])
  
  const tableHeader = `
    <table>
      <thead>
        <tr>
          ${columns.map(col => `<th>${col}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${data.map(row => `
          <tr>
            ${columns.map(col => `<td>${row[col] || ''}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `

  // Utiliser exportToPDF avec le tableau
  exportToPDF(title, tableHeader, filename)
}

