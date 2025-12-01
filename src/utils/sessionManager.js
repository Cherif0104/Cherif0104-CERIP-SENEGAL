/**
 * Gestionnaire de session avec timeout d'inactivité
 * - Détecte l'inactivité de l'utilisateur
 * - Expire la session après 10 minutes d'inactivité
 * - Maintient la session active lors des interactions
 */

const INACTIVITY_TIMEOUT = 10 * 60 * 1000 // 10 minutes en millisecondes
const CHECK_INTERVAL = 60 * 1000 // Vérifier toutes les minutes

class SessionManager {
  constructor() {
    this.lastActivityTime = Date.now()
    this.timeoutId = null
    this.checkIntervalId = null
    this.onExpireCallback = null
    this.isActive = false
  }

  /**
   * Démarrer le gestionnaire de session
   * @param {Function} onExpire - Callback appelé quand la session expire
   */
  start(onExpire) {
    if (this.isActive) {
      this.stop()
    }

    this.onExpireCallback = onExpire
    this.isActive = true
    this.lastActivityTime = Date.now()

    // Écouter les événements d'activité utilisateur
    this.setupActivityListeners()

    // Démarrer le check périodique
    this.startCheckInterval()

    // Démarrer le timeout initial
    this.resetTimeout()
  }

  /**
   * Arrêter le gestionnaire de session
   */
  stop() {
    this.isActive = false
    this.clearTimeout()
    this.clearCheckInterval()
    this.removeActivityListeners()
  }

  /**
   * Réinitialiser le timer d'inactivité
   */
  resetTimeout() {
    this.clearTimeout()

    if (!this.isActive) return

    this.timeoutId = setTimeout(() => {
      if (this.isActive && this.onExpireCallback) {
        const inactiveTime = Date.now() - this.lastActivityTime
        if (inactiveTime >= INACTIVITY_TIMEOUT) {
          console.log('Session expirée par inactivité', { inactiveTime })
          this.onExpireCallback()
        }
      }
    }, INACTIVITY_TIMEOUT)
  }

  /**
   * Mettre à jour le temps d'activité
   */
  updateActivity() {
    if (!this.isActive) return

    this.lastActivityTime = Date.now()
    this.resetTimeout()
  }

  /**
   * Configurer les listeners d'activité
   */
  setupActivityListeners() {
    // Événements qui indiquent une activité utilisateur
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ]

    this.activityHandler = () => this.updateActivity()

    events.forEach((event) => {
      window.addEventListener(event, this.activityHandler, { passive: true })
    })
  }

  /**
   * Retirer les listeners d'activité
   */
  removeActivityListeners() {
    if (this.activityHandler) {
      const events = [
        'mousedown',
        'mousemove',
        'keypress',
        'scroll',
        'touchstart',
        'click',
      ]

      events.forEach((event) => {
        window.removeEventListener(event, this.activityHandler)
      })

      this.activityHandler = null
    }
  }

  /**
   * Démarrer le check périodique
   */
  startCheckInterval() {
    this.clearCheckInterval()

    this.checkIntervalId = setInterval(() => {
      if (!this.isActive) {
        this.clearCheckInterval()
        return
      }

      const inactiveTime = Date.now() - this.lastActivityTime
      if (inactiveTime >= INACTIVITY_TIMEOUT) {
        console.log('Session expirée détectée par check périodique', { inactiveTime })
        if (this.onExpireCallback) {
          this.onExpireCallback()
        }
      }
    }, CHECK_INTERVAL)
  }

  /**
   * Nettoyer le timeout
   */
  clearTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }

  /**
   * Nettoyer l'intervalle de check
   */
  clearCheckInterval() {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId)
      this.checkIntervalId = null
    }
  }

  /**
   * Obtenir le temps d'inactivité en millisecondes
   */
  getInactiveTime() {
    return Date.now() - this.lastActivityTime
  }

  /**
   * Vérifier si la session est expirée
   */
  isExpired() {
    return this.getInactiveTime() >= INACTIVITY_TIMEOUT
  }
}

// Instance singleton
export const sessionManager = new SessionManager()

