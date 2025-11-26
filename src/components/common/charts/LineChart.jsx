import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import ChartContainer from './ChartContainer'

export default function LineChart({ 
  data, 
  dataKey, 
  lines = [], 
  title, 
  subtitle,
  colors = ['#14b8a6', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
  height = 300
}) {
  return (
    <ChartContainer title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey={dataKey} 
            stroke="#64748b"
            style={{ fontSize: '0.75rem' }}
          />
          <YAxis 
            stroke="#64748b"
            style={{ fontSize: '0.75rem' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: 'var(--radius-lg)',
              fontSize: '0.875rem'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '0.875rem', paddingTop: '1rem' }}
          />
          {lines.map((line, index) => (
            <Line
              key={line.key || index}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color || colors[index % colors.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

