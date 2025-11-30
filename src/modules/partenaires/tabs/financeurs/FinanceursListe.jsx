import { useEffect, useState } from 'react'
import { financeursService } from '@/services/financeurs.service'
import { DataTable } from '@/components/common/DataTable'
import { Button } from '@/components/common/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import FinanceurDetail from './FinanceurDetail'
import FinanceurForm from './FinanceurForm'

export default function FinanceursListe() {
  const [financeurs, setFinanceurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)

  useEffect(() => {
    loadFinanceurs()
  }, [])

  const loadFinanceurs = async () => {
    setLoading(true)
    try {
      const { data, error } = await financeursService.getAll()
      if (error) {
        logger.error('FINANCEURS_LISTE', 'Erreur chargement financeurs', error)
        return
      }
      setFinanceurs(data || [])
      logger.debug('FINANCEURS_LISTE', `${data?.length || 0} financeurs chargés`)
    } catch (error) {
      logger.error('FINANCEURS_LISTE', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id) => {
    setEditId(id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce financeur ?')) {
      return
    }

    try {
      const { error } = await financeursService.delete(id)
      if (error) {
        logger.error('FINANCEURS_LISTE', 'Erreur suppression', error)
        alert('Erreur lors de la suppression')
        return
      }
      logger.info('FINANCEURS_LISTE', 'Financeur supprimé', { id })
      loadFinanceurs()
      if (selectedId === id) setSelectedId(null)
    } catch (error) {
      logger.error('FINANCEURS_LISTE', 'Erreur inattendue suppression', error)
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
      <FinanceurForm
        id={editId}
        onClose={() => {
          setShowForm(false)
          setEditId(null)
          loadFinanceurs()
        }}
      />
    )
  }

  if (selectedId) {
    return (
      <FinanceurDetail
        id={selectedId}
        onClose={() => setSelectedId(null)}
        onEdit={handleEdit}
      />
    )
  }

  return (
    <div className="financeurs-liste">
      <div className="liste-header">
        <h2>Financeurs</h2>
        <Button onClick={() => setShowForm(true)} variant="primary">
          <Icon name="Plus" size={16} />
          Nouveau financeur
        </Button>
      </div>
      {financeurs.length === 0 ? (
        <EmptyState
          icon="DollarSign"
          title="Aucun financeur"
          message="Commencez par créer un nouveau financeur"
        />
      ) : (
        <DataTable columns={columns} data={financeurs} />
      )}
    </div>
  )
}

