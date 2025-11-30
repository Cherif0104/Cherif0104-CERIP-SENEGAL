import { BaseRepository } from './BaseRepository'
import { logger } from '@/utils/logger'

/**
 * UserRepository - Repository spécialisé pour les utilisateurs
 */
export class UserRepository extends BaseRepository {
  constructor() {
    super('users', {
      enabled: true,
      ttl: 300000, // 5 minutes
      level: 'memory',
    })
  }

  /**
   * Récupérer un utilisateur avec toutes ses relations
   */
  async findByIdWithRelations(id) {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          employe:employe_id(*)
        `
        )
        .eq('id', id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      logger.error('USER_REPOSITORY', 'Erreur findByIdWithRelations', { id, error })
      return { data: null, error }
    }
  }

  /**
   * Récupérer les utilisateurs actifs
   */
  async findActifs(options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        actif: true,
      },
    })
  }

  /**
   * Récupérer les utilisateurs par rôle
   */
  async findByRole(role, options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        role,
      },
    })
  }

  /**
   * Récupérer les utilisateurs inactifs
   */
  async findInactifs(options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        actif: false,
      },
    })
  }

  /**
   * Activer/Désactiver un utilisateur
   */
  async toggleActif(id, actif) {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ actif, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Invalider le cache
      this.cacheManager.invalidate(`users:findById:${id}`)
      this.cacheManager.invalidate('users:findAll')

      return { data, error: null }
    } catch (error) {
      logger.error('USER_REPOSITORY', 'Erreur toggleActif', { id, actif, error })
      return { data: null, error }
    }
  }
}

// Instance singleton
export const userRepository = new UserRepository()
export default userRepository

