import { supabase } from '@/lib/supabase'
import { globalMetricsService } from './global-metrics.service'

export const analyticsService = {
  /**
   * Obtenir les KPIs globaux depuis données réelles interconnectées
   * Délègue au service globalMetricsService qui calcule depuis toutes les relations
   */
  async getGlobalKPIs() {
    try {
      // Utiliser le service centralisé qui calcule depuis données réelles
      const kpis = await globalMetricsService.getGlobalKPIs()
      return {
        programmesActifs: kpis.programmesActifs || 0,
        programmesTotal: kpis.programmesTotal || 0,
        projetsEnCours: kpis.projetsEnCours || 0,
        projetsTotal: kpis.projetsTotal || 0,
        budgetTotal: kpis.budgetTotal || 0,
        budgetConsomme: kpis.budgetConsomme || 0,
        candidatsTotal: kpis.candidatsTotal || 0,
        beneficiairesTotal: kpis.beneficiairesTotal || 0,
        tauxConversion: kpis.tauxConversion || 0,
        error: kpis.error || null,
      }
    } catch (error) {
      console.error('Error getting global KPIs:', error)
      return {
        programmesActifs: 0,
        programmesTotal: 0,
        projetsEnCours: 0,
        projetsTotal: 0,
        budgetTotal: 0,
        budgetConsomme: 0,
        candidatsTotal: 0,
        beneficiairesTotal: 0,
        tauxConversion: 0,
        error,
      }
    }
  },

  /**
   * Obtenir les statistiques d'un module depuis données réelles interconnectées
   * Délègue au service globalMetricsService qui calcule depuis toutes les relations
   */
  async getModuleStats(module) {
    try {
      // Mapper les noms de modules vers ceux utilisés par globalMetricsService
      const moduleMap = {
        'programmes-projets': 'programmes',
        'candidatures': 'candidatures',
        'beneficiaires': 'beneficiaires',
        'intervenants': 'intervenants',
        'reporting': 'reporting',
        'rh': 'rh',
        'partenaires': 'partenaires',
        'tresorerie': 'tresorerie',
        'gestion-temps': 'gestion-temps',
      }

      const moduleName = moduleMap[module] || module

      // Utiliser le service centralisé
      const stats = await globalMetricsService.getModuleKPIs(moduleName)

      if (stats.error) {
        // Fallback vers méthodes locales si erreur
        return await this.getModuleStatsFallback(module)
      }

      // Adapter le format de retour selon le module
      switch (module) {
        case 'programmes-projets':
          return {
            totalProgrammes: stats.total || 0,
            programmesActifs: stats.actifs || 0,
            totalProjets: stats.total || 0,
            projetsEnCours: stats.actifs || 0,
            budgetTotal: stats.budgetTotal || 0,
            budgetConsomme: stats.budgetConsomme || 0,
            error: null,
          }
        case 'candidatures':
          return {
            appelsOuverts: stats.appelsOuverts || 0,
            candidatsTotal: stats.candidatsTotal || 0,
            candidatsEligibles: stats.candidatsEligibles || 0,
            tauxEligibilite: stats.tauxEligibilite || 0,
            error: null,
          }
        case 'beneficiaires':
          return {
            beneficiairesActifs: stats.actifs || 0,
            insertionsTotal: stats.inserts || 0,
            tauxInsertion: stats.tauxInsertion || 0,
            error: null,
          }
        case 'intervenants':
          return {
            mentors: stats.mentorsActifs || 0,
            formateurs: 0, // À calculer depuis données réelles si table existe
            coaches: 0, // À calculer depuis données réelles si table existe
            total: stats.mentorsTotal || 0,
            error: null,
          }
        case 'reporting':
          return {
            rapportsGeneres: stats.rapportsTotal || 0,
            rapportsEnAttente: stats.rapportsEnAttente || 0,
            tauxCompletion: stats.tauxCompletion || 0,
            error: null,
          }
        case 'administration':
          return {
            utilisateursActifs: stats.utilisateursActifs || 0,
            referentiels: stats.referentiels || 0,
            logsAudit: stats.logsAudit || 0,
            administrateurs: stats.administrateurs || 0,
            error: null,
          }
        default:
          return stats
      }
    } catch (error) {
      console.error(`Error getting stats for ${module}:`, error)
      return { error }
    }
  },

  /**
   * Fallback vers méthodes locales si globalMetricsService échoue
   */
  async getModuleStatsFallback(module) {
    switch (module) {
      case 'programmes-projets':
        return await this.getProgrammesProjetsStats()
      case 'candidatures':
        return await this.getCandidaturesStats()
      case 'beneficiaires':
        return await this.getBeneficiairesStats()
      case 'intervenants':
        return await this.getIntervenantsStats()
      case 'reporting':
        return await this.getReportingStats()
      default:
        return { error: 'Module inconnu' }
    }
  },

  async getProgrammesProjetsStats() {
    try {
      const { data: programmes, error } = await supabase
        .from('programmes')
        .select('id, budget, statut')

      if (error) throw error

      const { data: projets, error: projetsError } = await supabase
        .from('projets')
        .select('id, budget, statut')

      if (projetsError) throw projetsError

      // Calculer budget consommé depuis programme_depenses
      const { data: depenses, error: depensesError } = await supabase
        .from('programme_depenses')
        .select('montant')
        .eq('statut', 'VALIDE')

      const budgetConsomme = depenses?.reduce((sum, d) => sum + (parseFloat(d.montant) || 0), 0) || 0

      return {
        totalProgrammes: programmes?.length || 0,
        programmesActifs: programmes?.filter(p => ['ACTIF', 'EN_COURS', 'OUVERT'].includes(p.statut)).length || 0,
        totalProjets: projets?.length || 0,
        projetsEnCours: projets?.filter(p => p.statut === 'EN_COURS' || p.statut === 'PLANIFIE').length || 0,
        budgetTotal: projets?.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0) || 0,
        budgetConsomme,
        error: null,
      }
    } catch (error) {
      console.error('Error getting programmes-projets stats:', error)
      return { error }
    }
  },

  async getCandidaturesStats() {
    try {
      const { data: appels, error: appelsError } = await supabase
        .from('appels_candidatures')
        .select('id, statut')

      if (appelsError) throw appelsError

      const { data: candidats, error: candidatsError } = await supabase
        .from('candidats')
        .select('id, statut_eligibilite')

      if (candidatsError) throw candidatsError

      const appelsOuverts = appels?.filter(a => a.statut === 'OUVERT').length || 0
      const candidatsTotal = candidats?.length || 0
      const candidatsEligibles = candidats?.filter(c => c.statut_eligibilite === 'ÉLIGIBLE').length || 0
      const tauxEligibilite = candidatsTotal > 0
        ? Math.round((candidatsEligibles / candidatsTotal) * 100)
        : 0

      return {
        appelsOuverts,
        candidatsTotal,
        candidatsEligibles,
        tauxEligibilite,
        error: null,
      }
    } catch (error) {
      console.error('Error getting candidatures stats:', error)
      return { error }
    }
  },

  async getBeneficiairesStats() {
    try {
      const { data: beneficiaires, error } = await supabase
        .from('beneficiaires')
        .select('id, statut')

      if (error) throw error

      // Utiliser suivi_insertion pour les insertions
      const { data: suivis, error: suivisError } = await supabase
        .from('suivi_insertion')
        .select('id, situation')

      const insertionsTotal = suivis?.filter(s => 
        s.situation && ['EMPLOI', 'ENTREPRISE'].includes(s.situation.toUpperCase())
      ).length || 0

      const beneficiairesActifs = beneficiaires?.filter(b => 
        b.statut && ['INCUBATION', 'POST_INCUBATION', 'ACTIF'].includes(b.statut.toUpperCase())
      ).length || 0

      const tauxInsertion = beneficiaires?.length > 0
        ? Math.round((insertionsTotal / beneficiaires.length) * 100)
        : 0

      return {
        beneficiairesActifs,
        insertionsTotal,
        tauxInsertion,
        error: null,
      }
    } catch (error) {
      console.error('Error getting beneficiaires stats:', error)
      return { error }
    }
  },

  async getIntervenantsStats() {
    try {
      // Utiliser la table users avec les rôles
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, role')

      if (usersError) throw usersError

      // Compter par rôle
      const mentors = users?.filter(u => u.role === 'MENTOR').length || 0
      const formateurs = users?.filter(u => u.role === 'FORMATEUR').length || 0
      const coaches = users?.filter(u => u.role === 'COACH').length || 0

      // Aussi compter depuis la table mentors
      const { data: mentorsList, error: mentorsError } = await supabase
        .from('mentors')
        .select('id')

      const mentorsFromTable = mentorsList?.length || 0

      return {
        mentors: mentors || mentorsFromTable,
        formateurs,
        coaches,
        total: mentors + formateurs + coaches || mentorsFromTable,
        error: null,
      }
    } catch (error) {
      console.error('Error getting intervenants stats:', error)
      return { error }
    }
  },

  async getReportingStats() {
    // Placeholder - to be implemented based on reporting table structure
    return {
      rapportsGeneres: 0,
      rapportsEnAttente: 0,
      error: null,
    }
  },
}

