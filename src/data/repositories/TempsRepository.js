import { BaseRepository } from './BaseRepository'
import { logger } from '@/utils/logger'
import { supabase } from '@/lib/supabase'

/**
 * TempsRepository - Repository pour la gestion du temps
 */
export class TempsRepository extends BaseRepository {
  constructor() {
    super('temps_travail', {
      enabled: true,
      ttl: 300000, // 5 minutes
      level: 'memory',
    })
  }

  /**
   * Obtenir le temps travaillé d'un utilisateur
   */
  async getTempsByUser(userId, options = {}) {
    try {
      const { dateDebut, dateFin, projetId, statut } = options

      let query = supabase.from(this.tableName).select('*').eq('user_id', userId)

      if (dateDebut) {
        query = query.gte('date_travail', dateDebut)
      }
      if (dateFin) {
        query = query.lte('date_travail', dateFin)
      }
      if (projetId) {
        query = query.eq('projet_id', projetId)
      }
      if (statut) {
        query = query.eq('statut', statut)
      }

      query = query.order('date_travail', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      // Calculer total heures
      const totalHeures = (data || []).reduce((sum, entry) => sum + parseFloat(entry.heures || 0), 0)

      return {
        data: {
          entries: data || [],
          total_heures: totalHeures,
        },
        error: null,
      }
    } catch (error) {
      logger.error('TEMPS_REPOSITORY', `Erreur getTempsByUser ${userId}`, error)
      return { data: null, error }
    }
  }

  /**
   * Obtenir la charge de travail d'un utilisateur
   */
  async getChargeTravail(userId, options = {}) {
    try {
      const { periodeMois, periodeAnnee } = options

      // Obtenir le temps travaillé du mois
      const dateDebut = new Date(periodeAnnee, periodeMois - 1, 1).toISOString().split('T')[0]
      const dateFin = new Date(periodeAnnee, periodeMois, 0).toISOString().split('T')[0]

      const { data: tempsData, error } = await this.getTempsByUser(userId, {
        dateDebut,
        dateFin,
      })

      if (error) throw error

      // Obtenir les absences du mois
      const { data: absences, error: absError } = await supabase
        .from('absences')
        .select('*')
        .eq('user_id', userId)
        .eq('statut', 'APPROUVE')
        .lte('date_debut', dateFin)
        .gte('date_fin', dateDebut)

      // Calculer jours ouvrés (approximatif : 22 jours/mois)
      const joursOuvres = 22
      const heuresDisponibles = joursOuvres * 8 // 8h/jour

      return {
        data: {
          heures_travaillees: tempsData.total_heures || 0,
          heures_disponibles: heuresDisponibles,
          charge_pourcentage: heuresDisponibles > 0 ? (tempsData.total_heures / heuresDisponibles) * 100 : 0,
          jours_absences: absences?.length || 0,
        },
        error: null,
      }
    } catch (error) {
      logger.error('TEMPS_REPOSITORY', `Erreur getChargeTravail ${userId}`, error)
      return { data: null, error }
    }
  }

  /**
   * Obtenir le planning d'un utilisateur
   */
  async getPlanning(userId, options = {}) {
    try {
      const { dateDebut, dateFin, statut } = options

      let query = supabase.from('planning').select('*').eq('user_id', userId)

      if (dateDebut) {
        query = query.gte('date_prevue', dateDebut)
      }
      if (dateFin) {
        query = query.lte('date_prevue', dateFin)
      }
      if (statut) {
        query = query.eq('statut', statut)
      }

      query = query.order('date_prevue', { ascending: true })

      const { data, error } = await query

      if (error) throw error
      return { data: data || [], error: null }
    } catch (error) {
      logger.error('TEMPS_REPOSITORY', `Erreur getPlanning ${userId}`, error)
      return { data: null, error }
    }
  }

  /**
   * Obtenir les absences d'un utilisateur
   */
  async getAbsences(userId, options = {}) {
    try {
      const { dateDebut, dateFin, statut } = options

      let query = supabase.from('absences').select('*').eq('user_id', userId)

      if (dateDebut) {
        query = query.gte('date_debut', dateDebut)
      }
      if (dateFin) {
        query = query.lte('date_fin', dateFin)
      }
      if (statut) {
        query = query.eq('statut', statut)
      }

      query = query.order('date_debut', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      return { data: data || [], error: null }
    } catch (error) {
      logger.error('TEMPS_REPOSITORY', `Erreur getAbsences ${userId}`, error)
      return { data: null, error }
    }
  }

  /**
   * Obtenir ou créer une feuille de temps
   */
  async getOrCreateFeuilleTemps(userId, mois, annee) {
    try {
      // Vérifier si existe
      const { data: existing, error: fetchError } = await supabase
        .from('feuilles_temps')
        .select('*')
        .eq('user_id', userId)
        .eq('periode_mois', mois)
        .eq('periode_annee', annee)
        .single()

      if (existing && !fetchError) {
        return { data: existing, error: null, created: false }
      }

      // Créer si n'existe pas
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data: newFeuille, error: createError } = await supabase
        .from('feuilles_temps')
        .insert([
          {
            user_id: userId,
            periode_mois: mois,
            periode_annee: annee,
            statut: 'BROUILLON',
          },
        ])
        .select()
        .single()

      if (createError) throw createError

      return { data: newFeuille, error: null, created: true }
    } catch (error) {
      logger.error('TEMPS_REPOSITORY', `Erreur getOrCreateFeuilleTemps`, error)
      return { data: null, error }
    }
  }
}

export const tempsRepository = new TempsRepository()
export default tempsRepository

