import { logger } from '@/utils/logger'

/**
 * Business Rules Engine - Moteur de règles métier centralisé
 * Conforme aux standards ERP modernes (SAP/Salesforce)
 */
class BusinessRulesEngine {
  constructor() {
    this.rules = new Map()
    this.loadDefaultRules()
  }

  /**
   * Charger les règles métier par défaut
   */
  loadDefaultRules() {
    // Règles pour Programmes
    this.registerRules('programme', [
      {
        id: 'PROG-001',
        name: 'Budget positif',
        validate: (data) => {
          if (data.budget !== undefined && data.budget !== null) {
            return data.budget >= 0
          }
          return true
        },
        message: 'Le budget doit être positif ou nul',
      },
      {
        id: 'PROG-002',
        name: 'Dates cohérentes',
        validate: (data) => {
          if (data.date_debut && data.date_fin) {
            return new Date(data.date_debut) <= new Date(data.date_fin)
          }
          return true
        },
        message: 'La date de fin doit être postérieure à la date de début',
      },
      {
        id: 'PROG-003',
        name: 'Statut requis',
        validate: (data) => {
          const validStatuts = [
            'BROUILLON',
            'PLANIFIÉ',
            'OUVERT',
            'EN_COURS',
            'FERMÉ',
            'ARCHIVÉ',
            'EN_PREPARATION',
            'ACTIF',
            'TERMINE',
            'SUSPENDU',
          ]
          return !data.statut || validStatuts.includes(data.statut)
        },
        message: 'Le statut doit être valide',
      },
      {
        id: 'PROG-004',
        name: 'Nom requis',
        validate: (data) => {
          return data.nom && data.nom.trim().length > 0
        },
        message: 'Le nom du programme est requis',
      },
    ])

    // Règles pour Projets
    this.registerRules('projet', [
      {
        id: 'PRJ-001',
        name: 'Budget positif',
        validate: (data) => {
          if (data.budget !== undefined && data.budget !== null) {
            return data.budget >= 0
          }
          return true
        },
        message: 'Le budget doit être positif ou nul',
      },
      {
        id: 'PRJ-002',
        name: 'Dates cohérentes',
        validate: (data) => {
          if (data.date_debut && data.date_fin) {
            return new Date(data.date_debut) <= new Date(data.date_fin)
          }
          return true
        },
        message: 'La date de fin doit être postérieure à la date de début',
      },
      {
        id: 'PRJ-003',
        name: 'Programme requis',
        validate: (data) => {
          return data.programme_id && data.programme_id.trim().length > 0
        },
        message: 'Le projet doit être lié à un programme',
      },
      {
        id: 'PRJ-004',
        name: 'Transitions de statut valides',
        validate: (data, context = {}) => {
          // Valider les transitions de statut
          const validTransitions = {
            PLANIFIE: ['EN_COURS', 'ANNULE'],
            EN_COURS: ['TERMINE', 'ANNULE'],
            TERMINE: [], // Statut final
            ANNULE: [], // Statut final
          }

          if (context.oldStatut && data.statut) {
            const allowedStatuts = validTransitions[context.oldStatut] || []
            return allowedStatuts.includes(data.statut)
          }
          return true
        },
        message: 'Transition de statut non autorisée',
      },
    ])

    // Règles pour Candidatures
    this.registerRules('candidat', [
      {
        id: 'CAN-001',
        name: 'Appel requis',
        validate: (data) => {
          return data.appel_id && data.appel_id.trim().length > 0
        },
        message: 'Le candidat doit être lié à un appel à candidatures',
      },
      {
        id: 'CAN-002',
        name: 'Personne requise',
        validate: (data) => {
          return data.personne_id && data.personne_id.trim().length > 0
        },
        message: 'Le candidat doit être lié à une personne',
      },
    ])

    // Règles pour Bénéficiaires
    this.registerRules('beneficiaire', [
      {
        id: 'BEN-001',
        name: 'Candidat requis',
        validate: (data) => {
          return data.candidat_id && data.candidat_id.trim().length > 0
        },
        message: 'Le bénéficiaire doit être lié à un candidat',
      },
      {
        id: 'BEN-002',
        name: 'Projet requis',
        validate: (data) => {
          return data.projet_id && data.projet_id.trim().length > 0
        },
        message: 'Le bénéficiaire doit être lié à un projet',
      },
    ])
  }

