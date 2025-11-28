import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { formationsService } from '../services/formations.service'
import { projetsService } from '../services/projets.service'
import { usersService } from '../services/users.service'
import { toastService } from '../services/toast.service'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import LoadingState from '../components/common/LoadingState'
import EmptyState from '../components/common/EmptyState'
import ConfirmModal from '../components/common/ConfirmModal'
import './FormationDetail.css'

export default function FormationDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [formation, setFormation] = useState(null)
  const [projet, setProjet] = useState(null)
  const [formateur, setFormateur] = useState(null)
  const [sessions, setSessions] = useState([])
  const [inscriptions, setInscriptions] = useState([])
  const [participations, setParticipations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState('infos')

  useEffect(() => {
    loadAll()
  }, [id])

  const loadAll = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadFormation(),
        loadSessions(),
        loadInscriptions(),
        loadParticipations()
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadFormation = async () => {
    try {
      const { data, error } = await formationsService.getById(id)
      if (error) {
        toastService.error('Erreur lors du chargement de la formation')
        navigate('/formations')
      } else {
        setFormation(data)
        
        // Charger le projet si présent
        if (data?.projet_id) {
          const { data: projetData } = await projetsService.getById(data.projet_id)
          setProjet(projetData)
        }
        
        // Charger le formateur si présent
        if (data?.formateur_id) {
          const { data: formateurData } = await usersService.getById(data.formateur_id)
          setFormateur(formateurData)
        }
      }
    } catch (error) {
      console.error('Error loading formation:', error)
      toastService.error('Erreur lors du chargement de la formation')
      navigate('/formations')
    }
  }

  const loadSessions = async () => {
    try {
      const { data } = await formationsService.getSessions(id)
      setSessions(data || [])
    } catch (error) {
      console.error('Error loading sessions:', error)
    }
  }

  const loadInscriptions = async () => {
    try {
      const { data } = await formationsService.getInscriptions(id)
      setInscriptions(data || [])
    } catch (error) {
      console.error('Error loading inscriptions:', error)
    }
  }

  const loadParticipations = async () => {
    try {
      const { data } = await formationsService.getParticipations(id)
      setParticipations(data || [])
    } catch (error) {
      console.error('Error loading participations:', error)
    }
  }

  const handleDelete = async () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    setShowDeleteConfirm(false)
    try {
      const { error } = await formationsService.delete(id)
      if (error) {
        toastService.error('Erreur lors de la suppression')
      } else {
        toastService.success('Formation supprimée avec succès')
        navigate('/formations')
      }
    } catch (error) {
      console.error('Error deleting formation:', error)
      toastService.error('Erreur lors de la suppression')
    }
  }

  const getStatutColor = (statut) => {
    const colors = {
      'OUVERT': 'var(--color-success)',
      'EN_COURS': 'var(--color-primary)',
      'TERMINE': 'var(--color-gray-600)',
      'ANNULE': 'var(--color-danger)'
    }
    return colors[statut] || 'var(--color-gray-500)'
  }

  if (loading) {
    return <LoadingState message="Chargement de la formation..." />
  }

  if (!formation) {
    return (
      <EmptyState
        icon="AlertCircle"
        title="Formation introuvable"
        description="La formation demandée n'existe pas ou a été supprimée"
        action={{
          label: "Retour à la liste",
          onClick: () => navigate('/formations')
        }}
      />
    )
  }

  return (
    <div className="formation-detail-page">
      <div className="formation-detail-header">
        <BackButton to="/formations" label="Retour à la liste" />
        <div className="formation-detail-header-content">
          <div>
            <h1>{formation.nom || 'Formation sans nom'}</h1>
            {projet && (
              <div className="formation-projet-link">
                <Icon name="Briefcase" size={16} />
                <button onClick={() => navigate(`/projets/${projet.id}`)}>
                  {projet.nom}
                </button>
              </div>
            )}
          </div>
          <div className="formation-detail-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/formations/${id}/edit`)}
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

      <div className="formation-detail-tabs">
        <button
          className={`formation-tab ${activeTab === 'infos' ? 'formation-tab--active' : ''}`}
          onClick={() => setActiveTab('infos')}
        >
          <Icon name="Info" size={18} />
          Informations
        </button>
        <button
          className={`formation-tab ${activeTab === 'sessions' ? 'formation-tab--active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          <Icon name="Calendar" size={18} />
          Sessions ({sessions.length})
        </button>
        <button
          className={`formation-tab ${activeTab === 'inscriptions' ? 'formation-tab--active' : ''}`}
          onClick={() => setActiveTab('inscriptions')}
        >
          <Icon name="UserPlus" size={18} />
          Inscriptions ({inscriptions.length})
        </button>
        <button
          className={`formation-tab ${activeTab === 'participations' ? 'formation-tab--active' : ''}`}
          onClick={() => setActiveTab('participations')}
        >
          <Icon name="Users" size={18} />
          Participations ({participations.length})
        </button>
      </div>

      <div className="formation-detail-content">
        {activeTab === 'infos' && (
          <div className="formation-detail-section">
            <div className="formation-info-grid">
              <div className="formation-info-card">
                <h3>Description</h3>
                <p>{formation.description || 'Aucune description disponible'}</p>
              </div>

              <div className="formation-info-card">
                <h3>Statut</h3>
                <span 
                  className="formation-statut-badge"
                  style={{ backgroundColor: getStatutColor(formation.statut) }}
                >
                  {formation.statut?.replace('_', ' ') || 'NON_DEFINI'}
                </span>
              </div>

              {formation.date_debut && (
                <div className="formation-info-card">
                  <h3>Date de début</h3>
                  <p>{new Date(formation.date_debut).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
              )}

              {formation.date_fin && (
                <div className="formation-info-card">
                  <h3>Date de fin</h3>
                  <p>{new Date(formation.date_fin).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
              )}

              {formation.duree_heures && (
                <div className="formation-info-card">
                  <h3>Durée</h3>
                  <p>{formation.duree_heures} heures</p>
                </div>
              )}

              {formation.capacite_max && (
                <div className="formation-info-card">
                  <h3>Capacité maximale</h3>
                  <p>{formation.capacite_max} participants</p>
                </div>
              )}

              {formation.lieu && (
                <div className="formation-info-card">
                  <h3>Lieu</h3>
                  <p>{formation.lieu}</p>
                </div>
              )}

              {formation.modalite && (
                <div className="formation-info-card">
                  <h3>Modalité</h3>
                  <p>{formation.modalite}</p>
                </div>
              )}

              {formation.cout && (
                <div className="formation-info-card">
                  <h3>Coût</h3>
                  <p>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(formation.cout)}</p>
                </div>
              )}

              {formateur && (
                <div className="formation-info-card">
                  <h3>Formateur</h3>
                  <p>{`${formateur.prenom || ''} ${formateur.nom || ''}`.trim() || formateur.email}</p>
                </div>
              )}

              {formation.objectifs && (
                <div className="formation-info-card formation-info-card--full">
                  <h3>Objectifs</h3>
                  <p>{formation.objectifs}</p>
                </div>
              )}

              {formation.programme && (
                <div className="formation-info-card formation-info-card--full">
                  <h3>Programme</h3>
                  <p>{formation.programme}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="formation-detail-section">
            {sessions.length === 0 ? (
              <EmptyState
                icon="Calendar"
                title="Aucune session"
                description="Aucune session n'a été planifiée pour cette formation"
              />
            ) : (
              <div className="sessions-list">
                {sessions.map((session) => (
                  <div key={session.id} className="session-card">
                    <div className="session-card-header">
                      <h4>Session du {new Date(session.date_session).toLocaleDateString('fr-FR')}</h4>
                      {session.heure_debut && session.heure_fin && (
                        <span className="session-heure">
                          {session.heure_debut} - {session.heure_fin}
                        </span>
                      )}
                    </div>
                    {session.lieu && (
                      <div className="session-info">
                        <Icon name="MapPin" size={16} />
                        <span>{session.lieu}</span>
                      </div>
                    )}
                    {session.animateur && (
                      <div className="session-info">
                        <Icon name="User" size={16} />
                        <span>{session.animateur}</span>
                      </div>
                    )}
                    {session.theme && (
                      <div className="session-theme">
                        <strong>Thème:</strong> {session.theme}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'inscriptions' && (
          <div className="formation-detail-section">
            {inscriptions.length === 0 ? (
              <EmptyState
                icon="UserPlus"
                title="Aucune inscription"
                description="Aucune inscription n'a été enregistrée pour cette formation"
              />
            ) : (
              <div className="inscriptions-list">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date inscription</th>
                      <th>Participant</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inscriptions.map((inscription) => (
                      <tr key={inscription.id}>
                        <td>
                          {inscription.date_inscription 
                            ? new Date(inscription.date_inscription).toLocaleDateString('fr-FR')
                            : '-'}
                        </td>
                        <td>
                          {inscription.beneficiaire_id 
                            ? `Bénéficiaire ${inscription.beneficiaire_id.substring(0, 8)}`
                            : inscription.candidat_id
                            ? `Candidat ${inscription.candidat_id.substring(0, 8)}`
                            : '-'}
                        </td>
                        <td>
                          <span className="badge">{inscription.statut || 'EN_ATTENTE'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'participations' && (
          <div className="formation-detail-section">
            {participations.length === 0 ? (
              <EmptyState
                icon="Users"
                title="Aucune participation"
                description="Aucune participation n'a été enregistrée pour cette formation"
              />
            ) : (
              <div className="participations-list">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date participation</th>
                      <th>Participant</th>
                      <th>Présence</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participations.map((participation) => (
                      <tr key={participation.id}>
                        <td>
                          {participation.date_participation 
                            ? new Date(participation.date_participation).toLocaleDateString('fr-FR')
                            : '-'}
                        </td>
                        <td>
                          {participation.beneficiaire_id 
                            ? `Bénéficiaire ${participation.beneficiaire_id.substring(0, 8)}`
                            : participation.candidat_id
                            ? `Candidat ${participation.candidat_id.substring(0, 8)}`
                            : '-'}
                        </td>
                        <td>
                          <span className={`badge ${participation.present ? 'badge--success' : 'badge--danger'}`}>
                            {participation.present ? 'Présent' : 'Absent'}
                          </span>
                        </td>
                        <td>{participation.note || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        open={showDeleteConfirm}
        title="Supprimer la formation"
        description="Êtes-vous sûr de vouloir supprimer cette formation ? Cette action est irréversible."
        variant="danger"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}

