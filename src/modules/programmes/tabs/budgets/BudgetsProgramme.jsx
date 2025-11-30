import { useState, useEffect } from 'react'
import { programmesService } from '@/services/programmes.service'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { MetricCard } from '@/components/modules/MetricCard'
import { logger } from '@/utils/logger'
import './BudgetsProgramme.css'

export default function BudgetsProgramme() {
  const [programmes, setProgrammes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBudgets()
  }, [])

  const loadBudgets = async () => {
    setLoading(true)
    try {
      const { data, error } = await programmesService.getAll()
      if (error) {
        logger.error('BUDGETS_PROGRAMME', 'Erreur chargement budgets', error)
        return
      }
      setProgrammes(data || [])
    } catch (error) {
      logger.error('BUDGETS_PROGRAMME', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  if (programmes.length === 0) {
    return <EmptyState icon="DollarSign" title="Aucun programme" message="Aucun budget à afficher" />
  }

  const totalBudget = programmes.reduce((sum, p) => sum + parseFloat(p.budget || 0), 0)
  const totalConsomme = programmes.reduce((sum, p) => sum + parseFloat(p.budget_consomme || 0), 0)

  return (
    <div className="budgets-programme">
      <div className="budgets-header">
        <h2>Suivi des Budgets par Programme</h2>
      </div>

      <div className="budgets-summary">
        <MetricCard
          title="Budget total"
          value={new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
          }).format(totalBudget)}
          detail={`Budget consommé: ${new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
          }).format(totalConsomme)}`}
          progress={totalBudget > 0 ? (totalConsomme / totalBudget) * 100 : 0}
        />
      </div>

      <div className="budgets-list">
        <table className="budgets-table">
          <thead>
            <tr>
              <th>Programme</th>
              <th>Budget alloué</th>
              <th>Budget consommé</th>
              <th>Reste</th>
              <th>Taux</th>
            </tr>
          </thead>
          <tbody>
            {programmes.map((prog) => {
              const budget = parseFloat(prog.budget || 0)
              const consomme = parseFloat(prog.budget_consomme || 0)
              const reste = budget - consomme
              const taux = budget > 0 ? (consomme / budget) * 100 : 0

              return (
                <tr key={prog.id}>
                  <td>{prog.nom}</td>
                  <td>
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'XOF',
                      minimumFractionDigits: 0,
                    }).format(budget)}
                  </td>
                  <td>
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'XOF',
                      minimumFractionDigits: 0,
                    }).format(consomme)}
                  </td>
                  <td>
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'XOF',
                      minimumFractionDigits: 0,
                    }).format(reste)}
                  </td>
                  <td>
                    <div className="progress-bar-container">
                      <div
                        className={`progress-bar ${taux > 90 ? 'critical' : taux > 75 ? 'warning' : ''}`}
                        style={{ width: `${Math.min(taux, 100)}%` }}
                      />
                      <span className="progress-text">{Math.round(taux)}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

