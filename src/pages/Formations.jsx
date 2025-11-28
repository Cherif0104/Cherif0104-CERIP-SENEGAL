import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { formationsService } from '../services/formations.service'
import { projetsService } from '../services/projets.service'
import { usersService } from '../services/users.service'
import { toastService } from '../services/toast.service'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import EmptyState from '../components/common/EmptyState'
import LoadingState from '../components/common/LoadingState'
import ConfirmModal from '../components/common/ConfirmModal'
import './Formations.css'

export default function Formations() {
  const navigate = useNavigate()
  const [allFormations, setAllFormations] = useState([])
  const [formations, setFormations] = useState([])
  const [projets, setProjets] = useState([])
  const [formateurs, setFormateurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null })
  const [filters, setFilters] = useState({
    statut: '',
    projet_id: '',
    formateur_id: '',
    search: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, allFormations])

  const loadData = async () => {
    setLoading(true)
    try {
      const [formationsRes, projetsRes, usersRes] = await Promise.all([
        formationsService.getAll(),
        projetsService.getAll(),
        usersService.getAll()
      ])

      if (formationsRes.error) {
        toastService.error('Erreur lors du chargement des formations')
        console.error(formationsRes.error)
      } else {
        setAllFormations(formationsRes.data || [])
        applyFilters(formationsRes.data || [], filters)
      }

      if (!projetsRes.error) setProjets(projetsRes.data || [])
      
      // Filtrer les formateurs (users avec role FORMATEUR)
      if (!usersRes.error) {
        const formateursList = (usersRes.data || []).filter(u => u.role === 'FORMATEUR')
        setFormateurs(formateursList)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toastService.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (source = allFormations, currentFilters = filters) => {
    let filtered = source

    if (currentFilters.statut) {
      filtered = filtered.filter(f => f.statut === currentFilters.statut)
    }
    if (currentFilters.projet_id) {
      filtered = filtered.filter(f => f.projet_id === currentFilters.projet_id)
    }
    if (currentFilters.formateur_id) {
      filtered = filtered.filter(f => f.formateur_id === currentFilters.formateur_id)
    }
    if (currentFilters.search) {
      const searchLower = currentFilters.search.toLowerCase()
      filtered = filtered.filter(f =>
        f.titre?.toLowerCase().includes(searchLower) ||
        f.description?.toLowerCase().includes(searchLower) ||
        f.lieu?.toLowerCase().includes(searchLower)
      )
    }

    setFormations(filtered)
  }

  const handleDelete = async (id) => {
    setDeleteConfirm({ open: true, id })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return
    try {
      const { error } = await formationsService.delete(deleteConfirm.id)
      if (error) {
        toastService.error('Erreur lors de la suppression')
      } else {
        toastService.success('Formation supprimée avec succès')
        loadData()
      }
    } catch (error) {
      console.error('Error deleting formation:', error)
      toastService.error('Erreur lors de la suppression')
    } finally {
      setDeleteConfirm({ open: false, id: null })
    }
  }

  const getProjetName = (id) => {
    const projet = projets.find(p => p.id === id)
    return projet?.nom || 'Projet inconnu'
  }

  const getFormateurName = (id) => {
    const formateur = formateurs.find(f => f.id === id)
    return formateur ? `${formateur.prenom || ''} ${formateur.nom || ''}`.trim() || formateur.email : 'Non assigné'
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

  const STATUTS = ['OUVERT', 'EN_COURS', 'TERMINE', 'ANNULE']

  if (loading) {
    return <LoadingState message="Chargement des formations..." />
  }

  return (
    <div className="formations-page">
      <div className="formations-header">
        <div className="formations-header-top">
          <BackButton to="/dashboard" label="Retour au tableau de bord" />
          <h1>Gestion des Formations</h1>
        </div>
        <div className="formations-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/formations/new')}
          >
            <Icon name="Plus" size={18} />
            Nouvelle Formation
          </button>
        </div>
      </div>

      <div className="formations-filters">
        <div className="filter-group">
          <label>Recherche</label>
          <input
            type="text"
            placeholder="Rechercher une formation..."
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
        <div className="filter-group">
          <label>Formateur</label>
          <select
            value={filters.formateur_id}
            onChange={(e) => setFilters({ ...filters, formateur_id: e.target.value })}
            className="input"
          >
            <option value="">Tous</option>
            {formateurs.map(f => (
              <option key={f.id} value={f.id}>
                {`${f.prenom || ''} ${f.nom || ''}`.trim() || f.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      {formations.length === 0 ? (
        <EmptyState
          icon="GraduationCap"
          title="Aucune formation"
          description="Commencez par créer votre première formation"
          action={{
            label: "Créer une formation",
            onClick: () => navigate('/formations/new')
          }}
        />
      ) : (
        <>
          <div className="formations-grid">
            {formations.map((formation) => (
              <div key={formation.id} className="formation-card">
                <div className="formation-card-header">
                  <div className="formation-card-title">
                    <h3>{formation.nom || 'Formation sans nom'}</h3>
                    <span 
                      className="formation-statut"
                      style={{ backgroundColor: getStatutColor(formation.statut) }}
                    >
                      {formation.statut?.replace('_', ' ') || 'NON_DEFINI'}
                    </span>
                  </div>
                  <div className="formation-card-actions">
                    <button
                      className="btn-icon"
                      onClick={() => navigate(`/formations/${formation.id}`)}
                      title="Voir les détails"
                    >
                      <Icon name="Eye" size={18} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => navigate(`/formations/${formation.id}/edit`)}
                      title="Modifier"
                    >
                      <Icon name="Edit" size={18} />
                    </button>
                    <button
                      className="btn-icon btn-icon--danger"
                      onClick={() => handleDelete(formation.id)}
                      title="Supprimer"
                    >
                      <Icon name="Trash2" size={18} />
                    </button>
                  </div>
                </div>
                <div className="formation-card-body">
                  <p className="formation-description">
                    {formation.description || 'Aucune description'}
                  </p>
                  <div className="formation-info">
                    {formation.projet_id && (
                      <div className="formation-info-item">
                        <Icon name="Briefcase" size={16} />
                        <span>{getProjetName(formation.projet_id)}</span>
                      </div>
                    )}
                    {formation.formateur_id && (
                      <div className="formation-info-item">
                        <Icon name="User" size={16} />
                        <span>{getFormateurName(formation.formateur_id)}</span>
                      </div>
                    )}
                    {formation.lieu && (
                      <div className="formation-info-item">
                        <Icon name="MapPin" size={16} />
                        <span>{formation.lieu}</span>
                      </div>
                    )}
                    {formation.date_debut && (
                      <div className="formation-info-item">
                        <Icon name="Calendar" size={16} />
                        <span>
                          {new Date(formation.date_debut).toLocaleDateString('fr-FR')}
                          {formation.date_fin && ` - ${new Date(formation.date_fin).toLocaleDateString('fr-FR')}`}
                        </span>
                      </div>
                    )}
                    {formation.modalite && (
                      <div className="formation-info-item">
                        <Icon name="Monitor" size={16} />
                        <span>{formation.modalite}</span>
                      </div>
                    )}
                  </div>
                  {formation.capacite_max && (
                    <div className="formation-capacite">
                      <strong>Capacité:</strong> {formation.capacite_max} participants
                    </div>
                  )}
                  {formation.duree_heures && (
                    <div className="formation-duree">
                      <strong>Durée:</strong> {formation.duree_heures} heures
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <ConfirmModal
            open={deleteConfirm.open}
            title="Supprimer la formation"
            description="Êtes-vous sûr de vouloir supprimer cette formation ? Cette action est irréversible."
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

