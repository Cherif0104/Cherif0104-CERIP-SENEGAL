import { useState, useEffect } from 'react'
import { jalonsService } from '@/services/jalons.service'
import { projetsService } from '@/services/projets.service'
import { Timeline } from '@/components/common/Timeline'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { MetricCard } from '@/components/modules/MetricCard'
import { DonutChart } from '@/components/modules/DonutChart'
import { AlertsSection } from '@/components/modules/AlertsSection'
import { DataTable } from '@/components/common/DataTable'
import { toast } from '@/components/common/Toast'
import { formatDate } from '@/utils/format'
import { logger } from '@/utils/logger'
import { useNavigate } from 'react-router-dom'
import './JalonsProjetDetail.css'

/**
 * Composant de gestion des jalons pour un projet spécifique
 * Affiche les jalons liés au programme, avec timeline, dépendances et récurrence
 * @param {string} projetId - ID du projet
 */
export default function JalonsProjetDetail({ projetId: projetIdProp = null }) {
  const navigate = useNavigate()
  const [jalons, setJalons] = useState([])
  const [projet, setProjet] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (projetIdProp) {
      loadProjet()
      loadJalons()
    }
  }, [projetIdProp])

  const loadProjet = async () => {
    try {
      const { data, error } = await projetsService.getById(projetIdProp)
      if (error) {
        logger.error('JALONS_PROJET_DETAIL', 'Erreur chargement projet', error)
      } else {
        setProjet(data)
      }
    } catch (error) {
      logger.error('JALONS_PROJET_DETAIL', 'Erreur inattendue chargement projet', error)
    }
  }

  const loadJalons = async () => {
    if (!projetIdProp) return
    
    setLoading(true)
    try {
      // Récupérer le projet pour obtenir le programme_id
      const { data: projetData } = await projetsService.getById(projetIdProp)
      if (!projetData || !projetData.programme_id) {
        setJalons([])
        setLoading(false)
        return
      }

      // Charger les jalons du programme (les jalons sont gérés au niveau programme)
      const { data, error } = await jalonsService.getByProgramme(projetData.programme_id)
      
      if (error) {
        logger.error('JALONS_PROJET_DETAIL', 'Erreur chargement jalons', error)
        toast.error('Erreur lors du chargement des jalons')
      } else {
        setJalons(data || [])
        calculateStats(data || [])
      }
    } catch (error) {
      logger.error('JALONS_PROJET_DETAIL', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (jalonsData) => {
    const total = jalonsData.length
    const termines = jalonsData.filter(j => j.statut === 'TERMINE' || j.statut === 'VALIDE').length
    const enCours = jalonsData.filter(j => j.statut === 'EN_COURS' || j.statut === 'EN_ATTENTE').length
    const enRetard = jalonsData.filter(j => {
      if (j.statut === 'TERMINE' || j.statut === 'VALIDE') return false
      if (!j.date_prevue) return false
      return new Date(j.date_prevue) < new Date()
    }).length

    const tauxCompletion = total > 0 ? (termines / total) * 100 : 0

    setStats({
      total,
      termines,
      enCours,
      enRetard,
      tauxCompletion,
    })
  }

  const handleJalonClick = (jalon) => {
    if (jalon.programme_id) {
      navigate(`/programmes/${jalon.programme_id}/jalons/${jalon.id}`)
    }
  }

  if (!projetIdProp) {
    return (
      <EmptyState 
        icon="Calendar" 
        title="Projet non spécifié" 
        message="Impossible de charger les jalons sans ID de projet"
      />
    )
  }

  if (loading) {
    return <LoadingState message="Chargement des jalons..." />
  }

  // Générer les alertes
  const alerts = []
  if (stats) {
    if (stats.enRetard > 0) {
      alerts.push({
        priority: 'HIGH',
        title: 'Jalons en retard',
        description: `${stats.enRetard} jalon(s) en retard nécessitent une attention immédiate.`,
        action: () => {
          // Filtrer pour voir seulement les jalons en retard
          // TODO: Implémenter le filtre
        },
        actionLabel: 'Voir les jalons en retard',
      })
    }
    if (stats.tauxCompletion < 50 && stats.total > 0) {
      alerts.push({
        priority: 'WARNING',
        title: 'Taux de complétion faible',
        description: `Seulement ${stats.tauxCompletion.toFixed(1)}% des jalons sont terminés.`,
      })
    }
  }

  // Répartition par statut
  const repartitionJalons = stats ? [
    { label: 'Terminés', value: stats.termines, color: '#10b981' },
    { label: 'En cours', value: stats.enCours, color: '#3b82f6' },
    { label: 'En retard', value: stats.enRetard, color: '#ef4444' },
  ].filter(item => item.value > 0) : []

  const columns = [
    { 
      key: 'titre', 
      label: 'Titre',
      render: (value, row) => (
        <a 
          href={`/programmes/${row.programme_id}/jalons/${row.id}`}
          onClick={(e) => {
            e.preventDefault()
            handleJalonClick(row)
          }}
          className="jalon-link"
          title="Voir les détails"
        >
          {value}
        </a>
      )
    },
    { 
      key: 'date_prevue', 
      label: 'Date prévue', 
      render: (value) => value ? formatDate(value) : '-' 
    },
    { 
      key: 'date_reelle', 
      label: 'Date réelle', 
      render: (value) => value ? formatDate(value) : '-' 
    },
    { 
      key: 'statut', 
      label: 'Statut',
      render: (value) => (
        <span className={`jalon-statut statut-${value?.toLowerCase()}`}>
          {value || '-'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleJalonClick(row)}
        >
          Voir détails
        </Button>
      )
    },
  ]

  return (
    <div className="jalons-projet-detail">
      <div className="jalons-header">
        <div>
          <h2>Jalons du Projet</h2>
          <p className="jalons-subtitle">
            Les jalons sont gérés au niveau du programme associé
            {projet?.programmes?.nom && ` (${projet.programmes.nom})`}
          </p>
        </div>
        {projet?.programme_id && (
          <Button 
            variant="outline" 
            onClick={() => navigate(`/programmes/${projet.programme_id}?tab=jalons`)}
          >
            <Icon name="ExternalLink" size={16} />
            Gérer les jalons du programme
          </Button>
        )}
      </div>

      {alerts.length > 0 && <AlertsSection alerts={alerts} />}

      {stats && (
        <div className="jalons-metrics">
          <MetricCard
            title="Total jalons"
            value={stats.total}
            detail="Jalons du programme"
            variant="default"
          />
          <MetricCard
            title="Terminés"
            value={stats.termines}
            detail={`${stats.tauxCompletion.toFixed(1)}% de complétion`}
            variant="success"
          />
          <MetricCard
            title="En retard"
            value={stats.enRetard}
            detail={stats.enRetard > 0 ? 'Action requise' : 'Aucun retard'}
            variant={stats.enRetard > 0 ? 'danger' : 'success'}
          />
        </div>
      )}

      {repartitionJalons.length > 0 && (
        <div className="jalons-section">
          <h3>Répartition par statut</h3>
          <div className="jalons-chart-container">
            <DonutChart
              title="Répartition des jalons"
              data={repartitionJalons}
              centerValue={stats?.total || 0}
              centerLabel="Jalons"
              height={280}
            />
          </div>
        </div>
      )}

      {jalons.length === 0 ? (
        <EmptyState 
          icon="Calendar" 
          title="Aucun jalon" 
          message="Ce projet n'a pas encore de jalons. Les jalons sont gérés au niveau du programme associé."
        />
      ) : (
        <>
          <div className="jalons-section">
            <h3>Timeline des Jalons</h3>
            <div className="jalons-timeline-container">
              <Timeline 
                jalons={jalons} 
                onJalonClick={handleJalonClick}
              />
            </div>
          </div>

          <div className="jalons-section">
            <h3>Liste des Jalons</h3>
            <DataTable
              columns={columns}
              data={jalons}
              onRowClick={handleJalonClick}
            />
          </div>
        </>
      )}
    </div>
  )
}

