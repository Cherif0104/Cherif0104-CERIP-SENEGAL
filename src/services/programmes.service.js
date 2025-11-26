// Service de gestion des programmes avec Supabase
import { supabase } from '../lib/supabase'

const TABLE = 'programmes'

export const programmesService = {
  async getAll() {
    try {
      const { data, error } = await supabase.from(TABLE).select('*')

      return { data: data || [], error }
    } catch (error) {
      console.error('Error fetching programmes:', error)
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
      console.error('Error fetching programme:', error)
      return { data: null, error }
    }
  },

  async create(programme) {
    try {
      const programmeData = {
        nom: programme.nom,
        description: programme.description,
        financeur: programme.financeur,
        chef_projet: programme.chef_projet,
        budget: programme.budget,
        date_debut: programme.date_debut || null,
        date_fin: programme.date_fin || null,
        statut: programme.statut || 'EN_PREPARATION',
        // Champs étendus (s'ils existent dans la base)
        type_programme: programme.type_programme || null,
        thematiques: programme.thematiques || [],
        pays: programme.pays || null,
        regions: programme.regions || [],
        departements: programme.departements || [],
        communes: programme.communes || [],
        secteurs_cibles: programme.secteurs_cibles || [],
        genres_cibles: programme.genres_cibles || [],
        objectif_beneficiaires: programme.objectif_beneficiaires || null,
        objectif_emplois: programme.objectif_emplois || null,
        niveau_risque: programme.niveau_risque || null,
        frequence_reporting: programme.frequence_reporting || null,
        meta: programme.meta || {}
      }

      const { data, error } = await supabase
        .from(TABLE)
        .insert(programmeData)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating programme:', error)
      return { data: null, error }
    }
  },

  async update(id, programme) {
    try {
      const updateData = {
        nom: programme.nom,
        description: programme.description,
        financeur: programme.financeur,
        chef_projet: programme.chef_projet,
        budget: programme.budget,
        date_debut: programme.date_debut || null,
        date_fin: programme.date_fin || null,
        statut: programme.statut,
        type_programme: programme.type_programme || null,
        thematiques: programme.thematiques || [],
        pays: programme.pays || null,
        regions: programme.regions || [],
        departements: programme.departements || [],
        communes: programme.communes || [],
        secteurs_cibles: programme.secteurs_cibles || [],
        genres_cibles: programme.genres_cibles || [],
        objectif_beneficiaires: programme.objectif_beneficiaires || null,
        objectif_emplois: programme.objectif_emplois || null,
        niveau_risque: programme.niveau_risque || null,
        frequence_reporting: programme.frequence_reporting || null,
        meta: programme.meta || {}
      }

      const { data, error } = await supabase
        .from(TABLE)
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating programme:', error)
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
      console.error('Error deleting programme:', error)
      return { data: null, error }
    }
  },

  async getByFinanceur(financeur) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('financeur', financeur)
        .order('date_creation', { ascending: false })

      return { data: data || [], error }
    } catch (error) {
      console.error('Error fetching programmes by financeur:', error)
      return { data: [], error }
    }
  }
}
