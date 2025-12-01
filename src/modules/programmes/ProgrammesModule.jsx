import { useNavigate } from 'react-router-dom'
import { ModuleHeader } from '@/components/modules/ModuleHeader'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import ProgrammesListe from './tabs/liste/ProgrammesListe'
import './ProgrammesModule.css'

/**
 * Module Programmes - Affiche uniquement la liste des programmes
 * Tous les sous-modules (budgets, dépenses, etc.) sont accessibles depuis ProgrammeDetail
 */
export default function ProgrammesModule() {
  const navigate = useNavigate()

  return (
    <div className="programmes-module">
      <ModuleHeader
        title="Programmes"
        subtitle="Gestion des programmes d'insertion"
        onRefresh={() => window.location.reload()}
        actions={
          <PermissionGuard permission="programmes.create">
            <Button 
              onClick={() => navigate('/programmes/new')} 
              variant="primary"
              size="lg"
              className="create-programme-button"
            >
              <Icon name="Plus" size={18} />
              Créer un Programme
            </Button>
          </PermissionGuard>
        }
      />
      {/* Afficher directement la liste - pas de tabs */}
      <ProgrammesListe />
    </div>
  )
}

