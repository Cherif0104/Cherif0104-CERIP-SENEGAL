import { useState } from 'react'
import Icon from './Icon'
import { referentielsService } from '../../services/referentiels.service'
import { toastService } from '../../services/toast.service'
import './SelectWithCreate.css'

const OTHER_VALUE = '__OTHER__'

export default function SelectWithCreate({
  label,
  name,
  value,
  onChange,
  options = [],
  typeReferentiel, // ex: 'REGION', 'SECTEUR_ACTIVITE'
  placeholder = 'Sélectionner ou créer...',
  required = false,
  className = 'input',
  multiple = false,
  showOtherOption = true
}) {
  const [isCreating, setIsCreating] = useState(false)
  const [newValue, setNewValue] = useState('')

  const handleCreate = async () => {
    const labelToCreate = newValue.trim()
    if (!labelToCreate) return

    try {
      const { data, error } = await referentielsService.create({
        type: typeReferentiel,
        code: labelToCreate.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, ''),
        label: labelToCreate,
        actif: true,
        ordre: (options.length + 1) * 10
      })

      if (error) {
        console.error('Erreur Supabase referentiels.create:', error)
        toastService.error(error.message || 'Erreur lors de la création')
      } else {
        toastService.success('Valeur ajoutée avec succès')
        const createdLabel = data?.label || labelToCreate
        const syntheticEvent = {
          target: {
            name,
            value: multiple
              ? [...(Array.isArray(value) ? value : []), createdLabel]
              : createdLabel
          }
        }
        onChange(syntheticEvent)
        setIsCreating(false)
        setNewValue('')
      }
    } catch (error) {
      console.error('Error creating referentiel:', error)
      toastService.error('Erreur lors de la création')
    }
  }

  const handleSelectChange = (e) => {
    const selected = e.target.value
    if (!multiple && showOtherOption && selected === OTHER_VALUE) {
      setIsCreating(true)
      setNewValue('')
      return
    }
    onChange(e)
  }

  return (
    <div className="select-with-create">
      <div className="select-with-create-header">
        <label htmlFor={name}>
          {label} {required && <span className="required">*</span>}
        </label>
        {!isCreating && (
          <button
            type="button"
            className="btn-icon-small"
            onClick={() => setIsCreating(true)}
            title="Ajouter une nouvelle valeur"
          >
            <Icon name="Plus" size={14} />
          </button>
        )}
      </div>

      {isCreating ? (
        <div className="select-with-create-input">
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleCreate()
              } else if (e.key === 'Escape') {
                setIsCreating(false)
                setNewValue('')
              }
            }}
            placeholder="Nom de la nouvelle valeur"
            className={className}
            autoFocus
          />
          <div className="select-with-create-actions">
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={handleCreate}
            >
              <Icon name="Check" size={14} />
              Ajouter
            </button>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => {
                setIsCreating(false)
                setNewValue('')
              }}
            >
              <Icon name="X" size={14} />
              Annuler
            </button>
          </div>
        </div>
      ) : (
        multiple ? (
          <select
            id={name}
            name={name}
            multiple
            value={Array.isArray(value) ? value : []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, opt => opt.value)
              onChange({ target: { name, value: selected } })
            }}
            required={required}
            className={className}
            size={Math.min(5, options.length + 1)}
          >
            {options.map(opt => (
              <option key={opt.code || opt.id} value={opt.label || opt.code}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <select
            id={name}
            name={name}
            value={value || ''}
            onChange={handleSelectChange}
            required={required}
            className={className}
          >
            <option value="">{placeholder}</option>
            {options.map(opt => (
              <option key={opt.code || opt.id} value={opt.label || opt.code}>
                {opt.label}
              </option>
            ))}
            {showOtherOption && (
              <option value={OTHER_VALUE}>Autre…</option>
            )}
          </select>
        )
      )}
    </div>
  )
}

