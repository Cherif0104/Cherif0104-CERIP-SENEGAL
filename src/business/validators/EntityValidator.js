import { businessRulesEngine } from '../rules/BusinessRulesEngine'
import { logger } from '@/utils/logger'

/**
 * Validateur d'entités avec validation multi-niveaux
 * Valide côté client avant envoi au serveur
 */
export class EntityValidator {
  /**
   * Valider une entité
   * @param {string} entityType - Type d'entité (programme, projet, etc.)
   * @param {Object} data - Données à valider
   * @param {string} action - Action (CREATE, UPDATE, DELETE)
   * @param {Object} context - Contexte additionnel
   * @returns {Object} { valid: boolean, errors: Array, warnings: Array }
   */
  static validate(entityType, data, action = 'CREATE', context = {}) {
    logger.debug('ENTITY_VALIDATOR', `Validation ${entityType}`, { action, context })

    // Validation règles métier
    const rulesValidation = businessRulesEngine.validate(entityType, data, action, context)

    // Validation basique (champs requis, types, formats)
    const basicValidation = EntityValidator.validateBasic(data, entityType)

    // Combiner les erreurs
    const allErrors = [...rulesValidation.errors, ...basicValidation.errors]
    const allWarnings = [...basicValidation.warnings]

    const result = {
      valid: rulesValidation.valid && basicValidation.valid,
      errors: allErrors,
      warnings: allWarnings,
      entityType,
      action,
    }

    if (result.valid) {
      logger.debug('ENTITY_VALIDATOR', `Validation ${entityType} réussie`)
    } else {
      logger.warn('ENTITY_VALIDATOR', `Validation ${entityType} échouée`, {
        errorsCount: allErrors.length,
        errors: allErrors,
      })
    }

    return result
  }

  /**
   * Validation basique (champs requis, types, formats)
   * @param {Object} data - Données
   * @param {string} entityType - Type d'entité
   * @returns {Object} { valid: boolean, errors: Array, warnings: Array }
   */
  static validateBasic(data, entityType) {
    const errors = []
    const warnings = []

    // Validation selon le type d'entité
    switch (entityType) {
      case 'programme':
        EntityValidator.validateProgramme(data, errors, warnings)
        break
      case 'projet':
        EntityValidator.validateProjet(data, errors, warnings)
        break
      case 'candidat':
        EntityValidator.validateCandidat(data, errors, warnings)
        break
      case 'beneficiaire':
        EntityValidator.validateBeneficiaire(data, errors, warnings)
        break
      default:
        warnings.push({
          message: `Type d'entité ${entityType} non reconnu, validation basique uniquement`,
        })
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Valider un programme
   */
  static validateProgramme(data, errors, warnings) {
    if (!data.nom || data.nom.trim().length === 0) {
      errors.push({ field: 'nom', message: 'Le nom est requis' })
    }

    if (data.email && !EntityValidator.isValidEmail(data.email)) {
      errors.push({ field: 'email', message: "L'email n'est pas valide" })
    }

    if (data.budget !== undefined && isNaN(data.budget)) {
      errors.push({ field: 'budget', message: 'Le budget doit être un nombre' })
    }
  }

  /**
   * Valider un projet
   */
  static validateProjet(data, errors, warnings) {
    if (!data.nom || data.nom.trim().length === 0) {
      errors.push({ field: 'nom', message: 'Le nom est requis' })
    }

    if (!data.programme_id) {
      errors.push({ field: 'programme_id', message: 'Le programme est requis' })
    }

    if (data.date_debut && data.date_fin) {
      if (new Date(data.date_debut) > new Date(data.date_fin)) {
        errors.push({
          field: 'date_fin',
          message: 'La date de fin doit être postérieure à la date de début',
        })
      }
    }

    if (data.budget !== undefined && isNaN(data.budget)) {
      errors.push({ field: 'budget', message: 'Le budget doit être un nombre' })
    }
  }

  /**
   * Valider un candidat
   */
  static validateCandidat(data, errors, warnings) {
    if (!data.appel_id) {
      errors.push({ field: 'appel_id', message: "L'appel à candidatures est requis" })
    }

    if (!data.personne_id) {
      errors.push({ field: 'personne_id', message: 'La personne est requise' })
    }
  }

  /**
   * Valider un bénéficiaire
   */
  static validateBeneficiaire(data, errors, warnings) {
    if (!data.candidat_id) {
      errors.push({ field: 'candidat_id', message: 'Le candidat est requis' })
    }

    if (!data.projet_id) {
      errors.push({ field: 'projet_id', message: 'Le projet est requis' })
    }
  }

  /**
   * Valider un email
   */
  static isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  /**
   * Valider un nombre positif
   */
  static isPositiveNumber(value) {
    const num = Number(value)
    return !isNaN(num) && num >= 0
  }

  /**
   * Valider une date
   */
  static isValidDate(dateString) {
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date)
  }
}

export default EntityValidator

