// Hook pour accéder à l'utilisateur actuel
import { useState, useEffect } from 'react'
import { authService } from '../services/auth.service'

export default function useAuth() {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      try {
        const { data: { session } } = await authService.getSession()
        if (!isMounted) return

        if (session?.user) {
          setUser(session.user)
          try {
            const profile = await authService.getUserProfile(session.user.id)
            if (!isMounted) return

            if (profile.data) {
              setUserProfile(profile.data)
            } else {
              setUserProfile({
                id: session.user.id,
                email: session.user.email,
                role: 'CERIP',
                nom: session.user.email?.split('@')[0] || 'Utilisateur',
                prenom: '',
              })
            }
          } catch (error) {
            console.error('Error loading user profile:', error)
            if (!isMounted) return
            setUserProfile({
              id: session.user.id,
              email: session.user.email,
              role: 'CERIP',
              nom: session.user.email?.split('@')[0] || 'Utilisateur',
              prenom: '',
            })
          }
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadUser()

    return () => {
      isMounted = false
    }
  }, [])

  return { user, userProfile, loading, userId: userProfile?.id || user?.id }
}

