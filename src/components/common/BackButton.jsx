import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import './BackButton.css'

/**
 * Composant bouton retour réutilisable
 * 
 * @param {string} to - Route de destination (optionnel, par défaut retour navigateur)
 * @param {string} label - Label du bouton (défaut: "Retour")
 * @param {string} variant - Variante: "default" | "ghost" | "text"
 * @param {function} onClick - Fonction onClick personnalisée (optionnel)
 */
export default function BackButton({ 
  to = null, 
  label = "Retour",
  variant = "default",
  onClick = null
}) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (to) {
      navigate(to)
    } else {
      navigate(-1) // Retour navigateur
    }
  }

  return (
    <button 
      className={`back-button back-button--${variant}`}
      onClick={handleClick}
      aria-label={label}
    >
      <ArrowLeft size={18} />
      <span>{label}</span>
    </button>
  )
}

