import { useState, useEffect } from 'react'
import { programmesRisquesService } from '@/services/programmes-risques.service'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { RiskMatrix } from '@/components/modules/RiskMatrix'
import { DataTable } from '@/components/common/DataTable'
import { Select } from '@/components/common/Select'
import { programmesService } from '@/services/programmes.service'
import { toast } from '@/components/common/Toast'
import { logger } from '@/utils/logger'
import './RisquesProgramme.css'

export default function RisquesProgramme() {
  const [risques, setRisques] = useState([])
  const [programmes, setProgrammes] = useState([])
  const [selectedProgramme, setSelectedProgramme] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [selectedProgramme])

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

      // Charger les risques
      let risquesResult
      if (selectedProgramme) {
        const risk = await programmesRisquesService.getRisksForProgramme(selectedProgramme)
        risquesResult = { data: risk ? [{ programme: programmes.find(p => p.id === selectedProgramme), risque: risk }] : [], error: null }
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

  return (
    <div className="risques-programme">
      <div className="risques-header">
        <h2>Matrice des Risques par Programme</h2>
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

      {risques.length === 0 ? (
        <EmptyState 
          icon="AlertTriangle" 
          title="Aucun risque calculé" 
          message={selectedProgramme ? "Aucun risque pour ce programme" : "Aucun risque à afficher"} 
        />
      ) : (
        <>
          {matrixData.length > 0 && (
            <div className="risques-matrix">
              <RiskMatrix risques={matrixData} />
            </div>
          )}
          
          <div className="risques-table">
            <DataTable columns={columns} data={risques} />
          </div>
        </>
      )}
    </div>
  )
}

