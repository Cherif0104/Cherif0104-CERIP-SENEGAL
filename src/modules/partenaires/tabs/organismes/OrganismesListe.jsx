import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { organismesService } from '@/services/organismes.service'
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
import OrganismeDetail from './OrganismeDetail'
import OrganismeForm from './OrganismeForm'
import './OrganismesListe.css'

export default function OrganismesListe() {
  const navigate = useNavigate()
  const [organismes, setOrganismes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterActif, setFilterActif] = useState('')
  const [viewMode, setViewMode] = useState('table') // 'table' ou 'cards'

  useEffect(() => {
    loadOrganismes()
  }, [])

  const loadOrganismes = async () => {
    setLoading(true)
    try {
      const { data, error } = await organismesService.getAll()
      if (error) {
        logger.error('ORGANISMES_LISTE', 'Erreur chargement organismes', error)
        toast.error('Erreur lors du chargement des organismes')
        return
      }
      setOrganismes(data || [])
      logger.debug('ORGANISMES_LISTE', `${data?.length || 0} organismes chargés`)
    } catch (error) {
      logger.error('ORGANISMES_LISTE', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  // Filtrer et rechercher
  const filteredOrganismes = useMemo(() => {
    return organismes.filter(org => {
      // Recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          org.nom?.toLowerCase().includes(searchLower) ||
          org.code?.toLowerCase().includes(searchLower) ||
          org.pays?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Filtre type
      if (filterType && org.type !== filterType) return false

      // Filtre actif
      if (filterActif !== '') {
        const isActif = filterActif === 'true'
        if (org.actif !== isActif) return false
      }

      return true
    })
  }, [organismes, searchTerm, filterType, filterActif])

  // Extraire les valeurs uniques pour les filtres
  const types = useMemo(() => [...new Set(organismes.map(o => o.type).filter(Boolean))], [organismes])

  // Calculer les statistiques
  const stats = useMemo(() => {
    const actifs = organismes.filter(o => o.actif === true).length
    const inactifs = organismes.filter(o => o.actif === false).length
    const typesCount = new Set(organismes.map(o => o.type).filter(Boolean)).size

    return {
      total: organismes.length,
      actifs,
      inactifs,
      typesCount
    }
  }, [organismes])

  const handleEdit = (id) => {
    setEditId(id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet organisme ?')) {
      return
    }

    try {
      const { error } = await organismesService.delete(id)
      if (error) {
        logger.error('ORGANISMES_LISTE', 'Erreur suppression', error)
        toast.error('Erreur lors de la suppression')
        return
      }
      logger.info('ORGANISMES_LISTE', 'Organisme supprimé', { id })
      toast.success('Organisme supprimé avec succès')
      loadOrganismes()
      if (selectedId === id) setSelectedId(null)
    } catch (error) {
      logger.error('ORGANISMES_LISTE', 'Erreur inattendue suppression', error)
      toast.error('Une erreur est survenue')
    }
  }

  const columns = [
    { 
      key: 'nom', 
      label: 'Nom',
      render: (value, row) => (
        <div 
          className="organisme-name-cell"
          onClick={() => setSelectedId(row.id)}
        >
          <span className="organisme-name">{value || '-'}</span>
          {row.code && <span className="organisme-code">{row.code}</span>}
        </div>
      ),
    },
    { key: 'type', label: 'Type' },
    { key: 'pays', label: 'Pays' },
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
      <OrganismeForm
        id={editId}
        onClose={() => {
          setShowForm(false)
          setEditId(null)
          loadOrganismes()
        }}
      />
    )
  }

  if (selectedId) {
    return (
      <OrganismeDetail
        id={selectedId}
        onClose={() => setSelectedId(null)}
        onEdit={handleEdit}
      />
    )
  }

  return (
    <div className="organismes-liste">
      {/* KPIs Statistiques */}
      <div className="organismes-stats">
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-primary">
            <Icon name="Globe" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Organismes</div>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-success">
            <Icon name="CheckCircle" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.actifs}</div>
            <div className="stat-label">Actifs</div>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-warning">
            <Icon name="XCircle" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.inactifs}</div>
            <div className="stat-label">Inactifs</div>
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
            placeholder="Nom, code, pays..."
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
            label="Statut"
            value={filterActif}
            onChange={(e) => setFilterActif(e.target.value)}
            options={[
              { value: '', label: 'Tous les statuts' },
              { value: 'true', label: 'Actif' },
              { value: 'false', label: 'Inactif' },
            ]}
          />
          {(searchTerm || filterType || filterActif) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setFilterType('')
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
            <strong>{filteredOrganismes.length}</strong> organisme(s) trouvé(s)
            {filteredOrganismes.length !== organismes.length && ` sur ${organismes.length}`}
          </span>
        </div>
      </div>

      {/* Contenu */}
      {filteredOrganismes.length === 0 ? (
        <EmptyState
          icon="Globe"
          title="Aucun organisme"
          message={
            organismes.length === 0
              ? "Commencez par créer un nouvel organisme international"
              : "Aucun organisme ne correspond aux filtres"
          }
          action={
            organismes.length === 0 && (
              <PermissionGuard permission="partenaires.create">
                <Button onClick={() => setShowForm(true)} variant="primary">
                  <Icon name="Plus" size={16} />
                  Nouvel organisme
                </Button>
              </PermissionGuard>
            )
          }
        />
      ) : viewMode === 'cards' ? (
        <div className="organismes-cards-grid">
          {filteredOrganismes.map(org => (
            <div key={org.id} className="organisme-card">
              <div className="organisme-card-header">
                <h3 className="organisme-card-title">{org.nom}</h3>
                {org.code && <span className="organisme-card-code">{org.code}</span>}
              </div>
              <div className="organisme-card-body">
                <div className="organisme-card-item">
                  <Icon name="Tag" size={16} />
                  <span>{org.type || '-'}</span>
                </div>
                <div className="organisme-card-item">
                  <Icon name="MapPin" size={16} />
                  <span>{org.pays || '-'}</span>
                </div>
                <div className="organisme-card-item">
                  <span className={`statut-badge-modern ${org.actif ? 'statut-actif' : 'statut-inactif'}`}>
                    {org.actif ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
              <div className="organisme-card-actions">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedId(org.id)}
                >
                  <Icon name="Eye" size={14} />
                  Voir détails
                </Button>
                <PermissionGuard permission="partenaires.update" hideFallback>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(org.id)}
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
          <DataTable columns={columns} data={filteredOrganismes} />
        </div>
      )}
    </div>
  )
}
