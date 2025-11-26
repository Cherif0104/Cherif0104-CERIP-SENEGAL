import './ChartContainer.css'

export default function ChartContainer({ title, subtitle, children, className = '' }) {
  return (
    <div className={`chart-container ${className}`}>
      {(title || subtitle) && (
        <div className="chart-header">
          {title && <h3 className="chart-title">{title}</h3>}
          {subtitle && <p className="chart-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="chart-content">
        {children}
      </div>
    </div>
  )
}

