// Utilitaires pour le calcul de scores des dossiers

export const scoringUtils = {
  /**
   * Calcule le score d'un dossier basé sur les réponses du questionnaire
   * @param {Object} questionnaireResponses - Réponses du questionnaire
   * @param {Object} criteresProgramme - Critères d'éligibilité du programme
   * @returns {number} Score entre 0 et 100
   */
  calculateScore(questionnaireResponses, criteresProgramme = {}) {
    if (!questionnaireResponses || typeof questionnaireResponses !== 'object') {
      return 0
    }

    let score = 0
    let maxScore = 0

    // Section A: Informations générales (20 points)
    maxScore += 20
    if (questionnaireResponses.A6 && Array.isArray(questionnaireResponses.A6)) {
      if (questionnaireResponses.A6.includes('ninea')) score += 5
      if (questionnaireResponses.A6.includes('rccm')) score += 5
      if (questionnaireResponses.A6.includes('recepisse')) score += 3
      if (questionnaireResponses.A6.includes('manuel')) score += 2
    }
    if (questionnaireResponses.A5) {
      if (['universitaire', 'secondaire'].includes(questionnaireResponses.A5)) score += 5
    }

    // Section B: Gouvernance (25 points)
    maxScore += 25
    if (questionnaireResponses.B1 === 'oui') score += 5
    if (questionnaireResponses.B2 === 'documente') score += 5
    if (questionnaireResponses.B5 && ['systematiquement', 'partiellement'].includes(questionnaireResponses.B5)) {
      score += 5
    }
    if (questionnaireResponses.B6 === 'oui') score += 5
    if (questionnaireResponses.B8 && Array.isArray(questionnaireResponses.B8) && questionnaireResponses.B8.length > 0) {
      score += 5
    }

    // Section C: Gestion financière (25 points)
    maxScore += 25
    if (questionnaireResponses.C1 === 'oui') score += 10
    if (questionnaireResponses.C4 === 'oui') score += 5
    if (questionnaireResponses.C6 && ['systematiques', 'informelles'].includes(questionnaireResponses.C6)) {
      score += 5
    }
    if (questionnaireResponses.C7 && ['preparé', 'déposé'].includes(questionnaireResponses.C7)) {
      score += 5
    }

    // Section D: Commercialisation (15 points)
    maxScore += 15
    if (questionnaireResponses.D1 === 'oui') score += 5
    if (questionnaireResponses.D4 && ['site', 'boutique'].includes(questionnaireResponses.D4)) {
      score += 5
    }
    if (questionnaireResponses.D5 === 'oui') score += 5

    // Section E: Ressources humaines (10 points)
    maxScore += 10
    if (questionnaireResponses.E1 === 'oui') score += 5
    if (questionnaireResponses.E2 === 'oui') score += 5

    // Section F: Pratiques environnementales (5 points)
    maxScore += 5
    if (questionnaireResponses.F1 === 'oui') score += 5

    // Normaliser le score sur 100
    const normalizedScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0

    // Appliquer les critères du programme si disponibles
    if (criteresProgramme.scoreMinimum && normalizedScore < criteresProgramme.scoreMinimum) {
      return normalizedScore // Score insuffisant
    }

    return normalizedScore
  },

  /**
   * Détermine la recommandation basée sur le score
   * @param {number} score - Score du dossier
   * @returns {Object} Recommandation avec label et couleur
   */
  getRecommendation(score) {
    if (score >= 80) {
      return {
        label: 'Excellente candidature',
        color: '#22c55e',
        decision: 'ACCEPTE'
      }
    } else if (score >= 60) {
      return {
        label: 'Bonne candidature',
        color: '#14b8a6',
        decision: 'ACCEPTE'
      }
    } else if (score >= 40) {
      return {
        label: 'Candidature à améliorer',
        color: '#f59e0b',
        decision: 'EN_EVALUATION'
      }
    } else {
      return {
        label: 'Candidature insuffisante',
        color: '#ef4444',
        decision: 'REFUSE'
      }
    }
  }
}

