import { referentielRepository } from '@/data/repositories/ReferentielRepository'
import { logger } from '@/utils/logger'

/**
 * Service pour la gestion des référentiels dynamiques
 * Système d'auto-apprentissage des valeurs
 */
export const referentielsService = {
  /**
   * Obtenir toutes les valeurs d'un référentiel
   * @param {string} referentielCode - Code du référentiel
   * @param {Object} options - Options (actif, orderBy)
   */
  async getValeurs(referentielCode, options = {}) {
    logger.debug('REFERENTIELS_SERVICE', `getValeurs appelé pour ${referentielCode}`, options)
    return referentielRepository.getValeurs(referentielCode, options)
  },

  /**
   * Ajouter une nouvelle valeur à un référentiel
   * @param {string} referentielCode - Code du référentiel
   * @param {string|Object} valeur - Valeur à ajouter (string ou objet avec plus de détails)
   */
  async ajouterValeur(referentielCode, valeur) {
    logger.debug('REFERENTIELS_SERVICE', `ajouterValeur appelé pour ${referentielCode}`, { valeur })

    // Normaliser la valeur
    const valeurData = typeof valeur === 'string' ? { valeur } : valeur

    const { data, error, alreadyExists } = await referentielRepository.ajouterValeur(
      referentielCode,
      valeurData
    )

    if (error) {
      logger.error('REFERENTIELS_SERVICE', `Erreur ajout valeur à ${referentielCode}`, error)
      return { data: null, error, alreadyExists: false }
    }

    logger.info('REFERENTIELS_SERVICE', `Valeur ajoutée à ${referentielCode}`, {
      valeur: data.valeur,
      alreadyExists,
    })

    // Incrémenter usage si déjà existant
    if (alreadyExists && data.id) {
      await referentielRepository.incrementUsage(data.id)
    }

    return { data, error: null, alreadyExists }
  },

  /**
   * Obtenir les suggestions (valeurs les plus utilisées)
   * @param {string} referentielCode - Code du référentiel
   * @param {number} limit - Nombre de suggestions
   */
  async getSuggestions(referentielCode, limit = 5) {
    logger.debug('REFERENTIELS_SERVICE', `getSuggestions appelé pour ${referentielCode}`, { limit })
    return referentielRepository.getSuggestions(referentielCode, limit)
  },

  /**
   * Rechercher une valeur
   * @param {string} referentielCode - Code du référentiel
   * @param {string} searchTerm - Terme de recherche
   */
  async searchValeur(referentielCode, searchTerm) {
    logger.debug('REFERENTIELS_SERVICE', `searchValeur appelé pour ${referentielCode}`, { searchTerm })
    return referentielRepository.searchValeur(referentielCode, searchTerm)
  },

  /**
   * Incrémenter l'utilisation d'une valeur
   * @param {string} valeurId - ID de la valeur
   */
  async incrementUsage(valeurId) {
    logger.debug('REFERENTIELS_SERVICE', `incrementUsage appelé`, { valeurId })
    await referentielRepository.incrementUsage(valeurId)
  },

  /**
   * Désactiver une valeur
   * @param {string} valeurId - ID de la valeur
   */
  async desactiverValeur(valeurId) {
    logger.debug('REFERENTIELS_SERVICE', `desactiverValeur appelé`, { valeurId })
    const { data, error } = await referentielRepository.update(valeurId, { actif: false })
    return { data, error }
  },

  /**
   * Activer une valeur
   * @param {string} valeurId - ID de la valeur
   */
  async activerValeur(valeurId) {
    logger.debug('REFERENTIELS_SERVICE', `activerValeur appelé`, { valeurId })
    const { data, error } = await referentielRepository.update(valeurId, { actif: true })
    return { data, error }
  },
}

