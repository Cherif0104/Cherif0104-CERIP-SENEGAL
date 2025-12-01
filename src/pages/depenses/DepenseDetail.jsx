import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { programmeDepensesService } from '@/services/programme-depenses.service'
import { programmesService } from '@/services/programmes.service'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { KPIDonut } from '@/components/modules/KPIDonut'
import { formatDate, formatCurrency } from '@/utils/format'
import { logger } from '@/utils/logger'
import { toast } from '@/components/common/Toast'
import './DepenseDetail.css'

/**
 * Page de détail d'une dépense
 */
export default function DepenseDetail() {
  const { programme_id, id } = useParams()
  const navigate = useNavigate()
  const [depense, setDepense] = useState(null)
  const [programme, setProgramme] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [id, programme_id])

  const loadData = async () => {
    setLoading(true)
    try {
      // Charger la dépense
      const { data: depenseData, error: depenseError } = await programmeDepensesService.getById(id)
      
      if (depenseError) {
        logger.error('DEPENSE_DETAIL', 'Erreur chargement dépense', depenseError)
        toast.error('Erreur lors du chargement de la dépense')
        return
      }

      if (!depenseData) {
        toast.error('Dépense non trouvée')
        navigate(`/programmes/${programme_id}?tab=finances`)
        return
      }

      setDepense(depenseData)

      // Charger le programme
      if (depenseData.programme_id) {
        const { data: programmeData, error: programmeError } = await programmesService.getById(depenseData.programme_id)
        if (programmeError) {
          logger.warn('DEPENSE_DETAIL', 'Erreur chargement programme', programmeError)
        } else {
          setProgramme(programmeData)
        }
      }
    } catch (error) {
      logger.error('DEPENSE_DETAIL', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    navigate(`/programmes/${programme_id}/depenses/${id}/edit`)
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) return

    try {
      const { error } = await programmeDepensesService.delete(id)
      if (error) {
        toast.error('Erreur lors de la suppression')
        return
      }
      toast.success('Dépense supprimée avec succès')
      navigate(`/programmes/${programme_id}?tab=depenses`)
    } catch (error) {
      logger.error('DEPENSE_DETAIL', 'Erreur suppression', error)
      toast.error('Une erreur est survenue')
    }
  }

  const handleBack = () => {
    navigate(`/programmes/${programme_id}?tab=depenses`)
  }

  if (loading) {
    return <LoadingState message="Chargement de la dépense..." />
  }

  if (!depense) {
    return (
      <EmptyState 
        icon="Receipt" 
        title="Dépense non trouvée" 
        message="La dépense demandée n'existe pas ou a été supprimée"
      />
    )
  }

  const statutColors = {
    BROUILLON: '#6b7280',
    VALIDE: '#3b82f6',
    PAYE: '#10b981',
    ANNULE: '#ef4444',
  }

  // Calculer le pourcentage par rapport au budget du programme
  const montant = parseFloat(depense.montant || 0)
  const budgetProgramme = parseFloat(programme?.budget || 0)
  const pourcentageBudget = budgetProgramme > 0 ? (montant / budgetProgramme) * 100 : 0

  return (
    <div className="depense-detail">
      {/* Header */}
      <div className="depense-detail-header">
        <Button variant="outline" onClick={handleBack}>
          <Icon name="ArrowLeft" size={16} />
          Retour
        </Button>
        <div className="depense-detail-actions">
          <Button variant="primary" onClick={handleEdit}>
            <Icon name="Edit" size={16} />
            Modifier
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <Icon name="Trash2" size={16} />
            Supprimer
          </Button>
        </div>
      </div>

      {/* KPIs Section */}
      <div className="depense-detail-kpis">
        <KPIDonut
          title="Montant de la dépense"
          value={montant}
          total={montant}
          label="Montant"
          variant="primary"
          formatValue="currency"
        />
        {budgetProgramme > 0 && (
          <KPIDonut
            title="% du budget programme"
            value={montant}
            total={budgetProgramme}
            label="Budget"
            variant={pourcentageBudget > 10 ? 'warning' : 'success'}
            formatValue="currency"
            subtitle={`${pourcentageBudget.toFixed(2)}% du budget total`}
          />
        )}
        <div className="depense-detail-statut-card">
          <div className="statut-card-icon" style={{ backgroundColor: statutColors[depense.statut] || statutColors.BROUILLON }}>
            <Icon name="Receipt" size={24} />
          </div>
          <div className="statut-card-content">
            <div className="statut-card-label">Statut</div>
            <div 
              className="statut-card-value"
              style={{ color: statutColors[depense.statut] || statutColors.BROUILLON }}
            >
              {depense.statut}
            </div>
          </div>
        </div>
      </div>

      <div className="depense-detail-content">
        <div className="depense-detail-main">
          <div className="depense-detail-card">
            <h1>{depense.libelle}</h1>
          </div>

          <div className="depense-detail-grid">
            <div className="depense-detail-section">
              <h2>Informations générales</h2>
              <div className="depense-detail-info">
                <div className="info-row">
                  <span className="info-label">Montant</span>
                  <span className="info-value amount">{formatCurrency(depense.montant)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Date de la dépense</span>
                  <span className="info-value">{formatDate(depense.date_depense)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Programme</span>
                  <span className="info-value">
                    {programme ? (
                      <a 
                        href={`/programmes/${programme.id}`}
                        onClick={(e) => {
                          e.preventDefault()
                          navigate(`/programmes/${programme.id}`)
                        }}
                        className="programme-link"
                      >
                        {programme.nom}
                      </a>
                    ) : depense.programme_id}
                  </span>
                </div>
                {depense.reference && (
                  <div className="info-row">
                    <span className="info-label">Référence</span>
                    <span className="info-value">{depense.reference}</span>
                  </div>
                )}
              </div>
            </div>

            {depense.description && (
              <div className="depense-detail-section">
                <h2>Description</h2>
                <div className="depense-detail-description">
                  <p>{depense.description}</p>
                </div>
              </div>
            )}

            {depense.justificatif_url && (
              <div className="depense-detail-section">
                <h2>Pièce justificative</h2>
                <div className="depense-detail-justificatif">
                  <a 
                    href={depense.justificatif_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="justificatif-download"
                  >
                    <Icon name="FileText" size={20} />
                    <span>Télécharger le document</span>
                  </a>
                </div>
              </div>
            )}

            <div className="depense-detail-section">
              <h2>Métadonnées</h2>
              <div className="depense-detail-info">
                <div className="info-row">
                  <span className="info-label">Créé le</span>
                  <span className="info-value">{formatDate(depense.created_at)}</span>
                </div>
                {depense.updated_at && depense.updated_at !== depense.created_at && (
                  <div className="info-row">
                    <span className="info-label">Modifié le</span>
                    <span className="info-value">{formatDate(depense.updated_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
