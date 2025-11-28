// Service de gestion des jalons des programmes
import { supabase } from '../lib/supabase'

const TABLE = 'programme_jalons'

export const programmeJalonsService = {
  /**
   * Récupère tous les jalons d'un programme
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

      const { data, error } = await query.order('ordre', { ascending: true }).order('date_prevue', { ascending: true })

      return { data: data || [], error }
    } catch (error) {
      console.error('Error fetching jalons:', error)
      return { data: [], error }
    }
  },

  /**
   * Récupère un jalon par ID
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
      console.error('Error fetching jalon:', error)
      return { data: null, error }
    }
  },

  /**
   * Crée un nouveau jalon
   */
  async create(jalon) {
    try {
      const jalonData = {
        programme_id: jalon.programme_id,
        libelle: jalon.libelle,
        description: jalon.description || null,
        date_prevue: jalon.date_prevue,
        date_reelle: jalon.date_reelle || null,
        statut: jalon.statut || 'PREVU',
        livrables: jalon.livrables || null,
        responsable_id: jalon.responsable_id || null,
        ordre: jalon.ordre || 0
      }

      const { data, error } = await supabase
        .from(TABLE)
        .insert(jalonData)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating jalon:', error)
      return { data: null, error }
    }
  },

  /**
   * Met à jour un jalon
   */
  async update(id, jalon) {
    try {
      const updateData = {
        libelle: jalon.libelle,
        description: jalon.description,
        date_prevue: jalon.date_prevue,
        date_reelle: jalon.date_reelle || null,
        statut: jalon.statut,
        livrables: jalon.livrables || null,
        responsable_id: jalon.responsable_id || null,
        ordre: jalon.ordre
      }

      const { data, error } = await supabase
        .from(TABLE)
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating jalon:', error)
      return { data: null, error }
    }
  },

  /**
   * Supprime un jalon
   */
  async delete(id) {
    try {
      const { error } = await supabase
        .from(TABLE)
        .delete()
        .eq('id', id)

      return { data: { id }, error }
    } catch (error) {
      console.error('Error deleting jalon:', error)
      return { data: null, error }
    }
  },

  /**
   * Marque un jalon comme atteint
   */
  async markAtteint(id, dateReelle = null) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .update({
          statut: 'ATTEINT',
          date_reelle: dateReelle || new Date().toISOString().split('T')[0]
        })
        .eq('id', id)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error marking jalon as atteint:', error)
      return { data: null, error }
    }
  },

  /**
   * Récupère l'avancement du programme
   */
  async getAvancement(programmeId) {
    try {
      const { data, error } = await supabase.rpc('calculate_programme_avancement', {
        programme_id_param: programmeId
      })

      if (error) {
        console.error('Error calculating avancement:', error)
        // Fallback: calcul manuel
        const { data: jalons } = await this.getAll(programmeId)
        const total = jalons.length
        const atteints = jalons.filter(j => j.statut === 'ATTEINT').length
        const enCours = jalons.filter(j => j.statut === 'EN_COURS').length
        const retardes = jalons.filter(j => j.statut === 'RETARDE').length
        const taux = total > 0 ? (atteints / total) * 100 : 0

        return {
          data: {
            total_jalons: total,
            jalons_atteints: atteints,
            jalons_en_cours: enCours,
            jalons_retardes: retardes,
            taux_avancement: Math.round(taux * 100) / 100
          },
          error: null
        }
      }

      return { data: data?.[0] || null, error: null }
    } catch (error) {
      console.error('Error getting avancement:', error)
      return { data: null, error }
    }
  },

  /**
   * Récupère les jalons en retard
   */
  async getJalonsRetardes(programmeId) {
    try {
      const { data, error } = await supabase.rpc('get_jalons_retardes', {
        programme_id_param: programmeId
      })

      if (error) {
        console.error('Error getting jalons retardes:', error)
        // Fallback: calcul manuel
        const { data: jalons } = await this.getAll(programmeId)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const retardes = jalons
          .filter(j => {
            if (j.statut === 'ATTEINT' || j.statut === 'ANNULE') return false
            const datePrevue = new Date(j.date_prevue)
            datePrevue.setHours(0, 0, 0, 0)
            return datePrevue < today
          })
          .map(j => ({
            id: j.id,
            libelle: j.libelle,
            date_prevue: j.date_prevue,
            jours_retard: Math.floor((today - new Date(j.date_prevue)) / (1000 * 60 * 60 * 24))
          }))

        return { data: retardes, error: null }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error getting jalons retardes:', error)
      return { data: [], error }
    }
  }
}

