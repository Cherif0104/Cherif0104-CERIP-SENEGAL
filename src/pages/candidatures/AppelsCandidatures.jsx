import { useEffect, useState } from 'react'
import { DataTable } from '@/components/common/DataTable'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'

export default function AppelsCandidatures() {
  const [appels, setAppels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Placeholder
    setLoading(false)
  }, [])

  if (loading) return <LoadingState />

  return (
    <div>
      <h2>Appels à candidatures</h2>
      {appels.length === 0 ? (
        <EmptyState icon="UserCheck" title="Aucun appel" />
      ) : (
        <DataTable columns={[]} data={appels} />
      )}
    </div>
  )
}

