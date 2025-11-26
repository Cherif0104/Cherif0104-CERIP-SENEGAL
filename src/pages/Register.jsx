import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import './Register.css'

const CONTACT_EMAIL = 'contact@serip-cas.sn'

const ACCOUNT_TYPES = [
  {
    id: 'ADMIN_SERIP',
    title: 'Espace SERIP-CAS',
    description: 'Accès réservé aux équipes internes. Contactez-nous pour une demande d\'activation.',
    icon: '🏢',
    color: '#be123c'
  }
]

export default function Register() {
  const [selectedType, setSelectedType] = useState(null)

  const handleSelectType = (type) => {
    setSelectedType(type)
    setTimeout(() => {
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=Demande%20d'accès%20à%20l'ERP%20SERIP-CAS`
    }, 200)
  }

  return (
    <div className="register-container auth-page">
      {/* Background decorative elements */}
      <div className="register-background">
        <div className="bg-shape bg-shape-1"></div>
        <div className="bg-shape bg-shape-2"></div>
        <div className="bg-shape bg-shape-3"></div>
      </div>
      
      {/* Bouton retour */}
      <BackButton to="/" label="Retour à l'accueil" variant="ghost" />
      
      <div className="register-wrapper">
        <div className="register-card">
          <div className="register-header">
            <div className="register-logo">
              <div className="logo-wrapper">
                <Icon name="🏢" size={32} className="logo-icon" />
              </div>
              <div className="logo-text">
                <h1 className="register-title">Créer un compte</h1>
                <span className="logo-subtitle">SERIP-CAS - ERP de Gestion</span>
              </div>
            </div>
            <p className="register-description">
              Sélectionnez le type de compte que vous souhaitez créer
            </p>
          </div>

          <div className="account-types-grid">
            {ACCOUNT_TYPES.map((type) => (
              <button
                key={type.id}
                className={`account-type-card ${selectedType?.id === type.id ? 'selected' : ''}`}
                onClick={() => handleSelectType(type)}
                style={{
                  '--type-color': type.color
                }}
              >
                <div className="account-type-icon">
                  <Icon name={type.icon} size={48} />
                </div>
                <h3 className="account-type-title">{type.title}</h3>
                <p className="account-type-description">{type.description}</p>
                <div className="account-type-arrow">
                  <Icon name="→" size={20} />
                </div>
              </button>
            ))}
          </div>

          <div className="register-footer">
            <p className="register-footer-text">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="register-link">
                Se connecter
              </Link>
            </p>
            <p className="register-footer-text">
              Besoin d’aide ? Écrivez-nous à{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="register-link register-link--secondary">
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

