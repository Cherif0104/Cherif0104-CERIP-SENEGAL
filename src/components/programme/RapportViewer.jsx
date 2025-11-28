import { useState } from 'react'
import { rapportGeneratorService } from '../../services/rapport-generator.service'
import { toastService } from '../../services/toast.service'
import Icon from '../common/Icon'
import './ProgrammeComponents.css'

export default function RapportViewer({ rapport, programme, onClose }) {
  const [generating, setGenerating] = useState(false)

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const handleExportPDF = async () => {
    setGenerating(true)
    try {
      const template = {
        header: {
          title: rapport.titre || `Rapport ${rapport.type}`,
          subtitle: `${programme?.nom || 'Programme'} - ${formatDate(rapport.periode_debut)} au ${formatDate(rapport.periode_fin)}`
        },
        sections: [
          {
            title: 'Informations générales',
            type: 'summary',
            summary: {
              items: [
                { label: 'Programme', path: 'programme.nom' },
                { label: 'Période', value: `${formatDate(rapport.periode_debut)} - ${formatDate(rapport.periode_fin)}` },
                { label: 'Type', value: rapport.type }
              ]
            }
          }
        ],
        footer: `Généré le ${new Date().toLocaleDateString('fr-FR')}`
      }

      const data = {
        programme: programme || {},
        rapport: rapport
      }

      const doc = await rapportGeneratorService.generatePDF(template, data)
      const filename = `${rapport.titre || `rapport-${rapport.type}`}-${rapport.periode_debut}.pdf`
      rapportGeneratorService.downloadPDF(doc, filename)
      toastService.success('PDF généré avec succès')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toastService.error('Erreur lors de la génération du PDF')
    } finally {
      setGenerating(false)
    }
  }

  const handleExportExcel = async () => {
    setGenerating(true)
    try {
      const template = {
        header: {
          title: rapport.titre || `Rapport ${rapport.type}`,
          subtitle: `${programme?.nom || 'Programme'}`
        },
        sections: [
          {
            title: 'Informations',
            type: 'summary',
            summary: {
              items: [
                { label: 'Programme', path: 'programme.nom' },
                { label: 'Période début', value: formatDate(rapport.periode_debut) },
                { label: 'Période fin', value: formatDate(rapport.periode_fin) },
                { label: 'Type', value: rapport.type },
                { label: 'Statut', value: rapport.statut }
              ]
            }
          }
        ]
      }

      const data = {
        programme: programme || {},
        rapport: rapport
      }

      const workbook = await rapportGeneratorService.generateExcel(template, data)
      const filename = `${rapport.titre || `rapport-${rapport.type}`}-${rapport.periode_debut}.xlsx`
      rapportGeneratorService.downloadExcel(workbook, filename)
      toastService.success('Excel généré avec succès')
    } catch (error) {
      console.error('Error generating Excel:', error)
      toastService.error('Erreur lors de la génération de l\'Excel')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content--large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>{rapport.titre || `Rapport ${rapport.type}`}</h3>
            <p className="modal-subtitle">
              {formatDate(rapport.periode_debut)} - {formatDate(rapport.periode_fin)}
            </p>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="rapport-viewer">
            <div className="rapport-viewer-header">
              <div className="rapport-info">
                <div className="info-row">
                  <strong>Type:</strong> {rapport.type}
                </div>
                <div className="info-row">
                  <strong>Statut:</strong> {rapport.statut}
                </div>
                {rapport.description && (
                  <div className="info-row">
                    <strong>Description:</strong> {rapport.description}
                  </div>
                )}
              </div>

              <div className="rapport-export-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleExportPDF}
                  disabled={generating}
                >
                  <Icon name="FileDown" size={16} />
                  Exporter PDF
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleExportExcel}
                  disabled={generating}
                >
                  <Icon name="FileSpreadsheet" size={16} />
                  Exporter Excel
                </button>
              </div>
            </div>

            <div className="rapport-content">
              {rapport.contenu && Object.keys(rapport.contenu).length > 0 ? (
                <div className="rapport-content-data">
                  <h4>Contenu du rapport</h4>
                  <pre>{JSON.stringify(rapport.contenu, null, 2)}</pre>
                </div>
              ) : (
                <div className="empty-state">
                  <Icon name="FileText" size={32} />
                  <p>Le contenu du rapport n'est pas encore disponible</p>
                  <p className="text-muted">Utilisez le constructeur pour générer le contenu</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

