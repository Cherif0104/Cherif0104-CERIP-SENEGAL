import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { programmeDepensesService } from '@/services/programme-depenses.service'
import { programmesService } from '@/services/programmes.service'
import { DataTable } from '@/components/common/DataTable'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { toast } from '@/components/common/Toast'
import { formatDate, formatCurrency } from '@/utils/format'
import { logger } from '@/utils/logger'
import { DonutChart } from '@/components/modules/DonutChart'
import { KPIDonut } from '@/components/modules/KPIDonut'
import './FinancesProgramme.css'

/**
 * Composant unifié de gestion financière pour un programme
 * Regroupe : KPIs financiers, dépenses, financements et visualisations
 * @param {string} programmeId - ID du programme
 */
export default function FinancesProgramme({ programmeId }) {
  const navigate = useNavigate()
  
  const [programme, setProgramme] = useState(null)
  const [depenses, setDepenses] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [evolutionData, setEvolutionData] = useState([])
  const [filters, setFilters] = useState({
    statut: '',
    dateDebut: '',
    dateFin: '',
  })
  const [activeSection, setActiveSection] = useState('overview') // 'overview', 'depenses'

  useEffect(() => {
    if (programmeId) {
      loadAllData()
    }
  }, [programmeId, filters])

  const loadAllData = async () => {
    if (!programmeId) return
    
    setLoading(true)
    try {
      const [progResult, depensesResult, statsResult, evolutionResult] = await Promise.all([
        programmesService.getById(programmeId),
        programmeDepensesService.getByProgramme(programmeId, {
          filters: {
            statut: filters.statut || undefined,
            dateDebut: filters.dateDebut || undefined,
            dateFin: filters.dateFin || undefined,
          }
        }),
        programmeDepensesService.getStats(programmeId),
        programmeDepensesService.getEvolutionData(programmeId, 'month')
      ])

      if (progResult.error) {
        logger.error('FINANCES_PROGRAMME', 'Erreur chargement programme', progResult.error)
      } else {
        setProgramme(progResult.data)
      }

      if (depensesResult.error) {
        logger.error('FINANCES_PROGRAMME', 'Erreur chargement dépenses', depensesResult.error)
        toast.error('Erreur lors du chargement des dépenses')
      } else {
        setDepenses(depensesResult.data || [])
      }

      if (statsResult.error) {
        logger.error('FINANCES_PROGRAMME', 'Erreur chargement stats', statsResult.error)
        setStats(null)
      } else {
        setStats(statsResult.data)
      }

      if (evolutionResult.error) {
        logger.error('FINANCES_PROGRAMME', 'Erreur chargement évolution', evolutionResult.error)
        setEvolutionData([])
      } else {
        setEvolutionData(evolutionResult.data || [])
      }
    } catch (error) {
      logger.error('FINANCES_PROGRAMME', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDepense = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) return

    try {
      const { error } = await programmeDepensesService.delete(id)
      if (error) {
        toast.error('Erreur lors de la suppression')
        return
      }
      toast.success('Dépense supprimée avec succès')
      loadAllData()
    } catch (error) {
      logger.error('FINANCES_PROGRAMME', 'Erreur suppression', error)
      toast.error('Une erreur est survenue')
    }
  }

  const handleEditDepense = (depense) => {
    navigate(`/programmes/${depense.programme_id}/depenses/${depense.id}/edit`)
  }

  const handleCreateDepense = () => {
    navigate(`/programmes/${programmeId}/depenses/new`)
  }

  const handleRowClickDepense = (row) => {
    navigate(`/programmes/${row.programme_id}/depenses/${row.id}`)
  }

  // Budget disponible = budget initial du programme
  const budgetTotal = programme?.budget || stats?.budgetTotal || 0
  const budgetDisponible = budgetTotal

  // Colonnes pour les dépenses
  const depensesColumns = [
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
            handleRowClickDepense(row)
          }}
          className="finance-link"
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
        <span className={`finance-statut statut-${value?.toLowerCase()}`}>
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
            onClick={() => handleEditDepense(row)}
            className="action-button"
            title="Modifier"
          >
            <Icon name="Edit" size={16} />
          </button>
          <button
            onClick={() => handleDeleteDepense(row.id)}
            className="action-button danger"
            title="Supprimer"
          >
            <Icon name="Trash2" size={16} />
          </button>
        </div>
      )
    },
  ]


  if (loading) {
    return <LoadingState message="Chargement des données financières..." />
  }

  return (
    <div className="finances-programme">
      {/* Header avec navigation par sections */}
      <div className="finances-header">
        <h2>Finances du Programme</h2>
        <div className="finances-sections-nav">
          <button
            className={`section-nav-btn ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSection('overview')}
          >
            <Icon name="BarChart3" size={18} />
            Vue d'ensemble
          </button>
          <button
            className={`section-nav-btn ${activeSection === 'depenses' ? 'active' : ''}`}
            onClick={() => setActiveSection('depenses')}
          >
            <Icon name="Receipt" size={18} />
            Dépenses
          </button>
        </div>
      </div>

      {/* Vue d'ensemble - KPIs et graphiques */}
      {activeSection === 'overview' && (
        <div className="finances-overview">
          {/* KPIs financiers principaux */}
          <div className="finances-kpis">
            <KPIDonut
              title="Budget Total"
              value={budgetTotal}
              total={budgetTotal}
              label="Total"
              variant="default"
              formatValue="currency"
              subtitle={`Budget du programme`}
            />
            <KPIDonut
              title="Budget Consommé"
              value={stats?.budgetConsomme || 0}
              total={budgetDisponible}
              label="Consommé"
              variant="danger"
              formatValue="currency"
              subtitle={`${formatCurrency(stats?.budgetRestant || 0)} restant`}
            />
            <KPIDonut
              title="Dépenses Validées"
              value={stats?.depensesValidees || 0}
              total={stats?.totalDepenses || 0}
              label="Validées"
              variant="success"
              formatValue="currency"
              subtitle={`${stats?.totalDepenses || 0} dépenses au total`}
            />
            <KPIDonut
              title="Dépenses Payées"
              value={stats?.depensesPayees || 0}
              total={stats?.totalDepenses || 0}
              label="Payées"
              variant="default"
              formatValue="currency"
              subtitle={`${stats?.depensesValidees || 0} validées`}
            />
          </div>

          {/* Graphiques Donut */}
          {stats && stats.budgetTotal > 0 && (
            <div className="finances-charts-row">
              <div className="donut-chart-card">
                <DonutChart
                  title="Répartition des dépenses par statut"
                  data={[
                    {
                      name: 'payees',
                      label: 'Payées',
                      value: stats?.depensesPayees || 0,
                      color: '#10b981'
                    },
                    {
                      name: 'validees',
                      label: 'Validées',
                      value: (stats?.depensesValidees || 0) - (stats?.depensesPayees || 0),
                      color: '#3b82f6'
                    },
                    {
                      name: 'en_attente',
                      label: 'En attente',
                      value: (stats?.totalDepenses || 0) - (stats?.depensesValidees || 0),
                      color: '#f59e0b'
                    }
                  ]}
                  centerValue={stats?.totalDepenses || 0}
                  centerLabel="Dépenses"
                  height={280}
                />
              </div>
              <div className="donut-chart-card">
                <DonutChart
                  title="Budget vs Dépenses"
                  data={[
                    {
                      name: 'consomme',
                      label: 'Consommé',
                      value: stats?.budgetConsomme || 0,
                      color: '#ef4444'
                    },
                    {
                      name: 'restant',
                      label: 'Restant',
                      value: stats?.budgetRestant || 0,
                      color: '#10b981'
                    }
                  ]}
                  centerValue={formatCurrency(budgetDisponible)}
                  centerLabel="Budget Total"
                  height={280}
                />
              </div>
            </div>
          )}

          {/* Statistiques détaillées */}
          {stats && (
            <div className="finances-stats-grid">
              <div className="stat-card">
                <div className="stat-label">Budget initial</div>
                <div className="stat-value">{formatCurrency(budgetTotal)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Budget disponible</div>
                <div className="stat-value">{formatCurrency(budgetDisponible)}</div>
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
        </div>
      )}

      {/* Section Dépenses */}
      {activeSection === 'depenses' && (
        <div className="finances-depenses">
          <div className="section-header">
            <h3>Gestion des Dépenses</h3>
            <Button variant="primary" onClick={handleCreateDepense}>
              <Icon name="Plus" size={16} />
              Nouvelle dépense
            </Button>
          </div>

          {/* Filtres */}
          <div className="finances-filters">
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

          {depenses.length === 0 ? (
            <EmptyState 
              icon="Receipt" 
              title="Aucune dépense" 
              message="Aucune dépense enregistrée pour ce programme"
            />
          ) : (
            <>
              <div className="finances-summary">
                <p>
                  <strong>{depenses.length}</strong> dépense(s) - 
                  Total: <strong>{formatCurrency(depenses.reduce((sum, d) => sum + parseFloat(d.montant || 0), 0))}</strong>
                </p>
              </div>
              <DataTable
                columns={depensesColumns}
                data={depenses}
                onRowClick={handleRowClickDepense}
              />
            </>
          )}
        </div>
      )}

    </div>
  )
}

