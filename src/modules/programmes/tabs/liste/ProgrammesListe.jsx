import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { programmesService } from '@/services/programmes.service'
import { DataTable } from '@/components/common/DataTable'
import { Button } from '@/components/common/Button'
import { Select } from '@/components/common/Select'
import { Input } from '@/components/common/Input'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import { toast } from '@/components/common/Toast'
import { logger } from '@/utils/logger'
import { formatCurrency, formatDate } from '@/utils/format'
import './ProgrammesListe.css'

export default function ProgrammesListe() {
  const [programmes, setProgrammes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [viewMode, setViewMode] = useState('table') // 'table' ou 'cards'
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

  // Calculer les statistiques
  const stats = useMemo(() => {
    const totalBudget = programmes.reduce((sum, p) => sum + parseFloat(p.budget || 0), 0)
    const actifs = programmes.filter(p => p.statut === 'ACTIF' || p.statut === 'EN_COURS').length
    const termines = programmes.filter(p => p.statut === 'TERMINE' || p.statut === 'CLOTURE').length
    const enRetard = programmes.filter(p => {
      if (!p.date_fin) return false
      return new Date(p.date_fin) < new Date() && (p.statut === 'ACTIF' || p.statut === 'EN_COURS')
    }).length

    return {
      total: programmes.length,
      actifs,
      termines,
      enRetard,
      totalBudget
    }
  }, [programmes])

  const columns = [
    { 
      key: 'nom', 
      label: 'Nom',
      render: (value, row) => (
        <div 
          className="programme-name-cell"
          onClick={() => navigate(`/programmes/${row.id}`)}
        >
          <span className="programme-name">{value || '-'}</span>
          {row.code && <span className="programme-code">{row.code}</span>}
        </div>
      ),
    },
    { key: 'type', label: 'Type' },
    {
      key: 'date_debut',
      label: 'Date début',
      render: (value) => value ? formatDate(value) : '-',
    },
    {
      key: 'date_fin',
      label: 'Date fin',
      render: (value) => value ? formatDate(value) : '-',
    },
    {
      key: 'budget',
      label: 'Budget',
      render: (value) => value ? formatCurrency(parseFloat(value)) : '-',
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
      {/* KPIs Statistiques */}
      <div className="programmes-stats">
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-primary">
            <Icon name="FolderKanban" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Programmes</div>
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
            <Icon name="AlertCircle" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.enRetard}</div>
            <div className="stat-label">En Retard</div>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-default">
            <Icon name="DollarSign" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(stats.totalBudget)}</div>
            <div className="stat-label">Budget Total</div>
          </div>
        </div>
      </div>

      {/* Filtres améliorés */}
      <div className="liste-filters-modern">
        <div className="filters-header">
          <h3>Filtres de recherche</h3>
          <div className="view-mode-toggle">
            <button
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Vue tableau"
            >
              <Icon name="Table" size={18} />
            </button>
            <button
              className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Vue cartes"
            >
              <Icon name="Grid" size={18} />
            </button>
          </div>
        </div>
        <div className="filters-content">
          <div className="filter-group">
            <Input
              label="Rechercher"
              type="text"
              placeholder="Nom, code, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon="Search"
            />
          </div>
          <div className="filter-group">
            <Select
              label="Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: '', label: 'Tous les types' },
                ...types.map(t => ({ value: t, label: t }))
              ]}
            />
          </div>
          <div className="filter-group">
            <Select
              label="Statut"
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              options={[
                { value: '', label: 'Tous les statuts' },
                ...statuts.map(s => ({ value: s, label: s }))
              ]}
            />
          </div>
          {(searchTerm || filterType || filterStatut) && (
            <div className="filter-group">
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
            </div>
          )}
        </div>
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
          <div className="liste-info-modern">
            <div className="info-content">
              <Icon name="Info" size={16} />
              <span>
                <strong>{filteredProgrammes.length}</strong> programme(s) sur <strong>{programmes.length}</strong>
                {(searchTerm || filterType || filterStatut) && ' (filtrés)'}
              </span>
            </div>
          </div>
          
          {viewMode === 'cards' ? (
            <div className="programmes-cards-grid">
              {filteredProgrammes.map((programme) => (
                <div 
                  key={programme.id} 
                  className="programme-card"
                  onClick={() => navigate(`/programmes/${programme.id}`)}
                >
                  <div className="programme-card-header">
                    <div className="programme-card-title">
                      <h4>{programme.nom || 'Sans nom'}</h4>
                      {programme.code && (
                        <span className="programme-card-code">{programme.code}</span>
                      )}
                    </div>
                    <span className={`statut-badge-modern statut-${programme.statut?.toLowerCase().replace(/\s+/g, '-')}`}>
                      {programme.statut || '-'}
                    </span>
                  </div>
                  
                  <div className="programme-card-body">
                    {programme.type && (
                      <div className="programme-card-item">
                        <Icon name="Tag" size={16} />
                        <span>{programme.type}</span>
                      </div>
                    )}
                    {(programme.date_debut || programme.date_fin) && (
                      <div className="programme-card-item">
                        <Icon name="Calendar" size={16} />
                        <span>
                          {programme.date_debut ? formatDate(programme.date_debut) : '?'} - {programme.date_fin ? formatDate(programme.date_fin) : '?'}
                        </span>
                      </div>
                    )}
                    {programme.budget && (
                      <div className="programme-card-item">
                        <Icon name="DollarSign" size={16} />
                        <span className="budget-value">{formatCurrency(parseFloat(programme.budget))}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="programme-card-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/programmes/${programme.id}`)
                      }}
                      className="card-action-btn"
                      title="Voir détails"
                    >
                      <Icon name="Eye" size={16} />
                      Détails
                    </button>
                    <PermissionGuard permission="programmes.update" hideFallback>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/programmes/${programme.id}/edit`)
                        }}
                        className="card-action-btn"
                        title="Modifier"
                      >
                        <Icon name="Edit" size={16} />
                        Modifier
                      </button>
                    </PermissionGuard>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="data-table-wrapper">
              <DataTable columns={columns} data={filteredProgrammes} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

