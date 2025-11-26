import { useState, useEffect } from 'react'
import { projetsService } from '../../services/projets.service'
import Icon from './Icon'
import './ProjetSelector.css'

export default function ProjetSelector({ open, onSelect, onCancel }) {
  const [projets, setProjets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (open) {
      loadProjets()
    }
  }, [open])

  const loadProjets = async () => {
    setLoading(true)
    try {
      const { data } = await projetsService.getAll()
      setProjets(data || [])
    } catch (error) {
      console.error('Error loading projets:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjets = projets.filter(p =>
    p.nom?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  )

  if (!open) return null

  return (
    <div className="projet-selector-backdrop" onClick={onCancel}>
      <div className="projet-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="projet-selector-header">
          <h2>Sélectionner un projet</h2>
          <button className="btn-close" onClick={onCancel}>
            <Icon name="X" size={20} />
          </button>
        </div>
        <div className="projet-selector-search">
          <Icon name="Search" size={18} />
          <input
            type="text"
            placeholder="Rechercher un projet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="projet-selector-list">
          {loading ? (
            <div className="projet-selector-loading">Chargement...</div>
          ) : filteredProjets.length === 0 ? (
            <div className="projet-selector-empty">Aucun projet trouvé</div>
          ) : (
            filteredProjets.map(projet => (
              <div
                key={projet.id}
                className="projet-selector-item"
                onClick={() => onSelect(projet.id, projet.nom)}
              >
                <div className="projet-selector-item-content">
                  <h3>{projet.nom}</h3>
                  {projet.description && (
                    <p>{projet.description.substring(0, 100)}...</p>
                  )}
                </div>
                <Icon name="ChevronRight" size={20} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}


