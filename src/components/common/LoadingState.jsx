import './LoadingState.css'

/**
 * Composant LoadingState - État de chargement standardisé
 * 
 * @param {string} variant - Variante: 'spinner' | 'skeleton' | 'progress'
 * @param {string} message - Message de chargement
 * @param {boolean} fullScreen - Plein écran ou conteneur
 */
export default function LoadingState({ 
  variant = 'spinner',
  message = 'Chargement...',
  fullScreen = false
}) {
  if (variant === 'skeleton') {
    return (
      <div className={`loading-skeleton ${fullScreen ? 'loading-skeleton--fullscreen' : ''}`}>
        <div className="skeleton-item"></div>
        <div className="skeleton-item"></div>
        <div className="skeleton-item"></div>
      </div>
    )
  }

  if (variant === 'progress') {
    return (
      <div className={`loading-progress ${fullScreen ? 'loading-progress--fullscreen' : ''}`}>
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
        {message && <p className="progress-message">{message}</p>}
      </div>
    )
  }

  // Variante spinner (par défaut)
  return (
    <div className={`loading-state ${fullScreen ? 'loading-state--fullscreen' : ''}`}>
      <div className="spinner"></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  )
}

