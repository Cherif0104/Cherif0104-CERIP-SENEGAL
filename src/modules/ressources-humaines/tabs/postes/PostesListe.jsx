import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { postesService } from '@/services/postes.service'
import { DataTable } from '@/components/common/DataTable'
import { Button } from '@/components/common/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './PostesListe.css'

export default function PostesListe() {
  const navigate = useNavigate()
  const [postes, setPostes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPostes()
  }, [])

  const loadPostes = async () => {
    setLoading(true)
    try {
      const { data, error } = await postesService.getAll()
      if (error) {
        logger.error('POSTES_LISTE', 'Erreur chargement postes', error)
        return
      }
      setPostes(data || [])
    } catch (error) {
      logger.error('POSTES_LISTE', 'Erreur inattendue', error)
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
      key: 'titre',
      label: 'Titre',
    },
    {
      key: 'departement',
      label: 'Département',
      render: (value) => value || '-',
    },
    {
      key: 'type_contrat',
      label: 'Type contrat',
      render: (value) => value || '-',
    },
    {
      key: 'salaire_min',
      label: 'Salaire min',
      render: (value) => (value ? new Intl.NumberFormat('fr-FR').format(value) + ' FCFA' : '-'),
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (value) => (
        <span className={`statut-badge statut-${value?.toLowerCase().replace(/\s+/g, '-') || 'inconnu'}`}>
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate(`/rh/postes/${row.id}`)}
            className="action-button"
            title="Voir détails"
          >
            <Icon name="Eye" size={16} />
          </button>
          <button
            onClick={() => navigate(`/rh/postes/${row.id}/edit`)}
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
    <div className="postes-liste">
      <div className="tab-header">
        <h2>Liste des Postes</h2>
        <Button variant="primary" onClick={() => navigate('/rh/postes/new')}>
          <Icon name="Plus" size={16} />
          Nouveau poste
        </Button>
      </div>

      {postes.length === 0 ? (
        <EmptyState icon="Briefcase" title="Aucun poste" message="Commencez par créer un nouveau poste" />
      ) : (
        <div className="postes-content">
          <DataTable columns={columns} data={postes} />
        </div>
      )}
    </div>
  )
}

