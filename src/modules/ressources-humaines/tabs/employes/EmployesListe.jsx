import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { employesService } from '@/services/employes.service'
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
import './EmployesListe.css'

export default function EmployesListe() {
  const navigate = useNavigate()
  const [employes, setEmployes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    typeEmploye: '',
    typeContrat: '',
    statut: '',
    prestataire: '',
  })
  const [viewMode, setViewMode] = useState('table')

  useEffect(() => {
    loadEmployes()
  }, [])

  const loadEmployes = async () => {
    setLoading(true)
    try {
      const queryFilters = {}
      if (filters.statut) queryFilters.statut = filters.statut
      if (filters.typeEmploye) queryFilters.type_employe = filters.typeEmploye
      if (filters.typeContrat) queryFilters.type_contrat = filters.typeContrat
      if (filters.prestataire === 'oui') queryFilters.est_prestataire = true
      if (filters.prestataire === 'non') queryFilters.est_prestataire = false

      const result = await employesService.getAll({
        filters: queryFilters,
      })

      if (result.error) {
        logger.error('EMPLOYES_LISTE', 'Erreur chargement employés', result.error)
        toast.error('Erreur lors du chargement des employés')
        return
      }
      
      setEmployes(result.data || [])
      logger.debug('EMPLOYES_LISTE', `${result.data?.length || 0} employés chargés`)
    } catch (error) {
      logger.error('EMPLOYES_LISTE', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.typeEmploye, filters.typeContrat, filters.prestataire, filters.statut])

  // Filtrer et rechercher
  const filteredEmployes = useMemo(() => {
    return employes.filter(employe => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const nomComplet = `${employe.prenom || ''} ${employe.nom || ''}`.trim()
        const matchesSearch = 
          nomComplet.toLowerCase().includes(searchLower) ||
          employe.matricule?.toLowerCase().includes(searchLower) ||
          employe.email?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }
      return true
    })
  }, [employes, searchTerm])

  // Calculer les statistiques
  const stats = useMemo(() => {
    const actifs = employes.filter(e => e.statut === 'ACTIF').length
    const prestataires = employes.filter(e => e.est_prestataire === true).length
    const cdi = employes.filter(e => e.type_contrat === 'CDI').length
    const cdd = employes.filter(e => e.type_contrat === 'CDD').length

    return {
      total: employes.length,
      actifs,
      prestataires,
      cdi,
      cdd
    }
  }, [employes])

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const columns = [
    {
      key: 'matricule',
      label: 'Matricule',
      render: (value, row) => (
        <div 
          className="employe-name-cell"
          onClick={() => navigate(`/rh/employes/${row.id}`)}
        >
          <span className="employe-code">{value || '-'}</span>
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
            className="employe-name-cell"
            onClick={() => navigate(`/rh/employes/${row.id}`)}
          >
            <span className="employe-name">{nomComplet}</span>
          </div>
        )
      },
    },
    {
      key: 'type_employe',
      label: 'Type',
      render: (value) => value || '-',
    },
    {
      key: 'type_contrat',
      label: 'Type contrat',
      render: (value, row) => {
        let display = value || '-'
        if (row.est_prestataire) display += ' (Prestataire)'
        if (row.est_lie_projet) display += ' (Projet)'
        if (row.est_lie_programme) display += ' (Programme)'
        return display
      },
    },
    {
      key: 'email',
      label: 'Email',
      render: (value) => value || '-',
    },
    {
      key: 'poste_id',
      label: 'Poste',
      render: (_, row) => row.poste?.titre || '-',
    },
    {
      key: 'date_embauche',
      label: 'Date embauche',
      render: (value) => value ? formatDate(value) : '-',
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (value) => (
        <span className={`statut-badge-modern statut-${value?.toLowerCase().replace(/\s+/g, '-') || 'actif'}`}>
          {value || 'Actif'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate(`/rh/employes/${row.id}`)}
            className="action-button"
            title="Voir détails"
          >
            <Icon name="Eye" size={16} />
          </button>
          <button
            onClick={() => navigate(`/rh/employes/${row.id}/edit`)}
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
    <div className="employes-liste">
      {/* KPIs Statistiques */}
      <div className="employes-stats">
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-primary">
            <Icon name="Users" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Employés</div>
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
            <Icon name="Briefcase" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.prestataires}</div>
            <div className="stat-label">Prestataires</div>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-warning">
            <Icon name="FileText" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.cdi}</div>
            <div className="stat-label">CDI</div>
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
            placeholder="Nom, prénom, matricule, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            label="Type d'employé"
            value={filters.typeEmploye}
            onChange={(e) => handleFilterChange('typeEmploye', e.target.value)}
            options={[
              { value: '', label: 'Tous' },
              { value: 'PROFESSEUR', label: 'Professeur' },
              { value: 'FORMATEUR', label: 'Formateur' },
              { value: 'CHARGE_PROJET', label: 'Chargé de projet' },
              { value: 'DIRECTEUR', label: 'Directeur' },
              { value: 'COORDINATEUR', label: 'Coordinateur' },
              { value: 'COACH', label: 'Coach' },
              { value: 'MENTOR', label: 'Mentor' },
            ]}
          />
          <Select
            label="Type de contrat"
            value={filters.typeContrat}
            onChange={(e) => handleFilterChange('typeContrat', e.target.value)}
            options={[
              { value: '', label: 'Tous' },
              { value: 'CDI', label: 'CDI' },
              { value: 'CDD', label: 'CDD' },
              { value: 'STAGE', label: 'Stage' },
              { value: 'PRESTATION', label: 'Prestation' },
              { value: 'PROJET', label: 'Contrat projet' },
              { value: 'PROGRAMME', label: 'Contrat programme' },
            ]}
          />
          <Select
            label="Prestataire"
            value={filters.prestataire}
            onChange={(e) => handleFilterChange('prestataire', e.target.value)}
            options={[
              { value: '', label: 'Tous' },
              { value: 'oui', label: 'Oui' },
              { value: 'non', label: 'Non' },
            ]}
          />
          <Select
            label="Statut"
            value={filters.statut}
            onChange={(e) => handleFilterChange('statut', e.target.value)}
            options={[
              { value: '', label: 'Tous' },
              { value: 'ACTIF', label: 'Actif' },
              { value: 'INACTIF', label: 'Inactif' },
              { value: 'CONGE', label: 'Congé' },
              { value: 'DEMISSION', label: 'Démission' },
            ]}
          />
          {(searchTerm || filters.typeEmploye || filters.typeContrat || filters.prestataire || filters.statut) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setFilters({
                  typeEmploye: '',
                  typeContrat: '',
                  statut: '',
                  prestataire: '',
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
            <strong>{filteredEmployes.length}</strong> employé(s) trouvé(s)
            {filteredEmployes.length !== employes.length && ` sur ${employes.length}`}
          </span>
        </div>
      </div>

      {/* Contenu */}
      {filteredEmployes.length === 0 ? (
        <EmptyState
          icon="Users"
          title="Aucun employé"
          message={
            employes.length === 0
              ? "Commencez par créer un nouvel employé"
              : "Aucun employé ne correspond aux filtres"
          }
          action={
            employes.length === 0 && (
              <PermissionGuard permission="rh.create">
                <Button onClick={() => navigate('/rh/employes/new')} variant="primary">
                  <Icon name="Plus" size={16} />
                  Nouvel employé
                </Button>
              </PermissionGuard>
            )
          }
        />
      ) : viewMode === 'cards' ? (
        <div className="employes-cards-grid">
          {filteredEmployes.map(employe => {
            const nomComplet = `${employe.prenom || ''} ${employe.nom || ''}`.trim() || '-'
            return (
              <div key={employe.id} className="employe-card">
                <div className="employe-card-header">
                  <h3 className="employe-card-title">{nomComplet}</h3>
                  {employe.matricule && (
                    <span className="employe-card-code">{employe.matricule}</span>
                  )}
                </div>
                <div className="employe-card-body">
                  {employe.type_employe && (
                    <div className="employe-card-item">
                      <Icon name="User" size={16} />
                      <span>{employe.type_employe}</span>
                    </div>
                  )}
                  {employe.type_contrat && (
                    <div className="employe-card-item">
                      <Icon name="FileText" size={16} />
                      <span>
                        {employe.type_contrat}
                        {employe.est_prestataire && ' (Prestataire)'}
                      </span>
                    </div>
                  )}
                  {employe.email && (
                    <div className="employe-card-item">
                      <Icon name="Mail" size={16} />
                      <span>{employe.email}</span>
                    </div>
                  )}
                  {employe.poste?.titre && (
                    <div className="employe-card-item">
                      <Icon name="Briefcase" size={16} />
                      <span>{employe.poste.titre}</span>
                    </div>
                  )}
                  <div className="employe-card-item">
                    <span className={`statut-badge-modern statut-${employe.statut?.toLowerCase().replace(/\s+/g, '-') || 'actif'}`}>
                      {employe.statut || 'Actif'}
                    </span>
                  </div>
                </div>
                <div className="employe-card-actions">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/rh/employes/${employe.id}`)}
                  >
                    <Icon name="Eye" size={14} />
                    Voir détails
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/rh/employes/${employe.id}/edit`)}
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
          <DataTable columns={columns} data={filteredEmployes} />
        </div>
      )}
    </div>
  )
}
