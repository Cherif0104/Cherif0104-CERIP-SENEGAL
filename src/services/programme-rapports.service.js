// Service de gestion des rapports des programmes
import { supabase } from '../lib/supabase'

const TABLE = 'programme_rapports'

export const programmeRapportsService = {
  async getAll(programmeId, filters = {}) {
    try {
      let query = supabase
        .from(TABLE)
        .select('*')
        .eq('programme_id', programmeId)

      if (filters.type) {
        query = query.eq('type', filters.type)
      }

      if (filters.statut) {
        query = query.eq('statut', filters.statut)
      }

      if (filters.periode_debut) {
        query = query.gte('periode_debut', filters.periode_debut)
      }

      if (filters.periode_fin) {
        query = query.lte('periode_fin', filters.periode_fin)
      }

      const { data, error } = await query.order('periode_fin', { ascending: false })

      return { data: data || [], error }
    } catch (error) {
      console.error('Error fetching rapports:', error)
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
      console.error('Error fetching rapport:', error)
      return { data: null, error }
    }
  },

  async create(rapport) {
    try {
      const rapportData = {
        programme_id: rapport.programme_id,
        type: rapport.type,
        periode_debut: rapport.periode_debut,
        periode_fin: rapport.periode_fin,
        statut: rapport.statut || 'BROUILLON',
        contenu: rapport.contenu || {},
        titre: rapport.titre || null,
        description: rapport.description || null,
        fichier_pdf_url: rapport.fichier_pdf_url || null,
        fichier_excel_url: rapport.fichier_excel_url || null
      }

      const { data, error } = await supabase
        .from(TABLE)
        .insert(rapportData)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating rapport:', error)
      return { data: null, error }
    }
  },

  async update(id, rapport) {
    try {
      const updateData = {
        type: rapport.type,
        periode_debut: rapport.periode_debut,
        periode_fin: rapport.periode_fin,
        statut: rapport.statut,
        contenu: rapport.contenu,
        titre: rapport.titre,
        description: rapport.description,
        fichier_pdf_url: rapport.fichier_pdf_url,
        fichier_excel_url: rapport.fichier_excel_url,
        date_validation: rapport.date_validation || null,
        validated_by: rapport.validated_by || null,
        date_envoi: rapport.date_envoi || null
      }

      const { data, error } = await supabase
        .from(TABLE)
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating rapport:', error)
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
      console.error('Error deleting rapport:', error)
      return { data: null, error }
    }
  },

  async validate(id, validatedBy) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .update({
          statut: 'VALIDE',
          validated_by: validatedBy,
          date_validation: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error validating rapport:', error)
      return { data: null, error }
    }
  },

  async send(id) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .update({
          statut: 'ENVOYE',
          date_envoi: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error sending rapport:', error)
      return { data: null, error }
    }
  },

  async getByType(programmeId, type) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('programme_id', programmeId)
        .eq('type', type)
        .order('periode_fin', { ascending: false })

      return { data: data || [], error }
    } catch (error) {
      console.error('Error fetching rapports by type:', error)
      return { data: [], error }
    }
  }
}

