import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { programmesService } from '@/services/programmes.service'
import { DataTable } from '@/components/common/DataTable'
import { Button } from '@/components/common/Button'
import { Select } from '@/components/common/Select'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import { toast } from '@/components/common/Toast'
import { logger } from '@/utils/logger'
import './ProgrammesListe.css'

export default function ProgrammesListe() {
  const [programmes, setProgrammes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadProgrammes()
  }, [])

  const loadProgrammes = async () => {
    setLoading(true)
    try {
      const { data, error } = await programmesService.getAll()
      if (error) {
        logger.error('PROGRAMMES_LISTE', 'Erreur chargement programmes', error)
        toast.error('Erreur lors du chargement des programmes')
        return
      }
      setProgrammes(data || [])
      logger.debug('PROGRAMMES_LISTE', `${data?.length || 0} programmes chargés`)
    } catch (error) {
      logger.error('PROGRAMMES_LISTE', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  // Filtrer et rechercher
  const filteredProgrammes = useMemo(() => {
    return programmes.filter(prog => {
      // Recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          prog.nom?.toLowerCase().includes(searchLower) ||
          prog.code?.toLowerCase().includes(searchLower) ||
          prog.description?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Filtre type
      if (filterType && prog.type !== filterType) return false

      // Filtre statut
      if (filterStatut && prog.statut !== filterStatut) return false

      return true
    })
  }, [programmes, searchTerm, filterType, filterStatut])

  // Extraire les valeurs uniques pour les filtres
  const types = useMemo(() => [...new Set(programmes.map(p => p.type).filter(Boolean))], [programmes])
  const statuts = useMemo(() => [...new Set(programmes.map(p => p.statut).filter(Boolean))], [programmes])

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'nom', label: 'Nom' },
    { key: 'type', label: 'Type' },
    {
      key: 'date_debut',
      label: 'Date début',
      render: (value) => (value ? new Date(value).toLocaleDateString('fr-FR') : '-'),
    },
    {
      key: 'date_fin',
      label: 'Date fin',
      render: (value) => (value ? new Date(value).toLocaleDateString('fr-FR') : '-'),
    },
    {
      key: 'budget',
      label: 'Budget',
      render: (value) =>
        value
          ? new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XOF',
              minimumFractionDigits: 0,
            }).format(parseFloat(value))
          : '-',
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (value) => (
        <span className={`statut-badge statut-${value?.toLowerCase().replace(/\s+/g, '-')}`}>{value}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate(`/programmes/${row.id}`)}
            className="action-button"
            title="Voir détails"
          >
            <Icon name="Eye" size={16} />
          </button>
          <PermissionGuard permission="programmes.update" hideFallback>
            <button
              onClick={() => navigate(`/programmes/${row.id}/edit`)}
              className="action-button"
              title="Modifier"
            >
              <Icon name="Edit" size={16} />
            </button>
          </PermissionGuard>
        </div>
      ),
    },
  ]

  if (loading) return <LoadingState />

  return (
    <div className="programmes-liste">
      <div className="liste-header">
        <h2>Liste des Programmes</h2>
        <PermissionGuard permission="programmes.create">
          <Button onClick={() => navigate('/programmes/new')} variant="primary">
            <Icon name="Plus" size={16} />
            Nouveau programme
          </Button>
        </PermissionGuard>
      </div>

      <div className="liste-filters">
        <div className="input-wrapper">
          <label className="input-label">Rechercher</label>
          <input
            type="text"
            className="input-field"
            placeholder="Nom, code, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          label="Type"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          options={[
            { value: '', label: 'Tous les types' },
            ...types.map(t => ({ value: t, label: t }))
          ]}
        />
        <Select
          label="Statut"
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          options={[
            { value: '', label: 'Tous les statuts' },
            ...statuts.map(s => ({ value: s, label: s }))
          ]}
        />
        {(searchTerm || filterType || filterStatut) && (
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('')
              setFilterType('')
              setFilterStatut('')
            }}
          >
            <Icon name="X" size={16} />
            Réinitialiser
          </Button>
        )}
      </div>

      {programmes.length === 0 ? (
        <EmptyState
          icon="FolderKanban"
          title="Aucun programme"
          message="Commencez par créer un nouveau programme"
        />
      ) : filteredProgrammes.length === 0 ? (
        <EmptyState
          icon="Search"
          title="Aucun résultat"
          message="Aucun programme ne correspond à vos critères de recherche"
        />
      ) : (
        <>
          <div className="liste-info">
            <span>
              {filteredProgrammes.length} programme(s) sur {programmes.length}
              {(searchTerm || filterType || filterStatut) && ' (filtrés)'}
            </span>
          </div>
          <DataTable columns={columns} data={filteredProgrammes} />
        </>
      )}
    </div>
  )
}

