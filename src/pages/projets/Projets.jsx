import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { projetsService } from '@/services/projets.service'
import { DataTable } from '@/components/common/DataTable'
import { Button } from '@/components/common/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'

export default function Projets() {
  const [projets, setProjets] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadProjets()
  }, [])

  const loadProjets = async () => {
    setLoading(true)
    try {
      const { data } = await projetsService.getAll()
      setProjets(data || [])
    } catch (error) {
      console.error('Error loading projets:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nom', label: 'Nom' },
    { key: 'type_activite', label: 'Type activité' },
    { key: 'statut', label: 'Statut' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button onClick={() => navigate(`/projets/${row.id}`)}>
          <Icon name="Eye" size={16} />
        </button>
      ),
    },
  ]

  if (loading) return <LoadingState />

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2>Projets</h2>
        <Button onClick={() => navigate('/projets/new')}>
          <Icon name="Plus" size={16} />
          Nouveau projet
        </Button>
      </div>
      {projets.length === 0 ? (
        <EmptyState icon="Briefcase" title="Aucun projet" />
      ) : (
        <DataTable columns={columns} data={projets} />
      )}
    </div>
  )
}

