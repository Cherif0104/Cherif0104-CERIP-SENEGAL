import { BaseRepository } from './BaseRepository'
import { logger } from '@/utils/logger'
import { supabase } from '@/lib/supabase'

/**
 * ReferentielRepository - Repository pour les référentiels dynamiques
 * Système d'auto-apprentissage des valeurs
 */
export class ReferentielRepository extends BaseRepository {
  constructor() {
    super('valeurs_referentiels', {
      enabled: true,
      ttl: 600000, // 10 minutes (référentiels changent peu souvent)
      level: 'memory',
    })
  }

  /**
   * Récupérer toutes les valeurs d'un référentiel
   * @param {string} referentielCode - Code du référentiel (ex: 'types_programmes')
   * @param {Object} options - Options (actif, orderBy)
   */
  async getValeurs(referentielCode, options = {}) {
    try {
      const { actif = true, orderBy = { column: 'ordre', ascending: true } } = options

      logger.debug('REFERENTIEL_REPOSITORY', `Récupération valeurs pour ${referentielCode}`, {
        actif,
        orderBy,
      })

      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('referentiel_code', referentielCode)

      if (actif) {
        query = query.eq('actif', true)
      }

      query = query.order(orderBy.column, { ascending: orderBy.ascending })

      const { data, error } = await query

      if (error) {
        logger.error('REFERENTIEL_REPOSITORY', `Erreur récupération valeurs ${referentielCode}`, error)
        throw error
      }

      logger.debug('REFERENTIEL_REPOSITORY', `Valeurs récupérées pour ${referentielCode}`, {
        count: data?.length || 0,
      })

      return { data: data || [], error: null }
    } catch (error) {
      logger.error('REFERENTIEL_REPOSITORY', `Erreur globale getValeurs ${referentielCode}`, error)
      return { data: null, error }
    }
  }

  /**
   * Ajouter une nouvelle valeur à un référentiel
   * @param {string} referentielCode - Code du référentiel
   * @param {Object} valeurData - Données de la valeur
   */
  async ajouterValeur(referentielCode, valeurData) {
    try {
      logger.debug('REFERENTIEL_REPOSITORY', `Ajout valeur à ${referentielCode}`, valeurData)

      // Récupérer l'utilisateur actuel
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const valeurToInsert = {
        referentiel_code: referentielCode,
        valeur: valeurData.valeur || valeurData, // Si string, convertir en objet
        code: valeurData.code || null,
        description: valeurData.description || null,
        ordre: valeurData.ordre || 0,
        actif: valeurData.actif !== undefined ? valeurData.actif : true,
        parent_id: valeurData.parent_id || null,
        created_by: user?.id || null,
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([valeurToInsert])
        .select()
        .single()

      if (error) {
        // Si c'est une violation unique, la valeur existe déjà
        if (error.code === '23505') {
          logger.warn('REFERENTIEL_REPOSITORY', `Valeur déjà existante: ${valeurToInsert.valeur}`)
          // Récupérer la valeur existante
          const { data: existing } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('referentiel_code', referentielCode)
            .eq('valeur', valeurToInsert.valeur)
            .single()

          // Incrémenter usage_count
          if (existing) {
            await this.incrementUsage(existing.id)
            return { data: existing, error: null, alreadyExists: true }
          }
        }
        logger.error('REFERENTIEL_REPOSITORY', `Erreur ajout valeur à ${referentielCode}`, error)
        throw error
      }

      logger.info('REFERENTIEL_REPOSITORY', `Valeur ajoutée à ${referentielCode}`, {
        valeur: data.valeur,
        id: data.id,
      })

      // Invalider le cache
      await this.invalidateCache()

      return { data, error: null, alreadyExists: false }
    } catch (error) {
      logger.error('REFERENTIEL_REPOSITORY', `Erreur globale ajouterValeur ${referentielCode}`, error)
      return { data: null, error }
    }
  }

  /**
   * Incrémenter le compteur d'utilisation d'une valeur
   * @param {string} valeurId - ID de la valeur
   */
  async incrementUsage(valeurId) {
    try {
      const { data, error } = await supabase.rpc('increment_referentiel_usage_count', {
        valeur_id: valeurId,
      })

      if (error) {
        // Si la fonction n'existe pas, utiliser une update classique
        const { data: current } = await this.findById(valeurId)
        if (current?.data) {
          const { error: updateError } = await supabase
            .from(this.tableName)
            .update({ usage_count: (current.data.usage_count || 0) + 1 })
            .eq('id', valeurId)

          if (updateError) {
            logger.error('REFERENTIEL_REPOSITORY', 'Erreur incrément usage', updateError)
          }
        }
      }

      // Invalider le cache
      await this.invalidateCache()
    } catch (error) {
      logger.warn('REFERENTIEL_REPOSITORY', 'Erreur incrementUsage', error)
    }
  }

  /**
   * Obtenir les valeurs les plus utilisées (pour suggestions)
   * @param {string} referentielCode - Code du référentiel
   * @param {number} limit - Nombre de suggestions
   */
  async getSuggestions(referentielCode, limit = 5) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('referentiel_code', referentielCode)
        .eq('actif', true)
        .order('usage_count', { ascending: false })
        .limit(limit)

      if (error) {
        logger.error('REFERENTIEL_REPOSITORY', `Erreur récupération suggestions ${referentielCode}`, error)
        throw error
      }

      return { data: data || [], error: null }
    } catch (error) {
      logger.error('REFERENTIEL_REPOSITORY', `Erreur globale getSuggestions ${referentielCode}`, error)
      return { data: null, error }
    }
  }

  /**
   * Rechercher une valeur dans un référentiel
   * @param {string} referentielCode - Code du référentiel
   * @param {string} searchTerm - Terme de recherche
   */
  async searchValeur(referentielCode, searchTerm) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('referentiel_code', referentielCode)
        .eq('actif', true)
        .ilike('valeur', `%${searchTerm}%`)
        .order('usage_count', { ascending: false })

      if (error) {
        logger.error('REFERENTIEL_REPOSITORY', `Erreur recherche ${referentielCode}`, error)
        throw error
      }

      return { data: data || [], error: null }
    } catch (error) {
      logger.error('REFERENTIEL_REPOSITORY', `Erreur globale searchValeur ${referentielCode}`, error)
      return { data: null, error }
    }
  }
}

export const referentielRepository = new ReferentielRepository()
export default referentielRepository

