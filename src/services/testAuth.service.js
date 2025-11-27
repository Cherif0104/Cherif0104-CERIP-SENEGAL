// Service d'authentification BYPASS pour les tests
// Permet de se connecter sans Supabase Auth en mode développement

const BYPASS_STORAGE_KEY = 'serip_bypass_session'
// Activer le bypass en développement OU si explicitement activé via variable d'environnement
// En production, on peut activer avec VITE_ENABLE_TEST_BYPASS=true
// Pour l'instant, on active toujours le bypass pour permettre les tests
const BYPASS_ENABLED = true // import.meta.env.DEV || import.meta.env.VITE_ENABLE_TEST_BYPASS === 'true'

// Comptes de test avec profils complets pour SERIP-CAS
export const TEST_ACCOUNTS = {
  'admin@serip-cas.sn': {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@serip-cas.sn',
    role: 'CERIP',
    nom: 'Admin SERIP-CAS',
    prenom: 'Administrateur',
    password: 'admin123',
    profile: {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@serip-cas.sn',
      role: 'CERIP',
      nom: 'Admin SERIP-CAS',
      prenom: 'Administrateur',
      telephone: '+221 77 123 45 67',
      organisation_id: 'SERIP-CAS',
      metadata: {}
    }
  },
  'chef.projet@serip-cas.sn': {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'chef.projet@serip-cas.sn',
    role: 'CHEF_PROJET',
    nom: 'Chef Projet',
    prenom: 'Test',
    password: 'chef123',
    profile: {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'chef.projet@serip-cas.sn',
      role: 'CHEF_PROJET',
      nom: 'Chef Projet',
      prenom: 'Test',
      telephone: '+221 77 234 56 78',
      organisation_id: 'SERIP-CAS',
      metadata: {}
    }
  },
  'mentor@serip-cas.sn': {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'mentor@serip-cas.sn',
    role: 'MENTOR',
    nom: 'Mentor',
    prenom: 'Test',
    password: 'mentor123',
    profile: {
      id: '00000000-0000-0000-0000-000000000003',
      email: 'mentor@serip-cas.sn',
      role: 'MENTOR',
      nom: 'Mentor',
      prenom: 'Test',
      telephone: '+221 77 345 67 89',
      organisation_id: 'SERIP-CAS',
      metadata: {}
    }
  },
  'formateur@serip-cas.sn': {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'formateur@serip-cas.sn',
    role: 'FORMATEUR',
    nom: 'Formateur',
    prenom: 'Test',
    password: 'formateur123',
    profile: {
      id: '00000000-0000-0000-0000-000000000004',
      email: 'formateur@serip-cas.sn',
      role: 'FORMATEUR',
      nom: 'Formateur',
      prenom: 'Test',
      telephone: '+221 77 456 78 90',
      organisation_id: 'SERIP-CAS',
      metadata: {}
    }
  },
  'coach@serip-cas.sn': {
    id: '00000000-0000-0000-0000-000000000005',
    email: 'coach@serip-cas.sn',
    role: 'COACH',
    nom: 'Coach',
    prenom: 'Test',
    password: 'coach123',
    profile: {
      id: '00000000-0000-0000-0000-000000000005',
      email: 'coach@serip-cas.sn',
      role: 'COACH',
      nom: 'Coach',
      prenom: 'Test',
      telephone: '+221 77 567 89 01',
      organisation_id: 'SERIP-CAS',
      metadata: {}
    }
  }
}

export const testAuthService = {
  isEnabled() {
    return BYPASS_ENABLED
  },

  /**
   * Vérifie si un email correspond à un compte de test
   */
  isTestAccount(email) {
    return TEST_ACCOUNTS.hasOwnProperty(email)
  },

  async signIn(email, password) {
    if (!BYPASS_ENABLED) {
      return { data: null, error: { message: 'Bypass désactivé en production' } }
    }

    const account = TEST_ACCOUNTS[email]
    
    if (!account || account.password !== password) {
      return {
        data: null,
        error: { message: 'Email ou mot de passe incorrect' }
      }
    }

    // Créer une session bypass
    const session = {
      user: {
        id: account.id,
        email: account.email,
        user_metadata: {
          role: account.role,
          nom: account.nom,
          prenom: account.prenom
        }
      },
      access_token: 'bypass_token_' + account.id,
      expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24h
    }

    // Stocker dans localStorage
    localStorage.setItem(BYPASS_STORAGE_KEY, JSON.stringify({
      session,
      profile: account.profile
    }))

    return {
      data: { user: session.user, session },
      error: null
    }
  },

  async signOut() {
    if (!BYPASS_ENABLED) return { error: null }
    localStorage.removeItem(BYPASS_STORAGE_KEY)
    return { error: null }
  },

  async getSession() {
    if (!BYPASS_ENABLED) {
      return { data: { session: null }, error: null }
    }

    try {
      const stored = localStorage.getItem(BYPASS_STORAGE_KEY)
      if (!stored) {
        return { data: { session: null }, error: null }
      }

      const { session } = JSON.parse(stored)
      
      // Vérifier l'expiration
      if (session.expires_at && session.expires_at < Date.now()) {
        localStorage.removeItem(BYPASS_STORAGE_KEY)
        return { data: { session: null }, error: null }
      }

      return { data: { session }, error: null }
    } catch (error) {
      localStorage.removeItem(BYPASS_STORAGE_KEY)
      return { data: { session: null }, error: null }
    }
  },

  async getUserProfile() {
    if (!BYPASS_ENABLED) {
      return { data: null, error: { message: 'Bypass désactivé' } }
    }

    try {
      const stored = localStorage.getItem(BYPASS_STORAGE_KEY)
      if (!stored) {
        return { data: null, error: { message: 'Pas de session' } }
      }

      const { profile } = JSON.parse(stored)
      return { data: profile, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  onAuthStateChange(callback) {
    if (!BYPASS_ENABLED) {
      return { data: { subscription: { unsubscribe: () => {} } } }
    }

    // Simuler un changement d'état
    const checkSession = async () => {
      const { data } = await this.getSession()
      callback(data?.session ? 'SIGNED_IN' : 'SIGNED_OUT', data?.session)
    }

    checkSession()

    // Écouter les changements de localStorage (depuis d'autres onglets)
    const handleStorageChange = (e) => {
      if (e.key === BYPASS_STORAGE_KEY) {
        checkSession()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            window.removeEventListener('storage', handleStorageChange)
          }
        }
      }
    }
  }
}

