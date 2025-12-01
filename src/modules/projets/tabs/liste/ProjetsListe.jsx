import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { projetsService } from '@/services/projets.service'
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
import './ProjetsListe.css'

export default function ProjetsListe() {
  const [projets, setProjets] = useState([])
  const [programmes, setProgrammes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterProgramme, setFilterProgramme] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [filterType, setFilterType] = useState('')
  const [viewMode, setViewMode] = useState('table') // 'table' ou 'cards'
  const navigate = useNavigate()

  useEffect(() => {
    loadProjets()
    loadProgrammes()
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

  const loadProgrammes = async () => {
    try {
      const { data, error } = await programmesService.getAll()
      if (error) {
        logger.error('PROJETS_LISTE', 'Erreur chargement programmes', error)
        return
      }
      setProgrammes(data || [])
    } catch (error) {
      logger.error('PROJETS_LISTE', 'Erreur inattendue chargement programmes', error)
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

      // Filtre type
      if (filterType && proj.type_activite !== filterType) return false

      // Filtre statut
      if (filterStatut && proj.statut !== filterStatut) return false

      return true
    })
  }, [projets, searchTerm, filterProgramme, filterType, filterStatut])

  // Extraire les valeurs uniques pour les filtres
  const types = useMemo(() => [...new Set(projets.map(p => p.type_activite).filter(Boolean))], [projets])
  const statuts = useMemo(() => [...new Set(projets.map(p => p.statut).filter(Boolean))], [projets])

  // Calculer les statistiques
  const stats = useMemo(() => {
    const totalBudget = projets.reduce((sum, p) => sum + parseFloat(p.budget_alloue || 0), 0)
    const actifs = projets.filter(p => p.statut === 'ACTIF' || p.statut === 'EN_COURS' || p.statut === 'OUVERT').length
    const termines = projets.filter(p => p.statut === 'TERMINE' || p.statut === 'CLOTURE').length
    const enRetard = projets.filter(p => {
      if (!p.date_fin) return false
      return new Date(p.date_fin) < new Date() && (p.statut === 'ACTIF' || p.statut === 'EN_COURS' || p.statut === 'OUVERT')
    }).length

    return {
      total: projets.length,
      actifs,
      termines,
      enRetard,
      totalBudget
    }
  }, [projets])

  const columns = [
    { 
      key: 'nom', 
      label: 'Nom',
      render: (value, row) => (
        <div 
          className="projet-name-cell"
          onClick={() => navigate(`/projets/${row.id}`)}
        >
          <span className="projet-name">{value || '-'}</span>
          {row.code && <span className="projet-code">{row.code}</span>}
        </div>
      ),
    },
    { 
      key: 'type_activite', 
      label: 'Type'
    },
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
      key: 'budget_alloue',
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
      {/* KPIs Statistiques */}
      <div className="projets-stats">
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-primary">
            <Icon name="Briefcase" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Projets</div>
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
              label="Programme"
              value={filterProgramme}
              onChange={(e) => setFilterProgramme(e.target.value)}
              options={[
                { value: '', label: 'Tous les programmes' },
                ...programmes.map(p => ({ value: p.id, label: p.nom || p.code || p.id }))
              ]}
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
          {(searchTerm || filterProgramme || filterType || filterStatut) && (
            <div className="filter-group">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setFilterProgramme('')
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

      {projets.length === 0 ? (
        <EmptyState
          icon="Briefcase"
          title="Aucun projet"
          message="Commencez par créer un nouveau projet"
        />
      ) : filteredProjets.length === 0 ? (
        <EmptyState
          icon="Search"
          title="Aucun résultat"
          message="Aucun projet ne correspond à vos critères de recherche"
        />
      ) : (
        <>
          <div className="liste-info-modern">
            <div className="info-content">
              <Icon name="Info" size={16} />
              <span>
                <strong>{filteredProjets.length}</strong> projet(s) sur <strong>{projets.length}</strong>
                {(searchTerm || filterProgramme || filterType || filterStatut) && ' (filtrés)'}
              </span>
            </div>
          </div>
          
          {viewMode === 'cards' ? (
            <div className="projets-cards-grid">
              {filteredProjets.map((projet) => (
                <div 
                  key={projet.id} 
                  className="projet-card"
                  onClick={() => navigate(`/projets/${projet.id}`)}
                >
                  <div className="projet-card-header">
                    <div className="projet-card-title">
                      <h4>{projet.nom || 'Sans nom'}</h4>
                      {projet.code && (
                        <span className="projet-card-code">{projet.code}</span>
                      )}
                    </div>
                    <span className={`statut-badge-modern statut-${projet.statut?.toLowerCase().replace(/\s+/g, '-')}`}>
                      {projet.statut || '-'}
                    </span>
                  </div>
                  
                  <div className="projet-card-body">
                    {projet.type_activite && (
                      <div className="projet-card-item">
                        <Icon name="Tag" size={16} />
                        <span>{projet.type_activite}</span>
                      </div>
                    )}
                    {projet.programme_id && (
                      <div className="projet-card-item">
                        <Icon name="FolderKanban" size={16} />
                        <span>
                          {programmes.find(p => p.id === projet.programme_id)?.nom || projet.programme_id}
                        </span>
                      </div>
                    )}
                    {(projet.date_debut || projet.date_fin) && (
                      <div className="projet-card-item">
                        <Icon name="Calendar" size={16} />
                        <span>
                          {projet.date_debut ? formatDate(projet.date_debut) : '?'} - {projet.date_fin ? formatDate(projet.date_fin) : '?'}
                        </span>
                      </div>
                    )}
                    {projet.budget_alloue && (
                      <div className="projet-card-item">
                        <Icon name="DollarSign" size={16} />
                        <span className="budget-value">{formatCurrency(parseFloat(projet.budget_alloue))}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="projet-card-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/projets/${projet.id}`)
                      }}
                      className="card-action-btn"
                      title="Voir détails"
                    >
                      <Icon name="Eye" size={16} />
                      Détails
                    </button>
                    <PermissionGuard permission="projets.update" hideFallback>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/projets/${projet.id}/edit`)
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
              <DataTable columns={columns} data={filteredProjets} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
