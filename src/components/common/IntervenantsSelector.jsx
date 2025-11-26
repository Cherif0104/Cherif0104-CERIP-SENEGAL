import { useState, useEffect } from 'react'
import { usersService } from '../../services/users.service'
import Icon from './Icon'
import LoadingState from './LoadingState'
import './IntervenantsSelector.css'

export default function IntervenantsSelector({
  label = 'Assignation des intervenants',
  chefProjetId,
  mentorsIds = [],
  formateursIds = [],
  coachesIds = [],
  onChefProjetChange,
  onMentorsChange,
  onFormateursChange,
  onCoachesChange,
  required = false
}) {
  const [loading, setLoading] = useState(true)
  const [chefsProjet, setChefsProjet] = useState([])
  const [intervenants, setIntervenants] = useState([])
  const [selectedChefProjet, setSelectedChefProjet] = useState(chefProjetId || '')
  const [selectedMentors, setSelectedMentors] = useState(mentorsIds || [])
  const [selectedFormateurs, setSelectedFormateurs] = useState(formateursIds || [])
  const [selectedCoaches, setSelectedCoaches] = useState(coachesIds || [])

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    setSelectedChefProjet(chefProjetId || '')
  }, [chefProjetId])

  useEffect(() => {
    setSelectedMentors(mentorsIds || [])
  }, [mentorsIds])

  useEffect(() => {
    setSelectedFormateurs(formateursIds || [])
  }, [formateursIds])

  useEffect(() => {
    setSelectedCoaches(coachesIds || [])
  }, [coachesIds])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const [chefsRes, intervenantsRes] = await Promise.all([
        usersService.getChefsProjet(),
        usersService.getIntervenants()
      ])

      if (!chefsRes.error) setChefsProjet(chefsRes.data || [])
      if (!intervenantsRes.error) setIntervenants(intervenantsRes.data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChefProjetChange = (e) => {
    const value = e.target.value
    setSelectedChefProjet(value)
    if (onChefProjetChange) {
      onChefProjetChange({ target: { name: 'chef_projet_id', value } })
    }
  }

  const handleMentorsChange = (e) => {
    const values = Array.from(e.target.selectedOptions, opt => opt.value)
    setSelectedMentors(values)
    if (onMentorsChange) {
      onMentorsChange({ target: { name: 'mentors_ids', value: values } })
    }
  }

  const handleFormateursChange = (e) => {
    const values = Array.from(e.target.selectedOptions, opt => opt.value)
    setSelectedFormateurs(values)
    if (onFormateursChange) {
      onFormateursChange({ target: { name: 'formateurs_ids', value: values } })
    }
  }

  const handleCoachesChange = (e) => {
    const values = Array.from(e.target.selectedOptions, opt => opt.value)
    setSelectedCoaches(values)
    if (onCoachesChange) {
      onCoachesChange({ target: { name: 'coaches_ids', value: values } })
    }
  }

  const getIntervenantsByRole = (role) => {
    return intervenants.filter(i => i.role === role)
  }

  const getUserName = (userId) => {
    const user = [...chefsProjet, ...intervenants].find(u => u.id === userId)
    return user ? `${user.nom} ${user.prenom}` : userId
  }

  if (loading) {
    return <LoadingState message="Chargement des intervenants..." />
  }

  return (
    <div className="intervenants-selector">
      <div className="intervenants-selector-header">
        <label>
          {label} {required && <span className="required">*</span>}
        </label>
        <p className="intervenants-selector-description">
          Assignez un chef de projet et des intervenants (mentors, formateurs, coaches) à ce projet
        </p>
      </div>

      <div className="intervenants-selector-content">
        {/* Chef de projet */}
        <div className="intervenants-group">
          <label htmlFor="chef_projet_id">
            <Icon name="UserCheck" size={16} />
            Chef de projet
          </label>
          <select
            id="chef_projet_id"
            name="chef_projet_id"
            value={selectedChefProjet}
            onChange={handleChefProjetChange}
            className="input"
          >
            <option value="">Sélectionner un chef de projet</option>
            {chefsProjet.map(chef => (
              <option key={chef.id} value={chef.id}>
                {chef.nom} {chef.prenom} ({chef.email})
              </option>
            ))}
          </select>
          {selectedChefProjet && (
            <div className="selected-user-badge">
              <Icon name="CheckCircle" size={14} />
              <span>{getUserName(selectedChefProjet)}</span>
            </div>
          )}
        </div>

        {/* Mentors */}
        <div className="intervenants-group">
          <label htmlFor="mentors_ids">
            <Icon name="Handshake" size={16} />
            Mentors
          </label>
          <select
            id="mentors_ids"
            name="mentors_ids"
            multiple
            value={selectedMentors}
            onChange={handleMentorsChange}
            className="input"
            size={Math.min(5, getIntervenantsByRole('MENTOR').length + 1)}
          >
            {getIntervenantsByRole('MENTOR').map(mentor => (
              <option key={mentor.id} value={mentor.id}>
                {mentor.nom} {mentor.prenom} ({mentor.email})
              </option>
            ))}
          </select>
          {selectedMentors.length > 0 && (
            <div className="selected-users-list">
              {selectedMentors.map(id => (
                <span key={id} className="selected-user-badge">
                  <Icon name="Handshake" size={12} />
                  {getUserName(id)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Formateurs */}
        <div className="intervenants-group">
          <label htmlFor="formateurs_ids">
            <Icon name="GraduationCap" size={16} />
            Formateurs
          </label>
          <select
            id="formateurs_ids"
            name="formateurs_ids"
            multiple
            value={selectedFormateurs}
            onChange={handleFormateursChange}
            className="input"
            size={Math.min(5, getIntervenantsByRole('FORMATEUR').length + 1)}
          >
            {getIntervenantsByRole('FORMATEUR').map(formateur => (
              <option key={formateur.id} value={formateur.id}>
                {formateur.nom} {formateur.prenom} ({formateur.email})
              </option>
            ))}
          </select>
          {selectedFormateurs.length > 0 && (
            <div className="selected-users-list">
              {selectedFormateurs.map(id => (
                <span key={id} className="selected-user-badge">
                  <Icon name="GraduationCap" size={12} />
                  {getUserName(id)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Coaches */}
        <div className="intervenants-group">
          <label htmlFor="coaches_ids">
            <Icon name="UserCircle" size={16} />
            Coaches
          </label>
          <select
            id="coaches_ids"
            name="coaches_ids"
            multiple
            value={selectedCoaches}
            onChange={handleCoachesChange}
            className="input"
            size={Math.min(5, getIntervenantsByRole('COACH').length + 1)}
          >
            {getIntervenantsByRole('COACH').map(coach => (
              <option key={coach.id} value={coach.id}>
                {coach.nom} {coach.prenom} ({coach.email})
              </option>
            ))}
          </select>
          {selectedCoaches.length > 0 && (
            <div className="selected-users-list">
              {selectedCoaches.map(id => (
                <span key={id} className="selected-user-badge">
                  <Icon name="UserCircle" size={12} />
                  {getUserName(id)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

