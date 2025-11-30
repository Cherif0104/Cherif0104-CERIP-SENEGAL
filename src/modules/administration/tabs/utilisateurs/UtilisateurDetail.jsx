import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { usersService } from '@/services/users.service'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './UtilisateurDetail.css'

export default function UtilisateurDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [utilisateur, setUtilisateur] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUtilisateur()
  }, [id])

  const loadUtilisateur = async () => {
    setLoading(true)
    try {
      const result = await usersService.getByIdWithRelations(id)
      if (result.error) {
        logger.error('UTILISATEUR_DETAIL', 'Erreur chargement utilisateur', result.error)
        return
      }
      setUtilisateur(result.data)
      logger.debug('UTILISATEUR_DETAIL', 'Utilisateur chargé', { id, email: result.data?.email })
    } catch (error) {
      logger.error('UTILISATEUR_DETAIL', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActif = async () => {
    if (!utilisateur) return

    try {
      const result = await usersService.toggleActif(id, !utilisateur.actif)
      if (result.error) {
        alert('Erreur lors de la modification du statut')
        return
      }
      loadUtilisateur()
    } catch (error) {
      logger.error('UTILISATEUR_DETAIL', 'Erreur toggle actif', error)
      alert('Erreur lors de la modification')
    }
  }

  const handleResetPassword = async () => {
    if (!utilisateur) return

    if (!confirm('Êtes-vous sûr de vouloir envoyer un email de réinitialisation de mot de passe ?')) {
      return
    }

    try {
      const result = await usersService.resetPassword(utilisateur.email)
      if (result.error) {
        alert('Erreur lors de l\'envoi de l\'email de réinitialisation')
        return
      }
      alert('Email de réinitialisation envoyé avec succès')
    } catch (error) {
      logger.error('UTILISATEUR_DETAIL', 'Erreur reset password', error)
      alert('Erreur lors de l\'envoi de l\'email')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  const getRoleLabel = (role) => {
    const roleLabels = {
      ADMIN_SERIP: 'Admin SERIP',
      ADMIN_ORGANISME: 'Admin Organisme',
      CHEF_PROJET: 'Chef de projet',
      MENTOR: 'Mentor',
      FORMATEUR: 'Formateur',
      COACH: 'Coach',
      BAILLEUR: 'Bailleur',
      BENEFICIAIRE: 'Bénéficiaire',
      GPERFORM: 'GPerf',
    }
    return roleLabels[role] || role
  }

  if (loading) return <LoadingState />

  if (!utilisateur) {
    return (
      <div className="utilisateur-detail-error">
        <h2>Utilisateur non trouvé</h2>
        <Button onClick={() => navigate('/administration?tab=utilisateurs')}>Retour à la liste</Button>
      </div>
    )
  }

  return (
    <div className="utilisateur-detail">
      <div className="utilisateur-detail-header">
        <Button variant="secondary" onClick={() => navigate('/administration?tab=utilisateurs')}>
          <Icon name="ArrowLeft" size={16} />
          Retour
        </Button>
        <div className="utilisateur-detail-title">
          <h1>
            {utilisateur.prenom} {utilisateur.nom}
          </h1>
          <span className="utilisateur-detail-email">{utilisateur.email}</span>
        </div>
        <div className="utilisateur-detail-actions">
          <Button variant="secondary" onClick={handleToggleActif}>
            <Icon name={utilisateur.actif ? 'X' : 'Check'} size={16} />
            {utilisateur.actif ? 'Désactiver' : 'Activer'}
          </Button>
          <Button variant="primary" onClick={() => navigate(`/administration/utilisateurs/${id}/edit`)}>
            <Icon name="Edit" size={16} />
            Modifier
          </Button>
        </div>
      </div>

      <div className="utilisateur-detail-content">
        {/* Section Informations générales */}
        <div className="utilisateur-detail-section">
          <h2>Informations générales</h2>
          <div className="utilisateur-detail-grid">
            <div className="utilisateur-detail-field">
              <label>Email</label>
              <span>{utilisateur.email || '-'}</span>
            </div>
            <div className="utilisateur-detail-field">
              <label>Prénom</label>
              <span>{utilisateur.prenom || '-'}</span>
            </div>
            <div className="utilisateur-detail-field">
              <label>Nom</label>
              <span>{utilisateur.nom || '-'}</span>
            </div>
            <div className="utilisateur-detail-field">
              <label>Téléphone</label>
              <span>{utilisateur.telephone || '-'}</span>
            </div>
            <div className="utilisateur-detail-field">
              <label>Rôle</label>
              <span className="role-badge">{getRoleLabel(utilisateur.role)}</span>
            </div>
            <div className="utilisateur-detail-field">
              <label>Statut</label>
              <span className={`statut-badge statut-${utilisateur.actif ? 'actif' : 'inactif'}`}>
                {utilisateur.actif ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
        </div>

        {/* Section Dates */}
        <div className="utilisateur-detail-section">
          <h2>Dates</h2>
          <div className="utilisateur-detail-grid">
            <div className="utilisateur-detail-field">
              <label>Date de création</label>
              <span>{formatDate(utilisateur.date_creation || utilisateur.created_at)}</span>
            </div>
            <div className="utilisateur-detail-field">
              <label>Dernière modification</label>
              <span>{formatDate(utilisateur.date_modification || utilisateur.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Section Employé lié */}
        {utilisateur.employe && (
          <div className="utilisateur-detail-section">
            <h2>Employé lié</h2>
            <div className="utilisateur-detail-grid">
              <div className="utilisateur-detail-field">
                <label>Employé</label>
                <span>
                  {utilisateur.employe.prenom} {utilisateur.employe.nom} ({utilisateur.employe.matricule})
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Section Actions */}
        <div className="utilisateur-detail-section">
          <h2>Actions</h2>
          <div className="actions-buttons">
            <Button variant="secondary" onClick={handleResetPassword}>
              <Icon name="Key" size={16} />
              Réinitialiser le mot de passe
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (confirm('Êtes-vous sûr de vouloir désactiver cet utilisateur ?')) {
                  handleToggleActif()
                }
              }}
            >
              <Icon name="X" size={16} />
              {utilisateur.actif ? 'Désactiver le compte' : 'Activer le compte'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

