import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { LoadingState } from '@/components/common/LoadingState'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  const [timeoutReached, setTimeoutReached] = useState(false)

  // Timeout fallback: if loading takes more than 5 seconds, allow navigation
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        console.warn('Authentication check timeout - redirecting to login')
        setTimeoutReached(true)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [loading])

  if (loading && !timeoutReached) {
    return <LoadingState fullScreen message="Vérification de l'authentification..." />
  }

  if (!isAuthenticated || timeoutReached) {
    return <Navigate to="/login" replace />
  }

  return children || <Outlet />
}

export default ProtectedRoute

