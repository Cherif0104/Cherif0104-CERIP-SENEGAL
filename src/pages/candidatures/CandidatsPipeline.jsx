import { useState } from 'react'
import './CandidatsPipeline.css'

export default function CandidatsPipeline() {
  const columns = [
    { id: 'en-attente', title: 'En attente', items: [] },
    { id: 'en-evaluation', title: 'En évaluation', items: [] },
    { id: 'eligible', title: 'Éligible', items: [] },
    { id: 'accepte', title: 'Accepté', items: [] },
  ]

  return (
    <div className="pipeline-kanban">
      <h2>Pipeline des candidats</h2>
      <div className="pipeline-columns">
        {columns.map((column) => (
          <div key={column.id} className="pipeline-column">
            <h3>{column.title}</h3>
            <div className="pipeline-items">
              {column.items.length === 0 && (
                <div className="pipeline-empty">Aucun candidat</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

