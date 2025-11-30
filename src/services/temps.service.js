import { tempsRepository } from '@/data/repositories/TempsRepository'
import { logger } from '@/utils/logger'
import { supabase } from '@/lib/supabase'

/**
 * Service pour la gestion du temps
 */
export const tempsService = {
  /**
   * Enregistrer du temps travaillé
   */
  async saisirTemps(tempsData) {
    logger.debug('TEMPS_SERVICE', 'saisirTemps appelé', tempsData)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { data: null, error: new Error('Utilisateur non authentifié') }
    }

    const tempsToInsert = {
      ...tempsData,
      user_id: user.id,
      statut: 'SAISI',
    }

    const { data, error } = await tempsRepository.create(tempsToInsert)

    if (error) {
      logger.error('TEMPS_SERVICE', 'Erreur saisie temps', error)
      return { data: null, error }
    }

    logger.info('TEMPS_SERVICE', 'Temps saisi avec succès', { id: data.id })
    return { data, error: null }
  },

  /**
   * Obtenir le temps travaillé d'un utilisateur
   */
  async getTempsByUser(userId, options = {}) {
    logger.debug('TEMPS_SERVICE', `getTempsByUser appelé pour ${userId}`, options)
    return tempsRepository.getTempsByUser(userId, options)
  },

  /**
   * Obtenir la charge de travail
   */
  async getChargeTravail(userId, options = {}) {
    logger.debug('TEMPS_SERVICE', `getChargeTravail appelé pour ${userId}`, options)
    return tempsRepository.getChargeTravail(userId, options)
  },

  /**
   * Obtenir le planning
   */
  async getPlanning(userId, options = {}) {
    logger.debug('TEMPS_SERVICE', `getPlanning appelé pour ${userId}`, options)
    return tempsRepository.getPlanning(userId, options)
  },

  /**
   * Créer une entrée de planning
   */
  async createPlanning(planningData) {
    logger.debug('TEMPS_SERVICE', 'createPlanning appelé', planningData)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const planningToInsert = {
      ...planningData,
      user_id: planningData.user_id || user?.id,
      created_by: user?.id || null,
      statut: 'PLANIFIE',
    }

    const { data, error } = await supabase
      .from('planning')
      .insert([planningToInsert])
      .select()
      .single()

    if (error) {
      logger.error('TEMPS_SERVICE', 'Erreur création planning', error)
      return { data: null, error }
    }

    logger.info('TEMPS_SERVICE', 'Planning créé avec succès', { id: data.id })
    return { data, error: null }
  },

  /**
   * Obtenir les absences
   */
  async getAbsences(userId, options = {}) {
    logger.debug('TEMPS_SERVICE', `getAbsences appelé pour ${userId}`, options)
    return tempsRepository.getAbsences(userId, options)
  },

  /**
   * Créer une demande d'absence
   */
  async createAbsence(absenceData) {
    logger.debug('TEMPS_SERVICE', 'createAbsence appelé', absenceData)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { data: null, error: new Error('Utilisateur non authentifié') }
    }

    const absenceToInsert = {
      ...absenceData,
      user_id: user.id,
      statut: 'DEMANDE',
    }

    const { data, error } = await supabase
      .from('absences')
      .insert([absenceToInsert])
      .select()
      .single()

    if (error) {
      logger.error('TEMPS_SERVICE', 'Erreur création absence', error)
      return { data: null, error }
    }

    logger.info('TEMPS_SERVICE', 'Absence créée avec succès', { id: data.id })
    return { data, error: null }
  },

  /**
   * Obtenir ou créer une feuille de temps
   */
  async getOrCreateFeuilleTemps(userId, mois, annee) {
    logger.debug('TEMPS_SERVICE', `getOrCreateFeuilleTemps appelé`, { userId, mois, annee })
    return tempsRepository.getOrCreateFeuilleTemps(userId, mois, annee)
  },

  /**
   * Regrouper temps travaillé dans une feuille de temps
   */
  async regrouperDansFeuilleTemps(userId, mois, annee) {
    logger.debug('TEMPS_SERVICE', `regrouperDansFeuilleTemps appelé`, { userId, mois, annee })

    try {
      // Obtenir ou créer la feuille de temps
      const { data: feuille, error: feuilleError } = await this.getOrCreateFeuilleTemps(
        userId,
        mois,
        annee
      )

      if (feuilleError) throw feuilleError

      // Obtenir le temps travaillé du mois
      const dateDebut = new Date(annee, mois - 1, 1).toISOString().split('T')[0]
      const dateFin = new Date(annee, mois, 0).toISOString().split('T')[0]

      const { data: tempsData, error: tempsError } = await this.getTempsByUser(userId, {
        dateDebut,
        dateFin,
      })

      if (tempsError) throw tempsError

      // Mettre à jour les entrées de temps avec la feuille de temps
      const tempsIds = (tempsData.entries || []).map((t) => t.id)

      if (tempsIds.length > 0) {
        const { error: updateError } = await supabase
          .from('temps_travail')
          .update({ feuille_temps_id: feuille.id })
          .in('id', tempsIds)

        if (updateError) throw updateError
      }

      logger.info('TEMPS_SERVICE', 'Temps regroupé dans feuille de temps', {
        feuilleId: feuille.id,
        nbEntries: tempsIds.length,
      })

      return { data: feuille, error: null }
    } catch (error) {
      logger.error('TEMPS_SERVICE', 'Erreur regrouperDansFeuilleTemps', error)
      return { data: null, error }
    }
  },
}

