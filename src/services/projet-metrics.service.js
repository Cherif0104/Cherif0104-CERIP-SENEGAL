import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'
import { projetsService } from './projets.service'
import { projetDepensesService } from './projet-depenses.service'

/**
 * Service de métriques de projet - Calculs complets pour dashboard projet
 */

/**
 * Métriques de dépenses
 */
async function getDepensesMetrics(projetId) {
  try {
    const stats = await projetDepensesService.getStats(projetId, 'reporting')
    if (stats.error) throw stats.error
    return stats.data || {}
  } catch (error) {
    logger.error('PROJET_METRICS_SERVICE', 'Erreur métriques dépenses', error)
    return {}
  }
}

/**
 * Métriques de bénéficiaires
 */
async function getBeneficiairesMetrics(projetId) {
  try {
    const { data: beneficiaires, error } = await supabase
      .from('beneficiaires')
      .select('id, statut_global')
      .eq('projet_id', projetId)

    if (error) throw error

    const total = beneficiaires?.length || 0
    const actifs = beneficiaires?.filter(b => 
      b.statut_global && !['TERMINE', 'ABANDON', 'ABANDONNE'].includes(b.statut_global.toUpperCase())
    ).length || 0

    // Récupérer les accompagnements
    const beneficiaireIds = beneficiaires?.map(b => b.id) || []
    const { data: accompagnements } = await supabase
      .from('accompagnements')
      .select('beneficiaire_id, statut')
      .in('beneficiaire_id', beneficiaireIds)

    const accompagnes = new Set(accompagnements?.map(a => a.beneficiaire_id) || []).size

    // Récupérer les insertions
    const { data: insertions } = await supabase
      .from('insertions')
      .select('beneficiaire_id')
      .in('beneficiaire_id', beneficiaireIds)

    const inserts = insertions?.length || 0

    // Répartition par statut
    const repartitionParStatut = beneficiaires?.reduce((acc, b) => {
      const statut = b.statut_global || 'AUTRE'
      acc[statut] = (acc[statut] || 0) + 1
      return acc
    }, {}) || {}

    return {
      total,
      actifs,
      accompagnes,
      inserts,
      repartitionParStatut: Object.entries(repartitionParStatut).map(([statut, count]) => ({
        statut,
        count,
      })),
    }
  } catch (error) {
    logger.error('PROJET_METRICS_SERVICE', 'Erreur métriques bénéficiaires', error)
    return { total: 0, actifs: 0, accompagnes: 0, inserts: 0 }
  }
}

/**
 * Métriques de candidats
 */
async function getCandidatsMetrics(projetId) {
  try {
    // Récupérer les appels du projet
    const { data: appels, error: appelsError } = await supabase
      .from('appels_candidatures')
      .select('id, statut, date_ouverture, date_fermeture')
      .eq('projet_id', projetId)

    if (appelsError) throw appelsError

    const appelsTotal = appels?.length || 0
    const maintenant = new Date()
    const appelsOuverts = appels?.filter(a => {
      if (!a.date_ouverture || !a.date_fermeture) return false
      const ouverture = new Date(a.date_ouverture)
      const fermeture = new Date(a.date_fermeture)
      return maintenant >= ouverture && maintenant <= fermeture
    }).length || 0
    const appelsFermes = appelsTotal - appelsOuverts

    const appelIds = appels?.map(a => a.id) || []
    if (appelIds.length === 0) {
      return { 
        total: 0, 
        eligibles: 0, 
        nonEligibles: 0, 
        enAttente: 0,
        appelsTotal: 0,
        appelsOuverts: 0,
        appelsFermes: 0,
      }
    }

    // Récupérer les candidats
    const { data: candidats, error } = await supabase
      .from('candidats')
      .select('id, statut_eligibilite')
      .in('appel_id', appelIds)

    if (error) throw error

    const total = candidats?.length || 0
    const eligibles = candidats?.filter(c => c.statut_eligibilite === 'ELIGIBLE').length || 0
    const nonEligibles = candidats?.filter(c => c.statut_eligibilite === 'NON_ELIGIBLE').length || 0
    const enAttente = candidats?.filter(c => !c.statut_eligibilite || c.statut_eligibilite === 'EN_ATTENTE').length || 0

    return { 
      total, 
      eligibles, 
      nonEligibles, 
      enAttente,
      appelsTotal,
      appelsOuverts,
      appelsFermes,
    }
  } catch (error) {
    logger.error('PROJET_METRICS_SERVICE', 'Erreur métriques candidats', error)
    return { total: 0, eligibles: 0, nonEligibles: 0, enAttente: 0, appelsTotal: 0, appelsOuverts: 0, appelsFermes: 0 }
  }
}

