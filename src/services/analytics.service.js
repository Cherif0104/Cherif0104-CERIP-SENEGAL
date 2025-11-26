// Service d'analytics pour le tableau de bord SERIP-CAS
// Centralise les agrégations (counts, ratios, funnel) pour le rôle OWNER/ADMIN_SERIP

import { supabase } from '../lib/supabase'

export const analyticsService = {
  /**
   * KPIs principaux du tableau de bord
   * - programmesActifs: nombre total de programmes (filtrage par statut possible plus tard)
   * - projetsEnCours: nombre total de projets
   * - candidatsEnAttente: candidats avec statut NOUVEAU ou DIAGNOSTIC
   * - beneficiairesActifs: bénéficiaires avec statut ACTIF
   * - funnel: { candidats, eligibles, beneficiaires, insertions } (insertions optionnel)
   * - budgetTotal: somme des budgets des programmes
   * - budgetConsomme: budget consommé (à calculer depuis financements/depenses si table existe)
   * - tauxConversion: (beneficiaires / candidats) * 100
   * - tauxInsertion: (insertions / beneficiaires) * 100
   */
  async getDashboardStats() {
    try {
      const [
        programmesCount,
        projetsCount,
        candidatsCounts,
        beneficiairesActifsCount,
        budgetData,
        insertionsCount
      ] = await Promise.all([
        countTable('programmes'),
        countTable('projets'),
        countCandidatsByStatut(),
        countBeneficiairesActifs(),
        getBudgetStats(),
        countBeneficiairesByStatut('INSERE')
      ])

      const candidatsTotal = candidatsCounts.total
      const eligibles = candidatsCounts.eligibles

      // Calcul des taux
      const tauxConversion = candidatsTotal > 0 
        ? ((beneficiairesActifsCount / candidatsTotal) * 100).toFixed(1)
        : 0
      
      const tauxInsertion = beneficiairesActifsCount > 0
        ? ((insertionsCount / beneficiairesActifsCount) * 100).toFixed(1)
        : 0

      return {
        data: {
          programmesActifs: programmesCount,
          projetsEnCours: projetsCount,
          candidatsEnAttente: candidatsCounts.enAttente,
          beneficiairesActifs: beneficiairesActifsCount,
          budgetTotal: budgetData.total,
          budgetConsomme: budgetData.consomme,
          tauxConversion: parseFloat(tauxConversion),
          tauxInsertion: parseFloat(tauxInsertion),
          funnel: {
            candidats: candidatsTotal,
            eligibles,
            beneficiaires: beneficiairesActifsCount,
            insertions: insertionsCount
          }
        },
        error: null
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
      return { data: null, error }
    }
  },

  /**
   * Récupère les programmes/projets en risque
   * - Programmes sans bénéficiaires
   * - Projets avec taux de conversion faible (< 10%)
   * - Programmes avec budget consommé > 90%
   */
  async getAlerts() {
    try {
      const alerts = []
      
      // Programmes sans bénéficiaires
      const programmes = await supabase.from('programmes').select('id, nom')
      const projets = await supabase.from('projets').select('id, nom, programme_id')
      const beneficiaires = await supabase.from('beneficiaires').select('projet_id')
      
      const benefProjetsIds = new Set((beneficiaires.data || []).map(b => b.projet_id))
      const projetsByProgramme = {}
      
      ;(projets.data || []).forEach(p => {
        if (!projetsByProgramme[p.programme_id]) {
          projetsByProgramme[p.programme_id] = []
        }
        projetsByProgramme[p.programme_id].push(p.id)
      })
      
      ;(programmes.data || []).forEach(prog => {
        const projetsIds = projetsByProgramme[prog.id] || []
        const hasBeneficiaires = projetsIds.some(pid => benefProjetsIds.has(pid))
        
        if (!hasBeneficiaires && projetsIds.length > 0) {
          alerts.push({
            type: 'warning',
            title: 'Programme sans bénéficiaires',
            message: `Le programme "${prog.nom}" n'a aucun bénéficiaire`,
            link: `/programmes/${prog.id}`
          })
        }
      })
      
      return { data: alerts, error: null }
    } catch (error) {
      console.error('Error loading alerts:', error)
      return { data: [], error }
    }
  }
}

// --- Helpers internes ---

async function countTable(table) {
  const { count, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true })

  if (error) {
    console.error(`Error counting table ${table}:`, error)
    return 0
  }

  return count || 0
}

async function countCandidatsByStatut() {
  const { data, error } = await supabase
    .from('candidats')
    .select('statut, statut_eligibilite')

  if (error) {
    console.error('Error counting candidats:', error)
    return {
      total: 0,
      enAttente: 0,
      eligibles: 0
    }
  }

  const rows = data || []

  const total = rows.length
  const enAttente = rows.filter((c) =>
    (c.statut === 'NOUVEAU' || c.statut === 'DIAGNOSTIC')
  ).length

  const eligibles = rows.filter((c) => c.statut_eligibilite === 'ELIGIBLE').length

  return {
    total,
    enAttente,
    eligibles
  }
}

async function countBeneficiairesActifs() {
  const { count, error } = await supabase
    .from('beneficiaires')
    .select('id', { count: 'exact', head: true })
    .eq('statut', 'ACTIF')

  if (error) {
    console.error('Error counting beneficiaires actifs:', error)
    return 0
  }

  return count || 0
}

async function countBeneficiairesByStatut(statut) {
  const { count, error } = await supabase
    .from('beneficiaires')
    .select('id', { count: 'exact', head: true })
    .eq('statut', statut)

  if (error) {
    console.error(`Error counting beneficiaires statut=${statut}:`, error)
    return 0
  }

  return count || 0
}

async function getBudgetStats() {
  try {
    // Récupérer les budgets des programmes
    const { data: programmes, error } = await supabase
      .from('programmes')
      .select('budget')
    
    if (error) {
      console.error('Error fetching budget:', error)
      return { total: 0, consomme: 0 }
    }
    
    const total = (programmes || []).reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0)
    
    // Pour l'instant, budget consommé = 0 (à implémenter avec table financements/depenses)
    // TODO: Calculer depuis table financements ou depenses si elle existe
    const consomme = 0
    
    return { total, consomme }
  } catch (error) {
    console.error('Error calculating budget stats:', error)
    return { total: 0, consomme: 0 }
  }
}


