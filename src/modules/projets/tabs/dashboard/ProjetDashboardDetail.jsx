import { useEffect, useState } from 'react'
import { projetMetricsService } from '@/services/projet-metrics.service'
import { KPICard } from '@/components/modules/KPICard'
import { MetricCard } from '@/components/modules/MetricCard'
import { AlertsSection } from '@/components/modules/AlertsSection'
import { LoadingState } from '@/components/common/LoadingState'
import { DataTable } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { projetDepensesService } from '@/services/projet-depenses.service'
import { logger } from '@/utils/logger'
import { formatCurrency, formatDate } from '@/utils/format'
import { useNavigate } from 'react-router-dom'
import './ProjetDashboardDetail.css'

/**
 * Dashboard complet d'un projet - Synchronisé avec toutes les données saisies
 * Affiche toutes les métriques : finances, activités, candidats, bénéficiaires, etc.
 */
export default function ProjetDashboardDetail({ projetId }) {
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState(null)
  const [depenses, setDepenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (projetId) {
      loadMetrics()
    }
  }, [projetId])

  const loadMetrics = async () => {
    setLoading(true)
    try {
      logger.debug('PROJET_DASHBOARD_DETAIL', 'Chargement métriques complètes', { projetId })
      
      // Charger métriques et dépenses en parallèle
      const [metricsResult, depensesResult] = await Promise.all([
        projetMetricsService.getProjetMetrics(projetId),
        projetDepensesService.getByProjet(projetId, {}).catch(() => ({ data: [], error: null }))
      ])
      
      if (metricsResult.error) {
        logger.error('PROJET_DASHBOARD_DETAIL', 'Erreur chargement métriques', metricsResult.error)
      } else {
        setMetrics(metricsResult.data)
      }

      if (depensesResult?.error) {
        logger.error('PROJET_DASHBOARD_DETAIL', 'Erreur chargement dépenses', depensesResult.error)
      } else {
        // Limiter à 10 dernières dépenses
        const depensesLimited = (depensesResult?.data || []).slice(0, 10)
        setDepenses(depensesLimited)
      }

      logger.debug('PROJET_DASHBOARD_DETAIL', 'Métriques et dépenses chargées avec succès', { projetId })
    } catch (error) {
      logger.error('PROJET_DASHBOARD_DETAIL', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingState message="Chargement des données complètes..." />
  }

  if (!metrics) {
    return (
      <div className="projet-dashboard-error">
        <p>Impossible de charger les métriques du projet</p>
      </div>
    )
  }

  const { projet, finances, activites, candidats, beneficiaires, jalons } = metrics

  // Générer les alertes
  const alerts = []
  
  // Vérifier si des dépenses existent mais ne sont pas comptées dans le budget
  if (finances.nombre_depenses > 0 && finances.budget_consomme === 0 && finances.depenses_total > 0) {
    alerts.push({
      priority: 'WARNING',
      title: 'Dépenses non comptabilisées',
      description: `${finances.nombre_depenses} dépense(s) existent mais ne sont pas encore comptées dans le budget consommé (statuts non retenus pour le reporting). Cliquez pour vérifier.`,
      action: () => navigate(`/projets/${projetId}?tab=depenses`),
      actionLabel: 'Voir les dépenses',
    })
  }
  
  if (finances.taux_consommation > 90) {
    alerts.push({
      priority: 'CRITICAL',
      title: 'Budget critique',
      description: `Budget consommé à ${finances.taux_consommation.toFixed(1)}%`,
    })
  } else if (finances.taux_consommation > 75) {
    alerts.push({
      priority: 'WARNING',
      title: 'Budget élevé',
      description: `Budget consommé à ${finances.taux_consommation.toFixed(1)}%`,
    })
  }

  if (jalons.en_retard > 0) {
    alerts.push({
      priority: 'WARNING',
      title: 'Jalons en retard',
      description: `${jalons.en_retard} jalon(s) en retard`,
      action: () => navigate(`/projets/${projetId}?tab=jalons`),
      actionLabel: 'Voir les jalons',
    })
  }

  return (
    <div className="projet-dashboard-detail">
      {/* KPIs Principaux */}
      <div className="kpi-grid-single-line">
        <KPICard
          title="Budget total"
          value={formatCurrency(finances.budget_alloue)}
          icon="DollarSign"
          variant="primary"
        />
        <KPICard
          title="Taux de consommation"
          value={`${finances.taux_consommation.toFixed(1)}%`}
          icon="TrendingUp"
          variant={finances.taux_consommation > 90 ? 'danger' : finances.taux_consommation > 75 ? 'warning' : 'success'}
        />
        <KPICard
          title="Bénéficiaires"
          value={beneficiaires.total}
          icon="Users"
          variant="info"
        />
        <KPICard
          title="Candidats"
          value={candidats.total}
          icon="UserCheck"
          variant="info"
        />
        <KPICard
          title="Activités"
          value={activites.total}
          icon="Calendar"
          variant="info"
        />
        <KPICard
          title="Jalons"
          value={`${jalons.termines}/${jalons.total}`}
          icon="CheckCircle"
          variant={jalons.total > 0 && jalons.termines === jalons.total ? 'success' : 'info'}
        />
      </div>

      {/* Alertes */}
      {alerts.length > 0 && (
        <AlertsSection alerts={alerts} />
      )}

      {/* Sections détaillées */}
      <div className="dashboard-sections">
        {/* Finances */}
        <div className="dashboard-section">
          <h3>Finances</h3>
          <div className="metrics-grid">
            <MetricCard
              label="Budget alloué"
              value={formatCurrency(finances.budget_alloue)}
              icon="DollarSign"
            />
            <MetricCard
              label="Budget consommé"
              value={formatCurrency(finances.budget_consomme)}
              icon="TrendingUp"
            />
            <MetricCard
              label="Budget restant"
              value={formatCurrency(finances.budget_restant)}
              icon="TrendingDown"
            />
            <MetricCard
              label="Taux de consommation"
              value={`${finances.taux_consommation.toFixed(1)}%`}
              icon="Percent"
            />
          </div>
        </div>

        {/* Progression */}
        <div className="dashboard-section">
          <h3>Progression</h3>
          <div className="metrics-grid">
            <MetricCard
              label="Jalons terminés"
              value={`${jalons.termines} / ${jalons.total}`}
              icon="CheckCircle"
            />
            <MetricCard
              label="Taux d'avancement"
              value={`${jalons.taux_avancement.toFixed(1)}%`}
              icon="Target"
            />
            <MetricCard
              label="Jalons en retard"
              value={jalons.en_retard}
              icon="AlertCircle"
              variant={jalons.en_retard > 0 ? 'warning' : 'default'}
            />
          </div>
        </div>

        {/* Bénéficiaires */}
        <div className="dashboard-section">
          <h3>Bénéficiaires</h3>
          <div className="metrics-grid">
            <MetricCard
              label="Total"
              value={beneficiaires.total}
              icon="Users"
            />
            <MetricCard
              label="Actifs"
              value={beneficiaires.actifs}
              icon="UserCheck"
            />
            <MetricCard
              label="Accompagnés"
              value={beneficiaires.accompagnes}
              icon="UserCog"
            />
            <MetricCard
              label="Insérés"
              value={beneficiaires.inserts}
              icon="UserCheck"
            />
            {beneficiaires.total > 0 && (
              <MetricCard
                label="Taux d'insertion"
                value={`${beneficiaires.taux_insertion.toFixed(1)}%`}
                icon="TrendingUp"
              />
            )}
          </div>
        </div>

        {/* Candidats */}
        <div className="dashboard-section">
          <h3>Candidats</h3>
          <div className="metrics-grid">
            <MetricCard
              label="Total"
              value={candidats.total}
              icon="UserCheck"
            />
            <MetricCard
              label="Éligibles"
              value={candidats.eligibles}
              icon="CheckCircle"
            />
            <MetricCard
              label="Non éligibles"
              value={candidats.non_eligibles}
              icon="XCircle"
            />
            <MetricCard
              label="En attente"
              value={candidats.en_attente}
              icon="Clock"
            />
            {candidats.total > 0 && (
              <MetricCard
                label="Taux d'éligibilité"
                value={`${candidats.taux_eligibilite.toFixed(1)}%`}
                icon="Percent"
              />
            )}
          </div>
        </div>

        {/* Activités */}
        <div className="dashboard-section">
          <h3>Activités</h3>
          <div className="metrics-grid">
            <MetricCard
              label="Total"
              value={activites.total}
              icon="Calendar"
            />
            <MetricCard
              label="Terminées"
              value={activites.terminees}
              icon="CheckCircle"
            />
            <MetricCard
              label="Planifiées"
              value={activites.planifiees}
              icon="Clock"
            />
            <MetricCard
              label="Heures totales"
              value={`${activites.heures_total}h`}
              icon="Clock"
            />
            {activites.total > 0 && (
              <MetricCard
                label="Participants moyens"
                value={activites.participants_moyens.toFixed(1)}
                icon="Users"
              />
            )}
          </div>
        </div>
      </div>

      {/* Dépenses récentes */}
      {depenses.length > 0 && (
        <div className="dashboard-section">
          <div className="section-header">
            <h3>Dépenses récentes</h3>
            <button
              className="view-all-link"
              onClick={() => navigate(`/projets/${projetId}?tab=depenses`)}
            >
              Voir tout →
            </button>
          </div>
          <DataTable
            columns={[
              { key: 'libelle', label: 'Libellé' },
              { key: 'montant', label: 'Montant', render: (value) => formatCurrency(value) },
              { key: 'date', label: 'Date', render: (value) => value ? formatDate(value) : '-' },
              { key: 'statut', label: 'Statut', render: (value) => (
                <span className={`statut-badge statut-${value?.toLowerCase().replace(/\s+/g, '-')}`}>
                  {value || '-'}
                </span>
              )},
            ]}
            data={depenses}
          />
        </div>
      )}
    </div>
  )
}

