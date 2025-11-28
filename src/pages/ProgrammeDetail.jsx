import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { programmesService } from '../services/programmes.service'
import { projetsService } from '../services/projets.service'
import { candidatsService } from '../services/candidats.service'
import { beneficiairesService } from '../services/beneficiaires.service'
import { supabase } from '../lib/supabase'
import { toastService } from '../services/toast.service'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import LoadingState from '../components/common/LoadingState'
import EmptyState from '../components/common/EmptyState'
import ConfirmModal from '../components/common/ConfirmModal'
import BudgetLinesManager from '../components/programme/BudgetLinesManager'
import BudgetTracking from '../components/programme/BudgetTracking'
import BudgetAlerts from '../components/programme/BudgetAlerts'
import FinancementsManager from '../components/programme/FinancementsManager'
import IndicateursManager from '../components/programme/IndicateursManager'
import IndicateursDashboard from '../components/programme/IndicateursDashboard'
import RapportsManager from '../components/programme/RapportsManager'
import DocumentsManager from '../components/programme/DocumentsManager'
import WorkflowManager from '../components/programme/WorkflowManager'
import HistoriqueManager from '../components/programme/HistoriqueManager'
import JalonsManager from '../components/programme/JalonsManager'
import JalonsTimeline from '../components/programme/JalonsTimeline'
import PartenairesManager from '../components/programme/PartenairesManager'
import ProgrammeDashboard from '../components/programme/ProgrammeDashboard'
import './ProgrammeDetail.css'

