import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { LoadingState } from './components/common/LoadingState'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import LayoutCandidat from './components/layout/LayoutCandidat'
import ProtectedRouteCandidat from './components/layout/ProtectedRouteCandidat'

// Lazy loading pour toutes les pages - réduit le temps de chargement initial
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'))
const ProgrammesModule = lazy(() => import('./modules/programmes/ProgrammesModule'))
const ProjetsModule = lazy(() => import('./modules/projets/ProjetsModule'))
const CandidaturesModule = lazy(() => import('./modules/candidatures/CandidaturesModule'))
const BeneficiairesModule = lazy(() => import('./modules/beneficiaires/BeneficiairesModule'))
const IntervenantsModule = lazy(() => import('./modules/intervenants/IntervenantsModule'))
const ReportingModule = lazy(() => import('./modules/reporting/ReportingModule'))
const AdministrationModule = lazy(() => import('./modules/administration/AdministrationModule'))
const PartenairesModule = lazy(() => import('./modules/partenaires/PartenairesModule'))
const RHModule = lazy(() => import('./modules/ressources-humaines/RHModule'))
const ProgrammeDetail = lazy(() => import('./pages/programmes/ProgrammeDetail'))
const ProgrammeForm = lazy(() => import('./pages/programmes/ProgrammeForm'))
const ProjetDetail = lazy(() => import('./pages/projets/ProjetDetail'))
const ProjetForm = lazy(() => import('./pages/projets/ProjetForm'))
const TresorerieDashboard = lazy(() => import('./pages/finances/TresorerieDashboard'))
const CompteForm = lazy(() => import('./pages/finances/CompteForm'))
const FluxForm = lazy(() => import('./pages/finances/FluxForm'))
const PrevisionForm = lazy(() => import('./pages/finances/PrevisionForm'))
const GestionTemps = lazy(() => import('./pages/temps/GestionTemps'))
const TempsForm = lazy(() => import('./pages/temps/TempsForm'))
const AbsenceForm = lazy(() => import('./pages/temps/AbsenceForm'))
const PlanningForm = lazy(() => import('./pages/temps/PlanningForm'))
const AppelsPublic = lazy(() => import('./pages/public/AppelsPublic'))
const AppelDetailPublic = lazy(() => import('./pages/public/AppelDetailPublic'))
const FormulaireCandidature = lazy(() => import('./pages/public/FormulaireCandidature'))
const LoginCandidat = lazy(() => import('./pages/public/auth/LoginCandidat'))
const RegisterCandidat = lazy(() => import('./pages/public/auth/RegisterCandidat'))
const MesCandidatures = lazy(() => import('./pages/candidat/MesCandidatures'))
const CandidatureDetail = lazy(() => import('./pages/candidat/CandidatureDetail'))
const NotificationsCandidat = lazy(() => import('./pages/candidat/NotificationsCandidat'))
const MonProfil = lazy(() => import('./pages/candidat/MonProfil'))
const FormationDetail = lazy(() => import('./pages/formations/FormationDetail'))
const FormationForm = lazy(() => import('./pages/formations/FormationForm'))
const EmployeForm = lazy(() => import('./modules/ressources-humaines/tabs/employes/EmployeForm'))
const EmployeDetail = lazy(() => import('./modules/ressources-humaines/tabs/employes/EmployeDetail'))
const PosteForm = lazy(() => import('./modules/ressources-humaines/tabs/postes/PosteForm'))
const PosteDetail = lazy(() => import('./modules/ressources-humaines/tabs/postes/PosteDetail'))
const CompetenceForm = lazy(() => import('./modules/ressources-humaines/tabs/competences/CompetenceForm'))
const CompetenceDetail = lazy(() => import('./modules/ressources-humaines/tabs/competences/CompetenceDetail'))
const UtilisateurForm = lazy(() => import('./modules/administration/tabs/utilisateurs/UtilisateurForm'))
const UtilisateurDetail = lazy(() => import('./modules/administration/tabs/utilisateurs/UtilisateurDetail'))
const Referentiels = lazy(() => import('./pages/admin/Referentiels'))

