import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import ChartContainer from './ChartContainer'

const COLORS = ['#14b8a6', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#f97316', '#6366f1']

export default function PieChart({ 
  data, 
  dataKey = 'value',
  nameKey = 'name',
  title, 
  subtitle,
  colors = COLORS,
  height = 300,
  innerRadius = 0,
  outerRadius = 80
}) {
  return (
    <ChartContainer title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: 'var(--radius-lg)',
              fontSize: '0.875rem'
            }}
            formatter={(value, name) => [value, name]}
          />
          <Legend 
            wrapperStyle={{ fontSize: '0.875rem', paddingTop: '1rem' }}
            formatter={(value) => value}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

