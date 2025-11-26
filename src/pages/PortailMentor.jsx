import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { beneficiairesService } from '../services/beneficiaires.service'
import { toastService } from '../services/toast.service'
import useAuth from '../hooks/useAuth'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import EmptyState from '../components/common/EmptyState'
import LoadingState from '../components/common/LoadingState'
import './PortailMentor.css'

export default function PortailMentor() {
  const navigate = useNavigate()
  const { userId } = useAuth()
  const [beneficiaires, setBeneficiaires] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    statut: ''
  })

  useEffect(() => {
    if (userId) {
      loadBeneficiaires()
    }
  }, [filters, userId])

  const loadBeneficiaires = async () => {
    if (!userId) return
    
    setLoading(true)
    try {
      const mentorId = userId
      const { data, error } = await beneficiairesService.getByIntervenant(mentorId, 'MENTOR')
      if (error) {
        toastService.error('Erreur lors du chargement des bénéficiaires')
        console.error(error)
      } else {
        // Filtrer les données
        let filtered = data || []
        if (filters.statut) {
          filtered = filtered.filter(b => b.statut === filters.statut)
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          filtered = filtered.filter(b => 
            b.nom?.toLowerCase().includes(searchLower) ||
            b.prenom?.toLowerCase().includes(searchLower) ||
            b.email?.toLowerCase().includes(searchLower)
          )
        }
        setBeneficiaires(filtered)
      }
    } catch (error) {
      console.error('Error loading beneficiaires:', error)
      toastService.error('Erreur lors du chargement des bénéficiaires')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingState message="Chargement de vos bénéficiaires..." />
  }

  return (
    <div className="portail-mentor-page">
      <div className="portail-header">
        <div className="portail-header-top">
          <BackButton to="/dashboard" label="Retour au tableau de bord" />
          <div>
            <h1>Portail Mentor</h1>
            <p>Gérez vos bénéficiaires assignés</p>
          </div>
        </div>
      </div>

      <div className="portail-filters">
        <div className="filter-group">
          <label>Recherche</label>
          <input
            type="text"
            placeholder="Rechercher un bénéficiaire..."
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
            <option value="ACTIF">Actif</option>
            <option value="EN_ACCOMPAGNEMENT">En accompagnement</option>
            <option value="TERMINE">Terminé</option>
          </select>
        </div>
      </div>

      <div className="portail-stats">
        <div className="stat-card">
          <Icon name="Users" size={24} />
          <div>
            <div className="stat-value">{beneficiaires.length}</div>
            <div className="stat-label">Bénéficiaires assignés</div>
          </div>
        </div>
        <div className="stat-card">
          <Icon name="CheckCircle2" size={24} />
          <div>
            <div className="stat-value">
              {beneficiaires.filter(b => b.has_plan_action).length}
            </div>
            <div className="stat-label">Avec plan d'action</div>
          </div>
        </div>
      </div>

      {beneficiaires.length === 0 ? (
        <EmptyState
          icon="Users"
          title="Aucun bénéficiaire assigné"
          message="Vous n'avez pas encore de bénéficiaires assignés"
        />
      ) : (
        <div className="portail-beneficiaires-grid">
          {beneficiaires.map((beneficiaire) => (
            <div key={beneficiaire.id} className="beneficiaire-card">
              <div className="beneficiaire-card-header">
                <div>
                  <h3>{beneficiaire.nom} {beneficiaire.prenom}</h3>
                  {beneficiaire.projet_id && (
                    <span className="beneficiaire-projet">
                      Projet: {beneficiaire.projet_id}
                    </span>
                  )}
                </div>
                <button
                  className="btn-icon"
                  onClick={() => navigate(`/beneficiaires/${beneficiaire.id}`)}
                  title="Voir le dossier"
                >
                  <Icon name="Eye" size={18} />
                </button>
              </div>
              <div className="beneficiaire-card-body">
                {beneficiaire.email && (
                  <div className="beneficiaire-info-item">
                    <Icon name="Mail" size={16} />
                    <span>{beneficiaire.email}</span>
                  </div>
                )}
                {beneficiaire.telephone && (
                  <div className="beneficiaire-info-item">
                    <Icon name="Phone" size={16} />
                    <span>{beneficiaire.telephone}</span>
                  </div>
                )}
                {beneficiaire.date_affectation && (
                  <div className="beneficiaire-info-item">
                    <Icon name="Calendar" size={16} />
                    <span>Affecté le {new Date(beneficiaire.date_affectation).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
                {beneficiaire.has_plan_action && (
                  <div className="beneficiaire-badge plan-action">
                    <Icon name="CheckCircle2" size={12} />
                    Plan d'action disponible
                  </div>
                )}
              </div>
              <div className="beneficiaire-card-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/beneficiaires/${beneficiaire.id}`)}
                >
                  <Icon name="ArrowRight" size={18} />
                  Accéder au dossier
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

