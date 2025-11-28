// Service d'audit et de traçabilité des programmes
import { programmeWorkflowService } from './programme-workflow.service'

export const programmeAuditService = {
  /**
   * Récupère l'historique complet d'un programme
   */
  async getAuditTrail(programmeId, filters = {}) {
    try {
      const { data, error } = await programmeWorkflowService.getHistorique(programmeId, filters)
      return { data, error }
    } catch (error) {
      console.error('Error getting audit trail:', error)
      return { data: [], error }
    }
  },

  /**
   * Récupère les modifications d'une entité spécifique
   */
  async getEntityHistory(programmeId, entiteType, entiteId) {
    try {
      const { data, error } = await programmeWorkflowService.getHistorique(programmeId, {
        entite_type: entiteType,
        entite_id: entiteId
      })
      return { data, error }
    } catch (error) {
      console.error('Error getting entity history:', error)
      return { data: [], error }
    }
  },

  /**
   * Récupère l'historique des modifications d'un champ spécifique
   */
  async getFieldHistory(programmeId, champ) {
    try {
      const { data, error } = await programmeWorkflowService.getHistorique(programmeId)
      if (error) {
        return { data: [], error }
      }

      const filtered = (data || []).filter(entry => {
        if (!entry.ancienne_valeur || !entry.nouvelle_valeur) return false
        return entry.ancienne_valeur[champ] !== entry.nouvelle_valeur[champ]
      })

      return { data: filtered, error: null }
    } catch (error) {
      console.error('Error getting field history:', error)
      return { data: [], error }
    }
  },

  /**
   * Récupère l'historique des actions d'un utilisateur
   */
  async getUserActions(programmeId, userId) {
    try {
      const { data, error } = await programmeWorkflowService.getHistorique(programmeId)
      if (error) {
        return { data: [], error }
      }

      const filtered = (data || []).filter(entry => entry.utilisateur_id === userId)
      return { data: filtered, error: null }
    } catch (error) {
      console.error('Error getting user actions:', error)
      return { data: [], error }
    }
  },

  /**
   * Récupère un résumé de l'audit trail
   */
  async getAuditSummary(programmeId) {
    try {
      const { data, error } = await programmeWorkflowService.getHistorique(programmeId)
      if (error) {
        return { data: null, error }
      }

      const summary = {
        total_actions: data.length,
        actions_par_type: {},
        derniere_modification: data.length > 0 ? data[0] : null,
        utilisateurs_actifs: [],
        entites_modifiees: []
      }

      // Compter les actions par type
      data.forEach(entry => {
        summary.actions_par_type[entry.action] = (summary.actions_par_type[entry.action] || 0) + 1
      })

      // Extraire les utilisateurs uniques
      const userIds = [...new Set(data.map(e => e.utilisateur_id).filter(Boolean))]
      summary.utilisateurs_actifs = userIds

      // Extraire les entités modifiées
      const entites = [...new Set(
        data
          .map(e => e.entite_type)
          .filter(Boolean)
      )]
      summary.entites_modifiees = entites

      return { data: summary, error: null }
    } catch (error) {
      console.error('Error getting audit summary:', error)
      return { data: null, error }
    }
  }
}

