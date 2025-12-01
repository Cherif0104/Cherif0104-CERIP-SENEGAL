import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { programmeMetricsService } from '@/services/programme-metrics.service'
import { KPIDonut } from './KPIDonut'
import { DonutChart } from './DonutChart'
import { LoadingState } from '@/components/common/LoadingState'
import { formatCurrency } from '@/utils/format'
import { logger } from '@/utils/logger'
import './ProgrammeDashboard.css'

/**
 * Dashboard complet de programme avec métriques, KPIs et visualisations
 */
export const ProgrammeDashboard = ({ programmeId }) => {
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
  }, [programmeId])

  const loadMetrics = async () => {
    setLoading(true)
    try {
      const { data, error } = await programmeMetricsService.getProgrammeMetrics(programmeId)
      if (error) {
        logger.error('PROGRAMME_DASHBOARD', 'Erreur chargement métriques', error)
        return
      }
      setMetrics(data)
    } catch (error) {
      logger.error('PROGRAMME_DASHBOARD', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="programme-dashboard">
        <LoadingState message="Chargement des métriques..." />
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="programme-dashboard">
        <div className="programme-dashboard-empty">
          <p>Aucune métrique disponible pour ce programme</p>
        </div>
      </div>
    )
  }

  // Préparer les données pour les mini graphiques des KPIs
  const depensesChartData = metrics.trends?.depensesParMois?.slice(-6).map(d => ({
    value: d.validees || 0,
  })) || []

  const projetsChartData = metrics.trends?.projetsParMois?.slice(-6).map(d => ({
    value: d.count || 0,
  })) || []

  // Calculer les tendances (simplifié - pourrait être calculé depuis données historiques)
  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return null
    const change = ((current - previous) / previous) * 100
    return {
      type: change >= 0 ? 'positive' : 'negative',
      value: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
    }
  }

  const projetsTrend = calculateTrend(metrics.projets.total, metrics.projets.total * 0.95)
  const beneficiairesTrend = calculateTrend(metrics.beneficiaires.total, metrics.beneficiaires.total * 0.92)
  const budgetTrend = calculateTrend(metrics.finances.taux_consommation, metrics.finances.taux_consommation * 0.8)

  return (
    <div className="programme-dashboard">
      {/* Header */}
      <div className="programme-dashboard-header">
        <div>
          <h1 className="programme-dashboard-title">
            {metrics.programme.nom}
          </h1>
          <p className="programme-dashboard-subtitle">
            Dashboard de performance et d'impact
          </p>
        </div>
      </div>

      {/* KPIs principaux en Donut Charts - Style moderne */}
      <div className="programme-dashboard-kpis-donut">
        <KPIDonut
          title="Budget"
          value={metrics.finances.budget_consomme || 0}
          total={metrics.finances.budget_total || 0}
          label="Consommé"
          variant="danger"
          formatValue="currency"
          subtitle={`${formatCurrency(metrics.finances.budget_restant || 0)} restant`}
          onClick={() => navigate(`/programmes/${programmeId}?tab=finances`)}
        />
        <KPIDonut
          title="Projets"
          value={metrics.projets.en_cours || 0}
          total={metrics.projets.total || 0}
          label="En cours"
          variant="default"
          formatValue="number"
          subtitle={`${metrics.projets.termines || 0} terminés`}
          onClick={() => navigate(`/programmes/${programmeId}?tab=projets`)}
        />
        <KPIDonut
          title="Objectifs"
          value={metrics.performance.indicateurs_reussis || 0}
          total={metrics.performance.indicateurs_total || 0}
          label="Atteints"
          variant="success"
          formatValue="number"
          subtitle={`${Math.round(metrics.performance.taux_objectifs || 0)}% réussite`}
          onClick={() => navigate(`/programmes/${programmeId}?tab=reporting`)}
        />
        <KPIDonut
          title="Bénéficiaires"
          value={metrics.beneficiaires.inserts || 0}
          total={metrics.beneficiaires.total || 0}
          label="Insérés"
          variant="warning"
          formatValue="number"
          subtitle={`${Math.round(metrics.beneficiaires.taux_insertion || 0)}% taux d'insertion`}
          onClick={() => navigate(`/programmes/${programmeId}?tab=beneficiaires`)}
        />
      </div>

      {/* KPIs secondaires en Donut Charts */}
      <div className="programme-dashboard-kpis-donut">
        <KPIDonut
          title="Candidats"
          value={metrics.candidats.eligibles || 0}
          total={metrics.candidats.total || 0}
          label="Éligibles"
          variant="default"
          formatValue="number"
          subtitle={`${Math.round(metrics.candidats.taux_eligibilite || 0)}% d'éligibilité`}
          onClick={() => navigate(`/programmes/${programmeId}?tab=candidats`)}
        />
        <KPIDonut
          title="Taux de conversion"
          value={metrics.beneficiaires.total || 0}
          total={metrics.candidats.total || 0}
          label="Convertis"
          variant="success"
          formatValue="percentage"
          subtitle={`${Math.round(metrics.beneficiaires.taux_conversion || 0)}% conversion`}
          onClick={() => navigate(`/programmes/${programmeId}?tab=beneficiaires`)}
        />
        <KPIDonut
          title="Accompagnements"
          value={metrics.accompagnements.total || 0}
          total={100}
          label="Total"
          variant="default"
          formatValue="number"
          subtitle={`${Math.round(metrics.accompagnements.heures_total || 0)} heures totales`}
        />
        <KPIDonut
          title="Score de performance"
          value={metrics.performance.score_global || 0}
          total={100}
          label="Performance"
          variant="success"
          formatValue="percentage"
          subtitle={`${metrics.performance.indicateurs_reussis}/${metrics.performance.indicateurs_total} objectifs`}
          onClick={() => navigate(`/programmes/${programmeId}?tab=reporting`)}
        />
      </div>

      {/* Graphiques Donut supplémentaires */}
      <div className="programme-dashboard-charts-row">
        <div className="donut-chart-card">
          <DonutChart
            title="Répartition des projets par statut"
            data={metrics.projets.repartitionParStatut?.map(p => ({
              name: p.statut,
              label: p.statut,
              value: p.count,
              color: p.statut === 'TERMINE' ? '#10b981' : 
                     p.statut === 'EN_COURS' ? '#3b82f6' :
                     p.statut === 'EN_RETARD' ? '#ef4444' : '#f59e0b'
            })) || []}
            centerValue={metrics.projets.total}
            centerLabel="Projets"
            height={280}
          />
        </div>
        <div className="donut-chart-card">
          <DonutChart
            title="Répartition des dépenses"
            data={[
              {
                name: 'validées',
                label: 'Validées',
                value: metrics.finances.budget_consomme || 0,
                color: '#10b981'
              },
              {
                name: 'en_attente',
                label: 'En attente',
                value: Math.max(0, (metrics.finances.budget_total || 0) - (metrics.finances.budget_consomme || 0)),
                color: '#f59e0b'
              }
            ]}
            centerValue={formatCurrency(metrics.finances.budget_consomme || 0)}
            centerLabel="Dépenses"
            height={280}
          />
        </div>
      </div>

      {/* Card de résumé */}
      <div className="programme-dashboard-summary-card">
        <h3>Top Projet</h3>
        <div className="summary-card-content">
          <p className="summary-card-main">
            {metrics.projets.total > 0 ? 'Projet principal' : 'Aucun projet'}
          </p>
          <p className="summary-card-description">
            {metrics.beneficiaires.total > 0
              ? `${metrics.beneficiaires.total} bénéficiaires (${Math.round(
                  (metrics.beneficiaires.total / metrics.projets.total) * 10
                )}%) sont suivis dans ce programme.`
              : 'Aucun bénéficiaire enregistré.'}
          </p>
        </div>
      </div>

      {/* Tableau détaillé */}
      <div className="programme-dashboard-table-section">
        <h3>Résumé par métrique</h3>
        <div className="programme-dashboard-metrics-table">
          <div className="metrics-table-row">
            <div className="metrics-table-label">Budget restant</div>
            <div className="metrics-table-value">
              {formatCurrency(metrics.finances.budget_restant)}
            </div>
          </div>
          <div className="metrics-table-row">
            <div className="metrics-table-label">Coût par bénéficiaire</div>
            <div className="metrics-table-value">
              {formatCurrency(metrics.finances.cout_par_beneficiaire)}
            </div>
          </div>
          <div className="metrics-table-row">
            <div className="metrics-table-label">Projets en retard</div>
            <div className="metrics-table-value">{metrics.projets.en_retard}</div>
          </div>
          <div className="metrics-table-row">
            <div className="metrics-table-label">Taux de complétion projets</div>
            <div className="metrics-table-value">
              {Math.round(metrics.projets.taux_completion)}%
            </div>
          </div>
          <div className="metrics-table-row">
            <div className="metrics-table-label">Bénéficiaires actifs</div>
            <div className="metrics-table-value">{metrics.beneficiaires.actifs}</div>
          </div>
          <div className="metrics-table-row">
            <div className="metrics-table-label">Bénéficiaires accompagnés</div>
            <div className="metrics-table-value">{metrics.beneficiaires.accompagnes}</div>
          </div>
          <div className="metrics-table-row">
            <div className="metrics-table-label">Heures d'accompagnement moyennes</div>
            <div className="metrics-table-value">
              {Math.round(metrics.accompagnements.heures_moyennes)}h
            </div>
          </div>
          <div className="metrics-table-row">
            <div className="metrics-table-label">Taux d'atteinte des objectifs</div>
            <div className="metrics-table-value">
              {Math.round(metrics.performance.taux_objectifs)}%
            </div>
          </div>
        </div>
      </div>

      {/* Cards de résumé */}
      <div className="programme-dashboard-summary-cards">
        <div className="summary-card">
          <h3>Condition médicale la plus courante</h3>
          <p className="summary-main">À définir</p>
          <p className="summary-desc">
            Analyse des besoins des bénéficiaires en cours.
          </p>
        </div>
        <div className="summary-card">
          <h3>Top Formation</h3>
          <p className="summary-main">Formation principale</p>
          <p className="summary-desc">
            {metrics.interactions.formations > 0
              ? `${metrics.interactions.formations} formations dispensées.`
              : 'Aucune formation enregistrée.'}
          </p>
        </div>
      </div>
    </div>
  )
}

