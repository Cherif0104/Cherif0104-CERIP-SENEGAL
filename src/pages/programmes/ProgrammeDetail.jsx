import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { programmesService } from '@/services/programmes.service'
import { projetsService } from '@/services/projets.service'
import { auditService } from '@/services/audit.service'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/common/Button'
import { DataTable } from '@/components/common/DataTable'
import { TimelineHistory } from '@/components/audit/TimelineHistory'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import { Icon } from '@/components/common/Icon'
import ProgrammeDashboardDetail from '@/modules/programmes/tabs/dashboard/ProgrammeDashboardDetail'
import DepensesProgramme from '@/modules/programmes/tabs/depenses/DepensesProgramme'
import RisquesProgramme from '@/modules/programmes/tabs/risques/RisquesProgramme'
import JalonsProgramme from '@/modules/programmes/tabs/jalons/JalonsProgramme'
import ReportingProgramme from '@/modules/programmes/tabs/reporting/ReportingProgramme'
import ProgrammeCandidats from './tabs/ProgrammeCandidats'
import ProgrammeBeneficiaires from './tabs/ProgrammeBeneficiaires'
import { formatDate, formatCurrency } from '@/utils/format'
import { toast } from '@/components/common/Toast'
import { logger } from '@/utils/logger'
import './ProgrammeDetail.css'

export default function ProgrammeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [programme, setProgramme] = useState(null)
  const [projets, setProjets] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingProjets, setLoadingProjets] = useState(false)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard')
  
  // Mettre à jour le tab si changé via URL
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab')
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl)
    }
  }, [searchParams])
  
  // Fonction pour changer de tab et mettre à jour l'URL
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    navigate(`/programmes/${id}${tab !== 'dashboard' ? `?tab=${tab}` : ''}`, { replace: true })
  }

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
        <Button onClick={() => navigate('/programmes')}>
          Retour à la liste
        </Button>
      </div>
    )
  }

  return (
    <div className="programme-detail">
      <div className="programme-detail-header">
        <Button onClick={() => navigate('/programmes')}>
          ← Retour
        </Button>
        <div className="programme-detail-title">
          <h1>{programme.nom}</h1>
          <div className="programme-detail-meta">
            <span className="programme-detail-id">ID: {programme.id}</span>
            {programme.code && (
              <span className="programme-detail-code">Code: {programme.code}</span>
            )}
            {programme.statut && (
              <span className={`programme-detail-statut statut-${programme.statut.toLowerCase().replace(/\s+/g, '-')}`}>
                {programme.statut}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="programme-detail-tabs">
        <button
          className={`programme-detail-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleTabChange('dashboard')}
        >
          Vue d'ensemble
        </button>
        <button
          className={`programme-detail-tab ${activeTab === 'depenses' ? 'active' : ''}`}
          onClick={() => handleTabChange('depenses')}
        >
          Dépenses
        </button>
        <button
          className={`programme-detail-tab ${activeTab === 'projets' ? 'active' : ''}`}
          onClick={() => handleTabChange('projets')}
        >
          Projets ({projets.length})
        </button>
        <button
          className={`programme-detail-tab ${activeTab === 'candidats' ? 'active' : ''}`}
          onClick={() => handleTabChange('candidats')}
        >
          Candidats
        </button>
        <button
          className={`programme-detail-tab ${activeTab === 'beneficiaires' ? 'active' : ''}`}
          onClick={() => handleTabChange('beneficiaires')}
        >
          Bénéficiaires
        </button>
        <button
          className={`programme-detail-tab ${activeTab === 'risques' ? 'active' : ''}`}
          onClick={() => handleTabChange('risques')}
        >
          Risques
        </button>
        <button
          className={`programme-detail-tab ${activeTab === 'jalons' ? 'active' : ''}`}
          onClick={() => handleTabChange('jalons')}
        >
          Jalons
        </button>
        <button
          className={`programme-detail-tab ${activeTab === 'reporting' ? 'active' : ''}`}
          onClick={() => handleTabChange('reporting')}
        >
          Reporting
        </button>
        <button
          className={`programme-detail-tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => handleTabChange('details')}
        >
          Détails
        </button>
        <button
          className={`programme-detail-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => handleTabChange('history')}
        >
          Historique
        </button>
      </div>

      <div className="programme-detail-content">
        {activeTab === 'dashboard' ? (
          <ProgrammeDashboardDetail programmeId={id} />
        ) : activeTab === 'depenses' ? (
          <DepensesProgramme programmeId={id} />
        ) : activeTab === 'risques' ? (
          <RisquesProgramme programmeId={id} />
        ) : activeTab === 'jalons' ? (
          <JalonsProgramme programmeId={id} />
        ) : activeTab === 'reporting' ? (
          <ReportingProgramme programmeId={id} />
        ) : activeTab === 'candidats' ? (
          <ProgrammeCandidats programmeId={id} />
        ) : activeTab === 'beneficiaires' ? (
          <ProgrammeBeneficiaires programmeId={id} />
        ) : activeTab === 'details' ? (
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
            <TimelineHistory tableName="programmes" recordId={id} />
          </div>
        )}
      </div>
    </div>
  )
}

