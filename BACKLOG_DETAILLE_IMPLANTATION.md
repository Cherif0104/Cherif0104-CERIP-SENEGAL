# 📋 BACKLOG DÉTAILLÉ D'IMPLANTATION
## ERP CERIP SENEGAL - Tâches par Priorité

**Dernière mise à jour :** 2025-01-XX

---

## 🎯 LÉGENDE DES STATUTS

- 🔴 **P0** : Critique - À faire immédiatement
- 🟠 **P1** : Important - À faire ensuite
- 🟡 **P2** : Souhaitable - À faire en dernier

- ⬜ **TODO** : Non commencé
- 🟦 **IN PROGRESS** : En cours
- ✅ **DONE** : Terminé
- 🚫 **BLOCKED** : Bloqué

---

## 🔴 PRIORITÉ 0 (CRITIQUE)

### Phase 1.1 : Séparer Programmes et Projets

#### Module Programmes
- [ ] ⬜ Créer `src/modules/programmes/ProgrammesModule.jsx`
- [ ] ⬜ Créer `src/modules/programmes/ProgrammesModule.css`
- [ ] ⬜ Créer `src/modules/programmes/tabs/dashboard/ProgrammesDashboard.jsx`
- [ ] ⬜ Créer `src/modules/programmes/tabs/liste/ProgrammesListe.jsx`
- [ ] ⬜ Déplacer `ProgrammeDetail.jsx` vers module programmes
- [ ] ⬜ Déplacer `ProgrammeForm.jsx` vers module programmes
- [ ] ⬜ Créer `src/modules/programmes/tabs/budgets/BudgetsProgramme.jsx`
- [ ] ⬜ Créer `src/modules/programmes/tabs/financements/FinancementsProgramme.jsx`
- [ ] ⬜ Créer `src/modules/programmes/tabs/risques/RisquesProgramme.jsx`
- [ ] ⬜ Créer `src/modules/programmes/tabs/jalons/JalonsProgramme.jsx`
- [ ] ⬜ Créer `src/modules/programmes/tabs/reporting/ReportingProgramme.jsx`
- [ ] ⬜ Mettre à jour routes pour module Programmes
- [ ] ⬜ Mettre à jour Sidebar avec menu Programmes

#### Module Projets
- [ ] ⬜ Créer `src/modules/projets/ProjetsModule.jsx`
- [ ] ⬜ Créer `src/modules/projets/ProjetsModule.css`
- [ ] ⬜ Créer `src/modules/projets/tabs/dashboard/ProjetsDashboard.jsx`
- [ ] ⬜ Créer `src/modules/projets/tabs/liste/ProjetsListe.jsx`
- [ ] ⬜ Déplacer `ProjetDetail.jsx` vers module projets
- [ ] ⬜ Déplacer `ProjetForm.jsx` vers module projets
- [ ] ⬜ Créer `src/modules/projets/tabs/budgets/BudgetsProjet.jsx`
- [ ] ⬜ Créer `src/modules/projets/tabs/appels/AppelsProjet.jsx`
- [ ] ⬜ Créer `src/modules/projets/tabs/risques/RisquesProjet.jsx`
- [ ] ⬜ Créer `src/modules/projets/tabs/jalons/JalonsProjet.jsx`
- [ ] ⬜ Créer `src/modules/projets/tabs/reporting/ReportingProjet.jsx`
- [ ] ⬜ Mettre à jour routes pour module Projets
- [ ] ⬜ Mettre à jour Sidebar avec menu Projets
- [ ] ⬜ Supprimer route `programmes-projets`
- [ ] ⬜ Tester migration complète

---

### Phase 1.2 : Créer Module Partenaires/Structures

#### Base de Données
- [ ] ⬜ Créer migration SQL pour `organismes_internationaux`
- [ ] ⬜ Créer migration SQL pour `financeurs`
- [ ] ⬜ Créer migration SQL pour `partenaires`
- [ ] ⬜ Créer migration SQL pour `structures`
- [ ] ⬜ Créer politiques RLS pour toutes les tables
- [ ] ⬜ Tester migrations en dev

#### Repositories
- [ ] ⬜ Créer `src/data/repositories/OrganismeRepository.js`
- [ ] ⬜ Créer `src/data/repositories/FinanceurRepository.js`
- [ ] ⬜ Créer `src/data/repositories/PartenaireRepository.js`
- [ ] ⬜ Créer `src/data/repositories/StructureRepository.js`
- [ ] ⬜ Exporter dans `src/data/repositories/index.js`

