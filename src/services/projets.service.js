// Service de gestion des projets avec Supabase
import { supabase } from '../lib/supabase'

const TABLE = 'projets'

export const projetsService = {
  async getAll(programmeId = null) {
    try {
      let query = supabase.from(TABLE).select('*').order('created_at', { ascending: false })

      if (programmeId) {
        query = query.eq('programme_id', programmeId)
      }

      const { data, error } = await query
      return { data: data || [], error }
    } catch (error) {
      console.error('Error fetching projets:', error)
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

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching projet:', error)
      return { data: null, error }
    }
  },

  async create(projet) {
    try {
      const projetData = {
        nom: projet.nom,
        description: projet.description,
        programme_id: projet.programme_id || null,
        type_activite: projet.type_activite || null,
        date_debut: projet.date_debut || null,
        date_fin: projet.date_fin || null,
        budget: projet.budget || null,
        statut: projet.statut || 'EN_PREPARATION',
        chef_projet_id: projet.chef_projet_id || null,
        mentors_ids: projet.mentors_ids || [],
        formateurs_ids: projet.formateurs_ids || [],
        coaches_ids: projet.coaches_ids || [],
        regions: projet.regions || [],
        departements: projet.departements || [],
        communes: projet.communes || [],
        meta: projet.meta || {}
      }

      const { data, error } = await supabase
        .from(TABLE)
        .insert(projetData)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating projet:', error)
      return { data: null, error }
    }
  },

  async update(id, projet) {
    try {
      const updateData = {
        nom: projet.nom,
        description: projet.description,
        programme_id: projet.programme_id || null,
        type_activite: projet.type_activite || null,
        date_debut: projet.date_debut || null,
        date_fin: projet.date_fin || null,
        budget: projet.budget || null,
        statut: projet.statut,
        chef_projet_id: projet.chef_projet_id || null,
        mentors_ids: projet.mentors_ids || [],
        formateurs_ids: projet.formateurs_ids || [],
        coaches_ids: projet.coaches_ids || [],
        regions: projet.regions || [],
        departements: projet.departements || [],
        communes: projet.communes || [],
        meta: projet.meta || {}
      }

      const { data, error } = await supabase
        .from(TABLE)
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating projet:', error)
      return { data: null, error }
    }
  },

  async getByChefProjet(chefProjetId) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('chef_projet_id', chefProjetId)
        .order('created_at', { ascending: false })

      return { data: data || [], error }
    } catch (error) {
      console.error('Error fetching projets by chef projet:', error)
      return { data: [], error }
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
      console.error('Error deleting projet:', error)
      return { data: null, error }
    }
  }
}
