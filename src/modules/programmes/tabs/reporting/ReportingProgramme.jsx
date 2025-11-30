import { useState, useEffect } from 'react'
import { programmesService } from '@/services/programmes.service'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { Select } from '@/components/common/Select'
import { exportToExcel, exportToPdf } from '@/utils/exportUtils'
import { toast } from '@/components/common/Toast'
import { formatDate, formatCurrency } from '@/utils/format'
import { logger } from '@/utils/logger'
import './ReportingProgramme.css'

export default function ReportingProgramme() {
  const [programmes, setProgrammes] = useState([])
  const [selectedProgramme, setSelectedProgramme] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const { data, error } = await programmesService.getAll()
      if (error) {
        logger.error('REPORTING_PROGRAMME', 'Erreur chargement données', error)
        toast.error('Erreur lors du chargement des programmes')
        return
      }
      setProgrammes(data || [])
    } catch (error) {
      logger.error('REPORTING_PROGRAMME', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  const generateExcelReport = () => {
    try {
      const dataToExport = programmes.map(prog => ({
        'Code': prog.code || '-',
        'Nom': prog.nom || '-',
        'Type': prog.type || '-',
        'Statut': prog.statut || '-',
        'Date début': prog.date_debut ? formatDate(prog.date_debut) : '-',
        'Date fin': prog.date_fin ? formatDate(prog.date_fin) : '-',
        'Budget': prog.budget ? formatCurrency(prog.budget) : '-',
        'Budget consommé': prog.budget_consomme ? formatCurrency(prog.budget_consomme) : '-',
        'Description': prog.description || '-',
      }))

      exportToExcel(dataToExport, `rapport_programmes_${new Date().toISOString().split('T')[0]}`, 'Programmes')
      toast.success('Rapport Excel généré avec succès')
    } catch (error) {
      logger.error('REPORTING_PROGRAMME', 'Erreur génération Excel', error)
      toast.error('Erreur lors de la génération du rapport Excel')
    }
  }

  const generatePdfReport = () => {
    try {
      const dataToExport = programmes.map(prog => ({
        'Code': prog.code || '-',
        'Nom': prog.nom || '-',
        'Type': prog.type || '-',
        'Statut': prog.statut || '-',
        'Date début': prog.date_debut ? formatDate(prog.date_debut) : '-',
        'Date fin': prog.date_fin ? formatDate(prog.date_fin) : '-',
        'Budget': prog.budget ? formatCurrency(prog.budget) : '-',
        'Budget consommé': prog.budget_consomme ? formatCurrency(prog.budget_consomme) : '-',
      }))

      exportToPdf(dataToExport, 'Rapport Programmes', `rapport_programmes_${new Date().toISOString().split('T')[0]}`)
      toast.success('Rapport PDF généré avec succès')
    } catch (error) {
      logger.error('REPORTING_PROGRAMME', 'Erreur génération PDF', error)
      toast.error('Erreur lors de la génération du rapport PDF')
    }
  }

  const generateProgrammeDetailReport = async (programmeId) => {
    try {
      const { data: programme } = await programmesService.getById(programmeId)
      if (!programme) {
        toast.error('Programme non trouvé')
        return
      }

      const dataToExport = [{
        'Nom': programme.nom || '-',
        'Code': programme.code || '-',
        'Type': programme.type || '-',
        'Statut': programme.statut || '-',
        'Date début': programme.date_debut ? formatDate(programme.date_debut) : '-',
        'Date fin': programme.date_fin ? formatDate(programme.date_fin) : '-',
        'Budget total': programme.budget ? formatCurrency(programme.budget) : '-',
        'Budget consommé': programme.budget_consomme ? formatCurrency(programme.budget_consomme) : '-',
        'Description': programme.description || '-',
      }]

      exportToExcel(dataToExport, `rapport_programme_${programme.code || programme.id}_${new Date().toISOString().split('T')[0]}`, programme.nom)
      toast.success('Rapport détaillé généré avec succès')
    } catch (error) {
      logger.error('REPORTING_PROGRAMME', 'Erreur génération rapport détaillé', error)
      toast.error('Erreur lors de la génération du rapport détaillé')
    }
  }

  if (loading) return <LoadingState />

  return (
    <div className="reporting-programme">
      <div className="reporting-header">
        <h2>Rapports par Programme</h2>
      </div>

      <div className="reporting-content">
        <div className="rapports-actions">
          <Button variant="primary" onClick={generateExcelReport} disabled={programmes.length === 0}>
            <Icon name="FileText" size={16} />
            Générer rapport Excel (Tous)
          </Button>
          <Button variant="secondary" onClick={generatePdfReport} disabled={programmes.length === 0}>
            <Icon name="File" size={16} />
            Générer rapport PDF (Tous)
          </Button>
        </div>

        {programmes.length === 0 ? (
          <EmptyState icon="FileText" title="Aucun programme" message="Aucun rapport à générer" />
        ) : (
          <>
            <div className="rapports-filters">
              <Select
                label="Rapport pour un programme spécifique"
                value={selectedProgramme}
                onChange={(e) => setSelectedProgramme(e.target.value)}
                options={[
                  { value: '', label: '-- Tous les programmes --' },
                  ...programmes.map(p => ({ value: p.id, label: p.nom }))
                ]}
              />
              {selectedProgramme && (
                <Button variant="outline" onClick={() => generateProgrammeDetailReport(selectedProgramme)}>
                  <Icon name="FileText" size={16} />
                  Rapport détaillé (Excel)
                </Button>
              )}
            </div>

            <div className="rapports-info">
              <p>
                <strong>{programmes.length}</strong> programme(s) disponible(s) pour génération de rapports.
              </p>
              <p className="info-text">
                Les rapports Excel contiennent toutes les données des programmes sélectionnés.
                Les rapports PDF sont optimisés pour l'impression.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

