import { BaseRepository } from './BaseRepository'
import { logger } from '@/utils/logger'

/**
 * ConfigurationRepository - Repository spécialisé pour la configuration système
 */
export class ConfigurationRepository extends BaseRepository {
  constructor() {
    super('configuration', {
      enabled: true,
      ttl: 600000, // 10 minutes (configuration change rarement)
      level: 'memory',
    })
  }

  /**
   * Récupérer une configuration par clé
   */
  async findByCle(cle) {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('cle', cle)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
      return { data, error: error && error.code === 'PGRST116' ? null : error }
    } catch (error) {
      logger.error('CONFIGURATION_REPOSITORY', 'Erreur findByCle', { cle, error })
      return { data: null, error }
    }
  }

  /**
   * Récupérer toutes les configurations par catégorie
   */
  async findByCategorie(categorie) {
    return await this.findAll({
      filters: { categorie },
    })
  }

  /**
   * Mettre à jour ou créer une configuration
   */
  async upsert(cle, valeur, type, categorie, description = null) {
    try {
      const { supabase } = await import('@/lib/supabase')
      
      // Vérifier si existe
      const { data: existing } = await this.findByCle(cle)
      
      // Convertir la valeur en JSON string si nécessaire
      let valeurJson = valeur
      if (typeof valeur !== 'string') {
        valeurJson = JSON.stringify(valeur)
      } else if (valeur !== null && valeur !== 'null') {
        // Si c'est déjà une string, vérifier si c'est du JSON valide
        try {
          JSON.parse(valeur)
          valeurJson = valeur // C'est déjà du JSON valide
        } catch {
          valeurJson = JSON.stringify(valeur) // Convertir en JSON
        }
      }

      const configData = {
        cle,
        valeur: valeurJson,
        type: type || 'string',
        categorie: categorie || 'general',
        description,
        updated_at: new Date().toISOString(),
      }

      let result
      if (existing?.data) {
        // Mise à jour
        const { data, error } = await supabase
          .from(this.tableName)
          .update(configData)
          .eq('cle', cle)
          .select()
          .single()
        result = { data, error }
      } else {
        // Création
        const { data, error } = await supabase
          .from(this.tableName)
          .insert(configData)
          .select()
          .single()
        result = { data, error }
      }

      if (result.error) throw result.error

      // Invalider le cache
      this.cacheManager.invalidate(`configuration:findByCle:${cle}`)
      this.cacheManager.invalidate('configuration:findAll')

      return result
    } catch (error) {
      logger.error('CONFIGURATION_REPOSITORY', 'Erreur upsert', { cle, error })
      return { data: null, error }
    }
  }

  /**
   * Récupérer toutes les configurations comme un objet clé-valeur
   */
  async getAllAsObject() {
    try {
      const { data, error } = await this.findAll()
      if (error) throw error

      const configObj = {}
      if (data) {
        data.forEach((item) => {
          try {
            configObj[item.cle] = JSON.parse(item.valeur)
          } catch {
            configObj[item.cle] = item.valeur
          }
        })
      }

      return { data: configObj, error: null }
    } catch (error) {
      logger.error('CONFIGURATION_REPOSITORY', 'Erreur getAllAsObject', error)
      return { data: null, error }
    }
  }
}

// Instance singleton
export const configurationRepository = new ConfigurationRepository()
export default configurationRepository

