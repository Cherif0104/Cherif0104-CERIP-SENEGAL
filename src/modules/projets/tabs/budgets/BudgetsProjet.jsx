import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { projetsService } from '@/services/projets.service'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { MetricCard } from '@/components/modules/MetricCard'
import { Select } from '@/components/common/Select'
import { toast } from '@/components/common/Toast'
import { logger } from '@/utils/logger'
import './BudgetsProjet.css'

export default function BudgetsProjet() {
  const [searchParams] = useSearchParams()
  const projetIdFromUrl = searchParams.get('projet_id')
  
  const [projets, setProjets] = useState([])
  const [allProjets, setAllProjets] = useState([])
  const [selectedProjet, setSelectedProjet] = useState(projetIdFromUrl || '')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Charger tous les projets pour le filtre (une seule fois au montage)
    projetsService.getAll().then(({ data }) => {
      setAllProjets(data || [])
    })
  }, [])

  useEffect(() => {
    loadBudgets()
  }, [selectedProjet])

  const loadBudgets = async () => {
    setLoading(true)
    try {
      const { data, error } = await projetsService.getAll(selectedProjet || null)
      if (error) {
        logger.error('BUDGETS_PROJET', 'Erreur chargement budgets', error)
        toast.error('Erreur lors du chargement des budgets')
        return
      }
      setProjets(data || [])
    } catch (error) {
      logger.error('BUDGETS_PROJET', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  if (projets.length === 0) {
    return (
      <EmptyState 
        icon="DollarSign" 
        title="Aucun projet" 
        message={selectedProjet ? "Ce projet n'a pas de données budgétaires" : "Aucun budget à afficher"} 
      />
    )
  }

  const totalBudget = projets.reduce((sum, p) => sum + parseFloat(p.budget_alloue || 0), 0)
  const totalConsomme = projets.reduce((sum, p) => sum + parseFloat(p.budget_consomme || 0), 0)

  return (
    <div className="budgets-projet">
      <div className="budgets-header">
        <h2>Suivi des Budgets par Projet</h2>
        <Select
          label="Filtrer par projet"
          value={selectedProjet}
          onChange={(e) => setSelectedProjet(e.target.value)}
          options={[
            { value: '', label: 'Tous les projets' },
            ...(allProjets || []).map(p => ({ value: p.id, label: p.nom }))
          ]}
        />
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
              <th>Projet</th>
              <th>Budget alloué</th>
              <th>Budget consommé</th>
              <th>Reste</th>
              <th>Taux</th>
            </tr>
          </thead>
          <tbody>
            {projets.map((proj) => {
              const budget = parseFloat(proj.budget_alloue || 0)
              const consomme = parseFloat(proj.budget_consomme || 0)
              const reste = budget - consomme
              const taux = budget > 0 ? (consomme / budget) * 100 : 0

              return (
                <tr key={proj.id}>
                  <td>{proj.nom}</td>
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

