import { useEffect, useState, useMemo } from 'react'
import { auditService } from '@/services/audit.service'
import { DataTable } from '@/components/common/DataTable'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { Icon } from '@/components/common/Icon'
import { toast } from '@/components/common/Toast'
import { logger } from '@/utils/logger'
import { exportToExcel, formatDataForExport } from '@/utils/exportUtils'
import { formatDate } from '@/utils/format'
import './LogsAudit.css'

export default function LogsAudit() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    table: '',
    action: '',
    user_id: '',
    date_from: '',
    date_to: '',
  })

  useEffect(() => {
    loadLogs()
  }, [])

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
        toast.error('Erreur lors du chargement des logs')
        return
      }

      setLogs(result.data || [])
      logger.debug('LOGS_AUDIT', `${result.data?.length || 0} logs chargés`)
    } catch (error) {
      logger.error('LOGS_AUDIT', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.table, filters.action, filters.user_id, filters.date_from, filters.date_to])

  // Filtrer et rechercher
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          log.table_name?.toLowerCase().includes(searchLower) ||
          log.action?.toLowerCase().includes(searchLower) ||
          log.record_id?.toLowerCase().includes(searchLower) ||
          log.user_id?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }
      return true
    })
  }, [logs, searchTerm])

  // Calculer les statistiques
  const stats = useMemo(() => {
    const inserts = logs.filter(l => l.action === 'INSERT').length
    const updates = logs.filter(l => l.action === 'UPDATE').length
    const deletes = logs.filter(l => l.action === 'DELETE').length
    const views = logs.filter(l => l.action === 'VIEW').length

    return {
      total: logs.length,
      inserts,
      updates,
      deletes,
      views
    }
  }, [logs])

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
    
    const formattedData = formatDataForExport(filteredLogs, exportColumns)
    exportToExcel(formattedData, 'logs_audit.csv')
    toast.success('Export réussi')
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
      render: (value) => value ? formatDate(value, { includeTime: true }) : '-',
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
        <span className={`action-badge-modern action-${value?.toLowerCase() || 'unknown'}`}>
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
      {/* KPIs Statistiques */}
      <div className="logs-stats">
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-primary">
            <Icon name="FileText" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Logs</div>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-success">
            <Icon name="Plus" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.inserts}</div>
            <div className="stat-label">Créations</div>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-warning">
            <Icon name="Edit" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.updates}</div>
            <div className="stat-label">Modifications</div>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-default">
            <Icon name="Trash" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.deletes}</div>
            <div className="stat-label">Suppressions</div>
          </div>
        </div>
      </div>

      {/* Filtres Modernes */}
      <div className="liste-filters-modern">
        <div className="filters-header">
          <h3>Filtres</h3>
          <Button variant="primary" onClick={handleExport}>
            <Icon name="Download" size={16} />
            Exporter
          </Button>
        </div>
        <div className="filters-content">
          <Input
            label="Recherche"
            type="text"
            placeholder="Table, action, ID, utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
          {(searchTerm || filters.table || filters.action || filters.user_id || filters.date_from || filters.date_to) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setFilters({
                  table: '',
                  action: '',
                  user_id: '',
                  date_from: '',
                  date_to: '',
                })
              }}
            >
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {/* Barre d'information */}
      <div className="liste-info-modern">
        <div className="info-content">
          <span>
            <strong>{filteredLogs.length}</strong> log(s) trouvé(s)
            {filteredLogs.length !== logs.length && ` sur ${logs.length}`}
          </span>
        </div>
      </div>

      {/* Contenu */}
      <div className="data-table-wrapper">
        <DataTable columns={columns} data={filteredLogs} />
      </div>
    </div>
  )
}
