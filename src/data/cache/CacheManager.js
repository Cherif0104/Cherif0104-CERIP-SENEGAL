import { logger } from '@/utils/logger'

/**
 * CacheManager - Gestion cache multi-niveaux
 * Conforme aux standards ERP modernes (SAP/Salesforce)
 * 
 * Niveaux de cache :
 * - memory: Cache mémoire (Map) - très rapide, TTL court
 * - localStorage: Cache navigateur - persistant, TTL moyen
 * - indexedDB: Cache base de données navigateur - grandes quantités, TTL long
 */
class CacheManager {
  constructor() {
    // Cache mémoire (Map)
    this.memoryCache = new Map()
    this.memoryCacheTTL = new Map() // Timestamps expiration

    // Nettoyer le cache mémoire périodiquement
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanMemoryCache(), 60000) // Toutes les minutes
    }
  }

  /**
   * Récupérer une valeur du cache
   * @param {string} key - Clé de cache
   * @param {string} level - Niveau ('memory', 'localStorage', 'indexedDB')
   * @returns {Promise<Object|null>} Valeur ou null
   */
  async get(key, level = 'memory') {
    try {
      switch (level) {
        case 'memory':
          return this.getFromMemory(key)
        case 'localStorage':
          return this.getFromLocalStorage(key)
        case 'indexedDB':
          return await this.getFromIndexedDB(key)
        default:
          logger.warn('CACHE', `Niveau de cache inconnu: ${level}`)
          return null
      }
    } catch (error) {
      logger.error('CACHE', `Erreur récupération cache: ${key}`, { level, error })
      return null
    }
  }

  /**
   * Stocker une valeur dans le cache
   * @param {string} key - Clé de cache
   * @param {Object} value - Valeur à stocker
   * @param {number} ttl - Time To Live en ms
   * @param {string} level - Niveau
   */
  async set(key, value, ttl = 300000, level = 'memory') {
    try {
      const expiresAt = Date.now() + ttl

      switch (level) {
        case 'memory':
          this.setInMemory(key, value, expiresAt)
          break
        case 'localStorage':
          this.setInLocalStorage(key, value, expiresAt)
          break
        case 'indexedDB':
          await this.setInIndexedDB(key, value, expiresAt)
          break
        default:
          logger.warn('CACHE', `Niveau de cache inconnu: ${level}`)
      }

      logger.debug('CACHE', `Valeur mise en cache: ${key}`, { level, ttl })
    } catch (error) {
      logger.error('CACHE', `Erreur stockage cache: ${key}`, { level, error })
    }
  }

  /**
   * Invalider le cache (par pattern)
   * @param {string} pattern - Pattern de clé (ex: 'programmes:*' ou 'programmes:*:findById:*')
   */
  async invalidate(pattern) {
    try {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'))

      // Invalider memory cache
      this.memoryCache.forEach((value, key) => {
        if (regex.test(key)) {
          this.memoryCache.delete(key)
          this.memoryCacheTTL.delete(key)
        }
      })

      // Invalider localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('cache_') && regex.test(key.replace('cache_', ''))) {
            localStorage.removeItem(key)
          }
        })
      }

      logger.debug('CACHE', `Cache invalidé: ${pattern}`)
    } catch (error) {
      logger.error('CACHE', `Erreur invalidation cache: ${pattern}`, error)
    }
  }

  /**
   * Vider un niveau de cache
   * @param {string} level - Niveau ou 'all' pour tout vider
   */
  async clear(level = 'all') {
    try {
      if (level === 'all' || level === 'memory') {
        this.memoryCache.clear()
        this.memoryCacheTTL.clear()
      }

      if ((level === 'all' || level === 'localStorage') && typeof window !== 'undefined' && window.localStorage) {
        Object.keys(localStorage)
          .filter((key) => key.startsWith('cache_'))
          .forEach((key) => localStorage.removeItem(key))
      }

      if (level === 'all' || level === 'indexedDB') {
        await this.clearIndexedDB()
      }

      logger.info('CACHE', `Cache vidé: ${level}`)
    } catch (error) {
      logger.error('CACHE', `Erreur vidage cache: ${level}`, error)
    }
  }

  // === Méthodes privées ===

  /**
   * Récupérer du cache mémoire
   */
  getFromMemory(key) {
    const expiresAt = this.memoryCacheTTL.get(key)
    if (!expiresAt) return null

    if (Date.now() > expiresAt) {
      // Expiré, supprimer
      this.memoryCache.delete(key)
      this.memoryCacheTTL.delete(key)
      return null
    }

    return this.memoryCache.get(key) || null
  }

  /**
   * Stocker dans le cache mémoire
   */
  setInMemory(key, value, expiresAt) {
    this.memoryCache.set(key, value)
    this.memoryCacheTTL.set(key, expiresAt)
  }

  /**
   * Récupérer du localStorage
   */
  getFromLocalStorage(key) {
    if (typeof window === 'undefined' || !window.localStorage) return null

    try {
      const cached = localStorage.getItem(`cache_${key}`)
      if (!cached) return null

      const { value, expiresAt } = JSON.parse(cached)

      if (Date.now() > expiresAt) {
        localStorage.removeItem(`cache_${key}`)
        return null
      }

      return value
    } catch (error) {
      logger.error('CACHE', `Erreur lecture localStorage: ${key}`, error)
      return null
    }
  }

  /**
   * Stocker dans localStorage
   */
  setInLocalStorage(key, value, expiresAt) {
    if (typeof window === 'undefined' || !window.localStorage) return

    try {
      const data = {
        value,
        expiresAt,
        cachedAt: Date.now(),
      }
      localStorage.setItem(`cache_${key}`, JSON.stringify(data))
    } catch (error) {
      // localStorage peut être plein, nettoyer et réessayer
      if (error.name === 'QuotaExceededError') {
        this.cleanLocalStorage()
        try {
          localStorage.setItem(`cache_${key}`, JSON.stringify({ value, expiresAt, cachedAt: Date.now() }))
        } catch (retryError) {
          logger.warn('CACHE', `Impossible de stocker dans localStorage: ${key}`, retryError)
        }
      } else {
        logger.error('CACHE', `Erreur stockage localStorage: ${key}`, error)
      }
    }
  }

  /**
   * Récupérer d'IndexedDB (simplifié, nécessiterait une vraie implémentation IndexedDB)
   */
  async getFromIndexedDB(key) {
    // TODO: Implémenter IndexedDB si nécessaire
    // Pour l'instant, on retourne null
    return null
  }

  /**
   * Stocker dans IndexedDB (simplifié)
   */
  async setInIndexedDB(key, value, expiresAt) {
    // TODO: Implémenter IndexedDB si nécessaire
  }

  /**
   * Vider IndexedDB
   */
  async clearIndexedDB() {
    // TODO: Implémenter si IndexedDB est utilisé
  }

  /**
   * Nettoyer le cache mémoire (supprimer les entrées expirées)
   */
  cleanMemoryCache() {
    const now = Date.now()
    let cleaned = 0

    this.memoryCacheTTL.forEach((expiresAt, key) => {
      if (now > expiresAt) {
        this.memoryCache.delete(key)
        this.memoryCacheTTL.delete(key)
        cleaned++
      }
    })

    if (cleaned > 0) {
      logger.debug('CACHE', `Cache mémoire nettoyé: ${cleaned} entrées expirées`)
    }
  }

  /**
   * Nettoyer localStorage (supprimer les entrées expirées)
   */
  cleanLocalStorage() {
    if (typeof window === 'undefined' || !window.localStorage) return

    const now = Date.now()
    let cleaned = 0

    Object.keys(localStorage)
      .filter((key) => key.startsWith('cache_'))
      .forEach((key) => {
        try {
          const cached = localStorage.getItem(key)
          if (cached) {
            const { expiresAt } = JSON.parse(cached)
            if (now > expiresAt) {
              localStorage.removeItem(key)
              cleaned++
            }
          }
        } catch (error) {
          // Supprimer les entrées corrompues
          localStorage.removeItem(key)
          cleaned++
        }
      })

    if (cleaned > 0) {
      logger.debug('CACHE', `localStorage nettoyé: ${cleaned} entrées expirées`)
    }
  }

  /**
   * Obtenir les statistiques du cache
   */
  getStats() {
    return {
      memory: {
        size: this.memoryCache.size,
        entries: Array.from(this.memoryCache.keys()),
      },
      localStorage: typeof window !== 'undefined' && window.localStorage
        ? Object.keys(localStorage).filter((key) => key.startsWith('cache_')).length
        : 0,
    }
  }
}

// Instance singleton
export const cacheManager = new CacheManager()
export default cacheManager

