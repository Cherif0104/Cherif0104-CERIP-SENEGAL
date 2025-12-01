import { useState, useEffect } from 'react'
import { projetActivitesService } from '@/services/projet-activites.service'
import { ressourcesService } from '@/services/ressources.service'
import { DataTable } from '@/components/common/DataTable'
import { Button } from '@/components/common/Button'
import { Select } from '@/components/common/Select'
import { Input } from '@/components/common/Input'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { toast } from '@/components/common/Toast'
import { formatDate, formatTime, formatCurrency } from '@/utils/format'
import { logger } from '@/utils/logger'
import { useNavigate } from 'react-router-dom'
import './ActivitesProjet.css'

/**
 * Composant de gestion des activités pour un projet spécifique
 * @param {string} projetId - ID du projet
 */
export default function ActivitesProjet({ projetId: projetIdProp = null }) {
  const navigate = useNavigate()
  const [activites, setActivites] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [ressourcesByActivite, setRessourcesByActivite] = useState({})
  const [filters, setFilters] = useState({
    type_activite: '',
    statut: '',
    dateDebut: '',
    dateFin: '',
  })

  useEffect(() => {
    if (projetIdProp) {
      loadActivites()
      loadStats()
    }
  }, [projetIdProp, filters])

  const loadActivites = async () => {
    if (!projetIdProp) return
    
    setLoading(true)
    try {
      const queryFilters = {}
      if (filters.type_activite) queryFilters.type_activite = filters.type_activite
      if (filters.statut) queryFilters.statut = filters.statut
      if (filters.dateDebut) queryFilters.dateDebut = filters.dateDebut
      if (filters.dateFin) queryFilters.dateFin = filters.dateFin
      
      const { data, error } = await projetActivitesService.getByProjet(projetIdProp, {
        filters: queryFilters
      })
      
      if (error) {
        logger.error('ACTIVITES_PROJET', 'Erreur chargement activités', error)
        toast.error('Erreur lors du chargement des activités')
      } else {
        setActivites(data || [])
      }
    } catch (error) {
      logger.error('ACTIVITES_PROJET', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    if (!projetIdProp) return
    
    try {
      const result = await projetActivitesService.getStats(projetIdProp)
      if (result.error) {
        logger.error('ACTIVITES_PROJET', 'Erreur chargement stats', result.error)
        setStats(null)
      } else {
        setStats(result.data)
      }
    } catch (error) {
      logger.error('ACTIVITES_PROJET', 'Erreur chargement stats', error)
      setStats(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) return

    try {
      const { error } = await projetActivitesService.delete(id)
      if (error) {
        toast.error('Erreur lors de la suppression')
        return
      }
      toast.success('Activité supprimée avec succès')
      loadActivites()
      loadStats()
    } catch (error) {
      logger.error('ACTIVITES_PROJET', 'Erreur suppression', error)
      toast.error('Une erreur est survenue')
    }
  }

  const handleEdit = (activite) => {
    navigate(`/projets/${activite.projet_id}/activites/${activite.id}/edit`)
  }

  const handleCreate = () => {
    if (!projetIdProp) {
      toast.error('ID projet manquant')
      return
    }
    navigate(`/projets/${projetIdProp}/activites/new`)
  }

  const handleRowClick = (row) => {
    navigate(`/projets/${row.projet_id}/activites/${row.id}`)
  }

  const toggleRow = async (row) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(row.id)) {
      newExpanded.delete(row.id)
    } else {
      newExpanded.add(row.id)
      // Charger les réservations de ressources pour cette activité
      if (!ressourcesByActivite[row.id]) {
        await loadRessourcesForActivite(row.id)
      }
    }
    setExpandedRows(newExpanded)
  }

  const loadRessourcesForActivite = async (activiteId) => {
    try {
      const { data, error } = await ressourcesService.getReservationsByActivite(activiteId)
      if (!error && data) {
        setRessourcesByActivite(prev => ({
          ...prev,
          [activiteId]: data
        }))
      }
    } catch (error) {
      logger.error('ACTIVITES_PROJET', 'Erreur chargement ressources', error)
    }
  }

  const getTypeLabel = (type) => {
    const labels = {
      'FORMATION': 'Formation',
      'ATELIER': 'Atelier',
      'REUNION': 'Réunion',
      'ENTRETIEN_INDIVIDUEL': 'Entretien individuel',
      'ENTRETIEN_COLLECTIF': 'Entretien collectif',
      'EVENEMENT': 'Événement',
      'AUTRE': 'Autre',
    }
    return labels[type] || type
  }

  const columns = [
    { 
      key: 'date_activite', 
      label: 'Date', 
      render: (value) => value ? formatDate(value) : '-' 
    },
    { 
      key: 'titre', 
      label: 'Titre',
      render: (value, row) => (
        <a 
          href={`/projets/${row.projet_id}/activites/${row.id}`}
          onClick={(e) => {
            e.preventDefault()
            handleRowClick(row)
          }}
          className="activite-link"
          title="Voir les détails"
        >
          {value}
        </a>
      )
    },
    { 
      key: 'type_activite', 
      label: 'Type', 
      render: (value) => (
        <span className="activite-type">
          {getTypeLabel(value)}
        </span>
      )
    },
    { 
      key: 'heure_debut', 
      label: 'Heure début', 
      render: (value) => value ? formatTime(value) : '-' 
    },
    { 
      key: 'duree_heures', 
      label: 'Durée', 
      render: (value) => value ? `${value}h` : '-' 
    },
    { 
      key: 'beneficiaires_ids', 
      label: 'Participants', 
      render: (value) => value && Array.isArray(value) ? value.length : 0
    },
    {
      key: 'ressources',
      label: 'Ressources',
      render: (_, row) => {
        const reservations = ressourcesByActivite[row.id] || []
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{reservations.length} ressource(s)</span>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                toggleRow(row)
              }}
            >
              <Icon name={expandedRows.has(row.id) ? "ChevronUp" : "ChevronDown"} size={14} />
            </Button>
          </div>
        )
      }
    },
    { 
      key: 'statut', 
      label: 'Statut',
      render: (value) => (
        <span className={`activite-statut statut-${value?.toLowerCase()}`}>
          {value || '-'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleEdit(row)}
            className="action-button"
            title="Modifier"
          >
            <Icon name="Edit" size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="action-button danger"
            title="Supprimer"
          >
            <Icon name="Trash2" size={16} />
          </button>
        </div>
      )
    },
  ]

  if (!projetIdProp) {
    return (
      <EmptyState 
        icon="Calendar" 
        title="Projet non spécifié" 
        message="Impossible de charger les activités sans ID de projet"
      />
    )
  }

  return (
    <div className="activites-projet">
      <div className="activites-header">
        <h2>Gestion des Activités</h2>
        <div className="activites-actions">
          <Button 
            variant="primary" 
            onClick={handleCreate}
          >
            <Icon name="Plus" size={16} />
            Nouvelle activité
          </Button>
        </div>
      </div>

      {stats && (
        <div className="activites-stats">
          <div className="stat-card">
            <div className="stat-label">Total activités</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Terminées</div>
            <div className="stat-value">{stats.terminees}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Planifiées</div>
            <div className="stat-value">{stats.planifiees}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Heures totales</div>
            <div className="stat-value">{stats.heuresTotal}h</div>
          </div>
        </div>
      )}

      <div className="activites-filters">
        <Input
          label="Date début"
          type="date"
          value={filters.dateDebut}
          onChange={(e) => setFilters({ ...filters, dateDebut: e.target.value })}
        />
        <Input
          label="Date fin"
          type="date"
          value={filters.dateFin}
          onChange={(e) => setFilters({ ...filters, dateFin: e.target.value })}
        />
        <Select
          label="Type"
          value={filters.type_activite}
          onChange={(e) => setFilters({ ...filters, type_activite: e.target.value })}
          options={[
            { value: '', label: 'Tous les types' },
            { value: 'FORMATION', label: 'Formation' },
            { value: 'ATELIER', label: 'Atelier' },
            { value: 'REUNION', label: 'Réunion' },
            { value: 'ENTRETIEN_INDIVIDUEL', label: 'Entretien individuel' },
            { value: 'ENTRETIEN_COLLECTIF', label: 'Entretien collectif' },
            { value: 'EVENEMENT', label: 'Événement' },
            { value: 'AUTRE', label: 'Autre' },
          ]}
        />
        <Select
          label="Statut"
          value={filters.statut}
          onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
          options={[
            { value: '', label: 'Tous les statuts' },
            { value: 'PLANIFIE', label: 'Planifié' },
            { value: 'EN_COURS', label: 'En cours' },
            { value: 'TERMINE', label: 'Terminé' },
            { value: 'ANNULE', label: 'Annulé' },
          ]}
        />
        {(filters.dateDebut || filters.dateFin || filters.type_activite || filters.statut) && (
          <Button 
            variant="outline" 
            onClick={() => setFilters({ type_activite: '', statut: '', dateDebut: '', dateFin: '' })}
          >
            Réinitialiser
          </Button>
        )}
      </div>

      {loading ? (
        <LoadingState message="Chargement des activités..." />
      ) : activites.length === 0 ? (
        <EmptyState 
          icon="Calendar" 
          title="Aucune activité" 
          message={activites.length === 0 
            ? "Aucune activité enregistrée pour ce projet" 
            : "Aucune activité ne correspond aux filtres"}
        />
      ) : (
        <>
          <div className="activites-summary">
            <p>
              <strong>{activites.length}</strong> activité(s)
            </p>
          </div>
          <DataTable
            columns={columns}
            data={activites}
            onRowClick={handleRowClick}
            renderExpandedRow={(row) => {
              if (!expandedRows.has(row.id)) return null
              const reservations = ressourcesByActivite[row.id] || []
              return (
                <div className="activite-ressources-expanded">
                  <h4>Ressources réservées ({reservations.length})</h4>
                  {reservations.length === 0 ? (
                    <EmptyState 
                      icon="Package" 
                      title="Aucune ressource" 
                      message="Aucune ressource n'a été réservée pour cette activité"
                      action={
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/projets/${row.projet_id}/activites/${row.id}?tab=ressources`)}
                        >
                          <Icon name="Plus" size={14} />
                          Réserver une ressource
                        </Button>
                      }
                    />
                  ) : (
                    <div className="ressources-list">
                      {reservations.map(reservation => (
                        <div key={reservation.id} className="ressource-reservation-card">
                          <div className="ressource-info">
                            <strong>{reservation.ressource?.nom || 'Ressource inconnue'}</strong>
                            <span className="ressource-type">{reservation.ressource?.type_ressource}</span>
                          </div>
                          <div className="ressource-details">
                            <span>Quantité: {reservation.quantite || 1}</span>
                            {reservation.cout && (
                              <span>Coût: {formatCurrency(reservation.cout)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            }}
          />
        </>
      )}
    </div>
  )
}

