import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { projetsService } from '@/services/projets.service'
import { beneficiairesService } from '@/services/beneficiaires.service'
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
import './ProgrammeBeneficiaires.css'

/**
 * Composant affichant les bénéficiaires liés à un programme via ses projets
 * @param {string} programmeId - ID du programme
 */
export default function ProgrammeBeneficiaires({ programmeId }) {
  const navigate = useNavigate()
  const [beneficiaires, setBeneficiaires] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (programmeId) {
      loadBeneficiaires()
      loadStats()
    }
  }, [programmeId])

  const loadBeneficiaires = async () => {
    setLoading(true)
    try {
      // 1. Récupérer tous les projets du programme
      const { data: projets, error: projetsError } = await projetsService.getAll(programmeId)
      if (projetsError) {
        logger.error('PROGRAMME_BENEFICIAIRES', 'Erreur chargement projets', projetsError)
        return
      }

      const projetIds = projets?.map(p => p.id) || []
      if (projetIds.length === 0) {
        setBeneficiaires([])
        setLoading(false)
        return
      }

      // 2. Récupérer tous les bénéficiaires de ces projets
      const beneficiairesPromises = projetIds.map(projetId => beneficiairesService.getByProjet(projetId))
      const beneficiairesResults = await Promise.all(beneficiairesPromises)

      const allBeneficiaires = []
      beneficiairesResults.forEach(result => {
        if (!result.error && result.data) {
          allBeneficiaires.push(...result.data)
        }
      })

      // Dédupliquer par ID
      const uniqueBeneficiaires = Array.from(new Map(allBeneficiaires.map(b => [b.id, b])).values())
      setBeneficiaires(uniqueBeneficiaires)

    } catch (error) {
      logger.error('PROGRAMME_BENEFICIAIRES', 'Erreur inattendue', error)
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
        const beneficiairesMetrics = await programmeMetricsService.getBeneficiairesMetrics(projetIds)
        setStats(beneficiairesMetrics)
      }
    } catch (error) {
      logger.error('PROGRAMME_BENEFICIAIRES', 'Erreur chargement stats', error)
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
      key: 'code',
      label: 'Code',
    },
    {
      key: 'projet',
      label: 'Projet',
      render: (value) => {
        const projet = value || (Array.isArray(value) ? value[0] : null)
        return projet?.nom || '-'
      },
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (value) => (
        <span className={`statut-badge statut-${value?.toLowerCase().replace(/\s+/g, '-') || 'pre-incubation'}`}>
          {value || 'Pré-incubation'}
        </span>
      ),
    },
    {
      key: 'mentor',
      label: 'Mentor',
      render: (value) => {
        const mentor = value
        if (mentor && typeof mentor === 'object') {
          return `${mentor.prenom || ''} ${mentor.nom || ''}`.trim() || mentor.nom || '-'
        }
        return '-'
      },
    },
    {
      key: 'created_at',
      label: 'Date création',
      render: (value) => value ? formatDate(value) : '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/beneficiaires/${row.id}`)}
        >
          <Icon name="Eye" size={16} />
          Voir
        </Button>
      ),
    },
  ]

  if (loading) {
    return <LoadingState message="Chargement des bénéficiaires..." />
  }

  if (beneficiaires.length === 0) {
    return (
      <EmptyState
        icon="UserCheck"
        title="Aucun bénéficiaire"
        message="Aucun bénéficiaire trouvé pour ce programme via ses projets"
      />
    )
  }

  // Calculer les statistiques de répartition
  const totalStats = stats?.total || beneficiaires.length
  
  // Regrouper par statut
  const statutGroups = beneficiaires.reduce((acc, b) => {
    const statut = b.statut || 'PRE_INCUBATION'
    acc[statut] = (acc[statut] || 0) + 1
    return acc
  }, {})

  const repartitionData = Object.entries(statutGroups).map(([statut, count]) => ({
    label: statut.replace(/_/g, ' '),
    value: count,
    color: statut === 'INCUBATION' ? '#10b981' : statut === 'PRE_INCUBATION' ? '#3b82f6' : '#6b7280',
  }))

  return (
    <div className="programme-beneficiaires">
      {/* KPIs Section */}
      {stats && totalStats > 0 && (
        <div className="programme-beneficiaires-stats">
          <KPIDonut
            title="Total Bénéficiaires"
            value={totalStats}
            total={totalStats}
            label="Bénéficiaires"
            variant="primary"
            onClick={() => {}}
          />
          {stats.incubation && (
            <KPIDonut
              title="En Incubation"
              value={stats.incubation}
              total={totalStats}
              label="Incubation"
              variant="success"
              subtitle={`${totalStats > 0 ? ((stats.incubation / totalStats) * 100).toFixed(1) : 0}% du total`}
              onClick={() => {}}
            />
          )}
          {stats.preIncubation && (
            <KPIDonut
              title="Pré-incubation"
              value={stats.preIncubation}
              total={totalStats}
              label="Pré-incubation"
              variant="primary"
              subtitle={`${totalStats > 0 ? ((stats.preIncubation / totalStats) * 100).toFixed(1) : 0}% du total`}
              onClick={() => {}}
            />
          )}
          {stats.accompagnes && (
            <KPIDonut
              title="Accompagnés"
              value={stats.accompagnes}
              total={totalStats}
              label="Accompagnés"
              variant="warning"
              subtitle={`${totalStats > 0 ? ((stats.accompagnes / totalStats) * 100).toFixed(1) : 0}% du total`}
              onClick={() => {}}
            />
          )}
        </div>
      )}

      {/* Charts Section */}
      {repartitionData.length > 0 && (
        <div className="programme-beneficiaires-charts">
          <DonutChart
            title="Répartition par statut"
            data={repartitionData}
          />
        </div>
      )}

      {/* Header */}
      <div className="programme-beneficiaires-header">
        <div>
          <h2>Bénéficiaires du Programme</h2>
          <p className="programme-beneficiaires-subtitle">
            {beneficiaires.length} bénéficiaire(s) trouvé(s) pour ce programme
          </p>
        </div>
      </div>

      {/* DataTable */}
      <div className="programme-beneficiaires-table">
        <DataTable columns={columns} data={beneficiaires} />
      </div>
    </div>
  )
}

