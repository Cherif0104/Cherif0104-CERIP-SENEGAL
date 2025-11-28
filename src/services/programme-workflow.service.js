// Service de gestion du workflow et des approbations des programmes
import { supabase } from '../lib/supabase'

const TABLE_WORKFLOW = 'programme_workflow'
const TABLE_HISTORIQUE = 'programme_historique'

export const programmeWorkflowService = {
  // ========== WORKFLOW ==========

  async getWorkflow(programmeId) {
    try {
      const { data, error } = await supabase
        .from(TABLE_WORKFLOW)
        .select('*')
        .eq('programme_id', programmeId)
        .order('ordre', { ascending: true })

      return { data: data || [], error }
    } catch (error) {
      console.error('Error fetching workflow:', error)
      return { data: [], error }
    }
  },

  async createEtape(etape) {
    try {
      const etapeData = {
        programme_id: etape.programme_id,
        etape: etape.etape,
        statut: etape.statut || 'EN_ATTENTE',
        commentaire: etape.commentaire || null,
        ordre: etape.ordre || 0
      }

      const { data, error } = await supabase
        .from(TABLE_WORKFLOW)
        .insert(etapeData)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating workflow etape:', error)
      return { data: null, error }
    }
  },

  async updateEtape(id, etape) {
    try {
      const updateData = {
        etape: etape.etape,
        statut: etape.statut,
        commentaire: etape.commentaire || null,
        ordre: etape.ordre,
        approbateur_id: etape.approbateur_id || null,
        date_approbation: etape.date_approbation || null
      }

      const { data, error } = await supabase
        .from(TABLE_WORKFLOW)
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating workflow etape:', error)
      return { data: null, error }
    }
  },

  async approveEtape(id, approbateurId, commentaire = null) {
    try {
      const { data, error } = await supabase
        .from(TABLE_WORKFLOW)
        .update({
          statut: 'APPROUVE',
          approbateur_id: approbateurId,
          date_approbation: new Date().toISOString(),
          commentaire: commentaire || null
        })
        .eq('id', id)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error approving etape:', error)
      return { data: null, error }
    }
  },

  async rejectEtape(id, approbateurId, commentaire) {
    try {
      const { data, error } = await supabase
        .from(TABLE_WORKFLOW)
        .update({
          statut: 'REJETE',
          approbateur_id: approbateurId,
          date_approbation: new Date().toISOString(),
          commentaire: commentaire
        })
        .eq('id', id)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error rejecting etape:', error)
      return { data: null, error }
    }
  },

  async deleteEtape(id) {
    try {
      const { error } = await supabase
        .from(TABLE_WORKFLOW)
        .delete()
        .eq('id', id)

      return { data: { id }, error }
    } catch (error) {
      console.error('Error deleting workflow etape:', error)
      return { data: null, error }
    }
  },

  async getWorkflowStatus(programmeId) {
    try {
      const { data: workflow, error } = await this.getWorkflow(programmeId)
      if (error) {
        return { data: null, error }
      }

      const status = {
        total_etapes: workflow.length,
        etapes_approuvees: workflow.filter(e => e.statut === 'APPROUVE').length,
        etapes_en_attente: workflow.filter(e => e.statut === 'EN_ATTENTE').length,
        etapes_rejetees: workflow.filter(e => e.statut === 'REJETE').length,
        etape_actuelle: workflow.find(e => e.statut === 'EN_ATTENTE') || null,
        est_complet: workflow.length > 0 && workflow.every(e => e.statut === 'APPROUVE'),
        workflow: workflow
      }

      return { data: status, error: null }
    } catch (error) {
      console.error('Error getting workflow status:', error)
      return { data: null, error }
    }
  },

  // ========== HISTORIQUE ==========

  async getHistorique(programmeId, filters = {}) {
    try {
      let query = supabase
        .from(TABLE_HISTORIQUE)
        .select('*')
        .eq('programme_id', programmeId)

      if (filters.entite_type) {
        query = query.eq('entite_type', filters.entite_type)
      }

      if (filters.action) {
        query = query.eq('action', filters.action)
      }

      if (filters.date_debut) {
        query = query.gte('created_at', filters.date_debut)
      }

      if (filters.date_fin) {
        query = query.lte('created_at', filters.date_fin)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      return { data: data || [], error }
    } catch (error) {
      console.error('Error fetching historique:', error)
      return { data: [], error }
    }
  },

  async logAction(programmeId, action, entiteType, entiteId, ancienneValeur, nouvelleValeur, champModifie, commentaire) {
    try {
      const logData = {
        programme_id: programmeId,
        action: action,
        entite_type: entiteType || null,
        entite_id: entiteId || null,
        ancienne_valeur: ancienneValeur || null,
        nouvelle_valeur: nouvelleValeur || null,
        champ_modifie: champModifie || null,
        commentaire: commentaire || null
      }

      const { data, error } = await supabase
        .from(TABLE_HISTORIQUE)
        .insert(logData)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error logging action:', error)
      return { data: null, error }
    }
  }
}

