import { useState, useEffect } from 'react'
import { auditService } from '@/services/audit.service'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDateTime } from '@/utils/format'
import { Icon } from '@/components/common/Icon'
import './AuditTrail.css'

/**
 * Composant pour afficher l'historique d'audit trail d'un enregistrement
 */
export const AuditTrail = ({ tableName, recordId }) => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (tableName && recordId) {
      loadHistory()
    }
  }, [tableName, recordId])

  const loadHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await auditService.getHistory(tableName, recordId)
      if (err) {
        setError(err.message)
      } else {
        setHistory(data || [])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action) => {
    switch (action) {
      case 'INSERT':
        return 'Plus'
      case 'UPDATE':
        return 'Edit'
      case 'DELETE':
        return 'Trash'
      case 'VIEW':
        return 'Eye'
      case 'EXPORT':
        return 'Download'
      default:
        return 'FileText'
    }
  }

  const getActionColor = (action) => {
    switch (action) {
      case 'INSERT':
        return 'var(--success)'
      case 'UPDATE':
        return 'var(--info)'
      case 'DELETE':
        return 'var(--error)'
      case 'VIEW':
        return 'var(--text-secondary)'
      case 'EXPORT':
        return 'var(--warning)'
      default:
        return 'var(--text-primary)'
    }
  }

  if (loading) {
    return <LoadingState message="Chargement de l'historique..." />
  }

  if (error) {
    return (
      <div className="audit-trail-error">
        <Icon name="AlertCircle" size={20} />
        <span>Erreur : {error}</span>
      </div>
    )
  }

  if (!tableName || !recordId) {
    return <EmptyState icon="FileText" title="Aucun enregistrement sélectionné" />
  }

  if (history.length === 0) {
    return <EmptyState icon="Clock" title="Aucun historique disponible" />
  }

  return (
    <div className="audit-trail">
      <div className="audit-trail-header">
        <h3>Historique des modifications</h3>
        <button onClick={loadHistory} className="audit-trail-refresh">
          <Icon name="RefreshCw" size={16} />
          Actualiser
        </button>
      </div>

      <div className="audit-trail-list">
        {history.map((log) => (
          <div key={log.id} className="audit-trail-item">
            <div className="audit-trail-item-header">
              <div className="audit-trail-action">
                <Icon
                  name={getActionIcon(log.action)}
                  size={18}
                  style={{ color: getActionColor(log.action) }}
                />
                <span className="audit-trail-action-label">{log.action}</span>
              </div>
              <span className="audit-trail-timestamp">
                {formatDateTime(log.timestamp)}
              </span>
            </div>

            <div className="audit-trail-details">
              <div className="audit-trail-user">
                <Icon name="User" size={14} />
                <span>{log.user_email || log.user_id || 'Utilisateur inconnu'}</span>
              </div>

              {log.changed_fields && log.changed_fields.length > 0 && (
                <div className="audit-trail-changes">
                  <strong>Champs modifiés :</strong>{' '}
                  {log.changed_fields.join(', ')}
                </div>
              )}

              {log.action === 'UPDATE' && log.old_values && log.new_values && (
                <details className="audit-trail-diff">
                  <summary>Voir les modifications détaillées</summary>
                  <div className="audit-trail-diff-content">
                    <div className="audit-trail-diff-section">
                      <h4>Anciennes valeurs</h4>
                      <pre>{JSON.stringify(log.old_values, null, 2)}</pre>
                    </div>
                    <div className="audit-trail-diff-section">
                      <h4>Nouvelles valeurs</h4>
                      <pre>{JSON.stringify(log.new_values, null, 2)}</pre>
                    </div>
                  </div>
                </details>
              )}

              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <div className="audit-trail-metadata">
                  <strong>Métadonnées :</strong>{' '}
                  <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

