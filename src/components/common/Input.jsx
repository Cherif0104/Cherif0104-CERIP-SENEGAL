import { forwardRef } from 'react'
import './Input.css'

export const Input = forwardRef(({
  label,
  error,
  helperText,
  required = false,
  className = '',
  isTextArea = false,
  rows = 4,
  ...props
}, ref) => {
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`
  const classes = [
    'input-wrapper',
    error ? 'input-error' : '',
    className
  ].filter(Boolean).join(' ')

  const InputComponent = isTextArea ? 'textarea' : 'input'
  const inputProps = isTextArea ? { rows, ...props } : props

  return (
    <div className={classes}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <InputComponent
        id={inputId}
        ref={ref}
        className="input-field"
        {...inputProps}
      />
      {error && (
        <span className="input-error-message">{error}</span>
      )}
      {helperText && !error && (
        <span className="input-helper">{helperText}</span>
      )}
    </div>
  )
})

Input.displayName = 'Input'

