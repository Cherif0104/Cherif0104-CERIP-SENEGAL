import { useState } from 'react'
import './LineChart.css'

/**
 * Composant de graphique en ligne simple et moderne avec tooltips et animations
 */
export const LineChart = ({
  title,
  data = [],
  lines = [],
  height = 200,
  className = '',
  showTooltip = true,
  animate = true,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState(null)
  if (!data || data.length === 0) {
    return (
      <div className={`line-chart-container ${className}`}>
        {title && <h3 className="line-chart-title">{title}</h3>}
        <div className="line-chart-empty">Aucune donnée disponible</div>
      </div>
    )
  }

  // Déterminer les valeurs min/max pour l'échelle
  const allValues = data.flatMap(d => 
    lines.map(line => d[line.key] || 0)
  )
  const maxValue = Math.max(...allValues, 1)
  const minValue = Math.min(...allValues, 0)
  const range = maxValue - minValue || 1

  // Dimensions du graphique
  const padding = 40
  const chartWidth = 800
  const chartHeight = height
  const graphWidth = chartWidth - padding * 2
  const graphHeight = chartHeight - padding * 2

  // Générer les points pour chaque ligne
  const generatePath = (lineKey) => {
    return data.map((d, index) => {
      const x = (index / (data.length - 1 || 1)) * graphWidth + padding
      const value = d[lineKey] || 0
      const y = chartHeight - padding - ((value - minValue) / range) * graphHeight
      return `${x},${y}`
    }).join(' ')
  }

  const colors = ['#4facfe', '#f5576c', '#43e97b', '#667eea', '#f093fb']

  return (
    <div className={`line-chart-container ${className}`}>
      {title && <h3 className="line-chart-title">{title}</h3>}
      <div className="line-chart-wrapper">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="line-chart-svg">
          {/* Grille horizontale */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding + graphHeight * (1 - ratio)
            const value = minValue + range * ratio
            return (
              <g key={ratio}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x={padding - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {Math.round(value)}
                </text>
              </g>
            )
          })}

          {/* Lignes de données */}
          {lines.map((line, lineIndex) => {
            const path = generatePath(line.key)
            const lineColor = line.color || colors[lineIndex % colors.length]
            return (
              <g key={line.key} className={animate ? 'line-chart-animated' : ''}>
                <polyline
                  points={path}
                  fill="none"
                  stroke={lineColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="line-chart-line"
                  style={animate ? { animation: `drawLine 1s ease-out ${lineIndex * 0.2}s both` } : {}}
                />
                <polygon
                  points={`${padding},${chartHeight - padding} ${path} ${chartWidth - padding},${chartHeight - padding}`}
                  fill={lineColor}
                  opacity="0.1"
                  className="line-chart-area"
                  style={animate ? { animation: `fadeInArea 0.8s ease-out ${lineIndex * 0.2 + 0.5}s both` } : {}}
                />
              </g>
            )
          })}

          {/* Points avec tooltips */}
          {data.map((d, index) => {
            const x = (index / (data.length - 1 || 1)) * graphWidth + padding
            const isHovered = hoveredPoint?.index === index
            return lines.map((line, lineIndex) => {
              const value = d[line.key] || 0
              const y = chartHeight - padding - ((value - minValue) / range) * graphHeight
              const lineColor = line.color || colors[lineIndex % colors.length]
              
              return (
                <g key={`${index}-${line.key}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? "6" : "4"}
                    fill={lineColor}
                    className="line-chart-point"
                    style={{ 
                      transition: 'r 0.2s ease',
                      cursor: showTooltip ? 'pointer' : 'default'
                    }}
                    onMouseEnter={() => showTooltip && setHoveredPoint({ index, value, label: line.label || line.key, color: lineColor, data: d })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Cercle de halo au survol */}
                  {isHovered && (
                    <circle
                      cx={x}
                      cy={y}
                      r="10"
                      fill={lineColor}
                      opacity="0.2"
                      className="line-chart-point-halo"
                    />
                  )}
                </g>
              )
            })
          })}
          
          {/* Tooltip */}
          {hoveredPoint && showTooltip && (
            <g className="line-chart-tooltip-group">
              {/* Ligne verticale de repère */}
              <line
                x1={(hoveredPoint.index / (data.length - 1 || 1)) * graphWidth + padding}
                y1={padding}
                x2={(hoveredPoint.index / (data.length - 1 || 1)) * graphWidth + padding}
                y2={chartHeight - padding}
                stroke="#9ca3af"
                strokeWidth="1"
                strokeDasharray="4,4"
                opacity="0.5"
              />
              {/* Rectangle de fond du tooltip */}
              <rect
                x={(hoveredPoint.index / (data.length - 1 || 1)) * graphWidth + padding - 60}
                y={padding + 10}
                width="120"
                height={lines.length * 25 + 10}
                fill="rgba(17, 24, 39, 0.95)"
                rx="6"
                className="line-chart-tooltip-bg"
              />
              {/* Texte du tooltip */}
              {lines.map((line, lineIndex) => {
                const value = data[hoveredPoint.index][line.key] || 0
                const lineColor = line.color || colors[lineIndex % colors.length]
                return (
                  <text
                    key={line.key}
                    x={(hoveredPoint.index / (data.length - 1 || 1)) * graphWidth + padding}
                    y={padding + 30 + lineIndex * 25}
                    textAnchor="middle"
                    fill="white"
                    fontSize="11"
                    fontWeight="500"
                  >
                    <tspan fill={lineColor} fontSize="12" fontWeight="700">
                      {line.label || line.key}: 
                    </tspan>
                    {' '}
                    {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
                  </text>
                )
              })}
            </g>
          )}
        </svg>
      </div>
      {lines.length > 1 && (
        <div className="line-chart-legend">
          {lines.map((line, index) => (
            <div key={line.key} className="line-chart-legend-item">
              <span
                className="line-chart-legend-color"
                style={{
                  backgroundColor: line.color || colors[index % colors.length],
                }}
              />
              <span>{line.label || line.key}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

