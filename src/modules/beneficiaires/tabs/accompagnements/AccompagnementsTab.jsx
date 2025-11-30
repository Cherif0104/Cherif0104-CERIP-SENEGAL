import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { accompagnementsService } from '@/services/accompagnements.service'
import { DataTable } from '@/components/common/DataTable'
import { Button } from '@/components/common/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './AccompagnementsTab.css'

export default function AccompagnementsTab() {
  const navigate = useNavigate()
  const [accompagnements, setAccompagnements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAccompagnements()
  }, [])

  const loadAccompagnements = async () => {
    setLoading(true)
    try {
      const { data, error } = await accompagnementsService.getAll()
      if (error) {
        logger.error('ACCOMPAGNEMENTS_TAB', 'Erreur chargement accompagnements', error)
        return
      }
      setAccompagnements(data || [])
      logger.debug('ACCOMPAGNEMENTS_TAB', `${data?.length || 0} accompagnements chargés`)
    } catch (error) {
      logger.error('ACCOMPAGNEMENTS_TAB', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: 'beneficiaire_id',
      label: 'Bénéficiaire',
      render: (_, row) => {
        const benef = row.beneficiaires
        return benef
          ? `${benef.prenom || ''} ${benef.nom || ''}`.trim() || benef.raison_sociale || '-'
          : '-'
      },
    },
    {
      key: 'mentor_id',
      label: 'Mentor',
      render: (_, row) => {
        const mentor = row.mentors
        return mentor ? `${mentor.specialite || 'Mentor'}` : '-'
      },
    },
    {
      key: 'date_prevue',
      label: 'Date prévue',
      render: (value) => (value ? new Date(value).toLocaleDateString('fr-FR') : '-'),
    },
    {
      key: 'date_reelle',
      label: 'Date réalisée',
      render: (value) => (value ? new Date(value).toLocaleDateString('fr-FR') : 'Non réalisé'),
    },
    {
      key: 'modalite',
      label: 'Modalité',
      render: (value) => value || '-',
    },
    {
      key: 'duree',
      label: 'Durée',
      render: (value) => (value ? `${value} min` : '-'),
    },
    {
      key: 'evaluation',
      label: 'Évaluation',
      render: (value) => (value ? `${value}/5` : '-'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate(`/accompagnements/${row.id}`)}
            className="action-button"
            title="Voir détails"
          >
            <Icon name="Eye" size={16} />
          </button>
        </div>
      ),
    },
  ]

  if (loading) return <LoadingState />

  return (
    <div className="accompagnements-tab">
      <div className="tab-header">
        <h2>Accompagnements</h2>
        <Button variant="primary" onClick={() => navigate('/accompagnements/new')}>
          <Icon name="Plus" size={16} />
          Nouvel accompagnement
        </Button>
      </div>

      {accompagnements.length === 0 ? (
        <EmptyState
          icon="UserCheck"
          title="Aucun accompagnement"
          message="Commencez par créer un nouvel accompagnement"
        />
      ) : (
        <div className="accompagnements-content">
          <DataTable columns={columns} data={accompagnements} />
        </div>
      )}
    </div>
  )
}