#### Services
- [ ] ⬜ Créer `src/services/organismes.service.js`
- [ ] ⬜ Créer `src/services/financeurs.service.js`
- [ ] ⬜ Créer `src/services/partenaires.service.js`
- [ ] ⬜ Créer `src/services/structures.service.js`

#### Module Partenaires - Structure
- [ ] ⬜ Créer `src/modules/partenaires/PartenairesModule.jsx`
- [ ] ⬜ Créer `src/modules/partenaires/PartenairesModule.css`
- [ ] ⬜ Créer `src/modules/partenaires/tabs/dashboard/PartenairesDashboard.jsx`

#### Organismes Internationaux
- [ ] ⬜ Créer `src/modules/partenaires/tabs/organismes/OrganismesListe.jsx`
- [ ] ⬜ Créer `src/modules/partenaires/tabs/organismes/OrganismeDetail.jsx`
- [ ] ⬜ Créer `src/modules/partenaires/tabs/organismes/OrganismeForm.jsx`

#### Financeurs
- [ ] ⬜ Créer `src/modules/partenaires/tabs/financeurs/FinanceursListe.jsx`
- [ ] ⬜ Créer `src/modules/partenaires/tabs/financeurs/FinanceurDetail.jsx`
- [ ] ⬜ Créer `src/modules/partenaires/tabs/financeurs/FinanceurForm.jsx`
- [ ] ⬜ Créer `src/modules/partenaires/tabs/financeurs/HistoriqueFinancements.jsx`

#### Partenaires
- [ ] ⬜ Créer `src/modules/partenaires/tabs/partenaires/PartenairesListe.jsx`
- [ ] ⬜ Créer `src/modules/partenaires/tabs/partenaires/PartenaireDetail.jsx`
- [ ] ⬜ Créer `src/modules/partenaires/tabs/partenaires/PartenaireForm.jsx`

#### Structures
- [ ] ⬜ Créer `src/modules/partenaires/tabs/structures/StructuresListe.jsx`
- [ ] ⬜ Créer `src/modules/partenaires/tabs/structures/StructureDetail.jsx`
- [ ] ⬜ Créer `src/modules/partenaires/tabs/structures/StructureForm.jsx`

#### Intégration
- [ ] ⬜ Ajouter route `/partenaires` dans routes.jsx
- [ ] ⬜ Ajouter menu dans Sidebar.jsx
- [ ] ⬜ Intégrer sélection financeur dans formulaire projet
- [ ] ⬜ Intégrer sélection partenaire dans formulaire programme
- [ ] ⬜ Tester module complet

---

### Phase 2 : Candidatures Publiques

#### Base de Données
- [ ] ⬜ Créer migration SQL pour `documents_candidats`
- [ ] ⬜ Créer migration SQL pour `comptes_candidats`
- [ ] ⬜ Créer migration SQL pour `notifications_candidats`
- [ ] ⬜ Ajouter champ `documents_requis` dans `appels_candidatures`
- [ ] ⬜ Créer politiques RLS
- [ ] ⬜ Tester migrations

#### Service Upload Documents
- [ ] ⬜ Créer `src/services/documents.service.js`
- [ ] ⬜ Configurer Supabase Storage pour documents
- [ ] ⬜ Implémenter upload fichiers
- [ ] ⬜ Gérer validation types/taille fichiers

#### Pages Publiques
- [ ] ⬜ Créer `src/pages/public/AppelPublic.jsx`
- [ ] ⬜ Créer `src/pages/public/AppelPublic.css`
- [ ] ⬜ Créer `src/pages/public/FormulaireRecrutement.jsx`
- [ ] ⬜ Créer `src/pages/public/FormulaireRecrutement.css`
- [ ] ⬜ Créer composant `src/components/public/UploadDocuments.jsx`

#### Service Candidatures Publiques
- [ ] ⬜ Créer `src/services/candidatures-public.service.js`
- [ ] ⬜ Implémenter `submitCandidature(data, documents)`
- [ ] ⬜ Gérer création candidat automatique
- [ ] ⬜ Gérer upload documents
- [ ] ⬜ Implémenter notifications automatiques

#### Authentification Candidats
- [ ] ⬜ Créer `src/services/auth-candidat.service.js`
- [ ] ⬜ Créer `src/hooks/useAuthCandidat.js`
- [ ] ⬜ Implémenter signUp, signIn, signOut
- [ ] ⬜ Gérer hashage mots de passe
- [ ] ⬜ Implémenter vérification email

#### Pages Auth Candidats
- [ ] ⬜ Créer `src/pages/public/auth/LoginCandidat.jsx`
- [ ] ⬜ Créer `src/pages/public/auth/RegisterCandidat.jsx`
- [ ] ⬜ Créer `src/pages/public/auth/ForgotPasswordCandidat.jsx`

