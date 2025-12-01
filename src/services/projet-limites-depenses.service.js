import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'
import { formatCurrency } from '@/utils/format'

/**
 * Service Projet Limites Dépenses - Gestion des limites de dépenses par période
 */
export const projetLimitesDepensesService = {
  /**
   * Récupérer toutes les limites d'un projet
   */
  async getByProjet(projetId, options = {}) {
    try {
      logger.debug('PROJET_LIMITES_DEPENSES_SERVICE', 'getByProjet appelé', { projetId, options })
      
      let query = supabase
        .from('projet_limites_depenses')
        .select('*')
        .eq('projet_id', projetId)
        .order('date_debut', { ascending: false })

      if (options.filters) {
        if (options.filters.periode_type) {
          query = query.eq('periode_type', options.filters.periode_type)
        }
        if (options.filters.dateDebut) {
          query = query.gte('date_debut', options.filters.dateDebut)
        }
        if (options.filters.dateFin) {
          query = query.lte('date_fin', options.filters.dateFin)
        }
      }

      const { data, error } = await query

      if (error) {
        logger.error('PROJET_LIMITES_DEPENSES_SERVICE', 'Erreur getByProjet', error)
        throw error
      }

      logger.debug('PROJET_LIMITES_DEPENSES_SERVICE', `getByProjet réussi: ${data?.length || 0} limites`)
      return { data: data || [], error: null }
    } catch (error) {
      logger.error('PROJET_LIMITES_DEPENSES_SERVICE', 'Erreur globale getByProjet', error)
      return { data: [], error }
    }
  },

  /**
   * Récupérer une limite par ID
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('projet_limites_depenses')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      logger.error('PROJET_LIMITES_DEPENSES_SERVICE', 'Erreur getById', error)
      return { data: null, error }
    }
  },

  /**
   * Vérifier si une dépense respecte les limites
   */
  async verifierLimite(projetId, dateDepense, montant) {
    try {
      logger.debug('PROJET_LIMITES_DEPENSES_SERVICE', 'verifierLimite appelé', { projetId, dateDepense, montant })

      // Récupérer les limites actives pour cette date
      const { data: limites, error } = await supabase
        .from('projet_limites_depenses')
        .select('*')
        .eq('projet_id', projetId)
        .lte('date_debut', dateDepense)
        .gte('date_fin', dateDepense)

      if (error) {
        logger.error('PROJET_LIMITES_DEPENSES_SERVICE', 'Erreur récupération limites', error)
        throw error
      }

      if (!limites || limites.length === 0) {
        // Pas de limite configurée, autoriser
        return { data: { respecte: true, message: 'Aucune limite configurée' }, error: null }
      }

      // Calculer les dépenses déjà effectuées dans cette période
      const limite = limites[0] // Prendre la première limite active
      const { data: depenses } = await supabase
        .from('programme_depenses')
        .select('montant, statut')
        .eq('projet_id', projetId)
        .gte('date_depense', limite.date_debut)
        .lte('date_depense', limite.date_fin)
        .in('statut', ['VALIDE', 'VALIDÉ', 'VALIDATED', 'APPROUVE', 'APPROUVÉ', 'APPROVED', 'PAYE', 'PAYÉ', 'PAID'])

      const depensesTotal = depenses?.reduce((sum, d) => {
        return sum + parseFloat(String(d.montant).replace(/\s/g, '') || 0)
      }, 0) || 0

      const nouveauTotal = depensesTotal + parseFloat(montant)
      const limiteMax = parseFloat(limite.montant_max) + parseFloat(limite.ajustement || 0)
      const respecte = nouveauTotal <= limiteMax

      return {
        data: {
          respecte,
          limite: limiteMax,
          depensesActuelles: depensesTotal,
          nouveauTotal,
          depassement: respecte ? 0 : nouveauTotal - limiteMax,
          message: respecte 
            ? 'La limite est respectée' 
            : `Dépassement de ${formatCurrency(nouveauTotal - limiteMax)}`,
        },
        error: null
      }
    } catch (error) {
      logger.error('PROJET_LIMITES_DEPENSES_SERVICE', 'Erreur verifierLimite', error)
      return { data: null, error }
    }
  },

  /**
   * Créer une limite de dépenses
   */
  async create(limiteData) {
    try {
      logger.debug('PROJET_LIMITES_DEPENSES_SERVICE', 'create appelé', { limiteData })
      
      if (!limiteData.projet_id) {
        throw new Error('projet_id est requis')
      }
      
      if (!limiteData.periode_type || !['MENSUEL', 'TRIMESTRIEL', 'ANNUEL'].includes(limiteData.periode_type)) {
        throw new Error('periode_type doit être MENSUEL, TRIMESTRIEL ou ANNUEL')
      }
      
      if (!limiteData.montant_max || parseFloat(limiteData.montant_max) <= 0) {
        throw new Error('montant_max doit être supérieur à 0')
      }
      
      if (!limiteData.date_debut || !limiteData.date_fin) {
        throw new Error('date_debut et date_fin sont requis')
      }

      // Vérifier qu'il n'y a pas de chevauchement avec une limite existante
      const { data: limitesExistantes } = await supabase
        .from('projet_limites_depenses')
        .select('*')
        .eq('projet_id', limiteData.projet_id)
        .or(`and(date_debut.lte.${limiteData.date_fin},date_fin.gte.${limiteData.date_debut})`)

      if (limitesExistantes && limitesExistantes.length > 0) {
        return {
          data: null,
          error: {
            message: 'Une limite existe déjà pour cette période',
          }
        }
      }

      const dataToInsert = {
        projet_id: limiteData.projet_id,
        programme_id: limiteData.programme_id,
        periode_type: limiteData.periode_type,
        montant_max: parseFloat(limiteData.montant_max),
        date_debut: limiteData.date_debut,
        date_fin: limiteData.date_fin || null,
        herite_du_programme: limiteData.herite_du_programme !== undefined ? limiteData.herite_du_programme : true,
        ajustement: limiteData.ajustement ? parseFloat(limiteData.ajustement) : 0,
      }

      const { data, error } = await supabase
        .from('projet_limites_depenses')
        .insert(dataToInsert)
        .select()
        .single()

      if (error) {
        logger.error('PROJET_LIMITES_DEPENSES_SERVICE', 'Erreur création limite', error)
        throw error
      }

      logger.info('PROJET_LIMITES_DEPENSES_SERVICE', 'Limite créée avec succès', { id: data.id })
      return { data, error: null }
    } catch (error) {
      logger.error('PROJET_LIMITES_DEPENSES_SERVICE', 'Erreur create', error)
      return { 
        data: null, 
        error: {
          message: error?.message || 'Erreur lors de la création de la limite',
          details: error?.details,
          hint: error?.hint
        }
      }
    }
  },

  /**
   * Mettre à jour une limite
   */
  async update(id, limiteData) {
    try {
      logger.debug('PROJET_LIMITES_DEPENSES_SERVICE', 'update appelé', { id, limiteData })

      const updates = {}
      if (limiteData.periode_type !== undefined) updates.periode_type = limiteData.periode_type
      if (limiteData.montant_max !== undefined) updates.montant_max = parseFloat(limiteData.montant_max)
      if (limiteData.date_debut !== undefined) updates.date_debut = limiteData.date_debut
      if (limiteData.date_fin !== undefined) updates.date_fin = limiteData.date_fin
      if (limiteData.herite_du_programme !== undefined) updates.herite_du_programme = limiteData.herite_du_programme
      if (limiteData.ajustement !== undefined) updates.ajustement = parseFloat(limiteData.ajustement)

      const { data, error } = await supabase
        .from('projet_limites_depenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logger.error('PROJET_LIMITES_DEPENSES_SERVICE', 'Erreur update', error)
        throw error
      }

      logger.info('PROJET_LIMITES_DEPENSES_SERVICE', 'Limite mise à jour avec succès', { id })
      return { data, error: null }
    } catch (error) {
      logger.error('PROJET_LIMITES_DEPENSES_SERVICE', 'Erreur update', error)
      return { data: null, error }
    }
  },

  /**
   * Supprimer une limite
   */
  async delete(id) {
    try {
      logger.debug('PROJET_LIMITES_DEPENSES_SERVICE', 'delete appelé', { id })

      const { error } = await supabase
        .from('projet_limites_depenses')
        .delete()
        .eq('id', id)

      if (error) {
        logger.error('PROJET_LIMITES_DEPENSES_SERVICE', 'Erreur delete', error)
        throw error
      }

      logger.info('PROJET_LIMITES_DEPENSES_SERVICE', 'Limite supprimée avec succès', { id })
      return { data: { id }, error: null }
    } catch (error) {
      logger.error('PROJET_LIMITES_DEPENSES_SERVICE', 'Erreur delete', error)
      return { 
        data: null, 
        error: {
          message: error?.message || 'Erreur lors de la suppression de la limite',
          details: error?.details,
          hint: error?.hint
        }
      }
    }
  },
}

