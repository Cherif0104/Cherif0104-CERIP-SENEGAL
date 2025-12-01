import { useEffect, useState, useMemo } from 'react'
import { financeursService } from '@/services/financeurs.service'
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
import FinanceurDetail from './FinanceurDetail'
import FinanceurForm from './FinanceurForm'
import './FinanceursListe.css'

export default function FinanceursListe() {
  const [financeurs, setFinanceurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterActif, setFilterActif] = useState('')
  const [viewMode, setViewMode] = useState('table')

  useEffect(() => {
    loadFinanceurs()
  }, [])

  const loadFinanceurs = async () => {
    setLoading(true)
    try {
      const { data, error } = await financeursService.getAll()
      if (error) {
        logger.error('FINANCEURS_LISTE', 'Erreur chargement financeurs', error)
        toast.error('Erreur lors du chargement des financeurs')
        return
      }
      setFinanceurs(data || [])
      logger.debug('FINANCEURS_LISTE', `${data?.length || 0} financeurs chargés`)
    } catch (error) {
      logger.error('FINANCEURS_LISTE', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  // Filtrer et rechercher
  const filteredFinanceurs = useMemo(() => {
    return financeurs.filter(fin => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          fin.nom?.toLowerCase().includes(searchLower) ||
          fin.code?.toLowerCase().includes(searchLower) ||
          fin.pays?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      if (filterType && fin.type !== filterType) return false

      if (filterActif !== '') {
        const isActif = filterActif === 'true'
        if (fin.actif !== isActif) return false
      }

      return true
    })
  }, [financeurs, searchTerm, filterType, filterActif])

  const types = useMemo(() => [...new Set(financeurs.map(f => f.type).filter(Boolean))], [financeurs])

  // Calculer les statistiques
  const stats = useMemo(() => {
    const actifs = financeurs.filter(f => f.actif === true).length
    const inactifs = financeurs.filter(f => f.actif === false).length
    const typesCount = new Set(financeurs.map(f => f.type).filter(Boolean)).size

    return {
      total: financeurs.length,
      actifs,
      inactifs,
      typesCount
    }
  }, [financeurs])

  const handleEdit = (id) => {
    setEditId(id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce financeur ?')) {
      return
    }

    try {
      const { error } = await financeursService.delete(id)
      if (error) {
        logger.error('FINANCEURS_LISTE', 'Erreur suppression', error)
        toast.error('Erreur lors de la suppression')
        return
      }
      logger.info('FINANCEURS_LISTE', 'Financeur supprimé', { id })
      toast.success('Financeur supprimé avec succès')
      loadFinanceurs()
      if (selectedId === id) setSelectedId(null)
    } catch (error) {
      logger.error('FINANCEURS_LISTE', 'Erreur inattendue suppression', error)
      toast.error('Une erreur est survenue')
    }
  }

  const columns = [
    { 
      key: 'nom', 
      label: 'Nom',
      render: (value, row) => (
        <div 
          className="financeur-name-cell"
          onClick={() => setSelectedId(row.id)}
        >
          <span className="financeur-name">{value || '-'}</span>
          {row.code && <span className="financeur-code">{row.code}</span>}
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
      <FinanceurForm
        id={editId}
        onClose={() => {
          setShowForm(false)
          setEditId(null)
          loadFinanceurs()
        }}
      />
    )
  }

  if (selectedId) {
    return (
      <FinanceurDetail
        id={selectedId}
        onClose={() => setSelectedId(null)}
        onEdit={handleEdit}
      />
    )
  }

  return (
    <div className="financeurs-liste">
      {/* KPIs Statistiques */}
      <div className="financeurs-stats">
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-primary">
            <Icon name="DollarSign" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Financeurs</div>
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
            <strong>{filteredFinanceurs.length}</strong> financeur(s) trouvé(s)
            {filteredFinanceurs.length !== financeurs.length && ` sur ${financeurs.length}`}
          </span>
        </div>
      </div>

      {/* Contenu */}
      {filteredFinanceurs.length === 0 ? (
        <EmptyState
          icon="DollarSign"
          title="Aucun financeur"
          message={
            financeurs.length === 0
              ? "Commencez par créer un nouveau financeur"
              : "Aucun financeur ne correspond aux filtres"
          }
          action={
            financeurs.length === 0 && (
              <PermissionGuard permission="partenaires.create">
                <Button onClick={() => setShowForm(true)} variant="primary">
                  <Icon name="Plus" size={16} />
                  Nouveau financeur
                </Button>
              </PermissionGuard>
            )
          }
        />
      ) : viewMode === 'cards' ? (
        <div className="financeurs-cards-grid">
          {filteredFinanceurs.map(fin => (
            <div key={fin.id} className="financeur-card">
              <div className="financeur-card-header">
                <h3 className="financeur-card-title">{fin.nom}</h3>
                {fin.code && <span className="financeur-card-code">{fin.code}</span>}
              </div>
              <div className="financeur-card-body">
                <div className="financeur-card-item">
                  <Icon name="Tag" size={16} />
                  <span>{fin.type || '-'}</span>
                </div>
                <div className="financeur-card-item">
                  <Icon name="MapPin" size={16} />
                  <span>{fin.pays || '-'}</span>
                </div>
                <div className="financeur-card-item">
                  <span className={`statut-badge-modern ${fin.actif ? 'statut-actif' : 'statut-inactif'}`}>
                    {fin.actif ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
              <div className="financeur-card-actions">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedId(fin.id)}
                >
                  <Icon name="Eye" size={14} />
                  Voir détails
                </Button>
                <PermissionGuard permission="partenaires.update" hideFallback>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(fin.id)}
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
          <DataTable columns={columns} data={filteredFinanceurs} />
        </div>
      )}
    </div>
  )
}
