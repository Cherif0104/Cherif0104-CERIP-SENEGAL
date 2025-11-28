import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { mentorsService } from '../services/mentors.service'
import { projetsService } from '../services/projets.service'
import { beneficiairesService } from '../services/beneficiaires.service'
import { toastService } from '../services/toast.service'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import LoadingState from '../components/common/LoadingState'
import EmptyState from '../components/common/EmptyState'
import ConfirmModal from '../components/common/ConfirmModal'
import './MentorDetail.css'

export default function MentorDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [mentor, setMentor] = useState(null)
  const [assignations, setAssignations] = useState([])
  const [accompagnements, setAccompagnements] = useState([])
  const [projets, setProjets] = useState([])
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
        loadMentor(),
        loadAssignations(),
        loadAccompagnements(),
        loadProjets()
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadMentor = async () => {
    try {
      const { data, error } = await mentorsService.getById(id)
      if (error) {
        toastService.error('Erreur lors du chargement du mentor')
        navigate('/mentors')
      } else {
        setMentor(data)
      }
    } catch (error) {
      console.error('Error loading mentor:', error)
      toastService.error('Erreur lors du chargement du mentor')
      navigate('/mentors')
    }
  }

  const loadAssignations = async () => {
    try {
      const { data } = await mentorsService.getAssignations(id)
      setAssignations(data || [])
    } catch (error) {
      console.error('Error loading assignations:', error)
    }
  }

  const loadAccompagnements = async () => {
    try {
      const { data } = await mentorsService.getAccompagnements(id)
      setAccompagnements(data || [])
    } catch (error) {
      console.error('Error loading accompagnements:', error)
    }
  }

  const loadProjets = async () => {
    try {
      const { data } = await projetsService.getAll()
      setProjets(data || [])
    } catch (error) {
      console.error('Error loading projets:', error)
    }
  }

  const handleDelete = async () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    setShowDeleteConfirm(false)
    try {
      const { error } = await mentorsService.delete(id)
      if (error) {
        toastService.error('Erreur lors de la suppression')
      } else {
        toastService.success('Mentor supprimé avec succès')
        navigate('/mentors')
      }
    } catch (error) {
      console.error('Error deleting mentor:', error)
      toastService.error('Erreur lors de la suppression')
    }
  }

  const getStatutColor = (statut) => {
    const colors = {
      'ACTIF': 'var(--color-success)',
      'INACTIF': 'var(--color-gray-500)',
      'SUSPENDU': 'var(--color-danger)'
    }
    return colors[statut] || 'var(--color-gray-500)'
  }

  const getProjetName = (projetId) => {
    const projet = projets.find(p => p.id === projetId)
    return projet?.nom || 'Projet inconnu'
  }

  if (loading) {
    return <LoadingState message="Chargement du mentor..." />
  }

  if (!mentor) {
    return (
      <EmptyState
        icon="AlertCircle"
        title="Mentor introuvable"
        description="Le mentor demandé n'existe pas ou a été supprimé"
        action={{
          label: "Retour à la liste",
          onClick: () => navigate('/mentors')
        }}
      />
    )
  }

  return (
    <div className="mentor-detail-page">
      <div className="mentor-detail-header">
        <BackButton to="/mentors" label="Retour à la liste" />
        <div className="mentor-detail-header-content">
          <div>
            <h1>{`${mentor.prenom || ''} ${mentor.nom || ''}`.trim() || 'Mentor sans nom'}</h1>
          </div>
          <div className="mentor-detail-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/mentors/${id}/edit`)}
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

      <div className="mentor-detail-tabs">
        <button
          className={`mentor-tab ${activeTab === 'infos' ? 'mentor-tab--active' : ''}`}
          onClick={() => setActiveTab('infos')}
        >
          <Icon name="Info" size={18} />
          Informations
        </button>
        <button
          className={`mentor-tab ${activeTab === 'assignations' ? 'mentor-tab--active' : ''}`}
          onClick={() => setActiveTab('assignations')}
        >
          <Icon name="UserCheck" size={18} />
          Assignations ({assignations.length})
        </button>
        <button
          className={`mentor-tab ${activeTab === 'accompagnements' ? 'mentor-tab--active' : ''}`}
          onClick={() => setActiveTab('accompagnements')}
        >
          <Icon name="Users" size={18} />
          Accompagnements ({accompagnements.length})
        </button>
      </div>

      <div className="mentor-detail-content">
        {activeTab === 'infos' && (
          <div className="mentor-detail-section">
            <div className="mentor-info-grid">
              <div className="mentor-info-card">
                <h3>Statut</h3>
                <span 
                  className="mentor-statut-badge"
                  style={{ backgroundColor: getStatutColor(mentor.statut) }}
                >
                  {mentor.statut || 'NON_DEFINI'}
                </span>
              </div>

              {mentor.email && (
                <div className="mentor-info-card">
                  <h3>Email</h3>
                  <p>{mentor.email}</p>
                </div>
              )}

              {mentor.telephone && (
                <div className="mentor-info-card">
                  <h3>Téléphone</h3>
                  <p>{mentor.telephone}</p>
                </div>
              )}

              {mentor.specialite && (
                <div className="mentor-info-card">
                  <h3>Spécialité</h3>
                  <p>{mentor.specialite}</p>
                </div>
              )}

              {mentor.experience_annees && (
                <div className="mentor-info-card">
                  <h3>Expérience</h3>
                  <p>{mentor.experience_annees} ans</p>
                </div>
              )}

              {mentor.capacite_max && (
                <div className="mentor-info-card">
                  <h3>Capacité maximale</h3>
                  <p>{mentor.capacite_max} bénéficiaires</p>
                </div>
              )}

              {mentor.bio && (
                <div className="mentor-info-card mentor-info-card--full">
                  <h3>Biographie</h3>
                  <p>{mentor.bio}</p>
                </div>
              )}

              {mentor.competences && mentor.competences.length > 0 && (
                <div className="mentor-info-card mentor-info-card--full">
                  <h3>Compétences</h3>
                  <div className="mentor-competences-list">
                    {mentor.competences.map((comp, index) => (
                      <span key={index} className="mentor-competence-tag">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {mentor.certifications && mentor.certifications.length > 0 && (
                <div className="mentor-info-card mentor-info-card--full">
                  <h3>Certifications</h3>
                  <ul className="mentor-certifications-list">
                    {mentor.certifications.map((cert, index) => (
                      <li key={index}>{cert}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'assignations' && (
          <div className="mentor-detail-section">
            {assignations.length === 0 ? (
              <EmptyState
                icon="UserCheck"
                title="Aucune assignation"
                description="Ce mentor n'a aucune assignation pour le moment"
              />
            ) : (
              <div className="assignations-list">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date assignation</th>
                      <th>Projet</th>
                      <th>Bénéficiaire</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignations.map((assignation) => (
                      <tr key={assignation.id}>
                        <td>
                          {assignation.date_assignation 
                            ? new Date(assignation.date_assignation).toLocaleDateString('fr-FR')
                            : '-'}
                        </td>
                        <td>
                          {assignation.projet_id ? (
                            <button 
                              onClick={() => navigate(`/projets/${assignation.projet_id}`)}
                              className="link-button"
                            >
                              {getProjetName(assignation.projet_id)}
                            </button>
                          ) : '-'}
                        </td>
                        <td>
                          {assignation.beneficiaire_id 
                            ? `Bénéficiaire ${assignation.beneficiaire_id.substring(0, 8)}`
                            : '-'}
                        </td>
                        <td>
                          <span className="badge">{assignation.statut || 'ACTIF'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'accompagnements' && (
          <div className="mentor-detail-section">
            {accompagnements.length === 0 ? (
              <EmptyState
                icon="Users"
                title="Aucun accompagnement"
                description="Ce mentor n'a aucun accompagnement en cours"
              />
            ) : (
              <div className="accompagnements-list">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date début</th>
                      <th>Date fin</th>
                      <th>Bénéficiaire</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accompagnements.map((accompagnement) => (
                      <tr key={accompagnement.id}>
                        <td>
                          {accompagnement.date_debut 
                            ? new Date(accompagnement.date_debut).toLocaleDateString('fr-FR')
                            : '-'}
                        </td>
                        <td>
                          {accompagnement.date_fin 
                            ? new Date(accompagnement.date_fin).toLocaleDateString('fr-FR')
                            : 'En cours'}
                        </td>
                        <td>
                          {accompagnement.beneficiaire_id ? (
                            <button 
                              onClick={() => navigate(`/beneficiaires/${accompagnement.beneficiaire_id}`)}
                              className="link-button"
                            >
                              Bénéficiaire {accompagnement.beneficiaire_id.substring(0, 8)}
                            </button>
                          ) : '-'}
                        </td>
                        <td>
                          <span className="badge">{accompagnement.statut || 'EN_COURS'}</span>
                        </td>
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
        title="Supprimer le mentor"
        description="Êtes-vous sûr de vouloir supprimer ce mentor ? Cette action est irréversible."
        variant="danger"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}
