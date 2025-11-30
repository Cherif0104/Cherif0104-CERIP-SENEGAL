import { Loader2 } from 'lucide-react'
import './LoadingState.css'

export const LoadingState = ({ message = 'Chargement...', fullScreen = false }) => {
  const className = fullScreen ? 'loading-state-fullscreen' : 'loading-state'

  return (
    <div className={className}>
      <Loader2 className="loading-spinner" />
      <p className="loading-message">{message}</p>
    </div>
  )
}

