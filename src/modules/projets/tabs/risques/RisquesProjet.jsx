import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { projetsService } from '@/services/projets.service'
import { riskManagementService } from '@/services/riskManagement.service'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { RiskMatrix } from '@/components/modules/RiskMatrix'
import { DataTable } from '@/components/common/DataTable'
import { Select } from '@/components/common/Select'
import { toast } from '@/components/common/Toast'
import { logger } from '@/utils/logger'
import './RisquesProjet.css'

export default function RisquesProjet() {
  const [searchParams] = useSearchParams()
  const projetIdFromUrl = searchParams.get('projet_id')
  
  const [risques, setRisques] = useState([])
  const [projets, setProjets] = useState([])
  const [selectedProjet, setSelectedProjet] = useState(projetIdFromUrl || '')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [selectedProjet])

  const loadData = async () => {
    setLoading(true)
    try {
      // Charger la liste des projets pour le filtre
      const projResult = await projetsService.getAll()
      if (projResult.error) {
        logger.error('RISQUES_PROJET', 'Erreur chargement projets', projResult.error)
      } else {
        setProjets(projResult.data || [])
      }

      // Charger les risques
      let risquesData = []
      if (selectedProjet) {
        const risk = await riskManagementService.calculateGlobalRisk(selectedProjet)
        if (risk) {
          risquesData = [{
            projet: projets.find(p => p.id === selectedProjet),
            risque: risk,
          }]
        }
      } else {
        // Calculer risques pour tous les projets
        if (projResult.data && projResult.data.length > 0) {
          const risksPromises = projResult.data.map(async (proj) => {
            const risk = await riskManagementService.calculateGlobalRisk(proj.id)
            return {
              projet: proj,
              risque: risk,
            }
          })
          const risksResults = await Promise.all(risksPromises)
          risquesData = risksResults.filter(r => r.risque !== null)
        }
      }

      setRisques(risquesData)
    } catch (error) {
      logger.error('RISQUES_PROJET', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'projet', label: 'Projet', render: (value) => value?.nom || '-' },
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
    id: r.projet?.id,
    nom: r.projet?.nom,
    probabilite: r.risque?.risques?.reduce((max, risk) => Math.max(max, risk.probabilite), 0) || 0,
    impact: r.risque?.risques?.reduce((max, risk) => Math.max(max, risk.impact), 0) || 0,
    score: r.risque?.scoreGlobal || 0,
    niveau: r.risque?.niveau || 'LOW',
  }))

  return (
    <div className="risques-projet">
      <div className="risques-header">
        <h2>Matrice des Risques par Projet</h2>
        <Select
          label="Filtrer par projet"
          value={selectedProjet}
          onChange={(e) => setSelectedProjet(e.target.value)}
          options={[
            { value: '', label: 'Tous les projets' },
            ...(projets || []).map(p => ({ value: p.id, label: p.nom }))
          ]}
        />
      </div>

      {risques.length === 0 ? (
        <EmptyState 
          icon="AlertTriangle" 
          title="Aucun risque calculé" 
          message={selectedProjet ? "Aucun risque pour ce projet" : "Aucun risque à afficher"} 
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

