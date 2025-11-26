// Service de gestion des appels à candidatures avec Supabase
import { supabase } from '../lib/supabase'

const TABLE = 'appels_candidatures'

export const appelsService = {
  async getAll(projetId = null) {
    try {
      let query = supabase.from(TABLE).select('*').order('created_at', { ascending: false })

      if (projetId) {
        query = query.eq('projet_id', projetId)
      }

      const { data, error } = await query

      // Normaliser les champs pour le front (renommer criteres_eligibilite -> criteres)
      const formatted = (data || []).map(a => ({
        ...a,
        criteres: a.criteres_eligibilite
      }))

      return { data: formatted, error }
    } catch (error) {
      console.error('Error fetching appels:', error)
      return { data: [], error }
    }
  },

  async getById(id) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        return { data: null, error }
      }

      const formatted = {
        ...data,
        criteres: data.criteres_eligibilite
      }

      return { data: formatted, error: null }
    } catch (error) {
      console.error('Error fetching appel:', error)
      return { data: null, error }
    }
  },

  async create(appel) {
    try {
      const appelData = {
        titre: appel.titre,
        description: appel.description,
        projet_id: appel.projet_id || null,
        statut: appel.statut || 'OUVERT',
        date_ouverture: appel.date_ouverture || null,
        date_fermeture: appel.date_fermeture || null,
        criteres_eligibilite: appel.criteres || null
      }

      const { data, error } = await supabase
        .from(TABLE)
        .insert(appelData)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating appel:', error)
      return { data: null, error }
    }
  },

  async update(id, appel) {
    try {
      const updateData = {
        titre: appel.titre,
        description: appel.description,
        projet_id: appel.projet_id || null,
        statut: appel.statut,
        date_ouverture: appel.date_ouverture || null,
        date_fermeture: appel.date_fermeture || null,
        criteres_eligibilite: appel.criteres || null
      }

      const { data, error } = await supabase
        .from(TABLE)
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating appel:', error)
      return { data: null, error }
    }
  },

  async close(id) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .update({ statut: 'CLOTURE' })
        .eq('id', id)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error closing appel:', error)
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
      console.error('Error deleting appel:', error)
      return { data: null, error }
    }
  }
}
