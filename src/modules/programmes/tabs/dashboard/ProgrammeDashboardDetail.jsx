import { useEffect, useState } from 'react'
import { programmeMetricsService } from '@/services/programme-metrics.service'
import { KPICard } from '@/components/modules/KPICard'
import { MetricCard } from '@/components/modules/MetricCard'
import { DonutChart } from '@/components/modules/DonutChart'
import { AlertsSection } from '@/components/modules/AlertsSection'
import { LoadingState } from '@/components/common/LoadingState'
import { DataTable } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { programmeDepensesService } from '@/services/programme-depenses.service'
import { logger } from '@/utils/logger'
import { formatCurrency, formatDate } from '@/utils/format'
import { useNavigate } from 'react-router-dom'
import './ProgrammeDashboardDetail.css'

/**
 * Dashboard complet d'un programme - Synchronisé avec toutes les données saisies
 * Affiche toutes les métriques : finances, projets, candidats, bénéficiaires, etc.
 */
export default function ProgrammeDashboardDetail({ programmeId }) {
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState(null)
  const [depenses, setDepenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (programmeId) {
      loadMetrics()
    }
  }, [programmeId])

  const loadMetrics = async () => {
    setLoading(true)
    try {
      logger.debug('PROGRAMME_DASHBOARD_DETAIL', 'Chargement métriques complètes', { programmeId })
      
      // Charger métriques et dépenses en parallèle
      const [metricsResult, depensesResult] = await Promise.all([
        programmeMetricsService.getProgrammeMetrics(programmeId),
        programmeDepensesService.getByProgramme(programmeId, {
          pagination: { page: 1, pageSize: 10 } // Limiter à 10 dernières dépenses
        })
      ])
      
      if (metricsResult.error) {
        logger.error('PROGRAMME_DASHBOARD_DETAIL', 'Erreur chargement métriques', metricsResult.error)
      } else {
        setMetrics(metricsResult.data)
      }

      if (depensesResult.error) {
        logger.error('PROGRAMME_DASHBOARD_DETAIL', 'Erreur chargement dépenses', depensesResult.error)
      } else {
        setDepenses(depensesResult.data || [])
      }

      logger.debug('PROGRAMME_DASHBOARD_DETAIL', 'Métriques chargées avec succès', { programmeId })
    } catch (error) {
      logger.error('PROGRAMME_DASHBOARD_DETAIL', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingState message="Chargement des données complètes..." />
  }

  if (!metrics) {
    return (
      <div className="programme-dashboard-error">
        <p>Impossible de charger les métriques du programme</p>
      </div>
    )
  }

  const { programme, finances, projets, candidats, beneficiaires, accompagnements, performance } = metrics

  // Générer les alertes
  const alerts = []
  
  // Vérifier si des dépenses existent mais ne sont pas comptées dans le budget
  if (finances.nombre_depenses > 0 && finances.budget_consomme === 0 && finances.depenses_total > 0) {
    const depensesNonComptees = finances.depenses_total - finances.budget_consomme
    alerts.push({
      priority: 'WARNING',
      title: 'Dépenses non comptabilisées',
      description: `${finances.nombre_depenses} dépense(s) existent mais ne sont pas encore comptées dans le budget consommé (statuts non retenus pour le reporting). Cliquez pour vérifier.`,
      action: () => navigate(`/programmes/${programmeId}?tab=depenses`),
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
      priority: 'HIGH',
      title: 'Budget élevé',
      description: `Budget consommé à ${finances.taux_consommation.toFixed(1)}%`,
    })
  }

  if (projets.en_retard > 0) {
    alerts.push({
      priority: 'HIGH',
      title: 'Projets en retard',
      description: `${projets.en_retard} projet(s) en retard`,
    })
  }

  return (
    <div className="programme-dashboard-detail">
      {/* En-tête avec informations programme */}
      <div className="dashboard-header">
        <h2>Vue d'ensemble - {programme.nom}</h2>
        <div className="dashboard-meta">
          <span className={`statut-badge statut-${programme.statut?.toLowerCase()}`}>
            {programme.statut}
          </span>
          {programme.date_debut && programme.date_fin && (
            <span className="dashboard-dates">
              {new Date(programme.date_debut).toLocaleDateString('fr-FR')} - {new Date(programme.date_fin).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>
      </div>

      {/* Alertes */}
      {alerts.length > 0 && <AlertsSection alerts={alerts} />}

      {/* KPIs Principaux */}
      <div className="kpi-grid-modern">
        <KPICard
          icon="DollarSign"
          value={formatCurrency(finances.budget_total)}
          label="Budget total"
          variant="primary"
        />
        <KPICard
          icon="TrendingUp"
          value={`${finances.taux_consommation.toFixed(1)}%`}
          label="Taux de consommation"
          variant={finances.taux_consommation > 90 ? 'danger' : finances.taux_consommation > 75 ? 'warning' : 'success'}
        />
        <KPICard
          icon="Briefcase"
          value={projets.total}
          label="Projets"
          variant="secondary"
        />
        <KPICard
          icon="Users"
          value={beneficiaires.total}
          label="Bénéficiaires"
          variant="accent"
        />
        <KPICard
          icon="UserCheck"
          value={candidats.total}
          label="Candidats"
          variant="default"
        />
        <KPICard
          icon="Target"
          value={`${performance.taux_objectifs.toFixed(1)}%`}
          label="Taux d'objectifs"
          variant="success"
        />
      </div>

      {/* Section Financière */}
      <div className="dashboard-section">
        <h3>Finances</h3>
        <div className="metrics-grid-modern">
          <MetricCard
            title="Budget consommé"
            value={formatCurrency(finances.budget_consomme)}
            detail={`Sur ${formatCurrency(finances.budget_total)}`}
            progress={finances.taux_consommation}
          />
          <MetricCard
            title="Budget restant"
            value={formatCurrency(finances.budget_restant)}
            detail={finances.budget_restant < 0 ? 'Dépassement' : 'Disponible'}
            variant={finances.budget_restant < 0 ? 'danger' : 'success'}
          />
          <MetricCard
            title="Dépenses validées"
            value={formatCurrency(finances.depenses_validees)}
            detail={`${finances.nombre_depenses} dépense(s)`}
          />
        </div>

        {/* Liste des dépenses récentes */}
        <div className="dashboard-depenses-section">
          <h4>Dépenses récentes</h4>
          {depenses.length === 0 ? (
            <EmptyState 
              icon="Receipt" 
              title="Aucune dépense" 
              message="Aucune dépense enregistrée pour ce programme"
            />
          ) : (
            <DataTable
              columns={[
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
                        navigate(`/programmes/${row.programme_id}/depenses/${row.id}`)
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
              ]}
              data={depenses}
              onRowClick={(row) => navigate(`/programmes/${row.programme_id}/depenses/${row.id}`)}
            />
          )}
          {depenses.length > 0 && (
            <div className="dashboard-depenses-footer">
              <button 
                className="view-all-button"
                onClick={() => navigate(`/programmes/${programmeId}?tab=depenses`)}
              >
                Voir toutes les dépenses →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Section Projets */}
      <div className="dashboard-section">
        <h3>Projets</h3>
        <div className="metrics-grid-modern">
          <MetricCard
            title="Projets en cours"
            value={projets.en_cours}
            detail={`Sur ${projets.total} projet(s)`}
            variant="primary"
          />
          <MetricCard
            title="Projets terminés"
            value={projets.termines}
            detail={`${projets.taux_completion.toFixed(1)}% de completion`}
            variant="success"
          />
          <MetricCard
            title="Projets en retard"
            value={projets.en_retard}
            detail={projets.en_retard > 0 ? 'Action requise' : 'Aucun retard'}
            variant={projets.en_retard > 0 ? 'danger' : 'success'}
          />
        </div>

        {/* Graphique répartition projets */}
        {projets.repartitionParStatut && projets.repartitionParStatut.length > 0 && (
          <div className="dashboard-charts-row">
            <div className="donut-chart-card">
              <DonutChart
                title="Répartition des projets par statut"
                data={projets.repartitionParStatut.map(item => ({
                  name: item.statut,
                  label: item.statut,
                  value: item.count,
                  color: item.statut === 'TERMINE' ? '#10b981' : 
                         item.statut === 'EN_COURS' ? '#3b82f6' : 
                         item.statut === 'PLANIFIE' ? '#f59e0b' : '#6b7280'
                }))}
                centerValue={projets.total}
                centerLabel="Projets"
                height={280}
              />
            </div>
          </div>
        )}
      </div>

      {/* Section Candidats & Bénéficiaires */}
      <div className="dashboard-section">
        <h3>Candidats & Bénéficiaires</h3>
        <div className="metrics-grid-modern">
          <MetricCard
            title="Candidats totaux"
            value={candidats.total}
            detail={`${candidats.eligibles} éligible(s)`}
            variant="default"
          />
          <MetricCard
            title="Taux d'éligibilité"
            value={`${candidats.taux_eligibilite.toFixed(1)}%`}
            detail={`${candidats.eligibles} sur ${candidats.total}`}
            variant="info"
          />
          <MetricCard
            title="Bénéficiaires actifs"
            value={beneficiaires.actifs}
            detail={`${beneficiaires.total} au total`}
            variant="primary"
          />
          <MetricCard
            title="Taux de conversion"
            value={`${beneficiaires.taux_conversion.toFixed(1)}%`}
            detail={`${beneficiaires.total} bénéficiaire(s) sur ${candidats.total} candidat(s)`}
            variant="success"
          />
          <MetricCard
            title="Taux d'insertion"
            value={`${beneficiaires.taux_insertion.toFixed(1)}%`}
            detail={`${beneficiaires.inserts} inséré(s)`}
            variant="accent"
          />
          <MetricCard
            title="Bénéficiaires accompagnés"
            value={beneficiaires.accompagnes}
            detail={`${accompagnements.total} accompagnement(s)`}
            variant="secondary"
          />
        </div>
      </div>

      {/* Section Accompagnements */}
      {accompagnements.total > 0 && (
        <div className="dashboard-section">
          <h3>Accompagnements</h3>
          <div className="metrics-grid-modern">
            <MetricCard
              title="Accompagnements en cours"
              value={accompagnements.en_cours}
              detail={`${accompagnements.total} au total`}
              variant="primary"
            />
            <MetricCard
              title="Accompagnements terminés"
              value={accompagnements.termines}
              detail={accompagnements.total > 0 ? `${((accompagnements.termines / accompagnements.total) * 100).toFixed(1)}%` : '0%'}
              variant="success"
            />
            <MetricCard
              title="Heures totales"
              value={accompagnements.heures_total}
              detail={`${accompagnements.heures_moyennes.toFixed(1)}h en moyenne`}
              variant="info"
            />
          </div>
        </div>
      )}

      {/* Section Performance */}
      <div className="dashboard-section">
        <h3>Performance</h3>
        <div className="metrics-grid-modern">
          <MetricCard
            title="Score global"
            value={performance.score_global}
            detail={`${performance.taux_objectifs.toFixed(1)}% d'objectifs atteints`}
            variant="primary"
          />
          <MetricCard
            title="Indicateurs réussis"
            value={performance.indicateurs_reussis}
            detail={`${performance.indicateurs_total} indicateur(s) au total`}
            variant="success"
          />
        </div>
      </div>
    </div>
  )
}