/**
 * Métriques de jalons
 */
async function getJalonsMetrics(projetId) {
  try {
    // Récupérer le projet pour obtenir programme_id
    const { data: projet, error: projetError } = await projetsService.getById(projetId)
    if (projetError || !projet?.programme_id) {
      return { total: 0, termines: 0, enCours: 0, enRetard: 0 }
    }

    // Récupérer les jalons du programme (les jalons projet sont liés au programme)
    const { data: jalons, error } = await supabase
      .from('programme_jalons')
      .select('id, libelle, statut, date_prevue, date_reelle')
      .eq('programme_id', projet.programme_id)

    if (error) throw error

    const total = jalons?.length || 0
    const termines = jalons?.filter(j => 
      j.statut === 'TERMINE' || j.statut === 'VALIDE'
    ).length || 0
    const enCours = jalons?.filter(j => 
      j.statut === 'EN_COURS' || j.statut === 'EN_ATTENTE'
    ).length || 0

    const maintenant = new Date()
    const enRetard = jalons?.filter(j => {
      if (j.statut === 'TERMINE' || j.statut === 'VALIDE') return false
      if (!j.date_prevue) return false
      return new Date(j.date_prevue) < maintenant
    }).length || 0

    // Répartition par statut
    const repartitionParStatut = jalons?.reduce((acc, j) => {
      const statut = j.statut || 'AUTRE'
      acc[statut] = (acc[statut] || 0) + 1
      return acc
    }, {}) || {}

    const taux_avancement = total > 0 ? (termines / total) * 100 : 0

    return {
      total,
      termines,
      enCours,
      enRetard,
      taux_avancement,
      repartitionParStatut: Object.entries(repartitionParStatut).map(([statut, count]) => ({
        statut,
        count,
      })),
    }
  } catch (error) {
    logger.error('PROJET_METRICS_SERVICE', 'Erreur métriques jalons', error)
    return { total: 0, termines: 0, enCours: 0, enRetard: 0 }
  }
}

/**
 * Métriques d'activités
 */
async function getActivitesMetrics(projetId) {
  try {
    const { data: activites, error } = await supabase
      .from('projet_activites')
      .select('id, statut, duree_heures, beneficiaires_ids')
      .eq('projet_id', projetId)

    if (error) throw error

    const total = activites?.length || 0
    const terminees = activites?.filter(a => a.statut === 'TERMINE').length || 0
    const planifiees = activites?.filter(a => a.statut === 'PLANIFIE').length || 0

    const heuresTotal = activites?.reduce((sum, a) => {
      return sum + parseFloat(a.duree_heures || 0)
    }, 0) || 0

    // Calculer participants moyens
    const activitesAvecParticipants = activites?.filter(a => 
      a.beneficiaires_ids && a.beneficiaires_ids.length > 0
    ) || []
    const participantsMoyens = activitesAvecParticipants.length > 0
      ? activitesAvecParticipants.reduce((sum, a) => sum + (a.beneficiaires_ids?.length || 0), 0) / activitesAvecParticipants.length
      : 0

    return {
      total,
      terminees,
      planifiees,
      heuresTotal,
      participantsMoyens: Math.round(participantsMoyens * 10) / 10,
    }
  } catch (error) {
    logger.error('PROJET_METRICS_SERVICE', 'Erreur métriques activités', error)
    return { total: 0, terminees: 0, planifiees: 0, heuresTotal: 0, participantsMoyens: 0 }
  }
}

