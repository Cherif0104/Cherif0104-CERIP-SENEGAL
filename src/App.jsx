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
    let isMounted = true
    
    // Récupérer la session Supabase
    const checkSession = async () => {
      try {
        const { data: { session } } = await authService.getSession()
        if (session?.user && isMounted) {
          setUser(session.user)
          // Récupérer le profil utilisateur depuis la table users
          try {
            const profile = await authService.getUserProfile(session.user.id)
            if (profile.data && isMounted) {
              setUserProfile(profile.data)
            } else if (isMounted) {
              // Si pas de profil, créer un profil par défaut
              setUserProfile({
                id: session.user.id,
                email: session.user.email,
                role: 'CERIP',
                nom: session.user.email?.split('@')[0] || 'Utilisateur',
                prenom: '',
              })
            }
          } catch (error) {
            console.error('Error loading user profile:', error)
            // Utiliser les données de base en cas d'erreur
            if (isMounted) {
              setUserProfile({
                id: session.user.id,
                email: session.user.email,
                role: 'CERIP',
                nom: session.user.email?.split('@')[0] || 'Utilisateur',
                prenom: '',
              })
            }
          }
        }
      } catch (error) {
        console.error('Error checking session:', error)
        // En cas d'erreur, continuer sans utilisateur (redirection vers login)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    
    // Timeout de sécurité pour éviter que l'app reste bloquée
    const timeout = setTimeout(() => {
      if (isMounted) {
        console.warn('Session check timeout, setting loading to false')
        setLoading(false)
      }
    }, 5000)
    
    checkSession()
    
    // Écouter les changements d'état d'authentification
    const handleAuthChange = async (event, session) => {
      if (!isMounted) return
      
      if (session?.user) {
        setUser(session.user)
        // Récupérer le profil depuis la table users
        try {
          const profile = await authService.getUserProfile(session.user.id)
          if (profile.data && isMounted) {
            setUserProfile(profile.data)
          } else if (isMounted) {
            // Utiliser les données de base comme fallback
            setUserProfile({
              id: session.user.id,
              email: session.user.email,
              role: 'CERIP',
              nom: session.user.email?.split('@')[0] || 'Utilisateur',
              prenom: '',
            })
            setUserProfile({
              id: session.user.id,
              email: session.user.email,
              role: 'CERIP',
              nom: session.user.email?.split('@')[0] || 'Utilisateur',
              prenom: '',
            })
          }
        } catch (error) {
          console.error('Error loading user profile:', error)
          // En cas d'erreur, utiliser au moins les données de base
          if (isMounted) {
          setUserProfile({
            id: session.user.id,
            email: session.user.email,
            role: 'CERIP',
            nom: session.user.email?.split('@')[0] || 'Utilisateur',
          })
          }
        }
      } else if (isMounted) {
        setUser(null)
        setUserProfile(null)
      }
    }

    const authStateResult = authService.onAuthStateChange(handleAuthChange)
    const subscription = authStateResult?.data?.subscription

    return () => {
      isMounted = false
      clearTimeout(timeout)
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe()
      }
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

