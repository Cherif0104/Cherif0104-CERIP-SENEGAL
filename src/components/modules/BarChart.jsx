import { useState } from 'react'
import './BarChart.css'

/**
 * Composant de graphique en barres (horizontal ou vertical) avec tooltips et animations
 */
export const BarChart = ({
  title,
  data = [],
  orientation = 'vertical', // 'vertical' ou 'horizontal'
  height = 200,
  className = '',
  animate = true,
  showTooltip = true,
}) => {
  const [hoveredBar, setHoveredBar] = useState(null)
  if (!data || data.length === 0) {
    return (
      <div className={`bar-chart-container ${className}`}>
        {title && <h3 className="bar-chart-title">{title}</h3>}
        <div className="bar-chart-empty">Aucune donnée disponible</div>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value || 0), 1)
  const colors = ['#4facfe', '#f5576c', '#43e97b', '#667eea', '#f093fb']

  if (orientation === 'horizontal') {
    return (
      <div className={`bar-chart-container ${className}`}>
        {title && <h3 className="bar-chart-title">{title}</h3>}
        <div className="bar-chart-horizontal">
          {data.map((item, index) => {
            const percentage = ((item.value || 0) / maxValue) * 100
            return (
              <div 
                key={index} 
                className={`bar-chart-horizontal-item ${animate ? 'bar-animated' : ''}`}
                style={animate ? { animationDelay: `${index * 0.05}s` } : {}}
                onMouseEnter={() => showTooltip && setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                <div className="bar-chart-horizontal-label">{item.label || item.name}</div>
                <div className="bar-chart-horizontal-bar-wrapper">
                  <div
                    className={`bar-chart-horizontal-bar ${hoveredBar === index ? 'bar-hovered' : ''}`}
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: item.color || colors[index % colors.length],
                    }}
                  >
                    <span className="bar-chart-horizontal-value">{item.value || 0}</span>
                    {hoveredBar === index && showTooltip && (
                      <div className="bar-tooltip-horizontal">
                        <strong>{item.label || item.name}</strong>
                        <br />
                        {item.value?.toLocaleString('fr-FR')} ({percentage.toFixed(1)}%)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Vertical bars
  const barWidth = 60
  const spacing = 20
  const chartWidth = data.length * (barWidth + spacing) + spacing
  const chartHeight = height

  return (
    <div className={`bar-chart-container ${className}`}>
      {title && <h3 className="bar-chart-title">{title}</h3>}
      <div className="bar-chart-vertical-wrapper">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} className="bar-chart-svg">
          {/* Axe X */}
          <line
            x1={spacing}
            y1={chartHeight}
            x2={chartWidth - spacing}
            y2={chartHeight}
            stroke="#e5e7eb"
            strokeWidth="2"
          />

          {/* Barres */}
          {data.map((item, index) => {
            const x = spacing + index * (barWidth + spacing)
            const value = item.value || 0
            const barHeight = (value / maxValue) * (chartHeight - 40)
            const y = chartHeight - barHeight

            return (
              <g key={index}>
                <g 
                  onMouseEnter={() => showTooltip && setHoveredBar(index)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={item.color || colors[index % colors.length]}
                    className={`bar-chart-bar ${hoveredBar === index ? 'bar-hovered' : ''} ${animate ? 'bar-animated' : ''}`}
                    rx="4"
                    style={animate ? { animationDelay: `${index * 0.05}s` } : {}}
                  />
                  {/* Tooltip pour barres verticales */}
                  {hoveredBar === index && showTooltip && (
                    <g className="bar-tooltip-vertical-group">
                      <rect
                        x={x + barWidth / 2 - 50}
                        y={y - 35}
                        width="100"
                        height="30"
                        fill="rgba(17, 24, 39, 0.95)"
                        rx="6"
                      />
                      <text
                        x={x + barWidth / 2}
                        y={y - 18}
                        textAnchor="middle"
                        fill="white"
                        fontSize="11"
                        fontWeight="600"
                      >
                        {item.label || item.name}: {value}
                      </text>
                    </g>
                  )}
                </g>
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#1f2937"
                  fontWeight="600"
                >
                  {value}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 20}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#6b7280"
                >
                  {item.label || item.name}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

