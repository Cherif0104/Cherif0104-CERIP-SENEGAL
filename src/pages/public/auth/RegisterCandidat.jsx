import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthCandidat } from '@/hooks/useAuthCandidat'
import { authCandidatService } from '@/services/auth-candidat.service'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './AuthCandidat.css'

export default function RegisterCandidat() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [emailInfo, setEmailInfo] = useState(null)
  const { signUp } = useAuthCandidat()
  const navigate = useNavigate()

  // Vérifier l'email quand il change
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (email && email.includes('@')) {
        setCheckingEmail(true)
        const { exists, candidat } = await authCandidatService.checkEmailExists(email)
        setEmailInfo({ exists, candidat })
        if (exists && candidat) {
          setNom(candidat.nom || '')
          setPrenom(candidat.prenom || '')
        }
        setCheckingEmail(false)
      } else {
        setEmailInfo(null)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [email])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    if (!emailInfo?.exists) {
      setError(
        'Aucune candidature trouvée avec cet email. Veuillez d\'abord postuler à un appel à candidatures.'
      )
      return
    }

    logger.action('CANDIDAT_REGISTER_ATTEMPT', { email })
    setLoading(true)

    try {
      const result = await signUp(email, password, nom, prenom)

      if (result?.error) {
        logger.error('CANDIDAT_REGISTER', 'Erreur d\'inscription', result.error)
        setError(result.error.message || 'Erreur lors de l\'inscription')
      } else {
        logger.action('CANDIDAT_REGISTER_SUCCESS', { email })
        navigate('/candidat/mes-candidatures')
      }
    } catch (err) {
      logger.error('CANDIDAT_REGISTER', 'Exception lors de l\'inscription', err)
      setError('Une erreur est survenue lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-candidat-page">
      <div className="auth-candidat-container">
        <div className="auth-candidat-header">
          <h1>Créer un compte candidat</h1>
          <p>Créez un compte pour suivre vos candidatures</p>
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
            helperText={
              checkingEmail
                ? 'Vérification...'
                : emailInfo?.exists
                  ? '✓ Candidature trouvée pour cet email'
                  : email && email.includes('@')
                    ? '✗ Aucune candidature trouvée. Postulez d\'abord à un appel.'
                    : ''
            }
            error={email && email.includes('@') && !emailInfo?.exists && !checkingEmail ? true : false}
          />

          {emailInfo?.exists && (
            <div className="email-found-info">
              <Icon name="CheckCircle" size={16} />
              <span>
                Candidature trouvée. Vous pouvez créer votre compte pour suivre vos candidatures.
              </span>
            </div>
          )}

          <div className="form-row">
            <Input
              label="Nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Nom de famille"
              autoComplete="family-name"
            />
            <Input
              label="Prénom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              placeholder="Prénom"
              autoComplete="given-name"
            />
          </div>

          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            autoComplete="new-password"
            helperText="Minimum 6 caractères"
          />

          <Input
            label="Confirmer le mot de passe"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="••••••••"
            autoComplete="new-password"
            error={confirmPassword && password !== confirmPassword}
          />

          <Button
            type="submit"
            variant="primary"
            loading={loading || checkingEmail}
            disabled={loading || checkingEmail || !emailInfo?.exists}
            fullWidth
          >
            Créer mon compte
          </Button>

          <div className="auth-candidat-footer">
            <p>
              Vous avez déjà un compte ?{' '}
              <Link to="/candidat/login" className="auth-link">
                Se connecter
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

