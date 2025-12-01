import { useState, useEffect } from 'react'
import { projetsRisquesService } from '@/services/projets-risques.service'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { MetricCard } from '@/components/modules/MetricCard'
import { AlertsSection } from '@/components/modules/AlertsSection'
import { RiskMatrix } from '@/components/modules/RiskMatrix'
import { DonutChart } from '@/components/modules/DonutChart'
import { toast } from '@/components/common/Toast'
import { logger } from '@/utils/logger'
import { useNavigate } from 'react-router-dom'
import './RisquesProjetDetail.css'

/**
 * Composant de gestion des risques pour un projet spécifique
 * Affiche la matrice des risques, les alertes et permet la remontée au programme
 * @param {string} projetId - ID du projet
 */
export default function RisquesProjetDetail({ projetId: projetIdProp = null }) {
  const navigate = useNavigate()
  const [risqueGlobal, setRisqueGlobal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [remontant, setRemontant] = useState(false)

  useEffect(() => {
    if (projetIdProp) {
      loadRisques()
    }
  }, [projetIdProp])

  const loadRisques = async () => {
    if (!projetIdProp) return
    
    setLoading(true)
    try {
      const risque = await projetsRisquesService.getRisksForProjet(projetIdProp)
      setRisqueGlobal(risque)
    } catch (error) {
      logger.error('RISQUES_PROJET_DETAIL', 'Erreur chargement risques', error)
      toast.error('Erreur lors du chargement des risques')
    } finally {
      setLoading(false)
    }
  }

  const handleRemonterAuProgramme = async () => {
    if (!confirm('Remonter ce risque critique au programme ?')) return

    setRemontant(true)
    try {
      const { error } = await projetsRisquesService.remonterRisqueAuProgramme(projetIdProp)
      if (error) {
        toast.error(error.message || 'Erreur lors de la remontée')
      } else {
        toast.success('Risque remonté au programme avec succès')
      }
    } catch (error) {
      logger.error('RISQUES_PROJET_DETAIL', 'Erreur remontée', error)
      toast.error('Une erreur est survenue')
    } finally {
      setRemontant(false)
    }
  }

  const getNiveauColor = (niveau) => {
    switch (niveau) {
      case 'CRITICAL': return '#ef4444'
      case 'HIGH': return '#f59e0b'
      case 'MEDIUM': return '#fbbf24'
      case 'LOW': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getNiveauLabel = (niveau) => {
    switch (niveau) {
      case 'CRITICAL': return 'Critique'
      case 'HIGH': return 'Élevé'
      case 'MEDIUM': return 'Moyen'
      case 'LOW': return 'Faible'
      default: return niveau
    }
  }

  if (!projetIdProp) {
    return (
      <EmptyState 
        icon="AlertTriangle" 
        title="Projet non spécifié" 
        message="Impossible de charger les risques sans ID de projet"
      />
    )
  }

  if (loading) {
    return <LoadingState message="Calcul des risques..." />
  }

  if (!risqueGlobal) {
    return (
      <EmptyState 
        icon="AlertTriangle" 
        title="Aucun risque calculé" 
        message="Impossible de calculer les risques pour ce projet"
      />
    )
  }

  const { scoreGlobal, niveau, risques } = risqueGlobal

  // Générer les alertes
  const alerts = []
  if (niveau === 'CRITICAL') {
    alerts.push({
      priority: 'CRITICAL',
      title: 'Risque critique détecté',
      description: `Le score de risque global est critique (${scoreGlobal}/100). Une remontée au programme est recommandée.`,
      action: handleRemonterAuProgramme,
      actionLabel: 'Remonter au programme',
    })
  } else if (niveau === 'HIGH') {
    alerts.push({
      priority: 'HIGH',
      title: 'Risque élevé',
      description: `Le score de risque global est élevé (${scoreGlobal}/100). Surveillez attentivement ce projet.`,
    })
  }

  // Préparer les données pour la matrice
  const matrixData = [{
    id: projetIdProp,
    nom: 'Projet',
    probabilite: risques.reduce((max, r) => Math.max(max, r.probabilite), 0),
    impact: risques.reduce((max, r) => Math.max(max, r.impact), 0),
    score: scoreGlobal,
    niveau: niveau,
  }]

  // Répartition des risques par type
  const repartitionRisques = risques.map(r => ({
    name: r.type,
    label: r.type === 'budget' ? 'Budget' : r.type === 'retard' ? 'Retard' : r.type === 'assiduite' ? 'Assiduité' : r.type,
    value: r.score,
    color: getNiveauColor(r.niveau),
  }))

  return (
    <div className="risques-projet-detail">
      <div className="risques-header">
        <h2>Analyse des Risques du Projet</h2>
        {niveau === 'CRITICAL' && (
          <Button 
            variant="danger" 
            onClick={handleRemonterAuProgramme}
            disabled={remontant}
          >
            <Icon name="ArrowUp" size={16} />
            {remontant ? 'Remontée en cours...' : 'Remonter au programme'}
          </Button>
        )}
      </div>

      {alerts.length > 0 && <AlertsSection alerts={alerts} />}

      <div className="risques-metrics">
        <MetricCard
          title="Score global de risque"
          value={`${scoreGlobal}/100`}
          detail={`Niveau: ${getNiveauLabel(niveau)}`}
          variant={niveau === 'CRITICAL' ? 'danger' : niveau === 'HIGH' ? 'warning' : niveau === 'MEDIUM' ? 'info' : 'success'}
        />
        <MetricCard
          title="Nombre de risques"
          value={risques.length}
          detail="Types de risques analysés"
          variant="default"
        />
        <MetricCard
          title="Risque le plus élevé"
          value={risques.length > 0 ? Math.max(...risques.map(r => r.score)) : 0}
          detail={risques.length > 0 ? risques.find(r => r.score === Math.max(...risques.map(r => r.score)))?.type : '-'}
          variant="warning"
        />
      </div>

      {risques.length > 0 && (
        <div className="risques-section">
          <h3>Détail des Risques</h3>
          <div className="risques-detail-grid">
            {risques.map((risque, index) => (
              <div key={index} className="risque-card">
                <div className="risque-header">
                  <span className={`risque-badge risque-${risque.niveau?.toLowerCase()}`}>
                    {getNiveauLabel(risque.niveau)}
                  </span>
                  <span className="risque-score">{risque.score}/100</span>
                </div>
                <div className="risque-body">
                  <h4>{risque.type === 'budget' ? 'Risque Budgétaire' : risque.type === 'retard' ? 'Risque de Retard' : 'Risque d\'Assiduité'}</h4>
                  <div className="risque-metrics">
                    <div className="risque-metric">
                      <span className="metric-label">Probabilité</span>
                      <span className="metric-value">{risque.probabilite}%</span>
                    </div>
                    <div className="risque-metric">
                      <span className="metric-label">Impact</span>
                      <span className="metric-value">{risque.impact}%</span>
                    </div>
                  </div>
                  {risque.details && (
                    <div className="risque-details">
                      {Object.entries(risque.details).map(([key, value]) => (
                        <div key={key} className="detail-item">
                          <span className="detail-label">{key}:</span>
                          <span className="detail-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {matrixData.length > 0 && (
        <div className="risques-section">
          <h3>Matrice des Risques</h3>
          <div className="risques-matrix-container">
            <RiskMatrix risques={matrixData} />
          </div>
        </div>
      )}

      {repartitionRisques.length > 0 && (
        <div className="risques-section">
          <h3>Répartition des Risques</h3>
          <div className="risques-chart-container">
            <DonutChart
              title="Répartition par type de risque"
              data={repartitionRisques}
              centerValue={scoreGlobal}
              centerLabel="Score global"
              height={300}
            />
          </div>
        </div>
      )}
    </div>
  )
}

