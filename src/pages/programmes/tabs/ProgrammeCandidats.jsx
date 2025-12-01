import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { projetsService } from '@/services/projets.service'
import { appelsService } from '@/services/appels.service'
import { candidaturesService } from '@/services/candidatures.service'
import { programmeMetricsService } from '@/services/programme-metrics.service'
import { DataTable } from '@/components/common/DataTable'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { KPIDonut } from '@/components/modules/KPIDonut'
import { DonutChart } from '@/components/modules/DonutChart'
import { formatDate } from '@/utils/format'
import { logger } from '@/utils/logger'
import './ProgrammeCandidats.css'

/**
 * Composant affichant les candidats liés à un programme via ses projets et appels
 * @param {string} programmeId - ID du programme
 */
export default function ProgrammeCandidats({ programmeId }) {
  const navigate = useNavigate()
  const [candidats, setCandidats] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (programmeId) {
      loadCandidats()
      loadStats()
    }
  }, [programmeId])

  const loadCandidats = async () => {
    setLoading(true)
    try {
      // 1. Récupérer tous les projets du programme
      const { data: projets, error: projetsError } = await projetsService.getAll(programmeId)
      if (projetsError) {
        logger.error('PROGRAMME_CANDIDATS', 'Erreur chargement projets', projetsError)
        return
      }

      const projetIds = projets?.map(p => p.id) || []
      if (projetIds.length === 0) {
        setCandidats([])
        setLoading(false)
        return
      }

      // 2. Récupérer tous les appels de ces projets
      const appelsPromises = projetIds.map(projetId => appelsService.getByProjet(projetId))
      const appelsResults = await Promise.all(appelsPromises)
      
      const appelIds = []
      appelsResults.forEach(result => {
        if (!result.error && result.data) {
          appelIds.push(...result.data.map(a => a.id))
        }
      })

      if (appelIds.length === 0) {
        setCandidats([])
        setLoading(false)
        return
      }

      // 3. Récupérer tous les candidats de ces appels
      const candidatsPromises = appelIds.map(appelId => candidaturesService.getByAppel(appelId))
      const candidatsResults = await Promise.all(candidatsPromises)

      const allCandidats = []
      candidatsResults.forEach(result => {
        if (!result.error && result.data) {
          allCandidats.push(...result.data)
        }
      })

      // Dédupliquer par ID
      const uniqueCandidats = Array.from(new Map(allCandidats.map(c => [c.id, c])).values())
      setCandidats(uniqueCandidats)

    } catch (error) {
      logger.error('PROGRAMME_CANDIDATS', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Récupérer les projets du programme
      const { data: projets } = await projetsService.getAll(programmeId)
      const projetIds = projets?.map(p => p.id) || []
      
      if (projetIds.length > 0) {
        const candidatsMetrics = await programmeMetricsService.getCandidatsMetrics(projetIds)
        setStats(candidatsMetrics)
      }
    } catch (error) {
      logger.error('PROGRAMME_CANDIDATS', 'Erreur chargement stats', error)
    }
  }

  const columns = [
    {
      key: 'personne',
      label: 'Nom complet',
      render: (value, row) => {
        const personne = row.personne || value
        if (personne) {
          return `${personne.prenom || ''} ${personne.nom || ''}`.trim() || '-'
        }
        return row.nom || row.prenom ? `${row.prenom || ''} ${row.nom || ''}`.trim() : '-'
      },
    },
    {
      key: 'email',
      label: 'Email',
      render: (value, row) => {
        const personne = row.personne
        return personne?.email || value || row.email || '-'
      },
    },
    {
      key: 'telephone',
      label: 'Téléphone',
      render: (value, row) => {
        const personne = row.personne
        return personne?.telephone || value || row.telephone || '-'
      },
    },
    {
      key: 'date_candidature',
      label: 'Date candidature',
      render: (value) => value ? formatDate(value) : '-',
    },
    {
      key: 'statut_eligibilite',
      label: 'Statut',
      render: (value) => (
        <span className={`statut-badge statut-${value?.toLowerCase().replace(/\s+/g, '-') || 'en-attente'}`}>
          {value || 'En attente'}
        </span>
      ),
    },
    {
      key: 'appel',
      label: 'Appel',
      render: (value) => {
        const appel = value || (Array.isArray(value) ? value[0] : null)
        return appel?.titre || appel?.nom || '-'
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/candidatures/${row.id}`)}
        >
          <Icon name="Eye" size={16} />
          Voir
        </Button>
      ),
    },
  ]

  if (loading) {
    return <LoadingState message="Chargement des candidats..." />
  }

  if (candidats.length === 0) {
    return (
      <EmptyState
        icon="Users"
        title="Aucun candidat"
        message="Aucun candidat trouvé pour ce programme via ses projets et appels"
      />
    )
  }

  // Calculer les statistiques de répartition
  const statsByStatus = stats ? {
    eligible: stats.eligibles || 0,
    nonEligible: stats.nonEligibles || 0,
    enAttente: stats.enAttente || 0,
  } : {}

  const totalStats = stats?.total || candidats.length
  const eligiblesCount = stats?.eligibles || candidats.filter(c => c.statut_eligibilite === 'ELIGIBLE').length
  const nonEligiblesCount = stats?.nonEligibles || candidats.filter(c => c.statut_eligibilite === 'NON_ELIGIBLE').length
  const enAttenteCount = stats?.enAttente || candidats.filter(c => !c.statut_eligibilite || c.statut_eligibilite === 'EN_ATTENTE').length

  const repartitionData = [
    { label: 'Éligibles', value: eligiblesCount, color: '#10b981' },
    { label: 'Non éligibles', value: nonEligiblesCount, color: '#ef4444' },
    { label: 'En attente', value: enAttenteCount, color: '#6b7280' },
  ].filter(item => item.value > 0)

  return (
    <div className="programme-candidats">
      {/* KPIs Section */}
      {stats && totalStats > 0 && (
        <div className="programme-candidats-stats">
          <KPIDonut
            title="Total Candidats"
            value={totalStats}
            total={totalStats}
            label="Candidats"
            variant="primary"
            onClick={() => {}}
          />
          <KPIDonut
            title="Éligibles"
            value={eligiblesCount}
            total={totalStats}
            label="Éligibles"
            variant="success"
            subtitle={`${totalStats > 0 ? ((eligiblesCount / totalStats) * 100).toFixed(1) : 0}% du total`}
            onClick={() => {}}
          />
          <KPIDonut
            title="Taux d'éligibilité"
            value={eligiblesCount}
            total={eligiblesCount + nonEligiblesCount || 1}
            label="Éligibilité"
            variant="success"
            subtitle={`${eligiblesCount + nonEligiblesCount > 0 ? ((eligiblesCount / (eligiblesCount + nonEligiblesCount)) * 100).toFixed(1) : 0}%`}
            onClick={() => {}}
          />
          {enAttenteCount > 0 && (
            <KPIDonut
              title="En attente"
              value={enAttenteCount}
              total={totalStats}
              label="Attente"
              variant="warning"
              subtitle={`${totalStats > 0 ? ((enAttenteCount / totalStats) * 100).toFixed(1) : 0}% du total`}
              onClick={() => {}}
            />
          )}
        </div>
      )}

      {/* Charts Section */}
      {repartitionData.length > 0 && (
        <div className="programme-candidats-charts">
          <DonutChart
            title="Répartition par statut d'éligibilité"
            data={repartitionData}
          />
        </div>
      )}

      {/* Header */}
      <div className="programme-candidats-header">
        <div>
          <h2>Candidats du Programme</h2>
          <p className="programme-candidats-subtitle">
            {candidats.length} candidat(s) trouvé(s) pour ce programme
          </p>
        </div>
      </div>

      {/* DataTable */}
      <div className="programme-candidats-table">
        <DataTable columns={columns} data={candidats} />
      </div>
    </div>
  )
}

