import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { formationsService } from '@/services/formations.service'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './FormationDetail.css'

export default function FormationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formation, setFormation] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFormation()
  }, [id])

  const loadFormation = async () => {
    setLoading(true)
    try {
      const { data, error } = await formationsService.getById(id)
      if (error) {
        logger.error('FORMATION_DETAIL', 'Erreur chargement', error)
        navigate('/beneficiaires?tab=formations')
        return
      }
      setFormation(data)
    } catch (error) {
      logger.error('FORMATION_DETAIL', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  if (!formation) {
    return (
      <div className="formation-detail-page">
        <p>Formation non trouvée</p>
      </div>
    )
  }

  return (
    <div className="formation-detail-page">
      <div className="detail-header">
        <div>
          <Button variant="secondary" onClick={() => navigate('/beneficiaires?tab=formations')}>
            <Icon name="ArrowLeft" size={16} />
            Retour
          </Button>
        </div>
        <div className="header-actions">
          <Button variant="primary" onClick={() => navigate(`/formations/${id}/edit`)}>
            <Icon name="Edit" size={16} />
            Modifier
          </Button>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-card">
          <h1>{formation.titre}</h1>
          <div
            className={`status-badge status-${formation.statut?.toLowerCase().replace(/\s+/g, '-') || 'brouillon'}`}
          >
            {formation.statut || 'BROUILLON'}
          </div>
        </div>

        {formation.description && (
          <div className="detail-card">
            <h2>Description</h2>
            <p>{formation.description}</p>
          </div>
        )}

        <div className="detail-grid">
          <div className="detail-card">
            <h2>Informations générales</h2>
            <dl>
              <dt>Type</dt>
              <dd>{formation.type || '-'}</dd>

              <dt>Catégorie</dt>
              <dd>{formation.categorie || '-'}</dd>

              <dt>Lieu</dt>
              <dd>{formation.lieu || '-'}</dd>

              <dt>Durée</dt>
              <dd>{formation.duree ? `${formation.duree} heures` : '-'}</dd>

              <dt>Participants maximum</dt>
              <dd>{formation.participants_max || '-'}</dd>

              <dt>Coût</dt>
              <dd>
                {formation.cout
                  ? new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'XOF',
                      minimumFractionDigits: 0,
                    }).format(formation.cout)
                  : '-'}
              </dd>
            </dl>
          </div>

          <div className="detail-card">
            <h2>Planning</h2>
            <dl>
              <dt>Date de début</dt>
              <dd>
                {formation.date_debut
                  ? new Date(formation.date_debut).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '-'}
              </dd>

              <dt>Date de fin</dt>
              <dd>
                {formation.date_fin
                  ? new Date(formation.date_fin).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '-'}
              </dd>
            </dl>
          </div>
        </div>

        {formation.sessions_formations && formation.sessions_formations.length > 0 && (
          <div className="detail-card">
            <h2>Sessions ({formation.sessions_formations.length})</h2>
            <div className="sessions-list">
              {formation.sessions_formations.map((session) => {
                const participations = session.participations_formation || []
                return (
                  <div key={session.id} className="session-item">
                    <div className="session-info">
                      <strong>
                        {session.date_debut
                          ? new Date(session.date_debut).toLocaleDateString('fr-FR')
                          : '-'}
                      </strong>
                      <span>
                        {participations.length} participant{participations.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

