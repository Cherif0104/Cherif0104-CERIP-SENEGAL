import { useState } from 'react'
import { reportingService } from '@/services/reporting.service'
import { exportToExcel, formatDataForExport } from '@/utils/exportUtils'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { DataTable } from '@/components/common/DataTable'
import { LoadingState } from '@/components/common/LoadingState'
import { MetricCard } from '@/components/modules/MetricCard'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './RapportBase.css'

export default function RapportFinancier() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [filters, setFilters] = useState({
    dateDebut: '',
    dateFin: '',
    compteId: '',
  })

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const generateRapport = async () => {
    setLoading(true)
    try {
      const { data: rapportData, error } = await reportingService.getRapportFinancier(filters)
      if (error) {
        logger.error('RAPPORT_FINANCIER', 'Erreur génération', error)
        alert('Erreur lors de la génération du rapport')
        return
      }
      setData(rapportData)
    } catch (error) {
      logger.error('RAPPORT_FINANCIER', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = () => {
    if (!data?.flux || data.flux.length === 0) return

    const columns = [
      { key: 'date', label: 'Date', format: (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '') },
      { key: 'type', label: 'Type' },
      { key: 'montant', label: 'Montant', format: (v) => (v ? new Intl.NumberFormat('fr-FR').format(v) : '') },
      { key: 'categorie', label: 'Catégorie' },
      { key: 'description', label: 'Description' },
    ]
    const formattedData = formatDataForExport(data.flux, columns)
    exportToExcel(formattedData, 'rapport-financier.csv')
  }

  const fluxColumns = [
    {
      key: 'date',
      label: 'Date',
      render: (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '-'),
    },
    { key: 'type', label: 'Type' },
    {
      key: 'montant',
      label: 'Montant',
      render: (v) => (v ? new Intl.NumberFormat('fr-FR').format(v) + ' FCFA' : '-'),
    },
    { key: 'categorie', label: 'Catégorie' },
    { key: 'description', label: 'Description' },
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
        </div>
        <div className="rapport-actions">
          <Button variant="primary" onClick={generateRapport} disabled={loading}>
            <Icon name="RefreshCw" size={16} />
            {loading ? 'Génération...' : 'Générer le rapport'}
          </Button>
          {data && data.flux && data.flux.length > 0 && (
            <Button variant="secondary" onClick={handleExportExcel}>
              <Icon name="Download" size={16} />
              Exporter Excel
            </Button>
          )}
        </div>
      </div>

      {loading && <LoadingState />}

      {!loading && data && data.totals && (
        <div className="rapport-stats">
          <h3>Résumé Financier</h3>
          <div className="stats-grid">
            <MetricCard
              title="Total Recettes"
              value={new Intl.NumberFormat('fr-FR').format(data.totals.recettes)}
              detail="FCFA"
            />
            <MetricCard
              title="Total Dépenses"
              value={new Intl.NumberFormat('fr-FR').format(data.totals.depenses)}
              detail="FCFA"
            />
            <MetricCard
              title="Solde"
              value={new Intl.NumberFormat('fr-FR').format(data.totals.solde)}
              detail="FCFA"
              variant={data.totals.solde >= 0 ? 'success' : 'error'}
            />
          </div>
        </div>
      )}

      {!loading && data && data.flux && data.flux.length > 0 && (
        <div className="rapport-results">
          <h3>Flux de Trésorerie ({data.flux.length} opérations)</h3>
          <DataTable columns={fluxColumns} data={data.flux} />
        </div>
      )}
    </div>
  )
}

