import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'

/**
 * Service Reporting - Génération de rapports et exports
 */
export const reportingService = {
  /**
   * Générer un rapport de programmes
   */
  async getRapportProgrammes(filters = {}) {
    try {
      let query = supabase
        .from('programmes')
        .select('*, projets(count)')

      if (filters.dateDebut) {
        query = query.gte('date_debut', filters.dateDebut)
      }

      if (filters.dateFin) {
        query = query.lte('date_fin', filters.dateFin)
      }

      if (filters.statut) {
        query = query.eq('statut', filters.statut)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      // Enrichir avec statistiques
      const enrichedData = await Promise.all(
        (data || []).map(async (programme) => {
          // Compter les bénéficiaires
          const { count: beneficiairesCount } = await supabase
            .from('beneficiaires')
            .select('*', { count: 'exact', head: true })
            .in('projet_id', programme.projets?.map((p) => p.id) || [])

          return {
            ...programme,
            nombre_projets: programme.projets?.length || 0,
            nombre_beneficiaires: beneficiairesCount || 0,
          }
        })
      )

      return { data: enrichedData, error: null }
    } catch (error) {
      logger.error('REPORTING_SERVICE', 'Erreur getRapportProgrammes', error)
      return { data: null, error }
    }
  },

  /**
   * Générer un rapport de projets
   */
  async getRapportProjets(filters = {}) {
    try {
      let query = supabase
        .from('projets')
        .select('*, programme_id(nom, type), appels_candidatures(count), beneficiaires(count)')

      if (filters.programmeId) {
        query = query.eq('programme_id', filters.programmeId)
      }

      if (filters.dateDebut) {
        query = query.gte('date_debut', filters.dateDebut)
      }

      if (filters.dateFin) {
        query = query.lte('date_fin', filters.dateFin)
      }

      if (filters.statut) {
        query = query.eq('statut', filters.statut)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      logger.error('REPORTING_SERVICE', 'Erreur getRapportProjets', error)
      return { data: null, error }
    }
  },

  /**
   * Générer un rapport de candidatures
   */
  async getRapportCandidatures(filters = {}) {
    try {
      let query = supabase
        .from('candidats')
        .select('*, appel_id(nom, projet_id)')

      if (filters.appelId) {
        query = query.eq('appel_id', filters.appelId)
      }

      if (filters.statut) {
        query = query.eq('statut', filters.statut)
      }

      if (filters.dateDebut) {
        query = query.gte('date_candidature', filters.dateDebut)
      }

      if (filters.dateFin) {
        query = query.lte('date_candidature', filters.dateFin)
      }

      const { data, error } = await query.order('date_candidature', { ascending: false })

      if (error) throw error

      // Statistiques
      const stats = {
        total: data?.length || 0,
        eligibles: data?.filter((c) => c.eligible).length || 0,
        nonEligibles: data?.filter((c) => !c.eligible).length || 0,
        parStatut: {},
      }

      data?.forEach((candidat) => {
        const statut = candidat.statut || 'Non défini'
        stats.parStatut[statut] = (stats.parStatut[statut] || 0) + 1
      })

      return { data, stats, error: null }
    } catch (error) {
      logger.error('REPORTING_SERVICE', 'Erreur getRapportCandidatures', error)
      return { data: null, stats: null, error }
    }
  },

  /**
   * Générer un rapport de bénéficiaires
   */
  async getRapportBeneficiaires(filters = {}) {
    try {
      let query = supabase.from('beneficiaires').select('*')

      if (filters.projetId) {
        query = query.eq('projet_id', filters.projetId)
      }

      if (filters.statut) {
        query = query.eq('statut', filters.statut)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      // Enrichir avec insertions
      const enrichedData = await Promise.all(
        (data || []).map(async (benef) => {
          const { data: insertions } = await supabase
            .from('suivi_insertion')
            .select('*')
            .eq('beneficiaire_projet_id', benef.id)
            .order('date_suivi', { ascending: false })
            .limit(1)

          return {
            ...benef,
            derniere_insertion: insertions?.[0] || null,
          }
        })
      )

      // Statistiques
      const stats = {
        total: enrichedData.length,
        parStatut: {},
        avecInsertion: enrichedData.filter((b) => b.derniere_insertion).length,
      }

      enrichedData.forEach((benef) => {
        const statut = benef.statut || 'Non défini'
        stats.parStatut[statut] = (stats.parStatut[statut] || 0) + 1
      })

      return { data: enrichedData, stats, error: null }
    } catch (error) {
      logger.error('REPORTING_SERVICE', 'Erreur getRapportBeneficiaires', error)
      return { data: null, stats: null, error }
    }
  },

  /**
   * Générer un rapport financier
   */
  async getRapportFinancier(filters = {}) {
    try {
      // Récupérer les comptes
      const { data: comptes, error: comptesError } = await supabase
        .from('comptes')
        .select('*')

      if (comptesError) throw comptesError

      // Récupérer les flux
      let fluxQuery = supabase.from('flux_tresorerie').select('*')

      if (filters.dateDebut) {
        fluxQuery = fluxQuery.gte('date', filters.dateDebut)
      }

      if (filters.dateFin) {
        fluxQuery = fluxQuery.lte('date', filters.dateFin)
      }

      if (filters.compteId) {
        fluxQuery = fluxQuery.eq('compte_id', filters.compteId)
      }

      const { data: flux, error: fluxError } = await fluxQuery.order('date', { ascending: false })

      if (fluxError) throw fluxError

      // Calculer les totaux
      const totals = {
        recettes: flux?.filter((f) => f.type === 'RECETTE').reduce((sum, f) => sum + parseFloat(f.montant || 0), 0) || 0,
        depenses: flux?.filter((f) => f.type === 'DEPENSE').reduce((sum, f) => sum + parseFloat(f.montant || 0), 0) || 0,
        solde: 0,
      }

      totals.solde = totals.recettes - totals.depenses

      return {
        data: {
          comptes: comptes || [],
          flux: flux || [],
          totals,
        },
        error: null,
      }
    } catch (error) {
      logger.error('REPORTING_SERVICE', 'Erreur getRapportFinancier', error)
      return { data: null, error }
    }
  },
}

