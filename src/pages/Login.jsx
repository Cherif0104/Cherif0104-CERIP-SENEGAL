import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { authService } from '../services/auth.service'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import './Login.css'

export default function Login() {
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  // Afficher le message de succès si l'utilisateur vient de s'inscrire
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      // Effacer le message après 5 secondes
      const timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [location.state])

  const handleLogin = async (e) => {
    e.preventDefault()
    
    // Éviter les soumissions multiples
    if (loading) return
    
    setLoading(true)
    setError(null)

    try {
      const result = await authService.signIn(email, password)

      if (result.error) {
        setError(result.error.message || 'Email ou mot de passe incorrect')
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
                  onChange={(e) => setEmail(e.target.value)}
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

            {successMessage && (
              <div className="success-message" role="alert">
                <Icon name="✅" size={18} className="success-icon" />
                <span className="success-text">{successMessage}</span>
              </div>
            )}

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
