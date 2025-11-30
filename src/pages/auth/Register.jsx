import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Icon } from '@/components/common/Icon'
import './Register.css'

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: '',
    role: 'ADMIN_SERIP',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const roleOptions = [
    { value: 'ADMIN_SERIP', label: 'Administrateur SERIP' },
    { value: 'CHEF_PROJET', label: 'Chef de projet' },
    { value: 'MENTOR', label: 'Mentor' },
    { value: 'FORMATEUR', label: 'Formateur' },
    { value: 'COACH', label: 'Coach' },
  ]

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)

    try {
      const { error: signUpError } = await signUp(
        formData.email,
        formData.password,
        formData.nom,
        formData.prenom,
        formData.role
      )
      if (signUpError) {
        setError(signUpError.message || 'Erreur lors de l\'inscription')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError('Une erreur est survenue lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = () => {
    if (!formData.password) return { strength: 0, label: '', color: '' }
    const length = formData.password.length
    const hasUpper = /[A-Z]/.test(formData.password)
    const hasLower = /[a-z]/.test(formData.password)
    const hasNumber = /\d/.test(formData.password)
    const hasSpecial = /[!@#$%^&*]/.test(formData.password)
    
    let strength = 0
    if (length >= 6) strength++
    if (length >= 8) strength++
    if (hasUpper && hasLower) strength++
    if (hasNumber) strength++
    if (hasSpecial) strength++
    
    if (strength <= 2) return { strength, label: 'Faible', color: '#dc2626' }
    if (strength <= 3) return { strength, label: 'Moyen', color: '#f59e0b' }
    return { strength, label: 'Fort', color: '#10b981' }
  }

  const passwordStrength = getPasswordStrength()

  return (
    <div className="auth-page register-page">
      {/* Section illustrée */}
      <div className="auth-illustration">
        <div className="illustration-content">
          <div className="logo-container">
            <div className="logo-circle">
              <Icon name="UserPlus" size={48} />
            </div>
          </div>
          <h1 className="illustration-title">Rejoignez-nous</h1>
          <p className="illustration-subtitle">
            Créez votre compte et commencez à gérer vos programmes d'insertion professionnelle
          </p>
          <div className="illustration-features">
            <div className="feature-item">
              <Icon name="Zap" size={20} />
              <span>Accès immédiat</span>
            </div>
            <div className="feature-item">
              <Icon name="Lock" size={20} />
              <span>Sécurité garantie</span>
            </div>
            <div className="feature-item">
              <Icon name="TrendingUp" size={20} />
              <span>Outils professionnels</span>
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
            <h2 className="auth-title">Créer un compte</h2>
            <p className="auth-subtitle">Remplissez les informations ci-dessous</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Icon name="User" size={18} />
                  Nom
                </label>
                <Input
                  value={formData.nom}
                  onChange={(e) => handleChange('nom', e.target.value)}
                  placeholder="Votre nom"
                  required
                  disabled={loading}
                  className="form-input-modern"
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Icon name="User" size={18} />
                  Prénom
                </label>
                <Input
                  value={formData.prenom}
                  onChange={(e) => handleChange('prenom', e.target.value)}
                  placeholder="Votre prénom"
                  required
                  disabled={loading}
                  className="form-input-modern"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Icon name="Mail" size={18} />
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="votre.email@exemple.com"
                required
                autoComplete="email"
                disabled={loading}
                className="form-input-modern"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Icon name="Briefcase" size={18} />
                Rôle
              </label>
              <Select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                options={roleOptions}
                required
                disabled={loading}
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
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
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
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div
                      className="strength-fill"
                      style={{
                        width: `${(passwordStrength.strength / 5) * 100}%`,
                        backgroundColor: passwordStrength.color,
                      }}
                    />
                  </div>
                  <span className="strength-label" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Icon name="Lock" size={18} />
                Confirmer le mot de passe
              </label>
              <div className="password-input-wrapper">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  className={`form-input-modern ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'input-error'
                      : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle"
                  tabIndex={-1}
                >
                  <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={18} />
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <div className="input-error-message">
                  Les mots de passe ne correspondent pas
                </div>
              )}
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
              {loading ? 'Création...' : 'Créer le compte'}
              {!loading && <Icon name="ArrowRight" size={18} />}
            </Button>
          </form>

          <div className="auth-divider">
            <span>ou</span>
          </div>

          <div className="auth-footer">
            <p>
              Déjà un compte ?{' '}
              <Link to="/login" className="auth-link">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
