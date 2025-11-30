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

export default function RapportCandidatures() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [stats, setStats] = useState(null)
  const [filters, setFilters] = useState({
    appelId: '',
    statut: '',
    dateDebut: '',
    dateFin: '',
  })

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const generateRapport = async () => {
    setLoading(true)
    try {
      const { data: rapportData, stats: rapportStats, error } =
        await reportingService.getRapportCandidatures(filters)
      if (error) {
        logger.error('RAPPORT_CANDIDATURES', 'Erreur génération', error)
        alert('Erreur lors de la génération du rapport')
        return
      }
      setData(rapportData || [])
      setStats(rapportStats)
    } catch (error) {
      logger.error('RAPPORT_CANDIDATURES', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = () => {
    const columns = [
      { key: 'nom', label: 'Nom' },
      { key: 'prenom', label: 'Prénom' },
      { key: 'email', label: 'Email' },
      { key: 'statut', label: 'Statut' },
      { key: 'eligible', label: 'Éligible', format: (v) => (v ? 'Oui' : 'Non') },
      { key: 'date_candidature', label: 'Date candidature', format: (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '') },
    ]
    const formattedData = formatDataForExport(data, columns)
    exportToExcel(formattedData, 'rapport-candidatures.csv')
  }

  const columns = [
    { key: 'nom', label: 'Nom' },
    { key: 'prenom', label: 'Prénom' },
    { key: 'email', label: 'Email' },
    { key: 'statut', label: 'Statut' },
    {
      key: 'eligible',
      label: 'Éligible',
      render: (v) => (v ? 'Oui' : 'Non'),
    },
    {
      key: 'date_candidature',
      label: 'Date candidature',
      render: (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '-'),
    },
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
              { value: 'En attente', label: 'En attente' },
              { value: 'En cours', label: 'En cours' },
              { value: 'Validé', label: 'Validé' },
              { value: 'Refusé', label: 'Refusé' },
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
            <MetricCard title="Total candidatures" value={stats.total} />
            <MetricCard title="Éligibles" value={stats.eligibles} />
            <MetricCard title="Non éligibles" value={stats.nonEligibles} />
          </div>
        </div>
      )}

      {!loading && data.length > 0 && (
        <div className="rapport-results">
          <h3>Résultats ({data.length} candidatures)</h3>
          <DataTable columns={columns} data={data} />
        </div>
      )}
    </div>
  )
}

