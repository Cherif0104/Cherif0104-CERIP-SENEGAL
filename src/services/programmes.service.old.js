import { supabase } from '@/lib/supabase'

export const programmesService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('programmes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error getting programmes:', error)
      return { data: null, error }
    }
  },

  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('programmes')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error getting programme:', error)
      return { data: null, error }
    }
  },

  async create(programmeData) {
    try {
      // L'ID est généré automatiquement par la base (UUID en TEXT)
      const { data, error } = await supabase
        .from('programmes')
        .insert([programmeData])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating programme:', error)
      return { data: null, error }
    }
  },

  async update(id, programmeData) {
    try {
      const { data, error } = await supabase
        .from('programmes')
        .update(programmeData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating programme:', error)
      return { data: null, error }
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from('programmes')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error deleting programme:', error)
      return { error }
    }
  },
}