export default function ProgrammeDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [programme, setProgramme] = useState(null)
  const [loading, setLoading] = useState(true)
  const [projets, setProjets] = useState([])
  const [stats, setStats] = useState({ candidats: 0, beneficiaires: 0 })
  const [eligibilite, setEligibilite] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadAll()
  }, [id])

  const loadAll = async () => {
    setLoading(true)
    try {
      // Charger programme + projets en parallèle
      const [
        { data: programmeData, error: programmeError },
        { data: projetsData, error: projetsError }
      ] = await Promise.all([
        programmesService.getById(id),
        projetsService.getAll(id)
      ])

      if (programmeError) {
        toastService.error('Erreur lors du chargement du programme')
        navigate('/programmes')
        return
      }

      setProgramme(programmeData)

      const safeProjets = !projetsError && projetsData ? projetsData : []
      setProjets(safeProjets)

      // Calculer les statistiques et charger les règles d'éligibilité
      await Promise.all([
        loadStats(safeProjets),
        loadEligibilite()
      ])
    } catch (error) {
      console.error('Erreur lors du chargement des données du programme', error)
      toastService.error('Erreur lors du chargement du programme')
      navigate('/programmes')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async (projetsList) => {
    try {
      const [candidatsRes, benefRes] = await Promise.all([
        supabase
          .from('candidats')
          .select('id, projet_id'),
        supabase
          .from('beneficiaires')
          .select('id, projet_id')
      ])

      const projetsIds = (projetsList || []).map(p => p.id)

      const candidatsCount = (candidatsRes.data || []).filter(c =>
        c.projet_id && projetsIds.includes(c.projet_id)
      ).length

      const benefCount = (benefRes.data || []).filter(b =>
        b.projet_id && projetsIds.includes(b.projet_id)
      ).length

      setStats({ candidats: candidatsCount, beneficiaires: benefCount })
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques du programme', error)
    }
  }

  const loadEligibilite = async () => {
    try {
      const { data, error } = await supabase
        .from('programme_eligibilite')
        .select('*')
        .eq('programme_id', id)
        .single()

      if (!error && data) {
        setEligibilite(data)
      }
    } catch (error) {
      // Si la table n'existe pas ou aucune règle, on reste silencieux
      console.warn('Eligibilité programme non configurée ou table manquante')
    }
  }

  const handleDelete = async () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    setShowDeleteConfirm(false)
    try {
      const { error } = await programmesService.delete(id)
      if (error) {
        toastService.error('Erreur lors de la suppression')
      } else {
        toastService.success('Programme supprimé avec succès')
        navigate('/programmes')
      }
    } catch (error) {
      console.error('Error deleting programme:', error)
      toastService.error('Erreur lors de la suppression')
    }
  }

  if (loading) {
    return <LoadingState message="Chargement du programme..." />
  }

  if (!programme) {
    return (
      <EmptyState
        icon="AlertCircle"
        title="Programme introuvable"
        message="Le programme demandé n'existe pas ou a été supprimé"
        action={{
          label: "Retour à la liste",
          onClick: () => navigate('/programmes')
        }}
      />
    )
  }

  return (
    <div className="programme-detail-page">
      <div className="programme-detail-header">
        <BackButton to="/programmes" label="Retour à la liste" />
        <div className="programme-detail-header-content">
          <div>
            <h1>{programme.nom || 'Programme sans nom'}</h1>
            <span className={`programme-statut programme-statut--${programme.statut?.toLowerCase()}`}>
              {programme.statut?.replace('_', ' ') || 'NON_DEFINI'}
            </span>
          </div>
          <div className="programme-detail-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/programmes/${id}/edit`)}
            >
              <Icon name="Edit" size={18} />
              Modifier
            </button>
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

      <div className="programme-detail-content">
        {/* Onglets */}
        <div className="programme-tabs">
          <button
            className={`programme-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Icon name="LayoutDashboard" size={18} />
            Vue d'ensemble
          </button>
          <button
            className={`programme-tab ${activeTab === 'budget' ? 'active' : ''}`}
            onClick={() => setActiveTab('budget')}
          >
            <Icon name="DollarSign" size={18} />
            Budget & Financements
          </button>
          <button
            className={`programme-tab ${activeTab === 'indicateurs' ? 'active' : ''}`}
            onClick={() => setActiveTab('indicateurs')}
          >
            <Icon name="BarChart" size={18} />
            Indicateurs
          </button>
          <button
            className={`programme-tab ${activeTab === 'rapports' ? 'active' : ''}`}
            onClick={() => setActiveTab('rapports')}
          >
            <Icon name="FileText" size={18} />
            Rapports
          </button>
          <button
            className={`programme-tab ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <Icon name="Folder" size={18} />
            Documents
          </button>
          <button
            className={`programme-tab ${activeTab === 'jalons' ? 'active' : ''}`}
            onClick={() => setActiveTab('jalons')}
          >
            <Icon name="Calendar" size={18} />
            Jalons
          </button>
          <button
            className={`programme-tab ${activeTab === 'partenaires' ? 'active' : ''}`}
            onClick={() => setActiveTab('partenaires')}
          >
            <Icon name="Users" size={18} />
            Partenaires
          </button>
          <button
            className={`programme-tab ${activeTab === 'workflow' ? 'active' : ''}`}
            onClick={() => setActiveTab('workflow')}
          >
            <Icon name="CheckCircle" size={18} />
            Workflow
          </button>
          <button
            className={`programme-tab ${activeTab === 'historique' ? 'active' : ''}`}
            onClick={() => setActiveTab('historique')}
          >
            <Icon name="History" size={18} />
            Historique
          </button>
        </div>

        {/* Contenu des onglets */}
        <div className="programme-tab-content">
          {activeTab === 'overview' && (
            <div className="programme-detail-main">
              <ProgrammeDashboard programmeId={id} programme={programme} />
              
              <div className="programme-detail-section">
                <h2>Description</h2>
                <p>{programme.description || 'Aucune description disponible'}</p>
              </div>

              <div className="programme-detail-section">
                <h2>Informations</h2>
                <div className="programme-info-grid">
                  <div className="info-item">
                    <Icon name="DollarSign" size={20} />
                    <div>
                      <label>Financeur</label>
                      <span>{programme.financeur || 'Non spécifié'}</span>
                    </div>
                  </div>
                  {programme.chef_projet && (
                    <div className="info-item">
                      <Icon name="User" size={20} />
                      <div>
                        <label>Chef de projet</label>
                        <span>{programme.chef_projet}</span>
                      </div>
                    </div>
                  )}
                  {programme.date_debut && (
                    <div className="info-item">
                      <Icon name="Calendar" size={20} />
                      <div>
                        <label>Date de début</label>
                        <span>{new Date(programme.date_debut).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  )}
                  {programme.date_fin && (
                    <div className="info-item">
                      <Icon name="Calendar" size={20} />
                      <div>
                        <label>Date de fin</label>
                        <span>{new Date(programme.date_fin).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  )}
                  {programme.budget && (
                    <div className="info-item">
                      <Icon name="DollarSign" size={20} />
                      <div>
                        <label>Budget</label>
                        <span>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(programme.budget)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="programme-detail-section">
                <div className="section-header">
                  <h2>Projets associés</h2>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/projets/new?programme=${id}`)}
                  >
                    <Icon name="Plus" size={16} />
                    Nouveau projet
                  </button>
                </div>
                {projets.length === 0 ? (
                  <EmptyState
                    icon="Folder"
                    title="Aucun projet"
                    message="Ce programme n'a pas encore de projets associés"
                    action={{
                      label: "Créer un projet",
                      onClick: () => navigate(`/projets/new?programme=${id}`)
                    }}
                  />
                ) : (
                  <div className="projets-list">
                    {projets.map(projet => (
                      <div key={projet.id} className="projet-item">
                        <h4>{projet.nom}</h4>
                        <button
                          className="btn-icon"
                          onClick={() => navigate(`/projets/${projet.id}`)}
                        >
                          <Icon name="ArrowRight" size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="programme-budget-tab">
              <BudgetAlerts programmeId={id} />
              <BudgetTracking programmeId={id} programmeBudget={programme.budget} />
              <BudgetLinesManager programmeId={id} mode="edit" />
              <FinancementsManager programmeId={id} mode="edit" />
            </div>
          )}

          {activeTab === 'indicateurs' && (
            <div className="programme-indicateurs-tab">
              <IndicateursDashboard programmeId={id} />
              <IndicateursManager programmeId={id} mode="edit" />
            </div>
          )}

          {activeTab === 'rapports' && (
            <div className="programme-rapports-tab">
              <RapportsManager programmeId={id} mode="edit" />
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="programme-documents-tab">
              <DocumentsManager programmeId={id} mode="edit" />
            </div>
          )}

          {activeTab === 'jalons' && (
            <div className="programme-jalons-tab">
              <JalonsTimeline programmeId={id} />
              <JalonsManager programmeId={id} mode="edit" />
            </div>
          )}

          {activeTab === 'partenaires' && (
            <div className="programme-partenaires-tab">
              <PartenairesManager programmeId={id} mode="edit" />
            </div>
          )}

          {activeTab === 'workflow' && (
            <div className="programme-workflow-tab">
              <WorkflowManager programmeId={id} mode="edit" />
            </div>
          )}

          {activeTab === 'historique' && (
            <div className="programme-historique-tab">
              <HistoriqueManager programmeId={id} />
            </div>
          )}
        </div>

        <div className="programme-detail-sidebar">
          <div className="programme-stats">
            <h3>Statistiques</h3>
            <div className="stat-item">
              <span className="stat-label">Projets</span>
              <span className="stat-value">{projets.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Candidats</span>
              <span className="stat-value">{stats.candidats}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Bénéficiaires</span>
              <span className="stat-value">{stats.beneficiaires}</span>
            </div>
          </div>

          <div className="programme-eligibilite">
            <h3>Eligibilité</h3>
            {eligibilite ? (
              <ul className="eligibilite-list">
                {eligibilite.age_min != null && (
                  <li>
                    <strong>Âge minimum :</strong> {eligibilite.age_min} ans
                  </li>
                )}
                {eligibilite.age_max != null && (
                  <li>
                    <strong>Âge maximum :</strong> {eligibilite.age_max} ans
                  </li>
                )}
                {Array.isArray(eligibilite.genres_autorises) && eligibilite.genres_autorises.length > 0 && (
                  <li>
                    <strong>Genres ciblés :</strong> {eligibilite.genres_autorises.join(', ')}
                  </li>
                )}
                {Array.isArray(eligibilite.zones) && eligibilite.zones.length > 0 && (
                  <li>
                    <strong>Zones éligibles :</strong> {eligibilite.zones.join(', ')}
                  </li>
                )}
              </ul>
            ) : (
              <p className="eligibilite-empty">
                Aucune règle d'éligibilité spécifique configurée pour ce programme.
              </p>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showDeleteConfirm}
        title="Supprimer le programme"
        description="Êtes-vous sûr de vouloir supprimer ce programme ? Cette action est irréversible."
        variant="danger"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}

