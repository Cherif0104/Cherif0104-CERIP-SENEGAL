import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'

/**
 * Service Géographie - Gestion des données géographiques (régions, départements, communes, arrondissements)
 */
export const geographieService = {
  /**
   * Récupérer toutes les régions
   */
  async getRegions() {
    try {
      const { data, error } = await supabase
        .from('regions_senegal')
        .select('id, code, nom')
        .order('nom', { ascending: true })

      if (error) {
        logger.error('GEOGRAPHIE_SERVICE', 'Erreur getRegions', error)
        throw error
      }

      return {
        data: data?.map(r => ({ value: r.id, label: r.nom })) || [],
        error: null
      }
    } catch (error) {
      logger.error('GEOGRAPHIE_SERVICE', 'Erreur globale getRegions', error)
      return { data: [], error }
    }
  },

  /**
   * Récupérer les départements par région
   */
  async getDepartements(regionId = null) {
    try {
      let query = supabase
        .from('departements_senegal')
        .select('id, nom, region_id')
        .order('nom', { ascending: true })

      if (regionId) {
        query = query.eq('region_id', regionId)
      }

      const { data, error } = await query

      if (error) {
        logger.error('GEOGRAPHIE_SERVICE', 'Erreur getDepartements', error)
        throw error
      }

      return {
        data: data?.map(d => ({ value: d.id, label: d.nom, regionId: d.region_id })) || [],
        error: null
      }
    } catch (error) {
      logger.error('GEOGRAPHIE_SERVICE', 'Erreur globale getDepartements', error)
      return { data: [], error }
    }
  },

  /**
   * Récupérer les communes par département
   */
  async getCommunes(departementId = null) {
    try {
      let query = supabase
        .from('communes_senegal')
        .select('id, nom, departement_id')
        .order('nom', { ascending: true })

      if (departementId) {
        query = query.eq('departement_id', departementId)
      }

      const { data, error } = await query

      if (error) {
        logger.error('GEOGRAPHIE_SERVICE', 'Erreur getCommunes', error)
        throw error
      }

      return {
        data: data?.map(c => ({ value: c.id, label: c.nom, departementId: c.departement_id })) || [],
        error: null
      }
    } catch (error) {
      logger.error('GEOGRAPHIE_SERVICE', 'Erreur globale getCommunes', error)
      return { data: [], error }
    }
  },

  /**
   * Récupérer les arrondissements (si table existe)
   * Note: La table arrondissements_senegal peut ne pas exister encore
   */
  async getArrondissements(communeId = null) {
    try {
      // Vérifier si la table existe en essayant une requête simple
      let query = supabase
        .from('arrondissements_senegal')
        .select('id, nom, commune_id')
        .order('nom', { ascending: true })

      if (communeId) {
        query = query.eq('commune_id', communeId)
      }

      const { data, error } = await query

      if (error) {
        // Table n'existe peut-être pas encore, retourner vide
        if (error.code === '42P01') {
          logger.debug('GEOGRAPHIE_SERVICE', 'Table arrondissements_senegal n\'existe pas encore')
          return { data: [], error: null }
        }
        throw error
      }

      return {
        data: data?.map(a => ({ value: a.id, label: a.nom, communeId: a.commune_id })) || [],
        error: null
      }
    } catch (error) {
      logger.error('GEOGRAPHIE_SERVICE', 'Erreur globale getArrondissements', error)
      return { data: [], error: null } // Retourner vide sans erreur si table n'existe pas
    }
  },
}

