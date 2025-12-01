import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { LoadingState } from '@/components/common/LoadingState'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './Login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { signIn, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Rediriger vers le dashboard si déjà authentifié
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      logger.debug('LOGIN', 'Utilisateur déjà authentifié, redirection vers dashboard')
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    logger.action('LOGIN_ATTEMPT', { email })
    setError('')
    setLoading(true)

    try {
      logger.debug('AUTH', 'Appel de signIn...', { email })
      const startTime = Date.now()
      
      const result = await signIn(email, password)
      const duration = Date.now() - startTime
      
      logger.debug('AUTH', `signIn terminé en ${duration}ms`, { result })
      
      if (result?.error) {
        logger.error('AUTH', 'Erreur de connexion', result.error)
        setError(result.error.message || 'Erreur de connexion')
      } else {
        logger.action('LOGIN_SUCCESS', { email })
        // Toujours rediriger vers le Dashboard après connexion
        // Ignorer la location précédente pour forcer le Dashboard
        navigate('/', { replace: true })
      }
    } catch (err) {
      logger.error('AUTH', 'Exception lors de la connexion', err)
      setError('Une erreur est survenue lors de la connexion')
    } finally {
      logger.debug('AUTH', 'Fin du processus de connexion', { loading: false })
      setLoading(false)
    }
  }

  return (
    <div className="auth-page login-page">
      {/* Section illustrée */}
      <div className="auth-illustration">
        <div className="illustration-content">
          <div className="logo-container">
            <div className="logo-circle">
              <Icon name="ShieldCheck" size={48} />
            </div>
          </div>
          <h1 className="illustration-title">CERIP Senegal</h1>
          <p className="illustration-subtitle">
            ERP de Gestion des Programmes d'Insertion Professionnelle
          </p>
          <div className="illustration-features">
            <div className="feature-item">
              <Icon name="CheckCircle" size={20} />
              <span>Gestion complète des programmes</span>
            </div>
            <div className="feature-item">
              <Icon name="CheckCircle" size={20} />
              <span>Suivi des bénéficiaires</span>
            </div>
            <div className="feature-item">
              <Icon name="CheckCircle" size={20} />
              <span>Analytics et reporting</span>
            </div>
          </div>
          <div className="illustration-decoration">
            <div className="decoration-circle circle-1"></div>
            <div className="decoration-circle circle-2"></div>
            <div className="decoration-circle circle-3"></div>
          </div>
        </div>
      </div>

      {/* Section formulaire */}
      <div className="auth-form-container">
        <div className="auth-form-wrapper">
          <div className="auth-header">
            <h2 className="auth-title">Bienvenue</h2>
            <p className="auth-subtitle">Connectez-vous à votre compte</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">
                <Icon name="Mail" size={18} />
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@exemple.com"
                required
                autoComplete="email"
                disabled={loading}
                className="form-input-modern"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Icon name="Lock" size={18} />
                Mot de passe
              </label>
              <div className="password-input-wrapper">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  className="form-input-modern"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  tabIndex={-1}
                >
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Se souvenir de moi</span>
              </label>
              <Link to="/forgot-password" className="forgot-password">
                Mot de passe oublié ?
              </Link>
            </div>

            {error && (
              <div className="auth-error">
                <Icon name="AlertCircle" size={18} />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
              className="auth-submit-btn"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
              {!loading && <Icon name="ArrowRight" size={18} />}
            </Button>
          </form>

          <div className="auth-divider">
            <span>ou</span>
          </div>

          <div className="auth-footer">
            <p>
              Pas encore de compte ?{' '}
              <Link to="/register" className="auth-link">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
