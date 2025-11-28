// Service d'authentification avec Supabase
import { supabase } from '../lib/supabase'

export const authService = {
  /**
   * Connexion d'un utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   */
  async signIn(email, password) {
    try {
      console.log('[authService.signIn] start', { email })
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('[authService.signIn] error', error)
        return { data: null, error }
      }

      // On ne bloque plus la connexion sur la création du profil en base
      // Le profil sera créé/complété plus tard via ensureUserProfile si nécessaire
      console.log('[authService.signIn] success, hasUser:', !!data?.user)
      return { data, error: null }
    } catch (err) {
      console.error('[authService.signIn] exception', err)
      return { data: null, error: err }
    }
  },

  /**
   * Inscription d'un nouvel utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @param {string} nom - Nom de l'utilisateur
   * @param {string} prenom - Prénom de l'utilisateur
   * @param {string} role - Rôle de l'utilisateur (par défaut: CERIP)
   */
  async signUp(email, password, nom, prenom, role = 'CERIP') {
    try {
      console.log('[authService.signUp] start', { email, nom, prenom, role })
      // Créer le compte dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nom,
            prenom,
            role,
          }
        }
      })

      if (authError) {
        console.error('[authService.signUp] Supabase signup error:', authError)
        return { data: null, error: authError }
      }

      // Si l'inscription réussit mais que le trigger échoue, créer le profil manuellement
      if (authData?.user) {
        console.log('[authService.signUp] user created in auth', { userId: authData.user.id })
        // Attendre un peu pour laisser le trigger s'exécuter
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Vérifier si le profil existe, sinon le créer
        // Utiliser maybeSingle() au lieu de single() pour éviter l'erreur 406
        const { data: existingProfile, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('id', authData.user.id)
          .maybeSingle()

        // Si erreur 406 ou PGRST116, c'est que le profil n'existe pas (normal)
        const profileDoesNotExist = !existingProfile && (
          !checkError || 
          checkError.code === 'PGRST116' || 
          checkError.status === 406
        )

        if (profileDoesNotExist) {
          // Le trigger n'a pas fonctionné, créer le profil manuellement
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email: authData.user.email,
              nom: nom || authData.user.email?.split('@')[0] || 'Utilisateur',
              prenom: prenom || '',
              role: role || 'CERIP',
              actif: true,
              date_creation: new Date().toISOString()
            })

          if (profileError) {
            console.error('[authService.signUp] Error creating user profile after signup:', profileError)
            console.error('[authService.signUp] Profile error details:', {
              code: profileError.code,
              message: profileError.message,
              details: profileError.details,
              hint: profileError.hint
            })
            // Ne pas échouer l'inscription si le profil ne peut pas être créé
            // Il sera créé lors de la première connexion via ensureUserProfile
          } else {
            console.log('[authService.signUp] User profile created successfully after signup')
          }
        } else if (checkError && checkError.code !== 'PGRST116' && checkError.status !== 406) {
          // Autre type d'erreur (table n'existe pas, permissions, etc.)
          console.error('[authService.signUp] Error checking user profile:', checkError)
        }
      }

      return { data: authData, error: null }
    } catch (err) {
      console.error('[authService.signUp] exception', err)
      return { data: null, error: err }
    }
  },

  /**
   * Déconnexion de l'utilisateur
   */
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  /**
   * Récupérer la session actuelle
   */
  async getSession() {
    console.log('[authService.getSession] called')
    const { data, error } = await supabase.auth.getSession()
    console.log('[authService.getSession] result', { hasSession: !!data?.session, error })
    return { data, error }
  },

  /**
   * Récupérer le profil utilisateur depuis la table users
   * @param {string} userId - ID de l'utilisateur
   */
  async getUserProfile(userId) {
    try {
      console.log('[authService.getUserProfile] called', { userId })
      // Utiliser maybeSingle() au lieu de single() pour éviter l'erreur 406
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        // Si erreur autre que "not found", logger les détails
        if (error.code !== 'PGRST116' && error.status !== 406) {
          console.error('[authService.getUserProfile] Error fetching user profile:', error)
          console.error('[authService.getUserProfile] Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          })
        }
        
        // Si l'utilisateur n'existe pas dans la table users, créer un profil par défaut
        if (error.code === 'PGRST116' || error.status === 406 || !data) {
          // Récupérer les infos depuis auth.users
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            return {
              data: {
                id: user.id,
                email: user.email,
                nom: user.user_metadata?.nom || user.email?.split('@')[0] || 'Utilisateur',
                prenom: user.user_metadata?.prenom || '',
                role: user.user_metadata?.role || 'CERIP',
                actif: true
              },
              error: null
            }
          }
        }
        return { data: null, error }
      }

      return { data, error: null }
    } catch (err) {
      console.error('[authService.getUserProfile] exception', err)
      return { data: null, error: err }
    }
  },

  /**
   * S'assurer que le profil utilisateur existe dans la table users
   * @param {string} userId - ID de l'utilisateur
   * @param {string} email - Email de l'utilisateur
   */
  async ensureUserProfile(userId, email) {
    try {
      console.log('[authService.ensureUserProfile] called', { userId, email })
      // Vérifier si le profil existe
      const { data: existingProfile, error: existingError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle()

      if (existingError && existingError.code !== 'PGRST116' && existingError.status !== 406) {
        console.error('[authService.ensureUserProfile] error when checking existing profile', existingError)
      }

      // Si le profil n'existe pas, le créer
      if (!existingProfile) {
        const { data: { user } } = await supabase.auth.getUser()
        console.log('[authService.ensureUserProfile] no existing profile, creating one', { userId })
        const { error } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: email,
            nom: user?.user_metadata?.nom || email?.split('@')[0] || 'Utilisateur',
            prenom: user?.user_metadata?.prenom || '',
            role: user?.user_metadata?.role || 'CERIP',
            actif: true,
            date_creation: new Date().toISOString()
          })

        if (error && error.code !== '23505') { // Ignorer si déjà existant
          console.error('[authService.ensureUserProfile] Error creating user profile:', error)
        }
      }
    } catch (err) {
      console.error('[authService.ensureUserProfile] exception', err)
    }
  },

  /**
   * Écouter les changements d'état d'authentification
   * @param {Function} callback - Fonction appelée lors des changements
   */
  onAuthStateChange(callback) {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[authService.onAuthStateChange] event', { event, hasUser: !!session?.user })
      // Si l'utilisateur se connecte, s'assurer que le profil existe
      if (event === 'SIGNED_IN' && session?.user) {
        await this.ensureUserProfile(session.user.id, session.user.email)
      }
      callback(event, session)
    })

    return data
  },

  /**
   * Récupérer l'utilisateur actuel
   */
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { data: user, error }
  },

  /**
   * Mettre à jour le profil utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} updates - Données à mettre à jour
   */
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (err) {
      console.error('Error updating user profile:', err)
      return { data: null, error: err }
    }
  }
}
