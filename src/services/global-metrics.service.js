import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'
import { programmeMetricsService } from './programme-metrics.service'
import { projetMetricsService } from './projet-metrics.service'

/**
 * Service centralisé pour calculer TOUS les KPIs
 * à partir de données réelles interconnectées entre tous les modules
 * 
 * PRINCIPE : Aucune valeur en dur, tous les KPIs sont calculés depuis
 * les relations réelles entre les tables de la base de données
 */
export const globalMetricsService = {
  /**
   * Calculer tous les KPIs du Dashboard Principal
   * À partir de données réelles de TOUS les modules interconnectés
   */
  async getGlobalKPIs() {
    try {
      logger.debug('GLOBAL_METRICS', 'Calcul KPIs globaux depuis données réelles interconnectées')

      // ============================================
      // 1. PROGRAMMES (données réelles)
      // ============================================
      const { data: programmes, error: progError } = await supabase
        .from('programmes')
        .select('id, budget, statut')

      if (progError) {
        logger.error('GLOBAL_METRICS', 'Erreur chargement programmes', progError)
        throw progError
      }

      const programmesActifs = programmes?.filter(p => 
        ['ACTIF', 'EN_COURS', 'OUVERT'].includes(p.statut)
      ).length || 0

      const budgetTotalProgrammes = programmes?.reduce((sum, p) => {
        const budget = parseFloat(String(p.budget || 0).replace(/\s/g, '').replace(/,/g, '.'))
        return sum + (isNaN(budget) ? 0 : budget)
      }, 0) || 0

      // ============================================
      // 2. PROJETS (données réelles liées aux programmes)
      // ============================================
      const { data: projets, error: projetsError } = await supabase
        .from('projets')
        .select('id, budget_alloue, statut, programme_id')

      if (projetsError) {
        logger.error('GLOBAL_METRICS', 'Erreur chargement projets', projetsError)
        throw projetsError
      }

      const projetsEnCours = projets?.filter(p => 
        ['EN_COURS', 'PLANIFIE'].includes(p.statut)
      ).length || 0

      const budgetTotalProjets = projets?.reduce((sum, p) => {
        const budget = parseFloat(String(p.budget_alloue || 0).replace(/\s/g, '').replace(/,/g, '.'))
        return sum + (isNaN(budget) ? 0 : budget)
      }, 0) || 0

      // ============================================
      // 3. DÉPENSES (données réelles depuis programme_depenses)
      // Relation : programme_depenses.programme_id → programmes.id
      // Relation : programme_depenses.projet_id → projets.id
      // ============================================
      const { data: depenses, error: depensesError } = await supabase
        .from('programme_depenses')
        .select('montant, statut, programme_id, projet_id')

      if (depensesError) {
        logger.warn('GLOBAL_METRICS', 'Erreur chargement dépenses', depensesError)
      }

      // Calculer budget consommé (statuts VALIDÉ, APPROUVÉ, PAYÉ)
      const statusesConsommation = [
        'PAYE', 'PAYÉ', 'PAID', 
        'VALIDE', 'VALIDÉ', 'VALIDATED', 
        'APPROUVE', 'APPROUVÉ', 'APPROVED'
      ]
      
      const normalizeStatut = (statut) => String(statut || '').toUpperCase().trim()
      
      const budgetConsomme = depenses?.reduce((sum, d) => {
        const statutNorm = normalizeStatut(d.statut)
        const isConsommation = statusesConsommation.some(s => 
          normalizeStatut(s) === statutNorm
        )
        if (isConsommation) {
          const montant = parseFloat(String(d.montant || 0).replace(/\s/g, '').replace(/,/g, '.'))
          return sum + (isNaN(montant) ? 0 : montant)
        }
        return sum
      }, 0) || 0

      // ============================================
      // 4. CANDIDATURES (données réelles)
      // Relation : candidats.appel_id → appels_candidatures.id
      // Relation : appels_candidatures.projet_id → projets.id
      // ============================================
      const { data: appels, error: appelsError } = await supabase
        .from('appels_candidatures')
        .select('id, projet_id')

      if (appelsError) {
        logger.warn('GLOBAL_METRICS', 'Erreur chargement appels', appelsError)
      }

      const appelIds = appels?.map(a => a.id) || []
      
      const { data: candidats, error: candidatsError } = await supabase
        .from('candidats')
        .select('id, statut_eligibilite, appel_id')
        .in('appel_id', appelIds.length > 0 ? appelIds : ['00000000-0000-0000-0000-000000000000'])

      if (candidatsError && appelIds.length > 0) {
        logger.warn('GLOBAL_METRICS', 'Erreur chargement candidats', candidatsError)
      }

      const candidatsTotal = candidats?.length || 0
      const candidatsEligibles = candidats?.filter(c => 
        c.statut_eligibilite === 'ELIGIBLE' || c.statut_eligibilite === 'ÉLIGIBLE'
      ).length || 0

      // ============================================
      // 5. BÉNÉFICIAIRES (données réelles)
      // Relation : beneficiaires.candidat_id → candidats.id
      // Relation : beneficiaires.projet_id → projets.id
      // ============================================
      const candidatIds = candidats?.map(c => c.id) || []
      
      const { data: beneficiaires, error: benefError } = await supabase
        .from('beneficiaires')
        .select('id, statut_global, candidat_id, projet_id')
        .in('candidat_id', candidatIds.length > 0 ? candidatIds : ['00000000-0000-0000-0000-000000000000'])

      if (benefError && candidatIds.length > 0) {
        logger.warn('GLOBAL_METRICS', 'Erreur chargement bénéficiaires', benefError)
      }

      const beneficiairesTotal = beneficiaires?.length || 0
      const beneficiairesActifs = beneficiaires?.filter(b => {
        if (!b.statut_global) return false
        const statut = b.statut_global.toUpperCase()
        return !['TERMINE', 'ABANDON', 'ABANDONNE'].includes(statut)
      }).length || 0

      // ============================================
      // 6. TAUX DE CONVERSION (calculé depuis données réelles)
      // ============================================
      const tauxConversion = candidatsTotal > 0
        ? Math.round((beneficiairesTotal / candidatsTotal) * 100)
        : 0

      // ============================================
      // 7. INTERVENANTS (données réelles)
      // Relation : beneficiaires.mentor_id → users.id
      // ============================================
      const { data: mentors, error: mentorsError } = await supabase
        .from('mentors')
        .select('id, statut')

      if (mentorsError) {
        logger.warn('GLOBAL_METRICS', 'Erreur chargement mentors', mentorsError)
      }

      const intervenantsActifs = mentors?.filter(m => m.statut === 'ACTIF').length || 0

      // ============================================
      // 8. PARTENAIRES (données réelles)
      // Relation : programme_financements.financeur_id → financeurs.id
      // ============================================
      const { data: financeurs, error: finError } = await supabase
        .from('financeurs')
        .select('id, statut')

      if (finError) {
        logger.warn('GLOBAL_METRICS', 'Erreur chargement financeurs', finError)
      }

      const financeursActifs = financeurs?.filter(f => f.statut === 'ACTIF').length || 0

      // ============================================
      // 9. RESSOURCES HUMAINES (données réelles)
      // Relation : employes.projet_id → projets.id
      // ============================================
      const { data: employes, error: empError } = await supabase
        .from('employes')
        .select('id, statut')

      if (empError) {
        logger.warn('GLOBAL_METRICS', 'Erreur chargement employés', empError)
      }

      const employesActifs = employes?.filter(e => e.statut === 'ACTIF').length || 0

      // ============================================
      // 10. REPORTING (données réelles)
      // ============================================
      const dateMoisPrecedent = new Date()
      dateMoisPrecedent.setMonth(dateMoisPrecedent.getMonth() - 1)

      const { data: rapports, error: rappError } = await supabase
        .from('rapports')
        .select('id, statut, created_at')
        .gte('created_at', dateMoisPrecedent.toISOString())
        .limit(1000)

      if (rappError) {
        logger.warn('GLOBAL_METRICS', 'Erreur chargement rapports', rappError)
      }

      const rapportsGeneres = rapports?.length || 0

      // ============================================
      // RETOUR DES KPIs GLOBAUX
      // ============================================
      const kpis = {
        // PROGRAMMES
        programmesActifs,
        programmesTotal: programmes?.length || 0,
        budgetTotalProgrammes,

        // PROJETS
        projetsEnCours,
        projetsTotal: projets?.length || 0,
        budgetTotalProjets,

        // FINANCES
        budgetTotal: budgetTotalProgrammes + budgetTotalProjets,
        budgetConsomme,

        // CANDIDATURES
        candidatsTotal,
        candidatsEligibles,
        tauxEligibilite: candidatsTotal > 0 
          ? Math.round((candidatsEligibles / candidatsTotal) * 100) 
          : 0,

        // BÉNÉFICIAIRES
        beneficiairesTotal,
        beneficiairesActifs,
        tauxConversion,

        // INTERVENANTS
        intervenantsActifs,
        intervenantsTotal: mentors?.length || 0,

        // PARTENAIRES
        financeursActifs,
        financeursTotal: financeurs?.length || 0,

        // RESSOURCES HUMAINES
        employesActifs,
        employesTotal: employes?.length || 0,

        // REPORTING
        rapportsGeneres,

        error: null,
      }

      logger.debug('GLOBAL_METRICS', 'KPIs globaux calculés', kpis)
      return kpis

    } catch (error) {
      logger.error('GLOBAL_METRICS', 'Erreur calcul KPIs globaux', error)
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
   * Calculer KPIs d'un module spécifique
   * avec toutes ses relations interconnectées
   */
  async getModuleKPIs(moduleName, filters = {}) {
    try {
      logger.debug('GLOBAL_METRICS', `Calcul KPIs module ${moduleName}`, filters)

      switch (moduleName) {
        case 'programmes':
          return await this.getProgrammesKPIs(filters)
        case 'projets':
          return await this.getProjetsKPIs(filters)
        case 'candidatures':
          return await this.getCandidaturesKPIs(filters)
        case 'beneficiaires':
          return await this.getBeneficiairesKPIs(filters)
        case 'intervenants':
          return await this.getIntervenantsKPIs(filters)
        case 'tresorerie':
          return await this.getTresorerieKPIs(filters)
        case 'gestion-temps':
          return await this.getGestionTempsKPIs(filters)
        case 'partenaires':
          return await this.getPartenairesKPIs(filters)
        case 'rh':
          return await this.getRHKPIs(filters)
        case 'reporting':
          return await this.getReportingKPIs(filters)
        case 'administration':
          return await this.getAdministrationKPIs(filters)
        default:
          throw new Error(`Module inconnu: ${moduleName}`)
      }
    } catch (error) {
      logger.error('GLOBAL_METRICS', `Erreur KPIs module ${moduleName}`, error)
      return { error }
    }
  },

  /**
   * KPIs PROGRAMMES (avec relations projets, dépenses, bénéficiaires)
   */
  async getProgrammesKPIs(filters = {}) {
    const programmeId = filters.programmeId
    
    if (programmeId) {
      // KPIs d'un programme spécifique (utilise le service existant)
      const metrics = await programmeMetricsService.getProgrammeMetrics(programmeId)
      return metrics
    }

    // KPIs globaux programmes
    const { data: programmes, error } = await supabase
      .from('programmes')
      .select('id, budget, statut')

    if (error) throw error

    const total = programmes?.length || 0
    const actifs = programmes?.filter(p => 
      ['ACTIF', 'EN_COURS', 'OUVERT'].includes(p.statut)
    ).length || 0

    const budgetTotal = programmes?.reduce((sum, p) => {
      const budget = parseFloat(String(p.budget || 0).replace(/\s/g, '').replace(/,/g, '.'))
      return sum + (isNaN(budget) ? 0 : budget)
    }, 0) || 0

    // Budget consommé (depuis programme_depenses - relation réelle)
    const { data: depenses } = await supabase
      .from('programme_depenses')
      .select('montant, statut')

    const statusesConsommation = ['PAYE', 'PAYÉ', 'VALIDE', 'VALIDÉ', 'APPROUVÉ', 'APPROUVÉ']
    const normalizeStatut = (s) => String(s || '').toUpperCase().trim()

    const budgetConsomme = depenses?.reduce((sum, d) => {
      if (statusesConsommation.some(s => normalizeStatut(s) === normalizeStatut(d.statut))) {
        const montant = parseFloat(String(d.montant || 0).replace(/\s/g, '').replace(/,/g, '.'))
        return sum + (isNaN(montant) ? 0 : montant)
      }
      return sum
    }, 0) || 0

    // Projets associés (relation réelle : projets.programme_id)
    const { data: projets } = await supabase
      .from('projets')
      .select('id, programme_id')

    const projetsAssocies = projets?.filter(p => 
      programmes?.some(prog => prog.id === p.programme_id)
    ).length || 0

    return {
      total,
      actifs,
      budgetTotal,
      budgetConsomme,
      projetsAssocies,
      tauxConsommation: budgetTotal > 0 
        ? Math.round((budgetConsomme / budgetTotal) * 100) 
        : 0,
    }
  },

  /**
   * KPIs PROJETS (avec relations candidats, bénéficiaires, dépenses)
   */
  async getProjetsKPIs(filters = {}) {
    const projetId = filters.projetId

    if (projetId) {
      // KPIs d'un projet spécifique (utilise le service existant)
      const metrics = await projetMetricsService.getProjetMetrics(projetId)
      return metrics
    }

    // KPIs globaux projets
    const { data: projets, error } = await supabase
      .from('projets')
      .select('id, budget_alloue, statut')

    if (error) throw error

    const total = projets?.length || 0
    const actifs = projets?.filter(p => 
      ['EN_COURS', 'PLANIFIE'].includes(p.statut)
    ).length || 0

    const budgetTotal = projets?.reduce((sum, p) => {
      const budget = parseFloat(String(p.budget_alloue || 0).replace(/\s/g, '').replace(/,/g, '.'))
      return sum + (isNaN(budget) ? 0 : budget)
    }, 0) || 0

    // Budget consommé (depuis programme_depenses avec projet_id - relation réelle)
    const { data: depenses } = await supabase
      .from('programme_depenses')
      .select('montant, statut, projet_id')
      .not('projet_id', 'is', null)

    const statusesConsommation = ['PAYE', 'PAYÉ', 'VALIDE', 'VALIDÉ', 'APPROUVÉ', 'APPROUVÉ']
    const normalizeStatut = (s) => String(s || '').toUpperCase().trim()

    const budgetConsomme = depenses?.reduce((sum, d) => {
      if (statusesConsommation.some(s => normalizeStatut(s) === normalizeStatut(d.statut))) {
        const montant = parseFloat(String(d.montant || 0).replace(/\s/g, '').replace(/,/g, '.'))
        return sum + (isNaN(montant) ? 0 : montant)
      }
      return sum
    }, 0) || 0

    return {
      total,
      actifs,
      budgetTotal,
      budgetConsomme,
      tauxConsommation: budgetTotal > 0 
        ? Math.round((budgetConsomme / budgetTotal) * 100) 
        : 0,
    }
  },

  /**
   * KPIs CANDIDATURES (avec relations appels, candidats, bénéficiaires)
   */
  async getCandidaturesKPIs(filters = {}) {
    // Appels (données réelles)
    const { data: appels, error: appelsError } = await supabase
      .from('appels_candidatures')
      .select('id, statut, date_ouverture, date_fermeture, projet_id')

    if (appelsError) {
      logger.warn('GLOBAL_METRICS', 'Erreur chargement appels', appelsError)
    }

    const maintenant = new Date()
    const appelsOuverts = appels?.filter(a => {
      if (!a.date_ouverture || !a.date_fermeture) return false
      const ouverture = new Date(a.date_ouverture)
      const fermeture = new Date(a.date_fermeture)
      return maintenant >= ouverture && maintenant <= fermeture
    }).length || 0

    // Candidats (données réelles liées aux appels - relation réelle)
    const appelIds = appels?.map(a => a.id) || []
    const { data: candidats, error: candidatsError } = await supabase
      .from('candidats')
      .select('id, statut_eligibilite, appel_id')
      .in('appel_id', appelIds.length > 0 ? appelIds : ['00000000-0000-0000-0000-000000000000'])

    if (candidatsError && appelIds.length > 0) {
      logger.warn('GLOBAL_METRICS', 'Erreur chargement candidats', candidatsError)
    }

    const candidatsTotal = candidats?.length || 0
    const candidatsEligibles = candidats?.filter(c => 
      c.statut_eligibilite === 'ELIGIBLE' || c.statut_eligibilite === 'ÉLIGIBLE'
    ).length || 0

    // Bénéficiaires (données réelles liées aux candidats - relation réelle)
    const candidatIds = candidats?.map(c => c.id) || []
    const { data: beneficiaires } = await supabase
      .from('beneficiaires')
      .select('id, candidat_id')
      .in('candidat_id', candidatIds.length > 0 ? candidatIds : ['00000000-0000-0000-0000-000000000000'])

    const beneficiairesTotal = beneficiaires?.length || 0

    return {
      appelsTotal: appels?.length || 0,
      appelsOuverts,
      candidatsTotal,
      candidatsEligibles,
      tauxEligibilite: candidatsTotal > 0 
        ? Math.round((candidatsEligibles / candidatsTotal) * 100) 
        : 0,
      beneficiairesTotal,
      tauxConversion: candidatsTotal > 0 
        ? Math.round((beneficiairesTotal / candidatsTotal) * 100) 
        : 0,
    }
  },

  /**
   * KPIs BÉNÉFICIAIRES (avec relations candidats, projets, accompagnements, insertions)
   */
  async getBeneficiairesKPIs(filters = {}) {
    // Bénéficiaires (données réelles)
    const { data: beneficiaires, error } = await supabase
      .from('beneficiaires')
      .select('id, statut_global, projet_id, candidat_id')

    if (error) throw error

    const total = beneficiaires?.length || 0
    const actifs = beneficiaires?.filter(b => {
      if (!b.statut_global) return false
      const statut = b.statut_global.toUpperCase()
      return !['TERMINE', 'ABANDON', 'ABANDONNE'].includes(statut)
    }).length || 0

    // Accompagnements (données réelles - relation réelle)
    const beneficiaireIds = beneficiaires?.map(b => b.id) || []
    const { data: accompagnements } = await supabase
      .from('accompagnements')
      .select('beneficiaire_id, statut')
      .in('beneficiaire_id', beneficiaireIds.length > 0 ? beneficiaireIds : ['00000000-0000-0000-0000-000000000000'])

    const accompagnes = new Set(accompagnements?.map(a => a.beneficiaire_id) || []).size

    // Insertions (données réelles - relation réelle)
    const { data: insertions } = await supabase
      .from('insertions')
      .select('beneficiaire_id')
      .in('beneficiaire_id', beneficiaireIds.length > 0 ? beneficiaireIds : ['00000000-0000-0000-0000-000000000000'])

    const inserts = insertions?.length || 0

    return {
      total,
      actifs,
      accompagnes,
      inserts,
      tauxInsertion: total > 0 
        ? Math.round((inserts / total) * 100) 
        : 0,
      tauxAccompagnement: total > 0 
        ? Math.round((accompagnes / total) * 100) 
        : 0,
    }
  },

  /**
   * KPIs INTERVENANTS (avec relations bénéficiaires, accompagnements)
   */
  async getIntervenantsKPIs(filters = {}) {
    // Mentors (données réelles)
    const { data: mentors, error } = await supabase
      .from('mentors')
      .select('id, statut, disponibilite')

    if (error) throw error

    const mentorsActifs = mentors?.filter(m => m.statut === 'ACTIF').length || 0

    // Bénéficiaires par mentor (données réelles - relation réelle)
    const mentorIds = mentors?.map(m => m.id) || []
    const { data: beneficiaires } = await supabase
      .from('beneficiaires')
      .select('id, mentor_id')
      .in('mentor_id', mentorIds.length > 0 ? mentorIds : ['00000000-0000-0000-0000-000000000000'])

    const beneficiairesParMentor = beneficiaires?.length || 0

    // Accompagnements (données réelles - relation réelle)
    const { data: accompagnements } = await supabase
      .from('accompagnements')
      .select('intervenant_id, duree_heures')
      .in('intervenant_id', mentorIds.length > 0 ? mentorIds : ['00000000-0000-0000-0000-000000000000'])

    const heuresTotal = accompagnements?.reduce((sum, a) => {
      const heures = parseFloat(String(a.duree_heures || 0).replace(/\s/g, '').replace(/,/g, '.'))
      return sum + (isNaN(heures) ? 0 : heures)
    }, 0) || 0

    return {
      mentorsTotal: mentors?.length || 0,
      mentorsActifs,
      beneficiairesParMentor,
      heuresTotal,
      chargeMoyenne: mentorsActifs > 0 
        ? Math.round(beneficiairesParMentor / mentorsActifs) 
        : 0,
    }
  },

  /**
   * KPIs TRÉSORERIE (avec relations dépenses, financements)
   */
  async getTresorerieKPIs(filters = {}) {
    // Dépenses (données réelles)
    const { data: depenses, error: depError } = await supabase
      .from('programme_depenses')
      .select('montant, statut, date_depense')

    if (depError) {
      logger.warn('GLOBAL_METRICS', 'Erreur chargement dépenses', depError)
    }

    const statusesPayes = ['PAYE', 'PAYÉ', 'PAID']
    const normalizeStatut = (s) => String(s || '').toUpperCase().trim()

    const depensesPayees = depenses?.reduce((sum, d) => {
      if (statusesPayes.some(s => normalizeStatut(s) === normalizeStatut(d.statut))) {
        const montant = parseFloat(String(d.montant || 0).replace(/\s/g, '').replace(/,/g, '.'))
        return sum + (isNaN(montant) ? 0 : montant)
      }
      return sum
    }, 0) || 0

    // Financements (données réelles - relation réelle)
    const { data: financements, error: finError } = await supabase
      .from('programme_financements')
      .select('montant, statut, date_recu')

    if (finError) {
      logger.warn('GLOBAL_METRICS', 'Erreur chargement financements', finError)
    }

    const financementsRecus = financements?.reduce((sum, f) => {
      if (f.statut === 'RECU') {
        const montant = parseFloat(String(f.montant || 0).replace(/\s/g, '').replace(/,/g, '.'))
        return sum + (isNaN(montant) ? 0 : montant)
      }
      return sum
    }, 0) || 0

    // Solde = Entrées - Sorties
    const solde = financementsRecus - depensesPayees

    return {
      depensesPayees,
      financementsRecus,
      solde,
      fluxNet: solde,
    }
  },

  /**
   * KPIs GESTION TEMPS (avec relations projets, employés)
   */
  async getGestionTempsKPIs(filters = {}) {
    // Temps travaillé (données réelles - relation réelle)
    const { data: tempsTravail, error: tempsError } = await supabase
      .from('temps_travail')
      .select('duree_heures, projet_id, employe_id')

    if (tempsError) {
      logger.warn('GLOBAL_METRICS', 'Erreur chargement temps travail', tempsError)
    }

    const heuresTotal = tempsTravail?.reduce((sum, t) => {
      const heures = parseFloat(String(t.duree_heures || 0).replace(/\s/g, '').replace(/,/g, '.'))
      return sum + (isNaN(heures) ? 0 : heures)
    }, 0) || 0

    // Par projet
    const heuresParProjet = tempsTravail?.reduce((acc, t) => {
      const projetId = t.projet_id
      if (!projetId) return acc
      if (!acc[projetId]) acc[projetId] = 0
      const heures = parseFloat(String(t.duree_heures || 0).replace(/\s/g, '').replace(/,/g, '.'))
      acc[projetId] += (isNaN(heures) ? 0 : heures)
      return acc
    }, {}) || {}

    // Absences (données réelles)
    const { data: absences, error: absError } = await supabase
      .from('absences')
      .select('id, type, date_debut, date_fin')

    if (absError) {
      logger.warn('GLOBAL_METRICS', 'Erreur chargement absences', absError)
    }

    const absencesTotal = absences?.length || 0

    return {
      heuresTotal,
      heuresParProjet,
      absencesTotal,
      tauxPresence: 100 - (absencesTotal > 0 ? Math.min(100, absencesTotal * 0.5) : 0),
    }
  },

  /**
   * KPIs PARTENAIRES (avec relations programmes, financements)
   */
  async getPartenairesKPIs(filters = {}) {
    // Financeurs (données réelles)
    const { data: financeurs, error: finError } = await supabase
      .from('financeurs')
      .select('id, statut')

    if (finError) {
      logger.warn('GLOBAL_METRICS', 'Erreur chargement financeurs', finError)
    }

    const financeursActifs = financeurs?.filter(f => f.statut === 'ACTIF').length || 0

    // Financements (données réelles - relation réelle)
    const { data: financements, error: financError } = await supabase
      .from('programme_financements')
      .select('montant, financeur_id')

    if (financError) {
      logger.warn('GLOBAL_METRICS', 'Erreur chargement financements', financError)
    }

    const montantTotal = financements?.reduce((sum, f) => {
      const montant = parseFloat(String(f.montant || 0).replace(/\s/g, '').replace(/,/g, '.'))
      return sum + (isNaN(montant) ? 0 : montant)
    }, 0) || 0

    // Partenaires (données réelles)
    const { data: partenaires, error: partError } = await supabase
      .from('partenaires')
      .select('id, statut')

    if (partError) {
      logger.warn('GLOBAL_METRICS', 'Erreur chargement partenaires', partError)
    }

    const partenairesActifs = partenaires?.filter(p => p.statut === 'ACTIF').length || 0

    return {
      financeursTotal: financeurs?.length || 0,
      financeursActifs,
      partenairesTotal: partenaires?.length || 0,
      partenairesActifs,
      montantTotal,
    }
  },

  /**
   * KPIs RESSOURCES HUMAINES (avec relations projets, programmes)
   */
  async getRHKPIs(filters = {}) {
    // Employés (données réelles)
    const { data: employes, error } = await supabase
      .from('employes')
      .select('id, statut, type_contrat, projet_id, programme_id, est_prestataire')

    if (error) throw error

    const total = employes?.length || 0
    const actifs = employes?.filter(e => e.statut === 'ACTIF').length || 0
    const prestataires = employes?.filter(e => e.est_prestataire === true).length || 0

    // Postes (données réelles)
    const { data: postes, error: postesError } = await supabase
      .from('postes')
      .select('id, statut')

    if (postesError) {
      logger.warn('GLOBAL_METRICS', 'Erreur chargement postes', postesError)
    }

    const postesOuverts = postes?.filter(p => p.statut === 'OUVERT').length || 0

    // Compétences (données réelles)
    const { data: competences, error: compError } = await supabase
      .from('competences')
      .select('id')

    if (compError) {
      logger.warn('GLOBAL_METRICS', 'Erreur chargement compétences', compError)
    }

    const competencesTotal = competences?.length || 0

    return {
      employesTotal: total,
      employesActifs: actifs,
      prestataires,
      postesTotal: postes?.length || 0,
      postesOuverts,
      competencesTotal,
    }
  },

  /**
   * KPIs REPORTING (données réelles depuis table rapports)
   */
  async getReportingKPIs(filters = {}) {
    // Rapports (données réelles)
    const { data: rapports, error } = await supabase
      .from('rapports')
      .select('id, statut, format, created_at')

    if (error) {
      logger.warn('GLOBAL_METRICS', 'Erreur chargement rapports', error)
    }

    const total = rapports?.length || 0
    const enAttente = rapports?.filter(r => r.statut === 'EN_ATTENTE').length || 0
    const termines = rapports?.filter(r => r.statut === 'TERMINE').length || 0
    const exports = rapports?.filter(r => ['EXCEL', 'PDF'].includes(r.format)).length || 0

    return {
      rapportsTotal: total,
      rapportsEnAttente: enAttente,
      rapportsTermines: termines,
      tauxCompletion: total > 0 
        ? Math.round((termines / total) * 100) 
        : 0,
      exportsTotal: exports,
    }
  },

  /**
   * KPIs ADMINISTRATION (avec relations users, audit_log)
   */
  async getAdministrationKPIs(filters = {}) {
    // Utilisateurs (données réelles)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, actif, role')

    if (usersError) {
      logger.warn('GLOBAL_METRICS', 'Erreur chargement users', usersError)
    }

    const total = users?.length || 0
    const actifs = users?.filter(u => u.actif === true).length || 0
    const inactifs = total - actifs
    const admins = users?.filter(u => 
      u.role && u.role.toUpperCase().includes('ADMIN')
    ).length || 0

    // Logs d'audit (données réelles - relation réelle)
    const dateMoisPrecedent = new Date()
    dateMoisPrecedent.setMonth(dateMoisPrecedent.getMonth() - 1)

    const { data: logs, error: logsError } = await supabase
      .from('audit_log')
      .select('id, action, created_at')
      .gte('created_at', dateMoisPrecedent.toISOString())
      .limit(1000)

    if (logsError) {
      logger.warn('GLOBAL_METRICS', 'Erreur chargement logs audit', logsError)
    }

    const logsTotal = logs?.length || 0

    // Référentiels (compter les tables de référence si applicable)
    // Pour l'instant, on peut compter les compétences, postes, etc.
    const { data: competences } = await supabase
      .from('competences')
      .select('id')
      .limit(1)

    const referentielsTotal = competences ? 1 : 0 // Simplifié pour l'instant

    return {
      utilisateursTotal: total,
      utilisateursActifs: actifs,
      utilisateursInactifs: inactifs,
      administrateurs: admins,
      logsAudit: logsTotal,
      referentiels: referentielsTotal,
    }
  },
}

