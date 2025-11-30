import { BaseRepository } from './BaseRepository'

/**
 * CompetenceRepository - Repository spécialisé pour les compétences
 */
export class CompetenceRepository extends BaseRepository {
  constructor() {
    super('competences', {
      enabled: true,
      ttl: 300000,
      level: 'memory',
    })
  }

  /**
   * Récupérer les compétences par catégorie
   */
  async findByCategorie(categorie, options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        categorie,
      },
    })
  }

  /**
   * Récupérer les compétences d'un employé
   */
  async findByEmploye(employeId) {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('employes_competences')
        .select(
          `
          *,
          competence:competence_id(*)
        `
        )
        .eq('employe_id', employeId)
        .order('niveau', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Ajouter une compétence à un employé
   */
  async addToEmploye(employeId, competenceId, niveau, notes = null, evaluePar = null) {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('employes_competences')
        .insert({
          employe_id: employeId,
          competence_id: competenceId,
          niveau,
          notes,
          evalue_par: evaluePar,
          date_evaluation: new Date().toISOString().split('T')[0],
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Mettre à jour le niveau d'une compétence d'un employé
   */
  async updateEmployeCompetence(id, niveau, notes = null) {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('employes_competences')
        .update({
          niveau,
          notes,
          date_evaluation: new Date().toISOString().split('T')[0],
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}

// Instance singleton
export const competenceRepository = new CompetenceRepository()
export default competenceRepository

