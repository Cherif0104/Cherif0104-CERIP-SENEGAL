import { BaseRepository } from './BaseRepository'
import { logger } from '@/utils/logger'
import { supabase } from '@/lib/supabase'

/**
 * TresorerieRepository - Repository pour la gestion de la trésorerie
 */
export class TresorerieRepository extends BaseRepository {
  constructor() {
    super('flux_tresorerie', {
      enabled: true,
      ttl: 300000, // 5 minutes
      level: 'memory',
    })
  }

  /**
   * Obtenir le solde d'un compte
   */
  async getSoldeCompte(compteId) {
    try {
      const { data, error } = await supabase
        .from('comptes_bancaires')
        .select('solde_actuel, solde_initial')
        .eq('id', compteId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      logger.error('TRESORERIE_REPOSITORY', `Erreur getSoldeCompte ${compteId}`, error)
      return { data: null, error }
    }
  }

  /**
   * Obtenir tous les comptes bancaires
   */
  async getComptes(options = {}) {
    try {
      const { actif = true } = options
      let query = supabase.from('comptes_bancaires').select('*')

      if (actif) {
        query = query.eq('actif', true)
      }

      query = query.order('nom', { ascending: true })

      const { data, error } = await query

      if (error) throw error
      return { data: data || [], error: null }
    } catch (error) {
      logger.error('TRESORERIE_REPOSITORY', 'Erreur getComptes', error)
      return { data: null, error }
    }
  }

  /**
   * Obtenir les flux d'un compte
   */
  async getFluxByCompte(compteId, options = {}) {
    try {
      const { dateDebut, dateFin, typeFlux, statut } = options

      let query = supabase.from(this.tableName).select('*').eq('compte_bancaire_id', compteId)

      if (dateDebut) {
        query = query.gte('date_operation', dateDebut)
      }
      if (dateFin) {
        query = query.lte('date_operation', dateFin)
      }
      if (typeFlux) {
        query = query.eq('type_flux', typeFlux)
      }
      if (statut) {
        query = query.eq('statut', statut)
      }

      query = query.order('date_operation', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      return { data: data || [], error: null }
    } catch (error) {
      logger.error('TRESORERIE_REPOSITORY', `Erreur getFluxByCompte ${compteId}`, error)
      return { data: null, error }
    }
  }

  /**
   * Obtenir le solde prévisionnel (avec prévisions)
   */
  async getSoldePrevisionnel(compteId, dateFin) {
    try {
      // Solde actuel
      const { data: compte, error: compteError } = await this.getSoldeCompte(compteId)
      if (compteError) throw compteError

      const soldeActuel = compte.solde_actuel || 0

      // Prévisions jusqu'à dateFin
      const { data: previsions, error: prevError } = await supabase
        .from('previsions_tresorerie')
        .select('*')
        .eq('compte_bancaire_id', compteId)
        .eq('statut', 'PREVU')
        .lte('date_prevue', dateFin)

      if (prevError) throw prevError

      // Calculer impact prévisions
      let impactPrevu = 0
      ;(previsions || []).forEach((prev) => {
        if (prev.type_flux === 'ENCAISSEMENT') {
          impactPrevu += parseFloat(prev.montant) || 0
        } else {
          impactPrevu -= parseFloat(prev.montant) || 0
        }
      })

      return {
        data: {
          solde_actuel: soldeActuel,
          impact_prevu: impactPrevu,
          solde_previsionnel: soldeActuel + impactPrevu,
        },
        error: null,
      }
    } catch (error) {
      logger.error('TRESORERIE_REPOSITORY', `Erreur getSoldePrevisionnel ${compteId}`, error)
      return { data: null, error }
    }
  }
}

export const tresorerieRepository = new TresorerieRepository()
export default tresorerieRepository

