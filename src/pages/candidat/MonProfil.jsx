import { useEffect, useState } from 'react'
import { useAuthCandidat } from '@/hooks/useAuthCandidat'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './MonProfil.css'

export default function MonProfil() {
  const { profile, user } = useAuthCandidat()
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (profile?.candidat) {
      setFormData({
        nom: profile.candidat.nom || '',
        prenom: profile.candidat.prenom || '',
        email: profile.candidat.email || profile.email || '',
        telephone: profile.candidat.telephone || '',
        adresse: profile.candidat.adresse || '',
      })
    }
  }, [profile])

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

    try {
      const candidatId = profile?.candidat?.id
      if (!candidatId) {
        setError('Impossible de mettre à jour le profil')
        return
      }

      const { error: updateError } = await supabase
        .from('candidats')
        .update({
          nom: formData.nom,
          prenom: formData.prenom,
          telephone: formData.telephone,
          adresse: formData.adresse,
        })
        .eq('id', candidatId)

      if (updateError) {
        throw updateError
      }

      // Mettre à jour aussi le profil utilisateur si nécessaire
      if (user?.id) {
        await supabase
          .from('users')
          .update({
            nom: formData.nom,
            prenom: formData.prenom,
            telephone: formData.telephone,
          })
          .eq('id', user.id)
      }

      logger.info('MON_PROFIL', 'Profil mis à jour', { candidatId })
      setSuccess('Profil mis à jour avec succès')
    } catch (error) {
      logger.error('MON_PROFIL', 'Erreur mise à jour profil', error)
      setError(error.message || 'Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mon-profil">
      <div className="page-header">
        <h1>Mon Profil</h1>
        <p>Gérez vos informations personnelles</p>
      </div>

      <div className="profil-content">
        <form onSubmit={handleSubmit} className="profil-form">
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

          <div className="form-section">
            <h2>Informations personnelles</h2>
            <div className="form-row">
              <Input
                label="Nom"
                value={formData.nom}
                onChange={(e) => handleChange('nom', e.target.value)}
                placeholder="Nom de famille"
              />
              <Input
                label="Prénom"
                value={formData.prenom}
                onChange={(e) => handleChange('prenom', e.target.value)}
                placeholder="Prénom"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Coordonnées</h2>
            <Input
              label="Email"
              type="email"
              value={formData.email}
              disabled
              helperText="L'email ne peut pas être modifié"
            />
            <Input
              label="Téléphone"
              value={formData.telephone}
              onChange={(e) => handleChange('telephone', e.target.value)}
              placeholder="+221 XX XXX XX XX"
            />
            <Input
              label="Adresse"
              value={formData.adresse}
              onChange={(e) => handleChange('adresse', e.target.value)}
              placeholder="Adresse complète"
            />
          </div>

          <div className="form-actions">
            <Button type="submit" variant="primary" loading={loading} disabled={loading}>
              <Icon name="Save" size={16} />
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

