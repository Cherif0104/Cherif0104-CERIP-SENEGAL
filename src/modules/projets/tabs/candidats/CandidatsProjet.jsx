import { useState, useEffect } from 'react'
import { candidaturesService } from '@/services/candidatures.service'
import { appelsService } from '@/services/appels.service'
import { DataTable } from '@/components/common/DataTable'
import { Button } from '@/components/common/Button'
import { Select } from '@/components/common/Select'
import { Input } from '@/components/common/Input'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { toast } from '@/components/common/Toast'
import { formatDate } from '@/utils/format'
import { logger } from '@/utils/logger'
import { useNavigate } from 'react-router-dom'
import './CandidatsProjet.css'

/**
 * Composant de gestion des candidats pour un projet spécifique
 * @param {string} projetId - ID du projet
 */
export default function CandidatsProjet({ projetId: projetIdProp = null }) {
  const navigate = useNavigate()
  const [candidats, setCandidats] = useState([])
  const [appels, setAppels] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    appel_id: '',
    statut_eligibilite: '',
    search: '',
  })

  useEffect(() => {
    if (projetIdProp) {
      loadAppels()
    }
  }, [projetIdProp])

  useEffect(() => {
    if (projetIdProp && appels.length > 0) {
      loadCandidats()
      loadStats()
    } else if (projetIdProp && appels.length === 0) {
      setCandidats([])
      setStats(null)
      setLoading(false)
    }
  }, [projetIdProp, appels, filters])

  const loadAppels = async () => {
    if (!projetIdProp) return
    
    try {
      const { data, error } = await appelsService.getByProjet(projetIdProp)
      if (error) {
        logger.error('CANDIDATS_PROJET', 'Erreur chargement appels', error)
      } else {
        setAppels(data || [])
      }
    } catch (error) {
      logger.error('CANDIDATS_PROJET', 'Erreur inattendue chargement appels', error)
    }
  }

  const loadCandidats = async () => {
    if (!projetIdProp) return
    
    setLoading(true)
    try {
      // Récupérer tous les candidats des appels du projet
      const appelIds = appels.map(a => a.id)
      if (appelIds.length === 0) {
        setCandidats([])
        setLoading(false)
        return
      }

      let allCandidats = []
      for (const appelId of appelIds) {
        const { data, error } = await candidaturesService.getByAppel(appelId)
        if (!error && data) {
          allCandidats = [...allCandidats, ...data]
        }
      }

      // Appliquer les filtres
      let filtered = allCandidats
      if (filters.appel_id) {
        filtered = filtered.filter(c => c.appel_id === filters.appel_id)
      }
      if (filters.statut_eligibilite) {
        filtered = filtered.filter(c => c.statut_eligibilite === filters.statut_eligibilite)
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = filtered.filter(c => 
          (c.personne?.nom?.toLowerCase().includes(searchLower)) ||
          (c.personne?.prenom?.toLowerCase().includes(searchLower)) ||
          (c.code?.toLowerCase().includes(searchLower))
        )
      }

      setCandidats(filtered)
    } catch (error) {
      logger.error('CANDIDATS_PROJET', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    if (!projetIdProp || appels.length === 0) return
    
    try {
      const appelIds = appels.map(a => a.id)
      let total = 0
      let eligibles = 0
      let nonEligibles = 0
      let enAttente = 0

      for (const appelId of appelIds) {
        const { data } = await candidaturesService.getByAppel(appelId)
        if (data) {
          total += data.length
          eligibles += data.filter(c => c.statut_eligibilite === 'ELIGIBLE').length
          nonEligibles += data.filter(c => c.statut_eligibilite === 'NON_ELIGIBLE').length
          enAttente += data.filter(c => !c.statut_eligibilite || c.statut_eligibilite === 'EN_ATTENTE').length
        }
      }

      setStats({
        total,
        eligibles,
        nonEligibles,
        enAttente,
        taux_eligibilite: total > 0 ? (eligibles / total) * 100 : 0,
      })
    } catch (error) {
      logger.error('CANDIDATS_PROJET', 'Erreur chargement stats', error)
    }
  }

  const handleRowClick = (row) => {
    navigate(`/candidatures/${row.id}`)
  }

  const getStatutLabel = (statut) => {
    const labels = {
      'ELIGIBLE': 'Éligible',
      'NON_ELIGIBLE': 'Non éligible',
      'EN_ATTENTE': 'En attente',
    }
    return labels[statut] || statut || 'Non défini'
  }

  const columns = [
    { 
      key: 'code', 
      label: 'Code'
    },
    { 
      key: 'personne', 
      label: 'Nom', 
      render: (value) => value ? `${value.prenom || ''} ${value.nom || ''}`.trim() || '-' : '-' 
    },
    { 
      key: 'appel_id', 
      label: 'Appel',
      render: (value) => {
        const appel = appels.find(a => a.id === value)
        return appel ? appel.titre : '-'
      }
    },
    { 
      key: 'statut_eligibilite', 
      label: 'Statut éligibilité',
      render: (value) => (
        <span className={`candidat-statut statut-${value?.toLowerCase() || 'en_attente'}`}>
          {getStatutLabel(value)}
        </span>
      )
    },
    { 
      key: 'date_candidature', 
      label: 'Date candidature', 
      render: (value) => value ? formatDate(value) : '-' 
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleRowClick(row)}
        >
          Voir détails
        </Button>
      )
    },
  ]

  if (!projetIdProp) {
    return (
      <EmptyState 
        icon="UserCheck" 
        title="Projet non spécifié" 
        message="Impossible de charger les candidats sans ID de projet"
      />
    )
  }

  return (
    <div className="candidats-projet">
      <div className="candidats-header">
        <h2>Candidats du Projet</h2>
        <div className="candidats-actions">
          <Button 
            variant="primary" 
            onClick={() => navigate(`/candidatures/appels/new?projet_id=${projetIdProp}`)}
          >
            <Icon name="Plus" size={16} />
            Nouvel appel
          </Button>
        </div>
      </div>

      {/* Section Appels à candidatures */}
      {appels.length > 0 && (
        <div className="appels-section">
          <h3>Appels à candidatures ({appels.length})</h3>
          <div className="appels-list">
            {appels.map(appel => (
              <div key={appel.id} className="appel-card">
                <div className="appel-info">
                  <h4>{appel.titre}</h4>
                  <div className="appel-meta">
                    <span className={`appel-statut statut-${appel.statut?.toLowerCase().replace(/\s+/g, '-')}`}>
                      {appel.statut || 'Non défini'}
                    </span>
                    {appel.date_ouverture && (
                      <span>Ouverture: {formatDate(appel.date_ouverture)}</span>
                    )}
                    {appel.date_fermeture && (
                      <span>Fermeture: {formatDate(appel.date_fermeture)}</span>
                    )}
                  </div>
                </div>
                <div className="appel-actions">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/candidatures/appels/${appel.id}`)}
                  >
                    <Icon name="ExternalLink" size={14} />
                    Voir détails
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {appels.length === 0 && (
        <div className="appels-empty">
          <EmptyState 
            icon="Bell" 
            title="Aucun appel à candidatures" 
            message="Créez un appel pour commencer à recevoir des candidatures"
            action={
              <Button 
                variant="primary" 
                onClick={() => navigate(`/candidatures/appels/new?projet_id=${projetIdProp}`)}
              >
                <Icon name="Plus" size={16} />
                Créer un appel
              </Button>
            }
          />
        </div>
      )}

      {stats && (
        <div className="candidats-stats">
          <div className="stat-card">
            <div className="stat-label">Total candidats</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Éligibles</div>
            <div className="stat-value success">{stats.eligibles}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Non éligibles</div>
            <div className="stat-value danger">{stats.nonEligibles}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Taux d'éligibilité</div>
            <div className="stat-value">{stats.taux_eligibilite.toFixed(1)}%</div>
          </div>
        </div>
      )}

      <div className="candidats-filters">
        <Input
          label="Recherche"
          type="text"
          placeholder="Nom, prénom, code..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <Select
          label="Appel"
          value={filters.appel_id}
          onChange={(e) => setFilters({ ...filters, appel_id: e.target.value })}
          options={[
            { value: '', label: 'Tous les appels' },
            ...appels.map(a => ({ value: a.id, label: a.titre }))
          ]}
        />
        <Select
          label="Statut éligibilité"
          value={filters.statut_eligibilite}
          onChange={(e) => setFilters({ ...filters, statut_eligibilite: e.target.value })}
          options={[
            { value: '', label: 'Tous les statuts' },
            { value: 'ELIGIBLE', label: 'Éligible' },
            { value: 'NON_ELIGIBLE', label: 'Non éligible' },
            { value: 'EN_ATTENTE', label: 'En attente' },
          ]}
        />
        {(filters.appel_id || filters.statut_eligibilite || filters.search) && (
          <Button 
            variant="outline" 
            onClick={() => setFilters({ appel_id: '', statut_eligibilite: '', search: '' })}
          >
            Réinitialiser
          </Button>
        )}
      </div>

      {loading ? (
        <LoadingState message="Chargement des candidats..." />
      ) : candidats.length === 0 ? (
        <EmptyState 
          icon="UserCheck" 
          title="Aucun candidat" 
          message={appels.length === 0
            ? "Ce projet n'a pas encore d'appels à candidatures"
            : "Aucun candidat ne correspond aux filtres"}
        />
      ) : (
        <>
          <div className="candidats-summary">
            <p>
              <strong>{candidats.length}</strong> candidat(s) trouvé(s)
            </p>
          </div>
          <DataTable
            columns={columns}
            data={candidats}
            onRowClick={handleRowClick}
          />
        </>
      )}
    </div>
  )
}

