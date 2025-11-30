import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { tempsService } from '@/services/temps.service'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { KPICard } from '@/components/modules/KPICard'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { ModuleTabs } from '@/components/modules/ModuleTabs'
import { logger } from '@/utils/logger'
import './GestionTemps.css'

export default function GestionTemps() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [chargeData, setChargeData] = useState(null)
  const [tempsData, setTempsData] = useState(null)
  const [planningData, setPlanningData] = useState(null)
  const [absencesData, setAbsencesData] = useState(null)

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  useEffect(() => {
    if (user?.id) {
      loadData()
    }
  }, [user, activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      // Charger selon l'onglet actif
      if (activeTab === 'overview') {
        await loadOverview()
      } else if (activeTab === 'temps') {
        await loadTemps()
      } else if (activeTab === 'planning') {
        await loadPlanning()
      } else if (activeTab === 'absences') {
        await loadAbsences()
      }
    } catch (error) {
      logger.error('GESTION_TEMPS', 'Erreur chargement données', error)
    } finally {
      setLoading(false)
    }
  }

  const loadOverview = async () => {
    const [chargeResult, tempsResult] = await Promise.all([
      tempsService.getChargeTravail(user.id, {
        periodeMois: currentMonth,
        periodeAnnee: currentYear,
      }),
      tempsService.getTempsByUser(user.id, {
        dateDebut: new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0],
        dateFin: new Date(currentYear, currentMonth, 0).toISOString().split('T')[0],
      }),
    ])

    if (!chargeResult.error) setChargeData(chargeResult.data)
    if (!tempsResult.error) setTempsData(tempsResult.data)
  }

  const loadTemps = async () => {
    const result = await tempsService.getTempsByUser(user.id, {
      dateDebut: new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0],
      dateFin: new Date(currentYear, currentMonth, 0).toISOString().split('T')[0],
    })

    if (!result.error) setTempsData(result.data)
  }

  const loadPlanning = async () => {
    const dateDebut = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0]
    const dateFin = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]

    const result = await tempsService.getPlanning(user.id, {
      dateDebut,
      dateFin,
    })

    if (!result.error) setPlanningData(result.data)
  }

  const loadAbsences = async () => {
    const result = await tempsService.getAbsences(user.id)

    if (!result.error) setAbsencesData(result.data)
  }

  const formatHours = (hours) => {
    return `${parseFloat(hours || 0).toFixed(1)}h`
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount || 0)
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'temps', label: 'Temps travaillé' },
    { id: 'planning', label: 'Planning' },
    { id: 'absences', label: 'Absences' },
  ]

  if (loading && activeTab === 'overview') {
    return <LoadingState message="Chargement des données..." />
  }

  return (
    <div className="gestion-temps">
      <div className="gestion-temps-header">
        <h1>Gestion du Temps</h1>
        <div className="header-actions">
          <Button variant="secondary" onClick={() => navigate('/gestion-temps/planning/new')}>
            <Icon name="Calendar" size={16} />
            Planifier
          </Button>
          <Button variant="secondary" onClick={() => navigate('/gestion-temps/absence/new')}>
            <Icon name="CalendarX" size={16} />
            Demander absence
          </Button>
          <Button variant="primary" onClick={() => navigate('/gestion-temps/temps/new')}>
            <Icon name="Plus" size={16} />
            Saisir du temps
          </Button>
        </div>
      </div>

      <ModuleTabs tabs={tabs} defaultTab="overview" onTabChange={setActiveTab} />

      <div className="gestion-temps-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {chargeData && (
              <div className="overview-kpis">
                <KPICard
                  icon="Clock"
                  title="Heures travaillées"
                  value={formatHours(chargeData.heures_travaillees)}
                  subtitle={`Disponibles: ${formatHours(chargeData.heures_disponibles)}`}
                />
                <KPICard
                  icon="BarChart"
                  title="Charge de travail"
                  value={`${chargeData.charge_pourcentage.toFixed(0)}%`}
                  variant={chargeData.charge_pourcentage > 100 ? 'danger' : chargeData.charge_pourcentage > 80 ? 'warning' : 'success'}
                />
                <KPICard
                  icon="Calendar"
                  title="Jours d'absence"
                  value={chargeData.jours_absences || 0}
                />
                {tempsData && (
                  <KPICard
                    icon="DollarSign"
                    title="Coût total"
                    value={formatCurrency(
                      tempsData.entries?.reduce((sum, entry) => sum + parseFloat(entry.cout_total || 0), 0) || 0
                    )}
                  />
                )}
              </div>
            )}

            {tempsData && tempsData.entries && tempsData.entries.length > 0 && (
              <div className="temps-recent">
                <h2>Temps récent</h2>
                <div className="temps-list">
                  {tempsData.entries.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="temps-item">
                      <div className="temps-date">{new Date(entry.date_travail).toLocaleDateString('fr-FR')}</div>
                      <div className="temps-details">
                        <span className="temps-activite">{entry.activite}</span>
                        <span className="temps-heures">{formatHours(entry.heures)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'temps' && (
          <div className="temps-tab">
            {loading ? (
              <LoadingState />
            ) : tempsData && tempsData.entries && tempsData.entries.length > 0 ? (
              <div className="temps-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Activité</th>
                      <th>Heures</th>
                      <th>Taux horaire</th>
                      <th>Coût</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tempsData.entries.map((entry) => (
                      <tr key={entry.id}>
                        <td>{new Date(entry.date_travail).toLocaleDateString('fr-FR')}</td>
                        <td>{entry.activite}</td>
                        <td>{formatHours(entry.heures)}</td>
                        <td>{formatCurrency(entry.taux_horaire)}</td>
                        <td>{formatCurrency(entry.cout_total)}</td>
                        <td>
                          <span className={`statut-badge statut-${entry.statut.toLowerCase()}`}>
                            {entry.statut}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState icon="Clock" title="Aucun temps saisi" message="Aucune saisie de temps pour ce mois." />
            )}
          </div>
        )}

        {activeTab === 'planning' && (
          <div className="planning-tab">
            {loading ? (
              <LoadingState />
            ) : planningData && planningData.length > 0 ? (
              <div className="planning-list">
                {planningData.map((item) => (
                  <div key={item.id} className="planning-item">
                    <div className="planning-date">
                      {new Date(item.date_prevue).toLocaleDateString('fr-FR', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>
                    <div className="planning-details">
                      <h3>{item.type_intervention}</h3>
                      <p>{item.lieu || 'Lieu non défini'}</p>
                      {item.duree_prevue && <span>{formatHours(item.duree_prevue)}</span>}
                    </div>
                    <span className={`planning-statut statut-${item.statut.toLowerCase()}`}>{item.statut}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon="Calendar" title="Aucun planning" message="Aucune intervention planifiée." />
            )}
          </div>
        )}

        {activeTab === 'absences' && (
          <div className="absences-tab">
            {loading ? (
              <LoadingState />
            ) : absencesData && absencesData.length > 0 ? (
              <div className="absences-list">
                {absencesData.map((absence) => (
                  <div key={absence.id} className="absence-item">
                    <div className="absence-type">{absence.type_absence}</div>
                    <div className="absence-dates">
                      {new Date(absence.date_debut).toLocaleDateString('fr-FR')} -{' '}
                      {new Date(absence.date_fin).toLocaleDateString('fr-FR')}
                      <span className="absence-days">({absence.nombre_jours} jours)</span>
                    </div>
                    <span className={`absence-statut statut-${absence.statut.toLowerCase()}`}>
                      {absence.statut}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon="CalendarX" title="Aucune absence" message="Aucune demande d'absence enregistrée." />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

