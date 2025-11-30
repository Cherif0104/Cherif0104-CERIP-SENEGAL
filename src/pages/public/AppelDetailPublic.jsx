import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { appelsService } from '@/services/appels.service'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './AppelDetailPublic.css'

export default function AppelDetailPublic() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [appel, setAppel] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAppel()
  }, [id])

  const loadAppel = async () => {
    setLoading(true)
    try {
      const { data, error } = await appelsService.getById(id)
      if (error) {
        logger.error('APPEL_DETAIL_PUBLIC', 'Erreur chargement appel', error)
        return
      }
      setAppel(data)
    } catch (error) {
      logger.error('APPEL_DETAIL_PUBLIC', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  const isOuvert = () => {
    if (!appel) return false
    if (!appel.date_ouverture || !appel.date_fermeture) return appel.statut === 'OUVERT'
    const today = new Date()
    const ouverture = new Date(appel.date_ouverture)
    const fermeture = new Date(appel.date_fermeture)
    return today >= ouverture && today <= fermeture
  }

  if (loading) return <LoadingState />

  if (!appel) {
    return (
      <div className="appel-detail-public-error">
        <h2>Appel non trouvé</h2>
        <Button onClick={() => navigate('/appels')}>Retour à la liste</Button>
      </div>
    )
  }

  const documentsRequis = Array.isArray(appel.documents_requis) ? appel.documents_requis : []

  return (
    <div className="appel-detail-public">
      <div className="appel-detail-header">
        <Button variant="secondary" onClick={() => navigate('/appels')}>
          <Icon name="ArrowLeft" size={16} />
          Retour
        </Button>
        <span className={`statut-badge-large ${appel.statut?.toLowerCase().replace(/\s+/g, '-')}`}>
          {appel.statut || 'Ouvert'}
        </span>
      </div>

      <div className="appel-detail-content">
        <div className="appel-title-section">
          <h1>{appel.titre}</h1>
          <div className="appel-meta">
            {appel.date_ouverture && (
              <div className="meta-item">
                <Icon name="Calendar" size={20} />
                <div>
                  <span className="meta-label">Date d'ouverture</span>
                  <span className="meta-value">
                    {new Date(appel.date_ouverture).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            )}
            {appel.date_fermeture && (
              <div className="meta-item">
                <Icon name="CalendarCheck" size={20} />
                <div>
                  <span className="meta-label">Date de clôture</span>
                  <span className="meta-value">
                    {new Date(appel.date_fermeture).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {appel.description && (
          <div className="appel-section">
            <h2>Description</h2>
            <div className="appel-description-content">{appel.description}</div>
          </div>
        )}

        {appel.criteres_eligibilite && (
          <div className="appel-section">
            <h2>Critères d'éligibilité</h2>
            <div className="appel-criteres">{appel.criteres_eligibilite}</div>
          </div>
        )}

        {documentsRequis.length > 0 && (
          <div className="appel-section">
            <h2>Documents requis</h2>
            <ul className="documents-list">
              {documentsRequis.map((doc, index) => (
                <li key={index} className="document-item">
                  <Icon name="FileText" size={16} />
                  <span>
                    {doc.type || doc.nom || `Document ${index + 1}`}
                    {doc.obligatoire !== false && <span className="required-badge">*</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="appel-actions">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate(`/candidature/new?appel=${appel.id}`)}
            disabled={!isOuvert()}
          >
            <Icon name="Send" size={20} />
            {isOuvert() ? 'Postuler maintenant' : 'Candidature fermée'}
          </Button>
          {!isOuvert() && (
            <p className="closed-message">
              Les candidatures pour cet appel sont actuellement fermées.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

