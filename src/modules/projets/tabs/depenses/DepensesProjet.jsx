import { useState, useEffect } from 'react'
import { projetDepensesService } from '@/services/projet-depenses.service'
import { DataTable } from '@/components/common/DataTable'
import { Button } from '@/components/common/Button'
import { Select } from '@/components/common/Select'
import { Input } from '@/components/common/Input'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { toast } from '@/components/common/Toast'
import { formatDate, formatCurrency } from '@/utils/format'
import { logger } from '@/utils/logger'
import { useNavigate } from 'react-router-dom'
import './DepensesProjet.css'

/**
 * Composant de gestion des dépenses pour un projet spécifique
 * @param {string} projetId - ID du projet
 */
export default function DepensesProjet({ projetId: projetIdProp = null }) {
  const navigate = useNavigate()
  const [depenses, setDepenses] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    statut: '',
    dateDebut: '',
    dateFin: '',
  })

  useEffect(() => {
    if (projetIdProp) {
      loadDepenses()
      loadStats()
    }
  }, [projetIdProp, filters])

  const loadDepenses = async () => {
    if (!projetIdProp) return
    
    setLoading(true)
    try {
      const queryFilters = {}
      if (filters.statut) queryFilters.statut = filters.statut
      if (filters.dateDebut) queryFilters.dateDebut = filters.dateDebut
      if (filters.dateFin) queryFilters.dateFin = filters.dateFin
      
      const { data, error } = await projetDepensesService.getByProjet(projetIdProp, {
        filters: queryFilters
      })
      
      if (error) {
        logger.error('DEPENSES_PROJET', 'Erreur chargement dépenses', error)
        toast.error('Erreur lors du chargement des dépenses')
      } else {
        setDepenses(data || [])
      }
    } catch (error) {
      logger.error('DEPENSES_PROJET', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    if (!projetIdProp) return
    
    try {
      const result = await projetDepensesService.getStats(projetIdProp)
      if (result.error) {
        logger.error('DEPENSES_PROJET', 'Erreur chargement stats', result.error)
        setStats(null)
      } else {
        setStats(result.data)
      }
    } catch (error) {
      logger.error('DEPENSES_PROJET', 'Erreur chargement stats', error)
      setStats(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) return

    try {
      const { error } = await projetDepensesService.delete(id)
      if (error) {
        toast.error('Erreur lors de la suppression')
        return
      }
      toast.success('Dépense supprimée avec succès')
      loadDepenses()
      loadStats()
    } catch (error) {
      logger.error('DEPENSES_PROJET', 'Erreur suppression', error)
      toast.error('Une erreur est survenue')
    }
  }

  const handleEdit = (depense) => {
    navigate(`/projets/${depense.projet_id}/depenses/${depense.id}/edit`)
  }

  const handleCreate = () => {
    if (!projetIdProp) {
      toast.error('ID projet manquant')
      return
    }
    navigate(`/projets/${projetIdProp}/depenses/new`)
  }

  const filteredDepenses = depenses

  const handleRowClick = (row) => {
    navigate(`/projets/${row.projet_id}/depenses/${row.id}`)
  }

  const columns = [
    { 
      key: 'date_depense', 
      label: 'Date', 
      render: (value) => value ? formatDate(value) : '-' 
    },
    { 
      key: 'libelle', 
      label: 'Libellé',
      render: (value, row) => (
        <a 
          href={`/projets/${row.projet_id}/depenses/${row.id}`}
          onClick={(e) => {
            e.preventDefault()
            handleRowClick(row)
          }}
          className="depense-link"
          title="Voir les détails"
        >
          {value}
        </a>
      )
    },
    { 
      key: 'montant', 
      label: 'Montant', 
      render: (value) => value ? formatCurrency(value) : '-' 
    },
    { 
      key: 'statut', 
      label: 'Statut',
      render: (value) => (
        <span className={`depense-statut statut-${value?.toLowerCase()}`}>
          {value || '-'}
        </span>
      )
    },
    {
      key: 'reference',
      label: 'Référence',
    },
    {
      key: 'justificatif_url',
      label: 'Pièce justificative',
      render: (value) => value ? (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="justificatif-link"
        >
          <Icon name="FileText" size={16} />
          Voir
        </a>
      ) : '-'
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
        icon="FolderKanban" 
        title="Projet non spécifié" 
        message="Impossible de charger les dépenses sans ID de projet"
      />
    )
  }

  return (
    <div className="depenses-projet">
      <div className="depenses-header">
        <h2>Gestion des Dépenses</h2>
        <div className="depenses-actions">
          <Button 
            variant="primary" 
            onClick={handleCreate}
          >
            <Icon name="Plus" size={16} />
            Nouvelle dépense
          </Button>
        </div>
      </div>

      {stats && (
        <div className="depenses-stats">
          <div className="stat-card">
            <div className="stat-label">Budget alloué</div>
            <div className="stat-value">{formatCurrency(stats.budgetAlloue)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Dépenses validées</div>
            <div className="stat-value">{formatCurrency(stats.depensesValidees)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Budget restant</div>
            <div className={`stat-value ${stats.budgetRestant < 0 ? 'negative' : ''}`}>
              {formatCurrency(stats.budgetRestant)}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Taux de consommation</div>
            <div className={`stat-value ${stats.tauxConsommation > 90 ? 'critical' : stats.tauxConsommation > 75 ? 'warning' : ''}`}>
              {stats.tauxConsommation.toFixed(1)}%
            </div>
            <div className="stat-progress">
              <div 
                className={`stat-progress-bar ${stats.tauxConsommation > 90 ? 'critical' : stats.tauxConsommation > 75 ? 'warning' : ''}`}
                style={{ width: `${Math.min(stats.tauxConsommation, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="depenses-filters">
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
          label="Statut"
          value={filters.statut}
          onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
          options={[
            { value: '', label: 'Tous les statuts' },
            { value: 'BROUILLON', label: 'Brouillon' },
            { value: 'VALIDE', label: 'Validé' },
            { value: 'PAYE', label: 'Payé' },
            { value: 'ANNULE', label: 'Annulé' },
          ]}
        />
        {(filters.dateDebut || filters.dateFin || filters.statut) && (
          <Button 
            variant="outline" 
            onClick={() => setFilters({ statut: '', dateDebut: '', dateFin: '' })}
          >
            Réinitialiser
          </Button>
        )}
      </div>

      {loading ? (
        <LoadingState message="Chargement des dépenses..." />
      ) : filteredDepenses.length === 0 ? (
        <EmptyState 
          icon="Receipt" 
          title="Aucune dépense" 
          message={depenses.length === 0 
            ? "Aucune dépense enregistrée pour ce projet" 
            : "Aucune dépense ne correspond aux filtres"}
        />
      ) : (
        <>
          <div className="depenses-summary">
            <p>
              <strong>{filteredDepenses.length}</strong> dépense(s) - 
              Total: <strong>{formatCurrency(filteredDepenses.reduce((sum, d) => sum + parseFloat(d.montant || 0), 0))}</strong>
            </p>
          </div>
          <DataTable
            columns={columns}
            data={filteredDepenses}
            onRowClick={handleRowClick}
          />
        </>
      )}
    </div>
  )
}

