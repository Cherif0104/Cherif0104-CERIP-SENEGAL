import { forwardRef } from 'react'
import './Select.css'

export const Select = forwardRef(({
  label,
  error,
  helperText,
  required = false,
  options = [],
  placeholder = 'Sélectionner...',
  className = '',
  ...props
}, ref) => {
  const selectId = props.id || `select-${Math.random().toString(36).substr(2, 9)}`
  const classes = [
    'select-wrapper',
    error ? 'select-error' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      {label && (
        <label htmlFor={selectId} className="select-label">
          {label}
          {required && <span className="select-required">*</span>}
        </label>
      )}
      <select
        id={selectId}
        ref={ref}
        className="select-field"
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="select-error-message">{error}</span>
      )}
      {helperText && !error && (
        <span className="select-helper">{helperText}</span>
      )}
    </div>
  )
})

Select.displayName = 'Select'