// Wrapper pour lazy loading avec Suspense
const LazyWrapper = ({ children }) => (
  <Suspense fallback={<LoadingState message="Chargement..." />}>
    {children}
  </Suspense>
)

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <LazyWrapper>
        <Login />
      </LazyWrapper>
    ),
  },
  {
    path: '/register',
    element: (
      <LazyWrapper>
        <Register />
      </LazyWrapper>
    ),
  },
  // Routes publiques (sans authentification)
  {
    path: '/appels',
    element: (
      <LazyWrapper>
        <AppelsPublic />
      </LazyWrapper>
    ),
  },
  {
    path: '/appel/:id',
    element: (
      <LazyWrapper>
        <AppelDetailPublic />
      </LazyWrapper>
    ),
  },
  {
    path: '/candidature/new',
    element: (
      <LazyWrapper>
        <FormulaireCandidature />
      </LazyWrapper>
    ),
  },
  // Authentification candidats
  {
    path: '/candidat/login',
    element: (
      <LazyWrapper>
        <LoginCandidat />
      </LazyWrapper>
    ),
  },
  {
    path: '/candidat/register',
    element: (
      <LazyWrapper>
        <RegisterCandidat />
      </LazyWrapper>
    ),
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
        element: (
          <LazyWrapper>
            <MesCandidatures />
          </LazyWrapper>
        ),
      },
      {
        path: 'mes-candidatures',
        element: (
          <LazyWrapper>
            <MesCandidatures />
          </LazyWrapper>
        ),
      },
      {
        path: 'candidature/:id',
        element: (
          <LazyWrapper>
            <CandidatureDetail />
          </LazyWrapper>
        ),
      },
      {
        path: 'notifications',
        element: (
          <LazyWrapper>
            <NotificationsCandidat />
          </LazyWrapper>
        ),
      },
      {
        path: 'profil',
        element: (
          <LazyWrapper>
            <MonProfil />
          </LazyWrapper>
        ),
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
        element: (
          <LazyWrapper>
            <Dashboard />
          </LazyWrapper>
        ),
      },
      {
        path: 'programmes',
        element: (
          <LazyWrapper>
            <ProgrammesModule />
          </LazyWrapper>
        ),
      },
      {
        path: 'programmes/:id',
        element: (
          <LazyWrapper>
            <ProgrammeDetail />
          </LazyWrapper>
        ),
      },
      {
        path: 'programmes/new',
        element: (
          <LazyWrapper>
            <ProgrammeForm />
          </LazyWrapper>
        ),
      },
      {
        path: 'projets',
        element: (
          <LazyWrapper>
            <ProjetsModule />
          </LazyWrapper>
        ),
      },
      {
        path: 'projets/:id',
        element: (
          <LazyWrapper>
            <ProjetDetail />
          </LazyWrapper>
        ),
      },
      {
        path: 'projets/new',
        element: (
          <LazyWrapper>
            <ProjetForm />
          </LazyWrapper>
        ),
      },
      {
        path: 'candidatures',
        element: (
          <LazyWrapper>
            <CandidaturesModule />
          </LazyWrapper>
        ),
      },
      {
        path: 'beneficiaires',
        element: (
          <LazyWrapper>
            <BeneficiairesModule />
          </LazyWrapper>
        ),
      },
      {
        path: 'intervenants',
        element: (
          <LazyWrapper>
            <IntervenantsModule />
          </LazyWrapper>
        ),
      },
      {
        path: 'reporting',
        element: (
          <LazyWrapper>
            <ReportingModule />
          </LazyWrapper>
        ),
      },
      {
        path: 'administration',
        element: (
          <LazyWrapper>
            <AdministrationModule />
          </LazyWrapper>
        ),
      },
      {
        path: 'partenaires',
        element: (
          <LazyWrapper>
            <PartenairesModule />
          </LazyWrapper>
        ),
      },
      {
        path: 'rh',
        element: (
          <LazyWrapper>
            <RHModule />
          </LazyWrapper>
        ),
      },
      {
        path: 'tresorerie',
        element: (
          <LazyWrapper>
            <TresorerieDashboard />
          </LazyWrapper>
        ),
      },
      {
        path: 'tresorerie/compte/new',
        element: (
          <LazyWrapper>
            <CompteForm />
          </LazyWrapper>
        ),
      },
      {
        path: 'tresorerie/flux/new',
        element: (
          <LazyWrapper>
            <FluxForm />
          </LazyWrapper>
        ),
      },
      {
        path: 'tresorerie/prevision/new',
        element: (
          <LazyWrapper>
            <PrevisionForm />
          </LazyWrapper>
        ),
      },
      {
        path: 'gestion-temps',
        element: (
          <LazyWrapper>
            <GestionTemps />
          </LazyWrapper>
        ),
      },
      {
        path: 'gestion-temps/temps/new',
        element: (
          <LazyWrapper>
            <TempsForm />
          </LazyWrapper>
        ),
      },
      {
        path: 'gestion-temps/absence/new',
        element: (
          <LazyWrapper>
            <AbsenceForm />
          </LazyWrapper>
        ),
      },
      {
        path: 'gestion-temps/planning/new',
        element: (
          <LazyWrapper>
            <PlanningForm />
          </LazyWrapper>
        ),
      },
      {
        path: 'formations/:id',
        element: (
          <LazyWrapper>
            <FormationDetail />
          </LazyWrapper>
        ),
      },
      {
        path: 'formations/new',
        element: (
          <LazyWrapper>
            <FormationForm />
          </LazyWrapper>
        ),
      },
      {
        path: 'formations/:id/edit',
        element: (
          <LazyWrapper>
            <FormationForm />
          </LazyWrapper>
        ),
      },
      {
        path: 'rh/employes/new',
        element: (
          <LazyWrapper>
            <EmployeForm />
          </LazyWrapper>
        ),
      },
      {
        path: 'rh/employes/:id',
        element: (
          <LazyWrapper>
            <EmployeDetail />
          </LazyWrapper>
        ),
      },
      {
        path: 'rh/employes/:id/edit',
        element: (
          <LazyWrapper>
            <EmployeForm />
          </LazyWrapper>
        ),
      },
      {
        path: 'rh/postes/new',
        element: (
          <LazyWrapper>
            <PosteForm />
          </LazyWrapper>
        ),
      },
      {
        path: 'rh/postes/:id',
        element: (
          <LazyWrapper>
            <PosteDetail />
          </LazyWrapper>
        ),
      },
      {
        path: 'rh/postes/:id/edit',
        element: (
          <LazyWrapper>
            <PosteForm />
          </LazyWrapper>
        ),
      },
      {
        path: 'rh/competences/new',
        element: (
          <LazyWrapper>
            <CompetenceForm />
          </LazyWrapper>
        ),
      },
      {
        path: 'rh/competences/:id',
        element: (
          <LazyWrapper>
            <CompetenceDetail />
          </LazyWrapper>
        ),
      },
      {
        path: 'rh/competences/:id/edit',
        element: (
          <LazyWrapper>
            <CompetenceForm />
          </LazyWrapper>
        ),
      },
      {
        path: 'administration/utilisateurs/new',
        element: (
          <LazyWrapper>
            <UtilisateurForm />
          </LazyWrapper>
        ),
      },
      {
        path: 'administration/utilisateurs/:id',
        element: (
          <LazyWrapper>
            <UtilisateurDetail />
          </LazyWrapper>
        ),
      },
      {
        path: 'administration/utilisateurs/:id/edit',
        element: (
          <LazyWrapper>
            <UtilisateurForm />
          </LazyWrapper>
        ),
      },
    ],
  },
])
