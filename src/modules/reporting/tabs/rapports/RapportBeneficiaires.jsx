import { useState } from 'react'
import { reportingService } from '@/services/reporting.service'
import { exportToExcel, formatDataForExport } from '@/utils/exportUtils'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'
import { DataTable } from '@/components/common/DataTable'
import { LoadingState } from '@/components/common/LoadingState'
import { MetricCard } from '@/components/modules/MetricCard'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './RapportBase.css'

export default function RapportBeneficiaires() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [stats, setStats] = useState(null)
  const [filters, setFilters] = useState({
    projetId: '',
    statut: '',
  })

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const generateRapport = async () => {
    setLoading(true)
    try {
      const { data: rapportData, stats: rapportStats, error } =
        await reportingService.getRapportBeneficiaires(filters)
      if (error) {
        logger.error('RAPPORT_BENEFICIAIRES', 'Erreur génération', error)
        alert('Erreur lors de la génération du rapport')
        return
      }
      setData(rapportData || [])
      setStats(rapportStats)
    } catch (error) {
      logger.error('RAPPORT_BENEFICIAIRES', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = () => {
    const columns = [
      { key: 'code', label: 'Code' },
      { key: 'statut', label: 'Statut' },
      { key: 'date_creation', label: 'Date création', format: (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '') },
    ]
    const formattedData = formatDataForExport(data, columns)
    exportToExcel(formattedData, 'rapport-beneficiaires.csv')
  }

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'statut', label: 'Statut' },
    {
      key: 'created_at',
      label: 'Date création',
      render: (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '-'),
    },
  ]

  return (
    <div className="rapport-base">
      <div className="rapport-filters">
        <h3>Filtres</h3>
        <div className="filters-grid">
          <Select
            label="Statut"
            value={filters.statut}
            onChange={(e) => handleFilterChange('statut', e.target.value)}
            options={[
              { value: '', label: 'Tous' },
              { value: 'PRE_INCUBATION', label: 'Pré-incubation' },
              { value: 'INCUBATION', label: 'Incubation' },
              { value: 'POST_INCUBATION', label: 'Post-incubation' },
              { value: 'INSERE', label: 'Inséré' },
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

      {!loading && stats && (
        <div className="rapport-stats">
          <h3>Statistiques</h3>
          <div className="stats-grid">
            <MetricCard title="Total bénéficiaires" value={stats.total} />
            <MetricCard title="Avec insertion" value={stats.avecInsertion} />
          </div>
        </div>
      )}

      {!loading && data.length > 0 && (
        <div className="rapport-results">
          <h3>Résultats ({data.length} bénéficiaires)</h3>
          <DataTable columns={columns} data={data} />
        </div>
      )}
    </div>
  )
}

