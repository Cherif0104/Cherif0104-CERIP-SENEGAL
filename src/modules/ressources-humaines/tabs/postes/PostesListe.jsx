import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { postesService } from '@/services/postes.service'
import { DataTable } from '@/components/common/DataTable'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import { toast } from '@/components/common/Toast'
import { logger } from '@/utils/logger'
import { formatCurrency } from '@/utils/format'
import './PostesListe.css'

export default function PostesListe() {
  const navigate = useNavigate()
  const [postes, setPostes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [filterDepartement, setFilterDepartement] = useState('')
  const [viewMode, setViewMode] = useState('table')

  useEffect(() => {
    loadPostes()
  }, [])

  const loadPostes = async () => {
    setLoading(true)
    try {
      const { data, error } = await postesService.getAll()
      if (error) {
        logger.error('POSTES_LISTE', 'Erreur chargement postes', error)
        toast.error('Erreur lors du chargement des postes')
        return
      }
      setPostes(data || [])
      logger.debug('POSTES_LISTE', `${data?.length || 0} postes chargés`)
    } catch (error) {
      logger.error('POSTES_LISTE', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  // Filtrer et rechercher
  const filteredPostes = useMemo(() => {
    return postes.filter(poste => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          poste.titre?.toLowerCase().includes(searchLower) ||
          poste.code?.toLowerCase().includes(searchLower) ||
          poste.departement?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      if (filterStatut && poste.statut !== filterStatut) return false

      if (filterDepartement && poste.departement !== filterDepartement) return false

      return true
    })
  }, [postes, searchTerm, filterStatut, filterDepartement])

  // Extraire les valeurs uniques pour les filtres
  const statuts = useMemo(() => [...new Set(postes.map(p => p.statut).filter(Boolean))], [postes])
  const departements = useMemo(() => [...new Set(postes.map(p => p.departement).filter(Boolean))], [postes])

  // Calculer les statistiques
  const stats = useMemo(() => {
    const ouverts = postes.filter(p => p.statut === 'OUVERT').length
    const fermes = postes.filter(p => p.statut === 'FERME').length
    const totalEmployes = postes.reduce((sum, p) => sum + (p.nombre_employes || 0), 0)

    return {
      total: postes.length,
      ouverts,
      fermes,
      totalEmployes
    }
  }, [postes])

  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (value, row) => (
        <div 
          className="poste-name-cell"
          onClick={() => navigate(`/rh/postes/${row.id}`)}
        >
          <span className="poste-code">{value || '-'}</span>
        </div>
      ),
    },
    {
      key: 'titre',
      label: 'Titre',
      render: (value, row) => (
        <div 
          className="poste-name-cell"
          onClick={() => navigate(`/rh/postes/${row.id}`)}
        >
          <span className="poste-name">{value || '-'}</span>
        </div>
      ),
    },
    {
      key: 'departement',
      label: 'Département',
      render: (value) => value || '-',
    },
    {
      key: 'type_contrat',
      label: 'Type contrat',
      render: (value) => value || '-',
    },
    {
      key: 'salaire_min',
      label: 'Salaire min',
      render: (value) => value ? formatCurrency(value) : '-',
    },
    {
      key: 'nombre_employes',
      label: 'Employés',
      render: (value) => value || 0,
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (value) => (
        <span className={`statut-badge-modern statut-${value?.toLowerCase().replace(/\s+/g, '-') || 'ouvert'}`}>
          {value || 'Ouvert'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate(`/rh/postes/${row.id}`)}
            className="action-button"
            title="Voir détails"
          >
            <Icon name="Eye" size={16} />
          </button>
          <button
            onClick={() => navigate(`/rh/postes/${row.id}/edit`)}
            className="action-button"
            title="Modifier"
          >
            <Icon name="Edit" size={16} />
          </button>
        </div>
      ),
    },
  ]

  if (loading) return <LoadingState />

  return (
    <div className="postes-liste">
      {/* KPIs Statistiques */}
      <div className="postes-stats">
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-primary">
            <Icon name="Briefcase" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Postes</div>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-success">
            <Icon name="CheckCircle" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.ouverts}</div>
            <div className="stat-label">Ouverts</div>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-default">
            <Icon name="XCircle" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.fermes}</div>
            <div className="stat-label">Fermés</div>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-warning">
            <Icon name="Users" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalEmployes}</div>
            <div className="stat-label">Total Employés</div>
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
            placeholder="Titre, code, département..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {statuts.length > 0 && (
            <Select
              label="Statut"
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              options={[
                { value: '', label: 'Tous les statuts' },
                ...statuts.map(s => ({ value: s, label: s }))
              ]}
            />
          )}
          {departements.length > 0 && (
            <Select
              label="Département"
              value={filterDepartement}
              onChange={(e) => setFilterDepartement(e.target.value)}
              options={[
                { value: '', label: 'Tous les départements' },
                ...departements.map(d => ({ value: d, label: d }))
              ]}
            />
          )}
          {(searchTerm || filterStatut || filterDepartement) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setFilterStatut('')
                setFilterDepartement('')
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
            <strong>{filteredPostes.length}</strong> poste(s) trouvé(s)
            {filteredPostes.length !== postes.length && ` sur ${postes.length}`}
          </span>
        </div>
      </div>

      {/* Contenu */}
      {filteredPostes.length === 0 ? (
        <EmptyState
          icon="Briefcase"
          title="Aucun poste"
          message={
            postes.length === 0
              ? "Commencez par créer un nouveau poste"
              : "Aucun poste ne correspond aux filtres"
          }
          action={
            postes.length === 0 && (
              <PermissionGuard permission="rh.create">
                <Button onClick={() => navigate('/rh/postes/new')} variant="primary">
                  <Icon name="Plus" size={16} />
                  Nouveau poste
                </Button>
              </PermissionGuard>
            )
          }
        />
      ) : viewMode === 'cards' ? (
        <div className="postes-cards-grid">
          {filteredPostes.map(poste => (
            <div key={poste.id} className="poste-card">
              <div className="poste-card-header">
                <h3 className="poste-card-title">{poste.titre}</h3>
                {poste.code && (
                  <span className="poste-card-code">{poste.code}</span>
                )}
              </div>
              <div className="poste-card-body">
                {poste.departement && (
                  <div className="poste-card-item">
                    <Icon name="Building" size={16} />
                    <span>{poste.departement}</span>
                  </div>
                )}
                {poste.type_contrat && (
                  <div className="poste-card-item">
                    <Icon name="FileText" size={16} />
                    <span>{poste.type_contrat}</span>
                  </div>
                )}
                {poste.salaire_min && (
                  <div className="poste-card-item">
                    <Icon name="DollarSign" size={16} />
                    <span>{formatCurrency(poste.salaire_min)}</span>
                  </div>
                )}
                <div className="poste-card-item">
                  <Icon name="Users" size={16} />
                  <span>{poste.nombre_employes || 0} employé(s)</span>
                </div>
                <div className="poste-card-item">
                  <span className={`statut-badge-modern statut-${poste.statut?.toLowerCase().replace(/\s+/g, '-') || 'ouvert'}`}>
                    {poste.statut || 'Ouvert'}
                  </span>
                </div>
              </div>
              <div className="poste-card-actions">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/rh/postes/${poste.id}`)}
                >
                  <Icon name="Eye" size={14} />
                  Voir détails
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/rh/postes/${poste.id}/edit`)}
                >
                  <Icon name="Edit" size={14} />
                  Modifier
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="data-table-wrapper">
          <DataTable columns={columns} data={filteredPostes} />
        </div>
      )}
    </div>
  )
}
