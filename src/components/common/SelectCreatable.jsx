import { useState, useEffect, useRef } from 'react'
import { Select } from './Select'
import { Button } from './Button'
import { Icon } from './Icon'
import { referentielsService } from '@/services/referentiels.service'
import { logger } from '@/utils/logger'
import './SelectCreatable.css'

/**
 * SelectCreatable - Composant Select avec possibilité d'ajouter de nouvelles valeurs
 * Système d'auto-apprentissage des référentiels
 */
export const SelectCreatable = ({
  label,
  referentielCode, // Code du référentiel (ex: 'types_programmes')
  options: externalOptions = [], // Options externes (si pas de référentiel)
  value,
  onChange,
  onCreateOption, // Callback après création
  allowCreate = true,
  showSuggestions = true,
  placeholder = 'Sélectionner ou créer...',
  className = '',
  error,
  required = false,
  ...props
}) => {
  const [options, setOptions] = useState(externalOptions)
  const [inputValue, setInputValue] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newValue, setNewValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const selectRef = useRef(null)

  // Charger les options depuis le référentiel si code fourni
  useEffect(() => {
    if (referentielCode && !externalOptions.length) {
      loadOptions()
    } else if (externalOptions.length) {
      setOptions(externalOptions)
    }
  }, [referentielCode, externalOptions])

  // Charger les valeurs depuis le référentiel
  const loadOptions = async () => {
    if (!referentielCode) return

    setLoading(true)
    try {
      const { data, error } = await referentielsService.getValeurs(referentielCode, {
        actif: true,
        orderBy: { column: 'ordre', ascending: true },
      })

      if (error) {
        logger.error('SELECTCREATABLE', `Erreur chargement options ${referentielCode}`, error)
      } else {
        const formattedOptions = (data || []).map((val) => ({
          value: val.valeur,
          label: val.valeur,
          description: val.description,
          usage_count: val.usage_count || 0,
        }))
        setOptions(formattedOptions)
      }
    } catch (err) {
      logger.error('SELECTCREATABLE', `Erreur inattendue chargement options`, err)
    } finally {
      setLoading(false)
    }
  }

  // Synchroniser value avec inputValue
  useEffect(() => {
    if (value !== undefined && value !== null) {
      const selectedOption = options.find((opt) => opt.value === value)
      if (selectedOption) {
        setInputValue(selectedOption.label)
      }
    }
  }, [value, options])

  // Créer une nouvelle valeur
  const handleCreate = async () => {
    if (!newValue.trim()) {
      return
    }

    setCreating(true)
    try {
      let result

      if (referentielCode) {
        // Ajouter au référentiel
        result = await referentielsService.ajouterValeur(referentielCode, newValue.trim())
      } else {
        // Si pas de référentiel, juste créer l'option localement
        const newOption = { value: newValue.trim(), label: newValue.trim() }
        setOptions((prev) => [...prev, newOption])
        result = { data: newOption, error: null }
      }

      if (result.error) {
        logger.error('SELECTCREATABLE', 'Erreur création valeur', result.error)
        return
      }

      // Ajouter à la liste des options
      const newOption = {
        value: result.data.valeur || result.data.value,
        label: result.data.valeur || result.data.label,
        description: result.data.description,
      }

      setOptions((prev) => [...prev, newOption])

      // Sélectionner automatiquement la nouvelle valeur
      onChange({ target: { value: newOption.value } })

      // Callback
      onCreateOption?.(newOption.value)

      // Fermer le modal
      setShowCreateModal(false)
      setNewValue('')
      setInputValue('')

      logger.info('SELECTCREATABLE', `Valeur créée: ${newOption.value}`)
    } catch (err) {
      logger.error('SELECTCREATABLE', 'Erreur inattendue création valeur', err)
    } finally {
      setCreating(false)
    }
  }

  // Ouvrir modal de création
  const handleOpenCreateModal = () => {
    setNewValue(inputValue || '')
    setShowCreateModal(true)
  }

  return (
    <div className={`select-creatable-wrapper ${className}`}>
      <Select
        ref={selectRef}
        label={label}
        value={value}
        onChange={(e) => {
          setInputValue(e.target.value)
          onChange?.(e)
        }}
        options={options}
        placeholder={placeholder}
        error={error}
        required={required}
        {...props}
      />

      {/* Bouton "Autre" toujours visible pour créer une nouvelle valeur */}
      {allowCreate && (
        <div className="select-creatable-actions">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setNewValue('')
              setShowCreateModal(true)
            }}
            className="select-creatable-autre-btn"
          >
            <Icon name="Plus" size={16} />
            Autre...
          </Button>
          {inputValue && !options.find((opt) => opt.value.toLowerCase() === inputValue.toLowerCase()) && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleOpenCreateModal}
              className="select-creatable-btn"
            >
              <Icon name="Plus" size={16} />
              Créer "{inputValue}"
            </Button>
          )}
        </div>
      )}

      {/* Modal de création */}
      {showCreateModal && (
        <div className="select-creatable-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="select-creatable-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Créer une nouvelle valeur</h3>
            <p className="select-creatable-modal-description">
              {referentielCode 
                ? `Ajouter une nouvelle valeur au référentiel "${referentielCode}"` 
                : 'Créer une nouvelle option'}
            </p>
            <div className="select-creatable-modal-input-wrapper">
              <input
                type="text"
                className="select-creatable-modal-input"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Saisir la nouvelle valeur..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newValue.trim()) {
                    e.preventDefault()
                    handleCreate()
                  } else if (e.key === 'Escape') {
                    setShowCreateModal(false)
                  }
                }}
              />
            </div>
            <div className="select-creatable-modal-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowCreateModal(false)
                  setNewValue('')
                }}
                disabled={creating}
              >
                Annuler
              </Button>
              <Button 
                type="button" 
                variant="primary" 
                onClick={handleCreate} 
                loading={creating}
                disabled={!newValue.trim()}
              >
                <Icon name="Plus" size={16} />
                Créer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

SelectCreatable.displayName = 'SelectCreatable'

