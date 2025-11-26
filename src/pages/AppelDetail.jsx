import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { appelsService } from '../services/appels.service'
import { projetsService } from '../services/projets.service'
import { programmesService } from '../services/programmes.service'
import { candidatsService } from '../services/candidats.service'
import { supabase } from '../lib/supabase'
import { toastService } from '../services/toast.service'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import LoadingState from '../components/common/LoadingState'
import EmptyState from '../components/common/EmptyState'
import ConfirmModal from '../components/common/ConfirmModal'
import './AppelDetail.css'

export default function AppelDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [appel, setAppel] = useState(null)
  const [projet, setProjet] = useState(null)
  const [programme, setProgramme] = useState(null)
  const [eligibilite, setEligibilite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [candidats, setCandidats] = useState([])
  const [pipelineStats, setPipelineStats] = useState({
    nouveau: 0,
    diagnostic: 0,
    selectionne: 0,
    beneficiaire: 0
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)

  useEffect(() => {
    loadAll()
  }, [id])

  const loadAll = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadAppel(),
        loadCandidats(),
        loadPipelineStats()
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadAppel = async () => {
    try {
      const { data, error } = await appelsService.getById(id)
      if (error) {
        toastService.error('Erreur lors du chargement de l\'appel')
        navigate('/appels-candidatures')
      } else {
        setAppel(data)
        if (data?.projet_id) {
          const { data: projetData } = await projetsService.getById(data.projet_id)
          setProjet(projetData)
          
          // Charger le programme parent
          if (projetData?.programme_id) {
            const { data: programmeData } = await programmesService.getById(projetData.programme_id)
            setProgramme(programmeData)
            
            // Charger les règles d'éligibilité du programme
            const { data: eligData } = await supabase
              .from('programme_eligibilite')
              .select('*')
              .eq('programme_id', projetData.programme_id)
              .single()
            
            if (eligData) {
              setEligibilite(eligData)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading appel:', error)
      toastService.error('Erreur lors du chargement de l\'appel')
      navigate('/appels-candidatures')
    }
  }

  const loadCandidats = async () => {
    try {
      const { data } = await candidatsService.getAll(id)
      setCandidats(data || [])
    } catch (error) {
      console.error('Error loading candidats:', error)
    }
  }

  const loadPipelineStats = async () => {
    try {
      const { data: candidatsData } = await supabase
        .from('candidats')
        .select('statut')
        .eq('appel_id', id)

      const stats = {
        nouveau: 0,
        diagnostic: 0,
        selectionne: 0,
        beneficiaire: 0
      }

      ;(candidatsData || []).forEach(c => {
        if (c.statut === 'NOUVEAU') stats.nouveau++
        else if (c.statut === 'DIAGNOSTIC') stats.diagnostic++
        else if (c.statut === 'SELECTIONNE') stats.selectionne++
      })

      // Compter les bénéficiaires convertis depuis cet appel
      const { data: benefData } = await supabase
        .from('beneficiaires')
        .select('id')
        .eq('appel_id', id)

      stats.beneficiaire = benefData?.length || 0

      setPipelineStats(stats)
    } catch (error) {
      console.error('Error loading pipeline stats:', error)
    }
  }

  const handleDelete = async () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    setShowDeleteConfirm(false)
    try {
      const { error } = await appelsService.delete(id)
      if (error) {
        toastService.error('Erreur lors de la suppression')
      } else {
        toastService.success('Appel à candidatures supprimé avec succès')
        if (appel?.projet_id) {
          navigate(`/projets/${appel.projet_id}`)
        } else {
          navigate('/appels-candidatures')
        }
      }
    } catch (error) {
      console.error('Error deleting appel:', error)
      toastService.error('Erreur lors de la suppression')
    }
  }

  const handleClose = async () => {
    setShowCloseConfirm(true)
  }

  const confirmClose = async () => {
    setShowCloseConfirm(false)
    try {
      const { error } = await appelsService.close(id)
      if (error) {
        toastService.error('Erreur lors de la clôture')
      } else {
        toastService.success('Appel à candidatures clôturé avec succès')
        loadAppel()
      }
    } catch (error) {
      console.error('Error closing appel:', error)
      toastService.error('Erreur lors de la clôture')
    }
  }

  if (loading) {
    return <LoadingState message="Chargement de l'appel..." />
  }

  if (!appel) {
    return (
      <EmptyState
        icon="AlertCircle"
        title="Appel introuvable"
        message="L'appel demandé n'existe pas ou a été supprimé"
        action={{
          label: "Retour à la liste",
          onClick: () => navigate('/appels-candidatures')
        }}
      />
    )
  }

  const getStatutBadge = (statut) => {
    const badges = {
      'OUVERT': 'statut-ouvert',
      'FERME': 'statut-ferme',
      'CLOTURE': 'statut-cloture'
    }
    return badges[statut] || 'statut-default'
  }

  return (
    <div className="appel-detail-page">
      <div className="appel-detail-header">
        <BackButton to={appel.projet_id ? `/projets/${appel.projet_id}` : '/appels-candidatures'} label="Retour" />
        <div className="appel-detail-header-content">
          <div>
            <h1>{appel.titre || 'Appel sans titre'}</h1>
            <span className={`appel-statut ${getStatutBadge(appel.statut)}`}>
              {appel.statut || 'NON_DEFINI'}
            </span>
            {projet && (
              <div className="appel-projet-link">
                <Icon name="ArrowLeft" size={16} />
                <button onClick={() => navigate(`/projets/${projet.id}`)}>
                  {projet.nom}
                </button>
              </div>
            )}
          </div>
          <div className="appel-detail-actions">
            {appel.statut === 'OUVERT' && (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate(`/appels-candidatures/${id}/edit`)}
                >
                  <Icon name="Edit" size={18} />
                  Modifier
                </button>
                <button
                  className="btn btn-warning"
                  onClick={handleClose}
                >
                  <Icon name="X" size={18} />
                  Clôturer
                </button>
              </>
            )}
            <button
              className="btn btn-danger"
              onClick={handleDelete}
            >
              <Icon name="Trash2" size={18} />
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <div className="appel-detail-content">
        <div className="appel-detail-main">
          <div className="appel-detail-section">
            <h2>Description</h2>
            <p>{appel.description || 'Aucune description disponible'}</p>
          </div>

          <div className="appel-detail-section">
            <h2>Informations</h2>
            <div className="appel-info-grid">
              {projet && (
                <div className="info-item">
                  <Icon name="Folder" size={20} />
                  <div>
                    <label>Projet</label>
                    <span>{projet.nom}</span>
                  </div>
                </div>
              )}
              {appel.date_ouverture && (
                <div className="info-item">
                  <Icon name="Calendar" size={20} />
                  <div>
                    <label>Date d'ouverture</label>
                    <span>{new Date(appel.date_ouverture).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              )}
              {appel.date_fermeture && (
                <div className="info-item">
                  <Icon name="Calendar" size={20} />
                  <div>
                    <label>Date de fermeture</label>
                    <span>{new Date(appel.date_fermeture).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="appel-detail-section">
            <h2>Critères d'éligibilité</h2>
            {appel.criteres && (
              <div className="criteres-content">
                <h3>Critères spécifiques à cet appel</h3>
                {appel.criteres.split('\n').map((critere, index) => (
                  <div key={index} className="critere-item">
                    <Icon name="CheckCircle2" size={16} />
                    <span>{critere}</span>
                  </div>
                ))}
              </div>
            )}
            {eligibilite && (
              <div className="eligibilite-programme">
                <h3>Règles d'éligibilité du programme</h3>
                <div className="eligibilite-rules">
                  {eligibilite.age_min && eligibilite.age_max && (
                    <div className="eligibilite-rule">
                      <Icon name="Calendar" size={16} />
                      <span>Âge : {eligibilite.age_min} - {eligibilite.age_max} ans</span>
                    </div>
                  )}
                  {eligibilite.genres_autorises && Array.isArray(eligibilite.genres_autorises) && eligibilite.genres_autorises.length > 0 && (
                    <div className="eligibilite-rule">
                      <Icon name="Users" size={16} />
                      <span>Genres autorisés : {eligibilite.genres_autorises.join(', ')}</span>
                    </div>
                  )}
                  {eligibilite.zones_eligibles && Array.isArray(eligibilite.zones_eligibles) && eligibilite.zones_eligibles.length > 0 && (
                    <div className="eligibilite-rule">
                      <Icon name="MapPin" size={16} />
                      <span>Zones : {eligibilite.zones_eligibles.join(', ')}</span>
                    </div>
                  )}
                </div>
                {programme && (
                  <button
                    className="btn btn-text btn-sm"
                    onClick={() => navigate(`/programmes/${programme.id}`)}
                  >
                    <Icon name="ExternalLink" size={14} />
                    Voir les détails du programme
                  </button>
                )}
              </div>
            )}
            {!appel.criteres && !eligibilite && (
              <p className="text-muted">Aucun critère d'éligibilité défini</p>
            )}
          </div>

          <div className="appel-detail-section">
            <div className="section-header">
              <h2>Pipeline candidats ({candidats.length})</h2>
              <div className="section-header-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate(`/candidats?appel=${id}`)}
                >
                  <Icon name="ArrowRight" size={16} />
                  Voir le pipeline complet
                </button>
                {appel.statut === 'OUVERT' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/candidats/new?appel=${id}`)}
                  >
                    <Icon name="Plus" size={16} />
                    Inscrire un candidat
                  </button>
                )}
              </div>
            </div>
            
            <div className="pipeline-summary">
              <div className="pipeline-step">
                <div className="pipeline-step-header">
                  <Icon name="Sparkles" size={20} />
                  <span>Nouveaux</span>
                </div>
                <div className="pipeline-step-value">{pipelineStats.nouveau}</div>
              </div>
              <div className="pipeline-arrow">
                <Icon name="ArrowRight" size={20} />
              </div>
              <div className="pipeline-step">
                <div className="pipeline-step-header">
                  <Icon name="FileSearch" size={20} />
                  <span>Diagnostic</span>
                </div>
                <div className="pipeline-step-value">{pipelineStats.diagnostic}</div>
              </div>
              <div className="pipeline-arrow">
                <Icon name="ArrowRight" size={20} />
              </div>
              <div className="pipeline-step">
                <div className="pipeline-step-header">
                  <Icon name="CheckCircle" size={20} />
                  <span>Sélectionnés</span>
                </div>
                <div className="pipeline-step-value">{pipelineStats.selectionne}</div>
              </div>
              <div className="pipeline-arrow">
                <Icon name="ArrowRight" size={20} />
              </div>
              <div className="pipeline-step">
                <div className="pipeline-step-header">
                  <Icon name="Users" size={20} />
                  <span>Bénéficiaires</span>
                </div>
                <div className="pipeline-step-value">{pipelineStats.beneficiaire}</div>
              </div>
            </div>

            {candidats.length === 0 ? (
              <EmptyState
                icon="Users"
                title="Aucun candidat"
                message="Aucun candidat ne s'est encore inscrit à cet appel"
                action={appel.statut === 'OUVERT' ? {
                  label: "Inscrire un candidat",
                  onClick: () => navigate(`/candidats/new?appel=${id}`)
                } : undefined}
              />
            ) : (
              <div className="candidats-preview">
                <div className="candidats-list">
                  {candidats.slice(0, 5).map(candidat => (
                    <div 
                      key={candidat.id} 
                      className="candidat-item"
                      onClick={() => navigate(`/candidats/${candidat.id}`)}
                    >
                      <div>
                        <h4>{candidat.nom} {candidat.prenom}</h4>
                        <p>{candidat.email}</p>
                        {candidat.statut_eligibilite && (
                          <span className={`badge badge-${candidat.statut_eligibilite.toLowerCase()}`}>
                            {candidat.statut_eligibilite}
                          </span>
                        )}
                      </div>
                      <Icon name="ChevronRight" size={18} />
                    </div>
                  ))}
                </div>
                {candidats.length > 5 && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/candidats?appel=${id}`)}
                  >
                    Voir tous les {candidats.length} candidats
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="appel-detail-sidebar">
          {projet && (
            <div className="appel-context-card">
              <div className="context-header">
                <Icon name="Folder" size={20} />
                <h3>Projet parent</h3>
              </div>
              <div className="context-content">
                <button 
                  className="context-link"
                  onClick={() => navigate(`/projets/${projet.id}`)}
                >
                  {projet.nom}
                </button>
                {programme && (
                  <>
                    <div className="context-detail">
                      <Icon name="ClipboardList" size={14} />
                      <button 
                        className="context-link-small"
                        onClick={() => navigate(`/programmes/${programme.id}`)}
                      >
                        {programme.nom}
                      </button>
                    </div>
                    {programme.financeur && (
                      <div className="context-detail">
                        <Icon name="Building2" size={14} />
                        <span>{programme.financeur}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          <div className="appel-stats">
            <h3>Statistiques</h3>
            <div 
              className="stat-item clickable"
              onClick={() => navigate(`/candidats?appel=${id}`)}
            >
              <div className="stat-icon">
                <Icon name="Sparkles" size={18} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{candidats.length}</span>
                <span className="stat-label">Candidats inscrits</span>
              </div>
              <Icon name="ChevronRight" size={16} />
            </div>
            <div 
              className="stat-item clickable"
              onClick={() => navigate(`/candidats?appel=${id}&statut=SELECTIONNE`)}
            >
              <div className="stat-icon">
                <Icon name="CheckCircle" size={18} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{pipelineStats.selectionne}</span>
                <span className="stat-label">Sélectionnés</span>
              </div>
              <Icon name="ChevronRight" size={16} />
            </div>
            <div 
              className="stat-item clickable"
              onClick={() => navigate(`/beneficiaires?appel=${id}`)}
            >
              <div className="stat-icon">
                <Icon name="Users" size={18} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{pipelineStats.beneficiaire}</span>
                <span className="stat-label">Bénéficiaires</span>
              </div>
              <Icon name="ChevronRight" size={16} />
            </div>
            {candidats.length > 0 && (
              <div className="stat-item">
                <div className="stat-icon">
                  <Icon name="TrendingUp" size={18} />
                </div>
                <div className="stat-content">
                  <span className="stat-value">
                    {((pipelineStats.beneficiaire / candidats.length) * 100).toFixed(1)}%
                  </span>
                  <span className="stat-label">Taux de conversion</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showDeleteConfirm}
        title="Supprimer l'appel à candidatures"
        description="Êtes-vous sûr de vouloir supprimer cet appel à candidatures ? Cette action est irréversible."
        variant="danger"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ConfirmModal
        open={showCloseConfirm}
        title="Clôturer l'appel à candidatures"
        description="Êtes-vous sûr de vouloir clôturer cet appel à candidatures ? Les nouvelles candidatures ne pourront plus être acceptées."
        variant="warning"
        confirmLabel="Clôturer"
        cancelLabel="Annuler"
        onConfirm={confirmClose}
        onCancel={() => setShowCloseConfirm(false)}
      />
    </div>
  )
}

