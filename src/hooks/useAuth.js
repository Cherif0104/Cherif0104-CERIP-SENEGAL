// Hook pour accéder à l'utilisateur actuel
import { useState, useEffect } from 'react'
import { authService } from '../services/auth.service'

export default function useAuth() {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { session } } = await authService.getSession()
        if (session?.user) {
          setUser(session.user)
          try {
            const profile = await authService.getUserProfile(session.user.id)
            if (profile.data) {
              setUserProfile(profile.data)
            } else {
              setUserProfile({
                id: session.user.id,
                email: session.user.email,
                role: session.user.user_metadata?.role || 'ADMIN_SERIP',
                nom: session.user.user_metadata?.nom || session.user.email,
                prenom: session.user.user_metadata?.prenom || '',
              })
            }
          } catch (error) {
            setUserProfile({
              id: session.user.id,
              email: session.user.email,
              role: session.user.user_metadata?.role || 'ADMIN_SERIP',
              nom: session.user.user_metadata?.nom || session.user.email,
              prenom: session.user.user_metadata?.prenom || '',
            })
          }
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()

    const authStateResult = authService.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        try {
          const profile = await authService.getUserProfile(session.user.id)
          if (profile.data) {
            setUserProfile(profile.data)
          } else {
            setUserProfile({
              id: session.user.id,
              email: session.user.email,
              role: session.user.user_metadata?.role || 'ADMIN_SERIP',
              nom: session.user.user_metadata?.nom || session.user.email,
              prenom: session.user.user_metadata?.prenom || '',
            })
          }
        } catch (error) {
          setUserProfile({
            id: session.user.id,
            email: session.user.email,
            role: session.user.user_metadata?.role || 'ADMIN_SERIP',
            nom: session.user.email?.split('@')[0] || 'Utilisateur',
          })
        }
      } else {
        setUser(null)
        setUserProfile(null)
      }
    })

    const subscription = authStateResult?.data?.subscription

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe()
      }
    }
  }, [])

  return { user, userProfile, loading, userId: userProfile?.id || user?.id }
}


