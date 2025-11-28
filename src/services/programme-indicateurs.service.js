// Service de gestion des indicateurs de performance des programmes
import { supabase } from '../lib/supabase'

const TABLE_INDICATEURS = 'programme_indicateurs'
const TABLE_MESURES = 'programme_indicateur_mesures'

export const programmeIndicateursService = {
  // ========== INDICATEURS ==========

  async getAll(programmeId, actifOnly = false) {
    try {
      let query = supabase
        .from(TABLE_INDICATEURS)
        .select('*')
        .eq('programme_id', programmeId)

      if (actifOnly) {
        query = query.eq('actif', true)
      }

      const { data, error } = await query.order('ordre', { ascending: true })

      return { data: data || [], error }
    } catch (error) {
      console.error('Error fetching indicateurs:', error)
      return { data: [], error }
    }
  },

  async getById(id) {
    try {
      const { data, error } = await supabase
        .from(TABLE_INDICATEURS)
        .select('*')
        .eq('id', id)
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error fetching indicateur:', error)
      return { data: null, error }
    }
  },

  async create(indicateur) {
    try {
      const indicateurData = {
        programme_id: indicateur.programme_id,
        code: indicateur.code,
        libelle: indicateur.libelle,
        type: indicateur.type,
        cible: indicateur.cible || null,
        unite: indicateur.unite || null,
        source_verification: indicateur.source_verification || null,
        frequence_mesure: indicateur.frequence_mesure || null,
        description: indicateur.description || null,
        ordre: indicateur.ordre || 0,
        actif: indicateur.actif !== undefined ? indicateur.actif : true
      }

      const { data, error } = await supabase
        .from(TABLE_INDICATEURS)
        .insert(indicateurData)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating indicateur:', error)
      return { data: null, error }
    }
  },

  async update(id, indicateur) {
    try {
      const updateData = {
        code: indicateur.code,
        libelle: indicateur.libelle,
        type: indicateur.type,
        cible: indicateur.cible || null,
        unite: indicateur.unite || null,
        source_verification: indicateur.source_verification || null,
        frequence_mesure: indicateur.frequence_mesure || null,
        description: indicateur.description || null,
        ordre: indicateur.ordre,
        actif: indicateur.actif !== undefined ? indicateur.actif : true
      }

      const { data, error } = await supabase
        .from(TABLE_INDICATEURS)
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating indicateur:', error)
      return { data: null, error }
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from(TABLE_INDICATEURS)
        .delete()
        .eq('id', id)

      return { data: { id }, error }
    } catch (error) {
      console.error('Error deleting indicateur:', error)
      return { data: null, error }
    }
  },

  async getIndicateurWithStats(indicateurId) {
    try {
      const { data: indicateur, error: indError } = await this.getById(indicateurId)
      if (indError || !indicateur) {
        return { data: null, error: indError }
      }

      // Récupérer toutes les mesures
      const { data: mesures, error: mesError } = await this.getMesures(indicateurId)
      if (mesError) {
        return { data: null, error: mesError }
      }

      // Calculer les statistiques
      const stats = {
        total_mesures: mesures.length,
        derniere_mesure: mesures.length > 0 ? mesures[0] : null,
        taux_realisation: null,
        evolution: []
      }

      if (indicateur.type === 'QUANTITATIF' && indicateur.cible && indicateur.cible > 0) {
        if (stats.derniere_mesure && stats.derniere_mesure.valeur_quantitative) {
          stats.taux_realisation = (stats.derniere_mesure.valeur_quantitative / indicateur.cible) * 100
        }

        // Calculer l'évolution (mesures triées par date)
        const mesuresTriees = [...mesures].sort((a, b) => 
          new Date(a.date_mesure) - new Date(b.date_mesure)
        )
        stats.evolution = mesuresTriees.map(m => ({
          date: m.date_mesure,
          valeur: m.valeur_quantitative,
          taux: indicateur.cible > 0 ? (m.valeur_quantitative / indicateur.cible) * 100 : 0
        }))
      }

      return {
        data: {
          ...indicateur,
          stats
        },
        error: null
      }
    } catch (error) {
      console.error('Error getting indicateur with stats:', error)
      return { data: null, error }
    }
  },

  // ========== MESURES ==========

  async getMesures(indicateurId) {
    try {
      const { data, error } = await supabase
        .from(TABLE_MESURES)
        .select('*')
        .eq('indicateur_id', indicateurId)
        .order('date_mesure', { ascending: false })

      return { data: data || [], error }
    } catch (error) {
      console.error('Error fetching mesures:', error)
      return { data: [], error }
    }
  },

  async getMesureById(id) {
    try {
      const { data, error } = await supabase
        .from(TABLE_MESURES)
        .select('*')
        .eq('id', id)
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error fetching mesure:', error)
      return { data: null, error }
    }
  },

  async createMesure(mesure) {
    try {
      const mesureData = {
        indicateur_id: mesure.indicateur_id,
        valeur_quantitative: mesure.valeur_quantitative || null,
        valeur_qualitative: mesure.valeur_qualitative || null,
        date_mesure: mesure.date_mesure,
        commentaire: mesure.commentaire || null,
        source_donnees: mesure.source_donnees || null,
        date_validation: mesure.date_validation || null,
        validated_by: mesure.validated_by || null
      }

      const { data, error } = await supabase
        .from(TABLE_MESURES)
        .insert(mesureData)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating mesure:', error)
      return { data: null, error }
    }
  },

  async updateMesure(id, mesure) {
    try {
      const updateData = {
        valeur_quantitative: mesure.valeur_quantitative || null,
        valeur_qualitative: mesure.valeur_qualitative || null,
        date_mesure: mesure.date_mesure,
        commentaire: mesure.commentaire || null,
        source_donnees: mesure.source_donnees || null,
        date_validation: mesure.date_validation || null,
        validated_by: mesure.validated_by || null
      }

      const { data, error } = await supabase
        .from(TABLE_MESURES)
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating mesure:', error)
      return { data: null, error }
    }
  },

  async deleteMesure(id) {
    try {
      const { error } = await supabase
        .from(TABLE_MESURES)
        .delete()
        .eq('id', id)

      return { data: { id }, error }
    } catch (error) {
      console.error('Error deleting mesure:', error)
      return { data: null, error }
    }
  },

  // ========== DASHBOARD ==========

  async getDashboard(programmeId) {
    try {
      const { data: indicateurs, error } = await this.getAll(programmeId, true)
      if (error) {
        return { data: null, error }
      }

      const dashboard = {
        total_indicateurs: indicateurs.length,
        indicateurs_quantitatifs: 0,
        indicateurs_qualitatifs: 0,
        indicateurs_avec_mesures: 0,
        indicateurs_sans_mesures: 0,
        taux_moyen_realisation: 0,
        indicateurs: []
      }

      // Enrichir chaque indicateur avec ses statistiques
      for (const indicateur of indicateurs) {
        const { data: statsData } = await this.getIndicateurWithStats(indicateur.id)
        
        if (indicateur.type === 'QUANTITATIF') {
          dashboard.indicateurs_quantitatifs++
        } else {
          dashboard.indicateurs_qualitatifs++
        }

        if (statsData && statsData.stats.total_mesures > 0) {
          dashboard.indicateurs_avec_mesures++
        } else {
          dashboard.indicateurs_sans_mesures++
        }

        dashboard.indicateurs.push(statsData || indicateur)
      }

      // Calculer le taux moyen de réalisation
      const indicateursAvecTaux = dashboard.indicateurs.filter(
        ind => ind.stats && ind.stats.taux_realisation !== null
      )
      
      if (indicateursAvecTaux.length > 0) {
        const sommeTaux = indicateursAvecTaux.reduce(
          (sum, ind) => sum + ind.stats.taux_realisation,
          0
        )
        dashboard.taux_moyen_realisation = sommeTaux / indicateursAvecTaux.length
      }

      return { data: dashboard, error: null }
    } catch (error) {
      console.error('Error getting dashboard:', error)
      return { data: null, error }
    }
  }
}

