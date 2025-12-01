import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { beneficiairesService } from '@/services/beneficiaires.service'
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
import './Beneficiaires.css'

export default function Beneficiaires() {
  const navigate = useNavigate()
  const [beneficiaires, setBeneficiaires] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [filterProjet, setFilterProjet] = useState('')
  const [viewMode, setViewMode] = useState('table')

  useEffect(() => {
    loadBeneficiaires()
  }, [])

  const loadBeneficiaires = async () => {
    setLoading(true)
    try {
      const { data, error } = await beneficiairesService.getAll()
      if (error) {
        logger.error('BENEFICIAIRES_LISTE', 'Erreur chargement bénéficiaires', error)
        toast.error('Erreur lors du chargement des bénéficiaires')
        return
      }
      setBeneficiaires(data || [])
      logger.debug('BENEFICIAIRES_LISTE', `${data?.length || 0} bénéficiaires chargés`)
    } catch (error) {
      logger.error('BENEFICIAIRES_LISTE', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  // Filtrer et rechercher
  const filteredBeneficiaires = useMemo(() => {
    return beneficiaires.filter(ben => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const nomComplet = getNomComplet(ben)
        const matchesSearch = 
          nomComplet.toLowerCase().includes(searchLower) ||
          ben.code?.toLowerCase().includes(searchLower) ||
          ben.statut_global?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      if (filterStatut && ben.statut_global !== filterStatut) return false

      if (filterProjet && ben.projet_id !== filterProjet) return false

      return true
    })
  }, [beneficiaires, searchTerm, filterStatut, filterProjet])

  // Extraire les valeurs uniques pour les filtres
  const statuts = useMemo(() => [...new Set(beneficiaires.map(b => b.statut_global).filter(Boolean))], [beneficiaires])
  const projets = useMemo(() => {
    const projetsUniques = new Map()
    beneficiaires.forEach(b => {
      if (b.projet_id && b.projets) {
        projetsUniques.set(b.projet_id, b.projets.nom || b.projet_id)
      }
    })
    return Array.from(projetsUniques.entries()).map(([id, nom]) => ({ value: id, label: nom }))
  }, [beneficiaires])

  // Calculer les statistiques
  const stats = useMemo(() => {
    const actifs = beneficiaires.filter(b => {
      const statut = b.statut_global?.toUpperCase()
      return statut && !['TERMINE', 'ABANDON', 'ABANDONNE'].includes(statut)
    }).length
    const enAccompagnement = beneficiaires.filter(b => {
      const statut = b.statut_global?.toUpperCase()
      return statut === 'EN_ACCOMPAGNEMENT' || statut === 'ACCOMPAGNE'
    }).length
    const inseres = beneficiaires.filter(b => {
      const statut = b.statut_global?.toUpperCase()
      return statut === 'INSERTE' || statut === 'INSERE'
    }).length
    const termines = beneficiaires.filter(b => {
      const statut = b.statut_global?.toUpperCase()
      return statut === 'TERMINE' || statut === 'CLOTURE'
    }).length

    return {
      total: beneficiaires.length,
      actifs,
      enAccompagnement,
      inseres,
      termines
    }
  }, [beneficiaires])

  const getNomComplet = (beneficiaire) => {
    if (beneficiaire.personne) {
      return `${beneficiaire.personne.prenom || ''} ${beneficiaire.personne.nom || ''}`.trim()
    }
    if (beneficiaire.candidats) {
      return `${beneficiaire.candidats.prenom || ''} ${beneficiaire.candidats.nom || beneficiaire.candidats.raison_sociale || ''}`.trim()
    }
    return beneficiaire.raison_sociale || '-'
  }

  const columns = [
    { 
      key: 'code', 
      label: 'Code',
      render: (value, row) => (
        <div 
          className="beneficiaire-name-cell"
          onClick={() => navigate(`/beneficiaires/${row.id}`)}
        >
          <span className="beneficiaire-code">{value || '-'}</span>
        </div>
      ),
    },
    {
      key: 'nom',
      label: 'Nom complet',
      render: (_, row) => {
        const nomComplet = getNomComplet(row)
        return (
          <div 
            className="beneficiaire-name-cell"
            onClick={() => navigate(`/beneficiaires/${row.id}`)}
          >
            <span className="beneficiaire-name">{nomComplet}</span>
          </div>
        )
      },
    },
    {
      key: 'projet_id',
      label: 'Projet',
      render: (value, row) => {
        if (row.projets) {
          return (
            <span 
              className="beneficiaire-projet-link"
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
      key: 'statut_global',
      label: 'Statut',
      render: (value) => (
        <span className={`statut-badge-modern statut-${value?.toLowerCase().replace(/\s+/g, '-') || 'actif'}`}>
          {value || 'Actif'}
        </span>
      ),
    },
    {
      key: 'date_entree',
      label: 'Date entrée',
      render: (value) => value ? formatDate(value) : '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate(`/beneficiaires/${row.id}`)}
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
    <div className="beneficiaires-liste">
      {/* KPIs Statistiques */}
      <div className="beneficiaires-stats">
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-primary">
            <Icon name="Users" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Bénéficiaires</div>
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
          <div className="stat-icon stat-icon-default">
            <Icon name="UserCheck" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.enAccompagnement}</div>
            <div className="stat-label">En accompagnement</div>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-success">
            <Icon name="TrendingUp" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.inseres}</div>
            <div className="stat-label">Insérés</div>
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
            placeholder="Nom, prénom, code..."
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
            <strong>{filteredBeneficiaires.length}</strong> bénéficiaire(s) trouvé(s)
            {filteredBeneficiaires.length !== beneficiaires.length && ` sur ${beneficiaires.length}`}
          </span>
        </div>
      </div>

      {/* Contenu */}
      {filteredBeneficiaires.length === 0 ? (
        <EmptyState
          icon="Users"
          title="Aucun bénéficiaire"
          message={
            beneficiaires.length === 0
              ? "Commencez par créer un nouveau bénéficiaire"
              : "Aucun bénéficiaire ne correspond aux filtres"
          }
          action={
            beneficiaires.length === 0 && (
              <PermissionGuard permission="beneficiaires.create">
                <Button onClick={() => navigate('/beneficiaires/new')} variant="primary">
                  <Icon name="Plus" size={16} />
                  Nouveau bénéficiaire
                </Button>
              </PermissionGuard>
            )
          }
        />
      ) : viewMode === 'cards' ? (
        <div className="beneficiaires-cards-grid">
          {filteredBeneficiaires.map(ben => (
            <div key={ben.id} className="beneficiaire-card">
              <div className="beneficiaire-card-header">
                <h3 className="beneficiaire-card-title">{getNomComplet(ben)}</h3>
                {ben.code && <span className="beneficiaire-card-code">{ben.code}</span>}
              </div>
              <div className="beneficiaire-card-body">
                <div className="beneficiaire-card-item">
                  <Icon name="Tag" size={16} />
                  <span className={`statut-badge-modern statut-${ben.statut_global?.toLowerCase().replace(/\s+/g, '-') || 'actif'}`}>
                    {ben.statut_global || 'Actif'}
                  </span>
                </div>
                {ben.projets && (
                  <div className="beneficiaire-card-item">
                    <Icon name="FolderKanban" size={16} />
                    <span 
                      className="beneficiaire-projet-link"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/projets/${ben.projet_id}`)
                      }}
                    >
                      {ben.projets.nom}
                    </span>
                  </div>
                )}
                {ben.date_entree && (
                  <div className="beneficiaire-card-item">
                    <Icon name="Calendar" size={16} />
                    <span>Entrée: {formatDate(ben.date_entree)}</span>
                  </div>
                )}
              </div>
              <div className="beneficiaire-card-actions">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/beneficiaires/${ben.id}`)}
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
          <DataTable columns={columns} data={filteredBeneficiaires} />
        </div>
      )}
    </div>
  )
}
