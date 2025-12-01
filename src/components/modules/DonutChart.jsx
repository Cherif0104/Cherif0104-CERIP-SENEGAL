import { useState } from 'react'
import './DonutChart.css'

/**
 * Composant de graphique en donut moderne avec tooltips et animations
 */
export const DonutChart = ({
  title,
  data = [],
  centerValue,
  centerLabel,
  height = 200,
  className = '',
  animate = true,
  showTooltip = true,
}) => {
  const [hoveredSegment, setHoveredSegment] = useState(null)
  if (!data || data.length === 0) {
    return (
      <div className={`donut-chart-container ${className}`}>
        {title && <h3 className="donut-chart-title">{title}</h3>}
        <div className="donut-chart-empty">Aucune donnée disponible</div>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + (item.value || 0), 0)
  
  if (total === 0) {
    return (
      <div className={`donut-chart-container ${className}`}>
        {title && <h3 className="donut-chart-title">{title}</h3>}
        <div className="donut-chart-empty">Aucune donnée disponible</div>
      </div>
    )
  }

  const colors = ['#4facfe', '#e5e7eb', '#374151', '#f5576c', '#43e97b', '#667eea', '#f093fb']
  const size = height
  const radius = (size - 40) / 2
  const strokeWidth = 20
  const centerX = size / 2
  const centerY = size / 2
  const circumference = 2 * Math.PI * radius

  let currentOffset = 0

  const segments = data.map((item, index) => {
    const value = item.value || 0
    const percentage = (value / total) * 100
    const strokeDasharray = (value / total) * circumference
    const strokeDashoffset = -currentOffset
    currentOffset += strokeDasharray

    return {
      ...item,
      percentage: Math.round(percentage),
      strokeDasharray,
      strokeDashoffset,
      color: item.color || colors[index % colors.length],
    }
  })

  return (
    <div className={`donut-chart-container ${className}`}>
      {title && <h3 className="donut-chart-title">{title}</h3>}
      <div className="donut-chart-wrapper">
        <svg viewBox={`0 0 ${size} ${size}`} className="donut-chart-svg">
          {segments.map((segment, index) => {
            const isHovered = hoveredSegment === index
            return (
              <g key={index}>
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={segment.strokeDasharray}
                  strokeDashoffset={segment.strokeDashoffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${centerX} ${centerY})`}
                  className={`donut-chart-segment ${animate ? 'donut-segment-animated' : ''}`}
                  style={animate ? { 
                    animation: `drawDonut 0.8s ease-out ${index * 0.1}s both`,
                    transition: 'stroke-width 0.2s ease, opacity 0.2s ease'
                  } : { transition: 'stroke-width 0.2s ease, opacity 0.2s ease' }}
                  onMouseEnter={() => showTooltip && setHoveredSegment(index)}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
                {/* Tooltip au survol */}
                {isHovered && showTooltip && (
                  <g className="donut-tooltip-group">
                    <text
                      x={centerX}
                      y={centerY - radius - 30}
                      textAnchor="middle"
                      fill={segment.color}
                      fontSize="14"
                      fontWeight="700"
                      className="donut-tooltip-label"
                    >
                      {segment.label || segment.name}
                    </text>
                    <text
                      x={centerX}
                      y={centerY - radius - 15}
                      textAnchor="middle"
                      fill="#6b7280"
                      fontSize="12"
                      className="donut-tooltip-value"
                    >
                      {segment.value.toLocaleString('fr-FR')} ({segment.percentage}%)
                    </text>
                  </g>
                )}
              </g>
            )
          })}
        </svg>
        <div className="donut-chart-center">
          {centerValue !== undefined && (
            <div className="donut-chart-center-value">{centerValue}</div>
          )}
          {centerLabel && (
            <div className="donut-chart-center-label">{centerLabel}</div>
          )}
        </div>
      </div>
      <div className="donut-chart-legend">
        {segments.map((segment, index) => (
          <div key={index} className="donut-chart-legend-item">
            <span
              className="donut-chart-legend-color"
              style={{ backgroundColor: segment.color }}
            />
            <span className="donut-chart-legend-label">{segment.label || segment.name}</span>
            <span className="donut-chart-legend-value">{segment.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

