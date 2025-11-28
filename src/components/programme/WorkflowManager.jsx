import { useState, useEffect } from 'react'
import { programmeWorkflowService } from '../../services/programme-workflow.service'
import { toastService } from '../../services/toast.service'
import Icon from '../common/Icon'
import LoadingState from '../common/LoadingState'
import ApprovalModal from './ApprovalModal'
import './ProgrammeComponents.css'

const ETAPES_STANDARD = [
  { etape: 'CREATION', label: 'Création', description: 'Création du programme' },
  { etape: 'VALIDATION_INTERNE', label: 'Validation interne', description: 'Validation par l\'équipe' },
  { etape: 'APPROBATION_DIRECTION', label: 'Approbation direction', description: 'Approbation par la direction' },
  { etape: 'SOUMISSION_FINANCEUR', label: 'Soumission financeur', description: 'Soumission au financeur' },
  { etape: 'APPROBATION_FINANCEUR', label: 'Approbation financeur', description: 'Approbation par le financeur' },
  { etape: 'LANCEMENT', label: 'Lancement', description: 'Lancement du programme' }
]

const STATUTS = [
  { value: 'EN_ATTENTE', label: 'En attente', color: '#6b7280', icon: 'Clock' },
  { value: 'APPROUVE', label: 'Approuvé', color: '#10b981', icon: 'CheckCircle' },
  { value: 'REJETE', label: 'Rejeté', color: '#ef4444', icon: 'XCircle' },
  { value: 'EN_REVISION', label: 'En révision', color: '#f59e0b', icon: 'Edit' }
]

export default function WorkflowManager({ programmeId, mode = 'edit' }) {
  const [loading, setLoading] = useState(true)
  const [workflow, setWorkflow] = useState([])
  const [workflowStatus, setWorkflowStatus] = useState(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedEtape, setSelectedEtape] = useState(null)

  const isEditMode = mode === 'edit'

  useEffect(() => {
    if (programmeId) {
      loadWorkflow()
    }
  }, [programmeId])

  const loadWorkflow = async () => {
    setLoading(true)
    try {
      const [workflowRes, statusRes] = await Promise.all([
        programmeWorkflowService.getWorkflow(programmeId),
        programmeWorkflowService.getWorkflowStatus(programmeId)
      ])

      if (!workflowRes.error) {
        setWorkflow(workflowRes.data || [])
      }

      if (!statusRes.error) {
        setWorkflowStatus(statusRes.data)
      }
    } catch (error) {
      console.error('Error loading workflow:', error)
      toastService.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = (etape) => {
    setSelectedEtape(etape)
    setShowApprovalModal(true)
  }

  const handleApproval = async (etapeId, action, commentaire) => {
    try {
      let result
      // TODO: Récupérer l'utilisateur connecté
      const approbateurId = null

      if (action === 'APPROUVE') {
        result = await programmeWorkflowService.approveEtape(etapeId, approbateurId, commentaire)
      } else {
        result = await programmeWorkflowService.rejectEtape(etapeId, approbateurId, commentaire)
      }

      if (result.error) {
        toastService.error('Erreur lors de l\'approbation')
      } else {
        toastService.success(`Étape ${action === 'APPROUVE' ? 'approuvée' : 'rejetée'} avec succès`)
        setShowApprovalModal(false)
        setSelectedEtape(null)
        await loadWorkflow()
      }
    } catch (error) {
      console.error('Error approving etape:', error)
      toastService.error('Erreur lors de l\'approbation')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatutInfo = (statut) => {
    return STATUTS.find(s => s.value === statut) || STATUTS[0]
  }

  const getEtapeInfo = (etape) => {
    return ETAPES_STANDARD.find(e => e.etape === etape) || { label: etape, description: '' }
  }

  if (loading) {
    return <LoadingState message="Chargement du workflow..." />
  }

  return (
    <div className="workflow-manager">
      <div className="workflow-header">
        <div>
          <h3>Workflow d'approbation</h3>
          {workflowStatus && (
            <div className="workflow-summary">
              <span className="summary-item">
                <strong>Étapes:</strong> {workflowStatus.etapes_approuvees}/{workflowStatus.total_etapes}
              </span>
              {workflowStatus.est_complet && (
                <span className="summary-item summary-item--success">
                  <Icon name="CheckCircle" size={14} />
                  Workflow complet
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {workflow.length === 0 ? (
        <div className="empty-state">
          <Icon name="CheckCircle" size={32} />
          <p>Aucune étape de workflow définie</p>
          {isEditMode && (
            <p className="text-muted">
              Le workflow sera automatiquement créé lors de la soumission du programme
            </p>
          )}
        </div>
      ) : (
        <div className="workflow-timeline">
          {workflow.map((etape, index) => {
            const statutInfo = getStatutInfo(etape.statut)
            const etapeInfo = getEtapeInfo(etape.etape)
            const isLast = index === workflow.length - 1
            const canApprove = etape.statut === 'EN_ATTENTE' && isEditMode

            return (
              <div key={etape.id} className="workflow-timeline-item">
                <div className="workflow-timeline-marker">
                  <div
                    className="workflow-timeline-dot"
                    style={{
                      background: statutInfo.color,
                      borderColor: statutInfo.color
                    }}
                  >
                    <Icon name={statutInfo.icon} size={14} />
                  </div>
                  {!isLast && <div className="workflow-timeline-line" />}
                </div>

                <div className="workflow-timeline-content">
                  <div className={`workflow-card ${etape.statut === 'EN_ATTENTE' ? 'workflow-card--active' : ''}`}>
                    <div className="workflow-card-header">
                      <div className="workflow-card-title">
                        <Icon name={statutInfo.icon} size={18} style={{ color: statutInfo.color }} />
                        <div>
                          <h4>{etapeInfo.label}</h4>
                          <span className="workflow-card-etape">{etape.etape}</span>
                        </div>
                      </div>
                      <span
                        className="badge"
                        style={{
                          background: statutInfo.color,
                          color: 'white',
                          borderColor: statutInfo.color
                        }}
                      >
                        {statutInfo.label}
                      </span>
                    </div>

                    <div className="workflow-card-body">
                      {etapeInfo.description && (
                        <p className="workflow-card-description">{etapeInfo.description}</p>
                      )}

                      {etape.commentaire && (
                        <div className="workflow-card-comment">
                          <Icon name="MessageSquare" size={14} />
                          <span>{etape.commentaire}</span>
                        </div>
                      )}

                      {etape.date_approbation && (
                        <div className="workflow-card-meta">
                          <Icon name="Calendar" size={14} />
                          <span>Approuvé le {formatDate(etape.date_approbation)}</span>
                        </div>
                      )}
                    </div>

                    {canApprove && (
                      <div className="workflow-card-actions">
                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          onClick={() => handleApprove(etape)}
                        >
                          <Icon name="CheckCircle" size={14} />
                          Approuver
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            setSelectedEtape(etape)
                            setShowApprovalModal(true)
                          }}
                        >
                          <Icon name="XCircle" size={14} />
                          Rejeter
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal d'approbation */}
      {showApprovalModal && selectedEtape && (
        <ApprovalModal
          etape={selectedEtape}
          onApprove={(commentaire) => handleApproval(selectedEtape.id, 'APPROUVE', commentaire)}
          onReject={(commentaire) => handleApproval(selectedEtape.id, 'REJETE', commentaire)}
          onCancel={() => {
            setShowApprovalModal(false)
            setSelectedEtape(null)
          }}
        />
      )}
    </div>
  )
}

