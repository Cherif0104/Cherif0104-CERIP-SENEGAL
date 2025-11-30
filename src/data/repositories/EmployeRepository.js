import { BaseRepository } from './BaseRepository'
import { logger } from '@/utils/logger'

/**
 * EmployeRepository - Repository spécialisé pour les employés
 */
export class EmployeRepository extends BaseRepository {
  constructor() {
    super('employes', {
      enabled: true,
      ttl: 300000, // 5 minutes
      level: 'memory',
    })
  }

  /**
   * Récupérer les employés actifs
   */
  async findActifs(options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        statut: 'ACTIF',
      },
    })
  }

  /**
   * Récupérer les employés par poste
   */
  async findByPoste(posteId, options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        poste_id: posteId,
      },
    })
  }

  /**
   * Récupérer les employés par manager
   */
  async findByManager(managerId, options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        manager_id: managerId,
      },
    })
  }

  /**
   * Récupérer un employé avec toutes ses relations
   */
  async findByIdWithRelations(id) {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          poste:poste_id(*),
          manager:manager_id(id, nom, prenom, email, matricule),
          user:user_id(id, email, role),
          projet:projet_id(id, nom, titre),
          programme:programme_id(id, nom, titre),
          employes_competences(
            *,
            competence:competence_id(*)
          ),
          evaluations(*)
        `
        )
        .eq('id', id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      logger.error('EMPLOYE_REPOSITORY', 'Erreur findByIdWithRelations', { id, error })
      return { data: null, error }
    }
  }

  /**
   * Récupérer les employés par statut
   */
  async findByStatut(statut, options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        statut,
      },
    })
  }

  /**
   * Récupérer les employés par type
   */
  async findByType(type, options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        type_employe: type,
      },
    })
  }

  /**
   * Récupérer les employés par type de contrat
   */
  async findByTypeContrat(typeContrat, options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        type_contrat: typeContrat,
      },
    })
  }

  /**
   * Récupérer les prestataires
   */
  async findPrestataires(options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        est_prestataire: true,
      },
    })
  }

  /**
   * Récupérer les employés liés à un projet
   */
  async findByProjet(projetId, options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        projet_id: projetId,
      },
    })
  }

  /**
   * Récupérer les employés liés à un programme
   */
  async findByProgramme(programmeId, options = {}) {
    return await this.findAll({
      ...options,
      filters: {
        ...options.filters,
        programme_id: programmeId,
      },
    })
  }
}

// Instance singleton
export const employeRepository = new EmployeRepository()
export default employeRepository

