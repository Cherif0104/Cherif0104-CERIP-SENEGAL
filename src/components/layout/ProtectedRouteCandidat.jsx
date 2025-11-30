import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthCandidat } from '@/hooks/useAuthCandidat'
import { LoadingState } from '@/components/common/LoadingState'

const ProtectedRouteCandidat = ({ children }) => {
  const { isAuthenticated, loading } = useAuthCandidat()
  const [timeoutReached, setTimeoutReached] = useState(false)

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        console.warn('Candidat authentication check timeout - redirecting to login')
        setTimeoutReached(true)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [loading])

  if (loading && !timeoutReached) {
    return <LoadingState fullScreen message="Vérification de l'authentification..." />
  }

  if (!isAuthenticated || timeoutReached) {
    return <Navigate to="/candidat/login" replace />
  }

  return children || <Outlet />
}

export default ProtectedRouteCandidat

