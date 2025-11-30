import { BaseRepository } from './BaseRepository'
import { logger } from '@/utils/logger'

/**
 * PermissionRepository - Repository spécialisé pour les permissions
 */
export class PermissionRepository extends BaseRepository {
  constructor() {
    super('permissions', {
      enabled: true,
      ttl: 600000, // 10 minutes
      level: 'memory',
    })
  }

  /**
   * Récupérer une permission par code
   */
  async findByCode(code) {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('code', code)
        .eq('actif', true)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return { data, error: error && error.code === 'PGRST116' ? null : error }
    } catch (error) {
      logger.error('PERMISSION_REPOSITORY', 'Erreur findByCode', { code, error })
      return { data: null, error }
    }
  }

  /**
   * Récupérer les permissions par module
   */
  async findByModule(module) {
    return await this.findAll({
      filters: {
        module,
        actif: true,
      },
    })
  }

  /**
   * Récupérer les permissions par action
   */
  async findByAction(action) {
    return await this.findAll({
      filters: {
        action,
        actif: true,
      },
    })
  }

  /**
   * Récupérer les permissions d'un utilisateur (via son rôle)
   */
  async findByUser(userId) {
    try {
      const { supabase } = await import('@/lib/supabase')
      
      // Récupérer l'utilisateur avec son rôle
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('role, roles_custom')
        .eq('id', userId)
        .single()

      if (userError) throw userError
      if (!user) return { data: [], error: null }

      // Rôles par défaut et leurs permissions
      const rolePermissionsMap = {
        ADMIN_SERIP: ['*'], // Tous les droits
        ADMIN_ORGANISME: [
          'programmes.*',
          'projets.*',
          'beneficiaires.*',
          'reporting.*',
          'administration.users',
          'administration.roles',
          'administration.config',
          'administration.logs',
        ],
        CHEF_PROJET: [
          'projets.*',
          'candidatures.*',
          'beneficiaires.read',
        ],
        MENTOR: [
          'beneficiaires.read',
          'accompagnements.*',
          'mentorat.*',
        ],
        FORMATEUR: [
          'formations.*',
          'sessions.*',
        ],
        COACH: [
          'beneficiaires.read',
          'coaching.*',
        ],
        BAILLEUR: [
          'programmes.read',
          'reporting.financier',
        ],
        BENEFICIAIRE: [
          'beneficiaires.own',
        ],
        GPERFORM: [
          'reporting.*',
          'analytics.*',
        ],
      }

      // Permissions du rôle par défaut
      const defaultRolePerms = rolePermissionsMap[user.role] || []

      // Récupérer les permissions des rôles personnalisés
      let customRolePerms = []
      if (user.roles_custom && Array.isArray(user.roles_custom) && user.roles_custom.length > 0) {
        const { data: customRoles, error: rolesError } = await supabase
          .from('roles_custom')
          .select('permissions')
          .in('code', user.roles_custom)
          .eq('actif', true)

        if (!rolesError && customRoles) {
          customRolePerms = customRoles.flatMap((role) => role.permissions || [])
        }
      }

      // Combiner toutes les permissions
      const allPermissionCodes = [...new Set([...defaultRolePerms, ...customRolePerms])]

      // Si '*' est présent, retourner toutes les permissions
      if (allPermissionCodes.includes('*')) {
        const { data: allPerms } = await this.findAll({ filters: { actif: true } })
        return { data: allPerms || [], error: null }
      }

      // Récupérer les permissions spécifiques
      const { data: permissions, error } = await supabase
        .from(this.tableName)
        .select('*')
        .in('code', allPermissionCodes)
        .eq('actif', true)

      if (error) throw error

      return { data: permissions || [], error: null }
    } catch (error) {
      logger.error('PERMISSION_REPOSITORY', 'Erreur findByUser', { userId, error })
      return { data: [], error }
    }
  }
}

// Instance singleton
export const permissionRepository = new PermissionRepository()
export default permissionRepository

