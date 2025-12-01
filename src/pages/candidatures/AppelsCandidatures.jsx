import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { appelsService } from '@/services/appels.service'
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
import { formatDate } from '@/utils/format'
import './AppelsCandidatures.css'

export default function AppelsCandidatures() {
  const navigate = useNavigate()
  const [appels, setAppels] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [filterProjet, setFilterProjet] = useState('')
  const [viewMode, setViewMode] = useState('table')

  useEffect(() => {
    loadAppels()
  }, [])

  const loadAppels = async () => {
    setLoading(true)
    try {
      const { data, error } = await appelsService.getAll()
      if (error) {
        logger.error('APPELS_LISTE', 'Erreur chargement appels', error)
        toast.error('Erreur lors du chargement des appels')
        return
      }
      setAppels(data || [])
      logger.debug('APPELS_LISTE', `${data?.length || 0} appels chargés`)
    } catch (error) {
      logger.error('APPELS_LISTE', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  // Filtrer et rechercher
  const filteredAppels = useMemo(() => {
    return appels.filter(appel => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          appel.titre?.toLowerCase().includes(searchLower) ||
          appel.description?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      if (filterStatut && appel.statut !== filterStatut) return false

      if (filterProjet && appel.projet_id !== filterProjet) return false

      return true
    })
  }, [appels, searchTerm, filterStatut, filterProjet])

  // Extraire les valeurs uniques pour les filtres
  const statuts = useMemo(() => [...new Set(appels.map(a => a.statut).filter(Boolean))], [appels])
  const projets = useMemo(() => {
    const projetsUniques = new Map()
    appels.forEach(a => {
      if (a.projet_id && a.projets) {
        projetsUniques.set(a.projet_id, a.projets.nom || a.projet_id)
      }
    })
    return Array.from(projetsUniques.entries()).map(([id, nom]) => ({ value: id, label: nom }))
  }, [appels])

  // Calculer les statistiques
  const stats = useMemo(() => {
    const ouverts = appels.filter(a => {
      const statut = a.statut?.toUpperCase()
      return statut === 'OUVERT' || statut === 'EN_COURS'
    }).length
    const fermes = appels.filter(a => {
      const statut = a.statut?.toUpperCase()
      return statut === 'FERME' || statut === 'CLOTURE'
    }).length
    const enAttente = appels.filter(a => {
      const statut = a.statut?.toUpperCase()
      return statut === 'EN_ATTENTE' || statut === 'PLANIFIE'
    }).length

    // Calculer le nombre total de candidats (nécessite une requête supplémentaire ou relation)
    const totalCandidats = 0 // À calculer si nécessaire

    return {
      total: appels.length,
      ouverts,
      fermes,
      enAttente,
      totalCandidats
    }
  }, [appels])

  const columns = [
    { 
      key: 'titre', 
      label: 'Titre',
      render: (value, row) => (
        <div 
          className="appel-name-cell"
          onClick={() => navigate(`/candidatures/appels/${row.id}`)}
        >
          <span className="appel-name">{value || '-'}</span>
        </div>
      ),
    },
    {
      key: 'projet_id',
      label: 'Projet',
      render: (value, row) => {
        if (row.projets) {
          return (
            <span 
              className="appel-projet-link"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/projets/${value}`)
              }}
            >
              {row.projets.nom || value}
            </span>
          )
        }
        return value || '-'
      },
    },
    {
      key: 'date_ouverture',
      label: 'Date ouverture',
      render: (value) => value ? formatDate(value) : '-',
    },
    {
      key: 'date_fermeture',
      label: 'Date fermeture',
      render: (value) => value ? formatDate(value) : '-',
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
            onClick={() => navigate(`/candidatures/appels/${row.id}`)}
            className="action-button"
            title="Voir détails"
          >
            <Icon name="Eye" size={16} />
          </button>
        </div>
      ),
    },
  ]

  if (loading) return <LoadingState />

  return (
    <div className="appels-liste">
      {/* KPIs Statistiques */}
      <div className="appels-stats">
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-primary">
            <Icon name="Bell" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Appels</div>
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
          <div className="stat-icon stat-icon-warning">
            <Icon name="Clock" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.enAttente}</div>
            <div className="stat-label">En attente</div>
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
            placeholder="Titre, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
          {projets.length > 0 && (
            <Select
              label="Projet"
              value={filterProjet}
              onChange={(e) => setFilterProjet(e.target.value)}
              options={[
                { value: '', label: 'Tous les projets' },
                ...projets
              ]}
            />
          )}
          {(searchTerm || filterStatut || filterProjet) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setFilterStatut('')
                setFilterProjet('')
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
            <strong>{filteredAppels.length}</strong> appel(s) trouvé(s)
            {filteredAppels.length !== appels.length && ` sur ${appels.length}`}
          </span>
        </div>
      </div>

      {/* Contenu */}
      {filteredAppels.length === 0 ? (
        <EmptyState
          icon="Bell"
          title="Aucun appel"
          message={
            appels.length === 0
              ? "Commencez par créer un nouvel appel à candidatures"
              : "Aucun appel ne correspond aux filtres"
          }
          action={
            appels.length === 0 && (
              <PermissionGuard permission="appels.create">
                <Button onClick={() => navigate('/candidatures/appels/new')} variant="primary">
                  <Icon name="Plus" size={16} />
                  Nouvel appel
                </Button>
              </PermissionGuard>
            )
          }
        />
      ) : viewMode === 'cards' ? (
        <div className="appels-cards-grid">
          {filteredAppels.map(appel => (
            <div key={appel.id} className="appel-card">
              <div className="appel-card-header">
                <h3 className="appel-card-title">{appel.titre}</h3>
              </div>
              <div className="appel-card-body">
                {appel.projets && (
                  <div className="appel-card-item">
                    <Icon name="FolderKanban" size={16} />
                    <span 
                      className="appel-projet-link"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/projets/${appel.projet_id}`)
                      }}
                    >
                      {appel.projets.nom}
                    </span>
                  </div>
                )}
                {appel.date_ouverture && (
                  <div className="appel-card-item">
                    <Icon name="Calendar" size={16} />
                    <span>Ouverture: {formatDate(appel.date_ouverture)}</span>
                  </div>
                )}
                {appel.date_fermeture && (
                  <div className="appel-card-item">
                    <Icon name="Calendar" size={16} />
                    <span>Fermeture: {formatDate(appel.date_fermeture)}</span>
                  </div>
                )}
                <div className="appel-card-item">
                  <span className={`statut-badge-modern statut-${appel.statut?.toLowerCase().replace(/\s+/g, '-') || 'ouvert'}`}>
                    {appel.statut || 'Ouvert'}
                  </span>
                </div>
              </div>
              <div className="appel-card-actions">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/candidatures/appels/${appel.id}`)}
                >
                  <Icon name="Eye" size={14} />
                  Voir détails
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="data-table-wrapper">
          <DataTable columns={columns} data={filteredAppels} />
        </div>
      )}
    </div>
  )
}
