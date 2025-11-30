import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { permissionsService } from '@/services/permissions.service'
import { logger } from '@/utils/logger'
import './PermissionGuard.css'

/**
 * PermissionGuard - Composant pour protéger l'affichage selon les permissions
 * 
 * @param {string|string[]} permission - Permission(s) requise(s)
 * @param {boolean} requireAll - Si true, toutes les permissions sont requises. Si false, au moins une suffit
 * @param {ReactNode} children - Contenu à afficher si permission accordée
 * @param {ReactNode} fallback - Contenu à afficher si permission refusée
 * @param {boolean} hideIfNoPermission - Si true, ne rien afficher si pas de permission
 */
export function PermissionGuard({
  permission,
  requireAll = false,
  children,
  fallback = null,
  hideIfNoPermission = true,
  hideFallback, // Alias pour hideIfNoPermission (compatibilité)
}) {
  // Utiliser hideFallback si fourni, sinon hideIfNoPermission
  const shouldHide = hideFallback !== undefined ? hideFallback : hideIfNoPermission
  const { user } = useAuth()
  const [hasPermission, setHasPermission] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkPermission()
  }, [user, permission])

  const checkPermission = async () => {
    if (!user) {
      setHasPermission(false)
      setLoading(false)
      return
    }

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
      logger.error('PERMISSION_GUARD', 'Erreur vérification permission', { permission, error })
      setHasPermission(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return null // Ne rien afficher pendant le chargement
  }

  if (!hasPermission) {
    if (shouldHide) {
      return null
    }
    return fallback
  }

  return children
}

// Export par défaut aussi pour compatibilité
export default PermissionGuard
