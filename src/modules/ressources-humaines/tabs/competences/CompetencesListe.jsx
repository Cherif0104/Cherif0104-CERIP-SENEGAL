import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { competencesService } from '@/services/competences.service'
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
import './CompetencesListe.css'

export default function CompetencesListe() {
  const navigate = useNavigate()
  const [competences, setCompetences] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategorie, setFilterCategorie] = useState('')
  const [viewMode, setViewMode] = useState('table')

  useEffect(() => {
    loadCompetences()
  }, [])

  const loadCompetences = async () => {
    setLoading(true)
    try {
      const { data, error } = await competencesService.getAll()
      if (error) {
        logger.error('COMPETENCES_LISTE', 'Erreur chargement compétences', error)
        toast.error('Erreur lors du chargement des compétences')
        return
      }
      setCompetences(data || [])
      logger.debug('COMPETENCES_LISTE', `${data?.length || 0} compétences chargées`)
    } catch (error) {
      logger.error('COMPETENCES_LISTE', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  // Filtrer et rechercher
  const filteredCompetences = useMemo(() => {
    return competences.filter(competence => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          competence.nom?.toLowerCase().includes(searchLower) ||
          competence.code?.toLowerCase().includes(searchLower) ||
          competence.categorie?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      if (filterCategorie && competence.categorie !== filterCategorie) return false

      return true
    })
  }, [competences, searchTerm, filterCategorie])

  // Extraire les valeurs uniques pour les filtres
  const categories = useMemo(() => [...new Set(competences.map(c => c.categorie).filter(Boolean))], [competences])

  // Calculer les statistiques
  const stats = useMemo(() => {
    const totalEmployes = competences.reduce((sum, c) => sum + (c.nombre_employes || 0), 0)

    return {
      total: competences.length,
      totalEmployes,
      categories: categories.length
    }
  }, [competences, categories])

  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (value, row) => (
        <div 
          className="competence-name-cell"
          onClick={() => navigate(`/rh/competences/${row.id}`)}
        >
          <span className="competence-code">{value || '-'}</span>
        </div>
      ),
    },
    {
      key: 'nom',
      label: 'Nom',
      render: (value, row) => (
        <div 
          className="competence-name-cell"
          onClick={() => navigate(`/rh/competences/${row.id}`)}
        >
          <span className="competence-name">{value || '-'}</span>
        </div>
      ),
    },
    {
      key: 'categorie',
      label: 'Catégorie',
      render: (value) => value || '-',
    },
    {
      key: 'niveau_max',
      label: 'Niveau max',
      render: (value) => value || '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate(`/rh/competences/${row.id}`)}
            className="action-button"
            title="Voir détails"
          >
            <Icon name="Eye" size={16} />
          </button>
          <button
            onClick={() => navigate(`/rh/competences/${row.id}/edit`)}
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
    <div className="competences-liste">
      {/* KPIs Statistiques */}
      <div className="competences-stats">
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-primary">
            <Icon name="Award" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Compétences</div>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-success">
            <Icon name="Tag" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.categories}</div>
            <div className="stat-label">Catégories</div>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-default">
            <Icon name="Users" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalEmployes}</div>
            <div className="stat-label">Employés associés</div>
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
            placeholder="Nom, code, catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {categories.length > 0 && (
            <Select
              label="Catégorie"
              value={filterCategorie}
              onChange={(e) => setFilterCategorie(e.target.value)}
              options={[
                { value: '', label: 'Toutes les catégories' },
                ...categories.map(c => ({ value: c, label: c }))
              ]}
            />
          )}
          {(searchTerm || filterCategorie) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setFilterCategorie('')
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
            <strong>{filteredCompetences.length}</strong> compétence(s) trouvée(s)
            {filteredCompetences.length !== competences.length && ` sur ${competences.length}`}
          </span>
        </div>
      </div>

      {/* Contenu */}
      {filteredCompetences.length === 0 ? (
        <EmptyState
          icon="Award"
          title="Aucune compétence"
          message={
            competences.length === 0
              ? "Commencez par créer une nouvelle compétence"
              : "Aucune compétence ne correspond aux filtres"
          }
          action={
            competences.length === 0 && (
              <PermissionGuard permission="rh.create">
                <Button onClick={() => navigate('/rh/competences/new')} variant="primary">
                  <Icon name="Plus" size={16} />
                  Nouvelle compétence
                </Button>
              </PermissionGuard>
            )
          }
        />
      ) : viewMode === 'cards' ? (
        <div className="competences-cards-grid">
          {filteredCompetences.map(competence => (
            <div key={competence.id} className="competence-card">
              <div className="competence-card-header">
                <h3 className="competence-card-title">{competence.nom}</h3>
                {competence.code && (
                  <span className="competence-card-code">{competence.code}</span>
                )}
              </div>
              <div className="competence-card-body">
                {competence.categorie && (
                  <div className="competence-card-item">
                    <Icon name="Tag" size={16} />
                    <span>{competence.categorie}</span>
                  </div>
                )}
                {competence.niveau_max && (
                  <div className="competence-card-item">
                    <Icon name="TrendingUp" size={16} />
                    <span>Niveau max: {competence.niveau_max}</span>
                  </div>
                )}
              </div>
              <div className="competence-card-actions">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/rh/competences/${competence.id}`)}
                >
                  <Icon name="Eye" size={14} />
                  Voir détails
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/rh/competences/${competence.id}/edit`)}
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
          <DataTable columns={columns} data={filteredCompetences} />
        </div>
      )}
    </div>
  )
}
