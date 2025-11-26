import { supabase } from '../lib/supabase'
import { testAuthService } from './testAuth.service'

// Service d'authentification unifié avec support du bypass
export const authService = {
  // Vérifier si le bypass est activé et si l'email est un compte de test
  _useBypass(email) {
    return testAuthService.isEnabled() && testAuthService.isTestAccount(email)
  },

  async signIn(email, password) {
    // Si c'est un compte de test et que le bypass est activé, l'utiliser DIRECTEMENT
    // NE JAMAIS ESSAYER SUPABASE pour les comptes de test pour éviter les erreurs 400
    if (this._useBypass(email)) {
      const result = await testAuthService.signIn(email, password)
      // Si le bypass échoue, retourner l'erreur sans essayer Supabase
      return result
    }

    // Sinon, utiliser Supabase Auth normalement (uniquement pour les vrais utilisateurs)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    } catch (err) {
      console.error('Supabase auth error:', err)
      return { data: null, error: err }
    }
  },

  async signOut() {
    // Déconnecter dans les deux systèmes
    const bypassSession = await testAuthService.getSession()
    if (bypassSession.data?.session) {
      await testAuthService.signOut()
    }
    
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getSession() {
    // Si le bypass est activé, vérifier d'abord le bypass
    if (testAuthService.isEnabled()) {
      const bypassSession = await testAuthService.getSession()
      if (bypassSession.data?.session) {
        return bypassSession
      }
    }

    // Sinon, utiliser Supabase
    const { data, error } = await supabase.auth.getSession()
    return { data, error }
  },

  async getUserProfile(userId) {
    // Si c'est un ID de bypass, récupérer le profil depuis le bypass
    if (userId?.startsWith('00000000-0000-0000-0000-00000000')) {
      const { data, error } = await testAuthService.getUserProfile()
      return { data, error }
    }

    // Sinon, utiliser Supabase
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  onAuthStateChange(callback) {
    let bypassSubscription = null
    let supabaseSubscription = null

    // Écouter les deux systèmes
    if (testAuthService.isEnabled()) {
      // Écouter le bypass
      const bypassResult = testAuthService.onAuthStateChange((event, session) => {
        // Si on a une session bypass, ne pas écouter Supabase
        if (session) {
          callback(event, session)
        } else {
          // Si pas de session bypass, vérifier Supabase
          supabase.auth.getSession().then(({ data: { session: supabaseSession } }) => {
            if (supabaseSession) {
              callback('SIGNED_IN', supabaseSession)
            }
          })
        }
      })
      bypassSubscription = bypassResult?.data?.subscription
    }

    // Écouter Supabase - Supabase retourne directement { data: { subscription } }
    const supabaseResult = supabase.auth.onAuthStateChange((event, session) => {
      // Vérifier d'abord si on a une session bypass active
      if (testAuthService.isEnabled()) {
        testAuthService.getSession().then(({ data: { session: bypassSession } }) => {
          // Si pas de session bypass, utiliser Supabase
          if (!bypassSession) {
            callback(event, session)
          }
        })
      } else {
        callback(event, session)
      }
    })

    // Supabase retourne { data: { subscription: { unsubscribe } } }
    supabaseSubscription = supabaseResult?.data?.subscription

    // Retourner un objet avec unsubscribe qui nettoie les deux
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            try {
              if (bypassSubscription && typeof bypassSubscription.unsubscribe === 'function') {
                bypassSubscription.unsubscribe()
              }
            } catch (e) {
              // Ignorer les erreurs de cleanup
            }
            try {
              if (supabaseSubscription && typeof supabaseSubscription.unsubscribe === 'function') {
                supabaseSubscription.unsubscribe()
              }
            } catch (e) {
              // Ignorer les erreurs de cleanup
            }
          }
        }
      }
    }
  }
}

