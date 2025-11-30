import { useState } from 'react'
import './RiskMatrix.css'

export const RiskMatrix = ({ risks = [], className = '' }) => {
  const [selectedRisk, setSelectedRisk] = useState(null)

  const getRiskLevel = (probability, impact) => {
    const score = (probability * impact) / 100
    if (score >= 75) return { level: 'CRITICAL', color: '#dc2626' }
    if (score >= 50) return { level: 'HIGH', color: '#f59e0b' }
    if (score >= 25) return { level: 'MEDIUM', color: '#fbbf24' }
    return { level: 'LOW', color: '#10b981' }
  }

  const matrixCells = []
  for (let impact = 100; impact >= 0; impact -= 25) {
    for (let probability = 0; probability <= 100; probability += 25) {
      const { level, color } = getRiskLevel(probability, impact)
      const risksInCell = risks.filter(
        (r) =>
          Math.floor(r.probability / 25) * 25 === probability &&
          Math.floor(r.impact / 25) * 25 === impact
      )

      matrixCells.push({
        probability,
        impact,
        level,
        color,
        risks: risksInCell,
      })
    }
  }

  return (
    <div className={`risk-matrix ${className}`}>
      <div className="risk-matrix-header">
        <h3>Matrice de Risques</h3>
        <div className="risk-matrix-legend">
          <div className="risk-legend-item">
            <span className="risk-legend-color" style={{ background: '#dc2626' }} />
            <span>Critique (75-100)</span>
          </div>
          <div className="risk-legend-item">
            <span className="risk-legend-color" style={{ background: '#f59e0b' }} />
            <span>Élevé (50-75)</span>
          </div>
          <div className="risk-legend-item">
            <span className="risk-legend-color" style={{ background: '#fbbf24' }} />
            <span>Moyen (25-50)</span>
          </div>
          <div className="risk-legend-item">
            <span className="risk-legend-color" style={{ background: '#10b981' }} />
            <span>Faible (0-25)</span>
          </div>
        </div>
      </div>
      <div className="risk-matrix-grid">
        <div className="risk-matrix-axis-label-y">Impact</div>
        <div className="risk-matrix-content">
          <div className="risk-matrix-y-axis">
            <span>100</span>
            <span>75</span>
            <span>50</span>
            <span>25</span>
            <span>0</span>
          </div>
          <div className="risk-matrix-cells">
            {matrixCells.map((cell, index) => (
              <div
                key={index}
                className="risk-matrix-cell"
                style={{ background: cell.color }}
                onClick={() => cell.risks.length > 0 && setSelectedRisk(cell)}
                title={`Probabilité: ${cell.probability}%, Impact: ${cell.impact}%`}
              >
                {cell.risks.length > 0 && (
                  <span className="risk-matrix-count">{cell.risks.length}</span>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="risk-matrix-x-axis">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
        <div className="risk-matrix-axis-label-x">Probabilité</div>
      </div>
      {selectedRisk && selectedRisk.risks.length > 0 && (
        <div className="risk-matrix-details">
          <h4>Risques dans cette zone</h4>
          <ul>
            {selectedRisk.risks.map((risk, index) => (
              <li key={index}>{risk.nom || risk.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

