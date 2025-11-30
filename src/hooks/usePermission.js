import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { permissionsService } from '@/services/permissions.service'
import { logger } from '@/utils/logger'

/**
 * Hook personnalisé pour vérifier les permissions de l'utilisateur actuel
 * 
 * @param {string|string[]} permission - Permission(s) à vérifier
 * @param {boolean} requireAll - Si true, toutes les permissions sont requises
 * @returns {Object} { hasPermission, loading, checkPermission }
 */
export function usePermission(permission, requireAll = false) {
  const { user } = useAuth()
  const [hasPermission, setHasPermission] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkPermission = async () => {
    if (!user) {
      setHasPermission(false)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const permissionCodes = Array.isArray(permission) ? permission : [permission]
      
      let result
      if (requireAll) {
        result = await permissionsService.hasAllPermissions(user.id, permissionCodes)
      } else {
        result = await permissionsService.hasAnyPermission(user.id, permissionCodes)
      }

      setHasPermission(result)
    } catch (error) {
      logger.error('USE_PERMISSION', 'Erreur vérification permission', { permission, error })
      setHasPermission(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkPermission()
  }, [user, permission])

  return {
    hasPermission,
    loading,
    checkPermission,
  }
}

