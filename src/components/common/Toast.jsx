import { useEffect, useState } from 'react'
import { Icon } from './Icon'
import './Toast.css'

/**
 * Toast - Composant pour afficher des notifications
 * @param {Object} props
 * @param {string} props.message - Message à afficher
 * @param {string} props.type - Type de toast (success, error, warning, info)
 * @param {number} props.duration - Durée d'affichage en ms (défaut: 3000)
 * @param {Function} props.onClose - Callback appelé à la fermeture
 */
export function Toast({ message, type = 'info', duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onClose?.(), 300) // Attendre animation
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  if (!isVisible) return null

  const icons = {
    success: 'CheckCircle',
    error: 'XCircle',
    warning: 'AlertTriangle',
    info: 'Info',
  }

  return (
    <div className={`toast toast-${type} ${isVisible ? 'toast-visible' : ''}`}>
      <Icon name={icons[type] || 'Info'} size={20} />
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={() => setIsVisible(false)}>
        <Icon name="X" size={16} />
      </button>
    </div>
  )
}

/**
 * ToastContainer - Container pour gérer plusieurs toasts
 */
export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  // Exposer fonction globale pour ajouter des toasts
  useEffect(() => {
    window.showToast = (message, type = 'info', duration = 3000) => {
      const id = Date.now()
      setToasts((prev) => [...prev, { id, message, type, duration }])
      return id
    }

    return () => {
      delete window.showToast
    }
  }, [])

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

// Helpers pour faciliter l'utilisation
export const toast = {
  success: (message, duration = 3000) => {
    if (window.showToast) window.showToast(message, 'success', duration)
  },
  error: (message, duration = 5000) => {
    if (window.showToast) window.showToast(message, 'error', duration)
  },
  warning: (message, duration = 4000) => {
    if (window.showToast) window.showToast(message, 'warning', duration)
  },
  info: (message, duration = 3000) => {
    if (window.showToast) window.showToast(message, 'info', duration)
  },
}

