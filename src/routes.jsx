import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/dashboard/Dashboard'
import ProgrammesModule from './modules/programmes/ProgrammesModule'
import ProjetsModule from './modules/projets/ProjetsModule'
import CandidaturesModule from './modules/candidatures/CandidaturesModule'
import BeneficiairesModule from './modules/beneficiaires/BeneficiairesModule'
import IntervenantsModule from './modules/intervenants/IntervenantsModule'
import ReportingModule from './modules/reporting/ReportingModule'
import AdministrationModule from './modules/administration/AdministrationModule'
import PartenairesModule from './modules/partenaires/PartenairesModule'
import RHModule from './modules/ressources-humaines/RHModule'
import ProgrammeDetail from './pages/programmes/ProgrammeDetail'
import ProgrammeForm from './pages/programmes/ProgrammeForm'
import ProjetDetail from './pages/projets/ProjetDetail'
import ProjetForm from './pages/projets/ProjetForm'
import TresorerieDashboard from './pages/finances/TresorerieDashboard'
import CompteForm from './pages/finances/CompteForm'
import FluxForm from './pages/finances/FluxForm'
import PrevisionForm from './pages/finances/PrevisionForm'
import GestionTemps from './pages/temps/GestionTemps'
import TempsForm from './pages/temps/TempsForm'
import AbsenceForm from './pages/temps/AbsenceForm'
import PlanningForm from './pages/temps/PlanningForm'

import AppelsPublic from './pages/public/AppelsPublic'
import AppelDetailPublic from './pages/public/AppelDetailPublic'
import FormulaireCandidature from './pages/public/FormulaireCandidature'
import LoginCandidat from './pages/public/auth/LoginCandidat'
import RegisterCandidat from './pages/public/auth/RegisterCandidat'
import LayoutCandidat from './components/layout/LayoutCandidat'
import ProtectedRouteCandidat from './components/layout/ProtectedRouteCandidat'
import MesCandidatures from './pages/candidat/MesCandidatures'
import CandidatureDetail from './pages/candidat/CandidatureDetail'
import NotificationsCandidat from './pages/candidat/NotificationsCandidat'
import MonProfil from './pages/candidat/MonProfil'
import FormationDetail from './pages/formations/FormationDetail'
import FormationForm from './pages/formations/FormationForm'
import EmployeForm from './modules/ressources-humaines/tabs/employes/EmployeForm'
import EmployeDetail from './modules/ressources-humaines/tabs/employes/EmployeDetail'
import PosteForm from './modules/ressources-humaines/tabs/postes/PosteForm'
import PosteDetail from './modules/ressources-humaines/tabs/postes/PosteDetail'
import CompetenceForm from './modules/ressources-humaines/tabs/competences/CompetenceForm'
import CompetenceDetail from './modules/ressources-humaines/tabs/competences/CompetenceDetail'
import UtilisateurForm from './modules/administration/tabs/utilisateurs/UtilisateurForm'
import UtilisateurDetail from './modules/administration/tabs/utilisateurs/UtilisateurDetail'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  // Routes publiques (sans authentification)
  {
    path: '/appels',
    element: <AppelsPublic />,
  },
  {
    path: '/appel/:id',
    element: <AppelDetailPublic />,
  },
  {
    path: '/candidature/new',
    element: <FormulaireCandidature />,
  },
  // Authentification candidats
  {
    path: '/candidat/login',
    element: <LoginCandidat />,
  },
  {
    path: '/candidat/register',
    element: <RegisterCandidat />,
  },
  // Espace candidat (protégé)
  {
    path: '/candidat',
    element: (
      <ProtectedRouteCandidat>
        <LayoutCandidat />
      </ProtectedRouteCandidat>
    ),
    children: [
      {
        index: true,
        element: <MesCandidatures />,
      },
      {
        path: 'mes-candidatures',
        element: <MesCandidatures />,
      },
      {
        path: 'candidature/:id',
        element: <CandidatureDetail />,
      },
      {
        path: 'notifications',
        element: <NotificationsCandidat />,
      },
      {
        path: 'profil',
        element: <MonProfil />,
      },
    ],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'programmes',
        element: <ProgrammesModule />,
      },
      {
        path: 'programmes/:id',
        element: <ProgrammeDetail />,
      },
      {
        path: 'programmes/new',
        element: <ProgrammeForm />,
      },
      {
        path: 'projets',
        element: <ProjetsModule />,
      },
      {
        path: 'projets/:id',
        element: <ProjetDetail />,
      },
      {
        path: 'projets/new',
        element: <ProjetForm />,
      },
      {
        path: 'candidatures',
        element: <CandidaturesModule />,
      },
      {
        path: 'beneficiaires',
        element: <BeneficiairesModule />,
      },
      {
        path: 'intervenants',
        element: <IntervenantsModule />,
      },
      {
        path: 'reporting',
        element: <ReportingModule />,
      },
      {
        path: 'administration',
        element: <AdministrationModule />,
      },
      {
        path: 'partenaires',
        element: <PartenairesModule />,
      },
      {
        path: 'rh',
        element: <RHModule />,
      },
      {
        path: 'tresorerie',
        element: <TresorerieDashboard />,
      },
      {
        path: 'tresorerie/compte/new',
        element: <CompteForm />,
      },
      {
        path: 'tresorerie/flux/new',
        element: <FluxForm />,
      },
      {
        path: 'tresorerie/prevision/new',
        element: <PrevisionForm />,
      },
      {
        path: 'gestion-temps',
        element: <GestionTemps />,
      },
      {
        path: 'gestion-temps/temps/new',
        element: <TempsForm />,
      },
      {
        path: 'gestion-temps/absence/new',
        element: <AbsenceForm />,
      },
      {
        path: 'gestion-temps/planning/new',
        element: <PlanningForm />,
      },
      {
        path: 'formations/:id',
        element: <FormationDetail />,
      },
      {
        path: 'formations/new',
        element: <FormationForm />,
      },
      {
        path: 'formations/:id/edit',
        element: <FormationForm />,
      },
      {
        path: 'rh/employes/new',
        element: <EmployeForm />,
      },
      {
        path: 'rh/employes/:id',
        element: <EmployeDetail />,
      },
      {
        path: 'rh/employes/:id/edit',
        element: <EmployeForm />,
      },
      {
        path: 'rh/postes/new',
        element: <PosteForm />,
      },
      {
        path: 'rh/postes/:id',
        element: <PosteDetail />,
      },
      {
        path: 'rh/postes/:id/edit',
        element: <PosteForm />,
      },
      {
        path: 'rh/competences/new',
        element: <CompetenceForm />,
      },
      {
        path: 'rh/competences/:id',
        element: <CompetenceDetail />,
      },
      {
        path: 'rh/competences/:id/edit',
        element: <CompetenceForm />,
      },
      {
        path: 'administration/utilisateurs/new',
        element: <UtilisateurForm />,
      },
      {
        path: 'administration/utilisateurs/:id',
        element: <UtilisateurDetail />,
      },
      {
        path: 'administration/utilisateurs/:id/edit',
        element: <UtilisateurForm />,
      },
    ],
  },
])
