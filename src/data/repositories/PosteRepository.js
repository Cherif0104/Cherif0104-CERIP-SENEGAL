import { BaseRepository } from './BaseRepository'

/**
 * PosteRepository - Repository spécialisé pour les postes
 */
export class PosteRepository extends BaseRepository {
  constructor() {
    super('postes', {
      enabled: true,
      ttl: 300000,
      level: 'memory',
    })
  }

  /**
   * Récupérer les postes ouverts
   */
  async findOuverts(options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        statut: 'OUVERT',
        actif: true,
      },
    })
  }

  /**
   * Récupérer les postes par département
   */
  async findByDepartement(departement, options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        departement,
      },
    })
  }

  /**
   * Récupérer un poste avec le nombre d'employés
   */
  async findByIdWithCount(id) {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data: poste, error: posteError } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (posteError) throw posteError

      const { count, error: countError } = await supabase
        .from('employes')
        .select('*', { count: 'exact', head: true })
        .eq('poste_id', id)
        .eq('statut', 'ACTIF')

      if (countError) throw countError

      return {
        data: {
          ...poste,
          nombre_employes: count || 0,
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  }
}

// Instance singleton
export const posteRepository = new PosteRepository()
export default posteRepository