#### Layout Candidat
- [ ] ⬜ Créer `src/components/layout/LayoutCandidat.jsx`
- [ ] ⬜ Créer `src/components/layout/ProtectedRouteCandidat.jsx`

#### Espace Candidat
- [ ] ⬜ Créer `src/pages/candidat/MesCandidatures.jsx`
- [ ] ⬜ Créer `src/pages/candidat/CandidatureDetail.jsx`
- [ ] ⬜ Créer `src/pages/candidat/NotificationsCandidat.jsx`
- [ ] ⬜ Créer `src/pages/candidat/MonProfil.jsx`

#### Notifications
- [ ] ⬜ Créer `src/services/notifications-candidat.service.js`
- [ ] ⬜ Implémenter création notifications
- [ ] ⬜ Badge nombre non lues
- [ ] ⬜ Marquer comme lu
- [ ] ⬜ Notifications automatiques statut

#### Routes
- [ ] ⬜ Ajouter routes publiques dans routes.jsx
- [ ] ⬜ Ajouter routes protégées candidats
- [ ] ⬜ Tester toutes les routes

---

## 🟠 PRIORITÉ 1 (IMPORTANT)

### Phase 3.1 : Compléter Module Bénéficiaires

#### Formations
- [ ] ⬜ Créer migration SQL pour `formations`
- [ ] ⬜ Créer migration SQL pour `sessions_formations`
- [ ] ⬜ Créer migration SQL pour `participants_formations`
- [ ] ⬜ Créer `src/services/formations.service.js`
- [ ] ⬜ Créer `src/modules/beneficiaires/tabs/formations/CatalogueFormations.jsx`
- [ ] ⬜ Créer `src/modules/beneficiaires/tabs/formations/SessionsFormations.jsx`
- [ ] ⬜ Créer `src/modules/beneficiaires/tabs/formations/SessionDetail.jsx`
- [ ] ⬜ Créer `src/modules/beneficiaires/tabs/formations/EvaluationFormation.jsx`
- [ ] ⬜ Créer `src/modules/beneficiaires/tabs/formations/FormationForm.jsx`

#### Accompagnements
- [ ] ⬜ Créer migration SQL pour `sessions_mentorat`
- [ ] ⬜ Créer migration SQL pour `sessions_coaching`
- [ ] ⬜ Créer `src/modules/beneficiaires/tabs/accompagnements/Mentorat.jsx`
- [ ] ⬜ Créer `src/modules/beneficiaires/tabs/accompagnements/Coaching.jsx`
- [ ] ⬜ Créer `src/modules/beneficiaires/tabs/accompagnements/SuiviPostFormation.jsx`
- [ ] ⬜ Créer `src/modules/beneficiaires/tabs/accompagnements/PlanningInterventions.jsx`

#### Suivi
- [ ] ⬜ Créer migration SQL pour `insertions`
- [ ] ⬜ Créer migration SQL pour `suivi_insertions`
- [ ] ⬜ Créer `src/modules/beneficiaires/tabs/suivi/Insertions.jsx`
- [ ] ⬜ Créer `src/modules/beneficiaires/tabs/suivi/Suivi3Mois.jsx`
- [ ] ⬜ Créer `src/modules/beneficiaires/tabs/suivi/Suivi6Mois.jsx`
- [ ] ⬜ Créer `src/modules/beneficiaires/tabs/suivi/Suivi12Mois.jsx`
- [ ] ⬜ Créer `src/modules/beneficiaires/tabs/suivi/InsertionForm.jsx`

---

### Phase 3.2 : Compléter Module Intervenants

#### Onglet Mentors
- [ ] ⬜ Créer `src/modules/intervenants/tabs/mentors/MentorsListe.jsx`
- [ ] ⬜ Créer `src/modules/intervenants/tabs/mentors/MentorDetail.jsx`
- [ ] ⬜ Créer `src/modules/intervenants/tabs/mentors/MentorForm.jsx`
- [ ] ⬜ Créer `src/modules/intervenants/tabs/mentors/DisponibilitesMentor.jsx`

#### Portail Mentor
- [ ] ⬜ Créer `src/modules/intervenants/tabs/portail-mentor/DashboardMentor.jsx`
- [ ] ⬜ Créer `src/modules/intervenants/tabs/portail-mentor/MesBeneficiaires.jsx`
- [ ] ⬜ Créer `src/modules/intervenants/tabs/portail-mentor/PlanningMentor.jsx`
- [ ] ⬜ Créer `src/modules/intervenants/tabs/portail-mentor/RapportsMentor.jsx`
- [ ] ⬜ Ajouter route `/intervenants/portail-mentor`

