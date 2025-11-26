import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import ChartContainer from './ChartContainer'

export default function BarChart({ 
  data, 
  dataKey, 
  bars = [], 
  title, 
  subtitle,
  colors = ['#14b8a6', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
  height = 300,
  layout = 'horizontal' // 'horizontal' ou 'vertical'
}) {
  return (
    <ChartContainer title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart 
          data={data} 
          layout={layout}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          {layout === 'horizontal' ? (
            <>
              <XAxis type="number" stroke="#64748b" style={{ fontSize: '0.75rem' }} />
              <YAxis dataKey={dataKey} type="category" stroke="#64748b" style={{ fontSize: '0.75rem' }} width={100} />
            </>
          ) : (
            <>
              <XAxis dataKey={dataKey} stroke="#64748b" style={{ fontSize: '0.75rem' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '0.75rem' }} />
            </>
          )}
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
          {bars.map((bar, index) => (
            <Bar
              key={bar.key || index}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color || colors[index % colors.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

