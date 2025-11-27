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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        return { data: null, error }
      }

      // Après connexion réussie, s'assurer que le profil existe dans la table users
      if (data?.user) {
        await this.ensureUserProfile(data.user.id, data.user.email)
      }

      return { data, error: null }
    } catch (err) {
      console.error('Supabase auth error:', err)
      return { data: null, error: err }
    }
  },

  /**
   * Inscription d'un nouvel utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @param {string} nom - Nom de l'utilisateur
   * @param {string} prenom - Prénom de l'utilisateur
   * @param {string} role - Rôle de l'utilisateur (par défaut: ADMIN_SERIP)
   */
  async signUp(email, password, nom, prenom, role = 'ADMIN_SERIP') {
    try {
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
        return { data: null, error: authError }
      }

      // Le trigger Supabase créera automatiquement le profil dans la table users
      // On ne fait pas d'insertion manuelle pour éviter les conflits
      // Si le trigger échoue, ensureUserProfile sera appelé lors de la première connexion

      return { data: authData, error: null }
    } catch (err) {
      console.error('Sign up error:', err)
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
    const { data, error } = await supabase.auth.getSession()
    return { data, error }
  },

  /**
   * Récupérer le profil utilisateur depuis la table users
   * @param {string} userId - ID de l'utilisateur
   */
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // Si l'utilisateur n'existe pas dans la table users, créer un profil par défaut
        if (error.code === 'PGRST116') {
          // Récupérer les infos depuis auth.users
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            return {
              data: {
                id: user.id,
                email: user.email,
                nom: user.user_metadata?.nom || user.email?.split('@')[0] || 'Utilisateur',
                prenom: user.user_metadata?.prenom || '',
                role: user.user_metadata?.role || 'ADMIN_SERIP',
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
      console.error('Error fetching user profile:', err)
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
      // Vérifier si le profil existe
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single()

      // Si le profil n'existe pas, le créer
      if (!existingProfile) {
        const { data: { user } } = await supabase.auth.getUser()
        const { error } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: email,
            nom: user?.user_metadata?.nom || email?.split('@')[0] || 'Utilisateur',
            prenom: user?.user_metadata?.prenom || '',
            role: user?.user_metadata?.role || 'ADMIN_SERIP',
            actif: true,
            date_creation: new Date().toISOString()
          })

        if (error && error.code !== '23505') { // Ignorer si déjà existant
          console.error('Error creating user profile:', error)
        }
      }
    } catch (err) {
      console.error('Error ensuring user profile:', err)
    }
  },

  /**
   * Écouter les changements d'état d'authentification
   * @param {Function} callback - Fonction appelée lors des changements
   */
  onAuthStateChange(callback) {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
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
