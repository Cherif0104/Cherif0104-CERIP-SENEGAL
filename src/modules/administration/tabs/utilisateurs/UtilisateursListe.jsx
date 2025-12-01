import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usersService } from '@/services/users.service'
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
import './UtilisateursListe.css'

export default function UtilisateursListe() {
  const navigate = useNavigate()
  const [utilisateurs, setUtilisateurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    role: '',
    statut: '',
  })
  const [viewMode, setViewMode] = useState('table')

  useEffect(() => {
    loadUtilisateurs()
  }, [])

  const loadUtilisateurs = async () => {
    setLoading(true)
    try {
      const queryFilters = {}
      if (filters.role) queryFilters.role = filters.role
      if (filters.statut === 'actif') queryFilters.actif = true
      if (filters.statut === 'inactif') queryFilters.actif = false

      const result = await usersService.getAll({
        filters: queryFilters,
      })

      if (result.error) {
        logger.error('UTILISATEURS_LISTE', 'Erreur chargement utilisateurs', result.error)
        toast.error('Erreur lors du chargement des utilisateurs')
        return
      }

      setUtilisateurs(result.data || [])
      logger.debug('UTILISATEURS_LISTE', `${result.data?.length || 0} utilisateurs chargés`)
    } catch (error) {
      logger.error('UTILISATEURS_LISTE', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUtilisateurs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.role, filters.statut])

  // Filtrer et rechercher
  const filteredUtilisateurs = useMemo(() => {
    return utilisateurs.filter(user => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const nomComplet = `${user.prenom || ''} ${user.nom || ''}`.trim()
        const matchesSearch = 
          nomComplet.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.telephone?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }
      return true
    })
  }, [utilisateurs, searchTerm])

  // Calculer les statistiques
  const stats = useMemo(() => {
    const actifs = utilisateurs.filter(u => u.actif !== false).length
    const inactifs = utilisateurs.filter(u => u.actif === false).length
    const admins = utilisateurs.filter(u => u.role?.includes('ADMIN')).length
    const mentors = utilisateurs.filter(u => u.role === 'MENTOR').length

    return {
      total: utilisateurs.length,
      actifs,
      inactifs,
      admins,
      mentors
    }
  }, [utilisateurs])

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleToggleActif = async (id, currentActif) => {
    try {
      const result = await usersService.toggleActif(id, !currentActif)
      if (result.error) {
        toast.error('Erreur lors de la modification du statut')
        return
      }
      toast.success(`Utilisateur ${!currentActif ? 'activé' : 'désactivé'} avec succès`)
      loadUtilisateurs()
    } catch (error) {
      logger.error('UTILISATEURS_LISTE', 'Erreur toggle actif', error)
      toast.error('Erreur lors de la modification')
    }
  }

  const getRoleLabel = (role) => {
    const roleLabels = {
      ADMIN_SERIP: 'Admin SERIP',
      ADMIN_ORGANISME: 'Admin Organisme',
      CHEF_PROJET: 'Chef de projet',
      MENTOR: 'Mentor',
      FORMATEUR: 'Formateur',
      COACH: 'Coach',
      BAILLEUR: 'Bailleur',
      BENEFICIAIRE: 'Bénéficiaire',
      GPERFORM: 'GPerf',
    }
    return roleLabels[role] || role
  }

  const columns = [
    {
      key: 'email',
      label: 'Email',
      render: (value, row) => (
        <div 
          className="utilisateur-name-cell"
          onClick={() => navigate(`/administration/utilisateurs/${row.id}`)}
        >
          <span className="utilisateur-email">{value || '-'}</span>
        </div>
      ),
    },
    {
      key: 'nom',
      label: 'Nom complet',
      render: (_, row) => {
        const nomComplet = `${row.prenom || ''} ${row.nom || ''}`.trim() || '-'
        return (
          <div 
            className="utilisateur-name-cell"
            onClick={() => navigate(`/administration/utilisateurs/${row.id}`)}
          >
            <span className="utilisateur-name">{nomComplet}</span>
          </div>
        )
      },
    },
    {
      key: 'role',
      label: 'Rôle',
      render: (value) => (
        <span className="role-badge-modern">{getRoleLabel(value)}</span>
      ),
    },
    {
      key: 'telephone',
      label: 'Téléphone',
      render: (value) => value || '-',
    },
    {
      key: 'actif',
      label: 'Statut',
      render: (value) => (
        <span className={`statut-badge-modern statut-${value ? 'actif' : 'inactif'}`}>
          {value ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Date création',
      render: (value) => value ? formatDate(value) : '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate(`/administration/utilisateurs/${row.id}`)}
            className="action-button"
            title="Voir détails"
          >
            <Icon name="Eye" size={16} />
          </button>
          <button
            onClick={() => navigate(`/administration/utilisateurs/${row.id}/edit`)}
            className="action-button"
            title="Modifier"
          >
            <Icon name="Edit" size={16} />
          </button>
          <button
            onClick={() => handleToggleActif(row.id, row.actif)}
            className="action-button"
            title={row.actif ? 'Désactiver' : 'Activer'}
          >
            <Icon name={row.actif ? 'X' : 'Check'} size={16} />
          </button>
        </div>
      ),
    },
  ]

  if (loading) return <LoadingState />

  return (
    <div className="utilisateurs-liste">
      {/* KPIs Statistiques */}
      <div className="utilisateurs-stats">
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-primary">
            <Icon name="Users" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Utilisateurs</div>
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
            <Icon name="XCircle" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.inactifs}</div>
            <div className="stat-label">Inactifs</div>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-warning">
            <Icon name="Shield" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.admins}</div>
            <div className="stat-label">Administrateurs</div>
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
            placeholder="Nom, prénom, email, téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            label="Rôle"
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            options={[
              { value: '', label: 'Tous les rôles' },
              { value: 'ADMIN_SERIP', label: 'Admin SERIP' },
              { value: 'ADMIN_ORGANISME', label: 'Admin Organisme' },
              { value: 'CHEF_PROJET', label: 'Chef de projet' },
              { value: 'MENTOR', label: 'Mentor' },
              { value: 'FORMATEUR', label: 'Formateur' },
              { value: 'COACH', label: 'Coach' },
              { value: 'BAILLEUR', label: 'Bailleur' },
              { value: 'BENEFICIAIRE', label: 'Bénéficiaire' },
              { value: 'GPERFORM', label: 'GPerf' },
            ]}
          />
          <Select
            label="Statut"
            value={filters.statut}
            onChange={(e) => handleFilterChange('statut', e.target.value)}
            options={[
              { value: '', label: 'Tous les statuts' },
              { value: 'actif', label: 'Actifs' },
              { value: 'inactif', label: 'Inactifs' },
            ]}
          />
          {(searchTerm || filters.role || filters.statut) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setFilters({
                  role: '',
                  statut: '',
                })
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
            <strong>{filteredUtilisateurs.length}</strong> utilisateur(s) trouvé(s)
            {filteredUtilisateurs.length !== utilisateurs.length && ` sur ${utilisateurs.length}`}
          </span>
        </div>
      </div>

      {/* Contenu */}
      {filteredUtilisateurs.length === 0 ? (
        <EmptyState
          icon="Users"
          title="Aucun utilisateur"
          message={
            utilisateurs.length === 0
              ? "Commencez par créer un nouvel utilisateur"
              : "Aucun utilisateur ne correspond aux filtres"
          }
          action={
            utilisateurs.length === 0 && (
              <PermissionGuard permission="admin.create">
                <Button onClick={() => navigate('/administration/utilisateurs/new')} variant="primary">
                  <Icon name="Plus" size={16} />
                  Nouvel utilisateur
                </Button>
              </PermissionGuard>
            )
          }
        />
      ) : viewMode === 'cards' ? (
        <div className="utilisateurs-cards-grid">
          {filteredUtilisateurs.map(user => {
            const nomComplet = `${user.prenom || ''} ${user.nom || ''}`.trim() || '-'
            return (
              <div key={user.id} className="utilisateur-card">
                <div className="utilisateur-card-header">
                  <h3 className="utilisateur-card-title">{nomComplet}</h3>
                  {user.email && (
                    <span className="utilisateur-card-email">{user.email}</span>
                  )}
                </div>
                <div className="utilisateur-card-body">
                  <div className="utilisateur-card-item">
                    <Icon name="Shield" size={16} />
                    <span className="role-badge-modern">{getRoleLabel(user.role)}</span>
                  </div>
                  {user.telephone && (
                    <div className="utilisateur-card-item">
                      <Icon name="Phone" size={16} />
                      <span>{user.telephone}</span>
                    </div>
                  )}
                  <div className="utilisateur-card-item">
                    <span className={`statut-badge-modern statut-${user.actif ? 'actif' : 'inactif'}`}>
                      {user.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
                <div className="utilisateur-card-actions">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/administration/utilisateurs/${user.id}`)}
                  >
                    <Icon name="Eye" size={14} />
                    Voir détails
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/administration/utilisateurs/${user.id}/edit`)}
                  >
                    <Icon name="Edit" size={14} />
                    Modifier
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="data-table-wrapper">
          <DataTable columns={columns} data={filteredUtilisateurs} />
        </div>
      )}
    </div>
  )
}
