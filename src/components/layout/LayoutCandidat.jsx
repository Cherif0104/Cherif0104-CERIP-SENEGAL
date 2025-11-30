import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthCandidat } from '@/hooks/useAuthCandidat'
import { Icon } from '@/components/common/Icon'
import { Button } from '@/components/common/Button'
import { logger } from '@/utils/logger'
import './LayoutCandidat.css'

export default function LayoutCandidat() {
  const { profile, signOut } = useAuthCandidat()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/candidat/login')
    logger.action('CANDIDAT_LOGOUT')
  }

  const menuItems = [
    {
      path: '/candidat/mes-candidatures',
      icon: 'FileText',
      label: 'Mes Candidatures',
    },
    {
      path: '/candidat/notifications',
      icon: 'Bell',
      label: 'Notifications',
    },
    {
      path: '/candidat/profil',
      icon: 'User',
      label: 'Mon Profil',
    },
  ]

  return (
    <div className="layout-candidat">
      <header className="layout-candidat-header">
        <div className="header-content">
          <div className="header-left">
            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              <Icon name="Menu" size={24} />
            </button>
            <h1 className="header-title">Espace Candidat</h1>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">
                {profile?.prenom} {profile?.nom}
              </span>
            </div>
            <Button variant="secondary" size="sm" onClick={handleSignOut}>
              <Icon name="LogOut" size={16} />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="layout-candidat-body">
        <aside className={`layout-candidat-sidebar ${menuOpen ? 'open' : ''}`}>
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <Icon name={item.icon} size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="layout-candidat-main">
          <Outlet />
        </main>
      </div>

      {menuOpen && <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />}
    </div>
  )
}

