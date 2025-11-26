import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { beneficiairesService } from '../services/beneficiaires.service'
import { projetsService } from '../services/projets.service'
import { planActionService } from '../services/plan-action.service'
import { toastService } from '../services/toast.service'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import LoadingState from '../components/common/LoadingState'
import EmptyState from '../components/common/EmptyState'
import PlanAction from '../components/beneficiaires/PlanAction'
import BesoinsIdentification from '../components/beneficiaires/BesoinsIdentification'
import './BeneficiaireDossier.css'

export default function BeneficiaireDossier() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [beneficiaire, setBeneficiaire] = useState(null)
  const [projet, setProjet] = useState(null)
  const [historique, setHistorique] = useState(null)
  const [planAction, setPlanAction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadBeneficiaire()
    loadHistorique()
    loadPlanAction()
  }, [id])

  const loadBeneficiaire = async () => {
    try {
      const { data, error } = await beneficiairesService.getById(id)
      if (error) {
        toastService.error('Erreur lors du chargement du bénéficiaire')
        navigate('/beneficiaires')
      } else {
        setBeneficiaire(data)
        if (data?.projet_id) {
          const { data: projetData } = await projetsService.getById(data.projet_id)
          setProjet(projetData)
        }
      }
    } catch (error) {
      console.error('Error loading beneficiaire:', error)
      toastService.error('Erreur lors du chargement du bénéficiaire')
      navigate('/beneficiaires')
    } finally {
      setLoading(false)
    }
  }

  const loadHistorique = async () => {
    try {
      const { data } = await beneficiairesService.getHistorique(id)
      setHistorique(data)
    } catch (error) {
      console.error('Error loading historique:', error)
    }
  }

  const loadPlanAction = async () => {
    try {
      const { data } = await planActionService.get(id)
      setPlanAction(data)
    } catch (error) {
      console.error('Error loading plan action:', error)
    }
  }

  if (loading) {
    return <LoadingState message="Chargement du dossier..." />
  }

  if (!beneficiaire) {
    return (
      <EmptyState
        icon="AlertCircle"
        title="Bénéficiaire introuvable"
        message="Le bénéficiaire demandé n'existe pas ou a été supprimé"
        action={{
          label: "Retour à la liste",
          onClick: () => navigate('/beneficiaires')
        }}
      />
    )
  }

  return (
    <div className="beneficiaire-dossier-page">
      <div className="dossier-header">
        <BackButton to="/beneficiaires" label="Retour à la liste" />
        <div className="dossier-header-content">
          <div>
            <h1>Dossier Bénéficiaire</h1>
            <h2>{beneficiaire.nom} {beneficiaire.prenom}</h2>
            {projet && (
              <div className="dossier-projet-link">
                <Icon name="ArrowLeft" size={16} />
                <button onClick={() => navigate(`/projets/${projet.id}`)}>
                  {projet.nom}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dossier-tabs">
        <button
          className={`dossier-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Icon name="User" size={18} />
          Vue d'ensemble
        </button>
        <button
          className={`dossier-tab ${activeTab === 'historique' ? 'active' : ''}`}
          onClick={() => setActiveTab('historique')}
        >
          <Icon name="Clock" size={18} />
          Historique
        </button>
        <button
          className={`dossier-tab ${activeTab === 'besoins' ? 'active' : ''}`}
          onClick={() => setActiveTab('besoins')}
        >
          <Icon name="Target" size={18} />
          Besoins identifiés
        </button>
        <button
          className={`dossier-tab ${activeTab === 'plan-action' ? 'active' : ''}`}
          onClick={() => setActiveTab('plan-action')}
        >
          <Icon name="CheckCircle2" size={18} />
          Plan d'action
        </button>
      </div>

      <div className="dossier-content">
        {activeTab === 'overview' && (
          <div className="dossier-section">
            <h3>Informations personnelles</h3>
            <div className="info-grid">
              {beneficiaire.email && (
                <div className="info-item">
                  <Icon name="Mail" size={20} />
                  <div>
                    <label>Email</label>
                    <span>{beneficiaire.email}</span>
                  </div>
                </div>
              )}
              {beneficiaire.telephone && (
                <div className="info-item">
                  <Icon name="Phone" size={20} />
                  <div>
                    <label>Téléphone</label>
                    <span>{beneficiaire.telephone}</span>
                  </div>
                </div>
              )}
              {beneficiaire.date_affectation && (
                <div className="info-item">
                  <Icon name="Calendar" size={20} />
                  <div>
                    <label>Date d'affectation</label>
                    <span>{new Date(beneficiaire.date_affectation).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              )}
              {projet && (
                <div className="info-item">
                  <Icon name="Folder" size={20} />
                  <div>
                    <label>Projet</label>
                    <span>{projet.nom}</span>
                  </div>
                </div>
              )}
            </div>

            <h3>Intervenants assignés</h3>
            <div className="intervenants-list">
              {beneficiaire.mentor && (
                <div className="intervenant-item">
                  <Icon name="Handshake" size={20} />
                  <div>
                    <label>Mentor</label>
                    <span>{beneficiaire.mentor}</span>
                  </div>
                </div>
              )}
              {beneficiaire.formateur && (
                <div className="intervenant-item">
                  <Icon name="GraduationCap" size={20} />
                  <div>
                    <label>Formateur</label>
                    <span>{beneficiaire.formateur}</span>
                  </div>
                </div>
              )}
              {beneficiaire.coach && (
                <div className="intervenant-item">
                  <Icon name="UserCircle" size={20} />
                  <div>
                    <label>Coach</label>
                    <span>{beneficiaire.coach}</span>
                  </div>
                </div>
              )}
              {!beneficiaire.mentor && !beneficiaire.formateur && !beneficiaire.coach && (
                <EmptyState
                  icon="Users"
                  title="Aucun intervenant"
                  message="Aucun intervenant n'est encore assigné à ce bénéficiaire"
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'historique' && (
          <div className="dossier-section">
            <h3>Historique complet</h3>
            {historique ? (
              <div className="historique-timeline">
                {historique.etapes && historique.etapes.map((etape, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <h4>{etape.type}</h4>
                      <p>{etape.description}</p>
                      <span className="timeline-date">
                        {new Date(etape.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="Clock"
                title="Aucun historique"
                message="L'historique de ce bénéficiaire sera disponible ici"
              />
            )}
          </div>
        )}

        {activeTab === 'besoins' && (
          <div className="dossier-section">
            <BesoinsIdentification beneficiaireId={id} />
          </div>
        )}

        {activeTab === 'plan-action' && (
          <div className="dossier-section">
            <PlanAction beneficiaireId={id} planAction={planAction} onUpdate={loadPlanAction} />
          </div>
        )}
      </div>
    </div>
  )
}

