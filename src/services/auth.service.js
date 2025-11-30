import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'

export const authService = {
  async signIn(email, password) {
    logger.debug('AUTH_SERVICE', 'signIn appelé', { email })
    const startTime = Date.now()
    
    try {
      logger.debug('AUTH_SERVICE', 'Appel à supabase.auth.signInWithPassword...')
      const signInStart = Date.now()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      const signInDuration = Date.now() - signInStart
      logger.debug('AUTH_SERVICE', `signInWithPassword terminé en ${signInDuration}ms`, {
        hasData: !!data,
        hasError: !!error,
        hasUser: !!data?.user,
      })

      if (error) {
        logger.error('AUTH_SERVICE', 'Erreur Supabase Auth', error)
        throw error
      }

      if (!data?.user) {
        logger.error('AUTH_SERVICE', 'Pas d\'utilisateur retourné par Supabase Auth')
        throw new Error('Aucun utilisateur retourné')
      }

      logger.debug('AUTH_SERVICE', 'Utilisateur authentifié', {
        userId: data.user.id,
        email: data.user.email,
      })

      // Ensure user profile exists (non-bloquant)
      logger.debug('AUTH_SERVICE', 'Vérification/création du profil utilisateur...')
      const profileStart = Date.now()
      
      try {
        const profileResult = await this.ensureUserProfile(data.user.id)
        
        const profileDuration = Date.now() - profileStart
        logger.debug('AUTH_SERVICE', `ensureUserProfile terminé en ${profileDuration}ms`, {
          hasProfile: !!profileResult.data,
          hasError: !!profileResult.error,
        })
      } catch (profileError) {
        const profileDuration = Date.now() - profileStart
        logger.warn('AUTH_SERVICE', `Erreur lors de ensureUserProfile après ${profileDuration}ms (non-bloquant)`, profileError)
        // Ne pas bloquer la connexion si le profil échoue
      }

      const totalDuration = Date.now() - startTime
      logger.info('AUTH_SERVICE', `Connexion réussie en ${totalDuration}ms`, {
        userId: data.user.id,
        email: data.user.email,
      })

      return { data, error: null }
    } catch (error) {
      const totalDuration = Date.now() - startTime
      logger.error('AUTH_SERVICE', `Erreur de connexion après ${totalDuration}ms`, error)
      return { data: null, error }
    }
  },

  async signUp(email, password, nom, prenom, role = 'ADMIN_ORGANISME') {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nom,
            prenom,
            role,
          },
        },
      })

      if (error) throw error

      // Create user profile in public.users table
      if (data.user) {
        await this.ensureUserProfile(data.user.id, { nom, prenom, role })
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error signing up:', error)
      return { data: null, error }
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error signing out:', error)
      return { error }
    }
  },

  async getCurrentUser() {
    logger.debug('AUTH_SERVICE', 'getCurrentUser appelé')
    const startTime = Date.now()
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      const duration = Date.now() - startTime
      
      if (error) {
        logger.warn('AUTH_SERVICE', `Erreur getCurrentUser (${duration}ms)`, error)
        throw error
      }
      
      if (user) {
        logger.debug('AUTH_SERVICE', `Utilisateur actuel récupéré (${duration}ms)`, {
          userId: user.id,
          email: user.email,
        })
      } else {
        logger.debug('AUTH_SERVICE', `Aucun utilisateur actuel (${duration}ms)`)
      }
      
      return { user, error: null }
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('AUTH_SERVICE', `Exception dans getCurrentUser après ${duration}ms`, error)
      return { user: null, error }
    }
  },

  async getUserProfile(userId) {
    logger.debug('AUTH_SERVICE', 'getUserProfile appelé', { userId })
    const startTime = Date.now()
    
    try {
      // Récupérer le profil utilisateur depuis la table public.users
      // qui est liée à auth.users via l'ID (UUID)
      logger.debug('AUTH_SERVICE', 'Requête Supabase pour récupérer le profil...')
      
      // Ajouter un timeout pour éviter que la requête reste bloquée
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout: La requête a pris plus de 10 secondes'))
        }, 10000)
      })

      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      // Race entre la requête et le timeout
      const { data, error } = await Promise.race([queryPromise, timeoutPromise])

      const duration = Date.now() - startTime
      
      // Si le profil n'existe pas, c'est une erreur mais on ne bloque pas
      if (error) {
        logger.debug('AUTH_SERVICE', `Erreur lors de la récupération du profil (${duration}ms)`, {
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details,
          errorHint: error.hint,
        })
        
        // PCODE 23505 = unique_violation (déjà géré)
        // PCODE P0001 = pas de résultats (profil inexistant)
        if (error.code === 'PGRST116') {
          // Pas de profil trouvé - cela peut arriver si l'utilisateur existe dans auth mais pas dans public.users
          logger.warn('AUTH_SERVICE', `Profil utilisateur non trouvé (${duration}ms)`, { userId })
          return { data: null, error: null }
        }
        
        // Vérifier si c'est une erreur de récursion RLS (maintenant corrigée, mais on gère quand même)
        if (error.code === '42P17' || error.message?.includes('infinite recursion')) {
          logger.error('AUTH_SERVICE', 'Erreur de récursion RLS détectée (devrait être corrigée)', {
            userId,
            error: error.message,
            hint: 'Les politiques RLS ont été corrigées. Rechargez la page.',
          })
          // Retourner null pour permettre la continuation
          return { data: null, error }
        }
        
        // Vérifier si c'est une erreur RLS
        if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('RLS')) {
          logger.error('AUTH_SERVICE', 'Erreur de permissions RLS détectée', {
            userId,
            error: error.message,
            hint: 'Vérifiez les politiques RLS de la table users',
          })
        }
        
        throw error
      }
      
      logger.debug('AUTH_SERVICE', `Profil récupéré avec succès (${duration}ms)`, {
        userId,
        email: data?.email,
        role: data?.role,
      })
      return { data, error: null }
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Vérifier si c'est le timeout
      if (error.message?.includes('Timeout')) {
        logger.error('AUTH_SERVICE', `TIMEOUT: getUserProfile bloqué après ${duration}ms`, {
          userId,
          message: 'La requête Supabase ne répond pas. Vérifiez les politiques RLS.',
        })
      } else {
        logger.error('AUTH_SERVICE', `Exception dans getUserProfile après ${duration}ms`, error)
      }
      
      return { data: null, error }
    }
  },

  async ensureUserProfile(userId, userData = {}) {
    logger.debug('AUTH_SERVICE', 'ensureUserProfile appelé', { userId, hasUserData: Object.keys(userData).length > 0 })
    
    try {
      // Vérifier si le profil existe déjà dans public.users
      logger.debug('AUTH_SERVICE', 'Vérification existence du profil...')
      const { data: existingProfile, error: getError } = await this.getUserProfile(userId)

      if (existingProfile) {
        logger.debug('AUTH_SERVICE', 'Profil existant trouvé', { userId })
        return { data: existingProfile, error: null }
      }

      if (getError && getError.code !== 'PGRST116') {
        logger.warn('AUTH_SERVICE', 'Erreur lors de la récupération du profil', getError)
      } else {
        logger.debug('AUTH_SERVICE', 'Aucun profil trouvé, création nécessaire')
      }

      // Si le profil n'existe pas, on essaie de le créer
      // D'abord, récupérer les infos de l'utilisateur depuis auth
      logger.debug('AUTH_SERVICE', 'Récupération des infos utilisateur depuis auth...')
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        logger.warn('AUTH_SERVICE', 'Impossible de récupérer l\'utilisateur depuis auth', { authError })
        // Si on ne peut pas récupérer l'utilisateur auth, utiliser les données fournies
        if (!userId) {
          throw new Error('User ID is required to create profile')
        }
      } else {
        logger.debug('AUTH_SERVICE', 'Utilisateur auth récupéré', { email: user.email })
      }

      // Préparer les données du profil selon la structure réelle de la table users
      const profileData = {
        id: userId,
        email: user?.email || userData.email || '',
        nom: userData.nom || user?.user_metadata?.nom || null,
        prenom: userData.prenom || user?.user_metadata?.prenom || null,
        role: userData.role || user?.user_metadata?.role || 'ADMIN_ORGANISME',
        telephone: userData.telephone || user?.user_metadata?.telephone || null,
        organisation_id: userData.organisation_id || null,
        metadata: userData.metadata || {},
      }

      logger.debug('AUTH_SERVICE', 'Insertion du profil dans public.users...', {
        id: profileData.id,
        email: profileData.email,
        role: profileData.role,
      })

      // Timeout pour l'insertion aussi
      const insertTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout: L\'insertion du profil a pris plus de 10 secondes'))
        }, 10000)
      })

      const insertPromise = supabase
        .from('users')
        .insert([profileData])
        .select()
        .single()

      const { data, error } = await Promise.race([insertPromise, insertTimeoutPromise])

      if (error) {
        logger.warn('AUTH_SERVICE', 'Erreur lors de l\'insertion du profil', {
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details,
          errorHint: error.hint,
        })
        
        // Si l'erreur est une violation unique (utilisateur existe déjà), récupérer le profil existant
        if (error.code === '23505') {
          logger.debug('AUTH_SERVICE', 'Violation unique détectée, récupération du profil existant...')
          const { data: existing } = await this.getUserProfile(userId)
          if (existing) {
            logger.debug('AUTH_SERVICE', 'Profil existant récupéré après violation unique')
            return { data: existing, error: null }
          }
        }
        
        // Si c'est un timeout ou une erreur RLS, retourner une erreur mais ne pas bloquer
        if (error.message?.includes('Timeout') || error.code === '42501') {
          logger.error('AUTH_SERVICE', 'Erreur RLS/Timeout lors de l\'insertion du profil', {
            userId,
            hint: 'Vérifiez les politiques RLS INSERT sur la table users',
          })
          return { data: null, error }
        }
        
        throw error
      }
      
      logger.info('AUTH_SERVICE', 'Profil utilisateur créé avec succès', { userId, email: profileData.email })
      return { data, error: null }
    } catch (error) {
      logger.error('AUTH_SERVICE', 'Erreur lors de ensureUserProfile', error)
      // Ne pas bloquer si le profil existe déjà ou si on ne peut pas le créer
      // Retourner null plutôt que de lancer une erreur
      return { data: null, error }
    }
  },

  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating user profile:', error)
      return { data: null, error }
    }
  },
}

