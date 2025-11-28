// Service de gestion des formations avec Supabase
import { supabase } from '../lib/supabase'

const TABLE = 'formations'
const TABLE_SESSIONS = 'sessions_formation'
const TABLE_INSCRIPTIONS = 'inscriptions_formations'
const TABLE_PARTICIPATIONS = 'participations_formation'

export const formationsService = {
  async getAll(filters = {}) {
    try {
      let query = supabase.from(TABLE).select('*').order('date_debut', { ascending: false })

      if (filters.statut) {
        query = query.eq('statut', filters.statut)
      }
      if (filters.projet_id) {
        query = query.eq('projet_id', filters.projet_id)
      }
      if (filters.formateur_id) {
        query = query.eq('formateur_id', filters.formateur_id)
      }

      const { data, error } = await query

      if (error) {
        return { data: [], error }
      }

      let filtered = data || []

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = filtered.filter(f =>
          f.nom?.toLowerCase().includes(searchLower) ||
          f.description?.toLowerCase().includes(searchLower) ||
          f.lieu?.toLowerCase().includes(searchLower)
        )
      }

      return { data: filtered, error: null }
    } catch (error) {
      console.error('Error fetching formations:', error)
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
      console.error('Error fetching formation:', error)
      return { data: null, error }
    }
  },

  async create(formation) {
    try {
      const formationData = {
        nom: formation.nom,
        description: formation.description || null,
        projet_id: formation.projet_id || null,
        formateur_id: formation.formateur_id || null,
        date_debut: formation.date_debut || null,
        date_fin: formation.date_fin || null,
        duree_heures: formation.duree_heures || null,
        statut: formation.statut || 'OUVERT',
        capacite_max: formation.capacite_max || null,
        lieu: formation.lieu || null,
        modalite: formation.modalite || 'PRESENTIEL',
        cout: formation.cout || null,
        objectifs: formation.objectifs || null,
        programme: formation.programme || null
      }

      const { data, error } = await supabase
        .from(TABLE)
        .insert(formationData)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating formation:', error)
      return { data: null, error }
    }
  },

  async update(id, formation) {
    try {
      const updateData = {
        nom: formation.nom,
        description: formation.description || null,
        projet_id: formation.projet_id || null,
        formateur_id: formation.formateur_id || null,
        date_debut: formation.date_debut || null,
        date_fin: formation.date_fin || null,
        duree_heures: formation.duree_heures || null,
        statut: formation.statut,
        capacite_max: formation.capacite_max || null,
        lieu: formation.lieu || null,
        modalite: formation.modalite || 'PRESENTIEL',
        cout: formation.cout || null,
        objectifs: formation.objectifs || null,
        programme: formation.programme || null
      }

      const { data, error } = await supabase
        .from(TABLE)
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating formation:', error)
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
      console.error('Error deleting formation:', error)
      return { data: null, error }
    }
  },

  async getSessions(formationId) {
    try {
      const { data, error } = await supabase
        .from(TABLE_SESSIONS)
        .select('*')
        .eq('formation_id', formationId)
        .order('date_session', { ascending: true })

      return { data: data || [], error }
    } catch (error) {
      console.error('Error fetching sessions:', error)
      return { data: [], error }
    }
  },

  async getInscriptions(formationId) {
    try {
      const { data, error } = await supabase
        .from(TABLE_INSCRIPTIONS)
        .select('*')
        .eq('formation_id', formationId)
        .order('date_inscription', { ascending: false })

      return { data: data || [], error }
    } catch (error) {
      console.error('Error fetching inscriptions:', error)
      return { data: [], error }
    }
  },

  async getParticipations(formationId) {
    try {
      const { data, error } = await supabase
        .from(TABLE_PARTICIPATIONS)
        .select('*')
        .eq('formation_id', formationId)
        .order('date_participation', { ascending: false })

      return { data: data || [], error }
    } catch (error) {
      console.error('Error fetching participations:', error)
      return { data: [], error }
    }
  }
}

