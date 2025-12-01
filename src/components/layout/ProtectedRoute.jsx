import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { LoadingState } from '@/components/common/LoadingState'
import { sessionManager } from '@/utils/sessionManager'
import { logger } from '@/utils/logger'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, signOut } = useAuth()
  const location = useLocation()
  const [isChecking, setIsChecking] = useState(true)

  // Gérer l'expiration de session
  useEffect(() => {
    const handleSessionExpire = async () => {
      logger.warn('PROTECTED_ROUTE', 'Session expirée par inactivité')
      await signOut()
      // La redirection vers /login sera gérée par signOut
    }

    // Démarrer le gestionnaire de session si authentifié
    if (isAuthenticated && !loading) {
      sessionManager.start(handleSessionExpire)
      logger.debug('PROTECTED_ROUTE', 'Gestionnaire de session démarré')
    }

    return () => {
      if (isAuthenticated) {
        sessionManager.stop()
      }
    }
  }, [isAuthenticated, loading, signOut])

  // Vérifier la session au chargement
  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      // Attendre que le hook useAuth termine son chargement
      // Ne pas rediriger immédiatement si on charge encore
      if (loading) {
        // Attendre un peu pour que Supabase récupère la session
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      if (mounted) {
        setIsChecking(false)
      }
    }

    checkSession()

    return () => {
      mounted = false
    }
  }, [loading])

  // Pendant le chargement initial, afficher un loader
  // Mais ne pas rediriger immédiatement - laisser Supabase récupérer la session
  if (loading || isChecking) {
    return <LoadingState fullScreen message="Vérification de l'authentification..." />
  }

  // Si non authentifié après vérification, rediriger vers login
  // Mais sauvegarder la location pour y revenir après connexion
  if (!isAuthenticated) {
    logger.debug('PROTECTED_ROUTE', 'Utilisateur non authentifié, redirection vers login', {
      from: location.pathname,
    })
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Utilisateur authentifié, afficher le contenu
  return children || <Outlet />
}

export default ProtectedRoute

