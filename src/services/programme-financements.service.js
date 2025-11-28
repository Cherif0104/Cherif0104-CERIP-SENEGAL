// Service de gestion des financements des programmes
import { supabase } from '../lib/supabase'

const TABLE = 'programme_financements'

export const programmeFinancementsService = {
  async getAll(programmeId) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('programme_id', programmeId)
        .order('date_prevue', { ascending: true })

      return { data: data || [], error }
    } catch (error) {
      console.error('Error fetching financements:', error)
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

      return { data, error }
    } catch (error) {
      console.error('Error fetching financement:', error)
      return { data: null, error }
    }
  },

  async create(financement) {
    try {
      const financementData = {
        programme_id: financement.programme_id,
        financeur_id: financement.financeur_id || null,
        montant: financement.montant,
        date_prevue: financement.date_prevue,
        date_effective: financement.date_effective || null,
        statut: financement.statut || 'PREVU',
        numero_versement: financement.numero_versement || null,
        reference_financeur: financement.reference_financeur || null,
        justificatif_url: financement.justificatif_url || null,
        description: financement.description || null
      }

      const { data, error } = await supabase
        .from(TABLE)
        .insert(financementData)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating financement:', error)
      return { data: null, error }
    }
  },

  async update(id, financement) {
    try {
      const updateData = {
        financeur_id: financement.financeur_id || null,
        montant: financement.montant,
        date_prevue: financement.date_prevue,
        date_effective: financement.date_effective || null,
        statut: financement.statut,
        numero_versement: financement.numero_versement || null,
        reference_financeur: financement.reference_financeur || null,
        justificatif_url: financement.justificatif_url || null,
        description: financement.description || null
      }

      const { data, error } = await supabase
        .from(TABLE)
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating financement:', error)
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
      console.error('Error deleting financement:', error)
      return { data: null, error }
    }
  },

  async getSummary(programmeId) {
    try {
      const { data: financements, error } = await this.getAll(programmeId)
      if (error) {
        return { data: null, error }
      }

      const summary = {
        total_prevu: 0,
        total_confirme: 0,
        total_recu: 0,
        total_retarde: 0,
        total_annule: 0,
        financements: financements || []
      }

      financements.forEach(f => {
        const montant = parseFloat(f.montant || 0)
        summary.total_prevu += montant

        switch (f.statut) {
          case 'CONFIRME':
            summary.total_confirme += montant
            break
          case 'RECU':
            summary.total_recu += montant
            break
          case 'RETARDE':
            summary.total_retarde += montant
            break
          case 'ANNULE':
            summary.total_annule += montant
            break
        }
      })

      summary.total_attendu = summary.total_prevu - summary.total_annule
      summary.total_effectif = summary.total_recu

      return { data: summary, error: null }
    } catch (error) {
      console.error('Error calculating financements summary:', error)
      return { data: null, error }
    }
  },

  async getByStatut(programmeId, statut) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('programme_id', programmeId)
        .eq('statut', statut)
        .order('date_prevue', { ascending: true })

      return { data: data || [], error }
    } catch (error) {
      console.error('Error fetching financements by statut:', error)
      return { data: [], error }
    }
  }
}

