import { useEffect, useState } from 'react'
import { auditService } from '@/services/audit.service'
import { DataTable } from '@/components/common/DataTable'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import { exportToExcel, formatDataForExport } from '@/utils/exportUtils'
import './LogsAudit.css'

export default function LogsAudit() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    table: '',
    action: '',
    user_id: '',
    date_from: '',
    date_to: '',
  })

  useEffect(() => {
    loadLogs()
  }, [filters])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const result = await auditService.getLogs({
        table: filters.table || undefined,
        action: filters.action || undefined,
        user_id: filters.user_id || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
      })

      if (result.error) {
        logger.error('LOGS_AUDIT', 'Erreur chargement logs', result.error)
        return
      }

      setLogs(result.data || [])
    } catch (error) {
      logger.error('LOGS_AUDIT', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleExport = () => {
    const exportColumns = [
      { 
        key: 'timestamp', 
        label: 'Date',
        format: (v) => v ? new Date(v).toLocaleString('fr-FR') : ''
      },
      { key: 'table_name', label: 'Table' },
      { key: 'action', label: 'Action' },
      { key: 'record_id', label: 'ID Enregistrement' },
      { key: 'user_id', label: 'Utilisateur' },
      { key: 'user_email', label: 'Email Utilisateur' },
      { key: 'ip_address', label: 'IP' },
      { 
        key: 'metadata', 
        label: 'Détails',
        format: (v) => v ? (typeof v === 'string' ? v : JSON.stringify(v)) : ''
      },
    ]
    
    const formattedData = formatDataForExport(logs, exportColumns)
    exportToExcel(formattedData, 'logs_audit.csv')
  }

  const getActionIcon = (action) => {
    const icons = {
      INSERT: 'Plus',
      UPDATE: 'Edit',
      DELETE: 'Trash',
      VIEW: 'Eye',
    }
    return icons[action] || 'File'
  }

  const columns = [
    {
      key: 'timestamp',
      label: 'Date',
      render: (value) => (value ? new Date(value).toLocaleString('fr-FR') : '-'),
    },
    {
      key: 'table_name',
      label: 'Table',
      render: (value) => <span className="table-name">{value || '-'}</span>,
    },
    {
      key: 'action',
      label: 'Action',
      render: (value) => (
        <span className="action-badge" data-action={value}>
          <Icon name={getActionIcon(value)} size={14} />
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'record_id',
      label: 'ID Enregistrement',
      render: (value) => <span className="record-id">{value || '-'}</span>,
    },
    {
      key: 'user_id',
      label: 'Utilisateur',
      render: (value) => value || '-',
    },
    {
      key: 'ip_address',
      label: 'IP',
      render: (value) => value || '-',
    },
  ]

  if (loading) return <LoadingState />

  return (
    <div className="logs-audit">
      <div className="logs-audit-header">
        <div>
          <h2>Logs d'Audit</h2>
          <p className="subtitle">Historique de toutes les actions effectuées dans le système</p>
        </div>
        <Button variant="primary" onClick={handleExport}>
          <Icon name="Download" size={16} />
          Exporter
        </Button>
      </div>

      <div className="filters-section">
        <div className="filters-grid">
          <Input
            label="Table"
            value={filters.table}
            onChange={(e) => handleFilterChange('table', e.target.value)}
            placeholder="Ex: programmes, projets"
          />
          <Select
            label="Action"
            value={filters.action}
            onChange={(e) => handleFilterChange('action', e.target.value)}
            options={[
              { value: '', label: 'Toutes' },
              { value: 'INSERT', label: 'INSERT (Création)' },
              { value: 'UPDATE', label: 'UPDATE (Modification)' },
              { value: 'DELETE', label: 'DELETE (Suppression)' },
              { value: 'VIEW', label: 'VIEW (Consultation)' },
            ]}
          />
          <Input
            label="Utilisateur ID"
            value={filters.user_id}
            onChange={(e) => handleFilterChange('user_id', e.target.value)}
            placeholder="UUID"
          />
          <Input
            label="Date début"
            type="date"
            value={filters.date_from}
            onChange={(e) => handleFilterChange('date_from', e.target.value)}
          />
          <Input
            label="Date fin"
            type="date"
            value={filters.date_to}
            onChange={(e) => handleFilterChange('date_to', e.target.value)}
          />
        </div>
      </div>

      <div className="logs-content">
        <DataTable columns={columns} data={logs} />
      </div>
    </div>
  )
}

