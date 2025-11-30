import { supabase } from '@/lib/supabase'

export const resourceManagementService = {
  // Ressources humaines
  async getHumanResources() {
    try {
      const { data: intervenants, error } = await supabase
        .from('intervenants')
        .select('*, users(*)')

      if (error) throw error

      // Calculer charge de travail et disponibilités
      const resources = (intervenants || []).map((intervenant) => {
        // Placeholder - à calculer selon les bénéficiaires assignés
        return {
          ...intervenant,
          charge: 60, // %
          disponibilite: 40, // heures/semaine
          beneficiaires: 5,
        }
      })

      return { data: resources, error: null }
    } catch (error) {
      console.error('Error getting human resources:', error)
      return { data: null, error }
    }
  },

  // Ressources financières
  async getFinancialResources(projetId = null) {
    try {
      let query = supabase
        .from('projets')
        .select('id, budget_alloue, budget_consomme, financements(*)')

      if (projetId) {
        query = query.eq('id', projetId)
      }

      const { data, error } = await query

      if (error) throw error

      const resources = (data || []).map((projet) => {
        const budgetAlloue = projet.budget_alloue || 0
        const budgetConsomme = projet.budget_consomme || 0
        const financementsRecus = (projet.financements || []).reduce(
          (sum, f) => sum + (f.montant || 0),
          0
        )

        return {
          ...projet,
          budgetAlloue,
          budgetConsomme,
          budgetRestant: budgetAlloue - budgetConsomme,
          financementsRecus,
          tauxConsommation: budgetAlloue > 0 ? (budgetConsomme / budgetAlloue) * 100 : 0,
          tauxEngagement: budgetAlloue > 0 ? (financementsRecus / budgetAlloue) * 100 : 0,
        }
      })

      return { data: resources, error: null }
    } catch (error) {
      console.error('Error getting financial resources:', error)
      return { data: null, error }
    }
  },

  // Ressources temporelles
  async getTimeResources(projetId = null) {
    try {
      let query = supabase
        .from('projets')
        .select('id, date_debut, date_fin, jalons')

      if (projetId) {
        query = query.eq('id', projetId)
      }

      const { data, error } = await query

      if (error) throw error

      const now = new Date()
      const resources = (data || []).map((projet) => {
        const dateDebut = new Date(projet.date_debut)
        const dateFin = new Date(projet.date_fin)
        const dureeTotale = dateFin - dateDebut
        const dureeEcoulee = now - dateDebut
        const dureeRestante = dateFin - now

        const jalons = projet.jalons || []
        const jalonsAtteints = jalons.filter((j) => j.termine).length
        const jalonsEnRetard = jalons.filter(
          (j) => !j.termine && new Date(j.date_prevue) < now
        ).length

        return {
          ...projet,
          dureeTotale,
          dureeEcoulee,
          dureeRestante,
          tauxAvancement: dureeTotale > 0 ? (dureeEcoulee / dureeTotale) * 100 : 0,
          jalonsTotal: jalons.length,
          jalonsAtteints,
          jalonsEnRetard,
          retards: jalonsEnRetard,
        }
      })

      return { data: resources, error: null }
    } catch (error) {
      console.error('Error getting time resources:', error)
      return { data: null, error }
    }
  },
}

