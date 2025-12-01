import { useState, useEffect } from 'react'
import { programmesRisquesService } from '@/services/programmes-risques.service'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { RiskMatrix } from '@/components/modules/RiskMatrix'
import { DataTable } from '@/components/common/DataTable'
import { Select } from '@/components/common/Select'
import { programmesService } from '@/services/programmes.service'
import { KPIDonut } from '@/components/modules/KPIDonut'
import { DonutChart } from '@/components/modules/DonutChart'
import { toast } from '@/components/common/Toast'
import { logger } from '@/utils/logger'
import './RisquesProgramme.css'

/**
 * Composant de gestion des risques pour un programme spécifique
 * @param {string} programmeId - ID du programme (optionnel, si non fourni permet de sélectionner)
 */
export default function RisquesProgramme({ programmeId: programmeIdProp = null }) {
  const [risques, setRisques] = useState([])
  const [programmes, setProgrammes] = useState([])
  const [selectedProgramme, setSelectedProgramme] = useState(programmeIdProp || '')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (programmeIdProp) {
      setSelectedProgramme(programmeIdProp)
    }
    loadData()
  }, [programmeIdProp, selectedProgramme])

  const loadData = async () => {
    setLoading(true)
    try {
      // Charger la liste des programmes pour le filtre
      const progResult = await programmesService.getAll()
      if (progResult.error) {
        logger.error('RISQUES_PROGRAMME', 'Erreur chargement programmes', progResult.error)
      } else {
        setProgrammes(progResult.data || [])
      }

      // Charger les risques (attendre que programmes soit chargé)
      let risquesResult
      const programmesList = progResult.data || []
      if (selectedProgramme) {
        const risk = await programmesRisquesService.getRisksForProgramme(selectedProgramme)
        const programme = programmesList.find(p => p.id === selectedProgramme)
        risquesResult = { data: risk ? [{ programme, risque: risk }] : [], error: null }
      } else {
        risquesResult = await programmesRisquesService.getAllProgrammesRisks()
      }

      if (risquesResult.error) {
        logger.error('RISQUES_PROGRAMME', 'Erreur chargement risques', risquesResult.error)
        toast.error('Erreur lors du chargement des risques')
      } else {
        setRisques(risquesResult.data || [])
      }
    } catch (error) {
      logger.error('RISQUES_PROGRAMME', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'programme', label: 'Programme', render: (value) => value?.nom || '-' },
    { 
      key: 'risque', 
      label: 'Score Global', 
      render: (value) => value ? (
        <span className={`risk-score risk-${value.niveau?.toLowerCase()}`}>
          {value.scoreGlobal}/100
        </span>
      ) : '-' 
    },
    { 
      key: 'risque', 
      label: 'Niveau', 
      render: (value) => value ? (
        <span className={`risk-badge risk-${value.niveau?.toLowerCase()}`}>
          {value.niveau}
        </span>
      ) : '-' 
    },
    { 
      key: 'risque', 
      label: 'Risques détaillés', 
      render: (value) => value?.risques ? (
        <div className="risk-details">
          {value.risques.map((r, idx) => (
            <span key={idx} className="risk-tag">
              {r.type}: {r.score}
            </span>
          ))}
        </div>
      ) : '-' 
    },
  ]

  if (loading) return <LoadingState />

  // Transformer pour RiskMatrix
  const matrixData = risques.map(r => ({
    id: r.programme?.id,
    nom: r.programme?.nom,
    probabilite: r.risque?.risques?.reduce((max, risk) => Math.max(max, risk.probabilite), 0) || 0,
    impact: r.risque?.risques?.reduce((max, risk) => Math.max(max, risk.impact), 0) || 0,
    score: r.risque?.scoreGlobal || 0,
    niveau: r.risque?.niveau || 'LOW',
  }))

  // Calculer les statistiques de risques
  const risqueStats = {
    total: risques.length,
    eleves: risques.filter(r => r.risque?.niveau === 'HIGH' || r.risque?.niveau === 'CRITICAL').length,
    moyens: risques.filter(r => r.risque?.niveau === 'MEDIUM').length,
    faibles: risques.filter(r => r.risque?.niveau === 'LOW').length,
  }

  const repartitionRisques = [
    { label: 'Élevés', value: risqueStats.eleves, color: '#ef4444' },
    { label: 'Moyens', value: risqueStats.moyens, color: '#f59e0b' },
    { label: 'Faibles', value: risqueStats.faibles, color: '#10b981' },
  ].filter(item => item.value > 0)

  const scoreMoyen = risques.length > 0 
    ? risques.reduce((sum, r) => sum + (r.risque?.scoreGlobal || 0), 0) / risques.length 
    : 0

  return (
    <div className="risques-programme">
      {/* Header */}
      <div className="risques-header">
        <div>
          <h2>{programmeIdProp ? 'Risques du Programme' : 'Matrice des Risques par Programme'}</h2>
          <p className="risques-subtitle">
            Analyse et suivi des risques associés au programme
          </p>
        </div>
        {!programmeIdProp && (
          <div className="risques-filters">
            <Select
              label="Filtrer par programme"
              value={selectedProgramme}
              onChange={(e) => setSelectedProgramme(e.target.value)}
              options={[
                { value: '', label: 'Tous les programmes' },
                ...(programmes || []).map(p => ({ value: p.id, label: p.nom }))
              ]}
            />
          </div>
        )}
      </div>

      {risques.length === 0 ? (
        <EmptyState 
          icon="AlertTriangle" 
          title="Aucun risque calculé" 
          message={selectedProgramme ? "Aucun risque pour ce programme" : "Aucun risque à afficher"} 
        />
      ) : (
        <>
          {/* KPIs Section */}
          <div className="risques-stats">
            <KPIDonut
              title="Score Moyen"
              value={scoreMoyen}
              total={100}
              label="Risque"
              variant={scoreMoyen > 70 ? 'danger' : scoreMoyen > 40 ? 'warning' : 'success'}
              formatValue="number"
              subtitle={`Sur ${risques.length} risque(s)`}
            />
            <KPIDonut
              title="Risques Élevés"
              value={risqueStats.eleves}
              total={risqueStats.total}
              label="Élevés"
              variant="danger"
              subtitle={`${risqueStats.total > 0 ? ((risqueStats.eleves / risqueStats.total) * 100).toFixed(1) : 0}% du total`}
            />
            {risqueStats.moyens > 0 && (
              <KPIDonut
                title="Risques Moyens"
                value={risqueStats.moyens}
                total={risqueStats.total}
                label="Moyens"
                variant="warning"
                subtitle={`${risqueStats.total > 0 ? ((risqueStats.moyens / risqueStats.total) * 100).toFixed(1) : 0}% du total`}
              />
            )}
            {risqueStats.faibles > 0 && (
              <KPIDonut
                title="Risques Faibles"
                value={risqueStats.faibles}
                total={risqueStats.total}
                label="Faibles"
                variant="success"
                subtitle={`${risqueStats.total > 0 ? ((risqueStats.faibles / risqueStats.total) * 100).toFixed(1) : 0}% du total`}
              />
            )}
          </div>

          {/* Charts Section */}
          {repartitionRisques.length > 0 && (
            <div className="risques-charts">
              <DonutChart
                title="Répartition par niveau de risque"
                data={repartitionRisques}
              />
            </div>
          )}

          {/* Risk Matrix */}
          {matrixData.length > 0 && (
            <div className="risques-matrix">
              <RiskMatrix risques={matrixData} />
            </div>
          )}
          
          {/* Table */}
          <div className="risques-table">
            <DataTable columns={columns} data={risques} />
          </div>
        </>
      )}
    </div>
  )
}

