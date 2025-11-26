import { supabase } from '../lib/supabase'

const TABLE = 'referentiels'

export const referentielsService = {
  async getByType(type) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('type', type)
        .eq('actif', true)
        .order('ordre', { ascending: true })

      return { data: data || [], error }
    } catch (error) {
      console.error('Error fetching referentiels:', error)
      return { data: [], error }
    }
  },

  async create(referentiel) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .insert({
          type: referentiel.type,
          code: referentiel.code,
          label: referentiel.label,
          actif: referentiel.actif !== false,
          ordre: referentiel.ordre || 0,
          pays: referentiel.pays || null,
          region: referentiel.region || null,
          departement: referentiel.departement || null,
          meta: referentiel.meta || null
        })
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating referentiel:', error)
      return { data: null, error }
    }
  }
}


