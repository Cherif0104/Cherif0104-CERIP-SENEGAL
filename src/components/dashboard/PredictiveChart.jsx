import { useEffect, useState } from 'react'
import { DonutChart } from '@/components/modules/DonutChart'
import { LoadingState } from '@/components/common/LoadingState'
import { predictiveAnalyticsService } from '@/services/predictive-analytics.service'
import './PredictiveChart.css'

export const PredictiveChart = ({ title, metric = 'programmes' }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [metric])

  const loadData = async () => {
    setLoading(true)
    try {
      const prediction = await predictiveAnalyticsService.predictGrowth(metric, 6)
      if (prediction.historical && prediction.predictions) {
        setData({
          historical: prediction.historical,
          predictions: prediction.predictions
        })
      }
    } catch (error) {
      console.error('Error loading prediction:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="donut-chart-card">
        <h3>{title}</h3>
        <LoadingState message="Chargement des prévisions..." />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="donut-chart-card">
        <h3>{title}</h3>
        <div className="chart-empty">
          <p>Données insuffisantes pour générer une prévision</p>
        </div>
      </div>
    )
  }

  const totalHistorical = data.historical.reduce((sum, h) => sum + (h.value || 0), 0)
  const totalPredicted = data.predictions.reduce((sum, p) => sum + (p.value || 0), 0)

  return (
    <div className="donut-chart-card">
      <DonutChart
        title={title}
        data={[
          {
            name: 'reel',
            label: 'Réel',
            value: totalHistorical,
            color: '#2563eb'
          },
          {
            name: 'prediction',
            label: 'Prédiction',
            value: totalPredicted,
            color: '#dc2626'
          }
        ]}
        centerValue={totalHistorical + totalPredicted}
        centerLabel={metric}
        height={280}
      />
    </div>
  )
}