#### Portail Formateur
- [ ] ⬜ Créer `src/modules/intervenants/tabs/portail-formateur/DashboardFormateur.jsx`
- [ ] ⬜ Créer `src/modules/intervenants/tabs/portail-formateur/MesFormations.jsx`
- [ ] ⬜ Créer `src/modules/intervenants/tabs/portail-formateur/SessionsFormateur.jsx`
- [ ] ⬜ Créer `src/modules/intervenants/tabs/portail-formateur/EvaluationsFormateur.jsx`
- [ ] ⬜ Ajouter route `/intervenants/portail-formateur`

#### Portail Coach
- [ ] ⬜ Créer `src/modules/intervenants/tabs/portail-coach/DashboardCoach.jsx`
- [ ] ⬜ Créer `src/modules/intervenants/tabs/portail-coach/MesCoaches.jsx`
- [ ] ⬜ Créer `src/modules/intervenants/tabs/portail-coach/PlanningCoach.jsx`
- [ ] ⬜ Créer `src/modules/intervenants/tabs/portail-coach/RapportsCoach.jsx`
- [ ] ⬜ Ajouter route `/intervenants/portail-coach`

---

### Phase 3.3 : Compléter Module Reporting

#### Rapports Préconfigurés
- [ ] ⬜ Créer `src/modules/reporting/tabs/rapports/RapportsPreconfigures.jsx`
- [ ] ⬜ Créer `src/modules/reporting/tabs/rapports/RapportProgrammes.jsx`
- [ ] ⬜ Créer `src/modules/reporting/tabs/rapports/RapportProjets.jsx`
- [ ] ⬜ Créer `src/modules/reporting/tabs/rapports/RapportCandidatures.jsx`
- [ ] ⬜ Créer `src/modules/reporting/tabs/rapports/RapportBeneficiaires.jsx`
- [ ] ⬜ Créer `src/modules/reporting/tabs/rapports/RapportFinancier.jsx`

#### Exports
- [ ] ⬜ Installer packages `xlsx`, `jspdf`, `html2canvas`
- [ ] ⬜ Créer `src/modules/reporting/tabs/exports/ExportExcel.jsx`
- [ ] ⬜ Créer `src/modules/reporting/tabs/exports/ExportPDF.jsx`
- [ ] ⬜ Créer `src/modules/reporting/tabs/exports/ExportHistory.jsx`
- [ ] ⬜ Implémenter export Excel
- [ ] ⬜ Implémenter export PDF

#### Analytics
- [ ] ⬜ Créer `src/modules/reporting/tabs/analytics/AnalyticsAvancees.jsx`
- [ ] ⬜ Créer `src/modules/reporting/tabs/analytics/DataExplorer.jsx`
- [ ] ⬜ Créer `src/modules/reporting/tabs/analytics/CustomDashboards.jsx`

---

### Phase 4 : Module Ressources Humaines

#### Base de Données
- [ ] ⬜ Créer migration SQL pour `employes`
- [ ] ⬜ Créer migration SQL pour `postes`
- [ ] ⬜ Créer migration SQL pour `competences`
- [ ] ⬜ Créer migration SQL pour `employes_competences`
- [ ] ⬜ Créer migration SQL pour `evaluations`
- [ ] ⬜ Créer politiques RLS

#### Repositories et Services
- [ ] ⬜ Créer `src/data/repositories/EmployeRepository.js`
- [ ] ⬜ Créer `src/data/repositories/PosteRepository.js`
- [ ] ⬜ Créer `src/data/repositories/CompetenceRepository.js`
- [ ] ⬜ Créer `src/services/employes.service.js`
- [ ] ⬜ Créer `src/services/postes.service.js`
- [ ] ⬜ Créer `src/services/competences.service.js`

#### Module RH - Structure
- [ ] ⬜ Créer `src/modules/ressources-humaines/RHModule.jsx`
- [ ] ⬜ Créer `src/modules/ressources-humaines/RHModule.css`
- [ ] ⬜ Créer `src/modules/ressources-humaines/tabs/dashboard/RHDashboard.jsx`

#### Employés
- [ ] ⬜ Créer `src/modules/ressources-humaines/tabs/employes/EmployesListe.jsx`
- [ ] ⬜ Créer `src/modules/ressources-humaines/tabs/employes/EmployeDetail.jsx`
- [ ] ⬜ Créer `src/modules/ressources-humaines/tabs/employes/EmployeForm.jsx`

