import { supabase } from '@/lib/supabase'

export const beneficiairesService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('beneficiaires')
        .select('*, candidats(*), personnes(*), projets(*), mentors(*), users(*)')
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error getting beneficiaires:', error)
      return { data: null, error }
    }
  },

  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('beneficiaires')
        .select('*, candidats(*), personnes(*), projets(*), mentors(*), users(*)')
        .eq('id', id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error getting beneficiaire:', error)
      return { data: null, error }
    }
  },

  async create(beneficiaireData) {
    try {
      // L'ID est TEXT dans cette table, généré côté serveur ou fourni
      const { data, error } = await supabase
        .from('beneficiaires')
        .insert([beneficiaireData])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating beneficiaire:', error)
      return { data: null, error }
    }
  },

  async update(id, beneficiaireData) {
    try {
      const { data, error } = await supabase
        .from('beneficiaires')
        .update(beneficiaireData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating beneficiaire:', error)
      return { data: null, error }
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from('beneficiaires')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error deleting beneficiaire:', error)
      return { error }
    }
  },
}

