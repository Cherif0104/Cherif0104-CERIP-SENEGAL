import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { appelsService } from '@/services/appels.service'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './AppelsPublic.css'

export default function AppelsPublic() {
  const navigate = useNavigate()
  const [appels, setAppels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAppelsOuverts()
  }, [])

  const loadAppelsOuverts = async () => {
    setLoading(true)
    try {
      const { data, error } = await appelsService.getOuverts()
      if (error) {
        logger.error('APPELS_PUBLIC', 'Erreur chargement appels', error)
        return
      }
      setAppels(data || [])
      logger.debug('APPELS_PUBLIC', `${data?.length || 0} appels ouverts chargés`)
    } catch (error) {
      logger.error('APPELS_PUBLIC', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  const isOuvert = (appel) => {
    if (!appel.date_ouverture || !appel.date_fermeture) return false
    const today = new Date()
    const ouverture = new Date(appel.date_ouverture)
    const fermeture = new Date(appel.date_fermeture)
    return today >= ouverture && today <= fermeture
  }

  if (loading) return <LoadingState />

  return (
    <div className="appels-public">
      <div className="appels-public-header">
        <h1>Appels à Candidatures</h1>
        <p className="subtitle">Découvrez les opportunités de recrutement et postulez en ligne</p>
      </div>

      {appels.length === 0 ? (
        <EmptyState
          icon="Bell"
          title="Aucun appel ouvert"
          message="Il n'y a actuellement aucun appel à candidatures ouvert. Revenez plus tard pour découvrir de nouvelles opportunités."
        />
      ) : (
        <div className="appels-grid">
          {appels
            .filter((appel) => isOuvert(appel) || appel.statut === 'OUVERT')
            .map((appel) => (
              <div key={appel.id} className="appel-card">
                <div className="appel-card-header">
                  <h3>{appel.titre}</h3>
                  <span className={`statut-badge ${appel.statut?.toLowerCase().replace(/\s+/g, '-')}`}>
                    {appel.statut || 'Ouvert'}
                  </span>
                </div>
                <div className="appel-card-body">
                  {appel.description && (
                    <p className="appel-description">
                      {appel.description.length > 200
                        ? `${appel.description.substring(0, 200)}...`
                        : appel.description}
                    </p>
                  )}
                  <div className="appel-dates">
                    {appel.date_ouverture && (
                      <div className="date-info">
                        <Icon name="Calendar" size={16} />
                        <span>Ouverture : {new Date(appel.date_ouverture).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                    {appel.date_fermeture && (
                      <div className="date-info">
                        <Icon name="CalendarCheck" size={16} />
                        <span>Clôture : {new Date(appel.date_fermeture).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="appel-card-footer">
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/appel/${appel.id}`)}
                  >
                    En savoir plus
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/candidature/new?appel=${appel.id}`)}
                    disabled={!isOuvert(appel) && appel.statut !== 'OUVERT'}
                  >
                    <Icon name="Send" size={16} />
                    Postuler
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

