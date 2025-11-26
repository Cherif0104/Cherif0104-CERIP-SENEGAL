import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { candidatsService } from '../services/candidats.service'
import { appelsService } from '../services/appels.service'
import { toastService } from '../services/toast.service'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import EmptyState from '../components/common/EmptyState'
import LoadingState from '../components/common/LoadingState'
import './CandidatsPipeline.css'

const COLONNES = [
  { id: 'NOUVEAU', label: 'Nouveau', color: '#94a3b8' },
  { id: 'DIAGNOSTIC', label: 'En diagnostic', color: '#f59e0b' },
  { id: 'SELECTIONNE', label: 'Sélectionné', color: '#3b82f6' },
  { id: 'CONVERTI', label: 'Converti', color: '#10b981' }
]

export default function CandidatsPipeline() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const appelId = searchParams.get('appel')

  const [candidats, setCandidats] = useState([])
  const [appels, setAppels] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    appel: appelId || '',
    search: ''
  })

  useEffect(() => {
    loadAppels()
    loadCandidats()
  }, [filters])

  const loadAppels = async () => {
    try {
      const { data } = await appelsService.getAll()
      setAppels(data || [])
    } catch (error) {
      console.error('Error loading appels:', error)
    }
  }

  const loadCandidats = async () => {
    setLoading(true)
    try {
      const { data, error } = await candidatsService.getAll(filters.appel || null, filters)
      if (error) {
        toastService.error('Erreur lors du chargement des candidats')
        console.error(error)
      } else {
        setCandidats(data || [])
      }
    } catch (error) {
      console.error('Error loading candidats:', error)
      toastService.error('Erreur lors du chargement des candidats')
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (e, candidat) => {
    e.dataTransfer.setData('candidatId', candidat.id)
    e.dataTransfer.setData('currentStatut', candidat.statut || 'NOUVEAU')
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = async (e, newStatut) => {
    e.preventDefault()
    const candidatId = e.dataTransfer.getData('candidatId')
    const currentStatut = e.dataTransfer.getData('currentStatut')

    if (currentStatut === newStatut) return

    try {
      const { error } = await candidatsService.updateStatut(candidatId, newStatut)
      if (error) {
        toastService.error('Erreur lors de la mise à jour du statut')
      } else {
        toastService.success('Statut mis à jour')
        loadCandidats()
      }
    } catch (error) {
      console.error('Error updating statut:', error)
      toastService.error('Erreur lors de la mise à jour du statut')
    }
  }

  const getCandidatsByStatut = (statut) => {
    return candidats.filter(c => (c.statut || 'NOUVEAU') === statut)
  }

  const getAppelName = (id) => {
    const appel = appels.find(a => a.id === id)
    return appel?.titre || 'Appel inconnu'
  }

  if (loading) {
    return <LoadingState message="Chargement du pipeline..." />
  }

  return (
    <div className="candidats-pipeline-page">
      <div className="pipeline-header">
        <div className="pipeline-header-top">
          <BackButton to="/dashboard" label="Retour au tableau de bord" />
          <h1>Pipeline Candidats</h1>
        </div>
        <div className="pipeline-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/candidats/new${appelId ? `?appel=${appelId}` : ''}`)}
          >
            <Icon name="Plus" size={18} />
            Nouveau Candidat
          </button>
        </div>
      </div>

      <div className="pipeline-filters">
        <div className="filter-group">
          <label>Recherche</label>
          <input
            type="text"
            placeholder="Rechercher un candidat..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="input"
          />
        </div>
        <div className="filter-group">
          <label>Appel à candidatures</label>
          <select
            value={filters.appel}
            onChange={(e) => {
              setFilters({ ...filters, appel: e.target.value })
              if (e.target.value) {
                navigate(`/candidats?appel=${e.target.value}`)
              } else {
                navigate('/candidats')
              }
            }}
            className="input"
          >
            <option value="">Tous les appels</option>
            {appels.map(a => (
              <option key={a.id} value={a.id}>{a.titre}</option>
            ))}
          </select>
        </div>
      </div>

      {candidats.length === 0 ? (
        <EmptyState
          icon="Sparkles"
          title="Aucun candidat"
          message={appelId ? "Aucun candidat pour cet appel" : "Commencez par inscrire votre premier candidat"}
          action={{
            label: "Inscrire un candidat",
            onClick: () => navigate(`/candidats/new${appelId ? `?appel=${appelId}` : ''}`)
          }}
        />
      ) : (
        <div className="pipeline-kanban">
          {COLONNES.map((colonne) => {
            const candidatsColonne = getCandidatsByStatut(colonne.id)
            return (
              <div
                key={colonne.id}
                className="pipeline-colonne"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, colonne.id)}
              >
                <div className="colonne-header" style={{ borderTopColor: colonne.color }}>
                  <h3>{colonne.label}</h3>
                  <span className="colonne-count">{candidatsColonne.length}</span>
                </div>
                <div className="colonne-content">
                  {candidatsColonne.map((candidat) => (
                    <div
                      key={candidat.id}
                      className="candidat-card"
                      draggable
                      onDragStart={(e) => handleDragStart(e, candidat)}
                      onClick={() => navigate(`/candidats/${candidat.id}`)}
                    >
                      <div className="candidat-card-header">
                        <h4>{candidat.nom} {candidat.prenom}</h4>
                        <div className="candidat-card-actions">
                          <button
                            className="btn-icon-small"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/candidats/${candidat.id}`)
                            }}
                            title="Voir les détails"
                          >
                            <Icon name="Eye" size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="candidat-card-body">
                        {candidat.email && (
                          <div className="candidat-info-item">
                            <Icon name="Mail" size={14} />
                            <span>{candidat.email}</span>
                          </div>
                        )}
                        {candidat.telephone && (
                          <div className="candidat-info-item">
                            <Icon name="Phone" size={14} />
                            <span>{candidat.telephone}</span>
                          </div>
                        )}
                        {candidat.appel_id && (
                          <div className="candidat-info-item">
                            <Icon name="Bell" size={14} />
                            <span className="candidat-appel">{getAppelName(candidat.appel_id)}</span>
                          </div>
                        )}
                        {candidat.date_inscription && (
                          <div className="candidat-info-item">
                            <Icon name="Calendar" size={14} />
                            <span>{new Date(candidat.date_inscription).toLocaleDateString('fr-FR')}</span>
                          </div>
                        )}
                      </div>
                      {candidat.statut_eligibilite && (
                        <div
                          className={
                            `candidat-badge eligibilite eligibilite--${
                              (candidat.statut_eligibilite || '').toLowerCase()
                            }`
                          }
                        >
                          <Icon
                            name={candidat.statut_eligibilite === 'ELIGIBLE' ? 'CheckCircle2' : 'AlertCircle'}
                            size={12}
                          />
                          {candidat.statut_eligibilite.replace(/_/g, ' ')}
                        </div>
                      )}
                      {candidat.has_diagnostic && (
                        <div className="candidat-badge diagnostic">
                          <Icon name="FileText" size={12} />
                          Diagnostic
                        </div>
                      )}
                    </div>
                  ))}
                  {candidatsColonne.length === 0 && (
                    <div className="colonne-empty">
                      <Icon name="Folder" size={32} />
                      <p>Aucun candidat</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

