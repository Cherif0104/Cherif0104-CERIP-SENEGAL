import { useState, useEffect } from 'react'
import { toastService } from '../../services/toast.service'
import Toast from './Toast'
import './Toast.css'

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    // S'abonner aux changements de toasts
    const unsubscribe = toastService.subscribe((newToasts) => {
      setToasts(newToasts)
    })

    return unsubscribe
  }, [])

  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={() => toastService.remove(toast.id)}
        />
      ))}
    </div>
  )
}

