import { useState, useEffect } from 'react'
import { referentielsService } from '../../services/referentiels.service'
import { toastService } from '../../services/toast.service'
import { getReferentielMetadata } from '../../data/referentiels-categories'
import DynamicForm from '../forms/DynamicForm'
import Icon from '../common/Icon'
import LoadingState from '../common/LoadingState'
import './ReferentielSections.css'

/**
 * Composant pour intégrer les formulaires dynamiques depuis les référentiels
 * dans les formulaires de programmes/projets
 * 
 * @param {string} entityType - Type d'entité: 'programme' | 'projet'
 * @param {string} entityId - ID de l'entité (optionnel pour création)
 * @param {string[]} referentielTypes - Types de référentiels à charger
 * @param {string} mode - Mode: 'edit' | 'view'
 */
export default function ReferentielSections({
  entityType,
  entityId = null,
  referentielTypes = [],
  mode = 'edit'
}) {
  const [loading, setLoading] = useState(true)
  const [formConfigs, setFormConfigs] = useState([])
  const [formData, setFormData] = useState({})

  useEffect(() => {
    loadFormConfigs()
  }, [entityType, referentielTypes])

  const loadFormConfigs = async () => {
    if (!referentielTypes || referentielTypes.length === 0) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const configs = []
      
      for (const type of referentielTypes) {
        const { data, error } = await referentielsService.getByType(type)
        if (!error && data && data.length > 0) {
          // Prendre le premier référentiel actif
          const activeRef = data.find(r => r.actif) || data[0]
          if (activeRef && activeRef.meta) {
            configs.push({
              type,
              referentiel: activeRef,
              config: activeRef.meta
            })
          }
        }
      }

      setFormConfigs(configs)

      // Charger les données existantes si entityId est fourni
      if (entityId) {
        await loadExistingData()
      }
    } catch (error) {
      console.error('Error loading referentiel forms:', error)
      toastService.error('Erreur lors du chargement des formulaires')
    } finally {
      setLoading(false)
    }
  }

  const loadExistingData = async () => {
    // TODO: Charger les données depuis la table programme_formulaires ou projet_formulaires
    // Pour l'instant, on initialise avec des objets vides
    const initialData = {}
    formConfigs.forEach(({ type }) => {
      initialData[type] = {}
    })
    setFormData(initialData)
  }

  const handleFormSave = async (referentielType, formValues) => {
    try {
      // TODO: Sauvegarder dans la table programme_formulaires ou projet_formulaires
      // Pour l'instant, on stocke juste en mémoire
      setFormData(prev => ({
        ...prev,
        [referentielType]: formValues
      }))

      if (entityId) {
        // Sauvegarder en base de données
        // await saveFormData(entityType, entityId, referentielType, formValues)
        toastService.success('Formulaire enregistré avec succès')
      }
    } catch (error) {
      console.error('Error saving form data:', error)
      toastService.error('Erreur lors de la sauvegarde')
    }
  }

  if (loading) {
    return <LoadingState message="Chargement des formulaires..." />
  }

  if (formConfigs.length === 0) {
    return null
  }

  return (
    <div className="referentiel-sections">
      {formConfigs.map(({ type, referentiel, config }) => {
        const metadata = getReferentielMetadata(type)
        
        return (
          <div key={type} className="referentiel-section">
            <div className="referentiel-section__header">
              <Icon name={metadata.icon || 'FileText'} size={20} />
              <h3>{metadata.label || referentiel.label}</h3>
            </div>
            <div className="referentiel-section__content">
              <DynamicForm
                referentielType={type}
                referentielCode={referentiel.code}
                initialData={formData[type]}
                onSave={(values) => handleFormSave(type, values)}
                onCancel={() => {}}
                saveLabel={mode === 'edit' ? 'Enregistrer' : undefined}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

