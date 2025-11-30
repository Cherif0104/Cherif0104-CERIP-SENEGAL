import { userRepository } from '@/data/repositories'
import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'

/**
 * Service Users - Gestion des utilisateurs
 */
export const usersService = {
  /**
   * Récupérer tous les utilisateurs
   */
  async getAll(options = {}) {
    return await userRepository.findAll(options)
  },

  /**
   * Récupérer un utilisateur par ID
   */
  async getById(id) {
    return await userRepository.findById(id)
  },

  /**
   * Récupérer un utilisateur avec toutes ses relations
   */
  async getByIdWithRelations(id) {
    return await userRepository.findByIdWithRelations(id)
  },

  /**
   * Créer un utilisateur
   * Note: Utilise signUp qui crée dans Supabase Auth et déclenche le trigger pour créer le profil
   * Pour la création admin, il faudrait utiliser une Edge Function avec l'API Admin
   */
  async create(userData) {
    logger.debug('USERS_SERVICE', 'create appelé', userData)

    try {
      // Utiliser signUp qui crée dans Auth et déclenche le trigger pour le profil
      const password = userData.password || this.generateTempPassword()
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: password,
        options: {
          data: {
            nom: userData.nom,
            prenom: userData.prenom,
            role: userData.role || 'ADMIN_ORGANISME',
          },
        },
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('Échec de la création de l\'utilisateur')
      }

      // Le trigger devrait créer le profil, mais on peut le mettre à jour si nécessaire
      // Attendre un peu pour que le trigger se déclenche
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mettre à jour le profil si nécessaire (telephone, actif, etc.)
      if (userData.telephone || userData.actif !== undefined) {
        const profileUpdate = {
          telephone: userData.telephone || null,
          actif: userData.actif !== undefined ? userData.actif : true,
        }
        await userRepository.update(authData.user.id, profileUpdate)
      }

      // Récupérer le profil créé
      const { data: profile } = await userRepository.findById(authData.user.id)

      logger.info('USERS_SERVICE', 'Utilisateur créé avec succès', { id: profile?.id })
      return { data: { ...profile, tempPassword: password }, error: null }
    } catch (error) {
      logger.error('USERS_SERVICE', 'Erreur création utilisateur', error)
      return { data: null, error }
    }
  },

  /**
   * Mettre à jour un utilisateur
   */
  async update(id, userData) {
    logger.debug('USERS_SERVICE', 'update appelé', { id, userData })

    try {
      // Mettre à jour le profil dans public.users
      const { data, error } = await userRepository.update(id, userData)

      if (error) throw error

      // Note: Mise à jour des métadonnées Auth nécessiterait l'API Admin
      // Pour l'instant, on met seulement à jour le profil dans public.users

      logger.info('USERS_SERVICE', 'Utilisateur mis à jour', { id })
      return { data, error: null }
    } catch (error) {
      logger.error('USERS_SERVICE', 'Erreur mise à jour utilisateur', error)
      return { data: null, error }
    }
  },

  /**
   * Activer/Désactiver un utilisateur
   */
  async toggleActif(id, actif) {
    logger.debug('USERS_SERVICE', 'toggleActif appelé', { id, actif })
    return await userRepository.toggleActif(id, actif)
  },

  /**
   * Réinitialiser le mot de passe d'un utilisateur
   * Note: Nécessite l'API Admin, devrait être fait via Edge Function
   * Pour l'instant, on utilise la réinitialisation standard (email)
   */
  async resetPassword(email) {
    logger.debug('USERS_SERVICE', 'resetPassword appelé', { email })

    try {
      // Utiliser la réinitialisation standard par email
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      logger.info('USERS_SERVICE', 'Email de réinitialisation envoyé', { email })
      return { data: { success: true, message: 'Email de réinitialisation envoyé' }, error: null }
    } catch (error) {
      logger.error('USERS_SERVICE', 'Erreur réinitialisation mot de passe', error)
      return { data: null, error }
    }
  },

  /**
   * Supprimer un utilisateur
   * Note: La suppression nécessite l'API Admin, devrait être fait via Edge Function
   * Pour l'instant, on désactive seulement le compte
   */
  async delete(id) {
    logger.debug('USERS_SERVICE', 'delete appelé (désactivation)', { id })

    try {
      // Désactiver l'utilisateur au lieu de le supprimer
      const result = await userRepository.toggleActif(id, false)
      
      if (result.error) throw result.error

      logger.info('USERS_SERVICE', 'Utilisateur désactivé', { id })
      return { data: { success: true, message: 'Utilisateur désactivé (non supprimé)' }, error: null }
    } catch (error) {
      logger.error('USERS_SERVICE', 'Erreur désactivation utilisateur', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer les utilisateurs actifs
   */
  async getActifs(options = {}) {
    return await userRepository.findActifs(options)
  },

  /**
   * Récupérer les utilisateurs par rôle
   */
  async getByRole(role, options = {}) {
    return await userRepository.findByRole(role, options)
  },

  /**
   * Générer un mot de passe temporaire
   */
  generateTempPassword() {
    const length = 12
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return password
  },
}

