import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import '../../styles/cta.css'
import './CTABanner.css'

/**
 * Composant CTA Banner réutilisable
 * Affiche une section d'appel à l'action avec titre, description et boutons
 * 
 * @param {string} title - Titre principal du CTA
 * @param {string} description - Description optionnelle
 * @param {string} primaryLabel - Label du bouton principal (défaut: "Commencer maintenant")
 * @param {string} secondaryLabel - Label du bouton secondaire (défaut: "Se connecter")
 * @param {string} primaryLink - Lien du bouton principal (défaut: "/register")
 * @param {string} secondaryLink - Lien du bouton secondaire (défaut: "/login")
 * @param {string} variant - Variante du banner: "default" | "compact" | "hero" | "gradient"
 * @param {boolean} showSecondary - Afficher le bouton secondaire (défaut: true)
 */
export default function CTABanner({ 
  title, 
  description, 
  primaryLabel = "Commencer maintenant",
  secondaryLabel = "Se connecter",
  primaryLink = "/register",
  secondaryLink = "/login",
  variant = "default",
  showSecondary = true
}) {
  return (
    <section className={`cta-banner cta-banner--${variant}`}>
      <div className="cta-banner__content">
        {title && <h2 className="cta-banner__title">{title}</h2>}
        {description && <p className="cta-banner__description">{description}</p>}
        <div className="cta-banner__actions">
          <Link to={primaryLink} className="cta cta-primary cta-large">
            {primaryLabel}
            <ArrowRight size={20} />
          </Link>
          {showSecondary && (
            <Link to={secondaryLink} className="cta cta-secondary">
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}

