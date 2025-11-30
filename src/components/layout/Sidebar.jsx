import { NavLink } from 'react-router-dom'
import { Icon } from '@/components/common/Icon'
import './Sidebar.css'

const menuItems = [
  {
    path: '/',
    icon: 'LayoutDashboard',
    label: 'Tableau de bord',
  },
  {
    path: '/programmes',
    icon: 'FolderKanban',
    label: 'Programmes',
  },
  {
    path: '/projets',
    icon: 'Briefcase',
    label: 'Projets',
  },
  {
    path: '/candidatures',
    icon: 'UserCheck',
    label: 'Candidatures',
  },
  {
    path: '/beneficiaires',
    icon: 'Users',
    label: 'Bénéficiaires',
  },
  {
    path: '/intervenants',
    icon: 'UserCog',
    label: 'Intervenants',
  },
  {
    path: '/reporting',
    icon: 'FileText',
    label: 'Reporting',
  },
  {
    path: '/tresorerie',
    icon: 'Wallet',
    label: 'Trésorerie',
  },
  {
    path: '/gestion-temps',
    icon: 'Clock',
    label: 'Gestion du Temps',
  },
  {
    path: '/partenaires',
    icon: 'Users',
    label: 'Partenaires & Structures',
  },
  {
    path: '/rh',
    icon: 'UserCircle',
    label: 'Ressources Humaines',
  },
  {
    path: '/administration',
    icon: 'Settings',
    label: 'Administration',
  },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon name={item.icon} size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

