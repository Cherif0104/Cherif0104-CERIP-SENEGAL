import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { financementsService } from '@/services/financements.service'
import { programmesService } from '@/services/programmes.service'
import { financeursService } from '@/services/financeurs.service'
import { DetailPageWrapper } from '@/components/modules/DetailPageWrapper'
import { KPIDonut } from '@/components/modules/KPIDonut'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { formatDate, formatCurrency } from '@/utils/format'
import { logger } from '@/utils/logger'
import { toast } from '@/components/common/Toast'
import './FinancementDetail.css'

/**
 * Page de détail d'un financement
 */
export default function FinancementDetail() {
  const { programme_id, id } = useParams()
  const navigate = useNavigate()
  const [financement, setFinancement] = useState(null)
  const [programme, setProgramme] = useState(null)
  const [financeur, setFinanceur] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [id, programme_id])

  const loadData = async () => {
    setLoading(true)
    try {
      // Charger le financement
      const { data: financementData, error: financementError } = await financementsService.getById(id)
      
      if (financementError) {
        logger.error('FINANCEMENT_DETAIL', 'Erreur chargement financement', financementError)
        toast.error('Erreur lors du chargement du financement')
        return
      }

      if (!financementData) {
        toast.error('Financement non trouvé')
        navigate(`/programmes/${programme_id}?tab=finances`)
        return
      }

      setFinancement(financementData)

      // Charger le programme
      if (financementData.programme_id) {
        const { data: programmeData, error: programmeError } = await programmesService.getById(financementData.programme_id)
        if (programmeError) {
          logger.warn('FINANCEMENT_DETAIL', 'Erreur chargement programme', programmeError)
        } else {
          setProgramme(programmeData)
        }
      }

      // Charger le financeur
      if (financementData.bailleur_id) {
        const { data: financeurData, error: financeurError } = await financeursService.getById(financementData.bailleur_id)
        if (financeurError) {
          logger.warn('FINANCEMENT_DETAIL', 'Erreur chargement financeur', financeurError)
        } else {
          setFinanceur(financeurData)
        }
      }
    } catch (error) {
      logger.error('FINANCEMENT_DETAIL', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    const backPath = programme_id 
      ? `/programmes/${programme_id}?tab=finances`
      : '/programmes'
    navigate(backPath)
  }

  if (loading) {
    return <LoadingState message="Chargement du financement..." />
  }

  if (!financement) {
    return (
      <EmptyState 
        icon="DollarSign" 
        title="Financement non trouvé" 
        message="Le financement demandé n'existe pas ou a été supprimé"
      />
    )
  }

  // Calculer le pourcentage d'utilisation du budget
  const montantAccorde = parseFloat(financement.montant_accorde || 0)
  const programmeBudget = parseFloat(programme?.budget || 0)
  const budgetUtilise = programmeBudget > 0 ? (montantAccorde / programmeBudget) * 100 : 0

  // Préparer les sections
  const sections = [
    {
      title: 'Informations générales',
      content: (
        <div className="detail-info-grid">
          <div className="detail-info-item">
            <span className="detail-info-label">Montant accordé</span>
            <span className="detail-info-value amount">{formatCurrency(montantAccorde)}</span>
          </div>
          <div className="detail-info-item">
            <span className="detail-info-label">Devise</span>
            <span className="detail-info-value">{financement.devise || 'XOF'}</span>
          </div>
          <div className="detail-info-item">
            <span className="detail-info-label">Date de signature</span>
            <span className="detail-info-value">{formatDate(financement.date_signature)}</span>
          </div>
          <div className="detail-info-item">
            <span className="detail-info-label">Période</span>
            <span className="detail-info-value">
              {formatDate(financement.date_debut)} - {formatDate(financement.date_fin)}
            </span>
          </div>
        </div>
      )
    },
    {
      title: 'Relations',
      content: (
        <div className="detail-info-grid">
          <div className="detail-info-item">
            <span className="detail-info-label">Financeur</span>
            <span className="detail-info-value">
              {financeur ? (
                <a 
                  href={`/financeurs/${financeur.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    navigate(`/financeurs/${financeur.id}`)
                  }}
                  className="detail-link"
                >
                  {financeur.nom}
                </a>
              ) : financement.bailleur_id || '-'}
            </span>
          </div>
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
              ) : financement.programme_id || '-'}
            </span>
          </div>
        </div>
      )
    }
  ]

  // Graphiques
  const charts = []
  
  if (programme && programmeBudget > 0) {
    charts.push(
      <KPIDonut
        key="budget"
        title="Utilisation du budget programme"
        value={montantAccorde}
        total={programmeBudget}
        label="Utilisé"
        variant="danger"
        formatValue="currency"
        subtitle={`${budgetUtilise.toFixed(1)}% du budget total`}
      />
    )
  }

  return (
    <DetailPageWrapper
      title={`Financement ${financeur?.nom || financement.bailleur_id || ''}`}
      subtitle={`Montant: ${formatCurrency(montantAccorde)} ${financement.devise || 'XOF'}`}
      sections={sections}
      charts={charts}
      onBack={handleBack}
      actions={[
        {
          variant: 'primary',
          onClick: () => navigate(`/programmes/${programme_id || financement.programme_id}/financements/${id}/edit`),
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
