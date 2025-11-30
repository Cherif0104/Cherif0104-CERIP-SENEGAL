import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthCandidat } from '@/hooks/useAuthCandidat'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './AuthCandidat.css'

export default function LoginCandidat() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuthCandidat()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    logger.action('CANDIDAT_LOGIN_ATTEMPT', { email })
    setError('')
    setLoading(true)

    try {
      const result = await signIn(email, password)

      if (result?.error) {
        logger.error('CANDIDAT_LOGIN', 'Erreur de connexion', result.error)
        setError(result.error.message || 'Email ou mot de passe incorrect')
      } else {
        logger.action('CANDIDAT_LOGIN_SUCCESS', { email })
        navigate('/candidat/mes-candidatures')
      }
    } catch (err) {
      logger.error('CANDIDAT_LOGIN', 'Exception lors de la connexion', err)
      setError('Une erreur est survenue lors de la connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-candidat-page">
      <div className="auth-candidat-container">
        <div className="auth-candidat-header">
          <h1>Espace Candidat</h1>
          <p>Connectez-vous pour suivre vos candidatures</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-candidat-form">
          {error && (
            <div className="form-error">
              <Icon name="AlertCircle" size={16} />
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="email@exemple.com"
            autoComplete="email"
          />

          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <Button type="submit" variant="primary" loading={loading} disabled={loading} fullWidth>
            Se connecter
          </Button>

          <div className="auth-candidat-footer">
            <p>
              Pas encore de compte ?{' '}
              <Link to="/candidat/register" className="auth-link">
                Créer un compte
              </Link>
            </p>
            <p>
              <Link to="/candidat/forgot-password" className="auth-link">
                Mot de passe oublié ?
              </Link>
            </p>
          </div>
        </form>

        <div className="auth-candidat-back">
          <Link to="/appels" className="back-link">
            <Icon name="ArrowLeft" size={16} />
            Retour aux appels à candidatures
          </Link>
        </div>
      </div>
    </div>
  )
}

