import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'

/**
 * Service Projet Rallonges - Gestion des demandes de rallonge de budget
 */
export const projetRallongesService = {
  /**
   * Récupérer toutes les rallonges d'un projet
   */
  async getByProjet(projetId, options = {}) {
    try {
      logger.debug('PROJET_RALLONGES_SERVICE', 'getByProjet appelé', { projetId, options })
      
      let query = supabase
        .from('projet_rallonges_budget')
        .select('*')
        .eq('projet_id', projetId)
        .order('created_at', { ascending: false })

      if (options.filters) {
        if (options.filters.statut) {
          query = query.eq('statut', options.filters.statut)
        }
      }

      const { data, error } = await query

      if (error) {
        logger.error('PROJET_RALLONGES_SERVICE', 'Erreur getByProjet', error)
        throw error
      }

      logger.debug('PROJET_RALLONGES_SERVICE', `getByProjet réussi: ${data?.length || 0} rallonges`)
      return { data: data || [], error: null }
    } catch (error) {
      logger.error('PROJET_RALLONGES_SERVICE', 'Erreur globale getByProjet', error)
      return { data: [], error }
    }
  },

  /**
   * Récupérer une rallonge par ID
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('projet_rallonges_budget')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      logger.error('PROJET_RALLONGES_SERVICE', 'Erreur getById', error)
      return { data: null, error }
    }
  },

  /**
   * Créer une demande de rallonge
   */
  async create(rallongeData) {
    try {
      logger.debug('PROJET_RALLONGES_SERVICE', 'create appelé', { rallongeData })
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!rallongeData.projet_id) {
        throw new Error('projet_id est requis')
      }
      
      if (!rallongeData.montant_demande || parseFloat(rallongeData.montant_demande) <= 0) {
        throw new Error('montant_demande doit être supérieur à 0')
      }
      
      if (!rallongeData.motif || !rallongeData.motif.trim()) {
        throw new Error('motif est requis')
      }

      // Récupérer le programme_id du projet
      const { data: projet } = await supabase
        .from('projets')
        .select('programme_id')
        .eq('id', rallongeData.projet_id)
        .single()

      if (!projet || !projet.programme_id) {
        throw new Error('Projet non trouvé ou sans programme associé')
      }

      const dataToInsert = {
        projet_id: rallongeData.projet_id,
        programme_id: projet.programme_id,
        montant_demande: parseFloat(rallongeData.montant_demande),
        motif: rallongeData.motif.trim(),
        statut: 'EN_ATTENTE',
        created_by: user?.id || null,
        justificatif_url: rallongeData.justificatif_url || null,
      }

      const { data, error } = await supabase
        .from('projet_rallonges_budget')
        .insert(dataToInsert)
        .select()
        .single()

      if (error) {
        logger.error('PROJET_RALLONGES_SERVICE', 'Erreur création rallonge', error)
        throw error
      }

      logger.info('PROJET_RALLONGES_SERVICE', 'Rallonge créée avec succès', { id: data.id })
      return { data, error: null }
    } catch (error) {
      logger.error('PROJET_RALLONGES_SERVICE', 'Erreur create', error)
      return { 
        data: null, 
        error: {
          message: error?.message || 'Erreur lors de la création de la demande de rallonge',
          details: error?.details,
          hint: error?.hint
        }
      }
    }
  },

  /**
   * Approuver une demande de rallonge
   */
  async approuver(id, commentaire = null) {
    try {
      logger.debug('PROJET_RALLONGES_SERVICE', 'approuver appelé', { id })
      
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('projet_rallonges_budget')
        .update({
          statut: 'APPROUVEE',
          approuve_par: user?.id || null,
          approuve_le: new Date().toISOString(),
          commentaire_decision: commentaire?.trim() || null,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logger.error('PROJET_RALLONGES_SERVICE', 'Erreur approbation', error)
        throw error
      }

      // TODO: Mettre à jour le budget_alloue du projet
      // Cela devrait être fait via une fonction RPC ou un trigger

      logger.info('PROJET_RALLONGES_SERVICE', 'Rallonge approuvée avec succès', { id })
      return { data, error: null }
    } catch (error) {
      logger.error('PROJET_RALLONGES_SERVICE', 'Erreur approuver', error)
      return { data: null, error }
    }
  },

  /**
   * Refuser une demande de rallonge
   */
  async refuser(id, commentaire = null) {
    try {
      logger.debug('PROJET_RALLONGES_SERVICE', 'refuser appelé', { id })
      
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('projet_rallonges_budget')
        .update({
          statut: 'REFUSEE',
          approuve_par: user?.id || null,
          approuve_le: new Date().toISOString(),
          commentaire_decision: commentaire?.trim() || null,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logger.error('PROJET_RALLONGES_SERVICE', 'Erreur refus', error)
        throw error
      }

      logger.info('PROJET_RALLONGES_SERVICE', 'Rallonge refusée avec succès', { id })
      return { data, error: null }
    } catch (error) {
      logger.error('PROJET_RALLONGES_SERVICE', 'Erreur refuser', error)
      return { data: null, error }
    }
  },

  /**
   * Annuler une demande de rallonge
   */
  async annuler(id) {
    try {
      logger.debug('PROJET_RALLONGES_SERVICE', 'annuler appelé', { id })

      const { data, error } = await supabase
        .from('projet_rallonges_budget')
        .update({
          statut: 'ANNULEE',
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logger.error('PROJET_RALLONGES_SERVICE', 'Erreur annulation', error)
        throw error
      }

      logger.info('PROJET_RALLONGES_SERVICE', 'Rallonge annulée avec succès', { id })
      return { data, error: null }
    } catch (error) {
      logger.error('PROJET_RALLONGES_SERVICE', 'Erreur annuler', error)
      return { data: null, error }
    }
  },
}

