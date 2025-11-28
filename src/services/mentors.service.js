// Service de gestion des mentors avec Supabase
import { supabase } from '../lib/supabase'

const TABLE = 'mentors'
const TABLE_ASSIGNATIONS = 'mentor_assignations'
const TABLE_ACCOMPAGNEMENTS = 'accompagnements'

export const mentorsService = {
  async getAll(filters = {}) {
    try {
      let query = supabase
        .from(TABLE)
        .select(`
          *,
          user:user_id(id, nom, prenom, email, telephone, role)
        `)
        .order('created_at', { ascending: false })

      if (filters.statut) {
        // La table mentors n'a pas de colonne statut, on filtre via user.actif si nécessaire
        // Pour l'instant, on ignore ce filtre
      }

      const { data, error } = await query

      if (error) {
        return { data: [], error }
      }

      let filtered = data || []

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = filtered.filter(m => {
          const user = m.user
          return (
            user?.nom?.toLowerCase().includes(searchLower) ||
            user?.prenom?.toLowerCase().includes(searchLower) ||
            user?.email?.toLowerCase().includes(searchLower) ||
            m.specialite?.toLowerCase().includes(searchLower)
          )
        })
      }

      return { data: filtered, error: null }
    } catch (error) {
      console.error('Error fetching mentors:', error)
      return { data: [], error }
    }
  },

  async getById(id) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select(`
          *,
          user:user_id(id, nom, prenom, email, telephone, role)
        `)
        .eq('id', id)
        .single()

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching mentor:', error)
      return { data: null, error }
    }
  },

  async create(mentor) {
    try {
      const mentorData = {
        user_id: mentor.user_id || null,
        specialite: mentor.specialite || null,
        secteurs: mentor.secteurs || [],
        regions: mentor.regions || [],
        charge_max: mentor.charge_max || 20,
        metadata: mentor.metadata || {}
      }

      const { data, error } = await supabase
        .from(TABLE)
        .insert(mentorData)
        .select(`
          *,
          user:user_id(id, nom, prenom, email, telephone, role)
        `)
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating mentor:', error)
      return { data: null, error }
    }
  },

  async update(id, mentor) {
    try {
      const updateData = {
        user_id: mentor.user_id || null,
        specialite: mentor.specialite || null,
        secteurs: mentor.secteurs || [],
        regions: mentor.regions || [],
        charge_max: mentor.charge_max || 20,
        metadata: mentor.metadata || {}
      }

      const { data, error } = await supabase
        .from(TABLE)
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          user:user_id(id, nom, prenom, email, telephone, role)
        `)
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating mentor:', error)
      return { data: null, error }
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from(TABLE)
        .delete()
        .eq('id', id)

      return { data: { id }, error }
    } catch (error) {
      console.error('Error deleting mentor:', error)
      return { data: null, error }
    }
  },

  async getAssignations(mentorId) {
    try {
      const { data, error } = await supabase
        .from(TABLE_ASSIGNATIONS)
        .select('*')
        .eq('mentor_id', mentorId)
        .order('date_assignation', { ascending: false })

      return { data: data || [], error }
    } catch (error) {
      console.error('Error fetching assignations:', error)
      return { data: [], error }
    }
  },

  async getAccompagnements(mentorId) {
    try {
      const { data, error } = await supabase
        .from(TABLE_ACCOMPAGNEMENTS)
        .select('*')
        .eq('mentor_id', mentorId)
        .order('date_debut', { ascending: false })

      return { data: data || [], error }
    } catch (error) {
      console.error('Error fetching accompagnements:', error)
      return { data: [], error }
    }
  }
}