export const projetMetricsService = {
  /**
   * Obtenir toutes les métriques complètes d'un projet
   */
  async getProjetMetrics(projetId) {
    try {
      logger.debug('PROJET_METRICS_SERVICE', 'Calcul métriques projet', { projetId })

      // Récupérer le projet
      const { data: projet, error: progError } = await projetsService.getById(projetId)
      if (progError) throw progError
      if (!projet) return { data: null, error: new Error('Projet non trouvé') }

      // Calculer toutes les métriques en parallèle
      const [
        depensesStats,
        beneficiairesMetrics,
        candidatsMetrics,
        jalonsMetrics,
        activitesMetrics,
      ] = await Promise.all([
        getDepensesMetrics(projetId),
        getBeneficiairesMetrics(projetId),
        getCandidatsMetrics(projetId),
        getJalonsMetrics(projetId),
        getActivitesMetrics(projetId),
      ])

      // Construire l'objet de métriques complet
      const metrics = {
        // Informations de base
        projet: {
          id: projet.id,
          nom: projet.nom,
          code: projet.code,
          type_activite: projet.type_activite,
          statut: projet.statut,
          date_debut: projet.date_debut,
          date_fin: projet.date_fin,
          budget_alloue: parseFloat(projet.budget_alloue || 0),
          programme_id: projet.programme_id,
        },

        // KPIs financiers
        finances: {
          budget_alloue: parseFloat(projet.budget_alloue || 0),
          budget_consomme: depensesStats.budgetConsomme || 0,
          budget_restant: parseFloat(projet.budget_alloue || 0) - (depensesStats.budgetConsomme || 0),
          taux_consommation: parseFloat(projet.budget_alloue || 0) > 0
            ? (((depensesStats.budgetConsomme || 0) / parseFloat(projet.budget_alloue || 0)) * 100)
            : 0,
          depenses_total: depensesStats.totalDepense || 0,
          depenses_validees: depensesStats.depensesValidees || 0,
          depenses_payees: depensesStats.depensesPayees || 0,
          depenses_en_attente: depensesStats.depensesEnAttente || 0,
          nombre_depenses: depensesStats.nombreDepenses || 0,
          ...depensesStats,
        },

        // KPIs bénéficiaires
        beneficiaires: {
          total: beneficiairesMetrics.total || 0,
          actifs: beneficiairesMetrics.actifs || 0,
          accompagnes: beneficiairesMetrics.accompagnes || 0,
          inserts: beneficiairesMetrics.inserts || 0,
          taux_insertion: beneficiairesMetrics.total > 0
            ? ((beneficiairesMetrics.inserts || 0) / beneficiairesMetrics.total) * 100
            : 0,
          taux_conversion: candidatsMetrics.total > 0
            ? ((beneficiairesMetrics.total || 0) / candidatsMetrics.total) * 100
            : 0,
          ...beneficiairesMetrics,
        },

        // KPIs candidats
        candidats: {
          total: candidatsMetrics.total || 0,
          eligibles: candidatsMetrics.eligibles || 0,
          non_eligibles: candidatsMetrics.nonEligibles || 0,
          en_attente: candidatsMetrics.enAttente || 0,
          taux_eligibilite: candidatsMetrics.total > 0
            ? ((candidatsMetrics.eligibles || 0) / candidatsMetrics.total) * 100
            : 0,
          ...candidatsMetrics,
        },

        // KPIs jalons
        jalons: {
          total: jalonsMetrics.total || 0,
          termines: jalonsMetrics.termines || 0,
          en_cours: jalonsMetrics.enCours || 0,
          en_retard: jalonsMetrics.enRetard || 0,
          taux_avancement: jalonsMetrics.total > 0
            ? ((jalonsMetrics.termines || 0) / jalonsMetrics.total) * 100
            : 0,
          ...jalonsMetrics,
        },

        // KPIs activités
        activites: {
          total: activitesMetrics.total || 0,
          terminees: activitesMetrics.terminees || 0,
          planifiees: activitesMetrics.planifiees || 0,
          heures_total: activitesMetrics.heuresTotal || 0,
          participants_moyens: activitesMetrics.participantsMoyens || 0,
          ...activitesMetrics,
        },

        // KPIs appels
        appels: {
          total: candidatsMetrics.appelsTotal || 0,
          ouverts: candidatsMetrics.appelsOuverts || 0,
          fermes: candidatsMetrics.appelsFermes || 0,
        },
      }

      logger.debug('PROJET_METRICS_SERVICE', 'Métriques calculées', { projetId, metrics })
      return { data: metrics, error: null }
    } catch (error) {
      logger.error('PROJET_METRICS_SERVICE', 'Erreur calcul métriques', error)
      return { data: null, error }
    }
  },

  // Exposer les fonctions individuelles
  getDepensesMetrics,
  getBeneficiairesMetrics,
  getCandidatsMetrics,
  getJalonsMetrics,
  getActivitesMetrics,
}
