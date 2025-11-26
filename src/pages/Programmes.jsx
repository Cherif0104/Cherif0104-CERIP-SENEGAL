import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { programmesService } from '../services/programmes.service'
import { projetsService } from '../services/projets.service'
import { candidatsService } from '../services/candidats.service'
import { beneficiairesService } from '../services/beneficiaires.service'
import { toastService } from '../services/toast.service'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import EmptyState from '../components/common/EmptyState'
import LoadingState from '../components/common/LoadingState'
import ConfirmModal from '../components/common/ConfirmModal'
import './Programmes.css'

export default function Programmes() {
  const navigate = useNavigate()
  const [programmes, setProgrammes] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null })
  const [filters, setFilters] = useState({
    financeur: '',
    statut: '',
    search: ''
  })

  useEffect(() => {
    loadProgrammes()
  }, [filters])

  const loadProgrammes = async () => {
    setLoading(true)
    try {
      const { data, error } = await programmesService.getAll()
      if (error) {
        toastService.error('Erreur lors du chargement des programmes')
        console.error(error)
      } else {
        let enriched = data || []

        // Calcul léger des métriques par programme (projets, candidats, bénéficiaires)
        // Pour rester simple, on ne fait pas de jointures complexes ici.
        // On charge les projets, candidats et bénéficiaires puis on agrège côté front.
        const [
          projetsResult,
          candidatsResult,
          beneficiairesResult
        ] = await Promise.all([
          projetsService.getAll(),
          candidatsService.getAll(),
          beneficiairesService.getAll()
        ])

        const projets = projetsResult.data || []
        const candidats = candidatsResult.data || []
        const beneficiaires = beneficiairesResult.data || []

        enriched = enriched.map(p => {
          const projetsProgramme = projets.filter(pr => pr.programme_id === p.id)
          const appelsProgrammeIds = projetsProgramme.map(pr => pr.id)
          const candidatsProgramme = candidats.filter(c => appelsProgrammeIds.includes(c.projet_id))
          const benefProgramme = beneficiaires.filter(b => b.programme_id === p.id || projetsProgramme.some(pr => pr.id === b.projet_id))

          return {
            ...p,
            _stats: {
              projets: projetsProgramme.length,
              candidats: candidatsProgramme.length,
              beneficiaires: benefProgramme.length
            }
          }
        })

        // Filtrer les données
        let filtered = enriched
        if (filters.financeur) {
          filtered = filtered.filter(p => p.financeur === filters.financeur)
        }
        if (filters.statut) {
          filtered = filtered.filter(p => p.statut === filters.statut)
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          filtered = filtered.filter(p => 
            p.nom?.toLowerCase().includes(searchLower) ||
            p.description?.toLowerCase().includes(searchLower)
          )
        }
        setProgrammes(filtered)
      }
    } catch (error) {
      console.error('Error loading programmes:', error)
      toastService.error('Erreur lors du chargement des programmes')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    setDeleteConfirm({ open: true, id })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return
    try {
      const { error } = await programmesService.delete(deleteConfirm.id)
      if (error) {
        toastService.error('Erreur lors de la suppression')
      } else {
        toastService.success('Programme supprimé avec succès')
        loadProgrammes()
      }
    } catch (error) {
      console.error('Error deleting programme:', error)
      toastService.error('Erreur lors de la suppression')
    } finally {
      setDeleteConfirm({ open: false, id: null })
    }
  }

  const FINANCEURS = ['Enabel', 'GIZ', 'USAID', 'UNICEF', 'Gouvernement Sénégalais', 'Autre']
  const STATUTS = ['ACTIF', 'EN_PREPARATION', 'TERMINE', 'SUSPENDU']

  if (loading) {
    return <LoadingState message="Chargement des programmes..." />
  }

  return (
    <div className="programmes-page">
      <div className="programmes-header">
        <div className="programmes-header-top">
          <BackButton to="/dashboard" label="Retour au tableau de bord" />
          <h1>Gestion des Programmes</h1>
        </div>
        <div className="programmes-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/programmes/new')}
          >
            <Icon name="Plus" size={18} />
            Nouveau Programme
          </button>
        </div>
      </div>

      <div className="programmes-filters">
        <div className="filter-group">
          <label>Recherche</label>
          <input
            type="text"
            placeholder="Rechercher un programme..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="input"
          />
        </div>
        <div className="filter-group">
          <label>Financeur</label>
          <select
            value={filters.financeur}
            onChange={(e) => setFilters({ ...filters, financeur: e.target.value })}
            className="input"
          >
            <option value="">Tous</option>
            {FINANCEURS.map(f => (
              <option key={f} value={f}>{f}</option>
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
            {STATUTS.map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {programmes.length === 0 ? (
        <EmptyState
          icon="ClipboardList"
          title="Aucun programme"
          description="Commencez par créer votre premier programme"
          action={{
            label: "Créer un programme",
            onClick: () => navigate('/programmes/new')
          }}
        />
      ) : (
        <>
          <div className="programmes-grid">
            {programmes.map((programme) => (
              <div key={programme.id} className="programme-card">
                <div className="programme-card-header">
                  <div className="programme-card-title">
                    <h3>{programme.nom || 'Programme sans nom'}</h3>
                    <span className={`programme-statut programme-statut--${programme.statut?.toLowerCase()}`}>
                      {programme.statut?.replace('_', ' ') || 'NON_DEFINI'}
                    </span>
                  </div>
                  <div className="programme-card-actions">
                    <button
                      className="btn-icon"
                      onClick={() => navigate(`/programmes/${programme.id}`)}
                      title="Voir les détails"
                    >
                      <Icon name="Eye" size={18} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => navigate(`/programmes/${programme.id}/edit`)}
                      title="Modifier"
                    >
                      <Icon name="Edit" size={18} />
                    </button>
                    <button
                      className="btn-icon btn-icon--danger"
                      onClick={() => handleDelete(programme.id)}
                      title="Supprimer"
                    >
                      <Icon name="Trash2" size={18} />
                    </button>
                  </div>
                </div>
                <div className="programme-card-body">
                  <p className="programme-description">
                    {programme.description || 'Aucune description'}
                  </p>
                  <div className="programme-info">
                    <div className="programme-info-item">
                      <Icon name="DollarSign" size={16} />
                      <span>{programme.financeur || 'Non spécifié'}</span>
                    </div>
                    <div className="programme-info-item">
                      <Icon name="Calendar" size={16} />
                      <span>
                        {programme.date_debut ? new Date(programme.date_debut).toLocaleDateString('fr-FR') : 'Non définie'} - 
                        {programme.date_fin ? new Date(programme.date_fin).toLocaleDateString('fr-FR') : 'Non définie'}
                      </span>
                    </div>
                    {programme.chef_projet && (
                      <div className="programme-info-item">
                        <Icon name="User" size={16} />
                        <span>{programme.chef_projet}</span>
                      </div>
                    )}
                  </div>
                  {programme.budget && (
                    <div className="programme-budget">
                      <strong>Budget:</strong> {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(programme.budget)}
                    </div>
                  )}
                  {programme._stats && (
                    <div className="programme-stats-row">
                      <div className="programme-stats-item">
                        <Icon name="Briefcase" size={14} />
                        <span>{programme._stats.projets} projet(s)</span>
                      </div>
                      <div className="programme-stats-item">
                        <Icon name="Sparkles" size={14} />
                        <span>{programme._stats.candidats} candidat(s)</span>
                      </div>
                      <div className="programme-stats-item">
                        <Icon name="Users" size={14} />
                        <span>{programme._stats.beneficiaires} bénéficiaire(s)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <ConfirmModal
            open={deleteConfirm.open}
            title="Supprimer le programme"
            description="Êtes-vous sûr de vouloir supprimer ce programme ? Cette action est irréversible."
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

