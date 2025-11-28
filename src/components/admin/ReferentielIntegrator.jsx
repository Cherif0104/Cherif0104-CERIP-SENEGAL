import { useState, useEffect } from 'react'
import { referentielsService } from '../../services/referentiels.service'
import { REFERENTIEL_CATEGORIES } from '../../data/referentiels-categories'
import ReferentielSections from './ReferentielSections'
import './ReferentielSections.css'

/**
 * Composant générique pour intégrer automatiquement les référentiels
 * selon le contexte (programme/projet)
 * 
 * @param {string} entityType - Type d'entité: 'programme' | 'projet'
 * @param {string} entityId - ID de l'entité (optionnel)
 * @param {string} mode - Mode: 'edit' | 'view'
 */
export default function ReferentielIntegrator({
  entityType,
  entityId = null,
  mode = 'edit'
}) {
  const [referentielTypes, setReferentielTypes] = useState([])

  useEffect(() => {
    loadRelevantReferentiels()
  }, [entityType])

  const loadRelevantReferentiels = () => {
    const relevantTypes = []
    const entityTypeUpper = entityType.toUpperCase()

    // Parcourir toutes les catégories pour trouver les référentiels pertinents
    Object.values(REFERENTIEL_CATEGORIES).forEach(category => {
      category.types.forEach(type => {
        // Vérifier le contexte d'utilisation
        const contexte = type.contexte_utilisation || []
        
        // Vérifier si le type est applicable à cette entité
        const isApplicable = contexte.some(ctx => {
          // Correspondance exacte (ex: "PROGRAMME")
          if (ctx === entityTypeUpper) {
            return true
          }
          // Pattern avec wildcard (ex: "PROGRAMME_*")
          if (ctx.endsWith('_*')) {
            const prefix = ctx.slice(0, -2)
            if (prefix === entityTypeUpper) {
              return true
            }
          }
          return false
        })

        // Inclure les types de formulaires, diagnostics et recueils de besoins
        if (
          type.value.startsWith('FORMULAIRE_') ||
          type.value.startsWith('FICHE_DIAGNOSTIC_') ||
          type.value.startsWith('RECUEIL_BESOINS_') ||
          type.value.startsWith('QUESTIONNAIRE_') ||
          type.value.startsWith('QUIZ_')
        ) {
          // Si contexte_utilisation est défini, l'utiliser
          if (contexte.length > 0) {
            if (isApplicable) {
              relevantTypes.push(type.value)
            }
          } else {
            // Fallback : logique par défaut si contexte_utilisation n'est pas défini
            if (entityType === 'programme') {
              if (
                type.value.includes('PROGRAMME') ||
                type.value.startsWith('FICHE_DIAGNOSTIC_') ||
                type.value.startsWith('RECUEIL_BESOINS_')
              ) {
                relevantTypes.push(type.value)
              }
            } else if (entityType === 'projet') {
              if (
                type.value.includes('PROJET') ||
                type.value.startsWith('FICHE_DIAGNOSTIC_') ||
                type.value.startsWith('RECUEIL_BESOINS_')
              ) {
                relevantTypes.push(type.value)
              }
            }
          }
        }
      })
    })

    setReferentielTypes(relevantTypes)
  }

  if (referentielTypes.length === 0) {
    return null
  }

  return (
    <ReferentielSections
      entityType={entityType}
      entityId={entityId}
      referentielTypes={referentielTypes}
      mode={mode}
    />
  )
}

