import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formationsService } from '@/services/formations.service'
import { DataTable } from '@/components/common/DataTable'
import { Button } from '@/components/common/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './FormationsTab.css'

export default function FormationsTab() {
  const navigate = useNavigate()
  const [formations, setFormations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFormations()
  }, [])

  const loadFormations = async () => {
    setLoading(true)
    try {
      const { data, error } = await formationsService.getAll()
      if (error) {
        logger.error('FORMATIONS_TAB', 'Erreur chargement formations', error)
        return
      }
      setFormations(data || [])
      logger.debug('FORMATIONS_TAB', `${data?.length || 0} formations chargées`)
    } catch (error) {
      logger.error('FORMATIONS_TAB', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'titre', label: 'Titre' },
    {
      key: 'type',
      label: 'Type',
      render: (value) => value || '-',
    },
    {
      key: 'categorie',
      label: 'Catégorie',
      render: (value) => value || '-',
    },
    {
      key: 'date_debut',
      label: 'Date début',
      render: (value) => (value ? new Date(value).toLocaleDateString('fr-FR') : '-'),
    },
    {
      key: 'date_fin',
      label: 'Date fin',
      render: (value) => (value ? new Date(value).toLocaleDateString('fr-FR') : '-'),
    },
    {
      key: 'duree',
      label: 'Durée',
      render: (value) => (value ? `${value}h` : '-'),
    },
    {
      key: 'participants_max',
      label: 'Participants',
      render: (value, row) => {
        const sessions = row.sessions_formations || []
        const totalInscrits = sessions.reduce((sum, session) => {
          const participations = session.participations_formation || []
          return sum + participations.length
        }, 0)
        return `${totalInscrits}${value ? ` / ${value}` : ''}`
      },
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (value) => (
        <span className={`statut-badge statut-${value?.toLowerCase().replace(/\s+/g, '-')}`}>
          {value || 'BROUILLON'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate(`/formations/${row.id}`)}
            className="action-button"
            title="Voir détails"
          >
            <Icon name="Eye" size={16} />
          </button>
          <button
            onClick={() => navigate(`/formations/${row.id}/edit`)}
            className="action-button"
            title="Modifier"
          >
            <Icon name="Edit" size={16} />
          </button>
        </div>
      ),
    },
  ]

  if (loading) return <LoadingState />

  return (
    <div className="formations-tab">
      <div className="tab-header">
        <h2>Catalogue de Formations</h2>
        <Button variant="primary" onClick={() => navigate('/formations/new')}>
          <Icon name="Plus" size={16} />
          Nouvelle formation
        </Button>
      </div>

      {formations.length === 0 ? (
        <EmptyState
          icon="BookOpen"
          title="Aucune formation"
          message="Commencez par créer une nouvelle formation"
        />
      ) : (
        <div className="formations-content">
          <DataTable columns={columns} data={formations} />
        </div>
      )}
    </div>
  )
}

