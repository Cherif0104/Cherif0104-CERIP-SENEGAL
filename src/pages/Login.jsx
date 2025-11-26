import { useState, useEffect, useRef } from 'react'
import { authService } from '../services/auth.service'
import { testAuthService, TEST_ACCOUNTS } from '../services/testAuth.service'
import { useNavigate, Link } from 'react-router-dom'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import './Login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedTestAccount, setSelectedTestAccount] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  // Convertir TEST_ACCOUNTS en tableau pour l'affichage
  const testUsers = Object.values(TEST_ACCOUNTS).map(account => ({
    email: account.email,
    password: account.password,
    role: account.role,
    nom: account.nom,
    iconName: account.role === 'ADMIN_SERIP' ? '👑' :
              account.role === 'CHEF_PROJET' ? '📋' :
              account.role === 'MENTOR' ? '🤝' :
              account.role === 'FORMATEUR' ? '📚' :
              account.role === 'COACH' ? '💪' : '👤',
    color: account.role === 'ADMIN_SERIP' ? '#be123c' :
           account.role === 'CHEF_PROJET' ? '#3b82f6' :
           account.role === 'MENTOR' ? '#8b5cf6' :
           account.role === 'FORMATEUR' ? '#f59e0b' :
           account.role === 'COACH' ? '#10b981' : '#6b7280'
  }))

  const isBypassEnabled = testAuthService.isEnabled()

  // Gérer la sélection d'un compte de test
  const handleTestAccountSelect = async (user) => {
    setSelectedTestAccount(user.email)
    setEmail(user.email)
    setPassword(user.password)
    setShowDropdown(false)
    setError(null)
    
    // Connexion automatique après sélection
    if (testAuthService.isEnabled() && testAuthService.isTestAccount(user.email)) {
      setLoading(true)
      try {
        const result = await authService.signIn(user.email, user.password)

        if (result.error) {
          setError(result.error.message || 'Erreur lors de la connexion')
          setLoading(false)
          return
        }

        if (result.data?.user || result.data?.session?.user) {
          // Connexion réussie - navigation immédiate avec rechargement complet
          // Utiliser window.location pour forcer un rechargement et mettre à jour l'état
          window.location.href = '/'
        } else {
          setError('Erreur lors de la connexion')
          setLoading(false)
        }
      } catch (err) {
        console.error('Login error:', err)
        setError('Une erreur est survenue lors de la connexion')
        setLoading(false)
      }
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    
    // Éviter les soumissions multiples
    if (loading) return
    
    setLoading(true)
    setError(null)

    try {
      const result = await authService.signIn(email, password)

      if (result.error) {
        if (isBypassEnabled && testAuthService.isTestAccount(email)) {
          setError('Mot de passe incorrect pour ce compte de test')
        } else {
          setError(result.error.message || 'Email ou mot de passe incorrect')
        }
        setLoading(false)
        return
      }

      if (result.data?.user || result.data?.session?.user) {
        // Connexion réussie - navigation immédiate avec rechargement complet
        // Utiliser window.location pour forcer un rechargement et mettre à jour l'état
        window.location.href = '/'
      } else {
        setError('Erreur lors de la connexion')
        setLoading(false)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Une erreur est survenue lors de la connexion')
      setLoading(false)
    }
  }

  const selectedUser = testUsers.find(u => u.email === selectedTestAccount)

  return (
    <div className="login-container auth-page">
      {/* Background decorative elements */}
      <div className="login-background">
        <div className="bg-shape bg-shape-1"></div>
        <div className="bg-shape bg-shape-2"></div>
        <div className="bg-shape bg-shape-3"></div>
      </div>
      
      {/* Bouton retour */}
      <BackButton to="/" label="Retour à l'accueil" variant="ghost" />
      
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <div className="logo-wrapper">
                <Icon name="🏢" size={32} className="logo-icon" />
              </div>
              <div className="logo-text">
                <h1 className="login-title">SERIP-CAS ERP</h1>
                <span className="logo-subtitle">Système de Gestion Intégré</span>
              </div>
            </div>
            <p className="login-description">
              ERP pour la gestion des programmes, projets et bénéficiaires
            </p>
          </div>

          {isBypassEnabled && (
            <div className="bypass-badge">
              <Icon name="🔓" size={16} />
              <span>Mode BYPASS activé</span>
            </div>
          )}

          {isBypassEnabled && (
            <div className="test-account-selector">
              <label htmlFor="test-account" className="selector-label">
                <Icon name="🔑" size={16} className="label-icon" />
                Sélectionner un compte de test
              </label>
              <div className="custom-select" ref={dropdownRef}>
                <button
                  type="button"
                  className="select-trigger"
                  onClick={() => setShowDropdown(!showDropdown)}
                  disabled={loading}
                >
                  <span>
                    {selectedUser ? (
                      <>
                        <Icon name={selectedUser.iconName} size={18} style={{ color: selectedUser.color }} className="select-icon" />
                        <span>{selectedUser.nom}</span>
                      </>
                    ) : (
                      'Choisir un compte de test...'
                    )}
                  </span>
                  <span className={`select-arrow ${showDropdown ? 'open' : ''}`}>▼</span>
                </button>
                {showDropdown && (
                  <div className="select-dropdown">
                    {testUsers.map((user) => (
                      <button
                        key={user.email}
                        type="button"
                        className={`select-option ${selectedTestAccount === user.email ? 'selected' : ''}`}
                        onClick={() => handleTestAccountSelect(user)}
                        style={selectedTestAccount === user.email ? { borderLeftColor: user.color } : {}}
                      >
                        <Icon name={user.iconName} size={18} style={{ color: user.color }} className="option-icon" />
                        <div className="option-content">
                          <div className="option-name">{user.nom}</div>
                          <div className="option-email">{user.email}</div>
                        </div>
                        <div className="option-role">{user.role}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <form id="login-form" onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <Icon name="📧" size={16} className="label-icon" />
                Adresse email
              </label>
              <div className="input-wrapper">
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (selectedTestAccount && e.target.value !== selectedTestAccount) {
                      setSelectedTestAccount('')
                      setPassword('')
                    }
                  }}
                  required
                  placeholder="votre@email.com"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <Icon name="🔒" size={16} className="label-icon" />
                Mot de passe
              </label>
              <div className="input-wrapper password-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  <Icon name="👁️" size={18} />
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message" role="alert">
                <Icon name="⚠️" size={18} className="error-icon" />
                <span className="error-text">{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-login"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  <span>Se connecter</span>
                  <Icon name="→" size={18} className="btn-arrow" />
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p className="login-footer-text">
              Vous n'avez pas de compte ?{' '}
              <Link to="/register" className="login-link">
                Créer un compte
              </Link>
            </p>
            <p className="login-footer-text">
              <Link to="/" className="login-link login-link--secondary">
                ← Retour à l'accueil
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
