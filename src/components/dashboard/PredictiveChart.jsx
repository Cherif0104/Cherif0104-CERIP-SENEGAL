import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
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
          historical: prediction.historical.map(h => ({
            ...h,
            type: 'Réel'
          })),
          predictions: prediction.predictions.map(p => ({
            ...p,
            type: 'Prédiction'
          }))
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
      <div className="predictive-chart">
        <h3>{title}</h3>
        <LoadingState message="Chargement des prévisions..." />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="predictive-chart">
        <h3>{title}</h3>
        <div className="chart-empty">
          <p>Données insuffisantes pour générer une prévision</p>
        </div>
      </div>
    )
  }

  const chartData = [...data.historical, ...data.predictions]

  return (
    <div className="predictive-chart">
      <div className="predictive-chart-header">
        <h3>{title}</h3>
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color historical"></div>
            <span>Réel</span>
          </div>
          <div className="legend-item">
            <div className="legend-color predicted"></div>
            <span>Prédiction</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#2563eb" 
            strokeWidth={2}
            name="Valeurs"
            dot={{ r: 4 }}
          />
          {data.historical.length > 0 && (
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#dc2626" 
              strokeWidth={2}
              strokeDasharray="5 5"
              data={data.predictions}
              name="Prédiction"
              dot={{ r: 4, fill: '#dc2626' }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

