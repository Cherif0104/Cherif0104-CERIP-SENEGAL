import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mentorsService } from '@/services/mentors.service'
import { DataTable } from '@/components/common/DataTable'
import { Button } from '@/components/common/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './MentorsListe.css'

export default function MentorsListe() {
  const navigate = useNavigate()
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMentors()
  }, [])

  const loadMentors = async () => {
    setLoading(true)
    try {
      const { data, error } = await mentorsService.getAll()
      if (error) {
        logger.error('MENTORS_LISTE', 'Erreur chargement mentors', error)
        return
      }
      setMentors(data || [])
      logger.debug('MENTORS_LISTE', `${data?.length || 0} mentors chargés`)
    } catch (error) {
      logger.error('MENTORS_LISTE', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: 'user_id',
      label: 'Nom',
      render: (_, row) => {
        const user = row.users
        return user
          ? `${user.prenom || ''} ${user.nom || ''}`.trim() || user.email || '-'
          : '-'
      },
    },
    {
      key: 'specialite',
      label: 'Spécialité',
      render: (value) => value || '-',
    },
    {
      key: 'secteurs',
      label: 'Secteurs',
      render: (value) => (Array.isArray(value) ? value.join(', ') : '-'),
    },
    {
      key: 'regions',
      label: 'Régions',
      render: (value) => (Array.isArray(value) ? value.join(', ') : '-'),
    },
    {
      key: 'charge_max',
      label: 'Charge max',
      render: (value) => (value ? `${value}h/semaine` : '-'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate(`/intervenants/mentor/${row.id}`)}
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
    <div className="mentors-liste">
      <div className="tab-header">
        <h2>Liste des Mentors</h2>
      </div>

      {mentors.length === 0 ? (
        <EmptyState icon="UserCog" title="Aucun mentor" message="Aucun mentor enregistré" />
      ) : (
        <div className="mentors-content">
          <DataTable columns={columns} data={mentors} />
        </div>
      )}
    </div>
  )
}

