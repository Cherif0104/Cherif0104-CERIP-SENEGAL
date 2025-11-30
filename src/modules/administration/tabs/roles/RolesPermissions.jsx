import { useEffect, useState } from 'react'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { logger } from '@/utils/logger'
import './RolesPermissions.css'

export default function RolesPermissions() {
  const [loading, setLoading] = useState(true)
  const [roles, setRoles] = useState([])

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    setLoading(true)
    try {
      // Liste des rôles par défaut
      const defaultRoles = [
        {
          code: 'ADMIN_SERIP',
          nom: 'Admin SERIP',
          description: 'Administrateur SERIP-CAS avec accès complet',
          permissions: ['*'], // Tous les droits
        },
        {
          code: 'ADMIN_ORGANISME',
          nom: 'Admin Organisme',
          description: 'Administrateur d\'organisme avec accès étendu',
          permissions: ['programmes.*', 'projets.*', 'beneficiaires.*', 'reporting.*'],
        },
        {
          code: 'CHEF_PROJET',
          nom: 'Chef de projet',
          description: 'Gestion complète des projets',
          permissions: ['projets.*', 'candidatures.*', 'beneficiaires.read'],
        },
        {
          code: 'MENTOR',
          nom: 'Mentor',
          description: 'Accès au portail mentor',
          permissions: ['beneficiaires.read', 'accompagnements.*', 'mentorat.*'],
        },
        {
          code: 'FORMATEUR',
          nom: 'Formateur',
          description: 'Accès au portail formateur',
          permissions: ['formations.*', 'sessions.*'],
        },
        {
          code: 'COACH',
          nom: 'Coach',
          description: 'Accès au portail coach',
          permissions: ['beneficiaires.read', 'coaching.*'],
        },
        {
          code: 'BAILLEUR',
          nom: 'Bailleur',
          description: 'Accès aux informations de financement',
          permissions: ['programmes.read', 'reporting.financier'],
        },
        {
          code: 'BENEFICIAIRE',
          nom: 'Bénéficiaire',
          description: 'Accès limité aux informations personnelles',
          permissions: ['beneficiaires.own'],
        },
        {
          code: 'GPERFORM',
          nom: 'GPerf',
          description: 'Gestionnaire de performance',
          permissions: ['reporting.*', 'analytics.*'],
        },
      ]

      setRoles(defaultRoles)
    } catch (error) {
      logger.error('ROLES_PERMISSIONS', 'Erreur chargement rôles', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  return (
    <div className="roles-permissions">
      <div className="roles-permissions-header">
        <h2>Rôles et Permissions</h2>
        <p className="subtitle">Gestion des rôles et permissions d'accès au système</p>
      </div>

      <div className="roles-list">
        {roles.length > 0 ? (
          roles.map((role) => (
            <div key={role.code} className="role-card">
              <div className="role-header">
                <div>
                  <h3>{role.nom}</h3>
                  <span className="role-code">{role.code}</span>
                </div>
                <Button variant="secondary" size="small">
                  <Icon name="Edit" size={16} />
                  Modifier
                </Button>
              </div>
              <p className="role-description">{role.description}</p>
              <div className="permissions-section">
                <h4>Permissions</h4>
                <div className="permissions-list">
                  {Array.isArray(role.permissions) ? (
                    role.permissions.map((perm, index) => (
                      <span key={index} className="permission-tag">
                        {perm}
                      </span>
                    ))
                  ) : (
                    <span className="permission-tag">{role.permissions}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState icon="Shield" title="Aucun rôle" message="Les rôles seront disponibles prochainement" />
        )}
      </div>

      <div className="info-box">
        <Icon name="Info" size={20} />
        <div>
          <strong>Note :</strong> Le système de permissions granulaires (matrice module × action) sera disponible dans
          une future version. Actuellement, les rôles utilisent des permissions simplifiées.
        </div>
      </div>
    </div>
  )
}

