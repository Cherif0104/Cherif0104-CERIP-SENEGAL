import { supabase } from '@/lib/supabase'

export const projetsService = {
  async getAll(programmeId = null) {
    try {
      let query = supabase
        .from('projets')
        .select('*, programmes(*)')
        .order('created_at', { ascending: false })

      if (programmeId) {
        query = query.eq('programme_id', programmeId)
      }

      const { data, error } = await query

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error getting projets:', error)
      return { data: null, error }
    }
  },

  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('projets')
        .select('*, programmes(*)')
        .eq('id', id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error getting projet:', error)
      return { data: null, error }
    }
  },

  async create(projetData) {
    try {
      // L'ID est généré automatiquement par la base (UUID)
      const { data, error } = await supabase
        .from('projets')
        .insert([projetData])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating projet:', error)
      return { data: null, error }
    }
  },

  async update(id, projetData) {
    try {
      const { data, error } = await supabase
        .from('projets')
        .update(projetData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating projet:', error)
      return { data: null, error }
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from('projets')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error deleting projet:', error)
      return { error }
    }
  },
}

