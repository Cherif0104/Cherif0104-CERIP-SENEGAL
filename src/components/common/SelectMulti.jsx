import { useState } from 'react'
import { Icon } from './Icon'
import './SelectMulti.css'

/**
 * SelectMulti - Composant pour sélection multiple avec tags
 */
export const SelectMulti = ({
  label,
  options = [],
  value = [],
  onChange,
  placeholder = 'Sélectionner...',
  required = false,
  error,
  className = '',
  maxSelections,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOptions = options.filter(opt =>
    opt.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opt.value?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedValues = Array.isArray(value) ? value : []
  
  const selectedOptions = options.filter(opt => 
    selectedValues.includes(opt.value)
  )

  const availableOptions = filteredOptions.filter(opt => 
    !selectedValues.includes(opt.value)
  )

  const handleToggleOption = (optionValue) => {
    if (selectedValues.includes(optionValue)) {
      // Désélectionner
      const newValues = selectedValues.filter(v => v !== optionValue)
      onChange?.(newValues)
    } else {
      // Sélectionner
      if (maxSelections && selectedValues.length >= maxSelections) {
        return
      }
      const newValues = [...selectedValues, optionValue]
      onChange?.(newValues)
    }
  }

  const handleRemove = (valueToRemove) => {
    const newValues = selectedValues.filter(v => v !== valueToRemove)
    onChange?.(newValues)
  }

  const selectId = `select-multi-${Math.random().toString(36).substr(2, 9)}`
  const classes = [
    'select-multi-wrapper',
    error ? 'select-multi-error' : '',
    isOpen ? 'select-multi-open' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      {label && (
        <label htmlFor={selectId} className="select-multi-label">
          {label}
          {required && <span className="select-multi-required">*</span>}
        </label>
      )}

      <div 
        className="select-multi-field"
        onClick={() => setIsOpen(!isOpen)}
        {...props}
      >
        <div className="select-multi-selected">
          {selectedOptions.length === 0 ? (
            <span className="select-multi-placeholder">{placeholder}</span>
          ) : (
            <div className="select-multi-tags">
              {selectedOptions.map(option => (
                <span key={option.value} className="select-multi-tag">
                  {option.label}
                  <button
                    type="button"
                    className="select-multi-tag-remove"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemove(option.value)
                    }}
                  >
                    <Icon name="X" size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <Icon 
          name={isOpen ? 'ChevronUp' : 'ChevronDown'} 
          size={20} 
          className="select-multi-icon"
        />
      </div>

      {isOpen && (
        <div className="select-multi-dropdown">
          {options.length > 5 && (
            <div className="select-multi-search">
              <Icon name="Search" size={16} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="select-multi-search-input"
              />
            </div>
          )}
          <div className="select-multi-options">
            {availableOptions.length === 0 ? (
              <div className="select-multi-empty">
                {searchTerm ? 'Aucun résultat' : 'Aucune option disponible'}
              </div>
            ) : (
              availableOptions.map(option => (
                <div
                  key={option.value}
                  className="select-multi-option"
                  onClick={() => {
                    handleToggleOption(option.value)
                    setSearchTerm('')
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    readOnly
                    className="select-multi-checkbox"
                  />
                  <span>{option.label}</span>
                </div>
              ))
            )}
          </div>
          {maxSelections && (
            <div className="select-multi-footer">
              {selectedValues.length}/{maxSelections} sélectionnés
            </div>
          )}
        </div>
      )}

      {error && (
        <span className="select-multi-error-message">{error}</span>
      )}

      {/* Overlay pour fermer le dropdown */}
      {isOpen && (
        <div 
          className="select-multi-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

