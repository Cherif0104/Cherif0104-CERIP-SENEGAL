import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { projetsService } from '@/services/projets.service'
import { DataTable } from '@/components/common/DataTable'
import { Button } from '@/components/common/Button'
import { Select } from '@/components/common/Select'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import { toast } from '@/components/common/Toast'
import { logger } from '@/utils/logger'
import './ProjetsListe.css'

export default function ProjetsListe() {
  const [projets, setProjets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterProgramme, setFilterProgramme] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadProjets()
  }, [])

  const loadProjets = async () => {
    setLoading(true)
    try {
      const { data, error } = await projetsService.getAll()
      if (error) {
        logger.error('PROJETS_LISTE', 'Erreur chargement projets', error)
        toast.error('Erreur lors du chargement des projets')
        return
      }
      setProjets(data || [])
      logger.debug('PROJETS_LISTE', `${data?.length || 0} projets chargés`)
    } catch (error) {
      logger.error('PROJETS_LISTE', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  // Filtrer et rechercher
  const filteredProjets = useMemo(() => {
    return projets.filter(proj => {
      // Recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          proj.nom?.toLowerCase().includes(searchLower) ||
          proj.code?.toLowerCase().includes(searchLower) ||
          proj.description?.toLowerCase().includes(searchLower) ||
          proj.type_activite?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Filtre programme
      if (filterProgramme && proj.programme_id !== filterProgramme) return false

      // Filtre statut
      if (filterStatut && proj.statut !== filterStatut) return false

      return true
    })
  }, [projets, searchTerm, filterProgramme, filterStatut])

  // Extraire les valeurs uniques pour les filtres
  const programmes = useMemo(() => {
    const progIds = [...new Set(projets.map(p => p.programme_id).filter(Boolean))]
    // On devrait charger les programmes pour avoir leurs noms, mais pour l'instant on utilise les IDs
    return progIds
  }, [projets])
  
  const statuts = useMemo(() => [...new Set(projets.map(p => p.statut).filter(Boolean))], [projets])

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'nom', label: 'Nom' },
    { 
      key: 'programme_id', 
      label: 'Programme', 
      render: (value, row) => {
        // On devrait charger les programmes pour afficher le nom
        return value || '-'
      }
    },
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
      key: 'budget_alloue',
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
            onClick={() => navigate(`/projets/${row.id}`)}
            className="action-button"
            title="Voir détails"
          >
            <Icon name="Eye" size={16} />
          </button>
          <PermissionGuard permission="projets.update" hideFallback>
            <button
              onClick={() => navigate(`/projets/${row.id}/edit`)}
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
    <div className="projets-liste">
      <div className="liste-header">
        <h2>Liste des Projets</h2>
        <PermissionGuard permission="projets.create">
          <Button onClick={() => navigate('/projets/new')} variant="primary">
            <Icon name="Plus" size={16} />
            Nouveau projet
          </Button>
        </PermissionGuard>
      </div>

      <div className="liste-filters">
        <div className="input-wrapper">
          <label className="input-label">Rechercher</label>
          <input
            type="text"
            className="input-field"
            placeholder="Nom, code, description, type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          label="Programme"
          value={filterProgramme}
          onChange={(e) => setFilterProgramme(e.target.value)}
          options={[
            { value: '', label: 'Tous les programmes' },
            ...programmes.map(p => ({ value: p, label: `Programme ${p.substring(0, 8)}...` }))
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
        {(searchTerm || filterProgramme || filterStatut) && (
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('')
              setFilterProgramme('')
              setFilterStatut('')
            }}
          >
            <Icon name="X" size={16} />
            Réinitialiser
          </Button>
        )}
      </div>

      {projets.length === 0 ? (
        <EmptyState icon="Briefcase" title="Aucun projet" message="Commencez par créer un nouveau projet" />
      ) : filteredProjets.length === 0 ? (
        <EmptyState
          icon="Search"
          title="Aucun résultat"
          message="Aucun projet ne correspond à vos critères de recherche"
        />
      ) : (
        <>
          <div className="liste-info">
            <span>
              {filteredProjets.length} projet(s) sur {projets.length}
              {(searchTerm || filterProgramme || filterStatut) && ' (filtrés)'}
            </span>
          </div>
          <DataTable columns={columns} data={filteredProjets} />
        </>
      )}
    </div>
  )
}

