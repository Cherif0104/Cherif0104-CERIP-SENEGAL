// Service de gestion budgétaire des programmes
import { supabase } from '../lib/supabase'

const TABLE_LIGNES = 'programme_budget_lignes'
const TABLE_ENGAGEMENTS = 'programme_engagements'
const TABLE_DEPENSES = 'programme_depenses'

export const programmeBudgetService = {
  // ========== LIGNES BUDGÉTAIRES ==========
  
  async getBudgetLines(programmeId) {
    try {
      const { data, error } = await supabase
        .from(TABLE_LIGNES)
        .select('*')
        .eq('programme_id', programmeId)
        .order('ordre', { ascending: true })

      return { data: data || [], error }
    } catch (error) {
      console.error('Error fetching budget lines:', error)
      return { data: [], error }
    }
  },

  async getBudgetLineById(id) {
    try {
      const { data, error } = await supabase
        .from(TABLE_LIGNES)
        .select('*')
        .eq('id', id)
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error fetching budget line:', error)
      return { data: null, error }
    }
  },

  async createBudgetLine(budgetLine) {
    try {
      const budgetLineData = {
        programme_id: budgetLine.programme_id,
        code_ligne: budgetLine.code_ligne,
        libelle: budgetLine.libelle,
        type_ligne: budgetLine.type_ligne,
        budget_alloue: budgetLine.budget_alloue || 0,
        budget_engage: 0,
        budget_depense: 0,
        ordre: budgetLine.ordre || 0,
        description: budgetLine.description || null
      }

      const { data, error } = await supabase
        .from(TABLE_LIGNES)
        .insert(budgetLineData)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating budget line:', error)
      return { data: null, error }
    }
  },

  async updateBudgetLine(id, budgetLine) {
    try {
      const updateData = {
        code_ligne: budgetLine.code_ligne,
        libelle: budgetLine.libelle,
        type_ligne: budgetLine.type_ligne,
        budget_alloue: budgetLine.budget_alloue,
        ordre: budgetLine.ordre,
        description: budgetLine.description
      }

      const { data, error } = await supabase
        .from(TABLE_LIGNES)
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating budget line:', error)
      return { data: null, error }
    }
  },

  async deleteBudgetLine(id) {
    try {
      const { error } = await supabase
        .from(TABLE_LIGNES)
        .delete()
        .eq('id', id)

      return { data: { id }, error }
    } catch (error) {
      console.error('Error deleting budget line:', error)
      return { data: null, error }
    }
  },

  async getBudgetSummary(programmeId) {
    try {
      const { data: lignes, error } = await this.getBudgetLines(programmeId)
      if (error) {
        return { data: null, error }
      }

      const summary = {
        total_alloue: 0,
        total_engage: 0,
        total_depense: 0,
        total_disponible: 0,
        lignes: lignes || []
      }

      lignes.forEach(ligne => {
        summary.total_alloue += parseFloat(ligne.budget_alloue || 0)
        summary.total_engage += parseFloat(ligne.budget_engage || 0)
        summary.total_depense += parseFloat(ligne.budget_depense || 0)
      })

      summary.total_disponible = summary.total_alloue - summary.total_engage - summary.total_depense

      return { data: summary, error: null }
    } catch (error) {
      console.error('Error calculating budget summary:', error)
      return { data: null, error }
    }
  },

  // ========== ENGAGEMENTS ==========

  async getEngagements(programmeId, budgetLigneId = null) {
    try {
      let query = supabase
        .from(TABLE_ENGAGEMENTS)
        .select('*')
        .eq('programme_id', programmeId)
        .order('date_engagement', { ascending: false })

      if (budgetLigneId) {
        query = query.eq('budget_ligne_id', budgetLigneId)
      }

      const { data, error } = await query

      return { data: data || [], error }
    } catch (error) {
      console.error('Error fetching engagements:', error)
      return { data: [], error }
    }
  },

  async createEngagement(engagement) {
    try {
      const engagementData = {
        programme_id: engagement.programme_id,
        budget_ligne_id: engagement.budget_ligne_id || null,
        libelle: engagement.libelle,
        montant: engagement.montant,
        date_engagement: engagement.date_engagement,
        statut: engagement.statut || 'EN_ATTENTE',
        reference: engagement.reference || null,
        description: engagement.description || null
      }

      const { data, error } = await supabase
        .from(TABLE_ENGAGEMENTS)
        .insert(engagementData)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating engagement:', error)
      return { data: null, error }
    }
  },

  async updateEngagement(id, engagement) {
    try {
      const updateData = {
        budget_ligne_id: engagement.budget_ligne_id || null,
        libelle: engagement.libelle,
        montant: engagement.montant,
        date_engagement: engagement.date_engagement,
        statut: engagement.statut,
        reference: engagement.reference,
        description: engagement.description
      }

      const { data, error } = await supabase
        .from(TABLE_ENGAGEMENTS)
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating engagement:', error)
      return { data: null, error }
    }
  },

  async deleteEngagement(id) {
    try {
      const { error } = await supabase
        .from(TABLE_ENGAGEMENTS)
        .delete()
        .eq('id', id)

      return { data: { id }, error }
    } catch (error) {
      console.error('Error deleting engagement:', error)
      return { data: null, error }
    }
  },

  // ========== DÉPENSES ==========

  async getDepenses(programmeId, budgetLigneId = null) {
    try {
      let query = supabase
        .from(TABLE_DEPENSES)
        .select('*')
        .eq('programme_id', programmeId)
        .order('date_depense', { ascending: false })

      if (budgetLigneId) {
        query = query.eq('budget_ligne_id', budgetLigneId)
      }

      const { data, error } = await query

      return { data: data || [], error }
    } catch (error) {
      console.error('Error fetching depenses:', error)
      return { data: [], error }
    }
  },

  async createDepense(depense) {
    try {
      const depenseData = {
        programme_id: depense.programme_id,
        budget_ligne_id: depense.budget_ligne_id || null,
        engagement_id: depense.engagement_id || null,
        libelle: depense.libelle,
        montant: depense.montant,
        date_depense: depense.date_depense,
        statut: depense.statut || 'BROUILLON',
        reference: depense.reference || null,
        justificatif_url: depense.justificatif_url || null,
        description: depense.description || null
      }

      const { data, error } = await supabase
        .from(TABLE_DEPENSES)
        .insert(depenseData)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating depense:', error)
      return { data: null, error }
    }
  },

  async updateDepense(id, depense) {
    try {
      const updateData = {
        budget_ligne_id: depense.budget_ligne_id || null,
        engagement_id: depense.engagement_id || null,
        libelle: depense.libelle,
        montant: depense.montant,
        date_depense: depense.date_depense,
        statut: depense.statut,
        reference: depense.reference,
        justificatif_url: depense.justificatif_url,
        description: depense.description
      }

      const { data, error } = await supabase
        .from(TABLE_DEPENSES)
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating depense:', error)
      return { data: null, error }
    }
  },

  async deleteDepense(id) {
    try {
      const { error } = await supabase
        .from(TABLE_DEPENSES)
        .delete()
        .eq('id', id)

      return { data: { id }, error }
    } catch (error) {
      console.error('Error deleting depense:', error)
      return { data: null, error }
    }
  }
}

