// Utilitaires pour vérifier l'éligibilité aux programmes

export const eligibilityUtils = {
  /**
   * Vérifie si un bénéficiaire est éligible à un programme
   * @param {Object} beneficiaire - Données du bénéficiaire
   * @param {Object} programme - Programme avec critères d'éligibilité
   * @param {Object} questionnaireResponses - Réponses du questionnaire (optionnel)
   * @returns {Object} { eligible: boolean, reasons: string[] }
   */
  checkEligibility(beneficiaire, programme, questionnaireResponses = {}) {
    const reasons = []
    let eligible = true

    const criteres = programme.criteres_eligibilite || {}

    // Vérifier les régions cibles
    if (programme.regions_cibles && programme.regions_cibles.length > 0) {
      if (!programme.regions_cibles.includes(beneficiaire.region_id)) {
        eligible = false
        reasons.push('Région non éligible')
      }
    }

    // Vérifier le secteur d'activité
    if (criteres.secteurs && criteres.secteurs.length > 0) {
      if (!criteres.secteurs.includes(beneficiaire.secteur)) {
        eligible = false
        reasons.push('Secteur d\'activité non éligible')
      }
    }

    // Vérifier la formalisation
    if (criteres.formalisation_requise) {
      const hasNINEA = beneficiaire.ninea && beneficiaire.ninea.trim() !== ''
      const hasRCCM = beneficiaire.rccm && beneficiaire.rccm.trim() !== ''
      
      if (!hasNINEA && !hasRCCM) {
        eligible = false
        reasons.push('Formalisation requise (NINEA ou RCCM)')
      }
    }

    // Vérifier le nombre d'employés minimum
    if (criteres.nombre_employes_min) {
      if ((beneficiaire.nombre_employes || 0) < criteres.nombre_employes_min) {
        eligible = false
        reasons.push(`Nombre d'employés insuffisant (minimum: ${criteres.nombre_employes_min})`)
      }
    }

    // Vérifier le chiffre d'affaires minimum
    if (criteres.chiffre_affaires_min) {
      if ((beneficiaire.chiffre_affaires || 0) < criteres.chiffre_affaires_min) {
        eligible = false
        reasons.push(`Chiffre d'affaires insuffisant`)
      }
    }

    // Vérifier le score minimum du questionnaire
    if (criteres.score_minimum && questionnaireResponses) {
      // Le score sera calculé lors de l'évaluation du dossier
      // On ne peut pas le vérifier ici sans le calcul
    }

    // Vérifier le genre (si spécifié)
    if (criteres.genre_requis) {
      // À vérifier depuis le questionnaire ou les métadonnées
      // Pour l'instant, on suppose que c'est vérifié ailleurs
    }

    return {
      eligible,
      reasons: eligible ? ['Éligible'] : reasons
    }
  },

  /**
   * Filtre les programmes éligibles pour un bénéficiaire
   * @param {Array} programmes - Liste des programmes
   * @param {Object} beneficiaire - Données du bénéficiaire
   * @param {Object} questionnaireResponses - Réponses du questionnaire
   * @returns {Array} Programmes éligibles
   */
  filterEligibleProgrammes(programmes, beneficiaire, questionnaireResponses = {}) {
    return programmes.filter(programme => {
      // Vérifier que le programme est ouvert
      if (!['OUVERT', 'EN_COURS'].includes(programme.statut)) {
        return false
      }

      // Vérifier les dates
      const today = new Date()
      const dateDebut = new Date(programme.date_debut)
      const dateFin = new Date(programme.date_fin)

      if (today < dateDebut || today > dateFin) {
        return false
      }

      // Vérifier l'éligibilité
      const { eligible } = this.checkEligibility(beneficiaire, programme, questionnaireResponses)
      return eligible
    })
  }
}

