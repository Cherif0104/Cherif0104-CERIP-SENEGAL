import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { LoadingState } from '@/components/common/LoadingState'
import { logger } from '@/utils/logger'
import './Login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

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
        navigate('/')
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
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1 className="login-title">CERIP Senegal</h1>
          <p className="login-subtitle">ERP de Gestion des Programmes d'Insertion</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={loading}
          />

          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={loading}
          />

          {error && <div className="login-error">{error}</div>}

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
            className="login-submit"
          >
            Se connecter
          </Button>
        </form>

        <div className="login-footer">
          <p>
            Pas encore de compte ?{' '}
            <Link to="/register" className="login-link">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

