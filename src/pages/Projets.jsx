import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { projetsService } from '../services/projets.service'
import { programmesService } from '../services/programmes.service'
import { appelsService } from '../services/appels.service'
import { candidatsService } from '../services/candidats.service'
import { beneficiairesService } from '../services/beneficiaires.service'
import { supabase } from '../lib/supabase'
import { toastService } from '../services/toast.service'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import EmptyState from '../components/common/EmptyState'
import LoadingState from '../components/common/LoadingState'
import ConfirmModal from '../components/common/ConfirmModal'
import './Projets.css'

export default function Projets() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const programmeId = searchParams.get('programme')

  const [projets, setProjets] = useState([])
  const [programmes, setProgrammes] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null })
  const [filters, setFilters] = useState({
    programme: programmeId || '',
    search: ''
  })

  useEffect(() => {
    loadProgrammes()
    loadProjets()
  }, [filters])

  const loadProgrammes = async () => {
    try {
      const { data } = await programmesService.getAll()
      setProgrammes(data || [])
    } catch (error) {
      console.error('Error loading programmes:', error)
    }
  }

  const loadProjets = async () => {
    setLoading(true)
    try {
      const { data, error } = await projetsService.getAll(filters.programme || null)
      if (error) {
        toastService.error('Erreur lors du chargement des projets')
        console.error(error)
      } else {
        // Filtrer les données
        let filtered = data || []
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          filtered = filtered.filter(p => 
            p.nom?.toLowerCase().includes(searchLower) ||
            p.description?.toLowerCase().includes(searchLower) ||
            p.type_activite?.toLowerCase().includes(searchLower)
          )
        }

        // Enrichir avec les métriques
        const enriched = await Promise.all(
          filtered.map(async (projet) => {
            // Compter les appels
            const { count: appelsCount } = await supabase
              .from('appels_candidatures')
              .select('*', { count: 'exact', head: true })
              .eq('projet_id', projet.id)

            // Compter les candidats
            const { data: appelsData } = await supabase
              .from('appels_candidatures')
              .select('id')
              .eq('projet_id', projet.id)

            const appelsIds = (appelsData || []).map(a => a.id)
            const { count: candidatsCount } = appelsIds.length > 0
              ? await supabase
                  .from('candidats')
                  .select('*', { count: 'exact', head: true })
                  .in('appel_id', appelsIds)
              : { count: 0 }

            // Compter les bénéficiaires
            const { count: benefCount } = await supabase
              .from('beneficiaires')
              .select('*', { count: 'exact', head: true })
              .eq('projet_id', projet.id)

            return {
              ...projet,
              _stats: {
                appels: appelsCount || 0,
                candidats: candidatsCount || 0,
                beneficiaires: benefCount || 0
              }
            }
          })
        )

        setProjets(enriched)
      }
    } catch (error) {
      console.error('Error loading projets:', error)
      toastService.error('Erreur lors du chargement des projets')
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
      const { error } = await projetsService.delete(deleteConfirm.id)
      if (error) {
        toastService.error('Erreur lors de la suppression')
      } else {
        toastService.success('Projet supprimé avec succès')
        loadProjets()
      }
    } catch (error) {
      console.error('Error deleting projet:', error)
      toastService.error('Erreur lors de la suppression')
    } finally {
      setDeleteConfirm({ open: false, id: null })
    }
  }

  const getProgrammeName = (id) => {
    const programme = programmes.find(p => p.id === id)
    return programme?.nom || 'Programme inconnu'
  }

  if (loading) {
    return <LoadingState message="Chargement des projets..." />
  }

  return (
    <div className="projets-page">
      <div className="projets-header">
        <div className="projets-header-top">
          <BackButton to="/dashboard" label="Retour au tableau de bord" />
          <h1>Gestion des Projets</h1>
        </div>
        <div className="projets-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/projets/new${programmeId ? `?programme=${programmeId}` : ''}`)}
          >
            <Icon name="Plus" size={18} />
            Nouveau Projet
          </button>
        </div>
      </div>

      <div className="projets-filters">
        <div className="filter-group">
          <label>Recherche</label>
          <input
            type="text"
            placeholder="Rechercher un projet..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="input"
          />
        </div>
        <div className="filter-group">
          <label>Programme</label>
          <select
            value={filters.programme}
            onChange={(e) => {
              setFilters({ ...filters, programme: e.target.value })
              if (e.target.value) {
                navigate(`/projets?programme=${e.target.value}`)
              } else {
                navigate('/projets')
              }
            }}
            className="input"
          >
            <option value="">Tous les programmes</option>
            {programmes.map(p => (
              <option key={p.id} value={p.id}>{p.nom}</option>
            ))}
          </select>
        </div>
      </div>

      {projets.length === 0 ? (
        <EmptyState
          icon="Folder"
          title="Aucun projet"
          message={programmeId ? "Ce programme n'a pas encore de projets" : "Commencez par créer votre premier projet"}
          action={{
            label: "Créer un projet",
            onClick: () => navigate(`/projets/new${programmeId ? `?programme=${programmeId}` : ''}`)
          }}
        />
      ) : (
        <div className="projets-grid">
          {projets.map((projet) => (
            <div key={projet.id} className="projet-card">
              <div className="projet-card-header">
                <div className="projet-card-title">
                  <h3>{projet.nom || 'Projet sans nom'}</h3>
                  {projet.programme_id && (
                    <span className="projet-programme">
                      {getProgrammeName(projet.programme_id)}
                    </span>
                  )}
                </div>
                <div className="projet-card-actions">
                  <button
                    className="btn-icon"
                    onClick={() => navigate(`/projets/${projet.id}`)}
                    title="Voir les détails"
                  >
                    <Icon name="Eye" size={18} />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => navigate(`/projets/${projet.id}/edit`)}
                    title="Modifier"
                  >
                    <Icon name="Edit" size={18} />
                  </button>
                  <button
                    className="btn-icon btn-icon--danger"
                    onClick={() => handleDelete(projet.id)}
                    title="Supprimer"
                  >
                    <Icon name="Trash2" size={18} />
                  </button>
                </div>
              </div>
              <div className="projet-card-body">
                <p className="projet-description">
                  {projet.description || 'Aucune description'}
                </p>
                <div className="projet-info">
                  {projet.type_activite && (
                    <div className="projet-info-item">
                      <Icon name="Bookmark" size={16} />
                      <span>{projet.type_activite}</span>
                    </div>
                  )}
                  {projet.date_debut && (
                    <div className="projet-info-item">
                      <Icon name="Calendar" size={16} />
                      <span>
                        {new Date(projet.date_debut).toLocaleDateString('fr-FR')}
                        {projet.date_fin && ` - ${new Date(projet.date_fin).toLocaleDateString('fr-FR')}`}
                      </span>
                    </div>
                  )}
                </div>
                {projet._stats && (
                  <div className="projet-metrics">
                    <div 
                      className="metric-badge"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/appels-candidatures?projet=${projet.id}`)
                      }}
                    >
                      <Icon name="Bell" size={14} />
                      <span>{projet._stats.appels} appels</span>
                    </div>
                    <div 
                      className="metric-badge"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/candidats?projet=${projet.id}`)
                      }}
                    >
                      <Icon name="Sparkles" size={14} />
                      <span>{projet._stats.candidats} candidats</span>
                    </div>
                    <div 
                      className="metric-badge"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/beneficiaires?projet=${projet.id}`)
                      }}
                    >
                      <Icon name="Users" size={14} />
                      <span>{projet._stats.beneficiaires} bénéficiaires</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={deleteConfirm.open}
        title="Supprimer le projet"
        description="Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible."
        variant="danger"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />
    </div>
  )
}

