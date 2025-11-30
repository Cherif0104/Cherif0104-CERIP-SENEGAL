import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'
import { cacheManager } from '../cache/CacheManager'

/**
 * BaseRepository - Repository pattern de base
 * Abstraction de l'accès aux données Supabase
 * Conforme aux standards ERP modernes (SAP/Salesforce)
 */
export class BaseRepository {
  constructor(tableName, cacheConfig = {}) {
    this.tableName = tableName
    this.cacheEnabled = cacheConfig.enabled !== false // Activé par défaut
    this.cacheTTL = cacheConfig.ttl || 300000 // 5 minutes par défaut
    this.cacheLevel = cacheConfig.level || 'memory' // memory, localStorage, indexedDB
  }

  /**
   * Récupérer tous les enregistrements avec pagination
   * @param {Object} options - { filters, pagination, orderBy, cache }
   */
  async findAll(options = {}) {
    const {
      filters = {},
      pagination = { page: 1, pageSize: 50 },
      orderBy = { column: 'created_at', ascending: false },
      cache = this.cacheEnabled,
    } = options

    const cacheKey = this.buildCacheKey('findAll', { filters, pagination, orderBy })

    // Vérifier le cache
    if (cache) {
      const cached = await cacheManager.get(cacheKey, this.cacheLevel)
      if (cached) {
        logger.debug('REPOSITORY', `Cache hit: ${this.tableName}.findAll`, { cacheKey })
        return { data: cached, error: null, fromCache: true }
      }
    }

    try {
      let query = supabase.from(this.tableName).select('*')

      // Appliquer les filtres
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            query = query.in(key, value)
          } else {
            query = query.eq(key, value)
          }
        }
      })

      // Trier
      query = query.order(orderBy.column, { ascending: orderBy.ascending })

      // Pagination
      const from = (pagination.page - 1) * pagination.pageSize
      const to = from + pagination.pageSize - 1
      query = query.range(from, to)

      const { data, error } = await query

      if (error) {
        logger.error('REPOSITORY', `Erreur findAll: ${this.tableName}`, error)
        throw error
      }

      // Mettre en cache
      if (cache && data) {
        await cacheManager.set(cacheKey, data, this.cacheTTL, this.cacheLevel)
      }

      logger.debug('REPOSITORY', `findAll réussi: ${this.tableName}`, {
        count: data?.length || 0,
        fromCache: false,
      })

      return { data: data || [], error: null, fromCache: false }
    } catch (error) {
      logger.error('REPOSITORY', `Erreur globale findAll: ${this.tableName}`, error)
      return { data: null, error }
    }
  }

  /**
   * Récupérer un enregistrement par ID
   */
  async findById(id, options = {}) {
    const { cache = this.cacheEnabled } = options
    const cacheKey = this.buildCacheKey('findById', { id })

    // Vérifier le cache
    if (cache) {
      const cached = await cacheManager.get(cacheKey, this.cacheLevel)
      if (cached) {
        logger.debug('REPOSITORY', `Cache hit: ${this.tableName}.findById`, { id, cacheKey })
        return { data: cached, error: null, fromCache: true }
      }
    }

    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        logger.error('REPOSITORY', `Erreur findById: ${this.tableName}`, { id, error })
        throw error
      }

      // Mettre en cache
      if (cache && data) {
        await cacheManager.set(cacheKey, data, this.cacheTTL, this.cacheLevel)
      }

      logger.debug('REPOSITORY', `findById réussi: ${this.tableName}`, { id, fromCache: false })
      return { data, error: null, fromCache: false }
    } catch (error) {
      logger.error('REPOSITORY', `Erreur globale findById: ${this.tableName}`, { id, error })
      return { data: null, error }
    }
  }

  /**
   * Créer un enregistrement
   */
  async create(data, options = {}) {
    try {
      const { invalidateCache = true } = options

      logger.debug('REPOSITORY', `create: ${this.tableName}`, { data })

      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert([data])
        .select()
        .single()

      if (error) {
        logger.error('REPOSITORY', `Erreur create: ${this.tableName}`, error)
        throw error
      }

      // Invalider le cache
      if (invalidateCache) {
        await this.invalidateCache()
      }

      logger.info('REPOSITORY', `create réussi: ${this.tableName}`, { id: result?.id })
      return { data: result, error: null }
    } catch (error) {
      logger.error('REPOSITORY', `Erreur globale create: ${this.tableName}`, error)
      return { data: null, error }
    }
  }

  /**
   * Mettre à jour un enregistrement
   */
  async update(id, data, options = {}) {
    try {
      const { invalidateCache = true } = options

      logger.debug('REPOSITORY', `update: ${this.tableName}`, { id, data })

      const { data: result, error } = await supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logger.error('REPOSITORY', `Erreur update: ${this.tableName}`, { id, error })
        throw error
      }

      // Invalider le cache
      if (invalidateCache) {
        await this.invalidateCache(id)
      }

      logger.info('REPOSITORY', `update réussi: ${this.tableName}`, { id })
      return { data: result, error: null }
    } catch (error) {
      logger.error('REPOSITORY', `Erreur globale update: ${this.tableName}`, { id, error })
      return { data: null, error }
    }
  }

  /**
   * Supprimer un enregistrement
   */
  async delete(id, options = {}) {
    try {
      const { invalidateCache = true } = options

      logger.debug('REPOSITORY', `delete: ${this.tableName}`, { id })

      const { error } = await supabase.from(this.tableName).delete().eq('id', id)

      if (error) {
        logger.error('REPOSITORY', `Erreur delete: ${this.tableName}`, { id, error })
        throw error
      }

      // Invalider le cache
      if (invalidateCache) {
        await this.invalidateCache(id)
      }

      logger.info('REPOSITORY', `delete réussi: ${this.tableName}`, { id })
      return { error: null }
    } catch (error) {
      logger.error('REPOSITORY', `Erreur globale delete: ${this.tableName}`, { id, error })
      return { error }
    }
  }

  /**
   * Compter les enregistrements
   */
  async count(filters = {}) {
    try {
      let query = supabase.from(this.tableName).select('*', { count: 'exact', head: true })

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          query = query.eq(key, value)
        }
      })

      const { count, error } = await query

      if (error) {
        logger.error('REPOSITORY', `Erreur count: ${this.tableName}`, error)
        throw error
      }

      return { count: count || 0, error: null }
    } catch (error) {
      logger.error('REPOSITORY', `Erreur globale count: ${this.tableName}`, error)
      return { count: 0, error }
    }
  }

  /**
   * Invalider le cache pour cette table
   */
  async invalidateCache(recordId = null) {
    if (!this.cacheEnabled) return

    const pattern = recordId
      ? `${this.tableName}:*:${recordId}*`
      : `${this.tableName}:*`

    await cacheManager.invalidate(pattern)
    logger.debug('REPOSITORY', `Cache invalidé: ${this.tableName}`, { recordId, pattern })
  }

  /**
   * Construire une clé de cache
   */
  buildCacheKey(method, params) {
    const paramsStr = JSON.stringify(params)
    return `${this.tableName}:${method}:${paramsStr}`
  }
}

export default BaseRepository

