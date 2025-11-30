import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { competencesService } from '@/services/competences.service'
import { DataTable } from '@/components/common/DataTable'
import { Button } from '@/components/common/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './CompetencesListe.css'

export default function CompetencesListe() {
  const navigate = useNavigate()
  const [competences, setCompetences] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCompetences()
  }, [])

  const loadCompetences = async () => {
    setLoading(true)
    try {
      const { data, error } = await competencesService.getAll()
      if (error) {
        logger.error('COMPETENCES_LISTE', 'Erreur chargement compétences', error)
        return
      }
      setCompetences(data || [])
    } catch (error) {
      logger.error('COMPETENCES_LISTE', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: 'code',
      label: 'Code',
    },
    {
      key: 'nom',
      label: 'Nom',
    },
    {
      key: 'categorie',
      label: 'Catégorie',
      render: (value) => value || '-',
    },
    {
      key: 'niveau_max',
      label: 'Niveau max',
      render: (value) => value || '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate(`/rh/competences/${row.id}`)}
            className="action-button"
            title="Voir détails"
          >
            <Icon name="Eye" size={16} />
          </button>
          <button
            onClick={() => navigate(`/rh/competences/${row.id}/edit`)}
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
    <div className="competences-liste">
      <div className="tab-header">
        <h2>Liste des Compétences</h2>
        <Button variant="primary" onClick={() => navigate('/rh/competences/new')}>
          <Icon name="Plus" size={16} />
          Nouvelle compétence
        </Button>
      </div>

      {competences.length === 0 ? (
        <EmptyState
          icon="Award"
          title="Aucune compétence"
          message="Commencez par créer une nouvelle compétence"
        />
      ) : (
        <div className="competences-content">
          <DataTable columns={columns} data={competences} />
        </div>
      )}
    </div>
  )
}

