import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { programmesService } from '@/services/programmes.service'
import { projetsService } from '@/services/projets.service'
import { auditService } from '@/services/audit.service'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/common/Button'
import { DataTable } from '@/components/common/DataTable'
import { AuditTrail } from '@/components/audit/AuditTrail'
import { formatDate, formatCurrency } from '@/utils/format'
import { toast } from '@/components/common/Toast'
import { logger } from '@/utils/logger'
import './ProgrammeDetail.css'

export default function ProgrammeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [programme, setProgramme] = useState(null)
  const [projets, setProjets] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingProjets, setLoadingProjets] = useState(false)
  const [activeTab, setActiveTab] = useState('details') // 'details', 'projets', ou 'history'

  useEffect(() => {
    loadProgramme()
    loadProjets()
    // Logger la consultation
    logView()
  }, [id])

  const loadProgramme = async () => {
    setLoading(true)
    try {
      const { data, error } = await programmesService.getById(id)
      if (error) {
        logger.error('PROGRAMME_DETAIL', 'Erreur chargement programme', error)
        toast.error('Erreur lors du chargement du programme')
        return
      }
      setProgramme(data)
      logger.debug('PROGRAMME_DETAIL', 'Programme chargé', { id, nom: data?.nom })
    } catch (error) {
      logger.error('PROGRAMME_DETAIL', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  const loadProjets = async () => {
    setLoadingProjets(true)
    try {
      const { data, error } = await projetsService.getAll(id)
      if (error) {
        logger.error('PROGRAMME_DETAIL', 'Erreur chargement projets', error)
        return
      }
      setProjets(data || [])
      logger.debug('PROGRAMME_DETAIL', `${data?.length || 0} projets chargés`)
    } catch (error) {
      logger.error('PROGRAMME_DETAIL', 'Erreur inattendue chargement projets', error)
    } finally {
      setLoadingProjets(false)
    }
  }

  const logView = async () => {
    try {
      await auditService.logAction('programmes', id, 'VIEW', {
        reason: 'Consultation détail programme',
      })
    } catch (error) {
      logger.warn('PROGRAMME_DETAIL', 'Impossible de logger la consultation', error)
    }
  }

  if (loading) return <LoadingState />

  if (!programme) {
    return (
      <div className="programme-detail-error">
        <h2>Programme non trouvé</h2>
        <Button onClick={() => navigate('/programmes?tab=liste')}>
          Retour à la liste
        </Button>
      </div>
    )
  }

  return (
    <div className="programme-detail">
      <div className="programme-detail-header">
        <Button onClick={() => navigate('/programmes?tab=liste')}>
          ← Retour
        </Button>
        <div className="programme-detail-title">
          <h1>{programme.nom}</h1>
          <span className="programme-detail-id">ID: {programme.id}</span>
        </div>
      </div>

      <div className="programme-detail-tabs">
        <button
          className={`programme-detail-tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Détails
        </button>
        <button
          className={`programme-detail-tab ${activeTab === 'projets' ? 'active' : ''}`}
          onClick={() => setActiveTab('projets')}
        >
          Projets ({projets.length})
        </button>
        <button
          className={`programme-detail-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Historique
        </button>
      </div>

      <div className="programme-detail-content">
        {activeTab === 'details' ? (
          <div className="programme-detail-info">
            <div className="programme-detail-section">
              <h2>Informations générales</h2>
              <div className="programme-detail-grid">
                <div className="programme-detail-field">
                  <label>Type</label>
                  <span>{programme.type || '-'}</span>
                </div>
                <div className="programme-detail-field">
                  <label>Statut</label>
                  <span className={`statut-badge statut-${programme.statut?.toLowerCase()}`}>
                    {programme.statut || '-'}
                  </span>
                </div>
                {programme.date_debut && (
                  <div className="programme-detail-field">
                    <label>Date de début</label>
                    <span>{formatDate(programme.date_debut)}</span>
                  </div>
                )}
                {programme.date_fin && (
                  <div className="programme-detail-field">
                    <label>Date de fin</label>
                    <span>{formatDate(programme.date_fin)}</span>
                  </div>
                )}
                {programme.budget && (
                  <div className="programme-detail-field">
                    <label>Budget</label>
                    <span>{formatCurrency(programme.budget)}</span>
                  </div>
                )}
              </div>
            </div>

            {programme.description && (
              <div className="programme-detail-section">
                <h2>Description</h2>
                <p>{programme.description}</p>
              </div>
            )}
          </div>
        ) : activeTab === 'projets' ? (
          <div className="programme-detail-projets">
            {loadingProjets ? (
              <LoadingState message="Chargement des projets..." />
            ) : projets.length === 0 ? (
              <EmptyState 
                icon="Briefcase" 
                title="Aucun projet" 
                message="Ce programme n'a pas encore de projets associés" 
              />
            ) : (
              <>
                <div className="projets-header">
                  <h2>Projets associés ({projets.length})</h2>
                  <PermissionGuard permission="projets.create">
                    <Button variant="primary" onClick={() => navigate(`/projets/new?programme_id=${id}`)}>
                      <Icon name="Plus" size={16} />
                      Nouveau projet
                    </Button>
                  </PermissionGuard>
                </div>
                <DataTable
                  columns={[
                    { key: 'nom', label: 'Nom' },
                    { key: 'statut', label: 'Statut', render: (value) => (
                      <span className={`statut-badge statut-${value?.toLowerCase().replace(/\s+/g, '-')}`}>
                        {value}
                      </span>
                    )},
                    { key: 'date_debut', label: 'Date début', render: (value) => value ? formatDate(value) : '-' },
                    { key: 'date_fin', label: 'Date fin', render: (value) => value ? formatDate(value) : '-' },
                    { key: 'budget', label: 'Budget', render: (value) => value ? formatCurrency(value) : '-' },
                    { 
                      key: 'actions', 
                      label: 'Actions', 
                      render: (_, row) => (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/projets/${row.id}`)}
                        >
                          Voir détails
                        </Button>
                      )
                    },
                  ]}
                  data={projets}
                />
              </>
            )}
          </div>
        ) : (
          <div className="programme-detail-history">
            <AuditTrail tableName="programmes" recordId={id} />
          </div>
        )}
      </div>
    </div>
  )
}

