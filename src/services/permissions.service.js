import { permissionRepository } from '@/data/repositories'
import { logger } from '@/utils/logger'

/**
 * Service Permissions - Vérification des permissions utilisateurs
 */
export const permissionsService = {
  /**
   * Récupérer toutes les permissions
   */
  async getAll() {
    return await permissionRepository.findAll({ filters: { actif: true } })
  },

  /**
   * Récupérer les permissions par module
   */
  async getByModule(module) {
    return await permissionRepository.findByModule(module)
  },

  /**
   * Récupérer les permissions d'un utilisateur
   */
  async getUserPermissions(userId) {
    return await permissionRepository.findByUser(userId)
  },

  /**
   * Vérifier si un utilisateur a une permission spécifique
   */
  async hasPermission(userId, permissionCode) {
    try {
      const { data: userPerms, error } = await this.getUserPermissions(userId)
      if (error || !userPerms) return false

      // Vérifier si l'utilisateur a la permission '*'
      const hasAll = userPerms.some((p) => p.code === '*')
      if (hasAll) return true

      // Vérifier la permission exacte
      const hasExact = userPerms.some((p) => p.code === permissionCode)
      if (hasExact) return true

      // Vérifier les permissions par module (ex: programmes.*)
      const [module] = permissionCode.split('.')
      const hasModuleAll = userPerms.some((p) => {
        const [pModule, pAction] = p.code.split('.')
        return pModule === module && pAction === '*'
      })

      return hasModuleAll
    } catch (error) {
      logger.error('PERMISSIONS_SERVICE', 'Erreur hasPermission', { userId, permissionCode, error })
      return false
    }
  },

  /**
   * Vérifier si un utilisateur a au moins une des permissions
   */
  async hasAnyPermission(userId, permissionCodes) {
    if (!Array.isArray(permissionCodes) || permissionCodes.length === 0) return false

    for (const code of permissionCodes) {
      const has = await this.hasPermission(userId, code)
      if (has) return true
    }

    return false
  },

  /**
   * Vérifier si un utilisateur a toutes les permissions
   */
  async hasAllPermissions(userId, permissionCodes) {
    if (!Array.isArray(permissionCodes) || permissionCodes.length === 0) return true

    for (const code of permissionCodes) {
      const has = await this.hasPermission(userId, code)
      if (!has) return false
    }

    return true
  },

  /**
   * Vérifier les permissions pour l'utilisateur actuel
   */
  async checkCurrentUserPermission(permissionCode) {
    try {
      const { supabase } = await import('@/lib/supabase')
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return false

      return await this.hasPermission(user.id, permissionCode)
    } catch (error) {
      logger.error('PERMISSIONS_SERVICE', 'Erreur checkCurrentUserPermission', { permissionCode, error })
      return false
    }
  },
}

