import { useEffect, useState } from 'react'
import { partenairesService } from '@/services/partenaires.service'
import { DataTable } from '@/components/common/DataTable'
import { Button } from '@/components/common/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import PartenaireDetail from './PartenaireDetail'
import PartenaireForm from './PartenaireForm'

export default function PartenairesListe() {
  const [partenaires, setPartenaires] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)

  useEffect(() => {
    loadPartenaires()
  }, [])

  const loadPartenaires = async () => {
    setLoading(true)
    try {
      const { data, error } = await partenairesService.getAll()
      if (error) {
        logger.error('PARTENAIRES_LISTE', 'Erreur chargement partenaires', error)
        return
      }
      setPartenaires(data || [])
      logger.debug('PARTENAIRES_LISTE', `${data?.length || 0} partenaires chargés`)
    } catch (error) {
      logger.error('PARTENAIRES_LISTE', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id) => {
    setEditId(id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce partenaire ?')) {
      return
    }

    try {
      const { error } = await partenairesService.delete(id)
      if (error) {
        logger.error('PARTENAIRES_LISTE', 'Erreur suppression', error)
        alert('Erreur lors de la suppression')
        return
      }
      logger.info('PARTENAIRES_LISTE', 'Partenaire supprimé', { id })
      loadPartenaires()
      if (selectedId === id) setSelectedId(null)
    } catch (error) {
      logger.error('PARTENAIRES_LISTE', 'Erreur inattendue suppression', error)
    }
  }

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'nom', label: 'Nom' },
    { key: 'type_partenariat', label: 'Type de partenariat' },
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
      <PartenaireForm
        id={editId}
        onClose={() => {
          setShowForm(false)
          setEditId(null)
          loadPartenaires()
        }}
      />
    )
  }

  if (selectedId) {
    return (
      <PartenaireDetail
        id={selectedId}
        onClose={() => setSelectedId(null)}
        onEdit={handleEdit}
      />
    )
  }

  return (
    <div className="partenaires-liste">
      <div className="liste-header">
        <h2>Partenaires</h2>
        <Button onClick={() => setShowForm(true)} variant="primary">
          <Icon name="Plus" size={16} />
          Nouveau partenaire
        </Button>
      </div>
      {partenaires.length === 0 ? (
        <EmptyState
          icon="Handshake"
          title="Aucun partenaire"
          message="Commencez par créer un nouveau partenaire"
        />
      ) : (
        <DataTable columns={columns} data={partenaires} />
      )}
    </div>
  )
}

