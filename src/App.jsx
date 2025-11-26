import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { authService } from './services/auth.service'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/dashboard/Dashboard'
import Programmes from './pages/Programmes'
import ProgrammeForm from './pages/ProgrammeForm'
import ProgrammeDetail from './pages/ProgrammeDetail'
import Projets from './pages/Projets'
import ProjetForm from './pages/ProjetForm'
import ProjetDetail from './pages/ProjetDetail'
import AppelsCandidatures from './pages/AppelsCandidatures'
import AppelForm from './pages/AppelForm'
import AppelDetail from './pages/AppelDetail'
import CandidatsPipeline from './pages/CandidatsPipeline'
import CandidatForm from './pages/CandidatForm'
import CandidatDetail from './pages/CandidatDetail'
import Beneficiaires from './pages/Beneficiaires'
import BeneficiaireForm from './pages/BeneficiaireForm'
import BeneficiaireDossier from './pages/BeneficiaireDossier'
import PortailMentor from './pages/PortailMentor'
import PortailFormateur from './pages/PortailFormateur'
import PortailCoach from './pages/PortailCoach'
import Layout from './components/layout/Layout'

function App() {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Récupérer la session (bypass ou Supabase)
    // Vérifier d'abord le bypass si activé
    const checkSession = async () => {
      try {
        const { data: { session } } = await authService.getSession()
        if (session?.user) {
          setUser(session.user)
          // Récupérer le profil utilisateur
          try {
            const profile = await authService.getUserProfile(session.user.id)
            if (profile.data) {
              setUserProfile(profile.data)
            } else {
              // Si pas de profil, utiliser les métadonnées de l'utilisateur
              setUserProfile({
                id: session.user.id,
                email: session.user.email,
                role: session.user.user_metadata?.role || 'ADMIN_SERIP',
                nom: session.user.user_metadata?.nom || session.user.email,
                prenom: session.user.user_metadata?.prenom || '',
              })
            }
          } catch (error) {
            // Ignorer les erreurs silencieusement pour les comptes de test
            if (!session.user.id?.startsWith('00000000-0000-0000-0000-00000000')) {
              console.error('Error loading user profile:', error)
            }
            // Utiliser les métadonnées en cas d'erreur
            setUserProfile({
              id: session.user.id,
              email: session.user.email,
              role: session.user.user_metadata?.role || 'ADMIN_SERIP',
              nom: session.user.user_metadata?.nom || session.user.email,
              prenom: session.user.user_metadata?.prenom || '',
            })
          }
        }
      } catch (error) {
        console.error('Error checking session:', error)
        // En cas d'erreur, continuer sans utilisateur (redirection vers login)
      } finally {
        setLoading(false)
      }
    }
    
    // Timeout de sécurité pour éviter que l'app reste bloquée
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Session check timeout, setting loading to false')
        setLoading(false)
      }
    }, 5000)
    
    checkSession()
    
    return () => clearTimeout(timeout)

    // Écouter les changements d'état d'authentification
    const handleAuthChange = async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        // Récupérer le profil
        try {
          const profile = await authService.getUserProfile(session.user.id)
          if (profile.data) {
            setUserProfile(profile.data)
      } else {
            // Utiliser les métadonnées ou l'email comme fallback
            setUserProfile({
              id: session.user.id,
              email: session.user.email,
              role: session.user.user_metadata?.role || 'ADMIN_SERIP',
              nom: session.user.user_metadata?.nom || session.user.email?.split('@')[0] || 'Utilisateur',
              prenom: session.user.user_metadata?.prenom || '',
            })
          }
        } catch (error) {
          console.error('Error loading user profile:', error)
          // En cas d'erreur, utiliser au moins les données de base
          setUserProfile({
            id: session.user.id,
            email: session.user.email,
            role: session.user.user_metadata?.role || 'ADMIN_SERIP',
            nom: session.user.email?.split('@')[0] || 'Utilisateur',
          })
        }
                                } else {
        setUser(null)
        setUserProfile(null)
      }
    }

    const authStateResult = authService.onAuthStateChange(handleAuthChange)
    const subscription = authStateResult?.data?.subscription

    // Écouter aussi les changements de localStorage pour le bypass (autres onglets)
    const handleStorageChange = (e) => {
      if (e.key === 'serip_bypass_session' || e.key === 'cerip_bypass_session') {
        authService.getSession().then(async ({ data: { session } }) => {
          await handleAuthChange(session ? 'SIGNED_IN' : 'SIGNED_OUT', session)
        })
      }
    }
    window.addEventListener('storage', handleStorageChange)

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe()
      }
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  if (loading) {
  return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
    </div>
  )
}

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={!user ? <Navigate to="/login" /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        {/* Routes protégées */}
        <Route
          path="/*"
          element={
            user ? (
              <Layout user={userProfile || user}>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/programmes" element={<Programmes />} />
                  <Route path="/programmes/new" element={<ProgrammeForm />} />
                  <Route path="/programmes/:id" element={<ProgrammeDetail />} />
                  <Route path="/programmes/:id/edit" element={<ProgrammeForm />} />
                  <Route path="/projets" element={<Projets />} />
                  <Route path="/projets/new" element={<ProjetForm />} />
                  <Route path="/projets/:id" element={<ProjetDetail />} />
                  <Route path="/projets/:id/edit" element={<ProjetForm />} />
                  <Route path="/appels-candidatures" element={<AppelsCandidatures />} />
                  <Route path="/appels-candidatures/new" element={<AppelForm />} />
                  <Route path="/appels-candidatures/:id" element={<AppelDetail />} />
                  <Route path="/appels-candidatures/:id/edit" element={<AppelForm />} />
                  <Route path="/candidats" element={<CandidatsPipeline />} />
                  <Route path="/candidats/new" element={<CandidatForm />} />
                  <Route path="/candidats/:id" element={<CandidatDetail />} />
                  <Route path="/candidats/:id/edit" element={<CandidatForm />} />
                  <Route path="/beneficiaires" element={<Beneficiaires />} />
                  <Route path="/beneficiaires/new" element={<BeneficiaireForm />} />
                  <Route path="/beneficiaires/:id" element={<BeneficiaireDossier />} />
                  <Route path="/beneficiaires/:id/edit" element={<BeneficiaireForm />} />
                  <Route path="/portail-mentor" element={<PortailMentor />} />
                  <Route path="/portail-formateur" element={<PortailFormateur />} />
                  <Route path="/portail-coach" element={<PortailCoach />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  )
}

export default App

