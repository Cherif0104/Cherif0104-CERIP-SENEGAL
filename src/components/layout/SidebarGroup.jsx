import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Icon from '../common/Icon'
import './Sidebar.css'

export default function SidebarGroup({ title, icon, items, defaultOpen = false, storageKey }) {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(defaultOpen)

  // Vérifier si un item du groupe est actif
  const hasActiveItem = items.some(item => location.pathname === item.path)

  // Auto-ouvrir si un item est actif
  useEffect(() => {
    if (hasActiveItem) {
      setIsOpen(true)
    }
  }, [hasActiveItem])

  // Charger l'état depuis localStorage au montage
  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(`sidebar_group_${storageKey}`)
      if (saved !== null) {
        setIsOpen(saved === 'true')
      } else if (hasActiveItem) {
        setIsOpen(true)
      }
    } else if (hasActiveItem) {
      setIsOpen(true)
    }
  }, [storageKey, hasActiveItem])

  // Sauvegarder l'état dans localStorage
  const toggleOpen = () => {
    const newState = !isOpen
    setIsOpen(newState)
    if (storageKey) {
      localStorage.setItem(`sidebar_group_${storageKey}`, newState.toString())
    }
  }

  return (
    <div className={`sidebar-group ${isOpen ? 'sidebar-group--open' : ''} ${hasActiveItem ? 'sidebar-group--active' : ''}`}>
      <button
        className="sidebar-group__header"
        onClick={toggleOpen}
        type="button"
      >
        <div className="sidebar-group__header-content">
          <Icon name={icon} size={20} />
          <span className="sidebar-group__title">{title}</span>
        </div>
        <Icon 
          name="▼" 
          size={16} 
          className={`sidebar-group__chevron ${isOpen ? 'sidebar-group__chevron--open' : ''}`}
        />
      </button>

      <div className={`sidebar-group__content ${isOpen ? 'sidebar-group__content--open' : ''}`}>
        {items.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-group__item ${isActive ? 'sidebar-group__item--active' : ''}`}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
              {isActive && <div className="sidebar-group__item-indicator" />}
            </Link>
          )
        })}
      </div>
    </div>
  )
}




