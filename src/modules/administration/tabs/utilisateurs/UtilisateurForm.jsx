import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usersService } from '@/services/users.service'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './UtilisateurForm.css'

export default function UtilisateurForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const isNew = !id

  const [formData, setFormData] = useState({
    email: '',
    nom: '',
    prenom: '',
    telephone: '',
    role: 'ADMIN_ORGANISME',
    password: '',
    confirmPassword: '',
    actif: true,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isEdit) {
      loadUtilisateur()
    }
  }, [id])

  const loadUtilisateur = async () => {
    setLoading(true)
    try {
      const result = await usersService.getById(id)
      if (result.error) {
        logger.error('UTILISATEUR_FORM', 'Erreur chargement utilisateur', result.error)
        setError('Erreur lors du chargement')
        return
      }

      const data = result.data
      setFormData({
        email: data.email || '',
        nom: data.nom || '',
        prenom: data.prenom || '',
        telephone: data.telephone || '',
        role: data.role || 'ADMIN_ORGANISME',
        password: '',
        confirmPassword: '',
        actif: data.actif !== undefined ? data.actif : true,
      })
    } catch (error) {
      logger.error('UTILISATEUR_FORM', 'Erreur inattendue', error)
      setError('Erreur inattendue')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (!formData.email) {
      setError('L\'email est requis')
      setLoading(false)
      return
    }

    if (!formData.nom || !formData.prenom) {
      setError('Le nom et le prénom sont requis')
      setLoading(false)
      return
    }

    if (isNew) {
      if (!formData.password) {
        setError('Le mot de passe est requis pour créer un utilisateur')
        setLoading(false)
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas')
        setLoading(false)
        return
      }

      if (formData.password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères')
        setLoading(false)
        return
      }
    }

    try {
      const dataToSave = {
        email: formData.email,
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone || null,
        role: formData.role,
        actif: formData.actif,
      }

      if (isEdit) {
        // Ne pas envoyer le password en modification (sera géré séparément si besoin)
        const result = await usersService.update(id, dataToSave)
        if (result.error) {
          setError(result.error.message || 'Erreur lors de la mise à jour')
          return
        }
        logger.info('UTILISATEUR_FORM', 'Utilisateur mis à jour', { id })
        setSuccess('Utilisateur mis à jour avec succès')
        setTimeout(() => {
          navigate(`/administration/utilisateurs/${id}`)
        }, 1500)
      } else {
        // Création : inclure le password
        dataToSave.password = formData.password
        const result = await usersService.create(dataToSave)
        if (result.error) {
          setError(result.error.message || 'Erreur lors de la création')
          return
        }
        logger.info('UTILISATEUR_FORM', 'Utilisateur créé', { id: result.data?.id })
        
        // Afficher le mot de passe temporaire si généré
        if (result.data?.tempPassword) {
          setSuccess(`Utilisateur créé avec succès. Mot de passe: ${result.data.tempPassword}`)
          setTimeout(() => {
            navigate(`/administration/utilisateurs/${result.data.id}`)
          }, 3000)
        } else {
          navigate(`/administration/utilisateurs/${result.data?.id}`)
        }
      }
    } catch (error) {
      logger.error('UTILISATEUR_FORM', 'Erreur inattendue', error)
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEdit) {
    return <div className="loading-container">Chargement...</div>
  }

  return (
    <div className="utilisateur-form-page">
      <div className="utilisateur-form-container">
        <div className="utilisateur-form-header">
          <Button variant="secondary" onClick={() => navigate('/administration?tab=utilisateurs')}>
            <Icon name="ArrowLeft" size={16} />
            Retour
          </Button>
          <h1>{isEdit ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="utilisateur-form">
          {error && (
            <div className="form-error">
              <Icon name="AlertCircle" size={16} />
              {error}
            </div>
          )}

          {success && (
            <div className="form-success">
              <Icon name="CheckCircle" size={16} />
              {success}
            </div>
          )}

          {/* Section Informations personnelles */}
          <div className="form-section">
            <h2>Informations personnelles</h2>
            <div className="form-grid">
              <Input
                label="Prénom"
                value={formData.prenom}
                onChange={(e) => handleChange('prenom', e.target.value)}
                required
              />
              <Input
                label="Nom"
                value={formData.nom}
                onChange={(e) => handleChange('nom', e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                disabled={isEdit} // Email ne peut pas être modifié
              />
              <Input
                label="Téléphone"
                value={formData.telephone}
                onChange={(e) => handleChange('telephone', e.target.value)}
              />
            </div>
          </div>

          {/* Section Rôle */}
          <div className="form-section">
            <h2>Rôle et statut</h2>
            <div className="form-grid">
              <Select
                label="Rôle"
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                required
                options={[
                  { value: 'ADMIN_SERIP', label: 'Admin SERIP' },
                  { value: 'ADMIN_ORGANISME', label: 'Admin Organisme' },
                  { value: 'CHEF_PROJET', label: 'Chef de projet' },
                  { value: 'MENTOR', label: 'Mentor' },
                  { value: 'FORMATEUR', label: 'Formateur' },
                  { value: 'COACH', label: 'Coach' },
                  { value: 'BAILLEUR', label: 'Bailleur' },
                  { value: 'BENEFICIAIRE', label: 'Bénéficiaire' },
                  { value: 'GPERFORM', label: 'GPerf' },
                ]}
              />
              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="actif"
                  checked={formData.actif}
                  onChange={(e) => handleChange('actif', e.target.checked)}
                />
                <label htmlFor="actif">Compte actif</label>
              </div>
            </div>
          </div>

          {/* Section Mot de passe (uniquement pour création) */}
          {isNew && (
            <div className="form-section">
              <h2>Mot de passe</h2>
              <div className="form-grid">
                <Input
                  label="Mot de passe"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required={isNew}
                  placeholder="Minimum 6 caractères"
                />
                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  required={isNew}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => navigate('/administration?tab=utilisateurs')}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

