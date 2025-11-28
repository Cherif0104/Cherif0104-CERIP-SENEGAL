import { useState, useEffect } from 'react'
import { referentielsService } from '../../services/referentiels.service'
import { getReferentielMetadata } from '../../data/referentiels-categories'
import Icon from '../common/Icon'
import './ReferentielCard.css'

export default function ReferentielCard({ type, onSelect, onConfigure }) {
  const [stats, setStats] = useState({ total: 0, actifs: 0, inactifs: 0, configured: false })
  const [loading, setLoading] = useState(true)
  const metadata = getReferentielMetadata(type)

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true)
      try {
        const { data } = await referentielsService.getAllByType(type)
        const total = data?.length || 0
        const actifs = data?.filter(item => item.actif)?.length || 0
        const inactifs = total - actifs
        const configured = data?.some(item => item.meta && Object.keys(item.meta).length > 0) || false
        setStats({ total, actifs, inactifs, configured })
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [type])

  const isFormulaireType = type?.startsWith('FORMULAIRE_') || 
    type === 'CRITERE_ELIGIBILITE' || 
    type === 'WORKFLOW_CANDIDATURE' || 
    type === 'CHAMP_FORMULAIRE'

  return (
    <div 
      className="referentiel-card"
      style={{ '--category-color': metadata.categoryColor }}
      onClick={() => onSelect && onSelect(type)}
    >
      <div className="referentiel-card-header">
        <div className="referentiel-card-icon" style={{ backgroundColor: `${metadata.categoryColor}15` }}>
          <Icon name={metadata.icon} size={24} color={metadata.categoryColor} />
        </div>
        <div className="referentiel-card-badges">
          {isFormulaireType && stats.configured && (
            <span className="referentiel-card-badge configured" title="Formulaire configuré">
              <Icon name="CheckCircle" size={12} />
              Configuré
            </span>
          )}
          {stats.total > 0 && (
            <span className="referentiel-card-badge count">
              {stats.total} élément{stats.total > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="referentiel-card-body">
        <h3 className="referentiel-card-title">{metadata.label}</h3>
        <p className="referentiel-card-description">{metadata.description}</p>
        <div className="referentiel-card-code">{type}</div>
      </div>

      {!loading && stats.total > 0 && (
        <div className="referentiel-card-stats">
          <div className="referentiel-card-stat">
            <Icon name="CheckCircle" size={14} color="#10b981" />
            <span>{stats.actifs} actif{stats.actifs > 1 ? 's' : ''}</span>
          </div>
          {stats.inactifs > 0 && (
            <div className="referentiel-card-stat">
              <Icon name="EyeOff" size={14} color="#94a3b8" />
              <span>{stats.inactifs} masqué{stats.inactifs > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      )}

      <div className="referentiel-card-actions">
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={(e) => {
            e.stopPropagation()
            onSelect && onSelect(type)
          }}
        >
          <Icon name="Eye" size={14} />
          Voir
        </button>
        {isFormulaireType && (
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={(e) => {
              e.stopPropagation()
              onConfigure && onConfigure(type)
            }}
          >
            <Icon name="Settings" size={14} />
            Configurer
          </button>
        )}
      </div>
    </div>
  )
}
