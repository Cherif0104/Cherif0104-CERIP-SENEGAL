import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'
import { projetsService } from './projets.service'
import { programmeDepensesService } from './programme-depenses.service'

/**
 * Service de métriques de programme - Calculs complets pour dashboard
 */
export const programmeMetricsService = {
  /**
   * Obtenir toutes les métriques complètes d'un programme
   */
  async getProgrammeMetrics(programmeId) {
    try {
      logger.debug('PROGRAMME_METRICS_SERVICE', 'Calcul métriques programme', { programmeId })

      // Récupérer le programme
      const { data: programme, error: progError } = await supabase
        .from('programmes')
        .select('*')
        .eq('id', programmeId)
        .single()

      if (progError) throw progError
      if (!programme) return { data: null, error: new Error('Programme non trouvé') }

      // Récupérer tous les projets du programme
      const { data: projets, error: projetsError } = await projetsService.getAll(programmeId)
      if (projetsError) throw projetsError

      const projetIds = projets?.map(p => p.id) || []

      // Calculer toutes les métriques en parallèle
      const [
        depensesStats,
        projetsMetrics,
        candidatsMetrics,
        beneficiairesMetrics,
        accompagnementsMetrics,
        interactionsMetrics,
        performanceMetrics,
        trendsData,
      ] = await Promise.all([
        this.getDepensesMetrics(programmeId),
        this.getProjetsMetrics(projetIds),
        this.getCandidatsMetrics(projetIds),
        this.getBeneficiairesMetrics(projetIds),
        this.getAccompagnementsMetrics(projetIds),
        this.getInteractionsMetrics(projetIds),
        this.getPerformanceMetrics(programmeId, projetIds),
        this.getTrendsData(programmeId, projetIds),
      ])

      // Construire l'objet de métriques complet
      const metrics = {
        // Informations de base
        programme: {
          id: programme.id,
          nom: programme.nom,
          type: programme.type,
          statut: programme.statut,
          date_debut: programme.date_debut,
          date_fin: programme.date_fin,
          budget_total: parseFloat(programme.budget || 0),
        },

        // KPIs financiers
        finances: {
          budget_total: parseFloat(programme.budget || 0),
          budget_consomme: depensesStats.budgetConsomme || depensesStats.depensesValidees || 0, // Utiliser budgetConsomme en priorité
          budget_restant: parseFloat(programme.budget || 0) - (depensesStats.budgetConsomme || depensesStats.depensesValidees || 0),
          taux_consommation: parseFloat(programme.budget || 0) > 0
            ? (((depensesStats.budgetConsomme || depensesStats.depensesValidees || 0) / parseFloat(programme.budget || 0)) * 100)
            : 0,
          depenses_total: depensesStats.totalDepense || depensesStats.totalDepenses || 0,
          depenses_validees: depensesStats.budgetConsomme || depensesStats.depensesValidees || 0,
          depenses_payees: depensesStats.depensesPayees || 0,
          depenses_en_attente: depensesStats.depensesEnAttente || 0,
          nombre_depenses: depensesStats.nombreDepenses || 0,
          cout_par_beneficiaire: beneficiairesMetrics.total > 0
            ? ((depensesStats.budgetConsomme || depensesStats.depensesValidees || 0) / beneficiairesMetrics.total)
            : 0,
          ...depensesStats,
        },

        // KPIs projets
        projets: {
          total: projetsMetrics.total || 0,
          en_cours: projetsMetrics.enCours || 0,
          termines: projetsMetrics.termines || 0,
          planifies: projetsMetrics.planifies || 0,
          taux_completion: projetsMetrics.total > 0
            ? ((projetsMetrics.termines || 0) / projetsMetrics.total) * 100
            : 0,
          en_retard: projetsMetrics.enRetard || 0,
          ...projetsMetrics,
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

        // KPIs accompagnements
        accompagnements: {
          total: accompagnementsMetrics.total || 0,
          en_cours: accompagnementsMetrics.enCours || 0,
          termines: accompagnementsMetrics.termines || 0,
          heures_total: accompagnementsMetrics.heuresTotal || 0,
          heures_moyennes: accompagnementsMetrics.total > 0
            ? (accompagnementsMetrics.heuresTotal || 0) / accompagnementsMetrics.total
            : 0,
          ...accompagnementsMetrics,
        },

        // KPIs interactions
        interactions: {
          total: interactionsMetrics.total || 0,
          formations: interactionsMetrics.formations || 0,
          reunions: interactionsMetrics.reunions || 0,
          entretiens: interactionsMetrics.entretiens || 0,
          ...interactionsMetrics,
        },

        // KPIs performance
        performance: {
          score_global: performanceMetrics.scoreGlobal || 0,
          taux_objectifs: performanceMetrics.tauxObjectifs || 0,
          indicateurs_reussis: performanceMetrics.indicateursReussis || 0,
          indicateurs_total: performanceMetrics.indicateursTotal || 0,
          ...performanceMetrics,
        },

        // Données pour graphiques et tendances
        trends: trendsData,
      }

      logger.debug('PROGRAMME_METRICS_SERVICE', 'Métriques calculées', { programmeId, metrics })
      return { data: metrics, error: null }
    } catch (error) {
      logger.error('PROGRAMME_METRICS_SERVICE', 'Erreur calcul métriques', error)
      return { data: null, error }
    }
  },

  /**
   * Métriques de dépenses
   */
  async getDepensesMetrics(programmeId) {
    try {
      // Utiliser le mode 'reporting' pour inclure VALIDÉ, APPROUVÉ et PAYÉ
      const stats = await programmeDepensesService.getStats(programmeId, 'reporting')
      if (stats.error) throw stats.error

      // Récupérer les dépenses par mois pour le graphique
      const { data: depenses } = await supabase
        .from('programme_depenses')
        .select('montant, date_depense, statut')
        .eq('programme_id', programmeId)
        .order('date_depense', { ascending: true })

      // Normaliser le parsing des montants
      const parseMontant = (montant) => {
        if (!montant) return 0
        const cleaned = String(montant).replace(/\s/g, '').replace(/,/g, '.')
        const parsed = parseFloat(cleaned)
        return isNaN(parsed) ? 0 : parsed
      }

      // Statuts de consommation (reporting)
      const statusesConsommation = [
        'PAYE', 'PAYÉ', 'PAID', 'paye', 'payé', 'paid',
        'VALIDE', 'VALIDÉ', 'VALIDATED', 'valide', 'validé', 'validated',
        'APPROUVE', 'APPROUVÉ', 'APPROVED', 'approuve', 'approuvé', 'approved'
      ]
      
      const normalizeStatut = (statut) => {
        if (!statut) return ''
        return String(statut).toUpperCase().trim()
      }

      // Grouper par mois
      const depensesParMois = {}
      depenses?.forEach(depense => {
        if (depense.date_depense) {
          const date = new Date(depense.date_depense)
          const mois = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          if (!depensesParMois[mois]) {
            depensesParMois[mois] = { validees: 0, total: 0 }
          }
          const montant = parseMontant(depense.montant)
          depensesParMois[mois].total += montant
          
          // Vérifier si le statut est dans la liste de consommation
          const statutNormalise = normalizeStatut(depense.statut)
          const isConsommation = statusesConsommation.some(s => normalizeStatut(s) === statutNormalise)
          
          if (isConsommation) {
            depensesParMois[mois].validees += montant
          }
        }
      })

      return {
        ...stats.data,
        depensesParMois: Object.entries(depensesParMois).map(([mois, values]) => ({
          mois,
          validees: values.validees,
          total: values.total,
        })),
      }
    } catch (error) {
      logger.error('PROGRAMME_METRICS_SERVICE', 'Erreur métriques dépenses', error)
      return {}
    }
  },

  /**
   * Métriques de projets
   */
  async getProjetsMetrics(projetIds) {
    try {
      if (!projetIds || projetIds.length === 0) {
        return { total: 0, enCours: 0, termines: 0, planifies: 0, enRetard: 0 }
      }

      const { data: projets, error } = await supabase
        .from('projets')
        .select('id, statut, date_fin')
        .in('id', projetIds)

      if (error) throw error

      const total = projets?.length || 0
      const enCours = projets?.filter(p => p.statut === 'EN_COURS').length || 0
      const termines = projets?.filter(p => p.statut === 'TERMINE').length || 0
      const planifies = projets?.filter(p => p.statut === 'PLANIFIE').length || 0
      
      const maintenant = new Date()
      const enRetard = projets?.filter(p => {
        if (!p.date_fin || p.statut === 'TERMINE') return false
        return new Date(p.date_fin) < maintenant
      }).length || 0

      // Répartition par statut pour graphique
      const repartitionParStatut = projets?.reduce((acc, p) => {
        acc[p.statut] = (acc[p.statut] || 0) + 1
        return acc
      }, {}) || {}

      return {
        total,
        enCours,
        termines,
        planifies,
        enRetard,
        repartitionParStatut: Object.entries(repartitionParStatut).map(([statut, count]) => ({
          statut,
          count,
        })),
      }
    } catch (error) {
      logger.error('PROGRAMME_METRICS_SERVICE', 'Erreur métriques projets', error)
      return { total: 0, enCours: 0, termines: 0, planifies: 0, enRetard: 0 }
    }
  },

  /**
   * Métriques de candidats
   */
  async getCandidatsMetrics(projetIds) {
    try {
      if (!projetIds || projetIds.length === 0) {
        return { total: 0, eligibles: 0, nonEligibles: 0, enAttente: 0 }
      }

      // Récupérer les appels des projets
      const { data: appels, error: appelsError } = await supabase
        .from('appels_candidatures')
        .select('id')
        .in('projet_id', projetIds)

      if (appelsError) throw appelsError

      const appelIds = appels?.map(a => a.id) || []
      if (appelIds.length === 0) {
        return { total: 0, eligibles: 0, nonEligibles: 0, enAttente: 0 }
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

      return { total, eligibles, nonEligibles, enAttente }
    } catch (error) {
      logger.error('PROGRAMME_METRICS_SERVICE', 'Erreur métriques candidats', error)
      return { total: 0, eligibles: 0, nonEligibles: 0, enAttente: 0 }
    }
  },

  /**
   * Métriques de bénéficiaires
   */
  async getBeneficiairesMetrics(projetIds) {
    try {
      if (!projetIds || projetIds.length === 0) {
        return { total: 0, actifs: 0, accompagnes: 0, inserts: 0 }
      }

      const { data: beneficiaires, error } = await supabase
        .from('beneficiaires')
        .select('id, statut')
        .in('projet_id', projetIds)

      if (error) throw error

      const total = beneficiaires?.length || 0
      const actifs = beneficiaires?.filter(b => b.statut && !['TERMINE', 'ABANDON'].includes(b.statut)).length || 0
      
      // Vérifier s'il y a des accompagnements (via table accompagnements)
      const { data: accompagnements } = await supabase
        .from('accompagnements')
        .select('beneficiaire_id')
        .in('beneficiaire_id', beneficiaires?.map(b => b.id) || [])

      const accompagnes = new Set(accompagnements?.map(a => a.beneficiaire_id) || []).size

      // Vérifier les insertions (via table insertions)
      const { data: insertions } = await supabase
        .from('insertions')
        .select('beneficiaire_id')
        .in('beneficiaire_id', beneficiaires?.map(b => b.id) || [])

      const inserts = insertions?.length || 0

      return { total, actifs, accompagnes, inserts }
    } catch (error) {
      logger.error('PROGRAMME_METRICS_SERVICE', 'Erreur métriques bénéficiaires', error)
      return { total: 0, actifs: 0, accompagnes: 0, inserts: 0 }
    }
  },

  /**
   * Métriques d'accompagnements
   */
  async getAccompagnementsMetrics(projetIds) {
    try {
      if (!projetIds || projetIds.length === 0) {
        return { total: 0, enCours: 0, termines: 0, heuresTotal: 0 }
      }

      // Récupérer les bénéficiaires des projets
      const { data: beneficiaires } = await supabase
        .from('beneficiaires')
        .select('id')
        .in('projet_id', projetIds)

      const beneficiaireIds = beneficiaires?.map(b => b.id) || []
      if (beneficiaireIds.length === 0) {
        return { total: 0, enCours: 0, termines: 0, heuresTotal: 0 }
      }

      const { data: accompagnements, error } = await supabase
        .from('accompagnements')
        .select('id, statut, duree_heures')
        .in('beneficiaire_id', beneficiaireIds)

      if (error) throw error

      const total = accompagnements?.length || 0
      const enCours = accompagnements?.filter(a => a.statut === 'EN_COURS').length || 0
      const termines = accompagnements?.filter(a => a.statut === 'TERMINE').length || 0
      const heuresTotal = accompagnements?.reduce((sum, a) => sum + (parseFloat(a.duree_heures || 0)), 0) || 0

      return { total, enCours, termines, heuresTotal }
    } catch (error) {
      logger.error('PROGRAMME_METRICS_SERVICE', 'Erreur métriques accompagnements', error)
      return { total: 0, enCours: 0, termines: 0, heuresTotal: 0 }
    }
  },

  /**
   * Métriques d'interactions
   */
  async getInteractionsMetrics(projetIds) {
    try {
      if (!projetIds || projetIds.length === 0) {
        return { total: 0, formations: 0, reunions: 0, entretiens: 0 }
      }

      // Compter les formations
      const { count: formationsCount } = await supabase
        .from('formations')
        .select('*', { count: 'exact', head: true })
        .in('projet_id', projetIds)

      // Compter les réunions (via table interactions ou reunions si elle existe)
      // Pour l'instant, on simule ou on utilise une table si elle existe
      const reunions = 0 // À adapter selon votre structure

      // Compter les entretiens (via table entretiens si elle existe)
      const entretiens = 0 // À adapter selon votre structure

      const total = (formationsCount || 0) + reunions + entretiens

      return { total, formations: formationsCount || 0, reunions, entretiens }
    } catch (error) {
      logger.error('PROGRAMME_METRICS_SERVICE', 'Erreur métriques interactions', error)
      return { total: 0, formations: 0, reunions: 0, entretiens: 0 }
    }
  },

  /**
   * Métriques de performance
   */
  async getPerformanceMetrics(programmeId, projetIds) {
    try {
      // Récupérer les indicateurs du programme
      const { data: indicateurs } = await supabase
        .from('programme_indicateurs')
        .select('*')
        .eq('programme_id', programmeId)

      const indicateursTotal = indicateurs?.length || 0
      const indicateursReussis = indicateurs?.filter(i => {
        if (!i.valeur_actuelle || !i.valeur_cible) return false
        return parseFloat(i.valeur_actuelle) >= parseFloat(i.valeur_cible)
      }).length || 0

      const tauxObjectifs = indicateursTotal > 0
        ? (indicateursReussis / indicateursTotal) * 100
        : 0

      // Calculer un score global (moyenne pondérée)
      const scoreGlobal = tauxObjectifs // Simplifié pour l'instant

      return {
        scoreGlobal: Math.round(scoreGlobal),
        tauxObjectifs: Math.round(tauxObjectifs * 100) / 100,
        indicateursReussis,
        indicateursTotal,
      }
    } catch (error) {
      logger.error('PROGRAMME_METRICS_SERVICE', 'Erreur métriques performance', error)
      return { scoreGlobal: 0, tauxObjectifs: 0, indicateursReussis: 0, indicateursTotal: 0 }
    }
  },

  /**
   * Données pour graphiques de tendances
   */
  async getTrendsData(programmeId, projetIds) {
    try {
      // Tendance des projets par mois
      const { data: projets } = await supabase
        .from('projets')
        .select('created_at, statut')
        .in('id', projetIds)
        .order('created_at', { ascending: true })

      const projetsParMois = {}
      projets?.forEach(projet => {
        if (projet.created_at) {
          const date = new Date(projet.created_at)
          const mois = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          projetsParMois[mois] = (projetsParMois[mois] || 0) + 1
        }
      })

      return {
        projetsParMois: Object.entries(projetsParMois).map(([mois, count]) => ({
          mois,
          count,
        })),
      }
    } catch (error) {
      logger.error('PROGRAMME_METRICS_SERVICE', 'Erreur tendances', error)
      return { projetsParMois: [] }
    }
  },
}

