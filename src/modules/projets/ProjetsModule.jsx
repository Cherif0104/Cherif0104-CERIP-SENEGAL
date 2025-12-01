import { useNavigate } from 'react-router-dom'
import { ModuleHeader } from '@/components/modules/ModuleHeader'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import ProjetsListe from './tabs/liste/ProjetsListe'
import './ProjetsModule.css'

/**
 * Module Projets - Affiche uniquement la liste des projets
 * Tous les sous-modules (budgets, dépenses, etc.) sont accessibles depuis ProjetDetail
 */
export default function ProjetsModule() {
  const navigate = useNavigate()

  return (
    <div className="projets-module">
      <ModuleHeader
        title="Projets"
        subtitle="Gestion des projets d'insertion"
        onRefresh={() => window.location.reload()}
        actions={
          <PermissionGuard permission="projets.create">
            <Button 
              onClick={() => navigate('/projets/new')} 
              variant="primary"
              size="lg"
              className="create-projet-button"
            >
              <Icon name="Plus" size={18} />
              Créer un Projet
            </Button>
          </PermissionGuard>
        }
      />
      {/* Afficher directement la liste - pas de tabs */}
      <ProjetsListe />
    </div>
  )
}

