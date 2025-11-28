// Service de gestion des partenaires des programmes
import { supabase } from '../lib/supabase'

const TABLE = 'programme_partenaires'

export const programmePartenairesService = {
  /**
   * Récupère tous les partenaires d'un programme
   */
  async getAll(programmeId, filters = {}) {
    try {
      let query = supabase
        .from(TABLE)
        .select('*')
        .eq('programme_id', programmeId)

      if (filters.statut) {
        query = query.eq('statut', filters.statut)
      }

      if (filters.role) {
        query = query.eq('role', filters.role)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      return { data: data || [], error }
    } catch (error) {
      console.error('Error fetching partenaires:', error)
      return { data: [], error }
    }
  },

  /**
   * Récupère un partenaire par ID
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('id', id)
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error fetching partenaire:', error)
      return { data: null, error }
    }
  },

  /**
   * Crée un nouveau partenaire
   */
  async create(partenaire) {
    try {
      const partenaireData = {
        programme_id: partenaire.programme_id,
        partenaire_id: partenaire.partenaire_id || null,
        partenaire_nom: partenaire.partenaire_nom,
        partenaire_type: partenaire.partenaire_type || null,
        role: partenaire.role,
        contribution_budgetaire: partenaire.contribution_budgetaire || 0,
        contribution_type: partenaire.contribution_type || null,
        date_debut: partenaire.date_debut || null,
        date_fin: partenaire.date_fin || null,
        statut: partenaire.statut || 'ACTIF',
        contact_nom: partenaire.contact_nom || null,
        contact_email: partenaire.contact_email || null,
        contact_telephone: partenaire.contact_telephone || null,
        notes: partenaire.notes || null
      }

      const { data, error } = await supabase
        .from(TABLE)
        .insert(partenaireData)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating partenaire:', error)
      return { data: null, error }
    }
  },

  /**
   * Met à jour un partenaire
   */
  async update(id, partenaire) {
    try {
      const updateData = {
        partenaire_id: partenaire.partenaire_id || null,
        partenaire_nom: partenaire.partenaire_nom,
        partenaire_type: partenaire.partenaire_type || null,
        role: partenaire.role,
        contribution_budgetaire: partenaire.contribution_budgetaire || 0,
        contribution_type: partenaire.contribution_type || null,
        date_debut: partenaire.date_debut || null,
        date_fin: partenaire.date_fin || null,
        statut: partenaire.statut,
        contact_nom: partenaire.contact_nom || null,
        contact_email: partenaire.contact_email || null,
        contact_telephone: partenaire.contact_telephone || null,
        notes: partenaire.notes || null
      }

      const { data, error } = await supabase
        .from(TABLE)
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating partenaire:', error)
      return { data: null, error }
    }
  },

  /**
   * Supprime un partenaire
   */
  async delete(id) {
    try {
      const { error } = await supabase
        .from(TABLE)
        .delete()
        .eq('id', id)

      return { data: { id }, error }
    } catch (error) {
      console.error('Error deleting partenaire:', error)
      return { data: null, error }
    }
  },

  /**
   * Récupère le résumé des contributions
   */
  async getContributionsSummary(programmeId) {
    try {
      const { data, error } = await supabase.rpc('calculate_programme_contributions', {
        programme_id_param: programmeId
      })

      if (error) {
        console.error('Error calculating contributions:', error)
        // Fallback: calcul manuel
        const { data: partenaires } = await this.getAll(programmeId, { statut: 'ACTIF' })
        const total = partenaires.reduce((sum, p) => sum + (parseFloat(p.contribution_budgetaire) || 0), 0)
        const byType = {}
        partenaires.forEach(p => {
          const type = p.contribution_type || 'AUTRE'
          byType[type] = (byType[type] || 0) + (parseFloat(p.contribution_budgetaire) || 0)
        })

        return {
          data: {
            total_contributions: total,
            contributions_par_type: byType,
            nombre_partenaires: partenaires.length
          },
          error: null
        }
      }

      return { data: data?.[0] || null, error: null }
    } catch (error) {
      console.error('Error getting contributions summary:', error)
      return { data: null, error }
    }
  }
}

