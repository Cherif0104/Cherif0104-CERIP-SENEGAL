import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { programmeRapportsService } from '../services/programme-rapports.service'
import { programmesService } from '../services/programmes.service'
import { toastService } from '../services/toast.service'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import EmptyState from '../components/common/EmptyState'
import LoadingState from '../components/common/LoadingState'
import './Rapports.css'

export default function Rapports() {
  const navigate = useNavigate()
  const [allRapports, setAllRapports] = useState([])
  const [rapports, setRapports] = useState([])
  const [programmes, setProgrammes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: '',
    programme_id: '',
    statut: '',
    date_debut: '',
    date_fin: '',
    search: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, allRapports])

  const loadData = async () => {
    setLoading(true)
    try {
      const [programmesRes] = await Promise.all([
        programmesService.getAll()
      ])

      if (!programmesRes.error) setProgrammes(programmesRes.data || [])

      // Charger tous les rapports de tous les programmes
      const rapportsPromises = (programmesRes.data || []).map(async (programme) => {
        const { data } = await programmeRapportsService.getAll(programme.id)
        return (data || []).map(rapport => ({
          ...rapport,
          programme_id: programme.id,
          programme_nom: programme.nom
        }))
      })

      const rapportsArrays = await Promise.all(rapportsPromises)
      const allRapportsData = rapportsArrays.flat()
      
      setAllRapports(allRapportsData)
      applyFilters(allRapportsData, filters)
    } catch (error) {
      console.error('Error loading data:', error)
      toastService.error('Erreur lors du chargement des rapports')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (source = allRapports, currentFilters = filters) => {
    let filtered = source

    if (currentFilters.type) {
      filtered = filtered.filter(r => r.type === currentFilters.type)
    }
    if (currentFilters.programme_id) {
      filtered = filtered.filter(r => r.programme_id === currentFilters.programme_id)
    }
    if (currentFilters.statut) {
      filtered = filtered.filter(r => r.statut === currentFilters.statut)
    }
    if (currentFilters.date_debut) {
      filtered = filtered.filter(r => {
        const rapportDate = new Date(r.date_creation || r.created_at)
        return rapportDate >= new Date(currentFilters.date_debut)
      })
    }
    if (currentFilters.date_fin) {
      filtered = filtered.filter(r => {
        const rapportDate = new Date(r.date_creation || r.created_at)
        return rapportDate <= new Date(currentFilters.date_fin)
      })
    }
    if (currentFilters.search) {
      const searchLower = currentFilters.search.toLowerCase()
      filtered = filtered.filter(r =>
        r.titre?.toLowerCase().includes(searchLower) ||
        r.description?.toLowerCase().includes(searchLower) ||
        r.programme_nom?.toLowerCase().includes(searchLower)
      )
    }

    setRapports(filtered)
  }

  const getStatutColor = (statut) => {
    const colors = {
      'BROUILLON': 'var(--color-gray-500)',
      'EN_REVISION': 'var(--color-warning)',
      'APPROUVE': 'var(--color-success)',
      'REJETE': 'var(--color-danger)'
    }
    return colors[statut] || 'var(--color-gray-500)'
  }

  const getTypeLabel = (type) => {
    const labels = {
      'RAPPORT_ACTIVITES': 'Rapport d\'activités',
      'RAPPORT_FINANCIER': 'Rapport financier',
      'RAPPORT_EVALUATION': 'Rapport d\'évaluation',
      'RAPPORT_ANNUEL': 'Rapport annuel',
      'RAPPORT_TRIMESTRIEL': 'Rapport trimestriel',
      'RAPPORT_MENSUEL': 'Rapport mensuel'
    }
    return labels[type] || type
  }

  const STATUTS = ['BROUILLON', 'EN_REVISION', 'APPROUVE', 'REJETE']
  const TYPES = ['RAPPORT_ACTIVITES', 'RAPPORT_FINANCIER', 'RAPPORT_EVALUATION', 'RAPPORT_ANNUEL', 'RAPPORT_TRIMESTRIEL', 'RAPPORT_MENSUEL']

  if (loading) {
    return <LoadingState message="Chargement des rapports..." />
  }

  return (
    <div className="rapports-page">
      <div className="rapports-header">
        <div className="rapports-header-top">
          <BackButton to="/dashboard" label="Retour au tableau de bord" />
          <h1>Tous les Rapports</h1>
        </div>
      </div>

      <div className="rapports-filters">
        <div className="filter-group">
          <label>Recherche</label>
          <input
            type="text"
            placeholder="Rechercher un rapport..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="input"
          />
        </div>
        <div className="filter-group">
          <label>Type</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="input"
          >
            <option value="">Tous</option>
            {TYPES.map(t => (
              <option key={t} value={t}>{getTypeLabel(t)}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Programme</label>
          <select
            value={filters.programme_id}
            onChange={(e) => setFilters({ ...filters, programme_id: e.target.value })}
            className="input"
          >
            <option value="">Tous</option>
            {programmes.map(p => (
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
            {STATUTS.map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Date début</label>
          <input
            type="date"
            value={filters.date_debut}
            onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })}
            className="input"
          />
        </div>
        <div className="filter-group">
          <label>Date fin</label>
          <input
            type="date"
            value={filters.date_fin}
            onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })}
            className="input"
          />
        </div>
      </div>

      {rapports.length === 0 ? (
        <EmptyState
          icon="FileText"
          title="Aucun rapport"
          description="Aucun rapport ne correspond à vos critères de recherche"
        />
      ) : (
        <div className="rapports-table-container">
          <table className="rapports-table">
            <thead>
              <tr>
                <th>Programme</th>
                <th>Type</th>
                <th>Titre</th>
                <th>Période</th>
                <th>Statut</th>
                <th>Date création</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rapports.map((rapport) => (
                <tr key={rapport.id}>
                  <td>
                    <button
                      onClick={() => navigate(`/programmes/${rapport.programme_id}`)}
                      className="link-button"
                    >
                      {rapport.programme_nom || 'Programme inconnu'}
                    </button>
                  </td>
                  <td>{getTypeLabel(rapport.type)}</td>
                  <td>{rapport.titre || 'Sans titre'}</td>
                  <td>
                    {rapport.periode_debut && rapport.periode_fin ? (
                      <>
                        {new Date(rapport.periode_debut).toLocaleDateString('fr-FR')} - {new Date(rapport.periode_fin).toLocaleDateString('fr-FR')}
                      </>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <span 
                      className="rapport-statut"
                      style={{ backgroundColor: getStatutColor(rapport.statut) }}
                    >
                      {rapport.statut?.replace('_', ' ') || 'NON_DEFINI'}
                    </span>
                  </td>
                  <td>
                    {rapport.date_creation || rapport.created_at
                      ? new Date(rapport.date_creation || rapport.created_at).toLocaleDateString('fr-FR')
                      : '-'}
                  </td>
                  <td>
                    <button
                      className="btn-icon"
                      onClick={() => navigate(`/programmes/${rapport.programme_id}#rapports`)}
                      title="Voir dans le programme"
                    >
                      <Icon name="Eye" size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

