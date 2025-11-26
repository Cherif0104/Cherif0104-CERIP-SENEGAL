import Icon from '../common/Icon'
import './Header.css'

export default function Header({ user, onLogout }) {
  return (
    <header className="app__header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Icon name="Building2" size={18} color="var(--color-gray-600)" />
        <h1 style={{ 
          fontSize: '1.125rem', 
          fontWeight: 600, 
          color: 'var(--color-gray-900)',
          margin: 0
        }}>
          SERIP-CAS ERP
        </h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-gray-900)'
          }}>
            {user?.nom || user?.prenom || user?.email || 'Utilisateur'}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--color-gray-500)'
          }}>
            {user?.role || 'Utilisateur'}
          </div>
        </div>
        <button 
          onClick={onLogout} 
          className="btn btn-secondary"
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.875rem'
          }}
        >
          Déconnexion
        </button>
      </div>
    </header>
  )
}

