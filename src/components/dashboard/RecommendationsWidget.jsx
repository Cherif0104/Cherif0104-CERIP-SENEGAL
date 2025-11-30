import { useEffect, useState } from 'react'
import { Icon } from '@/components/common/Icon'
import { LoadingState } from '@/components/common/LoadingState'
import { predictiveAnalyticsService } from '@/services/predictive-analytics.service'
import './RecommendationsWidget.css'

export const RecommendationsWidget = () => {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecommendations()
  }, [])

  const loadRecommendations = async () => {
    setLoading(true)
    try {
      const data = await predictiveAnalyticsService.getSmartRecommendations()
      setRecommendations(data.recommendations || [])
    } catch (error) {
      console.error('Error loading recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="recommendations-widget">
        <div className="recommendations-header">
          <Icon name="Lightbulb" size={20} />
          <h3>Recommandations</h3>
        </div>
        <LoadingState message="Chargement des recommandations..." />
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className="recommendations-widget">
        <div className="recommendations-header">
          <Icon name="Lightbulb" size={20} />
          <h3>Recommandations</h3>
        </div>
        <div className="recommendations-empty">
          <Icon name="CheckCircle" size={24} />
          <p>Aucune recommandation pour le moment</p>
        </div>
      </div>
    )
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH':
        return <Icon name="AlertTriangle" size={16} className="priority-high" />
      case 'MEDIUM':
        return <Icon name="Info" size={16} className="priority-medium" />
      default:
        return <Icon name="CheckCircle" size={16} className="priority-low" />
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'BUDGET':
        return 'DollarSign'
      case 'CONVERSION':
        return 'TrendingUp'
      case 'RISK':
        return 'AlertTriangle'
      case 'PROGRAMME':
        return 'FolderKanban'
      case 'PROJET':
        return 'Briefcase'
      default:
        return 'Info'
    }
  }

  return (
    <div className="recommendations-widget">
      <div className="recommendations-header">
        <Icon name="Lightbulb" size={20} />
        <h3>Recommandations intelligentes</h3>
        <button onClick={loadRecommendations} className="refresh-btn">
          <Icon name="RefreshCw" size={14} />
        </button>
      </div>
      <div className="recommendations-list">
        {recommendations.map((rec, index) => (
          <div key={index} className={`recommendation-item priority-${rec.priority?.toLowerCase()}`}>
            <div className="recommendation-icon">
              {getPriorityIcon(rec.priority)}
            </div>
            <div className="recommendation-content">
              <div className="recommendation-type">
                <Icon name={getTypeIcon(rec.type)} size={14} />
                <span>{rec.type}</span>
              </div>
              <p className="recommendation-message">{rec.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

