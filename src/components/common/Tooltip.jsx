import { useState, useRef, useEffect } from 'react'
import { Icon } from './Icon'
import './Tooltip.css'

/**
 * Tooltip - Composant pour afficher des conseils et informations utiles
 */
export function Tooltip({ 
  content, 
  position = 'top', 
  children,
  className = '',
  showIcon = true,
  iconName = 'Info',
  iconSize = 16,
}) {
  const [isVisible, setIsVisible] = useState(false)
  const tooltipRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setIsVisible(false)
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible])

  if (!content) return children || null

  return (
    <div className={`tooltip-wrapper ${className}`} ref={tooltipRef}>
      {children}
      <button
        type="button"
        className="tooltip-trigger"
        onClick={() => setIsVisible(!isVisible)}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        aria-label="Afficher l'aide"
      >
        {showIcon && <Icon name={iconName} size={iconSize} />}
      </button>
      {isVisible && (
        <div className={`tooltip-content tooltip-${position}`}>
          <div className="tooltip-arrow" />
          <div className="tooltip-inner">
            {content}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * TipBox - Composant pour afficher des conseils dans les formulaires
 */
export function TipBox({ 
  title, 
  content, 
  type = 'info', // info, warning, success, error
  icon,
  className = '',
  onClose,
  closable = true,
}) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  const icons = {
    info: 'Info',
    warning: 'AlertTriangle',
    success: 'CheckCircle',
    error: 'AlertCircle',
  }

  return (
    <div className={`tip-box tip-box-${type} ${className}`}>
      <div className="tip-box-content">
        {icon || <Icon name={icons[type] || 'Info'} size={20} />}
        <div className="tip-box-text">
          {title && <div className="tip-box-title">{title}</div>}
          <div className="tip-box-description">{content}</div>
        </div>
      </div>
      {closable && (
        <button
          type="button"
          className="tip-box-close"
          onClick={handleClose}
          aria-label="Fermer"
        >
          <Icon name="X" size={16} />
        </button>
      )}
    </div>
  )
}

