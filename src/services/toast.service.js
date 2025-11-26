// Service de gestion des toasts/notifications
// Remplace les alert() natifs par un système de notifications moderne

class ToastService {
  constructor() {
    this.listeners = []
    this.toasts = []
    this.toastId = 0
  }

  // S'abonner aux changements de toasts
  subscribe(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback)
    }
  }

  // Notifier tous les listeners
  notify() {
    this.listeners.forEach(callback => callback([...this.toasts]))
  }

  // Créer un toast
  createToast(type, message, duration = 5000) {
    const id = ++this.toastId
    const toast = {
      id,
      type, // 'success', 'error', 'info', 'warning'
      message,
      duration,
      timestamp: Date.now()
    }

    this.toasts.push(toast)
    this.notify()

    // Auto-suppression après duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id)
      }, duration)
    }

    return id
  }

  // Supprimer un toast
  remove(id) {
    this.toasts = this.toasts.filter(t => t.id !== id)
    this.notify()
  }

  // Supprimer tous les toasts
  clear() {
    this.toasts = []
    this.notify()
  }

  // Méthodes de convenance
  success(message, duration = 5000) {
    return this.createToast('success', message, duration)
  }

  error(message, duration = 7000) {
    return this.createToast('error', message, duration)
  }

  info(message, duration = 5000) {
    return this.createToast('info', message, duration)
  }

  warning(message, duration = 6000) {
    return this.createToast('warning', message, duration)
  }
}

// Instance singleton
export const toastService = new ToastService()

