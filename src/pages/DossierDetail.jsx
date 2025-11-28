import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { dossiersService } from '../services/dossiers.service'
import { appelsService } from '../services/appels.service'
import { candidatsService } from '../services/candidats.service'
import { projetsService } from '../services/projets.service'
import { toastService } from '../services/toast.service'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import LoadingState from '../components/common/LoadingState'
import EmptyState from '../components/common/EmptyState'
import ConfirmModal from '../components/common/ConfirmModal'
import './DossierDetail.css'

export default function DossierDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [dossier, setDossier] = useState(null)
  const [appel, setAppel] = useState(null)
  const [candidat, setCandidat] = useState(null)
  const [projet, setProjet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState('infos')

  useEffect(() => {
    loadAll()
  }, [id])

  const loadAll = async () => {
    setLoading(true)
    try {
      await loadDossier()
      // loadRelatedData sera appelé par le useEffect quand dossier sera défini
    } finally {
      setLoading(false)
    }
  }

  const loadDossier = async () => {
    try {
      const { data, error } = await dossiersService.getById(id)
      if (error) {
        toastService.error('Erreur lors du chargement du dossier')
        navigate('/dossiers')
      } else {
        setDossier(data)
      }
    } catch (error) {
      console.error('Error loading dossier:', error)
      toastService.error('Erreur lors du chargement du dossier')
      navigate('/dossiers')
    }
  }

  const loadRelatedData = async () => {
    if (!dossier) return

    try {
      const promises = []

      if (dossier.appel_id) {
        promises.push(
          appelsService.getById(dossier.appel_id).then(({ data }) => setAppel(data))
        )
      }

      if (dossier.candidat_id) {
        promises.push(
          candidatsService.getById(dossier.candidat_id).then(({ data }) => setCandidat(data))
        )
      }

      if (dossier.projet_id) {
        promises.push(
          projetsService.getById(dossier.projet_id).then(({ data }) => setProjet(data))
        )
      }

      await Promise.all(promises)
    } catch (error) {
      console.error('Error loading related data:', error)
    }
  }

  useEffect(() => {
    if (dossier) {
      loadRelatedData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dossier])

  const handleDelete = async () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    setShowDeleteConfirm(false)
    try {
      const { error } = await dossiersService.delete(id)
      if (error) {
        toastService.error('Erreur lors de la suppression')
      } else {
        toastService.success('Dossier supprimé avec succès')
        navigate('/dossiers')
      }
    } catch (error) {
      console.error('Error deleting dossier:', error)
      toastService.error('Erreur lors de la suppression')
    }
  }

  const getStatutColor = (statut) => {
    const colors = {
      'ACCEPTE': 'var(--color-success)',
      'EN_TRAITEMENT': 'var(--color-primary)',
      'REFUSE': 'var(--color-danger)',
      'EN_ATTENTE': 'var(--color-warning)'
    }
    return colors[statut] || 'var(--color-gray-500)'
  }

  if (loading) {
    return <LoadingState message="Chargement du dossier..." />
  }

  if (!dossier) {
    return (
      <EmptyState
        icon="AlertCircle"
        title="Dossier introuvable"
        description="Le dossier demandé n'existe pas ou a été supprimé"
        action={{
          label: "Retour à la liste",
          onClick: () => navigate('/dossiers')
        }}
      />
    )
  }

  return (
    <div className="dossier-detail-page">
      <div className="dossier-detail-header">
        <BackButton to="/dossiers" label="Retour à la liste" />
        <div className="dossier-detail-header-content">
          <div>
            <h1>Dossier #{dossier.id.substring(0, 8)}</h1>
            {appel && (
              <div className="dossier-appel-link">
                <Icon name="Bell" size={16} />
                <button onClick={() => navigate(`/appels-candidatures/${appel.id}`)}>
                  {appel.titre}
                </button>
              </div>
            )}
          </div>
          <div className="dossier-detail-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/dossiers/${id}/edit`)}
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

      <div className="dossier-detail-tabs">
        <button
          className={`dossier-tab ${activeTab === 'infos' ? 'dossier-tab--active' : ''}`}
          onClick={() => setActiveTab('infos')}
        >
          <Icon name="Info" size={18} />
          Informations
        </button>
        <button
          className={`dossier-tab ${activeTab === 'documents' ? 'dossier-tab--active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <Icon name="FileText" size={18} />
          Documents ({dossier.documents?.length || 0})
        </button>
        <button
          className={`dossier-tab ${activeTab === 'historique' ? 'dossier-tab--active' : ''}`}
          onClick={() => setActiveTab('historique')}
        >
          <Icon name="Clock" size={18} />
          Historique
        </button>
      </div>

      <div className="dossier-detail-content">
        {activeTab === 'infos' && (
          <div className="dossier-detail-section">
            <div className="dossier-info-grid">
              <div className="dossier-info-card">
                <h3>Statut</h3>
                <span 
                  className="dossier-statut-badge"
                  style={{ backgroundColor: getStatutColor(dossier.statut) }}
                >
                  {dossier.statut?.replace('_', ' ') || 'NON_DEFINI'}
                </span>
              </div>

              {candidat && (
                <div className="dossier-info-card">
                  <h3>Candidat</h3>
                  <div className="dossier-candidat-link">
                    <button onClick={() => navigate(`/candidats/${candidat.id}`)}>
                      {`${candidat.prenom || ''} ${candidat.nom || ''}`.trim() || 'Candidat sans nom'}
                    </button>
                    {candidat.email && <span className="dossier-email">{candidat.email}</span>}
                  </div>
                </div>
              )}

              {appel && (
                <div className="dossier-info-card">
                  <h3>Appel à candidatures</h3>
                  <button onClick={() => navigate(`/appels-candidatures/${appel.id}`)}>
                    {appel.titre}
                  </button>
                </div>
              )}

              {projet && (
                <div className="dossier-info-card">
                  <h3>Projet</h3>
                  <button onClick={() => navigate(`/projets/${projet.id}`)}>
                    {projet.nom}
                  </button>
                </div>
              )}

              {dossier.date_depot && (
                <div className="dossier-info-card">
                  <h3>Date de dépôt</h3>
                  <p>{new Date(dossier.date_depot).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
              )}

              {dossier.date_traitement && (
                <div className="dossier-info-card">
                  <h3>Date de traitement</h3>
                  <p>{new Date(dossier.date_traitement).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
              )}

              {dossier.date_decision && (
                <div className="dossier-info-card">
                  <h3>Date de décision</h3>
                  <p>{new Date(dossier.date_decision).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
              )}

              {dossier.motif_refus && (
                <div className="dossier-info-card dossier-info-card--full">
                  <h3>Motif de refus</h3>
                  <p>{dossier.motif_refus}</p>
                </div>
              )}

              {dossier.notes && (
                <div className="dossier-info-card dossier-info-card--full">
                  <h3>Notes</h3>
                  <p>{dossier.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="dossier-detail-section">
            {!dossier.documents || dossier.documents.length === 0 ? (
              <EmptyState
                icon="FileText"
                title="Aucun document"
                description="Aucun document n'a été associé à ce dossier"
              />
            ) : (
              <div className="dossier-documents-list">
                {dossier.documents.map((doc, index) => (
                  <div key={index} className="dossier-document-item">
                    <Icon name="File" size={20} />
                    <span>{typeof doc === 'string' ? doc : doc.nom || `Document ${index + 1}`}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'historique' && (
          <div className="dossier-detail-section">
            <div className="dossier-historique">
              <div className="dossier-historique-item">
                <div className="dossier-historique-date">
                  {dossier.date_depot ? new Date(dossier.date_depot).toLocaleDateString('fr-FR') : '-'}
                </div>
                <div className="dossier-historique-content">
                  <h4>Dépôt du dossier</h4>
                  <p>Le dossier a été déposé</p>
                </div>
              </div>

              {dossier.date_traitement && (
                <div className="dossier-historique-item">
                  <div className="dossier-historique-date">
                    {new Date(dossier.date_traitement).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="dossier-historique-content">
                    <h4>Début du traitement</h4>
                    <p>Le dossier est en cours de traitement</p>
                  </div>
                </div>
              )}

              {dossier.date_decision && (
                <div className="dossier-historique-item">
                  <div className="dossier-historique-date">
                    {new Date(dossier.date_decision).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="dossier-historique-content">
                    <h4>Décision</h4>
                    <p>Décision prise : <strong>{dossier.statut?.replace('_', ' ')}</strong></p>
                    {dossier.motif_refus && <p>Motif : {dossier.motif_refus}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        open={showDeleteConfirm}
        title="Supprimer le dossier"
        description="Êtes-vous sûr de vouloir supprimer ce dossier ? Cette action est irréversible."
        variant="danger"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}
