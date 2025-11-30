import './MetricCard.css'

export const MetricCard = ({
  title,
  value,
  detail,
  progress,
  progressLabel,
  className = '',
}) => {
  const progressPercentage = Math.min(100, Math.max(0, progress || 0))

  return (
    <div className={`metric-card-modern ${className}`}>
      <div className="metric-card-header">
        <span className="metric-card-title">{title}</span>
      </div>
      <div className="metric-card-value">{value}</div>
      {detail && <div className="metric-card-detail">{detail}</div>}
      {progress !== undefined && (
        <div className="metric-card-progress-wrapper">
          <div className="metric-card-progress">
            <div
              className="metric-card-progress-bar"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          {progressLabel && (
            <span className="metric-card-progress-label">{progressLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}

