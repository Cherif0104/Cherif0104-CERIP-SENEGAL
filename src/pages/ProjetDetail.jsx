import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { projetsService } from '../services/projets.service'
import { programmesService } from '../services/programmes.service'
import { appelsService } from '../services/appels.service'
import { candidatsService } from '../services/candidats.service'
import { beneficiairesService } from '../services/beneficiaires.service'
import { supabase } from '../lib/supabase'
import { toastService } from '../services/toast.service'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import LoadingState from '../components/common/LoadingState'
import EmptyState from '../components/common/EmptyState'
import ConfirmModal from '../components/common/ConfirmModal'
import './ProjetDetail.css'

export default function ProjetDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [projet, setProjet] = useState(null)
  const [programme, setProgramme] = useState(null)
  const [appels, setAppels] = useState([])
  const [stats, setStats] = useState({
    appels: 0,
    candidats: 0,
    beneficiaires: 0
  })
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    loadAll()
  }, [id])

  const loadAll = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadProjet(),
        loadAppels(),
        loadStats()
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadProjet = async () => {
    try {
      const { data, error } = await projetsService.getById(id)
      if (error) {
        toastService.error('Erreur lors du chargement du projet')
        navigate('/projets')
      } else {
        setProjet(data)
        if (data?.programme_id) {
          const { data: programmeData } = await programmesService.getById(data.programme_id)
          setProgramme(programmeData)
        }
      }
    } catch (error) {
      console.error('Error loading projet:', error)
      toastService.error('Erreur lors du chargement du projet')
      navigate('/projets')
    }
  }

  const loadAppels = async () => {
    try {
      const { data, error } = await appelsService.getAll(id)
      if (!error && data) {
        setAppels(data)
      }
    } catch (error) {
      console.error('Error loading appels:', error)
    }
  }

  const loadStats = async () => {
    try {
      // Compter les appels
      const { count: appelsCount } = await supabase
        .from('appels_candidatures')
        .select('*', { count: 'exact', head: true })
        .eq('projet_id', id)

      // Compter les candidats liés aux appels de ce projet
      const { data: appelsData } = await supabase
        .from('appels_candidatures')
        .select('id')
        .eq('projet_id', id)

      const appelsIds = (appelsData || []).map(a => a.id)
      const { count: candidatsCount } = appelsIds.length > 0
        ? await supabase
            .from('candidats')
            .select('*', { count: 'exact', head: true })
            .in('appel_id', appelsIds)
        : { count: 0 }

      // Compter les bénéficiaires liés à ce projet
      const { count: benefCount } = await supabase
        .from('beneficiaires')
        .select('*', { count: 'exact', head: true })
        .eq('projet_id', id)

      setStats({
        appels: appelsCount || 0,
        candidats: candidatsCount || 0,
        beneficiaires: benefCount || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleDelete = async () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    setShowDeleteConfirm(false)
    try {
      const { error } = await projetsService.delete(id)
      if (error) {
        toastService.error('Erreur lors de la suppression')
      } else {
        toastService.success('Projet supprimé avec succès')
        if (projet?.programme_id) {
          navigate(`/programmes/${projet.programme_id}`)
        } else {
          navigate('/projets')
        }
      }
    } catch (error) {
      console.error('Error deleting projet:', error)
      toastService.error('Erreur lors de la suppression')
    }
  }

  if (loading) {
    return <LoadingState message="Chargement du projet..." />
  }

  if (!projet) {
    return (
      <EmptyState
        icon="AlertCircle"
        title="Projet introuvable"
        message="Le projet demandé n'existe pas ou a été supprimé"
        action={{
          label: "Retour à la liste",
          onClick: () => navigate('/projets')
        }}
      />
    )
  }

  return (
    <div className="projet-detail-page">
      <div className="projet-detail-header">
        <BackButton to={projet.programme_id ? `/programmes/${projet.programme_id}` : '/projets'} label="Retour" />
        <div className="projet-detail-header-content">
          <div>
            <h1>{projet.nom || 'Projet sans nom'}</h1>
            {programme && (
              <div className="projet-programme-link">
                <Icon name="ArrowLeft" size={16} />
                <button onClick={() => navigate(`/programmes/${programme.id}`)}>
                  {programme.nom}
                </button>
              </div>
            )}
          </div>
          <div className="projet-detail-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/projets/${id}/edit`)}
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

      <div className="projet-detail-content">
        <div className="projet-detail-main">
          <div className="projet-detail-section">
            <h2>Description</h2>
            <p>{projet.description || 'Aucune description disponible'}</p>
          </div>

          <div className="projet-detail-section">
            <h2>Informations</h2>
            <div className="projet-info-grid">
              {programme && (
                <div className="info-item">
                  <Icon name="ClipboardList" size={20} />
                  <div>
                    <label>Programme</label>
                    <span>{programme.nom}</span>
                  </div>
                </div>
              )}
              {projet.type_activite && (
                <div className="info-item">
                  <Icon name="Bookmark" size={20} />
                  <div>
                    <label>Type d'activité</label>
                    <span>{projet.type_activite}</span>
                  </div>
                </div>
              )}
              {projet.date_debut && (
                <div className="info-item">
                  <Icon name="Calendar" size={20} />
                  <div>
                    <label>Date de début</label>
                    <span>{new Date(projet.date_debut).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              )}
              {projet.date_fin && (
                <div className="info-item">
                  <Icon name="Calendar" size={20} />
                  <div>
                    <label>Date de fin</label>
                    <span>{new Date(projet.date_fin).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="projet-detail-section">
            <div className="section-header">
              <h2>Appels à candidatures ({stats.appels})</h2>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate(`/appels-candidatures/new?projet=${id}`)}
              >
                <Icon name="Plus" size={16} />
                Nouvel appel
              </button>
            </div>
            {appels.length === 0 ? (
              <EmptyState
                icon="Bell"
                title="Aucun appel à candidatures"
                message="Ce projet n'a pas encore d'appels à candidatures"
                action={{
                  label: "Créer un appel",
                  onClick: () => navigate(`/appels-candidatures/new?projet=${id}`)
                }}
              />
            ) : (
              <div className="appels-list">
                {appels.map(appel => (
                  <div 
                    key={appel.id} 
                    className="appel-card"
                    onClick={() => navigate(`/appels-candidatures/${appel.id}`)}
                  >
                    <div className="appel-card-header">
                      <h3>{appel.titre}</h3>
                      <span className={`badge badge-${appel.statut?.toLowerCase() || 'default'}`}>
                        {appel.statut || 'N/A'}
                      </span>
                    </div>
                    {appel.description && (
                      <p className="appel-description">{appel.description.substring(0, 100)}...</p>
                    )}
                    <div className="appel-card-footer">
                      <span>
                        <Icon name="Calendar" size={14} />
                        {appel.date_debut && new Date(appel.date_debut).toLocaleDateString('fr-FR')}
                        {appel.date_fin && ` - ${new Date(appel.date_fin).toLocaleDateString('fr-FR')}`}
                      </span>
                      <Icon name="ChevronRight" size={16} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="projet-detail-section">
            <h2>Bénéficiaires ({stats.beneficiaires})</h2>
            {stats.beneficiaires === 0 ? (
              <EmptyState
                icon="Users"
                title="Aucun bénéficiaire"
                message="Ce projet n'a pas encore de bénéficiaires"
              />
            ) : (
              <button
                className="btn btn-secondary"
                onClick={() => navigate(`/beneficiaires?projet=${id}`)}
              >
                <Icon name="Users" size={18} />
                Voir les {stats.beneficiaires} bénéficiaires
              </button>
            )}
          </div>
        </div>

        <div className="projet-detail-sidebar">
          {programme && (
            <div className="projet-context-card">
              <div className="context-header">
                <Icon name="ClipboardList" size={20} />
                <h3>Programme parent</h3>
              </div>
              <div className="context-content">
                <button 
                  className="context-link"
                  onClick={() => navigate(`/programmes/${programme.id}`)}
                >
                  {programme.nom}
                </button>
                {programme.financeur && (
                  <div className="context-detail">
                    <Icon name="Building2" size={14} />
                    <span>{programme.financeur}</span>
                  </div>
                )}
                {programme.date_debut && programme.date_fin && (
                  <div className="context-detail">
                    <Icon name="Calendar" size={14} />
                    <span>
                      {new Date(programme.date_debut).toLocaleDateString('fr-FR')} - {new Date(programme.date_fin).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="projet-stats">
            <h3>Statistiques</h3>
            <div className="stat-item clickable" onClick={() => navigate(`/appels-candidatures?projet=${id}`)}>
              <div className="stat-icon">
                <Icon name="Bell" size={18} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.appels}</span>
                <span className="stat-label">Appels à candidatures</span>
              </div>
              <Icon name="ChevronRight" size={16} />
            </div>
            <div className="stat-item clickable" onClick={() => navigate(`/candidats?projet=${id}`)}>
              <div className="stat-icon">
                <Icon name="Sparkles" size={18} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.candidats}</span>
                <span className="stat-label">Candidats</span>
              </div>
              <Icon name="ChevronRight" size={16} />
            </div>
            <div className="stat-item clickable" onClick={() => navigate(`/beneficiaires?projet=${id}`)}>
              <div className="stat-icon">
                <Icon name="Users" size={18} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.beneficiaires}</span>
                <span className="stat-label">Bénéficiaires</span>
              </div>
              <Icon name="ChevronRight" size={16} />
            </div>
            {stats.candidats > 0 && (
              <div className="stat-item">
                <div className="stat-icon">
                  <Icon name="TrendingUp" size={18} />
                </div>
                <div className="stat-content">
                  <span className="stat-value">
                    {((stats.beneficiaires / stats.candidats) * 100).toFixed(1)}%
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
        title="Supprimer le projet"
        description="Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible."
        variant="danger"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}

