import { useAuth } from '@/hooks/useAuth'
import { Icon } from '@/components/common/Icon'
import { Button } from '@/components/common/Button'
import './Header.css'

export default function Header() {
  const { profile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">
          <Icon name="Building2" size={24} color="var(--cerip-red)" />
          <span className="header-title">CERIP Senegal</span>
        </div>
      </div>

      <div className="header-right">
        <div className="header-user">
          <div className="header-user-info">
            <span className="header-user-name">
              {profile?.prenom} {profile?.nom}
            </span>
            <span className="header-user-role">{profile?.role}</span>
          </div>
          <div className="header-user-avatar">
            <Icon name="User" size={20} />
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="header-signout"
        >
          <Icon name="LogOut" size={16} />
          Déconnexion
        </Button>
      </div>
    </header>
  )
}

