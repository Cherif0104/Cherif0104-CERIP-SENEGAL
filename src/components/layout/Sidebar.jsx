import { Link, useLocation } from 'react-router-dom'
import { getLabelFromRole } from '../../utils/roles'
import Icon from '../common/Icon'
import SidebarGroup from './SidebarGroup'
import './Sidebar.css'

// Menu ERP CERIP
const getMenuByRole = (role) => {
  const baseMenu = {
    standalone: [
      { path: '/dashboard', label: 'Tableau de bord', icon: 'BarChart3' }
    ],
    groups: []
  }

  // Menu principal pour le rôle CERIP (rôle unique pour l'instant)
  if (!role || role === 'CERIP') {
    baseMenu.groups = [
      {
        title: 'Programmes & Projets',
        icon: 'Briefcase',
        storageKey: 'programmes_projets',
        items: [
          { path: '/programmes', label: 'Programmes', icon: 'ClipboardList' },
          { path: '/projets', label: 'Projets', icon: 'Folder' }
        ]
      },
      {
        title: 'Candidatures',
        icon: 'Sparkles',
        storageKey: 'candidatures',
        items: [
          { path: '/appels-candidatures', label: 'Appels à candidatures', icon: 'Bell' },
          { path: '/candidats', label: 'Pipeline candidats', icon: 'Sparkles' },
          { path: '/dossiers', label: 'Dossiers', icon: 'FileText' }
        ]
      },
      {
        title: 'Bénéficiaires',
        icon: 'Users',
        storageKey: 'beneficiaires',
        items: [
          { path: '/beneficiaires', label: 'Liste bénéficiaires', icon: 'Users' },
          { path: '/formations', label: 'Formations', icon: 'GraduationCap' }
        ]
      },
      {
        title: 'Portails Intervenants',
        icon: 'UserCircle',
        storageKey: 'portails_intervenants',
        items: [
          { path: '/mentors', label: 'Mentors', icon: 'Handshake' },
          { path: '/portail-mentor', label: 'Portail Mentor', icon: 'Handshake' },
          { path: '/portail-formateur', label: 'Portail Formateur', icon: 'GraduationCap' },
          { path: '/portail-coach', label: 'Portail Coach', icon: 'UserCircle' }
        ]
      },
      {
        title: 'Reporting & Analytics',
        icon: 'TrendingUp',
        storageKey: 'reporting',
        items: [
          { path: '/rapports', label: 'Rapports', icon: 'TrendingUp' }
        ]
      },
      {
        title: 'Administration',
        icon: 'Settings',
        storageKey: 'administration',
        items: [
          { path: '/admin/referentiels', label: 'Référentiels', icon: 'List' },
          { path: '/parametres', label: 'Paramètres', icon: 'Settings' }
        ]
      }
    ]
  }

  return baseMenu
}

export default function Sidebar({ role }) {
  const location = useLocation()
  const menuStructure = getMenuByRole(role || 'CERIP')
  const isActive = (path) => location.pathname === path

  return (
    <aside className="app__sidebar">
      <div style={{ 
        padding: '1.5rem 1.5rem 1rem 1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: '0.5rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '0.5rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon name="Building2" size={24} color="rgba(255, 255, 255, 0.9)" />
          </div>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: 700, 
            color: 'var(--sidebar-text)',
            margin: 0
          }}>
            CERIP SENEGAL
          </h2>
        </div>
        <p style={{
          fontSize: '0.75rem',
          color: 'rgba(255, 255, 255, 0.8)',
          margin: 0,
          fontWeight: 500
        }}>
          {getLabelFromRole(role)}
        </p>
      </div>
      
      <nav className="sidebar-nav">
        {/* Items standalone (toujours visibles) */}
        {menuStructure.standalone.map((item) => {
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${active ? 'sidebar-item--active' : ''}`}
            >
              <Icon name={item.icon} size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}

        {/* Groupes dépliants */}
        {menuStructure.groups.map((group) => (
          <SidebarGroup
            key={group.storageKey}
            title={group.title}
            icon={group.icon}
            items={group.items}
            storageKey={group.storageKey}
          />
        ))}
      </nav>
    </aside>
  )
}

