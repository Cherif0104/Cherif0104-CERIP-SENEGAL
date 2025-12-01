import { useState, useEffect } from 'react'
import { programmesService } from '@/services/programmes.service'
import { programmeDepensesService } from '@/services/programme-depenses.service'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { MetricCard } from '@/components/modules/MetricCard'
import { logger } from '@/utils/logger'
import { formatCurrency } from '@/utils/format'
import './BudgetsProgramme.css'

/**
 * Composant de suivi des budgets pour un programme spécifique
 * @param {string} programmeId - ID du programme (optionnel, si non fourni affiche tous les programmes)
 */
export default function BudgetsProgramme({ programmeId = null }) {
  const [programme, setProgramme] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBudgets()
  }, [programmeId])

  const loadBudgets = async () => {
    setLoading(true)
    try {
      if (programmeId) {
        // Charger le programme spécifique et ses stats de dépenses
        const [progResult, statsResult] = await Promise.all([
          programmesService.getById(programmeId),
          programmeDepensesService.getStats(programmeId)
        ])

        if (progResult.error) {
          logger.error('BUDGETS_PROGRAMME', 'Erreur chargement programme', progResult.error)
          return
        }
        setProgramme(progResult.data)
        
        if (statsResult.error) {
          logger.error('BUDGETS_PROGRAMME', 'Erreur chargement stats', statsResult.error)
          setStats(null)
        } else {
          setStats(statsResult.data)
        }
      } else {
        // Comportement par défaut : charger tous les programmes (pour compatibilité)
        const { data, error } = await programmesService.getAll()
        if (error) {
          logger.error('BUDGETS_PROGRAMME', 'Erreur chargement budgets', error)
          return
        }
        setProgramme(data?.[0] || null) // Prendre le premier pour la compatibilité
      }
    } catch (error) {
      logger.error('BUDGETS_PROGRAMME', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  if (!programme && programmeId) {
    return <EmptyState icon="DollarSign" title="Programme non trouvé" message="Aucun budget à afficher" />
  }

  const budget = parseFloat(programme?.budget || 0)
  const budgetConsomme = stats?.depensesValidees || parseFloat(programme?.budget_consomme || 0)
  const budgetRestant = budget - budgetConsomme
  const taux = budget > 0 ? (budgetConsomme / budget) * 100 : 0

  return (
    <div className="budgets-programme">
      <div className="budgets-header">
        <h2>Suivi du Budget{programme ? ` - ${programme.nom}` : ''}</h2>
      </div>

      <div className="budgets-summary">
        <MetricCard
          title="Budget total"
          value={formatCurrency(budget)}
          detail={`Budget consommé: ${formatCurrency(budgetConsomme)}`}
          progress={taux}
        />
        <MetricCard
          title="Budget restant"
          value={formatCurrency(budgetRestant)}
          detail={`Taux de consommation: ${Math.round(taux)}%`}
          progress={taux}
        />
      </div>

      {stats && (
        <div className="budgets-details">
          <div className="budget-stat-card">
            <div className="stat-label">Dépenses validées</div>
            <div className="stat-value">{formatCurrency(stats.depensesValidees || 0)}</div>
          </div>
          <div className="budget-stat-card">
            <div className="stat-label">Dépenses en attente</div>
            <div className="stat-value">{formatCurrency(stats.depensesEnAttente || 0)}</div>
          </div>
          <div className="budget-stat-card">
            <div className="stat-label">Nombre de dépenses</div>
            <div className="stat-value">{stats.nombreDepenses || 0}</div>
          </div>
        </div>
      )}

      <div className="budgets-progress">
        <div className="progress-info">
          <span>Consommation du budget</span>
          <span>{Math.round(taux)}%</span>
        </div>
        <div className="progress-bar-container">
          <div
            className={`progress-bar ${taux > 90 ? 'critical' : taux > 75 ? 'warning' : ''}`}
            style={{ width: `${Math.min(taux, 100)}%` }}
          />
        </div>
        <div className="progress-details">
          <span>{formatCurrency(budgetConsomme)} / {formatCurrency(budget)}</span>
        </div>
      </div>
    </div>
  )
}

