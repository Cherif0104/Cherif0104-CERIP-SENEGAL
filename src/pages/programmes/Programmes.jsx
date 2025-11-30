import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { programmesService } from '@/services/programmes.service'
import { DataTable } from '@/components/common/DataTable'
import { Button } from '@/components/common/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'

export default function Programmes() {
  const [programmes, setProgrammes] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadProgrammes()
  }, [])

  const loadProgrammes = async () => {
    setLoading(true)
    try {
      const { data } = await programmesService.getAll()
      setProgrammes(data || [])
    } catch (error) {
      console.error('Error loading programmes:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nom', label: 'Nom' },
    { key: 'type', label: 'Type' },
    { key: 'date_debut', label: 'Date début' },
    { key: 'date_fin', label: 'Date fin' },
    { key: 'statut', label: 'Statut' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => navigate(`/programmes/${row.id}`)}>
            <Icon name="Eye" size={16} />
          </button>
        </div>
      ),
    },
  ]

  if (loading) return <LoadingState />

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2>Programmes</h2>
        <Button onClick={() => navigate('/programmes/new')}>
          <Icon name="Plus" size={16} />
          Nouveau programme
        </Button>
      </div>
      {programmes.length === 0 ? (
        <EmptyState
          icon="FolderKanban"
          title="Aucun programme"
          message="Commencez par créer un nouveau programme"
        />
      ) : (
        <DataTable columns={columns} data={programmes} />
      )}
    </div>
  )
}

