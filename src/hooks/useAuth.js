import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth.service'
import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    logger.debug('USE_AUTH', 'Initialisation du hook useAuth')
    let mounted = true

    // Get initial session
    const checkUser = async () => {
      logger.debug('USE_AUTH', 'Vérification de la session utilisateur...')
      try {
        const { user: currentUser, error } = await authService.getCurrentUser()
        if (error) {
          logger.warn('USE_AUTH', 'Erreur lors de la récupération de l\'utilisateur', error)
          if (mounted) {
            setUser(null)
            setProfile(null)
            setLoading(false)
          }
          return
        }
        
        if (currentUser && mounted) {
          logger.debug('USE_AUTH', 'Utilisateur trouvé', { userId: currentUser.id, email: currentUser.email })
          setUser(currentUser)
          await loadUserProfile(currentUser.id)
        } else {
          logger.debug('USE_AUTH', 'Aucun utilisateur connecté')
        }
      } catch (error) {
        logger.error('USE_AUTH', 'Exception lors de checkUser', error)
      } finally {
        if (mounted) {
          logger.debug('USE_AUTH', 'Fin de checkUser, loading=false')
          setLoading(false)
        }
      }
    }

    checkUser()

    // Listen for auth changes
    logger.debug('USE_AUTH', 'Configuration du listener onAuthStateChange')
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.debug('USE_AUTH', 'onAuthStateChange déclenché', { event, hasSession: !!session, hasUser: !!session?.user })
      
      if (!mounted) {
        logger.debug('USE_AUTH', 'Composant démonté, ignore onAuthStateChange')
        return
      }
      
      if (session?.user) {
        logger.debug('USE_AUTH', 'Session utilisateur détectée', { userId: session.user.id })
        setUser(session.user)
        
        // Charger le profil de manière non-bloquante avec timeout
        const profileTimeout = setTimeout(() => {
          logger.warn('USE_AUTH', 'Timeout: Chargement du profil prend trop de temps, continuation sans profil')
          setLoading(false)
        }, 15000) // 15 secondes max
        
        try {
          await loadUserProfile(session.user.id)
          clearTimeout(profileTimeout)
        } catch (error) {
          clearTimeout(profileTimeout)
          logger.error('USE_AUTH', 'Erreur lors du chargement du profil dans onAuthStateChange', error)
          // Ne pas bloquer, permettre à l'utilisateur de continuer
        }
      } else {
        logger.debug('USE_AUTH', 'Aucune session, réinitialisation')
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      logger.debug('USE_AUTH', 'Nettoyage du hook useAuth')
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const loadUserProfile = async (userId) => {
    logger.debug('USE_AUTH', 'loadUserProfile appelé', { userId })
    const startTime = Date.now()
    
    try {
      logger.debug('USE_AUTH', 'Appel à getUserProfile...')
      const { data: userProfile, error } = await authService.getUserProfile(userId)
      const duration = Date.now() - startTime
      
      logger.debug('USE_AUTH', `getUserProfile terminé en ${duration}ms`, {
        hasProfile: !!userProfile,
        hasError: !!error,
      })
      
      if (error) {
        logger.warn('USE_AUTH', 'Erreur lors de la récupération du profil', error)
        
        // Si c'est un timeout ou une erreur RLS, ne pas bloquer l'authentification
        if (error.message?.includes('Timeout') || error.code === '42501') {
          logger.warn('USE_AUTH', 'Erreur RLS/Timeout - Continuation sans profil', { userId })
          // Permettre à l'utilisateur de continuer même sans profil
          setLoading(false)
          return
        }
        
        // Profile doesn't exist, try to create it
        logger.debug('USE_AUTH', 'Tentative de création du profil...')
        const createStart = Date.now()
        const { data: newProfile, error: createError } = await authService.ensureUserProfile(userId)
        const createDuration = Date.now() - createStart
        
        logger.debug('USE_AUTH', `ensureUserProfile terminé en ${createDuration}ms`, {
          hasProfile: !!newProfile,
          hasError: !!createError,
        })
        
        if (newProfile) {
          logger.debug('USE_AUTH', 'Nouveau profil créé et défini', { userId })
          setProfile(newProfile)
        } else {
          logger.warn('USE_AUTH', 'Impossible de créer le profil', { userId, createError })
          // Ne pas bloquer si le profil ne peut pas être créé
          setLoading(false)
        }
      } else if (userProfile) {
        logger.debug('USE_AUTH', 'Profil chargé avec succès', { userId, email: userProfile.email, role: userProfile.role })
        setProfile(userProfile)
      } else {
        logger.warn('USE_AUTH', 'Aucun profil trouvé et impossible de créer', { userId })
        // Ne pas bloquer l'authentification
        setLoading(false)
      }
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('USE_AUTH', `Exception lors de loadUserProfile après ${duration}ms`, error)
      // Don't block the auth flow if profile loading fails
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    logger.debug('USE_AUTH', 'signIn appelé depuis useAuth', { email })
    setLoading(true)
    const startTime = Date.now()
    
    try {
      logger.debug('USE_AUTH', 'Appel à authService.signIn...')
      const { data, error } = await authService.signIn(email, password)
      
      const duration = Date.now() - startTime
      logger.debug('USE_AUTH', `authService.signIn terminé en ${duration}ms`, {
        hasData: !!data,
        hasError: !!error,
        hasUser: !!data?.user,
      })
      
      if (error) {
        logger.error('USE_AUTH', 'Erreur retournée par authService.signIn', error)
        return { error }
      }
      
      if (data?.user) {
        logger.debug('USE_AUTH', 'Utilisateur authentifié, chargement du profil...', { userId: data.user.id })
        setUser(data.user)
        await loadUserProfile(data.user.id)
        
        const totalDuration = Date.now() - startTime
        logger.info('USE_AUTH', `Connexion complète réussie en ${totalDuration}ms`)
        return { error: null }
      } else {
        logger.error('USE_AUTH', 'Pas d\'utilisateur dans la réponse', { data })
        return { error: new Error('Aucun utilisateur retourné') }
      }
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('USE_AUTH', `Exception dans signIn après ${duration}ms`, error)
      return { error }
    } finally {
      logger.debug('USE_AUTH', 'Fin de signIn, loading=false')
      setLoading(false)
    }
  }

  const signUp = async (email, password, nom, prenom, role) => {
    setLoading(true)
    try {
      const { data, error } = await authService.signUp(email, password, nom, prenom, role)
      if (error) {
        return { error }
      }
      if (data?.user) {
        setUser(data.user)
        await loadUserProfile(data.user.id)
        return { error: null }
      }
    } catch (error) {
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await authService.signOut()
      if (error) {
        return { error }
      }
      setUser(null)
      setProfile(null)
      if (navigate) {
        navigate('/login')
      }
      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
  }
}

