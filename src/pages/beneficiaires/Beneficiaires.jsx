import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { beneficiairesService } from '@/services/beneficiaires.service'
import { DataTable } from '@/components/common/DataTable'
import { Button } from '@/components/common/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'

export default function Beneficiaires() {
  const [beneficiaires, setBeneficiaires] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadBeneficiaires()
  }, [])

  const loadBeneficiaires = async () => {
    setLoading(true)
    try {
      const { data } = await beneficiairesService.getAll()
      setBeneficiaires(data || [])
    } catch (error) {
      console.error('Error loading beneficiaires:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'nom',
      label: 'Nom',
      render: (_, row) => {
        if (row.nom && row.prenom) {
          return `${row.prenom} ${row.nom}`
        }
        const personne = row.personnes
        if (personne) {
          return `${personne.prenom} ${personne.nom}`
        }
        const candidat = row.candidats
        if (candidat) {
          return `${candidat.prenom || ''} ${candidat.nom || candidat.raison_sociale || ''}`.trim()
        }
        return row.raison_sociale || '-'
      },
    },
    { key: 'secteur', label: 'Secteur' },
    { key: 'statut', label: 'Statut' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button onClick={() => navigate(`/beneficiaires/${row.id}`)}>
          <Icon name="Eye" size={16} />
        </button>
      ),
    },
  ]

  if (loading) return <LoadingState />

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2>Bénéficiaires</h2>
        <Button onClick={() => navigate('/beneficiaires/new')}>
          <Icon name="Plus" size={16} />
          Nouveau bénéficiaire
        </Button>
      </div>
      {beneficiaires.length === 0 ? (
        <EmptyState icon="Users" title="Aucun bénéficiaire" />
      ) : (
        <DataTable columns={columns} data={beneficiaires} />
      )}
    </div>
  )
}

