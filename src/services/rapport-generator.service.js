// Service de génération de rapports (PDF/Excel)
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

export const rapportGeneratorService = {
  /**
   * Génère un rapport PDF à partir d'un template et de données
   */
  async generatePDF(template, data, options = {}) {
    try {
      const doc = new jsPDF({
        orientation: options.orientation || 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // En-tête
      if (template.header) {
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text(template.header.title || 'Rapport', 105, 20, { align: 'center' })
        
        if (template.header.subtitle) {
          doc.setFontSize(12)
          doc.setFont('helvetica', 'normal')
          doc.text(template.header.subtitle, 105, 28, { align: 'center' })
        }
      }

      let yPosition = options.startY || 40

      // Sections du rapport
      if (template.sections) {
        template.sections.forEach((section, index) => {
          if (yPosition > 270) {
            doc.addPage()
            yPosition = 20
          }

          // Titre de section
          doc.setFontSize(14)
          doc.setFont('helvetica', 'bold')
          doc.text(section.title, 14, yPosition)
          yPosition += 8

          // Contenu de section
          if (section.type === 'text') {
            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            const text = this.replacePlaceholders(section.content, data)
            const lines = doc.splitTextToSize(text, 180)
            doc.text(lines, 14, yPosition)
            yPosition += lines.length * 5 + 5
          } else if (section.type === 'table') {
            const tableData = this.processTableData(section.table, data)
            doc.autoTable({
              startY: yPosition,
              head: tableData.headers,
              body: tableData.rows,
              styles: { fontSize: 9 },
              headStyles: { fillColor: [66, 139, 202] }
            })
            yPosition = doc.lastAutoTable.finalY + 10
          } else if (section.type === 'summary') {
            const summaryData = this.processSummaryData(section.summary, data)
            summaryData.forEach(item => {
              doc.setFontSize(10)
              doc.setFont('helvetica', 'bold')
              doc.text(item.label, 14, yPosition)
              doc.setFont('helvetica', 'normal')
              doc.text(item.value, 80, yPosition)
              yPosition += 7
            })
            yPosition += 5
          }
        })
      }

      // Pied de page
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(
          `Page ${i} sur ${pageCount}`,
          105,
          287,
          { align: 'center' }
        )
        if (template.footer) {
          doc.text(
            template.footer || '',
            105,
            292,
            { align: 'center' }
          )
        }
      }

      return doc
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw error
    }
  },

  /**
   * Génère un rapport Excel à partir d'un template et de données
   */
  async generateExcel(template, data, options = {}) {
    try {
      const workbook = XLSX.utils.book_new()

      // Créer une feuille par section ou une seule feuille
      if (template.sheets) {
        template.sheets.forEach(sheet => {
          const worksheet = this.createExcelSheet(sheet, data)
          XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name || 'Feuille1')
        })
      } else {
        // Feuille unique avec toutes les sections
        const worksheet = this.createExcelSheet(template, data)
        XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Rapport')
      }

      return workbook
    } catch (error) {
      console.error('Error generating Excel:', error)
      throw error
    }
  },

  /**
   * Crée une feuille Excel
   */
  createExcelSheet(sheet, data) {
    const rows = []

    // En-tête
    if (sheet.header) {
      rows.push([sheet.header.title || 'Rapport'])
      if (sheet.header.subtitle) {
        rows.push([sheet.header.subtitle])
      }
      rows.push([]) // Ligne vide
    }

    // Sections
    if (sheet.sections) {
      sheet.sections.forEach(section => {
        if (section.type === 'table') {
          const tableData = this.processTableData(section.table, data)
          rows.push([section.title])
          rows.push(tableData.headers)
          tableData.rows.forEach(row => rows.push(row))
          rows.push([]) // Ligne vide
        } else if (section.type === 'summary') {
          rows.push([section.title])
          const summaryData = this.processSummaryData(section.summary, data)
          summaryData.forEach(item => {
            rows.push([item.label, item.value])
          })
          rows.push([]) // Ligne vide
        }
      })
    }

    const worksheet = XLSX.utils.aoa_to_sheet(rows)
    return worksheet
  },

  /**
   * Remplace les placeholders dans un texte
   */
  replacePlaceholders(text, data) {
    if (!text) return ''
    return text.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
      const keys = path.split('.')
      let value = data
      for (const key of keys) {
        value = value?.[key]
        if (value === undefined) break
      }
      return value !== undefined ? String(value) : match
    })
  },

  /**
   * Traite les données d'un tableau
   */
  processTableData(tableConfig, data) {
    const headers = tableConfig.headers || []
    const rows = []

    if (tableConfig.dataPath) {
      const tableData = this.getNestedValue(data, tableConfig.dataPath) || []
      tableData.forEach(item => {
        const row = tableConfig.columns.map(col => {
          const value = this.getNestedValue(item, col.path)
          return this.formatValue(value, col.format)
        })
        rows.push(row)
      })
    }

    return { headers, rows }
  },

  /**
   * Traite les données d'un résumé
   */
  processSummaryData(summaryConfig, data) {
    return summaryConfig.items.map(item => ({
      label: item.label,
      value: this.formatValue(
        this.getNestedValue(data, item.path),
        item.format
      )
    }))
  },

  /**
   * Récupère une valeur imbriquée dans un objet
   */
  getNestedValue(obj, path) {
    if (!path) return null
    const keys = path.split('.')
    let value = obj
    for (const key of keys) {
      value = value?.[key]
      if (value === undefined) return null
    }
    return value
  },

  /**
   * Formate une valeur selon le format spécifié
   */
  formatValue(value, format) {
    if (value === null || value === undefined) return '-'

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'XOF',
          minimumFractionDigits: 0
        }).format(value)
      case 'number':
        return new Intl.NumberFormat('fr-FR').format(value)
      case 'percentage':
        return `${value.toFixed(1)}%`
      case 'date':
        return new Date(value).toLocaleDateString('fr-FR')
      default:
        return String(value)
    }
  },

  /**
   * Télécharge un PDF
   */
  downloadPDF(doc, filename) {
    doc.save(filename || 'rapport.pdf')
  },

  /**
   * Télécharge un Excel
   */
  downloadExcel(workbook, filename) {
    XLSX.writeFile(workbook, filename || 'rapport.xlsx')
  }
}

