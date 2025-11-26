import { useState, useRef, useEffect } from 'react'
import Icon from './Icon'
import { referentielsService } from '../../services/referentiels.service'
import { toastService } from '../../services/toast.service'
import './ComboboxWithCreate.css'

export default function ComboboxWithCreate({
  label,
  name,
  value,
  onChange,
  options = [],
  typeReferentiel,
  placeholder = 'Tapez pour rechercher ou créer...',
  required = false,
  multiple = false
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const inputRef = useRef(null)
  const wrapperRef = useRef(null)

  const filtered = options.filter(opt =>
    (opt.label || opt.code || '').toLowerCase().includes(search.toLowerCase())
  )

  const exactMatch = filtered.find(opt => 
    (opt.label || opt.code || '').toLowerCase() === search.toLowerCase()
  )

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearch('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (option) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : []
      const newValues = currentValues.includes(option.label)
        ? currentValues.filter(v => v !== option.label)
        : [...currentValues, option.label]
      onChange({ target: { name, value: newValues } })
    } else {
      onChange({ target: { name, value: option.label || option.code } })
      setIsOpen(false)
      setSearch('')
    }
  }

  const handleCreate = async () => {
    if (!search.trim() || exactMatch) return

    try {
      const { error } = await referentielsService.create({
        type: typeReferentiel,
        code: search.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, ''),
        label: search.trim(),
        actif: true,
        ordre: (options.length + 1) * 10
      })

      if (error) {
        toastService.error('Erreur lors de la création')
        console.error(error)
      } else {
        toastService.success('Valeur ajoutée avec succès')
        if (multiple) {
          const currentValues = Array.isArray(value) ? value : []
          onChange({ target: { name, value: [...currentValues, search.trim()] } })
        } else {
          onChange({ target: { name, value: search.trim() } })
        }
        setSearch('')
        setIsOpen(false)
      }
    } catch (error) {
      console.error('Error creating referentiel:', error)
      toastService.error('Erreur lors de la création')
    }
  }

  const handleRemove = (itemToRemove) => {
    if (multiple && Array.isArray(value)) {
      onChange({ target: { name, value: value.filter(v => v !== itemToRemove) } })
    }
  }

  return (
    <div className="combobox-with-create" ref={wrapperRef}>
      <label htmlFor={name}>
        {label} {required && <span className="required">*</span>}
      </label>
      
      <div className="combobox-input-wrapper">
        {multiple && Array.isArray(value) && value.length > 0 && (
          <div className="combobox-tags">
            {value.map((tag, idx) => (
              <span key={idx} className="combobox-tag">
                {tag}
                <button
                  type="button"
                  className="combobox-tag-remove"
                  onClick={() => handleRemove(tag)}
                >
                  <Icon name="X" size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
        
        <input
          ref={inputRef}
          type="text"
          id={name}
          value={search || (!multiple ? (value || '') : '')}
          onChange={(e) => {
            setSearch(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="input"
          required={required && (!multiple ? !value : (!Array.isArray(value) || value.length === 0))}
        />
        
        {isOpen && (
          <div className="combobox-dropdown">
            {filtered.length > 0 ? (
              <>
                {filtered.map(opt => {
                  const isSelected = multiple
                    ? Array.isArray(value) && value.includes(opt.label || opt.code)
                    : value === (opt.label || opt.code)
                  
                  return (
                    <div
                      key={opt.code || opt.id}
                      className={`combobox-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelect(opt)}
                    >
                      {multiple && (
                        <Icon 
                          name={isSelected ? "CheckSquare" : "Square"} 
                          size={14} 
                        />
                      )}
                      {opt.label || opt.code}
                    </div>
                  )
                })}
                {search && !exactMatch && (
                  <div className="combobox-create" onClick={handleCreate}>
                    <Icon name="Plus" size={14} />
                    Créer "{search}"
                  </div>
                )}
              </>
            ) : (
              search && (
                <div className="combobox-create" onClick={handleCreate}>
                  <Icon name="Plus" size={14} />
                  Créer "{search}"
                </div>
              )
            )}
            {filtered.length === 0 && !search && (
              <div className="combobox-empty">Aucune option disponible</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

