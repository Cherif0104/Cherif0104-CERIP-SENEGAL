import { FunnelChart, Funnel, LabelList, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import './FunnelVisualization.css'

export const FunnelVisualization = ({ data = [], className = '' }) => {
  const colors = [
    '#dc2626',
    '#f59e0b',
    '#10b981',
    '#2563eb',
    '#7c3aed',
  ]

  return (
    <div className={`funnel-section-modern ${className}`}>
      <h3 className="funnel-section-title">Pipeline</h3>
      <ResponsiveContainer width="100%" height={400}>
        <FunnelChart>
          <Tooltip />
          <Funnel
            dataKey="value"
            data={data}
            isAnimationActive
          >
            <LabelList
              position="right"
              fill="#000"
              stroke="none"
              dataKey="name"
            />
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </div>
  )
}

