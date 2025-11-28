import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { mentorsService } from '../services/mentors.service'
import { projetsService } from '../services/projets.service'
import { toastService } from '../services/toast.service'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import EmptyState from '../components/common/EmptyState'
import LoadingState from '../components/common/LoadingState'
import ConfirmModal from '../components/common/ConfirmModal'
import './Mentors.css'

export default function Mentors() {
  const navigate = useNavigate()
  const [allMentors, setAllMentors] = useState([])
  const [mentors, setMentors] = useState([])
  const [projets, setProjets] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null })
  const [filters, setFilters] = useState({
    statut: '',
    projet_id: '',
    search: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, allMentors])

  const loadData = async () => {
    setLoading(true)
    try {
      const [mentorsRes, projetsRes] = await Promise.all([
        mentorsService.getAll(),
        projetsService.getAll()
      ])

      if (mentorsRes.error) {
        toastService.error('Erreur lors du chargement des mentors')
        console.error(mentorsRes.error)
      } else {
        setAllMentors(mentorsRes.data || [])
        applyFilters(mentorsRes.data || [], filters)
      }

      if (!projetsRes.error) setProjets(projetsRes.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toastService.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (source = allMentors, currentFilters = filters) => {
    let filtered = source

    if (currentFilters.statut) {
      filtered = filtered.filter(m => m.statut === currentFilters.statut)
    }
    if (currentFilters.search) {
      const searchLower = currentFilters.search.toLowerCase()
      filtered = filtered.filter(m =>
        m.nom?.toLowerCase().includes(searchLower) ||
        m.prenom?.toLowerCase().includes(searchLower) ||
        m.email?.toLowerCase().includes(searchLower) ||
        m.specialite?.toLowerCase().includes(searchLower)
      )
    }

    setMentors(filtered)
  }

  const handleDelete = async (id) => {
    setDeleteConfirm({ open: true, id })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return
    try {
      const { error } = await mentorsService.delete(deleteConfirm.id)
      if (error) {
        toastService.error('Erreur lors de la suppression')
      } else {
        toastService.success('Mentor supprimé avec succès')
        loadData()
      }
    } catch (error) {
      console.error('Error deleting mentor:', error)
      toastService.error('Erreur lors de la suppression')
    } finally {
      setDeleteConfirm({ open: false, id: null })
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

  const STATUTS = ['ACTIF', 'INACTIF', 'SUSPENDU']

  if (loading) {
    return <LoadingState message="Chargement des mentors..." />
  }

  return (
    <div className="mentors-page">
      <div className="mentors-header">
        <div className="mentors-header-top">
          <BackButton to="/dashboard" label="Retour au tableau de bord" />
          <h1>Gestion des Mentors</h1>
        </div>
        <div className="mentors-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/mentors/new')}
          >
            <Icon name="Plus" size={18} />
            Nouveau Mentor
          </button>
        </div>
      </div>

      <div className="mentors-filters">
        <div className="filter-group">
          <label>Recherche</label>
          <input
            type="text"
            placeholder="Rechercher un mentor..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="input"
          />
        </div>
        <div className="filter-group">
          <label>Statut</label>
          <select
            value={filters.statut}
            onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
            className="input"
          >
            <option value="">Tous</option>
            {STATUTS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {mentors.length === 0 ? (
        <EmptyState
          icon="Handshake"
          title="Aucun mentor"
          description="Commencez par créer votre premier mentor"
          action={{
            label: "Créer un mentor",
            onClick: () => navigate('/mentors/new')
          }}
        />
      ) : (
        <>
          <div className="mentors-grid">
            {mentors.map((mentor) => (
              <div key={mentor.id} className="mentor-card">
                <div className="mentor-card-header">
                  <div className="mentor-card-title">
                    <h3>{`${mentor.prenom || ''} ${mentor.nom || ''}`.trim() || 'Mentor sans nom'}</h3>
                    <span 
                      className="mentor-statut"
                      style={{ backgroundColor: getStatutColor(mentor.statut) }}
                    >
                      {mentor.statut || 'NON_DEFINI'}
                    </span>
                  </div>
                  <div className="mentor-card-actions">
                    <button
                      className="btn-icon"
                      onClick={() => navigate(`/mentors/${mentor.id}`)}
                      title="Voir les détails"
                    >
                      <Icon name="Eye" size={18} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => navigate(`/mentors/${mentor.id}/edit`)}
                      title="Modifier"
                    >
                      <Icon name="Edit" size={18} />
                    </button>
                    <button
                      className="btn-icon btn-icon--danger"
                      onClick={() => handleDelete(mentor.id)}
                      title="Supprimer"
                    >
                      <Icon name="Trash2" size={18} />
                    </button>
                  </div>
                </div>
                <div className="mentor-card-body">
                  {mentor.specialite && (
                    <div className="mentor-info-item">
                      <Icon name="Briefcase" size={16} />
                      <span>{mentor.specialite}</span>
                    </div>
                  )}
                  {mentor.email && (
                    <div className="mentor-info-item">
                      <Icon name="Mail" size={16} />
                      <span>{mentor.email}</span>
                    </div>
                  )}
                  {mentor.telephone && (
                    <div className="mentor-info-item">
                      <Icon name="Phone" size={16} />
                      <span>{mentor.telephone}</span>
                    </div>
                  )}
                  {mentor.experience_annees && (
                    <div className="mentor-info-item">
                      <Icon name="Award" size={16} />
                      <span>{mentor.experience_annees} ans d'expérience</span>
                    </div>
                  )}
                  {mentor.capacite_max && (
                    <div className="mentor-capacite">
                      <strong>Capacité:</strong> {mentor.capacite_max} bénéficiaires
                    </div>
                  )}
                  {mentor.competences && mentor.competences.length > 0 && (
                    <div className="mentor-competences">
                      <strong>Compétences:</strong> {mentor.competences.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <ConfirmModal
            open={deleteConfirm.open}
            title="Supprimer le mentor"
            description="Êtes-vous sûr de vouloir supprimer ce mentor ? Cette action est irréversible."
            variant="danger"
            confirmLabel="Supprimer"
            cancelLabel="Annuler"
            onConfirm={confirmDelete}
            onCancel={() => setDeleteConfirm({ open: false, id: null })}
          />
        </>
      )}
    </div>
  )
}
