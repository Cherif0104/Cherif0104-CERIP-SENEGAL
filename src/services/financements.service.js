import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'

/**
 * Service Financements - Gestion des financements
 */
export const financementsService = {
  /**
   * Récupérer tous les financements
   */
  async getAll(options = {}) {
    try {
      logger.debug('FINANCEMENTS_SERVICE', 'getAll appelé', { options })
      let query = supabase
        .from('financements')
        .select('*')
        .order('created_at', { ascending: false })

      if (options.programme_id) {
        query = query.eq('programme_id', options.programme_id)
      }

      if (options.projet_id) {
        query = query.eq('projet_id', options.projet_id)
      }

      const { data: financements, error } = await query

      if (error) {
        logger.error('FINANCEMENTS_SERVICE', 'Erreur getAll', error)
        throw error
      }

      // Charger les relations séparément
      if (financements && financements.length > 0) {
        const bailleurIds = [...new Set(financements.map(f => f.bailleur_id).filter(Boolean))]
        const programmeIds = [...new Set(financements.map(f => f.programme_id).filter(Boolean))]
        const projetIds = [...new Set(financements.map(f => f.projet_id).filter(Boolean))]

        // Essayer d'abord financeurs, puis bailleurs si nécessaire
        let financeursResult = { data: [] }
        if (bailleurIds.length > 0) {
          try {
            financeursResult = await supabase.from('financeurs').select('id, nom, type').in('id', bailleurIds)
            if (financeursResult.error) {
              // Si erreur, essayer bailleurs
              financeursResult = await supabase.from('bailleurs').select('id, nom, type').in('id', bailleurIds)
            }
          } catch (e) {
            // Si financeurs n'existe pas, essayer bailleurs
            financeursResult = await supabase.from('bailleurs').select('id, nom, type').in('id', bailleurIds)
          }
        }

        const [programmesResult, projetsResult] = await Promise.all([
          programmeIds.length > 0 ? supabase.from('programmes').select('id, nom').in('id', programmeIds) : { data: [] },
          projetIds.length > 0 ? supabase.from('projets').select('id, nom').in('id', projetIds) : { data: [] },
        ])

        const financeursMap = new Map((financeursResult.data || []).map(f => [f.id, f]))
        const programmesMap = new Map((programmesResult.data || []).map(p => [p.id, p]))
        const projetsMap = new Map((projetsResult.data || []).map(p => [p.id, p]))

        // Joindre les données
        const enriched = financements.map(f => ({
          ...f,
          financeurs: f.bailleur_id ? financeursMap.get(f.bailleur_id) : null,
          programmes: f.programme_id ? programmesMap.get(f.programme_id) : null,
          projets: f.projet_id ? projetsMap.get(f.projet_id) : null,
        }))

        return { data: enriched, error: null }
      }

      return { data: financements || [], error: null }
    } catch (error) {
      logger.error('FINANCEMENTS_SERVICE', 'Erreur globale getAll', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer un financement par ID
   */
  async getById(id) {
    try {
      logger.debug('FINANCEMENTS_SERVICE', 'getById appelé', { id })
      const { data: financement, error } = await supabase
        .from('financements')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        logger.error('FINANCEMENTS_SERVICE', 'Erreur getById', { id, error })
        throw error
      }

      if (!financement) {
        return { data: null, error: null }
      }

      // Charger les relations - Essayer financeurs puis bailleurs
      let financeurResult = { data: null }
      if (financement.bailleur_id) {
        try {
          financeurResult = await supabase.from('financeurs').select('*').eq('id', financement.bailleur_id).single()
          if (financeurResult.error) {
            financeurResult = await supabase.from('bailleurs').select('*').eq('id', financement.bailleur_id).single()
          }
        } catch (e) {
          financeurResult = await supabase.from('bailleurs').select('*').eq('id', financement.bailleur_id).single()
        }
      }

      const [programmeResult, projetResult] = await Promise.all([
        financement.programme_id ? supabase.from('programmes').select('*').eq('id', financement.programme_id).single() : { data: null },
        financement.projet_id ? supabase.from('projets').select('*').eq('id', financement.projet_id).single() : { data: null },
      ])

      const enriched = {
        ...financement,
        financeurs: financeurResult.data || null,
        programmes: programmeResult.data || null,
        projets: projetResult.data || null,
      }

      return { data: enriched, error: null }
    } catch (error) {
      logger.error('FINANCEMENTS_SERVICE', 'Erreur globale getById', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Récupérer les financements d'un programme
   */
  async getByProgramme(programmeId) {
    return await this.getAll({ programme_id: programmeId })
  },

  /**
   * Créer un financement
   */
  async create(financementData) {
    try {
      logger.debug('FINANCEMENTS_SERVICE', 'create appelé', { data: financementData })
      const { data, error } = await supabase
        .from('financements')
        .insert(financementData)
        .select()
        .single()

      if (error) {
        logger.error('FINANCEMENTS_SERVICE', 'Erreur create', error)
        throw error
      }

      logger.info('FINANCEMENTS_SERVICE', 'Financement créé avec succès', { id: data?.id })
      return { data, error: null }
    } catch (error) {
      logger.error('FINANCEMENTS_SERVICE', 'Erreur globale create', error)
      return { data: null, error }
    }
  },

  /**
   * Mettre à jour un financement
   */
  async update(id, financementData) {
    try {
      logger.debug('FINANCEMENTS_SERVICE', 'update appelé', { id, data: financementData })
      const { data, error } = await supabase
        .from('financements')
        .update(financementData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logger.error('FINANCEMENTS_SERVICE', 'Erreur update', { id, error })
        throw error
      }

      logger.info('FINANCEMENTS_SERVICE', 'Financement mis à jour avec succès', { id })
      return { data, error: null }
    } catch (error) {
      logger.error('FINANCEMENTS_SERVICE', 'Erreur globale update', { id, error })
      return { data: null, error }
    }
  },

  /**
   * Supprimer un financement
   */
  async delete(id) {
    try {
      logger.debug('FINANCEMENTS_SERVICE', 'delete appelé', { id })
      const { error } = await supabase
        .from('financements')
        .delete()
        .eq('id', id)

      if (error) {
        logger.error('FINANCEMENTS_SERVICE', 'Erreur delete', { id, error })
        throw error
      }

      logger.info('FINANCEMENTS_SERVICE', 'Financement supprimé avec succès', { id })
      return { data: { message: 'Financement supprimé avec succès' }, error: null }
    } catch (error) {
      logger.error('FINANCEMENTS_SERVICE', 'Erreur globale delete', { id, error })
      return { data: null, error }
    }
  },
}

