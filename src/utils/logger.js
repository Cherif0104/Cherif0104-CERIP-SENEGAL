/**
 * Système de logging centralisé pour le suivi des actions, erreurs et problèmes
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
}

const LOG_COLORS = {
  DEBUG: '#6B7280',
  INFO: '#3B82F6',
  WARN: '#F59E0B',
  ERROR: '#EF4444',
}

class Logger {
  constructor() {
    this.logs = []
    this.maxLogs = 1000 // Limiter le nombre de logs en mémoire
    this.level = import.meta.env.DEV ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO
    this.enableConsole = true
    this.enableStorage = false // Peut être activé pour persister les logs
  }

  /**
   * Ajouter un log
   */
  addLog(level, category, message, data = null) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      category,
      message,
      data,
      id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
    }

    // Ajouter au tableau de logs
    this.logs.push(logEntry)
    
    // Limiter la taille
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Afficher dans la console si niveau suffisant
    if (LOG_LEVELS[level] >= this.level && this.enableConsole) {
      const color = LOG_COLORS[level] || '#000000'
      const style = `color: ${color}; font-weight: bold;`
      
      const prefix = `%c[${level}] [${category}]`
      const messageStr = `${message}`
      
      if (data) {
        console.log(prefix, style, messageStr, data)
      } else {
        console.log(prefix, style, messageStr)
      }
    }

    // Sauvegarder dans le storage si activé
    if (this.enableStorage && typeof window !== 'undefined') {
      try {
        const logsJson = JSON.stringify(this.logs.slice(-100)) // Garder seulement les 100 derniers
        localStorage.setItem('app_logs', logsJson)
      } catch (e) {
        console.warn('Impossible de sauvegarder les logs dans localStorage', e)
      }
    }

    return logEntry
  }

  /**
   * Log de debug
   */
  debug(category, message, data = null) {
    return this.addLog('DEBUG', category, message, data)
  }

  /**
   * Log d'information
   */
  info(category, message, data = null) {
    return this.addLog('INFO', category, message, data)
  }

  /**
   * Log d'avertissement
   */
  warn(category, message, data = null) {
    return this.addLog('WARN', category, message, data)
  }

  /**
   * Log d'erreur
   */
  error(category, message, error = null) {
    const errorData = error
      ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
          ...(error.response && { response: error.response }),
          ...(error.data && { data: error.data }),
        }
      : null
    return this.addLog('ERROR', category, message, errorData)
  }

  /**
   * Logger une action utilisateur
   */
  action(action, details = {}) {
    return this.info('ACTION', `Action: ${action}`, details)
  }

  /**
   * Logger un appel API
   */
  api(method, endpoint, request = null, response = null, error = null) {
    if (error) {
      return this.error('API', `${method} ${endpoint}`, error)
    }
    return this.debug('API', `${method} ${endpoint}`, { request, response })
  }

  /**
   * Obtenir tous les logs
   */
  getLogs(filter = {}) {
    let filtered = [...this.logs]

    if (filter.level) {
      filtered = filtered.filter(log => log.level === filter.level)
    }
    if (filter.category) {
      filtered = filtered.filter(log => log.category === filter.category)
    }
    if (filter.startDate) {
      filtered = filtered.filter(log => log.timestamp >= filter.startDate)
    }
    if (filter.endDate) {
      filtered = filtered.filter(log => log.timestamp <= filter.endDate)
    }

    return filtered
  }

  /**
   * Exporter les logs
   */
  exportLogs() {
    return JSON.stringify(this.logs, null, 2)
  }

  /**
   * Effacer les logs
   */
  clear() {
    this.logs = []
    if (typeof window !== 'undefined') {
      localStorage.removeItem('app_logs')
    }
  }

  /**
   * Charger les logs depuis le storage
   */
  loadFromStorage() {
    if (typeof window !== 'undefined' && this.enableStorage) {
      try {
        const logsJson = localStorage.getItem('app_logs')
        if (logsJson) {
          this.logs = JSON.parse(logsJson)
        }
      } catch (e) {
        console.warn('Impossible de charger les logs depuis localStorage', e)
      }
    }
  }

  /**
   * Définir le niveau de log
   */
  setLevel(level) {
    if (LOG_LEVELS[level] !== undefined) {
      this.level = LOG_LEVELS[level]
    }
  }
}

// Instance singleton
export const logger = new Logger()

// Exporter aussi les fonctions directement pour faciliter l'usage
export const logDebug = (category, message, data) => logger.debug(category, message, data)
export const logInfo = (category, message, data) => logger.info(category, message, data)
export const logWarn = (category, message, data) => logger.warn(category, message, data)
export const logError = (category, message, error) => logger.error(category, message, error)
export const logAction = (action, details) => logger.action(action, details)
export const logApi = (method, endpoint, request, response, error) =>
  logger.api(method, endpoint, request, response, error)

// Exposer dans window pour debug
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.logger = logger
  window.logs = () => logger.getLogs()
  window.clearLogs = () => logger.clear()
  window.exportLogs = () => {
    const logs = logger.exportLogs()
    const blob = new Blob([logs], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
}