  /**
   * Enregistrer des règles pour une entité
   * @param {string} entityType - Type d'entité (programme, projet, etc.)
   * @param {Array} rules - Array de règles
   */
  registerRules(entityType, rules) {
    if (!this.rules.has(entityType)) {
      this.rules.set(entityType, [])
    }
    this.rules.get(entityType).push(...rules)
    logger.debug('BUSINESS_RULES', `Règles enregistrées pour ${entityType}`, {
      count: rules.length,
    })
  }

  /**
   * Valider une entité selon toutes ses règles
   * @param {string} entityType - Type d'entité
   * @param {Object} data - Données à valider
   * @param {string} action - Action (CREATE, UPDATE, DELETE)
   * @param {Object} context - Contexte additionnel (ex: oldStatut)
   * @returns {Object} { valid: boolean, errors: Array }
   */
  validate(entityType, data, action = 'CREATE', context = {}) {
    const entityRules = this.rules.get(entityType) || []
    const errors = []

    logger.debug('BUSINESS_RULES', `Validation ${entityType}`, {
      action,
      context,
      rulesCount: entityRules.length,
    })

    entityRules.forEach((rule) => {
      try {
        const isValid = rule.validate(data, context)
        if (!isValid) {
          errors.push({
            ruleId: rule.id,
            ruleName: rule.name,
            message: rule.message || `Règle ${rule.id} non respectée`,
          })
        }
      } catch (error) {
        logger.error('BUSINESS_RULES', `Erreur validation règle ${rule.id}`, error)
        errors.push({
          ruleId: rule.id,
          ruleName: rule.name,
          message: `Erreur lors de la validation : ${error.message}`,
        })
      }
    })

    const result = {
      valid: errors.length === 0,
      errors,
      entityType,
      action,
    }

    if (result.valid) {
      logger.debug('BUSINESS_RULES', `Validation ${entityType} réussie`)
    } else {
      logger.warn('BUSINESS_RULES', `Validation ${entityType} échouée`, {
        errorsCount: errors.length,
        errors,
      })
    }

    return result
  }

  /**
   * Exécuter des règles automatiques (calculs, transformations)
   * @param {string} entityType - Type d'entité
   * @param {Object} data - Données
   * @param {string} action - Action
   * @returns {Object} Données transformées
   */
  executeRules(entityType, data, action = 'CREATE') {
    const entityRules = this.rules.get(entityType) || []
    let transformedData = { ...data }

    entityRules.forEach((rule) => {
      if (rule.execute) {
        try {
          transformedData = rule.execute(transformedData, action) || transformedData
        } catch (error) {
          logger.error('BUSINESS_RULES', `Erreur exécution règle ${rule.id}`, error)
        }
      }
    })

    return transformedData
  }

  /**
   * Obtenir toutes les règles d'une entité
   * @param {string} entityType - Type d'entité
   * @returns {Array} Règles
   */
  getRules(entityType) {
    return this.rules.get(entityType) || []
  }

  /**
   * Obtenir une règle spécifique
   * @param {string} entityType - Type d'entité
   * @param {string} ruleId - ID de la règle
   * @returns {Object|null} Règle ou null
   */
  getRule(entityType, ruleId) {
    const entityRules = this.rules.get(entityType) || []
    return entityRules.find((r) => r.id === ruleId) || null
  }
}

// Instance singleton
export const businessRulesEngine = new BusinessRulesEngine()
export default businessRulesEngine

