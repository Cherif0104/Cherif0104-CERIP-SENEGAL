import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { authService } from './services/auth.service'
import useAuth from './hooks/useAuth'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/dashboard/Dashboard'
import Programmes from './pages/Programmes'
import ProgrammeForm from './pages/ProgrammeForm'
import ProgrammeDetail from './pages/ProgrammeDetail'
import Referentiels from './pages/admin/Referentiels'
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
import Formations from './pages/Formations'
import FormationForm from './pages/FormationForm'
import FormationDetail from './pages/FormationDetail'
import Dossiers from './pages/Dossiers'
import DossierForm from './pages/DossierForm'
import DossierDetail from './pages/DossierDetail'
import Mentors from './pages/Mentors'
import MentorForm from './pages/MentorForm'
import MentorDetail from './pages/MentorDetail'
import Rapports from './pages/Rapports'
import PortailMentor from './pages/PortailMentor'
import PortailFormateur from './pages/PortailFormateur'
import PortailCoach from './pages/PortailCoach'
import Layout from './components/layout/Layout'

function App() {
  const { user, userProfile, loading } = useAuth()

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
                  <Route path="/admin/referentiels" element={<Referentiels />} />
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
                  <Route path="/formations" element={<Formations />} />
                  <Route path="/formations/new" element={<FormationForm />} />
                  <Route path="/formations/:id" element={<FormationDetail />} />
                  <Route path="/formations/:id/edit" element={<FormationForm />} />
                  <Route path="/dossiers" element={<Dossiers />} />
                  <Route path="/dossiers/new" element={<DossierForm />} />
                  <Route path="/dossiers/:id" element={<DossierDetail />} />
                  <Route path="/dossiers/:id/edit" element={<DossierForm />} />
                  <Route path="/mentors" element={<Mentors />} />
                  <Route path="/mentors/new" element={<MentorForm />} />
                  <Route path="/mentors/:id" element={<MentorDetail />} />
                  <Route path="/mentors/:id/edit" element={<MentorForm />} />
                  <Route path="/rapports" element={<Rapports />} />
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