#### Postes
- [ ] ⬜ Créer `src/modules/ressources-humaines/tabs/postes/PostesListe.jsx`
- [ ] ⬜ Créer `src/modules/ressources-humaines/tabs/postes/PosteDetail.jsx`
- [ ] ⬜ Créer `src/modules/ressources-humaines/tabs/postes/PosteForm.jsx`

#### Compétences
- [ ] ⬜ Créer `src/modules/ressources-humaines/tabs/competences/CompetencesListe.jsx`
- [ ] ⬜ Créer `src/modules/ressources-humaines/tabs/competences/CompetenceDetail.jsx`
- [ ] ⬜ Créer `src/modules/ressources-humaines/tabs/competences/CompetenceForm.jsx`

#### Planning et Évaluations
- [ ] ⬜ Créer `src/modules/ressources-humaines/tabs/planning/PlanningRH.jsx`
- [ ] ⬜ Créer `src/modules/ressources-humaines/tabs/planning/CalendrierRH.jsx`
- [ ] ⬜ Créer `src/modules/ressources-humaines/tabs/evaluations/EvaluationsListe.jsx`
- [ ] ⬜ Créer `src/modules/ressources-humaines/tabs/evaluations/EvaluationDetail.jsx`
- [ ] ⬜ Créer `src/modules/ressources-humaines/tabs/evaluations/EvaluationForm.jsx`

#### Intégration
- [ ] ⬜ Ajouter route `/ressources-humaines` dans routes.jsx
- [ ] ⬜ Ajouter menu dans Sidebar.jsx
- [ ] ⬜ Tester module complet

---

## 🟡 PRIORITÉ 2 (SOUHAITABLE)

### Phase 5 : Administration Complète

#### Utilisateurs
- [ ] ⬜ Créer `src/modules/administration/tabs/utilisateurs/UtilisateursListe.jsx`
- [ ] ⬜ Créer `src/modules/administration/tabs/utilisateurs/UtilisateurDetail.jsx`
- [ ] ⬜ Créer `src/modules/administration/tabs/utilisateurs/UtilisateurForm.jsx`
- [ ] ⬜ Implémenter CRUD complet utilisateurs

#### Rôles et Permissions
- [ ] ⬜ Créer table BDD pour permissions si nécessaire
- [ ] ⬜ Créer `src/modules/administration/tabs/utilisateurs/RolesPermissions.jsx`
- [ ] ⬜ Définir système de permissions
- [ ] ⬜ Créer interface configuration permissions
- [ ] ⬜ Implémenter assignation rôles

#### Configuration
- [ ] ⬜ Créer `src/modules/administration/tabs/configuration/ConfigurationSysteme.jsx`
- [ ] ⬜ Créer `src/modules/administration/tabs/configuration/Parametres.jsx`
- [ ] ⬜ Créer `src/modules/administration/tabs/configuration/Notifications.jsx`

#### Logs
- [ ] ⬜ Créer `src/modules/administration/tabs/logs/LogsAudit.jsx`
- [ ] ⬜ Créer `src/modules/administration/tabs/logs/LogsSysteme.jsx`
- [ ] ⬜ Créer `src/modules/administration/tabs/logs/LogsExports.jsx`
- [ ] ⬜ Implémenter filtres et recherche logs

---

## 📊 STATISTIQUES DU BACKLOG

### Par Priorité
- 🔴 **P0** : ~120 tâches
- 🟠 **P1** : ~90 tâches
- 🟡 **P2** : ~15 tâches

### Par Type
- **Base de Données** : ~30 migrations
- **Repositories** : ~15 fichiers
- **Services** : ~20 fichiers
- **Composants React** : ~150 fichiers
- **Routes/Navigation** : ~20 modifications

**TOTAL ESTIMÉ :** ~225 tâches

---

## ✅ SUIVI DES PROGRÈS

### Phase 0 : Analyse et Planification
- Date début : ___
- Date fin prévue : ___
- Progression : ___%

### Phase 1 : Restructuration (P0)
- Date début : ___
- Date fin prévue : ___
- Progression : ___%

### Phase 2 : Candidatures Publiques (P0)
- Date début : ___
- Date fin prévue : ___
- Progression : ___%

### Phase 3 : Complétion Modules (P1)
- Date début : ___
- Date fin prévue : ___
- Progression : ___%

### Phase 4 : Module RH (P1)
- Date début : ___
- Date fin prévue : ___
- Progression : ___%

### Phase 5 : Administration (P2)
- Date début : ___
- Date fin prévue : ___
- Progression : ___%

---

**Document créé le :** 2025-01-XX  
**Dernière mise à jour :** 2025-01-XX

