import { supabase } from '@/lib/supabase'

export const candidaturesService = {
  // Appels à candidatures
  async getAppels(projetId = null) {
    try {
      let query = supabase
        .from('appels_candidatures')
        .select('*, projets(*)')
        .order('created_at', { ascending: false })

      if (projetId) {
        query = query.eq('projet_id', projetId)
      }

      const { data, error } = await query

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error getting appels:', error)
      return { data: null, error }
    }
  },

  async getAppelById(id) {
    try {
      const { data, error } = await supabase
        .from('appels_candidatures')
        .select('*, projets(*)')
        .eq('id', id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error getting appel:', error)
      return { data: null, error }
    }
  },

  async createAppel(appelData) {
    try {
      // L'ID est généré automatiquement par la base (UUID)
      const { data, error } = await supabase
        .from('appels_candidatures')
        .insert([appelData])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating appel:', error)
      return { data: null, error }
    }
  },

  async updateAppel(id, appelData) {
    try {
      const { data, error } = await supabase
        .from('appels_candidatures')
        .update(appelData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating appel:', error)
      return { data: null, error }
    }
  },

  // Candidats
  async getCandidats(appelId = null) {
    try {
      let query = supabase
        .from('candidats')
        .select('*, appels_candidatures(*), personnes(*)')
        .order('created_at', { ascending: false })

      if (appelId) {
        query = query.eq('appel_id', appelId)
      }

      const { data, error } = await query

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error getting candidats:', error)
      return { data: null, error }
    }
  },

  async getCandidatById(id) {
    try {
      const { data, error } = await supabase
        .from('candidats')
        .select('*, appels_candidatures(*), personnes(*)')
        .eq('id', id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error getting candidat:', error)
      return { data: null, error }
    }
  },

  async createCandidat(candidatData) {
    try {
      // L'ID est généré automatiquement par la base (UUID)
      const { data, error } = await supabase
        .from('candidats')
        .insert([candidatData])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating candidat:', error)
      return { data: null, error }
    }
  },

  async updateCandidat(id, candidatData) {
    try {
      const { data, error } = await supabase
        .from('candidats')
        .update(candidatData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating candidat:', error)
      return { data: null, error }
    }
  },
}

