import { useEffect, useState, useMemo } from 'react'
import { structuresService } from '@/services/structures.service'
import { DataTable } from '@/components/common/DataTable'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import { logger } from '@/utils/logger'
import { toast } from '@/components/common/Toast'
import StructureDetail from './StructureDetail'
import StructureForm from './StructureForm'
import './StructuresListe.css'

export default function StructuresListe() {
  const [structures, setStructures] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterSecteur, setFilterSecteur] = useState('')
  const [filterActif, setFilterActif] = useState('')
  const [viewMode, setViewMode] = useState('table')

  useEffect(() => {
    loadStructures()
  }, [])

  const loadStructures = async () => {
    setLoading(true)
    try {
      const { data, error } = await structuresService.getAll()
      if (error) {
        logger.error('STRUCTURES_LISTE', 'Erreur chargement structures', error)
        toast.error('Erreur lors du chargement des structures')
        return
      }
      setStructures(data || [])
      logger.debug('STRUCTURES_LISTE', `${data?.length || 0} structures chargées`)
    } catch (error) {
      logger.error('STRUCTURES_LISTE', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  // Filtrer et rechercher
  const filteredStructures = useMemo(() => {
    return structures.filter(struct => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          struct.nom?.toLowerCase().includes(searchLower) ||
          struct.code?.toLowerCase().includes(searchLower) ||
          struct.secteur?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      if (filterType && struct.type !== filterType) return false

      if (filterSecteur && struct.secteur !== filterSecteur) return false

      if (filterActif !== '') {
        const isActif = filterActif === 'true'
        if (struct.actif !== isActif) return false
      }

      return true
    })
  }, [structures, searchTerm, filterType, filterSecteur, filterActif])

  const types = useMemo(() => [...new Set(structures.map(s => s.type).filter(Boolean))], [structures])
  const secteurs = useMemo(() => [...new Set(structures.map(s => s.secteur).filter(Boolean))], [structures])

  // Calculer les statistiques
  const stats = useMemo(() => {
    const actifs = structures.filter(s => s.actif === true).length
    const inactifs = structures.filter(s => s.actif === false).length
    const typesCount = new Set(structures.map(s => s.type).filter(Boolean)).size
    const secteursCount = new Set(structures.map(s => s.secteur).filter(Boolean)).size

    return {
      total: structures.length,
      actifs,
      inactifs,
      typesCount,
      secteursCount
    }
  }, [structures])

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
        toast.error('Erreur lors de la suppression')
        return
      }
      logger.info('STRUCTURES_LISTE', 'Structure supprimée', { id })
      toast.success('Structure supprimée avec succès')
      loadStructures()
      if (selectedId === id) setSelectedId(null)
    } catch (error) {
      logger.error('STRUCTURES_LISTE', 'Erreur inattendue suppression', error)
      toast.error('Une erreur est survenue')
    }
  }

  const columns = [
    { 
      key: 'nom', 
      label: 'Nom',
      render: (value, row) => (
        <div 
          className="structure-name-cell"
          onClick={() => setSelectedId(row.id)}
        >
          <span className="structure-name">{value || '-'}</span>
          {row.code && <span className="structure-code">{row.code}</span>}
        </div>
      ),
    },
    { key: 'type', label: 'Type' },
    { key: 'secteur', label: 'Secteur' },
    {
      key: 'actif',
      label: 'Statut',
      render: (value) => (
        <span className={`statut-badge-modern ${value ? 'statut-actif' : 'statut-inactif'}`}>
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
            onClick={() => setSelectedId(row.id)}
            className="action-button"
            title="Voir détails"
          >
            <Icon name="Eye" size={16} />
          </button>
          <PermissionGuard permission="partenaires.update" hideFallback>
            <button
              onClick={() => handleEdit(row.id)}
              className="action-button"
              title="Modifier"
            >
              <Icon name="Edit" size={16} />
            </button>
          </PermissionGuard>
          <PermissionGuard permission="partenaires.delete" hideFallback>
            <button
              onClick={() => handleDelete(row.id)}
              className="action-button danger"
              title="Supprimer"
            >
              <Icon name="Trash2" size={16} />
            </button>
          </PermissionGuard>
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
      {/* KPIs Statistiques */}
      <div className="structures-stats">
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-primary">
            <Icon name="Building" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Structures</div>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-success">
            <Icon name="CheckCircle" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.actifs}</div>
            <div className="stat-label">Actives</div>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-warning">
            <Icon name="XCircle" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.inactifs}</div>
            <div className="stat-label">Inactives</div>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-default">
            <Icon name="Tag" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.typesCount}</div>
            <div className="stat-label">Types</div>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-default">
            <Icon name="Briefcase" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.secteursCount}</div>
            <div className="stat-label">Secteurs</div>
          </div>
        </div>
      </div>

      {/* Filtres Modernes */}
      <div className="liste-filters-modern">
        <div className="filters-header">
          <h3>Filtres</h3>
          <div className="view-mode-toggle">
            <button
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <Icon name="Table" size={16} />
              Table
            </button>
            <button
              className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
            >
              <Icon name="Grid" size={16} />
              Cartes
            </button>
          </div>
        </div>
        <div className="filters-content">
          <Input
            label="Recherche"
            type="text"
            placeholder="Nom, code, secteur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
            label="Secteur"
            value={filterSecteur}
            onChange={(e) => setFilterSecteur(e.target.value)}
            options={[
              { value: '', label: 'Tous les secteurs' },
              ...secteurs.map(s => ({ value: s, label: s }))
            ]}
          />
          <Select
            label="Statut"
            value={filterActif}
            onChange={(e) => setFilterActif(e.target.value)}
            options={[
              { value: '', label: 'Tous les statuts' },
              { value: 'true', label: 'Actif' },
              { value: 'false', label: 'Inactif' },
            ]}
          />
          {(searchTerm || filterType || filterSecteur || filterActif) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setFilterType('')
                setFilterSecteur('')
                setFilterActif('')
              }}
            >
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {/* Barre d'information */}
      <div className="liste-info-modern">
        <div className="info-content">
          <span>
            <strong>{filteredStructures.length}</strong> structure(s) trouvée(s)
            {filteredStructures.length !== structures.length && ` sur ${structures.length}`}
          </span>
        </div>
      </div>

      {/* Contenu */}
      {filteredStructures.length === 0 ? (
        <EmptyState
          icon="Building"
          title="Aucune structure"
          message={
            structures.length === 0
              ? "Commencez par créer une nouvelle structure"
              : "Aucune structure ne correspond aux filtres"
          }
          action={
            structures.length === 0 && (
              <PermissionGuard permission="partenaires.create">
                <Button onClick={() => setShowForm(true)} variant="primary">
                  <Icon name="Plus" size={16} />
                  Nouvelle structure
                </Button>
              </PermissionGuard>
            )
          }
        />
      ) : viewMode === 'cards' ? (
        <div className="structures-cards-grid">
          {filteredStructures.map(struct => (
            <div key={struct.id} className="structure-card">
              <div className="structure-card-header">
                <h3 className="structure-card-title">{struct.nom}</h3>
                {struct.code && <span className="structure-card-code">{struct.code}</span>}
              </div>
              <div className="structure-card-body">
                <div className="structure-card-item">
                  <Icon name="Tag" size={16} />
                  <span>{struct.type || '-'}</span>
                </div>
                <div className="structure-card-item">
                  <Icon name="Briefcase" size={16} />
                  <span>{struct.secteur || '-'}</span>
                </div>
                <div className="structure-card-item">
                  <span className={`statut-badge-modern ${struct.actif ? 'statut-actif' : 'statut-inactif'}`}>
                    {struct.actif ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="structure-card-actions">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedId(struct.id)}
                >
                  <Icon name="Eye" size={14} />
                  Voir détails
                </Button>
                <PermissionGuard permission="partenaires.update" hideFallback>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(struct.id)}
                  >
                    <Icon name="Edit" size={14} />
                  </Button>
                </PermissionGuard>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="data-table-wrapper">
          <DataTable columns={columns} data={filteredStructures} />
        </div>
      )}
    </div>
  )
}
