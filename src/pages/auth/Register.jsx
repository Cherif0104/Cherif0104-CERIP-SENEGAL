import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
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

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1 className="register-title">Créer un compte</h1>
          <p className="register-subtitle">CERIP Senegal ERP</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="register-form-row">
            <Input
              label="Nom"
              value={formData.nom}
              onChange={(e) => handleChange('nom', e.target.value)}
              required
              disabled={loading}
            />
            <Input
              label="Prénom"
              value={formData.prenom}
              onChange={(e) => handleChange('prenom', e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            autoComplete="email"
            disabled={loading}
          />

          <Select
            label="Rôle"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            options={roleOptions}
            required
            disabled={loading}
          />

          <Input
            label="Mot de passe"
            type="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            required
            autoComplete="new-password"
            disabled={loading}
          />

          <Input
            label="Confirmer le mot de passe"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            required
            autoComplete="new-password"
            disabled={loading}
          />

          {error && <div className="register-error">{error}</div>}

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
            className="register-submit"
          >
            Créer le compte
          </Button>
        </form>

        <div className="register-footer">
          <p>
            Déjà un compte ?{' '}
            <Link to="/login" className="register-link">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

