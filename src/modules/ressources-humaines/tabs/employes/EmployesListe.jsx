import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { employesService } from '@/services/employes.service'
import { DataTable } from '@/components/common/DataTable'
import { Button } from '@/components/common/Button'
import { Select } from '@/components/common/Select'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './EmployesListe.css'

export default function EmployesListe() {
  const navigate = useNavigate()
  const [employes, setEmployes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    typeEmploye: '',
    typeContrat: '',
    statut: '',
    prestataire: '',
  })

  const loadEmployes = async () => {
    setLoading(true)
    try {
      let result
      
      // Construire les filtres pour la requête
      const queryFilters = {}
      if (filters.statut) queryFilters.statut = filters.statut
      if (filters.typeEmploye) queryFilters.type_employe = filters.typeEmploye
      if (filters.typeContrat) queryFilters.type_contrat = filters.typeContrat
      if (filters.prestataire === 'oui') queryFilters.est_prestataire = true
      if (filters.prestataire === 'non') queryFilters.est_prestataire = false

      // Utiliser getAll avec les filtres
      result = await employesService.getAll({
        filters: queryFilters,
      })

      if (result.error) {
        logger.error('EMPLOYES_LISTE', 'Erreur chargement employés', result.error)
        return
      }
      
      setEmployes(result.data || [])
    } catch (error) {
      logger.error('EMPLOYES_LISTE', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.typeEmploye, filters.typeContrat, filters.prestataire, filters.statut])

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
    },
    {
      key: 'nom',
      label: 'Nom',
      render: (_, row) => `${row.prenom || ''} ${row.nom || ''}`.trim() || '-',
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
      render: (value) => (value ? new Date(value).toLocaleDateString('fr-FR') : '-'),
    },
    {
      key: 'date_fin_contrat',
      label: 'Fin contrat',
      render: (value) => (value ? new Date(value).toLocaleDateString('fr-FR') : '-'),
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (value) => (
        <span className={`statut-badge statut-${value?.toLowerCase().replace(/\s+/g, '-') || 'inconnu'}`}>
          {value || '-'}
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
      <div className="tab-header">
        <h2>Liste des Employés</h2>
        <Button variant="primary" onClick={() => navigate('/rh/employes/new')}>
          <Icon name="Plus" size={16} />
          Nouvel employé
        </Button>
      </div>

      <div className="filters-section">
        <div className="filters-grid">
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
        </div>
      </div>

      {employes.length === 0 ? (
        <EmptyState icon="Users" title="Aucun employé" message="Commencez par créer un nouvel employé" />
      ) : (
        <div className="employes-content">
          <DataTable columns={columns} data={employes} />
        </div>
      )}
    </div>
  )
}

