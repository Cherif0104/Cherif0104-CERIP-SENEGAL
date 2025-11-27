import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/auth.service'
import Icon from '../components/common/Icon'
import BackButton from '../components/common/BackButton'
import './Register.css'

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Effacer l'erreur quand l'utilisateur modifie le formulaire
    if (error) setError(null)
  }

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Veuillez remplir tous les champs obligatoires')
      return false
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (loading) return

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await authService.signUp(
        formData.email,
        formData.password,
        formData.nom || formData.email.split('@')[0],
        formData.prenom || '',
        'CERIP' // Rôle unique CERIP par défaut pour les nouvelles inscriptions
      )

      if (result.error) {
        // Afficher un message d'erreur plus détaillé
        let errorMessage = 'Erreur lors de la création du compte'
        
        if (result.error.message) {
          errorMessage = result.error.message
        } else if (result.error.status === 500) {
          errorMessage = 'Erreur serveur. Veuillez vérifier que le trigger Supabase est bien configuré.'
        } else if (result.error.status === 400) {
          errorMessage = 'Données invalides. Vérifiez votre email et mot de passe.'
        }
        
        console.error('Registration error details:', result.error)
        setError(errorMessage)
        setLoading(false)
        return
      }

      // Inscription réussie - rediriger vers la page de connexion
      navigate('/login', { 
        state: { 
          message: 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.' 
        } 
      })
    } catch (err) {
      console.error('Registration error:', err)
      setError('Une erreur est survenue lors de la création du compte')
      setLoading(false)
    }
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
                <span className="logo-subtitle">CERIP SENEGAL - ERP de Gestion</span>
              </div>
            </div>
            <p className="register-description">
              Remplissez le formulaire ci-dessous pour créer votre compte
            </p>
          </div>

          <form id="register-form" onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <Icon name="📧" size={16} className="label-icon" />
                Adresse email <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="votre@email.com"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="nom" className="form-label">
                <Icon name="👤" size={16} className="label-icon" />
                Nom
              </label>
              <div className="input-wrapper">
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  className="form-input"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Votre nom"
                  autoComplete="family-name"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="prenom" className="form-label">
                <Icon name="👤" size={16} className="label-icon" />
                Prénom
              </label>
              <div className="input-wrapper">
                <input
                  id="prenom"
                  name="prenom"
                  type="text"
                  className="form-input"
                  value={formData.prenom}
                  onChange={handleChange}
                  placeholder="Votre prénom"
                  autoComplete="given-name"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <Icon name="🔒" size={16} className="label-icon" />
                Mot de passe <span className="required">*</span>
              </label>
              <div className="input-wrapper password-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={loading}
                  minLength={6}
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
              <small className="form-hint">Minimum 6 caractères</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                <Icon name="🔒" size={16} className="label-icon" />
                Confirmer le mot de passe <span className="required">*</span>
              </label>
              <div className="input-wrapper password-wrapper">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
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
                  <span>Création du compte...</span>
                </>
              ) : (
                <>
                  <span>Créer mon compte</span>
                  <Icon name="→" size={18} className="btn-arrow" />
                </>
              )}
            </button>
          </form>

          <div className="register-footer">
            <p className="register-footer-text">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="register-link">
                Se connecter
              </Link>
            </p>
            <p className="register-footer-text">
              <Link to="/" className="register-link register-link--secondary">
                ← Retour à l'accueil
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
