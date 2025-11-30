import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usersService } from '@/services/users.service'
import { DataTable } from '@/components/common/DataTable'
import { Button } from '@/components/common/Button'
import { Select } from '@/components/common/Select'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './UtilisateursListe.css'

export default function UtilisateursListe() {
  const navigate = useNavigate()
  const [utilisateurs, setUtilisateurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    role: '',
    statut: '',
  })

  useEffect(() => {
    loadUtilisateurs()
  }, [filters])

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
        return
      }

      setUtilisateurs(result.data || [])
    } catch (error) {
      logger.error('UTILISATEURS_LISTE', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

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
        alert('Erreur lors de la modification du statut')
        return
      }
      loadUtilisateurs()
    } catch (error) {
      logger.error('UTILISATEURS_LISTE', 'Erreur toggle actif', error)
      alert('Erreur lors de la modification')
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
    },
    {
      key: 'nom',
      label: 'Nom',
      render: (_, row) => `${row.prenom || ''} ${row.nom || ''}`.trim() || '-',
    },
    {
      key: 'role',
      label: 'Rôle',
      render: (value) => (
        <span className="role-badge">{getRoleLabel(value)}</span>
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
        <span className={`statut-badge statut-${value ? 'actif' : 'inactif'}`}>
          {value ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      key: 'date_creation',
      label: 'Date création',
      render: (value) => (value ? new Date(value).toLocaleDateString('fr-FR') : '-'),
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
      <div className="tab-header">
        <h2>Liste des Utilisateurs</h2>
        <Button variant="primary" onClick={() => navigate('/administration/utilisateurs/new')}>
          <Icon name="Plus" size={16} />
          Nouvel utilisateur
        </Button>
      </div>

      <div className="filters-section">
        <div className="filters-grid">
          <Select
            label="Rôle"
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            options={[
              { value: '', label: 'Tous' },
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
              { value: '', label: 'Tous' },
              { value: 'actif', label: 'Actifs' },
              { value: 'inactif', label: 'Inactifs' },
            ]}
          />
        </div>
      </div>

      {utilisateurs.length === 0 ? (
        <EmptyState icon="Users" title="Aucun utilisateur" message="Commencez par créer un nouvel utilisateur" />
      ) : (
        <div className="utilisateurs-content">
          <DataTable columns={columns} data={utilisateurs} />
        </div>
      )}
    </div>
  )
}

