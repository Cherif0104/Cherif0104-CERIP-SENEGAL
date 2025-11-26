import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { appelsService } from '../services/appels.service'
import { projetsService } from '../services/projets.service'
import { supabase } from '../lib/supabase'
import { toastService } from '../services/toast.service'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import EmptyState from '../components/common/EmptyState'
import LoadingState from '../components/common/LoadingState'
import ConfirmModal from '../components/common/ConfirmModal'
import './AppelsCandidatures.css'

export default function AppelsCandidatures() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const projetId = searchParams.get('projet')

  const [appels, setAppels] = useState([])
  const [projets, setProjets] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null })
  const [closeConfirm, setCloseConfirm] = useState({ open: false, id: null })
  const [filters, setFilters] = useState({
    projet: projetId || '',
    statut: '',
    search: ''
  })

  useEffect(() => {
    loadProjets()
    loadAppels()
  }, [filters])

  const loadProjets = async () => {
    try {
      const { data } = await projetsService.getAll()
      setProjets(data || [])
    } catch (error) {
      console.error('Error loading projets:', error)
    }
  }

  const loadAppels = async () => {
    setLoading(true)
    try {
      const { data, error } = await appelsService.getAll(filters.projet || null)
      if (error) {
        toastService.error('Erreur lors du chargement des appels à candidatures')
        console.error(error)
      } else {
        // Filtrer les données
        let filtered = data || []
        if (filters.statut) {
          filtered = filtered.filter(a => a.statut === filters.statut)
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          filtered = filtered.filter(a => 
            a.titre?.toLowerCase().includes(searchLower) ||
            a.description?.toLowerCase().includes(searchLower)
          )
        }

        // Enrichir avec les métriques (nb candidats)
        const enriched = await Promise.all(
          filtered.map(async (appel) => {
            const { count } = await supabase
              .from('candidats')
              .select('*', { count: 'exact', head: true })
              .eq('appel_id', appel.id)

            return {
              ...appel,
              nb_candidats: count || 0
            }
          })
        )

        setAppels(enriched)
      }
    } catch (error) {
      console.error('Error loading appels:', error)
      toastService.error('Erreur lors du chargement des appels à candidatures')
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
      const { error } = await appelsService.delete(deleteConfirm.id)
      if (error) {
        toastService.error('Erreur lors de la suppression')
      } else {
        toastService.success('Appel à candidatures supprimé avec succès')
        loadAppels()
      }
    } catch (error) {
      console.error('Error deleting appel:', error)
      toastService.error('Erreur lors de la suppression')
    } finally {
      setDeleteConfirm({ open: false, id: null })
    }
  }

  const handleClose = async (id) => {
    setCloseConfirm({ open: true, id })
  }

  const confirmClose = async () => {
    if (!closeConfirm.id) return
    try {
      const { error } = await appelsService.close(closeConfirm.id)
      if (error) {
        toastService.error('Erreur lors de la clôture')
      } else {
        toastService.success('Appel à candidatures clôturé avec succès')
        loadAppels()
      }
    } catch (error) {
      console.error('Error closing appel:', error)
      toastService.error('Erreur lors de la clôture')
    }
  }

  const getProjetName = (id) => {
    const projet = projets.find(p => p.id === id)
    return projet?.nom || 'Projet inconnu'
  }

  const getStatutBadge = (statut) => {
    const badges = {
      'OUVERT': 'statut-ouvert',
      'FERME': 'statut-ferme',
      'CLOTURE': 'statut-cloture'
    }
    return badges[statut] || 'statut-default'
  }

  if (loading) {
    return <LoadingState message="Chargement des appels à candidatures..." />
  }

  return (
    <div className="appels-page">
      <div className="appels-header">
        <div className="appels-header-top">
          <BackButton to="/dashboard" label="Retour au tableau de bord" />
          <h1>Gestion des Appels à Candidatures</h1>
        </div>
        <div className="appels-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/appels-candidatures/new${projetId ? `?projet=${projetId}` : ''}`)}
          >
            <Icon name="Plus" size={18} />
            Nouvel Appel
          </button>
        </div>
      </div>

      <div className="appels-filters">
        <div className="filter-group">
          <label>Recherche</label>
          <input
            type="text"
            placeholder="Rechercher un appel..."
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
                navigate(`/appels-candidatures?projet=${e.target.value}`)
              } else {
                navigate('/appels-candidatures')
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
            <option value="OUVERT">Ouvert</option>
            <option value="FERME">Fermé</option>
            <option value="CLOTURE">Clôturé</option>
          </select>
        </div>
      </div>

      {appels.length === 0 ? (
        <EmptyState
          icon="Bell"
          title="Aucun appel à candidatures"
          message={projetId ? "Ce projet n'a pas encore d'appels à candidatures" : "Commencez par créer votre premier appel à candidatures"}
          action={{
            label: "Créer un appel",
            onClick: () => navigate(`/appels-candidatures/new${projetId ? `?projet=${projetId}` : ''}`)
          }}
        />
      ) : (
        <div className="appels-grid">
          {appels.map((appel) => (
            <div key={appel.id} className="appel-card">
              <div className="appel-card-header">
                <div className="appel-card-title">
                  <h3>{appel.titre || 'Appel sans titre'}</h3>
                  <span className={`appel-statut ${getStatutBadge(appel.statut)}`}>
                    {appel.statut || 'NON_DEFINI'}
                  </span>
                </div>
                <div className="appel-card-actions">
                  <button
                    className="btn-icon"
                    onClick={() => navigate(`/appels-candidatures/${appel.id}`)}
                    title="Voir les détails"
                  >
                    <Icon name="Eye" size={18} />
                  </button>
                  {appel.statut === 'OUVERT' && (
                    <>
                      <button
                        className="btn-icon"
                        onClick={() => navigate(`/appels-candidatures/${appel.id}/edit`)}
                        title="Modifier"
                      >
                        <Icon name="Edit" size={18} />
                      </button>
                      <button
                        className="btn-icon btn-icon--warning"
                        onClick={() => handleClose(appel.id)}
                        title="Clôturer"
                      >
                        <Icon name="X" size={18} />
                      </button>
                    </>
                  )}
                  <button
                    className="btn-icon btn-icon--danger"
                    onClick={() => handleDelete(appel.id)}
                    title="Supprimer"
                  >
                    <Icon name="Trash2" size={18} />
                  </button>
                </div>
              </div>
              <div className="appel-card-body">
                <p className="appel-description">
                  {appel.description || 'Aucune description'}
                </p>
                <div className="appel-info">
                  {appel.projet_id && (
                    <div className="appel-info-item">
                      <Icon name="Folder" size={16} />
                      <span>{getProjetName(appel.projet_id)}</span>
                    </div>
                  )}
                  {appel.date_ouverture && (
                    <div className="appel-info-item">
                      <Icon name="Calendar" size={16} />
                      <span>
                        Ouverture: {new Date(appel.date_ouverture).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                  {appel.date_fermeture && (
                    <div className="appel-info-item">
                      <Icon name="Calendar" size={16} />
                      <span>
                        Fermeture: {new Date(appel.date_fermeture).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>
                {appel.nb_candidats !== undefined && (
                  <div className="appel-candidats-count">
                    <Icon name="Users" size={16} />
                    <span>{appel.nb_candidats || 0} candidat(s)</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={deleteConfirm.open}
        title="Supprimer l'appel à candidatures"
        description="Êtes-vous sûr de vouloir supprimer cet appel à candidatures ? Cette action est irréversible."
        variant="danger"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />

      <ConfirmModal
        open={closeConfirm.open}
        title="Clôturer l'appel à candidatures"
        description="Êtes-vous sûr de vouloir clôturer cet appel à candidatures ? Les nouvelles candidatures ne pourront plus être acceptées."
        variant="warning"
        confirmLabel="Clôturer"
        cancelLabel="Annuler"
        onConfirm={confirmClose}
        onCancel={() => setCloseConfirm({ open: false, id: null })}
      />
    </div>
  )
}

