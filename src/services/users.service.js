// Service de gestion des utilisateurs/intervenants avec Supabase
import { supabase } from '../lib/supabase'

const TABLE = 'users'

export const usersService = {
  /**
   * Récupère tous les utilisateurs avec un rôle spécifique
   * @param {string} role - Rôle à filtrer (CHEF_PROJET, MENTOR, FORMATEUR, COACH)
   */
  async getByRole(role) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('id, email, nom, prenom, role, telephone')
        .eq('role', role)
        .eq('actif', true)
        .order('nom', { ascending: true })

      if (error) {
        return { data: [], error }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error fetching users by role:', error)
      return { data: [], error }
    }
  },

  /**
   * Récupère tous les intervenants (mentors, formateurs, coaches)
   */
  async getIntervenants() {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('id, email, nom, prenom, role, telephone')
        .in('role', ['MENTOR', 'FORMATEUR', 'COACH'])
        .eq('actif', true)
        .order('role', { ascending: true })
        .order('nom', { ascending: true })

      if (error) {
        return { data: [], error }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error fetching intervenants:', error)
      return { data: [], error }
    }
  },

  /**
   * Récupère tous les chefs de projet
   */
  async getChefsProjet() {
    return this.getByRole('CHEF_PROJET')
  },

  /**
   * Récupère tous les utilisateurs
   */
  async getAll() {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('id, email, nom, prenom, role, telephone')
        .eq('actif', true)
        .order('nom', { ascending: true })

      if (error) {
        return { data: [], error }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error fetching users:', error)
      return { data: [], error }
    }
  },

  /**
   * Récupère un utilisateur par ID
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('id, email, nom, prenom, role, telephone')
        .eq('id', id)
        .single()

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching user:', error)
      return { data: null, error }
    }
  }
}

