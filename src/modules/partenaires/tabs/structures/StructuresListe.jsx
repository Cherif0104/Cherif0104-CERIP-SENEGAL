import { useEffect, useState } from 'react'
import { structuresService } from '@/services/structures.service'
import { DataTable } from '@/components/common/DataTable'
import { Button } from '@/components/common/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import StructureDetail from './StructureDetail'
import StructureForm from './StructureForm'

export default function StructuresListe() {
  const [structures, setStructures] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)

  useEffect(() => {
    loadStructures()
  }, [])

  const loadStructures = async () => {
    setLoading(true)
    try {
      const { data, error } = await structuresService.getAll()
      if (error) {
        logger.error('STRUCTURES_LISTE', 'Erreur chargement structures', error)
        return
      }
      setStructures(data || [])
      logger.debug('STRUCTURES_LISTE', `${data?.length || 0} structures chargées`)
    } catch (error) {
      logger.error('STRUCTURES_LISTE', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id) => {
    setEditId(id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette structure ?')) {
      return
    }

    try {
      const { error } = await structuresService.delete(id)
      if (error) {
        logger.error('STRUCTURES_LISTE', 'Erreur suppression', error)
        alert('Erreur lors de la suppression')
        return
      }
      logger.info('STRUCTURES_LISTE', 'Structure supprimée', { id })
      loadStructures()
      if (selectedId === id) setSelectedId(null)
    } catch (error) {
      logger.error('STRUCTURES_LISTE', 'Erreur inattendue suppression', error)
    }
  }

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'nom', label: 'Nom' },
    { key: 'type', label: 'Type' },
    { key: 'secteur', label: 'Secteur' },
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
      <StructureForm
        id={editId}
        onClose={() => {
          setShowForm(false)
          setEditId(null)
          loadStructures()
        }}
      />
    )
  }

  if (selectedId) {
    return (
      <StructureDetail
        id={selectedId}
        onClose={() => setSelectedId(null)}
        onEdit={handleEdit}
      />
    )
  }

  return (
    <div className="structures-liste">
      <div className="liste-header">
        <h2>Structures</h2>
        <Button onClick={() => setShowForm(true)} variant="primary">
          <Icon name="Plus" size={16} />
          Nouvelle structure
        </Button>
      </div>
      {structures.length === 0 ? (
        <EmptyState
          icon="Building"
          title="Aucune structure"
          message="Commencez par créer une nouvelle structure"
        />
      ) : (
        <DataTable columns={columns} data={structures} />
      )}
    </div>
  )
}

