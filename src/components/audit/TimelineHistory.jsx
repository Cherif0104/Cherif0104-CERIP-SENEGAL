import { useState, useEffect } from 'react'
import { auditService } from '@/services/audit.service'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDateTime, formatDate } from '@/utils/format'
import { Icon } from '@/components/common/Icon'
import { Button } from '@/components/common/Button'
import './TimelineHistory.css'

/**
 * Composant Timeline amélioré pour l'historique avec comparaisons temporelles
 */
export const TimelineHistory = ({ tableName, recordId }) => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('all') // 'all', 'week', 'month', 'quarter', 'year'
  const [comparisonMode, setComparisonMode] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    if (tableName && recordId) {
      loadHistory()
    }
  }, [tableName, recordId, selectedPeriod])

  const loadHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await auditService.getHistory(tableName, recordId)
      if (err) {
        setError(err.message)
      } else {
        let filtered = data || []
        
        // Filtrer par période
        if (selectedPeriod !== 'all') {
          const now = new Date()
          const periods = {
            week: 7,
            month: 30,
            quarter: 90,
            year: 365,
          }
          const daysAgo = periods[selectedPeriod]
          const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(item => new Date(item.timestamp) >= cutoffDate)
        }
        
        setHistory(filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action) => {
    switch (action) {
      case 'INSERT': return 'Plus'
      case 'UPDATE': return 'Edit'
      case 'DELETE': return 'Trash2'
      case 'VIEW': return 'Eye'
      case 'EXPORT': return 'Download'
      default: return 'FileText'
    }
  }

  const getActionColor = (action) => {
    switch (action) {
      case 'INSERT': return '#10b981'
      case 'UPDATE': return '#3b82f6'
      case 'DELETE': return '#ef4444'
      case 'VIEW': return '#6b7280'
      case 'EXPORT': return '#f59e0b'
      default: return '#374151'
    }
  }

  const getActionLabel = (action) => {
    const labels = {
      INSERT: 'Créé',
      UPDATE: 'Modifié',
      DELETE: 'Supprimé',
      VIEW: 'Consulté',
      EXPORT: 'Exporté',
    }
    return labels[action] || action
  }

  // Grouper par date pour la timeline
  const groupedByDate = history.reduce((acc, item) => {
    const date = formatDate(item.timestamp)
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(item)
    return acc
  }, {})

  const getChangesSummary = (item) => {
    if (!item.changed_fields || item.changed_fields.length === 0) return null
    return `${item.changed_fields.length} champ(s) modifié(s)`
  }

  const renderComparison = (oldValues, newValues) => {
    if (!oldValues || !newValues) return null
    
    const changedFields = Object.keys(newValues).filter(key => 
      JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])
    )

    if (changedFields.length === 0) return null

    return (
      <div className="timeline-comparison">
        <div className="comparison-header">
          <Icon name="GitCompare" size={16} />
          <strong>Comparaison</strong>
        </div>
        <div className="comparison-list">
          {changedFields.map(field => (
            <div key={field} className="comparison-item">
              <div className="comparison-field">{field}</div>
              <div className="comparison-values">
                <div className="comparison-old">
                  <span className="comparison-label">Avant:</span>
                  <span className="comparison-value">
                    {oldValues[field] !== null && oldValues[field] !== undefined 
                      ? String(oldValues[field]) 
                      : '(vide)'}
                  </span>
                </div>
                <Icon name="ArrowRight" size={14} className="comparison-arrow" />
                <div className="comparison-new">
                  <span className="comparison-label">Après:</span>
                  <span className="comparison-value">
                    {newValues[field] !== null && newValues[field] !== undefined 
                      ? String(newValues[field]) 
                      : '(vide)'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return <LoadingState message="Chargement de l'historique..." />
  }

  if (error) {
    return (
      <div className="timeline-history-error">
        <Icon name="AlertCircle" size={20} />
        <span>Erreur : {error}</span>
      </div>
    )
  }

  if (!tableName || !recordId) {
    return <EmptyState icon="FileText" title="Aucun enregistrement sélectionné" />
  }

  if (history.length === 0) {
    return (
      <EmptyState 
        icon="Clock" 
        title="Aucun historique disponible"
        message={`Aucun événement enregistré${selectedPeriod !== 'all' ? ` pour cette période (${selectedPeriod})` : ''}`}
      />
    )
  }

  return (
    <div className="timeline-history">
      {/* Header avec filtres */}
      <div className="timeline-history-header">
        <div className="timeline-history-title-section">
          <h3>Historique et Événements</h3>
          <span className="timeline-history-count">{history.length} événement(s)</span>
        </div>
        <div className="timeline-history-controls">
          <div className="timeline-period-selector">
            <label>Période:</label>
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="timeline-period-select"
            >
              <option value="all">Tout</option>
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="quarter">3 derniers mois</option>
              <option value="year">12 derniers mois</option>
            </select>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadHistory}
            className="timeline-refresh-btn"
          >
            <Icon name="RefreshCw" size={16} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="timeline-history-content">
        {Object.entries(groupedByDate).map(([date, items]) => (
          <div key={date} className="timeline-date-group">
            <div className="timeline-date-header">
              <div className="timeline-date-line"></div>
              <span className="timeline-date-label">{date}</span>
              <div className="timeline-date-line"></div>
            </div>
            
            <div className="timeline-items">
              {items.map((item, index) => {
                const isSelected = selectedItem?.id === item.id
                const actionColor = getActionColor(item.action)
                
                return (
                  <div 
                    key={item.id} 
                    className={`timeline-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedItem(isSelected ? null : item)}
                  >
                    <div className="timeline-item-marker">
                      <div 
                        className="timeline-dot" 
                        style={{ backgroundColor: actionColor }}
                      >
                        <Icon 
                          name={getActionIcon(item.action)} 
                          size={12} 
                          style={{ color: 'white' }}
                        />
                      </div>
                      {index < items.length - 1 && <div className="timeline-item-line" />}
                    </div>
                    
                    <div className="timeline-item-content">
                      <div className="timeline-item-header">
                        <div className="timeline-item-action">
                          <span 
                            className="timeline-action-badge"
                            style={{ backgroundColor: actionColor + '20', color: actionColor }}
                          >
                            {getActionLabel(item.action)}
                          </span>
                          <span className="timeline-item-time">
                            {new Date(item.timestamp).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <div className="timeline-item-user">
                          <Icon name="User" size={14} />
                          <span>{item.user_email || item.user_id || 'Utilisateur inconnu'}</span>
                        </div>
                      </div>

                      {getChangesSummary(item) && (
                        <div className="timeline-item-summary">
                          <Icon name="Edit3" size={14} />
                          <span>{getChangesSummary(item)}</span>
                        </div>
                      )}

                      {/* Comparaison détaillée */}
                      {isSelected && item.action === 'UPDATE' && renderComparison(
                        item.old_values, 
                        item.new_values
                      )}

                      {/* Métadonnées */}
                      {isSelected && item.metadata && Object.keys(item.metadata).length > 0 && (
                        <div className="timeline-item-metadata">
                          <Icon name="Info" size={14} />
                          <pre>{JSON.stringify(item.metadata, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
