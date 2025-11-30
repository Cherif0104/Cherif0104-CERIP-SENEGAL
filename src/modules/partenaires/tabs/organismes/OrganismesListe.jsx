import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { organismesService } from '@/services/organismes.service'
import { DataTable } from '@/components/common/DataTable'
import { Button } from '@/components/common/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import OrganismeDetail from './OrganismeDetail'
import OrganismeForm from './OrganismeForm'

export default function OrganismesListe() {
  const navigate = useNavigate()
  const [organismes, setOrganismes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)

  useEffect(() => {
    loadOrganismes()
  }, [])

  const loadOrganismes = async () => {
    setLoading(true)
    try {
      const { data, error } = await organismesService.getAll()
      if (error) {
        logger.error('ORGANISMES_LISTE', 'Erreur chargement organismes', error)
        return
      }
      setOrganismes(data || [])
      logger.debug('ORGANISMES_LISTE', `${data?.length || 0} organismes chargés`)
    } catch (error) {
      logger.error('ORGANISMES_LISTE', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id) => {
    setEditId(id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet organisme ?')) {
      return
    }

    try {
      const { error } = await organismesService.delete(id)
      if (error) {
        logger.error('ORGANISMES_LISTE', 'Erreur suppression', error)
        alert('Erreur lors de la suppression')
        return
      }
      logger.info('ORGANISMES_LISTE', 'Organisme supprimé', { id })
      loadOrganismes()
      if (selectedId === id) setSelectedId(null)
    } catch (error) {
      logger.error('ORGANISMES_LISTE', 'Erreur inattendue suppression', error)
    }
  }

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'nom', label: 'Nom' },
    { key: 'type', label: 'Type' },
    { key: 'pays', label: 'Pays' },
    {
      key: 'actif',
      label: 'Statut',
      render: (value) => (
        <span className={`statut-badge ${value ? 'actif' : 'inactif'}`}>
          {value ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setSelectedId(selectedId === row.id ? null : row.id)}
            className="action-button"
            title="Voir détails"
          >
            <Icon name="Eye" size={16} />
          </button>
          <button
            onClick={() => handleEdit(row.id)}
            className="action-button"
            title="Modifier"
          >
            <Icon name="Edit" size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="action-button danger"
            title="Supprimer"
          >
            <Icon name="Trash2" size={16} />
          </button>
        </div>
      ),
    },
  ]

  if (loading) return <LoadingState />

  if (showForm) {
    return (
      <OrganismeForm
        id={editId}
        onClose={() => {
          setShowForm(false)
          setEditId(null)
          loadOrganismes()
        }}
      />
    )
  }

  if (selectedId) {
    return (
      <OrganismeDetail
        id={selectedId}
        onClose={() => setSelectedId(null)}
        onEdit={handleEdit}
      />
    )
  }

  return (
    <div className="organismes-liste">
      <div className="liste-header">
        <h2>Organismes Internationaux</h2>
        <Button onClick={() => setShowForm(true)} variant="primary">
          <Icon name="Plus" size={16} />
          Nouvel organisme
        </Button>
      </div>
      {organismes.length === 0 ? (
        <EmptyState
          icon="Globe"
          title="Aucun organisme"
          message="Commencez par créer un nouvel organisme international"
        />
      ) : (
        <DataTable columns={columns} data={organismes} />
      )}
    </div>
  )
}

