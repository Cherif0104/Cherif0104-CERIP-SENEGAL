import { useState, useEffect } from 'react'
import { authService } from '../../services/auth.service'
import { useNavigate } from 'react-router-dom'
import { getThemeFromRole } from '../../utils/roles'
import Sidebar from './Sidebar'
import Header from './Header'
import ToastContainer from '../common/ToastContainer'

export default function Layout({ children, user }) {
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      // Si l'utilisateur a déjà un profil (venant du bypass par exemple), l'utiliser directement
      if (user.role || user.email) {
        setUserProfile(user)
        setLoading(false)
      } else {
        fetchUserProfile()
      }
    }
  }, [user])

  const fetchUserProfile = async () => {
    try {
      if (!user?.id) {
        setLoading(false)
        return
      }
      
      const { data, error } = await authService.getUserProfile(user.id)
      if (data) {
        setUserProfile(data)
      } else if (error && !error.message?.includes('Pas de session')) {
        console.error('Error fetching user profile:', error)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await authService.signOut()
    navigate('/login')
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    )
  }

  const role = userProfile?.role || 'CERIP'
  const theme = getThemeFromRole(role)

  return (
    <div className={`app theme-${theme}`}>
      <ToastContainer />
      <div className="app__layout">
        <Sidebar role={role} />
        <div className="app__main">
          <Header user={userProfile || user} onLogout={handleLogout} />
          <div className="app__content">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

