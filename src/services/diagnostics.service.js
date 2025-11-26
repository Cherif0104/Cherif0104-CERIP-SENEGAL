// Service de gestion des diagnostics avec Supabase
import { supabase } from '../lib/supabase'

const TABLE = 'diagnostics'

export const diagnosticsService = {
  async create(candidatId, diagnostic) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .insert({
          candidat_id: candidatId,
          data: diagnostic
        })
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating diagnostic:', error)
      return { data: null, error }
    }
  },

  async update(candidatId, diagnostic) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .update({ data: diagnostic })
        .eq('candidat_id', candidatId)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating diagnostic:', error)
      return { data: null, error }
    }
  },

  async get(candidatId) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('candidat_id', candidatId)
        .single()

      if (error && error.code !== 'PGRST116') {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching diagnostic:', error)
      return { data: null, error }
    }
  }
}
