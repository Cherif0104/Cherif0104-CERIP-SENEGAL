import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { mentorsService } from '@/services/mentors.service'
import { MetricCard } from '@/components/modules/MetricCard'
import { DataTable } from '@/components/common/DataTable'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { logger } from '@/utils/logger'
import './PortailMentor.css'

export default function PortailMentor() {
  const { user } = useAuth()
  const [mentor, setMentor] = useState(null)
  const [accompagnements, setAccompagnements] = useState([])
  const [beneficiaires, setBeneficiaires] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadMentorData()
    }
  }, [user])

  const loadMentorData = async () => {
    setLoading(true)
    try {
      // Charger le profil mentor
      const { data: mentorData, error: mentorError } = await mentorsService.getByUserId(user.id)
      if (mentorError) {
        logger.error('PORTAIL_MENTOR', 'Erreur chargement profil', mentorError)
      } else {
        setMentor(mentorData)
      }

      // Charger les accompagnements
      if (mentorData?.id) {
        const { data: accompData, error: accompError } = await mentorsService.getAccompagnements(
          mentorData.id
        )
        if (!accompError && accompData) {
          setAccompagnements(accompData)
        }

        // Charger les bénéficiaires
        const { data: benefData, error: benefError } = await mentorsService.getBeneficiaires(
          mentorData.id
        )
        if (!benefError && benefData) {
          setBeneficiaires(benefData)
        }
      }
    } catch (error) {
      logger.error('PORTAIL_MENTOR', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  if (!mentor) {
    return (
      <EmptyState
        icon="UserCog"
        title="Profil mentor non trouvé"
        message="Votre profil mentor n'a pas été trouvé. Contactez l'administrateur."
      />
    )
  }

  const stats = {
    beneficiaires: beneficiaires.length,
    accompagnementsPlanifies: accompagnements.filter((a) => !a.date_reelle).length,
    accompagnementsRealises: accompagnements.filter((a) => a.date_reelle).length,
    totalAccompagnements: accompagnements.length,
  }

  const accompagnementsColumns = [
    {
      key: 'beneficiaire_id',
      label: 'Bénéficiaire',
      render: (_, row) => {
        const benef = row.beneficiaires
        return benef
          ? `${benef.prenom || ''} ${benef.nom || ''}`.trim() || benef.raison_sociale || '-'
          : '-'
      },
    },
    {
      key: 'date_prevue',
      label: 'Date prévue',
      render: (value) => (value ? new Date(value).toLocaleDateString('fr-FR') : '-'),
    },
    {
      key: 'date_reelle',
      label: 'Date réalisée',
      render: (value) => (value ? new Date(value).toLocaleDateString('fr-FR') : 'Non réalisé'),
    },
    {
      key: 'modalite',
      label: 'Modalité',
      render: (value) => value || '-',
    },
    {
      key: 'evaluation',
      label: 'Évaluation',
      render: (value) => (value ? `${value}/5` : '-'),
    },
  ]

  return (
    <div className="portail-mentor">
      <div className="portail-header">
        <h1>Portail Mentor</h1>
        <p className="subtitle">Bienvenue dans votre espace de travail</p>
      </div>

      <div className="stats-grid">
        <MetricCard
          title="Bénéficiaires assignés"
          value={stats.beneficiaires}
          detail="Bénéficiaires sous votre responsabilité"
        />
        <MetricCard
          title="Accompagnements planifiés"
          value={stats.accompagnementsPlanifies}
          detail="Sessions à venir"
        />
        <MetricCard
          title="Accompagnements réalisés"
          value={stats.accompagnementsRealises}
          detail="Sessions complétées"
        />
        <MetricCard
          title="Total accompagnements"
          value={stats.totalAccompagnements}
          detail="Toutes sessions confondues"
        />
      </div>

      <div className="portail-sections">
        <div className="section-card">
          <h2>Mes Bénéficiaires ({beneficiaires.length})</h2>
          {beneficiaires.length === 0 ? (
            <EmptyState
              icon="Users"
              title="Aucun bénéficiaire assigné"
              message="Vous n'avez pas encore de bénéficiaires assignés"
            />
          ) : (
            <div className="beneficiaires-list">
              {beneficiaires.map((benef) => (
                <div key={benef.id} className="beneficiaire-card">
                  <div>
                    <strong>
                      {benef.prenom || ''} {benef.nom || ''}
                      {benef.raison_sociale || ''}
                    </strong>
                    <p className="beneficiaire-statut">{benef.statut || '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section-card">
          <h2>Mes Accompagnements ({accompagnements.length})</h2>
          {accompagnements.length === 0 ? (
            <EmptyState
              icon="Calendar"
              title="Aucun accompagnement"
              message="Aucun accompagnement planifié pour le moment"
            />
          ) : (
            <DataTable columns={accompagnementsColumns} data={accompagnements} />
          )}
        </div>
      </div>
    </div>
  )
}

