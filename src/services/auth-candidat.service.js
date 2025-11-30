import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'

/**
 * Service d'authentification pour les candidats
 * Permet aux candidats de créer un compte et se connecter pour suivre leurs candidatures
 */
export const authCandidatService = {
  /**
   * Inscription d'un candidat
   * Vérifie que l'email correspond à une candidature existante
   */
  async signUp(email, password, nom, prenom) {
    logger.debug('AUTH_CANDIDAT_SERVICE', 'signUp appelé', { email })

    try {
      // Vérifier que l'email correspond à une candidature existante
      const { data: candidatExist, error: checkError } = await supabase
        .from('candidats')
        .select('id, email, nom, prenom')
        .eq('email', email)
        .single()

      if (checkError || !candidatExist) {
        logger.warn('AUTH_CANDIDAT_SERVICE', 'Aucune candidature trouvée pour cet email', { email })
        return {
          data: null,
          error: {
            message:
              'Aucune candidature trouvée avec cet email. Veuillez d\'abord postuler à un appel à candidatures.',
          },
        }
      }

      // Créer le compte Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nom: nom || candidatExist.nom,
            prenom: prenom || candidatExist.prenom,
            role: 'CANDIDAT',
            candidat_id: candidatExist.id,
          },
        },
      })

      if (authError) {
        logger.error('AUTH_CANDIDAT_SERVICE', 'Erreur Supabase Auth signUp', authError)
        throw authError
      }

      if (!authData.user) {
        throw new Error('Aucun utilisateur créé')
      }

      // Créer ou mettre à jour le profil dans public.users
      const { error: profileError } = await supabase.from('users').upsert(
        {
          id: authData.user.id,
          email,
          nom: nom || candidatExist.nom,
          prenom: prenom || candidatExist.prenom,
          role: 'CANDIDAT',
          metadata: {
            candidat_id: candidatExist.id,
          },
        },
        { onConflict: 'id' }
      )

      if (profileError) {
        logger.error('AUTH_CANDIDAT_SERVICE', 'Erreur création profil', profileError)
        // Ne pas bloquer si le profil échoue, on pourra le créer plus tard
      }

      // Lier le candidat à l'utilisateur
      await supabase
        .from('candidats')
        .update({ user_id: authData.user.id })
        .eq('id', candidatExist.id)

      logger.info('AUTH_CANDIDAT_SERVICE', 'Candidat inscrit avec succès', {
        userId: authData.user.id,
        candidatId: candidatExist.id,
      })

      return { data: authData, error: null }
    } catch (error) {
      logger.error('AUTH_CANDIDAT_SERVICE', 'Erreur globale signUp', error)
      return {
        data: null,
        error: {
          message: error.message || 'Erreur lors de l\'inscription',
          details: error,
        },
      }
    }
  },

  /**
   * Connexion d'un candidat
   */
  async signIn(email, password) {
    logger.debug('AUTH_CANDIDAT_SERVICE', 'signIn appelé', { email })

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        logger.error('AUTH_CANDIDAT_SERVICE', 'Erreur Supabase Auth signIn', error)
        throw error
      }

      if (!data.user) {
        throw new Error('Aucun utilisateur retourné')
      }

      // Vérifier que c'est bien un candidat
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (!profile || profile.role !== 'CANDIDAT') {
        await supabase.auth.signOut()
        throw new Error('Accès réservé aux candidats')
      }

      logger.info('AUTH_CANDIDAT_SERVICE', 'Candidat connecté avec succès', {
        userId: data.user.id,
        email: data.user.email,
      })

      return { data, error: null }
    } catch (error) {
      logger.error('AUTH_CANDIDAT_SERVICE', 'Erreur globale signIn', error)
      return {
        data: null,
        error: {
          message: error.message || 'Erreur de connexion',
          details: error,
        },
      }
    }
  },

  /**
   * Déconnexion
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      logger.info('AUTH_CANDIDAT_SERVICE', 'Candidat déconnecté')
      return { error: null }
    } catch (error) {
      logger.error('AUTH_CANDIDAT_SERVICE', 'Erreur signOut', error)
      return { error }
    }
  },

  /**
   * Récupérer le profil candidat
   */
  async getCandidatProfile(userId) {
    try {
      const { data: user } = await supabase.from('users').select('*, metadata').eq('id', userId).single()

      if (!user || user.role !== 'CANDIDAT') {
        return { data: null, error: new Error('Profil candidat non trouvé') }
      }

      // Récupérer les informations du candidat
      const candidatId = user.metadata?.candidat_id
      if (candidatId) {
        const { data: candidat } = await supabase.from('candidats').select('*').eq('id', candidatId).single()
        return { data: { ...user, candidat }, error: null }
      }

      return { data: user, error: null }
    } catch (error) {
      logger.error('AUTH_CANDIDAT_SERVICE', 'Erreur getCandidatProfile', error)
      return { data: null, error }
    }
  },

  /**
   * Vérifier si un email a déjà une candidature
   */
  async checkEmailExists(email) {
    try {
      const { data, error } = await supabase
        .from('candidats')
        .select('id, email, nom, prenom')
        .eq('email', email)
        .maybeSingle()

      if (error) throw error

      return {
        exists: !!data,
        candidat: data || null,
      }
    } catch (error) {
      logger.error('AUTH_CANDIDAT_SERVICE', 'Erreur checkEmailExists', error)
      return { exists: false, candidat: null }
    }
  },
}

