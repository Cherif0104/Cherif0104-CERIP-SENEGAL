import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { candidatsService } from '../services/candidats.service'
import { appelsService } from '../services/appels.service'
import { diagnosticsService } from '../services/diagnostics.service'
import { toastService } from '../services/toast.service'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import LoadingState from '../components/common/LoadingState'
import EmptyState from '../components/common/EmptyState'
import ConfirmModal from '../components/common/ConfirmModal'
import ProjetSelector from '../components/common/ProjetSelector'
import DiagnosticForm from '../components/candidats/DiagnosticForm'
import './CandidatDetail.css'

export default function CandidatDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [candidat, setCandidat] = useState(null)
  const [appel, setAppel] = useState(null)
  const [diagnostic, setDiagnostic] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDiagnosticForm, setShowDiagnosticForm] = useState(false)
  const [showConfirmConvert, setShowConfirmConvert] = useState(false)
  const [showProjetSelector, setShowProjetSelector] = useState(false)

  useEffect(() => {
    loadCandidat()
    loadDiagnostic()
  }, [id])

  const loadCandidat = async () => {
    try {
      const { data, error } = await candidatsService.getById(id)
      if (error) {
        toastService.error('Erreur lors du chargement du candidat')
        navigate('/candidats')
      } else {
        setCandidat(data)
        if (data?.appel_id) {
          const { data: appelData } = await appelsService.getById(data.appel_id)
          setAppel(appelData)
        }
      }
    } catch (error) {
      console.error('Error loading candidat:', error)
      toastService.error('Erreur lors du chargement du candidat')
      navigate('/candidats')
    } finally {
      setLoading(false)
    }
  }

  const loadDiagnostic = async () => {
    try {
      const { data } = await diagnosticsService.get(id)
      setDiagnostic(data)
    } catch (error) {
      console.error('Error loading diagnostic:', error)
    }
  }

  const handleConvertClick = () => {
    setShowConfirmConvert(true)
  }

  const handleConfirmConvert = () => {
    setShowConfirmConvert(false)
    setShowProjetSelector(true)
  }

  const handleProjetSelect = async (projetId, projetNom) => {
    setShowProjetSelector(false)
    try {
      const { error, data } = await candidatsService.convertToBeneficiaire(id, projetId)
      if (error) {
        toastService.error('Erreur lors de la conversion')
      } else {
        toastService.success(`Candidat converti en bénéficiaire et affecté au projet "${projetNom}"`)
        navigate(`/beneficiaires/${data?.id || id}`)
      }
    } catch (error) {
      console.error('Error converting candidat:', error)
      toastService.error('Erreur lors de la conversion')
    }
  }

  const getStatutBadge = (statut) => {
    const badges = {
      'NOUVEAU': { class: 'statut-nouveau', label: 'Nouveau' },
      'DIAGNOSTIC': { class: 'statut-diagnostic', label: 'En diagnostic' },
      'SELECTIONNE': { class: 'statut-selectionne', label: 'Sélectionné' },
      'CONVERTI': { class: 'statut-converti', label: 'Converti' }
    }
    return badges[statut] || { class: 'statut-default', label: statut }
  }

  if (loading) {
    return <LoadingState message="Chargement du candidat..." />
  }

  if (!candidat) {
    return (
      <EmptyState
        icon="AlertCircle"
        title="Candidat introuvable"
        message="Le candidat demandé n'existe pas ou a été supprimé"
        action={{
          label: "Retour à la liste",
          onClick: () => navigate('/candidats')
        }}
      />
    )
  }

  const statutInfo = getStatutBadge(candidat.statut || 'NOUVEAU')

  return (
    <div className="candidat-detail-page">
      <div className="candidat-detail-header">
        <BackButton to={candidat.appel_id ? `/appels-candidatures/${candidat.appel_id}` : '/candidats'} label="Retour" />
        <div className="candidat-detail-header-content">
          <div>
            <h1>{candidat.nom} {candidat.prenom}</h1>
            <span className={`candidat-statut ${statutInfo.class}`}>
              {statutInfo.label}
            </span>
            {appel && (
              <div className="candidat-appel-link">
                <Icon name="ArrowLeft" size={16} />
                <button onClick={() => navigate(`/appels-candidatures/${appel.id}`)}>
                  {appel.titre}
                </button>
              </div>
            )}
          </div>
          <div className="candidat-detail-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/candidats/${id}/edit`)}
            >
              <Icon name="Edit" size={18} />
              Modifier
            </button>
            {candidat.statut === 'SELECTIONNE' && (
              <button
                className="btn btn-primary"
                onClick={handleConvertClick}
              >
                <Icon name="UserCheck" size={18} />
                Convertir en bénéficiaire
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="candidat-detail-content">
        <div className="candidat-detail-main">
          <div className="candidat-detail-section">
            <h2>Informations personnelles</h2>
            <div className="candidat-info-grid">
              {candidat.email && (
                <div className="info-item">
                  <Icon name="Mail" size={20} />
                  <div>
                    <label>Email</label>
                    <span>{candidat.email}</span>
                  </div>
                </div>
              )}
              {candidat.telephone && (
                <div className="info-item">
                  <Icon name="Phone" size={20} />
                  <div>
                    <label>Téléphone</label>
                    <span>{candidat.telephone}</span>
                  </div>
                </div>
              )}
              {candidat.date_naissance && (
                <div className="info-item">
                  <Icon name="Calendar" size={20} />
                  <div>
                    <label>Date de naissance</label>
                    <span>{new Date(candidat.date_naissance).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              )}
              {candidat.adresse && (
                <div className="info-item">
                  <Icon name="MapPin" size={20} />
                  <div>
                    <label>Adresse</label>
                    <span>{candidat.adresse}</span>
                  </div>
                </div>
              )}
              {candidat.ville && (
                <div className="info-item">
                  <Icon name="MapPin" size={20} />
                  <div>
                    <label>Ville</label>
                    <span>{candidat.ville}</span>
                  </div>
                </div>
              )}
              {candidat.date_inscription && (
                <div className="info-item">
                  <Icon name="Clock" size={20} />
                  <div>
                    <label>Date d'inscription</label>
                    <span>{new Date(candidat.date_inscription).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="candidat-detail-section">
            <div className="section-header">
              <h2>Fiche de diagnostic</h2>
              {!diagnostic && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowDiagnosticForm(true)}
                >
                  <Icon name="Plus" size={16} />
                  Créer un diagnostic
                </button>
              )}
            </div>
            {showDiagnosticForm ? (
              <DiagnosticForm
                candidatId={id}
                onSave={() => {
                  setShowDiagnosticForm(false)
                  loadDiagnostic()
                }}
                onCancel={() => setShowDiagnosticForm(false)}
              />
            ) : diagnostic ? (
              <div className="diagnostic-content">
                <div className="diagnostic-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowDiagnosticForm(true)}
                  >
                    <Icon name="Edit" size={16} />
                    Modifier
                  </button>
                </div>
                <div className="diagnostic-data">
                  {Object.entries(diagnostic).map(([key, value]) => {
                    if (key === 'id' || key === 'candidat_id' || !value) return null
                    return (
                      <div key={key} className="diagnostic-item">
                        <label>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                        <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <EmptyState
                icon="FileText"
                title="Aucun diagnostic"
                message="Créez une fiche de diagnostic pour ce candidat"
                action={{
                  label: "Créer un diagnostic",
                  onClick: () => setShowDiagnosticForm(true)
                }}
              />
            )}
          </div>
        </div>

        <div className="candidat-detail-sidebar">
          <div className="candidat-stats">
            <h3>Statut</h3>
            <div className="stat-item">
              <span className="stat-label">Statut actuel</span>
              <span className={`stat-value stat-value--${statutInfo.class}`}>
                {statutInfo.label}
              </span>
            </div>
            {diagnostic && (
              <div className="stat-item">
                <span className="stat-label">Diagnostic</span>
                <span className="stat-value stat-value--success">
                  <Icon name="CheckCircle2" size={16} />
                  Complété
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showConfirmConvert}
        title="Convertir en bénéficiaire"
        description="Êtes-vous sûr de vouloir convertir ce candidat en bénéficiaire ? Cette action est irréversible."
        variant="info"
        confirmLabel="Continuer"
        cancelLabel="Annuler"
        onConfirm={handleConfirmConvert}
        onCancel={() => setShowConfirmConvert(false)}
      />

      <ProjetSelector
        open={showProjetSelector}
        onSelect={handleProjetSelect}
        onCancel={() => setShowProjetSelector(false)}
      />
    </div>
  )
}

