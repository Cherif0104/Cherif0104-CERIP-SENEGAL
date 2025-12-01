import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { programmeDepensesService } from '@/services/programme-depenses.service'
import { programmesService } from '@/services/programmes.service'
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
import './DepensesProgramme.css'

/**
 * Composant de gestion des dépenses pour un programme spécifique
 * @param {string} programmeId - ID du programme (optionnel, si non fourni permet de sélectionner)
 */
export default function DepensesProgramme({ programmeId: programmeIdProp = null }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const programmeIdFromUrl = searchParams.get('programme_id')
  const programmeId = programmeIdProp || programmeIdFromUrl
  
  const [depenses, setDepenses] = useState([])
  const [programmes, setProgrammes] = useState([])
  const [selectedProgramme, setSelectedProgramme] = useState(programmeId || '')
  
  // Si programmeId est fourni, l'utiliser directement et masquer le sélecteur
  const isProgrammeFixed = !!programmeId
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    statut: '',
    dateDebut: '',
    dateFin: '',
  })

  useEffect(() => {
    if (programmeId) {
      setSelectedProgramme(programmeId)
    }
    loadData()
  }, [programmeId])

  useEffect(() => {
    if (selectedProgramme) {
      loadDepenses()
      loadStats()
    } else {
      setDepenses([])
      setStats(null)
    }
  }, [selectedProgramme, filters])

  const loadData = async () => {
    setLoading(true)
    try {
      const { data, error } = await programmesService.getAll({
        pagination: { page: 1, pageSize: 1000 }
      })
      if (error) {
        logger.error('DEPENSES_PROGRAMME', 'Erreur chargement programmes', error)
      } else {
        setProgrammes(data || [])
        if (selectedProgramme || data?.length > 0) {
          setSelectedProgramme(selectedProgramme || data[0]?.id || '')
        }
      }
    } catch (error) {
      logger.error('DEPENSES_PROGRAMME', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDepenses = async () => {
    if (!selectedProgramme) return
    
    setLoading(true)
    try {
      const queryFilters = {}
      if (filters.statut) queryFilters.statut = filters.statut
      if (filters.dateDebut) queryFilters.dateDebut = filters.dateDebut
      if (filters.dateFin) queryFilters.dateFin = filters.dateFin
      
      const { data, error } = await programmeDepensesService.getByProgramme(selectedProgramme, {
        filters: queryFilters
      })
      
      if (error) {
        logger.error('DEPENSES_PROGRAMME', 'Erreur chargement dépenses', error)
        toast.error('Erreur lors du chargement des dépenses')
      } else {
        setDepenses(data || [])
      }
    } catch (error) {
      logger.error('DEPENSES_PROGRAMME', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    if (!selectedProgramme) return
    
    try {
      const result = await programmeDepensesService.getStats(selectedProgramme)
      if (result.error) {
        logger.error('DEPENSES_PROGRAMME', 'Erreur chargement stats', result.error)
        setStats(null)
      } else {
        setStats(result.data)
      }
    } catch (error) {
      logger.error('DEPENSES_PROGRAMME', 'Erreur chargement stats', error)
      setStats(null)
    }
  }


  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) return

    try {
      const { error } = await programmeDepensesService.delete(id)
      if (error) {
        toast.error('Erreur lors de la suppression')
        return
      }
      toast.success('Dépense supprimée avec succès')
      loadDepenses()
      loadStats()
    } catch (error) {
      logger.error('DEPENSES_PROGRAMME', 'Erreur suppression', error)
      toast.error('Une erreur est survenue')
    }
  }

  const handleEdit = (depense) => {
    navigate(`/programmes/${depense.programme_id}/depenses/${depense.id}/edit`)
  }

  const handleCreate = () => {
    const programmeToUse = selectedProgramme || programmeId
    if (!programmeToUse) {
      toast.error('Veuillez sélectionner un programme')
      return
    }
    navigate(`/programmes/${programmeToUse}/depenses/new`)
  }

  // Les dépenses sont déjà filtrées côté serveur
  const filteredDepenses = depenses

  const handleRowClick = (row) => {
    navigate(`/programmes/${row.programme_id}/depenses/${row.id}`)
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
          href={`/programmes/${row.programme_id}/depenses/${row.id}`}
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

  if (loading && !selectedProgramme) {
    return <LoadingState message="Chargement des programmes..." />
  }

  const selectedProg = programmes.find(p => p.id === selectedProgramme)

  return (
    <div className="depenses-programme">
      <div className="depenses-header">
        <h2>Gestion des Dépenses</h2>
        <div className="depenses-actions">
          {!isProgrammeFixed && (
            <Select
              label="Programme"
              value={selectedProgramme}
              onChange={(e) => {
                setSelectedProgramme(e.target.value)
                setDepenses([])
                setStats(null)
              }}
              options={[
                { value: '', label: 'Sélectionner un programme...' },
                ...programmes.map(p => ({ value: p.id, label: p.nom }))
              ]}
            />
          )}
          {selectedProgramme && (
            <Button 
              variant="primary" 
              onClick={handleCreate}
            >
              <Icon name="Plus" size={16} />
              Nouvelle dépense
            </Button>
          )}
        </div>
      </div>

      {selectedProgramme && (
        <>
          {stats && (
            <div className="depenses-stats">
              <div className="stat-card">
                <div className="stat-label">Budget total</div>
                <div className="stat-value">{formatCurrency(stats.budgetTotal)}</div>
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
                    className="stat-progress-bar"
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
                ? "Aucune dépense enregistrée pour ce programme" 
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
        </>
      )}

      {!selectedProgramme && (
        <EmptyState 
          icon="FolderKanban" 
          title="Sélectionner un programme" 
          message="Veuillez sélectionner un programme pour voir ses dépenses"
        />
      )}
    </div>
  )
}

