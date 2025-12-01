import { useEffect, useState, useMemo } from 'react'
import { partenairesService } from '@/services/partenaires.service'
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
import PartenaireDetail from './PartenaireDetail'
import PartenaireForm from './PartenaireForm'
import './PartenairesListe.css'

export default function PartenairesListe() {
  const [partenaires, setPartenaires] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterActif, setFilterActif] = useState('')
  const [viewMode, setViewMode] = useState('table')

  useEffect(() => {
    loadPartenaires()
  }, [])

  const loadPartenaires = async () => {
    setLoading(true)
    try {
      const { data, error } = await partenairesService.getAll()
      if (error) {
        logger.error('PARTENAIRES_LISTE', 'Erreur chargement partenaires', error)
        toast.error('Erreur lors du chargement des partenaires')
        return
      }
      setPartenaires(data || [])
      logger.debug('PARTENAIRES_LISTE', `${data?.length || 0} partenaires chargés`)
    } catch (error) {
      logger.error('PARTENAIRES_LISTE', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  // Filtrer et rechercher
  const filteredPartenaires = useMemo(() => {
    return partenaires.filter(part => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          part.nom?.toLowerCase().includes(searchLower) ||
          part.code?.toLowerCase().includes(searchLower) ||
          part.pays?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      if (filterType && part.type_partenariat !== filterType) return false

      if (filterActif !== '') {
        const isActif = filterActif === 'true'
        if (part.actif !== isActif) return false
      }

      return true
    })
  }, [partenaires, searchTerm, filterType, filterActif])

  const types = useMemo(() => [...new Set(partenaires.map(p => p.type_partenariat).filter(Boolean))], [partenaires])

  // Calculer les statistiques
  const stats = useMemo(() => {
    const actifs = partenaires.filter(p => p.actif === true).length
    const inactifs = partenaires.filter(p => p.actif === false).length
    const typesCount = new Set(partenaires.map(p => p.type_partenariat).filter(Boolean)).size

    return {
      total: partenaires.length,
      actifs,
      inactifs,
      typesCount
    }
  }, [partenaires])

  const handleEdit = (id) => {
    setEditId(id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce partenaire ?')) {
      return
    }

    try {
      const { error } = await partenairesService.delete(id)
      if (error) {
        logger.error('PARTENAIRES_LISTE', 'Erreur suppression', error)
        toast.error('Erreur lors de la suppression')
        return
      }
      logger.info('PARTENAIRES_LISTE', 'Partenaire supprimé', { id })
      toast.success('Partenaire supprimé avec succès')
      loadPartenaires()
      if (selectedId === id) setSelectedId(null)
    } catch (error) {
      logger.error('PARTENAIRES_LISTE', 'Erreur inattendue suppression', error)
      toast.error('Une erreur est survenue')
    }
  }

  const columns = [
    { 
      key: 'nom', 
      label: 'Nom',
      render: (value, row) => (
        <div 
          className="partenaire-name-cell"
          onClick={() => setSelectedId(row.id)}
        >
          <span className="partenaire-name">{value || '-'}</span>
          {row.code && <span className="partenaire-code">{row.code}</span>}
        </div>
      ),
    },
    { key: 'type_partenariat', label: 'Type de partenariat' },
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
      <PartenaireForm
        id={editId}
        onClose={() => {
          setShowForm(false)
          setEditId(null)
          loadPartenaires()
        }}
      />
    )
  }

  if (selectedId) {
    return (
      <PartenaireDetail
        id={selectedId}
        onClose={() => setSelectedId(null)}
        onEdit={handleEdit}
      />
    )
  }

  return (
    <div className="partenaires-liste">
      {/* KPIs Statistiques */}
      <div className="partenaires-stats">
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-primary">
            <Icon name="Handshake" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Partenaires</div>
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
            label="Type de partenariat"
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
            <strong>{filteredPartenaires.length}</strong> partenaire(s) trouvé(s)
            {filteredPartenaires.length !== partenaires.length && ` sur ${partenaires.length}`}
          </span>
        </div>
      </div>

      {/* Contenu */}
      {filteredPartenaires.length === 0 ? (
        <EmptyState
          icon="Handshake"
          title="Aucun partenaire"
          message={
            partenaires.length === 0
              ? "Commencez par créer un nouveau partenaire"
              : "Aucun partenaire ne correspond aux filtres"
          }
          action={
            partenaires.length === 0 && (
              <PermissionGuard permission="partenaires.create">
                <Button onClick={() => setShowForm(true)} variant="primary">
                  <Icon name="Plus" size={16} />
                  Nouveau partenaire
                </Button>
              </PermissionGuard>
            )
          }
        />
      ) : viewMode === 'cards' ? (
        <div className="partenaires-cards-grid">
          {filteredPartenaires.map(part => (
            <div key={part.id} className="partenaire-card">
              <div className="partenaire-card-header">
                <h3 className="partenaire-card-title">{part.nom}</h3>
                {part.code && <span className="partenaire-card-code">{part.code}</span>}
              </div>
              <div className="partenaire-card-body">
                <div className="partenaire-card-item">
                  <Icon name="Tag" size={16} />
                  <span>{part.type_partenariat || '-'}</span>
                </div>
                <div className="partenaire-card-item">
                  <Icon name="MapPin" size={16} />
                  <span>{part.pays || '-'}</span>
                </div>
                <div className="partenaire-card-item">
                  <span className={`statut-badge-modern ${part.actif ? 'statut-actif' : 'statut-inactif'}`}>
                    {part.actif ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
              <div className="partenaire-card-actions">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedId(part.id)}
                >
                  <Icon name="Eye" size={14} />
                  Voir détails
                </Button>
                <PermissionGuard permission="partenaires.update" hideFallback>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(part.id)}
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
          <DataTable columns={columns} data={filteredPartenaires} />
        </div>
      )}
    </div>
  )
}
