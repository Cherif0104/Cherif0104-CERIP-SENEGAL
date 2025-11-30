import { tresorerieRepository } from '@/data/repositories/TresorerieRepository'
import { logger } from '@/utils/logger'
import { supabase } from '@/lib/supabase'

/**
 * Service pour la gestion de la trésorerie
 */
export const tresorerieService = {
  /**
   * Obtenir tous les comptes bancaires
   */
  async getComptes(options = {}) {
    logger.debug('TRESORERIE_SERVICE', 'getComptes appelé', options)
    return tresorerieRepository.getComptes(options)
  },

  /**
   * Obtenir le solde d'un compte
   */
  async getSoldeCompte(compteId) {
    logger.debug('TRESORERIE_SERVICE', `getSoldeCompte appelé pour ${compteId}`)
    return tresorerieRepository.getSoldeCompte(compteId)
  },

  /**
   * Obtenir les flux d'un compte
   */
  async getFluxByCompte(compteId, options = {}) {
    logger.debug('TRESORERIE_SERVICE', `getFluxByCompte appelé pour ${compteId}`, options)
    return tresorerieRepository.getFluxByCompte(compteId, options)
  },

  /**
   * Créer un nouveau flux (encaissement/décaissement)
   */
  async createFlux(fluxData) {
    logger.debug('TRESORERIE_SERVICE', 'createFlux appelé', fluxData)

    // Récupérer l'utilisateur actuel
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const fluxToInsert = {
      ...fluxData,
      created_by: user?.id || null,
    }

    const { data, error } = await tresorerieRepository.create(fluxToInsert)

    if (error) {
      logger.error('TRESORERIE_SERVICE', 'Erreur création flux', error)
      return { data: null, error }
    }

    logger.info('TRESORERIE_SERVICE', 'Flux créé avec succès', { id: data.id })
    return { data, error: null }
  },

  /**
   * Obtenir le solde prévisionnel
   */
  async getSoldePrevisionnel(compteId, dateFin) {
    logger.debug('TRESORERIE_SERVICE', `getSoldePrevisionnel appelé pour ${compteId}`, { dateFin })
    return tresorerieRepository.getSoldePrevisionnel(compteId, dateFin)
  },

  /**
   * Créer une prévision de trésorerie
   */
  async createPrevision(previsionData) {
    logger.debug('TRESORERIE_SERVICE', 'createPrevision appelé', previsionData)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const previsionToInsert = {
      ...previsionData,
      created_by: user?.id || null,
    }

    const { data, error } = await supabase
      .from('previsions_tresorerie')
      .insert([previsionToInsert])
      .select()
      .single()

    if (error) {
      logger.error('TRESORERIE_SERVICE', 'Erreur création prévision', error)
      return { data: null, error }
    }

    logger.info('TRESORERIE_SERVICE', 'Prévision créée avec succès', { id: data.id })
    return { data, error: null }
  },

  /**
   * Obtenir le tableau de bord trésorerie
   */
  async getDashboard(compteId = null) {
    logger.debug('TRESORERIE_SERVICE', 'getDashboard appelé', { compteId })

    try {
      // Obtenir tous les comptes ou un compte spécifique
      const { data: comptes, error: comptesError } = await this.getComptes({ actif: true })
      if (comptesError) throw comptesError

      const comptesToProcess = compteId ? comptes.filter((c) => c.id === compteId) : comptes

      // Calculer les totaux
      let totalEncaissements = 0
      let totalDecaissements = 0
      let totalSoldes = 0

      for (const compte of comptesToProcess) {
        const solde = parseFloat(compte.solde_actuel) || 0
        totalSoldes += solde

        // Flux du mois en cours
        const dateDebut = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          .toISOString()
          .split('T')[0]
        const dateFin = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
          .toISOString()
          .split('T')[0]

        const { data: flux, error: fluxError } = await this.getFluxByCompte(compte.id, {
          dateDebut,
          dateFin,
          statut: 'REALISE',
        })

        if (!fluxError && flux) {
          flux.forEach((f) => {
            const montant = parseFloat(f.montant) || 0
            if (f.type_flux === 'ENCAISSEMENT') {
              totalEncaissements += montant
            } else {
              totalDecaissements += montant
            }
          })
        }
      }

      return {
        data: {
          comptes: comptesToProcess,
          total_soldes: totalSoldes,
          total_encaissements_mois: totalEncaissements,
          total_decaissements_mois: totalDecaissements,
          solde_net_mois: totalEncaissements - totalDecaissements,
        },
        error: null,
      }
    } catch (error) {
      logger.error('TRESORERIE_SERVICE', 'Erreur getDashboard', error)
      return { data: null, error }
    }
  },
}

