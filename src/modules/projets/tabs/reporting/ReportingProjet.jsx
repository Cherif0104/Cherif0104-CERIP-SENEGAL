import { useState, useEffect } from 'react'
import { projetsService } from '@/services/projets.service'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { Select } from '@/components/common/Select'
import { exportToExcel, exportToPdf } from '@/utils/exportUtils'
import { toast } from '@/components/common/Toast'
import { formatDate, formatCurrency } from '@/utils/format'
import { logger } from '@/utils/logger'
import './ReportingProjet.css'

export default function ReportingProjet() {
  const [projets, setProjets] = useState([])
  const [selectedProjet, setSelectedProjet] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const { data, error } = await projetsService.getAll()
      if (error) {
        logger.error('REPORTING_PROJET', 'Erreur chargement données', error)
        toast.error('Erreur lors du chargement des projets')
        return
      }
      setProjets(data || [])
    } catch (error) {
      logger.error('REPORTING_PROJET', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  const generateExcelReport = () => {
    try {
      const dataToExport = projets.map(proj => ({
        'Code': proj.code || '-',
        'Nom': proj.nom || '-',
        'Programme': proj.programme_id || '-',
        'Type activité': proj.type_activite || '-',
        'Statut': proj.statut || '-',
        'Date début': proj.date_debut ? formatDate(proj.date_debut) : '-',
        'Date fin': proj.date_fin ? formatDate(proj.date_fin) : '-',
        'Budget alloué': proj.budget_alloue ? formatCurrency(proj.budget_alloue) : '-',
        'Budget consommé': proj.budget_consomme ? formatCurrency(proj.budget_consomme) : '-',
        'Description': proj.description || '-',
      }))

      exportToExcel(dataToExport, `rapport_projets_${new Date().toISOString().split('T')[0]}`, 'Projets')
      toast.success('Rapport Excel généré avec succès')
    } catch (error) {
      logger.error('REPORTING_PROJET', 'Erreur génération Excel', error)
      toast.error('Erreur lors de la génération du rapport Excel')
    }
  }

  const generatePdfReport = () => {
    try {
      const dataToExport = projets.map(proj => ({
        'Code': proj.code || '-',
        'Nom': proj.nom || '-',
        'Programme': proj.programme_id || '-',
        'Type activité': proj.type_activite || '-',
        'Statut': proj.statut || '-',
        'Date début': proj.date_debut ? formatDate(proj.date_debut) : '-',
        'Date fin': proj.date_fin ? formatDate(proj.date_fin) : '-',
        'Budget alloué': proj.budget_alloue ? formatCurrency(proj.budget_alloue) : '-',
        'Budget consommé': proj.budget_consomme ? formatCurrency(proj.budget_consomme) : '-',
      }))

      exportToPdf(dataToExport, 'Rapport Projets', `rapport_projets_${new Date().toISOString().split('T')[0]}`)
      toast.success('Rapport PDF généré avec succès')
    } catch (error) {
      logger.error('REPORTING_PROJET', 'Erreur génération PDF', error)
      toast.error('Erreur lors de la génération du rapport PDF')
    }
  }

  const generateProjetDetailReport = async (projetId) => {
    try {
      const { data: projet } = await projetsService.getById(projetId)
      if (!projet) {
        toast.error('Projet non trouvé')
        return
      }

      const dataToExport = [{
        'Nom': projet.nom || '-',
        'Code': projet.code || '-',
        'Programme': projet.programme_id || '-',
        'Type activité': projet.type_activite || '-',
        'Statut': projet.statut || '-',
        'Date début': projet.date_debut ? formatDate(projet.date_debut) : '-',
        'Date fin': projet.date_fin ? formatDate(projet.date_fin) : '-',
        'Budget alloué': projet.budget_alloue ? formatCurrency(projet.budget_alloue) : '-',
        'Budget consommé': projet.budget_consomme ? formatCurrency(projet.budget_consomme) : '-',
        'Description': projet.description || '-',
      }]

      exportToExcel(dataToExport, `rapport_projet_${projet.code || projet.id}_${new Date().toISOString().split('T')[0]}`, projet.nom)
      toast.success('Rapport détaillé généré avec succès')
    } catch (error) {
      logger.error('REPORTING_PROJET', 'Erreur génération rapport détaillé', error)
      toast.error('Erreur lors de la génération du rapport détaillé')
    }
  }

  if (loading) return <LoadingState />

  return (
    <div className="reporting-projet">
      <div className="reporting-header">
        <h2>Rapports par Projet</h2>
      </div>

      <div className="reporting-content">
        <div className="rapports-actions">
          <Button variant="primary" onClick={generateExcelReport} disabled={projets.length === 0}>
            <Icon name="FileText" size={16} />
            Générer rapport Excel (Tous)
          </Button>
          <Button variant="secondary" onClick={generatePdfReport} disabled={projets.length === 0}>
            <Icon name="File" size={16} />
            Générer rapport PDF (Tous)
          </Button>
        </div>

        {projets.length === 0 ? (
          <EmptyState icon="FileText" title="Aucun projet" message="Aucun rapport à générer" />
        ) : (
          <>
            <div className="rapports-filters">
              <Select
                label="Rapport pour un projet spécifique"
                value={selectedProjet}
                onChange={(e) => setSelectedProjet(e.target.value)}
                options={[
                  { value: '', label: '-- Tous les projets --' },
                  ...projets.map(p => ({ value: p.id, label: p.nom }))
                ]}
              />
              {selectedProjet && (
                <Button variant="outline" onClick={() => generateProjetDetailReport(selectedProjet)}>
                  <Icon name="FileText" size={16} />
                  Rapport détaillé (Excel)
                </Button>
              )}
            </div>

            <div className="rapports-info">
              <p>
                <strong>{projets.length}</strong> projet(s) disponible(s) pour génération de rapports.
              </p>
              <p className="info-text">
                Les rapports Excel contiennent toutes les données des projets sélectionnés.
                Les rapports PDF sont optimisés pour l'impression.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

