import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { projetsService } from '@/services/projets.service'
import { auditService } from '@/services/audit.service'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { TimelineHistory } from '@/components/audit/TimelineHistory'
import { formatDate, formatCurrency } from '@/utils/format'
import { toast } from '@/components/common/Toast'
import { logger } from '@/utils/logger'
import ProjetDashboardDetail from '@/modules/projets/tabs/dashboard/ProjetDashboardDetail'
import DepensesProjet from '@/modules/projets/tabs/depenses/DepensesProjet'
import ActivitesProjet from '@/modules/projets/tabs/activites/ActivitesProjet'
import CandidatsProjet from '@/modules/projets/tabs/candidats/CandidatsProjet'
import BeneficiairesProjet from '@/modules/projets/tabs/beneficiaires/BeneficiairesProjet'
import RisquesProjetDetail from '@/modules/projets/tabs/risques/RisquesProjetDetail'
import JalonsProjetDetail from '@/modules/projets/tabs/jalons/JalonsProjetDetail'
import ReportingProjetDetail from '@/modules/projets/tabs/reporting/ReportingProjetDetail'
import './ProjetDetail.css'

export default function ProjetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [projet, setProjet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard') // 'dashboard', 'depenses', 'activites', 'candidats', 'beneficiaires', 'risques', 'jalons', 'reporting', 'details', 'history'

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
    navigate(`/projets/${id}${tab !== 'dashboard' ? `?tab=${tab}` : ''}`, { replace: true })
  }

  useEffect(() => {
    loadProjet()
    logView()
  }, [id])

  const loadProjet = async () => {
    setLoading(true)
    try {
      const { data, error } = await projetsService.getById(id)
      if (error) {
        logger.error('PROJET_DETAIL', 'Erreur chargement projet', error)
        toast.error('Erreur lors du chargement du projet')
        return
      }
      setProjet(data)
      logger.debug('PROJET_DETAIL', 'Projet chargé', { id, nom: data?.nom })
    } catch (error) {
      logger.error('PROJET_DETAIL', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }


  const logView = async () => {
    try {
      await auditService.logAction('projets', id, 'VIEW', {
        reason: 'Consultation détail projet',
      })
    } catch (error) {
      logger.warn('PROJET_DETAIL', 'Impossible de logger la consultation', error)
    }
  }

  if (loading) return <LoadingState />

  if (!projet) {
    return (
      <div className="projet-detail-error">
        <h2>Projet non trouvé</h2>
        <Button onClick={() => navigate('/projets')}>
          Retour à la liste
        </Button>
      </div>
    )
  }

  return (
    <div className="projet-detail">
      <div className="projet-detail-header">
        <Button onClick={() => navigate('/projets')}>
          ← Retour
        </Button>
        <div className="projet-detail-title">
          <h1>{projet.nom}</h1>
          <div className="projet-detail-meta">
            <span className="projet-detail-id">ID: {projet.id}</span>
            {projet.code && (
              <span className="projet-detail-code">Code: {projet.code}</span>
            )}
            {projet.statut && (
              <span className={`projet-detail-statut statut-${projet.statut.toLowerCase().replace(/\s+/g, '-')}`}>
                {projet.statut}
              </span>
            )}
            {projet.programme_id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/programmes/${projet.programme_id}`)}
                className="projet-link-programme"
              >
                <Icon name="ArrowLeft" size={14} />
                Voir le programme
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="projet-detail-tabs">
        <button
          className={`projet-detail-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleTabChange('dashboard')}
        >
          Vue d'ensemble
        </button>
        <button
          className={`projet-detail-tab ${activeTab === 'depenses' ? 'active' : ''}`}
          onClick={() => handleTabChange('depenses')}
        >
          Dépenses
        </button>
        <button
          className={`projet-detail-tab ${activeTab === 'activites' ? 'active' : ''}`}
          onClick={() => handleTabChange('activites')}
        >
          Activités
        </button>
        <button
          className={`projet-detail-tab ${activeTab === 'candidats' ? 'active' : ''}`}
          onClick={() => handleTabChange('candidats')}
        >
          Candidats
        </button>
        <button
          className={`projet-detail-tab ${activeTab === 'beneficiaires' ? 'active' : ''}`}
          onClick={() => handleTabChange('beneficiaires')}
        >
          Bénéficiaires
        </button>
        <button
          className={`projet-detail-tab ${activeTab === 'risques' ? 'active' : ''}`}
          onClick={() => handleTabChange('risques')}
        >
          Risques
        </button>
        <button
          className={`projet-detail-tab ${activeTab === 'jalons' ? 'active' : ''}`}
          onClick={() => handleTabChange('jalons')}
        >
          Jalons
        </button>
        <button
          className={`projet-detail-tab ${activeTab === 'reporting' ? 'active' : ''}`}
          onClick={() => handleTabChange('reporting')}
        >
          Reporting
        </button>
        <button
          className={`projet-detail-tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => handleTabChange('details')}
        >
          Détails
        </button>
        <button
          className={`projet-detail-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => handleTabChange('history')}
        >
          Historique
        </button>
      </div>

      <div className="projet-detail-content">
        {activeTab === 'dashboard' ? (
          <ProjetDashboardDetail projetId={id} />
        ) : activeTab === 'depenses' ? (
          <DepensesProjet projetId={id} />
        ) : activeTab === 'activites' ? (
          <ActivitesProjet projetId={id} />
        ) : activeTab === 'candidats' ? (
          <CandidatsProjet projetId={id} />
        ) : activeTab === 'beneficiaires' ? (
          <BeneficiairesProjet projetId={id} />
        ) : activeTab === 'risques' ? (
          <RisquesProjetDetail projetId={id} />
        ) : activeTab === 'jalons' ? (
          <JalonsProjetDetail projetId={id} />
        ) : activeTab === 'reporting' ? (
          <ReportingProjetDetail projetId={id} />
        ) : activeTab === 'details' ? (
          <div className="projet-detail-info">
            <div className="projet-detail-section">
              <h2>Informations générales</h2>
              <div className="projet-detail-grid">
                <div className="projet-detail-field">
                  <label>Programme</label>
                  <span>
                    {projet.programmes?.nom || projet.programme_id || '-'}
                    {projet.programme_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/programmes/${projet.programme_id}`)}
                        style={{ marginLeft: '8px' }}
                      >
                        <Icon name="ExternalLink" size={14} />
                      </Button>
                    )}
                  </span>
                </div>
                <div className="projet-detail-field">
                  <label>Type d'activité</label>
                  <span>{projet.type_activite || '-'}</span>
                </div>
                <div className="projet-detail-field">
                  <label>Statut</label>
                  <span className={`statut-badge statut-${projet.statut?.toLowerCase().replace(/\s+/g, '-')}`}>
                    {projet.statut || '-'}
                  </span>
                </div>
                {projet.date_debut && (
                  <div className="projet-detail-field">
                    <label>Date de début</label>
                    <span>{formatDate(projet.date_debut)}</span>
                  </div>
                )}
                {projet.date_fin && (
                  <div className="projet-detail-field">
                    <label>Date de fin</label>
                    <span>{formatDate(projet.date_fin)}</span>
                  </div>
                )}
                {projet.budget_alloue && (
                  <div className="projet-detail-field">
                    <label>Budget alloué</label>
                    <span>{formatCurrency(projet.budget_alloue)}</span>
                  </div>
                )}
                {projet.budget_consomme && (
                  <div className="projet-detail-field">
                    <label>Budget consommé</label>
                    <span>{formatCurrency(projet.budget_consomme)}</span>
                  </div>
                )}
              </div>
            </div>

            {projet.description && (
              <div className="projet-detail-section">
                <h2>Description</h2>
                <p>{projet.description}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="projet-detail-history">
            <TimelineHistory tableName="projets" recordId={id} />
          </div>
        )}
      </div>
    </div>
  )
}

