import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { authCandidatService } from '@/services/auth-candidat.service'
import { logger } from '@/utils/logger'

export const useAuthCandidat = () => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier la session au chargement
    checkSession()

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      logger.debug('USE_AUTH_CANDIDAT', 'Auth state changed', { event, hasSession: !!session })
      if (session) {
        loadUserProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkSession = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setUser(session.user)
        await loadUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    } catch (error) {
      logger.error('USE_AUTH_CANDIDAT', 'Erreur checkSession', error)
      setLoading(false)
    }
  }

  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await authCandidatService.getCandidatProfile(userId)
      if (error) {
        logger.error('USE_AUTH_CANDIDAT', 'Erreur loadUserProfile', error)
        return
      }
      setProfile(data)
    } catch (error) {
      logger.error('USE_AUTH_CANDIDAT', 'Erreur inattendue loadUserProfile', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    setLoading(true)
    try {
      const { data, error } = await authCandidatService.signIn(email, password)
      if (error) {
        return { error }
      }
      if (data?.user) {
        setUser(data.user)
        await loadUserProfile(data.user.id)
        return { error: null }
      }
      return { error: new Error('Aucun utilisateur retourné') }
    } catch (error) {
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, nom, prenom) => {
    setLoading(true)
    try {
      const { data, error } = await authCandidatService.signUp(email, password, nom, prenom)
      if (error) {
        return { error }
      }
      if (data?.user) {
        setUser(data.user)
        await loadUserProfile(data.user.id)
        return { error: null }
      }
      return { error: new Error('Aucun utilisateur créé') }
    } catch (error) {
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await authCandidatService.signOut()
      if (error) {
        return { error }
      }
      setUser(null)
      setProfile(null)
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
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user && !!profile,
  }
}

