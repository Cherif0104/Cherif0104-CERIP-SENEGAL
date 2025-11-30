import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { projetsService } from '@/services/projets.service'
import { beneficiairesService } from '@/services/beneficiaires.service'
import { appelsService } from '@/services/appels.service'
import { auditService } from '@/services/audit.service'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { DataTable } from '@/components/common/DataTable'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import { AuditTrail } from '@/components/audit/AuditTrail'
import { formatDate, formatCurrency } from '@/utils/format'
import { toast } from '@/components/common/Toast'
import { logger } from '@/utils/logger'
import './ProjetDetail.css'

export default function ProjetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [projet, setProjet] = useState(null)
  const [beneficiaires, setBeneficiaires] = useState([])
  const [appels, setAppels] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingBeneficiaires, setLoadingBeneficiaires] = useState(false)
  const [loadingAppels, setLoadingAppels] = useState(false)
  const [activeTab, setActiveTab] = useState('details') // 'details', 'beneficiaires', 'appels', 'history'

  useEffect(() => {
    loadProjet()
    loadBeneficiaires()
    loadAppels()
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

  const loadBeneficiaires = async () => {
    setLoadingBeneficiaires(true)
    try {
      const { data, error } = await beneficiairesService.getByProjet(id)
      if (error) {
        logger.error('PROJET_DETAIL', 'Erreur chargement bénéficiaires', error)
        return
      }
      setBeneficiaires(data || [])
      logger.debug('PROJET_DETAIL', `${data?.length || 0} bénéficiaires chargés`)
    } catch (error) {
      logger.error('PROJET_DETAIL', 'Erreur inattendue chargement bénéficiaires', error)
    } finally {
      setLoadingBeneficiaires(false)
    }
  }

  const loadAppels = async () => {
    setLoadingAppels(true)
    try {
      const { data, error } = await appelsService.getByProjet(id)
      if (error) {
        logger.error('PROJET_DETAIL', 'Erreur chargement appels', error)
        return
      }
      setAppels(data || [])
      logger.debug('PROJET_DETAIL', `${data?.length || 0} appels chargés`)
    } catch (error) {
      logger.error('PROJET_DETAIL', 'Erreur inattendue chargement appels', error)
    } finally {
      setLoadingAppels(false)
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
        <Button onClick={() => navigate('/projets?tab=liste')}>
          Retour à la liste
        </Button>
      </div>
    )
  }

  return (
    <div className="projet-detail">
      <div className="projet-detail-header">
        <Button onClick={() => navigate('/projets?tab=liste')}>
          ← Retour
        </Button>
        <div className="projet-detail-title">
          <h1>{projet.nom}</h1>
          <span className="projet-detail-id">ID: {projet.id}</span>
        </div>
      </div>

      <div className="projet-detail-tabs">
        <button
          className={`projet-detail-tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Détails
        </button>
        <button
          className={`projet-detail-tab ${activeTab === 'beneficiaires' ? 'active' : ''}`}
          onClick={() => setActiveTab('beneficiaires')}
        >
          Bénéficiaires ({beneficiaires.length})
        </button>
        <button
          className={`projet-detail-tab ${activeTab === 'appels' ? 'active' : ''}`}
          onClick={() => setActiveTab('appels')}
        >
          Appels ({appels.length})
        </button>
        <button
          className={`projet-detail-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Historique
        </button>
      </div>

      <div className="projet-detail-content">
        {activeTab === 'details' ? (
          <div className="projet-detail-info">
            <div className="projet-detail-section">
              <h2>Informations générales</h2>
              <div className="projet-detail-grid">
                <div className="projet-detail-field">
                  <label>Programme</label>
                  <span>{projet.programmes?.nom || projet.programme_id || '-'}</span>
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
        ) : activeTab === 'beneficiaires' ? (
          <div className="projet-detail-beneficiaires">
            {loadingBeneficiaires ? (
              <LoadingState message="Chargement des bénéficiaires..." />
            ) : beneficiaires.length === 0 ? (
              <EmptyState 
                icon="Users" 
                title="Aucun bénéficiaire" 
                message="Ce projet n'a pas encore de bénéficiaires associés" 
              />
            ) : (
              <>
                <div className="beneficiaires-header">
                  <h2>Bénéficiaires associés ({beneficiaires.length})</h2>
                  <PermissionGuard permission="beneficiaires.create">
                    <Button variant="primary" onClick={() => navigate(`/beneficiaires/new?projet_id=${id}`)}>
                      <Icon name="Plus" size={16} />
                      Nouveau bénéficiaire
                    </Button>
                  </PermissionGuard>
                </div>
                <DataTable
                  columns={[
                    { key: 'code', label: 'Code' },
                    { 
                      key: 'personne', 
                      label: 'Nom', 
                      render: (value) => value ? `${value.prenom || ''} ${value.nom || ''}`.trim() || '-' : '-' 
                    },
                    { key: 'statut_global', label: 'Statut', render: (value) => (
                      <span className={`statut-badge statut-${value?.toLowerCase().replace(/\s+/g, '-')}`}>
                        {value || '-'}
                      </span>
                    )},
                    { 
                      key: 'actions', 
                      label: 'Actions', 
                      render: (_, row) => (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/beneficiaires/${row.id}`)}
                        >
                          Voir détails
                        </Button>
                      )
                    },
                  ]}
                  data={beneficiaires}
                />
              </>
            )}
          </div>
        ) : activeTab === 'appels' ? (
          <div className="projet-detail-appels">
            {loadingAppels ? (
              <LoadingState message="Chargement des appels..." />
            ) : appels.length === 0 ? (
              <EmptyState 
                icon="Bell" 
                title="Aucun appel" 
                message="Ce projet n'a pas encore d'appels à candidatures" 
              />
            ) : (
              <>
                <div className="appels-header">
                  <h2>Appels à candidatures ({appels.length})</h2>
                  <PermissionGuard permission="candidatures.create">
                    <Button variant="primary" onClick={() => navigate(`/candidatures/appels/new?projet_id=${id}`)}>
                      <Icon name="Plus" size={16} />
                      Nouvel appel
                    </Button>
                  </PermissionGuard>
                </div>
                <DataTable
                  columns={[
                    { key: 'titre', label: 'Titre' },
                    { key: 'statut', label: 'Statut', render: (value) => (
                      <span className={`statut-badge statut-${value?.toLowerCase().replace(/\s+/g, '-')}`}>
                        {value || '-'}
                      </span>
                    )},
                    { key: 'date_ouverture', label: 'Date ouverture', render: (value) => value ? formatDate(value) : '-' },
                    { key: 'date_fermeture', label: 'Date fermeture', render: (value) => value ? formatDate(value) : '-' },
                    { 
                      key: 'actions', 
                      label: 'Actions', 
                      render: (_, row) => (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/candidatures/appels/${row.id}`)}
                        >
                          Voir détails
                        </Button>
                      )
                    },
                  ]}
                  data={appels}
                />
              </>
            )}
          </div>
        ) : (
          <div className="projet-detail-history">
            <AuditTrail tableName="projets" recordId={id} />
          </div>
        )}
      </div>
    </div>
  )
}

