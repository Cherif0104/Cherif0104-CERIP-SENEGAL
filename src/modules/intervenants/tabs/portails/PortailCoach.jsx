import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { coachesService } from '@/services/coaches.service'
import { MetricCard } from '@/components/modules/MetricCard'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { logger } from '@/utils/logger'
import './PortailCoach.css'

export default function PortailCoach() {
  const { user } = useAuth()
  const [coach, setCoach] = useState(null)
  const [beneficiaires, setBeneficiaires] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadCoachData()
    }
  }, [user])

  const loadCoachData = async () => {
    setLoading(true)
    try {
      // Vérifier que l'utilisateur est coach
      const { data: coachData, error: coachError } = await coachesService.getById(user.id)
      if (coachError) {
        logger.error('PORTAIL_COACH', 'Erreur chargement profil', coachError)
      } else {
        setCoach(coachData)
      }

      // Charger les bénéficiaires assignés au coach
      const { data: benefData, error: benefError } = await coachesService.getBeneficiaires(user.id)
      if (!benefError && benefData) {
        setBeneficiaires(benefData)
      }
    } catch (error) {
      logger.error('PORTAIL_COACH', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  if (!coach) {
    return (
      <EmptyState
        icon="UserCheck"
        title="Accès non autorisé"
        message="Vous n'êtes pas enregistré en tant que coach."
      />
    )
  }

  const stats = {
    beneficiairesActifs: beneficiaires.filter((b) => b.statut === 'INCUBATION').length,
    beneficiairesTotal: beneficiaires.length,
    beneficiairesInsere: beneficiaires.filter((b) => b.statut === 'INSERE').length,
    beneficiairesPreIncubation: beneficiaires.filter((b) => b.statut === 'PRE_INCUBATION').length,
  }

  return (
    <div className="portail-coach">
      <div className="portail-header">
        <h1>Portail Coach</h1>
        <p className="subtitle">Accompagnez vos bénéficiaires vers la réussite</p>
      </div>

      <div className="stats-grid">
        <MetricCard
          title="Bénéficiaires actifs"
          value={stats.beneficiairesActifs}
          detail="En phase d'incubation"
        />
        <MetricCard
          title="Bénéficiaires insérés"
          value={stats.beneficiairesInsere}
          detail="Insertion réussie"
        />
        <MetricCard
          title="En pré-incubation"
          value={stats.beneficiairesPreIncubation}
          detail="Phase initiale"
        />
        <MetricCard
          title="Total bénéficiaires"
          value={stats.beneficiairesTotal}
          detail="Sous votre responsabilité"
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
                  <div className="beneficiaire-header">
                    <strong>
                      {benef.prenom || ''} {benef.nom || ''}
                      {benef.raison_sociale || ''}
                    </strong>
                    <span className={`statut-badge statut-${benef.statut?.toLowerCase().replace(/\s+/g, '-') || 'inconnu'}`}>
                      {benef.statut || '-'}
                    </span>
                  </div>
                  {benef.diagnostic && (
                    <div className="beneficiaire-info">
                      <p className="info-label">Diagnostic disponible</p>
                    </div>
                  )}
                  {benef.plan_action && (
                    <div className="beneficiaire-info">
                      <p className="info-label">Plan d'action disponible</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

