import { useState } from 'react'
import { DataTable } from '@/components/common/DataTable'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { EmptyState } from '@/components/common/EmptyState'

export default function Referentiels() {
  const [referentiels] = useState([
    { id: 1, type: 'Secteurs d\'activité', count: 10 },
    { id: 2, type: 'Types de financement', count: 5 },
    { id: 3, type: 'Statuts', count: 15 },
    { id: 4, type: 'Régions', count: 14 },
  ])

  const columns = [
    { key: 'type', label: 'Type de référentiel' },
    { key: 'count', label: 'Nombre d\'éléments' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button>
          <Icon name="Edit" size={16} />
        </button>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2>Référentiels</h2>
        <Button>
          <Icon name="Plus" size={16} />
          Nouveau référentiel
        </Button>
      </div>
      {referentiels.length === 0 ? (
        <EmptyState icon="Database" title="Aucun référentiel" />
      ) : (
        <DataTable columns={columns} data={referentiels} />
      )}
    </div>
  )
}

