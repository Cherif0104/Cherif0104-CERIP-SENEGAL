// Service de gestion des dossiers avec Supabase
import { supabase } from '../lib/supabase'

const TABLE = 'dossiers'

export const dossiersService = {
  async getAll(filters = {}) {
    try {
      let query = supabase
        .from(TABLE)
        .select('*')
        .order('created_at', { ascending: false })

      if (filters.statut) {
        query = query.eq('statut', filters.statut)
      }
      if (filters.programme_id) {
        query = query.eq('programme_id', filters.programme_id)
      }
      if (filters.beneficiaire_id) {
        query = query.eq('beneficiaire_id', filters.beneficiaire_id)
      }

      const { data, error } = await query

      if (error) {
        return { data: [], error }
      }

      let filtered = data || []

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = filtered.filter(d =>
          d.commentaire?.toLowerCase().includes(searchLower) ||
          d.decision?.toLowerCase().includes(searchLower)
        )
      }

      return { data: filtered, error: null }
    } catch (error) {
      console.error('Error fetching dossiers:', error)
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
      console.error('Error fetching dossier:', error)
      return { data: null, error }
    }
  },

      async create(dossier) {
        try {
          const dossierData = {
            beneficiaire_id: dossier.beneficiaire_id || null,
            programme_id: dossier.programme_id || null,
            statut: dossier.statut || 'BROUILLON',
            montant_demande: dossier.montant_demande || null,
            montant_octroye: dossier.montant_octroye || null,
            score: dossier.score || null,
            decision: dossier.decision || null,
            commentaire: dossier.commentaire || null,
            evaluateur_id: dossier.evaluateur_id || null,
            metadata: dossier.metadata || {}
          }

      const { data, error } = await supabase
        .from(TABLE)
        .insert(dossierData)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating dossier:', error)
      return { data: null, error }
    }
  },

      async update(id, dossier) {
        try {
          const updateData = {
            beneficiaire_id: dossier.beneficiaire_id || null,
            programme_id: dossier.programme_id || null,
            statut: dossier.statut,
            montant_demande: dossier.montant_demande || null,
            montant_octroye: dossier.montant_octroye || null,
            score: dossier.score || null,
            decision: dossier.decision || null,
            commentaire: dossier.commentaire || null,
            evaluateur_id: dossier.evaluateur_id || null,
            metadata: dossier.metadata || {}
          }

      const { data, error } = await supabase
        .from(TABLE)
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating dossier:', error)
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
      console.error('Error deleting dossier:', error)
      return { data: null, error }
    }
  },

      async getByBeneficiaire(beneficiaireId) {
        try {
          const { data, error } = await supabase
            .from(TABLE)
            .select('*')
            .eq('beneficiaire_id', beneficiaireId)
            .order('created_at', { ascending: false })

          return { data: data || [], error }
        } catch (error) {
          console.error('Error fetching dossiers by beneficiaire:', error)
          return { data: [], error }
        }
      },

      async getByProgramme(programmeId) {
        try {
          const { data, error } = await supabase
            .from(TABLE)
            .select('*')
            .eq('programme_id', programmeId)
            .order('created_at', { ascending: false })

          return { data: data || [], error }
        } catch (error) {
          console.error('Error fetching dossiers by programme:', error)
          return { data: [], error }
        }
      }
}
