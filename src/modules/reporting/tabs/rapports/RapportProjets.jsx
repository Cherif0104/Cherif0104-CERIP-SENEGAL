import { useState } from 'react'
import { reportingService } from '@/services/reporting.service'
import { exportToExcel, formatDataForExport } from '@/utils/exportUtils'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'
import { DataTable } from '@/components/common/DataTable'
import { LoadingState } from '@/components/common/LoadingState'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './RapportBase.css'

export default function RapportProjets() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [filters, setFilters] = useState({
    programmeId: '',
    dateDebut: '',
    dateFin: '',
    statut: '',
  })

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const generateRapport = async () => {
    setLoading(true)
    try {
      const { data: rapportData, error } = await reportingService.getRapportProjets(filters)
      if (error) {
        logger.error('RAPPORT_PROJETS', 'Erreur génération', error)
        alert('Erreur lors de la génération du rapport')
        return
      }
      setData(rapportData || [])
    } catch (error) {
      logger.error('RAPPORT_PROJETS', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = () => {
    const columns = [
      { key: 'nom', label: 'Nom' },
      { key: 'programme_id', label: 'Programme', format: (v, row) => row.programme_id?.nom || '' },
      { key: 'date_debut', label: 'Date début', format: (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '') },
      { key: 'date_fin', label: 'Date fin', format: (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '') },
      { key: 'budget', label: 'Budget', format: (v) => (v ? new Intl.NumberFormat('fr-FR').format(v) : '') },
      { key: 'statut', label: 'Statut' },
    ]
    const formattedData = formatDataForExport(data, columns)
    exportToExcel(formattedData, 'rapport-projets.csv')
  }

  const columns = [
    { key: 'nom', label: 'Nom' },
    { key: 'programme_id', label: 'Programme', render: (_, row) => row.programme_id?.nom || '-' },
    { key: 'date_debut', label: 'Date début', render: (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '-') },
    { key: 'date_fin', label: 'Date fin', render: (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '-') },
    { key: 'budget', label: 'Budget', render: (v) => (v ? new Intl.NumberFormat('fr-FR').format(v) + ' FCFA' : '-') },
    { key: 'statut', label: 'Statut' },
  ]

  return (
    <div className="rapport-base">
      <div className="rapport-filters">
        <h3>Filtres</h3>
        <div className="filters-grid">
          <Input
            label="Date début"
            type="date"
            value={filters.dateDebut}
            onChange={(e) => handleFilterChange('dateDebut', e.target.value)}
          />
          <Input
            label="Date fin"
            type="date"
            value={filters.dateFin}
            onChange={(e) => handleFilterChange('dateFin', e.target.value)}
          />
          <Select
            label="Statut"
            value={filters.statut}
            onChange={(e) => handleFilterChange('statut', e.target.value)}
            options={[
              { value: '', label: 'Tous' },
              { value: 'BROUILLON', label: 'Brouillon' },
              { value: 'ACTIF', label: 'Actif' },
              { value: 'TERMINE', label: 'Terminé' },
            ]}
          />
        </div>
        <div className="rapport-actions">
          <Button variant="primary" onClick={generateRapport} disabled={loading}>
            <Icon name="RefreshCw" size={16} />
            {loading ? 'Génération...' : 'Générer le rapport'}
          </Button>
          {data.length > 0 && (
            <Button variant="secondary" onClick={handleExportExcel}>
              <Icon name="Download" size={16} />
              Exporter Excel
            </Button>
          )}
        </div>
      </div>

      {loading && <LoadingState />}

      {!loading && data.length > 0 && (
        <div className="rapport-results">
          <h3>Résultats ({data.length} projets)</h3>
          <DataTable columns={columns} data={data} />
        </div>
      )}
    </div>
  )
}

