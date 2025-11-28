import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { dossiersService } from '../services/dossiers.service'
import { appelsService } from '../services/appels.service'
import { candidatsService } from '../services/candidats.service'
import { projetsService } from '../services/projets.service'
import { toastService } from '../services/toast.service'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import EmptyState from '../components/common/EmptyState'
import LoadingState from '../components/common/LoadingState'
import ConfirmModal from '../components/common/ConfirmModal'
import './Dossiers.css'

export default function Dossiers() {
  const navigate = useNavigate()
  const [allDossiers, setAllDossiers] = useState([])
  const [dossiers, setDossiers] = useState([])
  const [appels, setAppels] = useState([])
  const [candidats, setCandidats] = useState([])
  const [projets, setProjets] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null })
  const [filters, setFilters] = useState({
    statut: '',
    appel_id: '',
    candidat_id: '',
    projet_id: '',
    search: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, allDossiers])

  const loadData = async () => {
    setLoading(true)
    try {
      const [dossiersRes, appelsRes, candidatsRes, projetsRes] = await Promise.all([
        dossiersService.getAll(),
        appelsService.getAll(),
        candidatsService.getAll(),
        projetsService.getAll()
      ])

      if (dossiersRes.error) {
        toastService.error('Erreur lors du chargement des dossiers')
        console.error(dossiersRes.error)
      } else {
        setAllDossiers(dossiersRes.data || [])
        applyFilters(dossiersRes.data || [], filters)
      }

      if (!appelsRes.error) setAppels(appelsRes.data || [])
      if (!candidatsRes.error) setCandidats(candidatsRes.data || [])
      if (!projetsRes.error) setProjets(projetsRes.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toastService.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (source = allDossiers, currentFilters = filters) => {
    let filtered = source

    if (currentFilters.statut) {
      filtered = filtered.filter(d => d.statut === currentFilters.statut)
    }
    if (currentFilters.appel_id) {
      filtered = filtered.filter(d => d.appel_id === currentFilters.appel_id)
    }
    if (currentFilters.candidat_id) {
      filtered = filtered.filter(d => d.candidat_id === currentFilters.candidat_id)
    }
    if (currentFilters.projet_id) {
      filtered = filtered.filter(d => d.projet_id === currentFilters.projet_id)
    }
    if (currentFilters.search) {
      const searchLower = currentFilters.search.toLowerCase()
      filtered = filtered.filter(d =>
        d.notes?.toLowerCase().includes(searchLower) ||
        d.motif_refus?.toLowerCase().includes(searchLower)
      )
    }

    setDossiers(filtered)
  }

  const handleDelete = async (id) => {
    setDeleteConfirm({ open: true, id })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return
    try {
      const { error } = await dossiersService.delete(deleteConfirm.id)
      if (error) {
        toastService.error('Erreur lors de la suppression')
      } else {
        toastService.success('Dossier supprimé avec succès')
        loadData()
      }
    } catch (error) {
      console.error('Error deleting dossier:', error)
      toastService.error('Erreur lors de la suppression')
    } finally {
      setDeleteConfirm({ open: false, id: null })
    }
  }

  const getAppelName = (id) => {
    const appel = appels.find(a => a.id === id)
    return appel?.titre || 'Appel inconnu'
  }

  const getCandidatName = (id) => {
    const candidat = candidats.find(c => c.id === id)
    return candidat ? `${candidat.prenom || ''} ${candidat.nom || ''}`.trim() : 'Candidat inconnu'
  }

  const getProjetName = (id) => {
    const projet = projets.find(p => p.id === id)
    return projet?.nom || 'Projet inconnu'
  }

  const getStatutColor = (statut) => {
    const colors = {
      'ACCEPTE': 'var(--color-success)',
      'EN_TRAITEMENT': 'var(--color-primary)',
      'REFUSE': 'var(--color-danger)',
      'EN_ATTENTE': 'var(--color-warning)'
    }
    return colors[statut] || 'var(--color-gray-500)'
  }

  const STATUTS = ['ACCEPTE', 'EN_TRAITEMENT', 'REFUSE', 'EN_ATTENTE']

  if (loading) {
    return <LoadingState message="Chargement des dossiers..." />
  }

  return (
    <div className="dossiers-page">
      <div className="dossiers-header">
        <div className="dossiers-header-top">
          <BackButton to="/dashboard" label="Retour au tableau de bord" />
          <h1>Gestion des Dossiers</h1>
        </div>
        <div className="dossiers-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/dossiers/new')}
          >
            <Icon name="Plus" size={18} />
            Nouveau Dossier
          </button>
        </div>
      </div>

      <div className="dossiers-filters">
        <div className="filter-group">
          <label>Recherche</label>
          <input
            type="text"
            placeholder="Rechercher un dossier..."
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
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Appel</label>
          <select
            value={filters.appel_id}
            onChange={(e) => setFilters({ ...filters, appel_id: e.target.value })}
            className="input"
          >
            <option value="">Tous</option>
            {appels.map(a => (
              <option key={a.id} value={a.id}>{a.titre}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Candidat</label>
          <select
            value={filters.candidat_id}
            onChange={(e) => setFilters({ ...filters, candidat_id: e.target.value })}
            className="input"
          >
            <option value="">Tous</option>
            {candidats.map(c => (
              <option key={c.id} value={c.id}>
                {`${c.prenom || ''} ${c.nom || ''}`.trim() || 'Candidat sans nom'}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Projet</label>
          <select
            value={filters.projet_id}
            onChange={(e) => setFilters({ ...filters, projet_id: e.target.value })}
            className="input"
          >
            <option value="">Tous</option>
            {projets.map(p => (
              <option key={p.id} value={p.id}>{p.nom}</option>
            ))}
          </select>
        </div>
      </div>

      {dossiers.length === 0 ? (
        <EmptyState
          icon="FileText"
          title="Aucun dossier"
          description="Commencez par créer votre premier dossier"
          action={{
            label: "Créer un dossier",
            onClick: () => navigate('/dossiers/new')
          }}
        />
      ) : (
        <>
          <div className="dossiers-grid">
            {dossiers.map((dossier) => (
              <div key={dossier.id} className="dossier-card">
                <div className="dossier-card-header">
                  <div className="dossier-card-title">
                    <h3>Dossier #{dossier.id.substring(0, 8)}</h3>
                    <span 
                      className="dossier-statut"
                      style={{ backgroundColor: getStatutColor(dossier.statut) }}
                    >
                      {dossier.statut?.replace('_', ' ') || 'NON_DEFINI'}
                    </span>
                  </div>
                  <div className="dossier-card-actions">
                    <button
                      className="btn-icon"
                      onClick={() => navigate(`/dossiers/${dossier.id}`)}
                      title="Voir les détails"
                    >
                      <Icon name="Eye" size={18} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => navigate(`/dossiers/${dossier.id}/edit`)}
                      title="Modifier"
                    >
                      <Icon name="Edit" size={18} />
                    </button>
                    <button
                      className="btn-icon btn-icon--danger"
                      onClick={() => handleDelete(dossier.id)}
                      title="Supprimer"
                    >
                      <Icon name="Trash2" size={18} />
                    </button>
                  </div>
                </div>
                <div className="dossier-card-body">
                  {dossier.candidat_id && (
                    <div className="dossier-info-item">
                      <Icon name="User" size={16} />
                      <span>{getCandidatName(dossier.candidat_id)}</span>
                    </div>
                  )}
                  {dossier.appel_id && (
                    <div className="dossier-info-item">
                      <Icon name="Bell" size={16} />
                      <span>{getAppelName(dossier.appel_id)}</span>
                    </div>
                  )}
                  {dossier.projet_id && (
                    <div className="dossier-info-item">
                      <Icon name="Briefcase" size={16} />
                      <span>{getProjetName(dossier.projet_id)}</span>
                    </div>
                  )}
                  {dossier.date_depot && (
                    <div className="dossier-info-item">
                      <Icon name="Calendar" size={16} />
                      <span>Déposé le {new Date(dossier.date_depot).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                  {dossier.date_decision && (
                    <div className="dossier-info-item">
                      <Icon name="CheckCircle" size={16} />
                      <span>Décision le {new Date(dossier.date_decision).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                  {dossier.motif_refus && (
                    <div className="dossier-motif">
                      <strong>Motif de refus:</strong> {dossier.motif_refus}
                    </div>
                  )}
                  {dossier.notes && (
                    <div className="dossier-notes">
                      <strong>Notes:</strong> {dossier.notes.substring(0, 100)}
                      {dossier.notes.length > 100 && '...'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <ConfirmModal
            open={deleteConfirm.open}
            title="Supprimer le dossier"
            description="Êtes-vous sûr de vouloir supprimer ce dossier ? Cette action est irréversible."
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
