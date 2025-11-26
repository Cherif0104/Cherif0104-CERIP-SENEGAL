// Service de gestion des plans d'action avec Supabase
import { supabase } from '../lib/supabase'

const TABLE = 'plans_action'

export const planActionService = {
  async create(beneficiaireId, plan) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .insert({
          beneficiaire_id: beneficiaireId,
          etapes: plan.etapes || []
        })
        .select('*')
        .single()

      if (!error) {
        // lier le plan au bénéficiaire
        await supabase
          .from('beneficiaires')
          .update({ plan_action_id: data.id })
          .eq('id', beneficiaireId)
      }

      return { data, error }
    } catch (error) {
      console.error('Error creating plan action:', error)
      return { data: null, error }
    }
  },

  async update(beneficiaireId, plan) {
    try {
      const { data: existing } = await supabase
        .from(TABLE)
        .select('*')
        .eq('beneficiaire_id', beneficiaireId)
        .single()

      if (!existing) {
        return this.create(beneficiaireId, plan)
      }

      const { data, error } = await supabase
        .from(TABLE)
        .update({ etapes: plan.etapes || [] })
        .eq('id', existing.id)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating plan action:', error)
      return { data: null, error }
    }
  },

  async validateEtape(beneficiaireId, etapeId) {
    try {
      const { data: plan, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('beneficiaire_id', beneficiaireId)
        .single()

      if (error || !plan) {
        return { data: null, error: error || { message: 'Plan d’action not found' } }
      }

      const etapes = plan.etapes || []
      const index = etapes.findIndex(e => e.id === etapeId)

      if (index === -1) {
        return { data: null, error: { message: 'Étape not found' } }
      }

      etapes[index] = {
        ...etapes[index],
        valide: true,
        date_validation: new Date().toISOString()
      }

      const { data: updated, error: updateError } = await supabase
        .from(TABLE)
        .update({ etapes })
        .eq('id', plan.id)
        .select('*')
        .single()

      return { data: updated, error: updateError }
    } catch (error) {
      console.error('Error validating etape:', error)
      return { data: null, error }
    }
  },

  async get(beneficiaireId) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('beneficiaire_id', beneficiaireId)
        .single()

      if (error && error.code !== 'PGRST116') {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching plan action:', error)
      return { data: null, error }
    }
  }
}
