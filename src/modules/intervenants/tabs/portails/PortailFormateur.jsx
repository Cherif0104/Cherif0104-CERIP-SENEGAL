import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { formateursService } from '@/services/formateurs.service'
import { MetricCard } from '@/components/modules/MetricCard'
import { DataTable } from '@/components/common/DataTable'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { logger } from '@/utils/logger'
import './PortailFormateur.css'

export default function PortailFormateur() {
  const { user } = useAuth()
  const [formateur, setFormateur] = useState(null)
  const [formations, setFormations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadFormateurData()
    }
  }, [user])

  const loadFormateurData = async () => {
    setLoading(true)
    try {
      // Vérifier que l'utilisateur est formateur
      const { data: formateurData, error: formateurError } = await formateursService.getById(user.id)
      if (formateurError) {
        logger.error('PORTAIL_FORMATEUR', 'Erreur chargement profil', formateurError)
      } else {
        setFormateur(formateurData)
      }

      // Charger les formations du formateur
      const { data: formationsData, error: formationsError } = await formateursService.getFormations(
        user.id
      )
      if (!formationsError && formationsData) {
        setFormations(formationsData)
      }
    } catch (error) {
      logger.error('PORTAIL_FORMATEUR', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  if (!formateur) {
    return (
      <EmptyState
        icon="GraduationCap"
        title="Accès non autorisé"
        message="Vous n'êtes pas enregistré en tant que formateur."
      />
    )
  }

  const stats = {
    formationsActives: formations.filter((f) => f.statut === 'OUVERT' || f.statut === 'EN_COURS')
      .length,
    formationsTerminees: formations.filter((f) => f.statut === 'TERMINE').length,
    totalFormations: formations.length,
    sessionsTotal: formations.reduce(
      (sum, f) => sum + (f.sessions_formations?.length || 0),
      0
    ),
  }

  const formationsColumns = [
    {
      key: 'titre',
      label: 'Formation',
    },
    {
      key: 'type',
      label: 'Type',
      render: (value) => value || '-',
    },
    {
      key: 'date_debut',
      label: 'Date début',
      render: (value) => (value ? new Date(value).toLocaleDateString('fr-FR') : '-'),
    },
    {
      key: 'date_fin',
      label: 'Date fin',
      render: (value) => (value ? new Date(value).toLocaleDateString('fr-FR') : '-'),
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (value) => (
        <span className={`statut-badge statut-${value?.toLowerCase().replace(/\s+/g, '-') || 'brouillon'}`}>
          {value || 'BROUILLON'}
        </span>
      ),
    },
    {
      key: 'sessions',
      label: 'Sessions',
      render: (_, row) => row.sessions_formations?.length || 0,
    },
  ]

  return (
    <div className="portail-formateur">
      <div className="portail-header">
        <h1>Portail Formateur</h1>
        <p className="subtitle">Gérez vos formations et sessions</p>
      </div>

      <div className="stats-grid">
        <MetricCard
          title="Formations actives"
          value={stats.formationsActives}
          detail="En cours ou ouvertes"
        />
        <MetricCard
          title="Formations terminées"
          value={stats.formationsTerminees}
          detail="Sessions complétées"
        />
        <MetricCard
          title="Total formations"
          value={stats.totalFormations}
          detail="Toutes formations confondues"
        />
        <MetricCard
          title="Total sessions"
          value={stats.sessionsTotal}
          detail="Sessions planifiées"
        />
      </div>

      <div className="portail-sections">
        <div className="section-card">
          <h2>Mes Formations ({formations.length})</h2>
          {formations.length === 0 ? (
            <EmptyState
              icon="BookOpen"
              title="Aucune formation"
              message="Vous n'avez pas encore de formations assignées"
            />
          ) : (
            <DataTable columns={formationsColumns} data={formations} />
          )}
        </div>
      </div>
    </div>
  )
}

