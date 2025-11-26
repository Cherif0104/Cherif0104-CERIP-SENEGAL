import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { beneficiairesService } from '../services/beneficiaires.service'
import { projetsService } from '../services/projets.service'
import { toastService } from '../services/toast.service'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import EmptyState from '../components/common/EmptyState'
import LoadingState from '../components/common/LoadingState'
import './Beneficiaires.css'

export default function Beneficiaires() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const projetId = searchParams.get('projet')

  const [beneficiaires, setBeneficiaires] = useState([])
  const [projets, setProjets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    projet: projetId || '',
    intervenant: '',
    statut: '',
    search: ''
  })

  useEffect(() => {
    loadProjets()
    loadBeneficiaires()
  }, [filters])

  const loadProjets = async () => {
    try {
      const { data } = await projetsService.getAll()
      setProjets(data || [])
    } catch (error) {
      console.error('Error loading projets:', error)
    }
  }

  const loadBeneficiaires = async () => {
    setLoading(true)
    try {
      const { data, error } = await beneficiairesService.getAll(filters.projet || null, filters)
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

  const getProjetName = (id) => {
    const projet = projets.find(p => p.id === id)
    return projet?.nom || 'Projet inconnu'
  }

  if (loading) {
    return <LoadingState message="Chargement des bénéficiaires..." />
  }

  return (
    <div className="beneficiaires-page">
      <div className="beneficiaires-header">
        <div className="beneficiaires-header-top">
          <BackButton to="/dashboard" label="Retour au tableau de bord" />
          <h1>Gestion des Bénéficiaires</h1>
        </div>
        <div className="beneficiaires-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/beneficiaires/new')}
          >
            <Icon name="Plus" size={18} />
            Nouveau Bénéficiaire
          </button>
        </div>
      </div>

      <div className="beneficiaires-filters">
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
          <label>Projet</label>
          <select
            value={filters.projet}
            onChange={(e) => {
              setFilters({ ...filters, projet: e.target.value })
              if (e.target.value) {
                navigate(`/beneficiaires?projet=${e.target.value}`)
              } else {
                navigate('/beneficiaires')
              }
            }}
            className="input"
          >
            <option value="">Tous les projets</option>
            {projets.map(p => (
              <option key={p.id} value={p.id}>{p.nom}</option>
            ))}
          </select>
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

      {beneficiaires.length === 0 ? (
        <EmptyState
          icon="Users"
          title="Aucun bénéficiaire"
          message={projetId ? "Ce projet n'a pas encore de bénéficiaires" : "Aucun bénéficiaire trouvé"}
          action={{
            label: "Créer un bénéficiaire",
            onClick: () => navigate('/beneficiaires/new')
          }}
        />
      ) : (
        <div className="beneficiaires-grid">
          {beneficiaires.map((beneficiaire) => (
            <div key={beneficiaire.id} className="beneficiaire-card">
              <div className="beneficiaire-card-header">
                <div className="beneficiaire-card-title">
                  <h3>{beneficiaire.nom} {beneficiaire.prenom}</h3>
                  {beneficiaire.projet_id && (
                    <span className="beneficiaire-projet">
                      {getProjetName(beneficiaire.projet_id)}
                    </span>
                  )}
                </div>
                <div className="beneficiaire-card-actions">
                  <button
                    className="btn-icon"
                    onClick={() => navigate(`/beneficiaires/${beneficiaire.id}`)}
                    title="Voir le dossier"
                  >
                    <Icon name="Eye" size={18} />
                  </button>
                </div>
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
                    Plan d'action
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

