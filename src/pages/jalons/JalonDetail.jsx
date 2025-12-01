import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { jalonsService } from '@/services/jalons.service'
import { programmesService } from '@/services/programmes.service'
import { DetailPageWrapper } from '@/components/modules/DetailPageWrapper'
import { KPIDonut } from '@/components/modules/KPIDonut'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { formatDate } from '@/utils/format'
import { logger } from '@/utils/logger'
import { toast } from '@/components/common/Toast'
import './JalonDetail.css'

/**
 * Page de détail d'un jalon
 */
export default function JalonDetail() {
  const { programme_id, id } = useParams()
  const navigate = useNavigate()
  const [jalon, setJalon] = useState(null)
  const [programme, setProgramme] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [id, programme_id])

  const loadData = async () => {
    setLoading(true)
    try {
      // Charger le jalon
      const { data: jalonData, error: jalonError } = await jalonsService.getById(id)
      
      if (jalonError) {
        logger.error('JALON_DETAIL', 'Erreur chargement jalon', jalonError)
        toast.error('Erreur lors du chargement du jalon')
        return
      }

      if (!jalonData) {
        toast.error('Jalon non trouvé')
        navigate(`/programmes/${programme_id}?tab=jalons`)
        return
      }

      setJalon(jalonData)

      // Charger le programme
      if (jalonData.programme_id) {
        const { data: programmeData, error: programmeError } = await programmesService.getById(jalonData.programme_id)
        if (programmeError) {
          logger.warn('JALON_DETAIL', 'Erreur chargement programme', programmeError)
        } else {
          setProgramme(programmeData)
        }
      }
    } catch (error) {
      logger.error('JALON_DETAIL', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    const backPath = programme_id 
      ? `/programmes/${programme_id}?tab=jalons`
      : '/programmes'
    navigate(backPath)
  }

  if (loading) {
    return <LoadingState message="Chargement du jalon..." />
  }

  if (!jalon) {
    return (
      <EmptyState 
        icon="Calendar" 
        title="Jalon non trouvé" 
        message="Le jalon demandé n'existe pas ou a été supprimé"
      />
    )
  }

  // Calculer si le jalon est en retard
  const datePrevue = new Date(jalon.date_prevue)
  const aujourdhui = new Date()
  const estTermine = jalon.statut === 'TERMINE' || jalon.statut === 'VALIDE'
  const estEnRetard = !estTermine && datePrevue < aujourdhui
  const joursRetard = estEnRetard 
    ? Math.floor((aujourdhui - datePrevue) / (1000 * 60 * 60 * 24))
    : 0

  // Préparer les sections
  const sections = [
    {
      title: 'Informations générales',
      content: (
        <div className="detail-info-grid">
          <div className="detail-info-item">
            <span className="detail-info-label">Libellé</span>
            <span className="detail-info-value">{jalon.libelle}</span>
          </div>
          <div className="detail-info-item">
            <span className="detail-info-label">Statut</span>
            <span className={`detail-info-value statut-${jalon.statut?.toLowerCase() || 'en-attente'}`}>
              {jalon.statut || 'En attente'}
            </span>
          </div>
          <div className="detail-info-item">
            <span className="detail-info-label">Ordre</span>
            <span className="detail-info-value">{jalon.ordre || '-'}</span>
          </div>
          {jalon.description && (
            <div className="detail-info-item full-width">
              <span className="detail-info-label">Description</span>
              <span className="detail-info-value">{jalon.description}</span>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Dates',
      content: (
        <div className="detail-info-grid">
          <div className="detail-info-item">
            <span className="detail-info-label">Date prévue</span>
            <span className="detail-info-value">{formatDate(jalon.date_prevue)}</span>
          </div>
          {jalon.date_reelle && (
            <div className="detail-info-item">
              <span className="detail-info-label">Date de réalisation</span>
              <span className="detail-info-value success">{formatDate(jalon.date_reelle)}</span>
            </div>
          )}
          {estEnRetard && (
            <div className="detail-info-item warning">
              <span className="detail-info-label">⚠️ Retard</span>
              <span className="detail-info-value">{joursRetard} jour(s)</span>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Livrables',
      content: (
        <div className="detail-info-grid">
          {jalon.livrables ? (
            <div className="detail-info-item full-width">
              <span className="detail-info-label">Livrables attendus</span>
              <span className="detail-info-value">{jalon.livrables}</span>
            </div>
          ) : (
            <p className="detail-empty-text">Aucun livrable défini</p>
          )}
        </div>
      )
    },
    {
      title: 'Relations',
      content: (
        <div className="detail-info-grid">
          <div className="detail-info-item">
            <span className="detail-info-label">Programme</span>
            <span className="detail-info-value">
              {programme ? (
                <a 
                  href={`/programmes/${programme.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    navigate(`/programmes/${programme.id}`)
                  }}
                  className="detail-link"
                >
                  {programme.nom}
                </a>
              ) : jalon.programme_id || '-'}
            </span>
          </div>
        </div>
      )
    }
  ]

  // Graphiques
  const charts = []
  
  // Si le jalon est prévu pour une date future, calculer le pourcentage d'avancement
  if (jalon.date_prevue && jalon.date_debut) {
    const dateDebut = new Date(jalon.date_debut)
    const datePrevue = new Date(jalon.date_prevue)
    const aujourdhui = new Date()
    const dureeTotale = datePrevue - dateDebut
    const dureeEcoulee = aujourdhui - dateDebut
    
    if (dureeTotale > 0) {
      const pourcentageAvancement = Math.min(100, Math.max(0, (dureeEcoulee / dureeTotale) * 100))
      
      charts.push(
        <KPIDonut
          key="avancement"
          title="Avancement du jalon"
          value={pourcentageAvancement}
          total={100}
          label="Avancement"
          variant={estEnRetard ? 'danger' : pourcentageAvancement > 75 ? 'warning' : 'success'}
          formatValue="percentage"
          subtitle={estEnRetard 
            ? `${joursRetard} jour(s) de retard`
            : estTermine 
              ? 'Jalon terminé'
              : `${(100 - pourcentageAvancement).toFixed(1)}% restant`}
        />
      )
    }
  }

  return (
    <DetailPageWrapper
      title={jalon.libelle}
      subtitle={`Jalon ${jalon.ordre ? `#${jalon.ordre}` : ''} - ${jalon.statut || 'En attente'}`}
      sections={sections}
      charts={charts}
      onBack={handleBack}
      actions={[
        {
          variant: 'primary',
          onClick: () => navigate(`/programmes/${programme_id || jalon.programme_id}/jalons/${id}/edit`),
          children: (
            <>
              <Icon name="Edit" size={16} />
              Modifier
            </>
          )
        }
      ]}
    />
  )
}
