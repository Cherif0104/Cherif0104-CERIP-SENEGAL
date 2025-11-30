# 📋 PLAN DE DÉVELOPPEMENT ET D'IMPLANTATION COMPLET
## ERP CERIP SENEGAL - Restructuration et Amélioration Complète

**Date de création :** 2025-01-XX  
**Version :** 1.0  
**Statut :** 🚀 En développement

---

## 🎯 OBJECTIFS GLOBAUX

1. **Séparer Programmes et Projets** en modules distincts
2. **Créer Module Partenaires/Structures** (organismes, financeurs, partenaires, structures)
3. **Implémenter Candidatures Publiques** avec formulaires accessibles sans authentification
4. **Compléter tous les modules** avec leurs sous-fonctionnalités
5. **Créer Module Ressources Humaines**
6. **Finaliser Administration** avec gestion complète des utilisateurs

---

## 📊 STRUCTURE DU PLAN

Le plan est organisé en **5 PHASES** par ordre de priorité :

- **PHASE 0** : Analyse et Planification
- **PHASE 1 (P0)** : Restructuration Critique (2-3 semaines)
- **PHASE 2 (P0)** : Candidatures Publiques (2 semaines)
- **PHASE 3 (P1)** : Complétion Modules Existants (4 semaines)
- **PHASE 4 (P1)** : Module Ressources Humaines (2 semaines)
- **PHASE 5 (P2)** : Administration Complète (2 semaines)

**Durée totale estimée :** 12-13 semaines (3 mois)

---

## 🔍 PHASE 0 : ANALYSE ET PLANIFICATION

**Durée :** 1 semaine  
**Priorité :** Prérequis

### Objectifs
- Documenter l'état actuel complet
- Identifier toutes les dépendances
- Préparer les migrations BDD nécessaires
- Valider l'architecture proposée

### Tâches

#### 0.1 Audit Complet du Code Actuel
- [ ] Lister tous les fichiers existants
- [ ] Documenter les services actuels
- [ ] Documenter les composants actuels
- [ ] Identifier les dépendances entre modules
- [ ] Documenter les routes actuelles

#### 0.2 Préparation Base de Données
- [ ] Créer script de migration pour nouvelles tables
- [ ] Identifier les migrations nécessaires
- [ ] Préparer les politiques RLS
- [ ] Tester les migrations en environnement de dev

#### 0.3 Architecture Technique
- [ ] Valider la structure de dossiers proposée
- [ ] Documenter les patterns à suivre
- [ ] Préparer les templates de composants
- [ ] Définir les conventions de nommage

#### 0.4 Planification Détaillée
- [ ] Décomposer chaque phase en tâches concrètes
- [ ] Identifier les risques et dépendances
- [ ] Estimer le temps pour chaque tâche
- [ ] Créer le backlog complet

**Livrables :**
- Document d'audit complet
- Scripts de migration BDD
- Documentation architecture
- Backlog détaillé

---

## 🚀 PHASE 1 : RESTRUCTURATION CRITIQUE (P0)

**Durée :** 2-3 semaines  
**Priorité :** P0 (Critique)  
**Objectif :** Séparer Programmes/Projets et créer Module Partenaires

---

### 1.1 SÉPARER PROGRAMMES ET PROJETS

**Durée estimée :** 1 semaine

#### Étape 1.1.1 : Créer Structure Module Programmes

**Tâches :**
- [ ] Créer `src/modules/programmes/`
- [ ] Créer `ProgrammesModule.jsx` avec structure de base
- [ ] Créer `ProgrammesModule.css`
- [ ] Créer dossier `tabs/` avec structure complète :
  ```
  tabs/
  ├── dashboard/
  │   └── ProgrammesDashboard.jsx
  ├── liste/
  │   ├── ProgrammesListe.jsx
  ├── budgets/
  │   ├── BudgetsProgramme.jsx
  ├── financements/
  │   ├── FinancementsProgramme.jsx
  ├── risques/
  │   ├── RisquesProgramme.jsx
  ├── jalons/
  │   ├── JalonsProgramme.jsx
  └── reporting/
      └── ReportingProgramme.jsx
  ```

**Fichiers à créer :**
1. `src/modules/programmes/ProgrammesModule.jsx`
2. `src/modules/programmes/ProgrammesModule.css`
3. `src/modules/programmes/tabs/dashboard/ProgrammesDashboard.jsx`
4. `src/modules/programmes/tabs/liste/ProgrammesListe.jsx`
5. `src/modules/programmes/tabs/budgets/BudgetsProgramme.jsx`
6. `src/modules/programmes/tabs/financements/FinancementsProgramme.jsx`
7. `src/modules/programmes/tabs/risques/RisquesProgramme.jsx`
8. `src/modules/programmes/tabs/jalons/JalonsProgramme.jsx`
9. `src/modules/programmes/tabs/reporting/ReportingProgramme.jsx`

**Détails techniques :**

**ProgrammesModule.jsx :**
```jsx
import { useSearchParams } from 'react-router-dom'
import { ModuleHeader } from '@/components/modules/ModuleHeader'
import { ModuleTabs } from '@/components/modules/ModuleTabs'
import ProgrammesDashboard from './tabs/dashboard/ProgrammesDashboard'
import ProgrammesListe from './tabs/liste/ProgrammesListe'
import BudgetsProgramme from './tabs/budgets/BudgetsProgramme'
import FinancementsProgramme from './tabs/financements/FinancementsProgramme'
import RisquesProgramme from './tabs/risques/RisquesProgramme'
import JalonsProgramme from './tabs/jalons/JalonsProgramme'
import ReportingProgramme from './tabs/reporting/ReportingProgramme'
import './ProgrammesModule.css'

export default function ProgrammesModule() {
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'dashboard'

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'liste', label: 'Liste' },
    { id: 'budgets', label: 'Budgets' },
    { id: 'financements', label: 'Financements' },
    { id: 'risques', label: 'Risques' },
    { id: 'jalons', label: 'Jalons' },
    { id: 'reporting', label: 'Reporting' },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ProgrammesDashboard />
      case 'liste':
        return <ProgrammesListe />
      case 'budgets':
        return <BudgetProgramme />
      case 'financements':
        return <FinancementsProgramme />
      case 'risques':
        return <RisquesProgramme />
      case 'jalons':
        return <JalonsProgramme />
      case 'reporting':
        return <ReportingProgramme />
      default:
        return <ProgrammesDashboard />
    }
  }

  return (
    <div className="programmes-module">
      <ModuleHeader
        title="Programmes"
        subtitle="Gestion des programmes d'insertion"
        onRefresh={() => window.location.reload()}
      />
      <ModuleTabs tabs={tabs} defaultTab="dashboard" />
      <div className="module-tab-content">{renderTabContent()}</div>
    </div>
  )
}
```

#### Étape 1.1.2 : Migrer Fonctionnalités Programmes

**Tâches :**
- [ ] Migrer `ProgrammeDetail.jsx` et `ProgrammeForm.jsx` vers le module
- [ ] Adapter les routes pour utiliser le nouveau module
- [ ] Mettre à jour les liens dans l'application
- [ ] Migrer le dashboard existant vers `ProgrammesDashboard.jsx`
- [ ] Créer `ProgrammesListe.jsx` avec CRUD complet

**Actions :**
1. Déplacer `src/pages/programmes/ProgrammeDetail.jsx` vers `src/modules/programmes/tabs/liste/ProgrammeDetail.jsx`
2. Déplacer `src/pages/programmes/ProgrammeForm.jsx` vers `src/modules/programmes/tabs/liste/ProgrammeForm.jsx`
3. Mettre à jour `src/routes.jsx` :
   ```jsx
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
   ```

#### Étape 1.1.3 : Implémenter Onglets Programmes

**Tâches :**
- [ ] Créer `BudgetsProgramme.jsx` avec suivi budgets
- [ ] Créer `FinancementsProgramme.jsx` avec gestion financements
- [ ] Créer `RisquesProgramme.jsx` avec matrice risques
- [ ] Créer `JalonsProgramme.jsx` avec timeline jalons
- [ ] Créer `ReportingProgramme.jsx` avec rapports

**Dépendances :**
- Service `programmes.service.js` (existe)
- Service `riskManagement.service.js` (existe partiellement)
- Service `tresorerie.service.js` (existe)

---

#### Étape 1.1.4 : Créer Structure Module Projets

**Tâches :**
- [ ] Créer `src/modules/projets/`
- [ ] Créer `ProjetsModule.jsx` avec structure de base
- [ ] Créer `ProjetsModule.css`
- [ ] Créer dossier `tabs/` avec structure complète :
  ```
  tabs/
  ├── dashboard/
  │   └── ProjetsDashboard.jsx
  ├── liste/
  │   ├── ProjetsListe.jsx
  ├── budgets/
  │   ├── BudgetsProjet.jsx
  ├── appels/
  │   ├── AppelsProjet.jsx
  ├── risques/
  │   ├── RisquesProjet.jsx
  ├── jalons/
  │   ├── JalonsProjet.jsx
  └── reporting/
      └── ReportingProjet.jsx
  ```

#### Étape 1.1.5 : Migrer Fonctionnalités Projets

**Tâches :**
- [ ] Migrer `ProjetDetail.jsx` et `ProjetForm.jsx` vers le module
- [ ] Adapter les routes pour utiliser le nouveau module
- [ ] Migrer le dashboard existant vers `ProjetsDashboard.jsx`
- [ ] Créer `ProjetsListe.jsx` avec CRUD complet

**Actions :**
1. Déplacer `src/pages/projets/ProjetDetail.jsx` vers `src/modules/projets/tabs/liste/ProjetDetail.jsx`
2. Déplacer `src/pages/projets/ProjetForm.jsx` vers `src/modules/projets/tabs/liste/ProjetForm.jsx`
3. Mettre à jour `src/routes.jsx`

#### Étape 1.1.6 : Implémenter Onglets Projets

**Tâches :**
- [ ] Créer `BudgetsProjet.jsx` avec suivi budgets
- [ ] Créer `AppelsProjet.jsx` avec gestion appels à candidatures
- [ ] Créer `RisquesProjet.jsx` avec matrice risques
- [ ] Créer `JalonsProjet.jsx` avec timeline jalons
- [ ] Créer `ReportingProjet.jsx` avec rapports

#### Étape 1.1.7 : Mettre à Jour Routes et Navigation

**Tâches :**
- [ ] Supprimer route `programmes-projets`
- [ ] Ajouter routes `programmes` et `projets`
- [ ] Mettre à jour `Sidebar.jsx` avec nouveaux modules
- [ ] Mettre à jour tous les liens dans l'application
- [ ] Tester la navigation complète

**Fichiers à modifier :**
1. `src/routes.jsx` - Routes
2. `src/components/layout/Sidebar.jsx` - Navigation
3. Tous les composants avec liens vers programmes-projets

#### Étape 1.1.8 : Tests et Validation

**Tâches :**
- [ ] Tester création/modification programmes
- [ ] Tester création/modification projets
- [ ] Tester tous les onglets
- [ ] Valider que les liens fonctionnent
- [ ] Vérifier que les données sont bien séparées

**Livrables Phase 1.1 :**
- ✅ Module Programmes complet avec 7 onglets
- ✅ Module Projets complet avec 7 onglets
- ✅ Routes mises à jour
- ✅ Navigation fonctionnelle

---

### 1.2 CRÉER MODULE PARTENAIRES/STRUCTURES

**Durée estimée :** 1-2 semaines

#### Étape 1.2.1 : Créer Tables BDD

**Tâches :**
- [ ] Créer script SQL pour nouvelles tables
- [ ] Créer table `organismes_internationaux`
- [ ] Créer table `financeurs`
- [ ] Créer table `partenaires`
- [ ] Créer table `structures`
- [ ] Créer table `contacts` (optionnel, peut être JSONB dans autres tables)
- [ ] Créer politiques RLS pour toutes les tables
- [ ] Tester les migrations

**Script SQL à créer :**

```sql
-- Organismes internationaux
CREATE TABLE public.organismes_internationaux (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  type TEXT, -- ONG, Agence, Institution, etc.
  pays TEXT,
  adresse TEXT,
  site_web TEXT,
  email TEXT,
  telephone TEXT,
  contacts JSONB DEFAULT '[]'::jsonb, -- Array de contacts
  notes TEXT,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Financeurs
CREATE TABLE public.financeurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  type TEXT, -- Institution, Fondation, Entreprise, etc.
  pays TEXT,
  adresse TEXT,
  site_web TEXT,
  email TEXT,
  telephone TEXT,
  contacts JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Partenaires
CREATE TABLE public.partenaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  type_partenariat TEXT, -- Technique, Financier, Stratégique, etc.
  domaines_collaboration JSONB DEFAULT '[]'::jsonb,
  contacts JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Structures
CREATE TABLE public.structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  type TEXT, -- Entreprise, Association, Coopérative, etc.
  secteur TEXT,
  adresse TEXT,
  contacts JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies (exemple pour organismes_internationaux)
ALTER TABLE public.organismes_internationaux ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active organismes"
  ON public.organismes_internationaux FOR SELECT
  USING (actif = true OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('ADMIN_SERIP', 'ADMIN_ORGANISME')));

CREATE POLICY "Admins can insert organismes"
  ON public.organismes_internationaux FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('ADMIN_SERIP', 'ADMIN_ORGANISME', 'GESTIONNAIRE')));

CREATE POLICY "Admins can update organismes"
  ON public.organismes_internationaux FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('ADMIN_SERIP', 'ADMIN_ORGANISME', 'GESTIONNAIRE')));

CREATE POLICY "Admins can delete organismes"
  ON public.organismes_internationaux FOR DELETE
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('ADMIN_SERIP', 'ADMIN_ORGANISME')));
```

**Fichiers à créer :**
1. `supabase/migrations/XXXX_create_partenaires_tables.sql`

#### Étape 1.2.2 : Créer Repositories

**Tâches :**
- [ ] Créer `OrganismeRepository.js`
- [ ] Créer `FinanceurRepository.js`
- [ ] Créer `PartenaireRepository.js`
- [ ] Créer `StructureRepository.js`
- [ ] Exporter tous dans `src/data/repositories/index.js`

**Fichiers à créer :**
1. `src/data/repositories/OrganismeRepository.js`
2. `src/data/repositories/FinanceurRepository.js`
3. `src/data/repositories/PartenaireRepository.js`
4. `src/data/repositories/StructureRepository.js`

#### Étape 1.2.3 : Créer Services

**Tâches :**
- [ ] Créer `organismes.service.js`
- [ ] Créer `financeurs.service.js`
- [ ] Créer `partenaires.service.js`
- [ ] Créer `structures.service.js`

**Fichiers à créer :**
1. `src/services/organismes.service.js`
2. `src/services/financeurs.service.js`
3. `src/services/partenaires.service.js`
4. `src/services/structures.service.js`

#### Étape 1.2.4 : Créer Structure Module Partenaires

**Tâches :**
- [ ] Créer `src/modules/partenaires/`
- [ ] Créer `PartenairesModule.jsx` avec structure de base
- [ ] Créer `PartenairesModule.css`
- [ ] Créer dossier `tabs/` avec structure :
  ```
  tabs/
  ├── dashboard/
  │   └── PartenairesDashboard.jsx
  ├── organismes-internationaux/
  │   ├── OrganismesListe.jsx
  │   ├── OrganismeDetail.jsx
  │   └── OrganismeForm.jsx
  ├── financeurs/
  │   ├── FinanceursListe.jsx
  │   ├── FinanceurDetail.jsx
  │   ├── FinanceurForm.jsx
  │   └── HistoriqueFinancements.jsx
  ├── partenaires/
  │   ├── PartenairesListe.jsx
  │   ├── PartenaireDetail.jsx
  │   └── PartenaireForm.jsx
  ├── structures/
  │   ├── StructuresListe.jsx
  │   ├── StructureDetail.jsx
  │   └── StructureForm.jsx
  └── contacts/
      ├── ContactsListe.jsx
      ├── ContactDetail.jsx
      └── ContactForm.jsx
  ```

**Fichiers à créer :**
- 20+ fichiers pour toutes les pages et composants

#### Étape 1.2.5 : Implémenter CRUD pour chaque type

**Tâches par type :**

**Organismes :**
- [ ] `OrganismesListe.jsx` - Liste avec filtres
- [ ] `OrganismeDetail.jsx` - Détail complet
- [ ] `OrganismeForm.jsx` - Création/Modification

**Financeurs :**
- [ ] `FinanceursListe.jsx` - Liste avec filtres
- [ ] `FinanceurDetail.jsx` - Détail + historique financements
- [ ] `FinanceurForm.jsx` - Création/Modification
- [ ] `HistoriqueFinancements.jsx` - Historique des projets financés

**Partenaires :**
- [ ] `PartenairesListe.jsx` - Liste avec filtres
- [ ] `PartenaireDetail.jsx` - Détail complet
- [ ] `PartenaireForm.jsx` - Création/Modification

**Structures :**
- [ ] `StructuresListe.jsx` - Liste avec filtres
- [ ] `StructureDetail.jsx` - Détail complet
- [ ] `StructureForm.jsx` - Création/Modification

**Contacts :**
- [ ] `ContactsListe.jsx` - Base de données centralisée
- [ ] `ContactDetail.jsx` - Détail contact
- [ ] `ContactForm.jsx` - Création/Modification

#### Étape 1.2.6 : Créer Dashboard Partenaires

**Tâches :**
- [ ] Créer `PartenairesDashboard.jsx`
- [ ] KPIs : Nombre organismes, Financeurs actifs, Partenaires, Structures
- [ ] Graphiques : Répartition, Financements totaux
- [ ] Liste des derniers ajouts

#### Étape 1.2.7 : Ajouter Routes et Navigation

**Tâches :**
- [ ] Ajouter route `/partenaires` dans `routes.jsx`
- [ ] Ajouter menu dans `Sidebar.jsx`
- [ ] Tester navigation

#### Étape 1.2.8 : Intégrer avec Modules Existants

**Tâches :**
- [ ] Ajouter sélection financeur dans formulaire projet
- [ ] Ajouter sélection partenaire dans formulaire programme
- [ ] Lier structures aux bénéficiaires si nécessaire
- [ ] Afficher financeurs dans module financements

**Livrables Phase 1.2 :**
- ✅ Tables BDD créées
- ✅ Repositories et Services créés
- ✅ Module Partenaires complet avec 6 onglets
- ✅ CRUD complet pour tous les types
- ✅ Dashboard fonctionnel
- ✅ Intégration avec modules existants

---

## 🚀 PHASE 2 : CANDIDATURES PUBLIQUES (P0)

**Durée :** 2 semaines  
**Priorité :** P0 (Critique)  
**Objectif :** Permettre aux candidats de postuler sans authentification

---

### 2.1 FORMULAIRES DE RECRUTEMENT PUBLICS

**Durée estimée :** 1 semaine

#### Étape 2.1.1 : Créer Tables BDD

**Tâches :**
- [ ] Créer table `documents_candidats`
- [ ] Créer table `comptes_candidats`
- [ ] Créer table `notifications_candidats`
- [ ] Créer politiques RLS appropriées

**Script SQL :**

```sql
-- Documents candidats
CREATE TABLE public.documents_candidats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidat_id INTEGER REFERENCES public.candidats(id) ON DELETE CASCADE,
  type_document TEXT NOT NULL, -- CV, Diplome, Lettre, PieceIdentite, etc.
  nom_fichier TEXT NOT NULL,
  chemin_fichier TEXT NOT NULL,
  taille_fichier INTEGER,
  mime_type TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Comptes candidats (pour espace candidat)
CREATE TABLE public.comptes_candidats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  candidat_id INTEGER REFERENCES public.candidats(id),
  actif BOOLEAN DEFAULT true,
  email_verifie BOOLEAN DEFAULT false,
  token_verification TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notifications candidats
CREATE TABLE public.notifications_candidats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidat_id INTEGER REFERENCES public.candidats(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- Dossier_reçu, Évaluation, Acceptation, Refus, etc.
  message TEXT NOT NULL,
  lu BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.documents_candidats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comptes_candidats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications_candidats ENABLE ROW LEVEL SECURITY;
```

#### Étape 2.1.2 : Créer Service Upload Documents

**Tâches :**
- [ ] Créer `documents.service.js`
- [ ] Implémenter upload vers Supabase Storage
- [ ] Gérer les types de fichiers acceptés
- [ ] Valider taille des fichiers

**Fichiers à créer :**
1. `src/services/documents.service.js`

#### Étape 2.1.3 : Créer Page Publique Appel

**Tâches :**
- [ ] Créer `AppelPublic.jsx` (route publique, sans auth)
- [ ] Afficher détails de l'appel
- [ ] Afficher critères d'éligibilité
- [ ] Afficher documents requis
- [ ] Bouton "Postuler" vers formulaire

**Fichiers à créer :**
1. `src/pages/public/AppelPublic.jsx`
2. `src/pages/public/AppelPublic.css`

**Route publique :**
```jsx
{
  path: 'appel/:id',
  element: <AppelPublic />, // Pas de ProtectedRoute
}
```

#### Étape 2.1.4 : Créer Formulaire Candidature Public

**Tâches :**
- [ ] Créer `FormulaireRecrutement.jsx` (route publique)
- [ ] Formulaire avec :
  - Sélection de l'appel (si plusieurs ouverts)
  - Informations personnelles (nom, prénom, email, téléphone, etc.)
  - Upload de documents (CV, diplômes, lettres, etc.)
  - Validation en temps réel
  - Soumission
- [ ] Message de confirmation après soumission
- [ ] Option pour créer un compte pour suivre sa candidature

**Fichiers à créer :**
1. `src/pages/public/FormulaireRecrutement.jsx`
2. `src/pages/public/FormulaireRecrutement.css`
3. `src/components/public/UploadDocuments.jsx`

**Composants nécessaires :**
- `UploadDocuments.jsx` - Upload multiple fichiers
- Validation avec `EntityValidator`

#### Étape 2.1.5 : Créer Service Candidatures Publiques

**Tâches :**
- [ ] Créer `candidatures-public.service.js`
- [ ] Méthode `submitCandidature(data, documents)`
- [ ] Création automatique du candidat dans `candidats`
- [ ] Upload des documents
- [ ] Envoi notification email (optionnel)
- [ ] Création notification dans `notifications_candidats`

**Fichiers à créer :**
1. `src/services/candidatures-public.service.js`

#### Étape 2.1.6 : Gérer Documents Requis par Appel

**Tâches :**
- [ ] Ajouter champ `documents_requis` (JSONB) dans table `appels_candidatures`
- [ ] Migration SQL
- [ ] Mettre à jour `AppelForm.jsx` pour configurer documents requis
- [ ] Afficher dans `AppelPublic.jsx`
- [ ] Valider dans formulaire que tous les documents sont fournis

---

### 2.2 ESPACE CANDIDAT

**Durée estimée :** 1 semaine

#### Étape 2.2.1 : Créer Authentification Candidats

**Tâches :**
- [ ] Créer `auth-candidat.service.js`
- [ ] Méthodes : `signUp()`, `signIn()`, `signOut()`, `resetPassword()`
- [ ] Hashage des mots de passe (bcrypt ou Supabase)
- [ ] Génération token de vérification email
- [ ] Hook `useAuthCandidat.js` pour l'état

**Fichiers à créer :**
1. `src/services/auth-candidat.service.js`
2. `src/hooks/useAuthCandidat.js`

#### Étape 2.2.2 : Créer Pages Authentification Candidats

**Tâches :**
- [ ] Créer `LoginCandidat.jsx` (route publique)
- [ ] Créer `RegisterCandidat.jsx` (route publique)
- [ ] Créer `ForgotPasswordCandidat.jsx`
- [ ] Intégrer avec service d'authentification

**Fichiers à créer :**
1. `src/pages/public/auth/LoginCandidat.jsx`
2. `src/pages/public/auth/RegisterCandidat.jsx`
3. `src/pages/public/auth/ForgotPasswordCandidat.jsx`

#### Étape 2.2.3 : Créer Layout Candidat

**Tâches :**
- [ ] Créer `LayoutCandidat.jsx` avec header/navigation
- [ ] Routes protégées pour candidats
- [ ] Redirection si non authentifié

**Fichiers à créer :**
1. `src/components/layout/LayoutCandidat.jsx`
2. `src/components/layout/ProtectedRouteCandidat.jsx`

#### Étape 2.2.4 : Créer Espace Candidat

**Tâches :**
- [ ] Créer `MesCandidatures.jsx` - Liste des candidatures
- [ ] Créer `CandidatureDetail.jsx` - Détail d'une candidature
- [ ] Créer `NotificationsCandidat.jsx` - Liste des notifications
- [ ] Créer `MonProfil.jsx` - Profil candidat

**Fichiers à créer :**
1. `src/pages/candidat/MesCandidatures.jsx`
2. `src/pages/candidat/CandidatureDetail.jsx`
3. `src/pages/candidat/NotificationsCandidat.jsx`
4. `src/pages/candidat/MonProfil.jsx`

**Fonctionnalités :**
- Voir toutes ses candidatures avec statuts
- Voir détails d'une candidature
- Upload documents complémentaires
- Mettre à jour informations
- Voir notifications
- Télécharger documents soumis

#### Étape 2.2.5 : Système de Notifications

**Tâches :**
- [ ] Service pour créer notifications
- [ ] Afficher badge nombre notifications non lues
- [ ] Marquer comme lu
- [ ] Notification automatique quand statut change

**Fichiers à créer :**
1. `src/services/notifications-candidat.service.js`

#### Étape 2.2.6 : Ajouter Routes Candidat

**Tâches :**
- [ ] Routes publiques : `/appel/:id`, `/candidature/new`
- [ ] Routes auth : `/candidat/login`, `/candidat/register`
- [ ] Routes protégées : `/candidat/mes-candidatures`, `/candidat/notifications`

**Mise à jour `routes.jsx` :**

```jsx
// Routes publiques (pas de ProtectedRoute)
{
  path: 'appel/:id',
  element: <AppelPublic />,
},
{
  path: 'candidature/new',
  element: <FormulaireRecrutement />,
},
{
  path: 'candidat/login',
  element: <LoginCandidat />,
},
{
  path: 'candidat/register',
  element: <RegisterCandidat />,
},
// Routes protégées candidats
{
  path: 'candidat',
  element: (
    <ProtectedRouteCandidat>
      <LayoutCandidat />
    </ProtectedRouteCandidat>
  ),
  children: [
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
```

**Livrables Phase 2 :**
- ✅ Tables BDD pour documents et comptes candidats
- ✅ Formulaire de candidature public fonctionnel
- ✅ Upload de documents
- ✅ Authentification candidats
- ✅ Espace candidat complet
- ✅ Système de notifications

---

## 🚀 PHASE 3 : COMPLÉTION MODULES EXISTANTS (P1)

**Durée :** 4 semaines  
**Priorité :** P1 (Important)

---

### 3.1 COMPLÉTER MODULE BÉNÉFICIAIRES

**Durée estimée :** 1.5 semaines

#### Étape 3.1.1 : Onglet Formations

**Tâches :**
- [ ] Créer `CatalogueFormations.jsx` - Liste formations disponibles
- [ ] Créer `SessionsFormations.jsx` - Planification sessions
- [ ] Créer `SessionDetail.jsx` - Détail session
- [ ] Créer `EvaluationFormation.jsx` - Évaluation
- [ ] Créer `FormationForm.jsx` - Création/modification formation
- [ ] Créer service `formations.service.js`

**Tables BDD à créer/modifier :**

```sql
-- Formations
CREATE TABLE public.formations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  description TEXT,
  duree INTEGER, -- en heures
  type_formation TEXT, -- Présentiel, En ligne, Mixte
  competences_visées JSONB DEFAULT '[]'::jsonb,
  prerequis JSONB DEFAULT '[]'::jsonb,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sessions formations
CREATE TABLE public.sessions_formations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formation_id UUID REFERENCES public.formations(id),
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  lieu TEXT,
  formateur_id UUID REFERENCES public.users(id),
  places_max INTEGER,
  places_occupees INTEGER DEFAULT 0,
  statut TEXT DEFAULT 'Planifiée', -- Planifiée, En cours, Terminée, Annulée
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Participants formations
CREATE TABLE public.participants_formations (
  session_id UUID REFERENCES public.sessions_formations(id),
  beneficiaire_id INTEGER REFERENCES public.beneficiaires(id),
  statut TEXT DEFAULT 'Inscrit', -- Inscrit, Présent, Absent, Certifié
  evaluation JSONB DEFAULT '{}'::jsonb,
  certificat_delivre BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (session_id, beneficiaire_id)
);
```

**Fichiers à créer :**
- 6 fichiers pour formations
- 1 service

#### Étape 3.1.2 : Onglet Accompagnements

**Tâches :**
- [ ] Créer `Mentorat.jsx` - Liste mentorats
- [ ] Créer `Coaching.jsx` - Liste coachings
- [ ] Créer `SuiviPostFormation.jsx` - Suivi post-formation
- [ ] Créer `PlanningInterventions.jsx` - Planning général
- [ ] Créer composants détail pour chaque type

**Tables BDD à créer :**

```sql
-- Sessions mentorat
CREATE TABLE public.sessions_mentorat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiaire_id INTEGER REFERENCES public.beneficiaires(id),
  mentor_id UUID REFERENCES public.users(id),
  date_session DATE NOT NULL,
  duree INTEGER, -- en minutes
  objectif TEXT,
  notes TEXT,
  statut TEXT DEFAULT 'Planifiée',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sessions coaching (similaire)
CREATE TABLE public.sessions_coaching (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiaire_id INTEGER REFERENCES public.beneficiaires(id),
  coach_id UUID REFERENCES public.users(id),
  date_session DATE NOT NULL,
  duree INTEGER,
  objectif TEXT,
  notes TEXT,
  statut TEXT DEFAULT 'Planifiée',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Étape 3.1.3 : Onglet Suivi

**Tâches :**
- [ ] Créer `Insertions.jsx` - Liste insertions
- [ ] Créer `Suivi3Mois.jsx` - Questionnaires 3 mois
- [ ] Créer `Suivi6Mois.jsx` - Questionnaires 6 mois
- [ ] Créer `Suivi12Mois.jsx` - Questionnaires 12 mois
- [ ] Créer `InsertionForm.jsx` - Création insertion

**Tables BDD à créer/modifier :**

```sql
-- Insertions
CREATE TABLE public.insertions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiaire_id INTEGER REFERENCES public.beneficiaires(id),
  type_insertion TEXT NOT NULL, -- Emploi, Creation_entreprise
  date_insertion DATE NOT NULL,
  entreprise TEXT, -- Si emploi
  poste TEXT, -- Si emploi
  salaire NUMERIC, -- Si emploi
  nom_entreprise TEXT, -- Si création entreprise
  secteur TEXT, -- Si création entreprise
  statut TEXT DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Suivi insertions
CREATE TABLE public.suivi_insertions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insertion_id UUID REFERENCES public.insertions(id),
  type_suivi TEXT NOT NULL, -- 3mois, 6mois, 12mois
  date_suivi DATE NOT NULL,
  questionnaire JSONB DEFAULT '{}'::jsonb,
  statut TEXT, -- En emploi, Entreprise active, etc.
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 3.2 COMPLÉTER MODULE INTERVENANTS

**Durée estimée :** 1.5 semaines

#### Étape 3.2.1 : Onglet Mentors

**Tâches :**
- [ ] Créer `MentorsListe.jsx` - Liste complète
- [ ] Créer `MentorDetail.jsx` - Détail mentor
- [ ] Créer `MentorForm.jsx` - Création/modification
- [ ] Créer `DisponibilitesMentor.jsx` - Gestion disponibilités

#### Étape 3.2.2 : Portail Mentor

**Tâches :**
- [ ] Créer `DashboardMentor.jsx` - Dashboard personnel
- [ ] Créer `MesBeneficiaires.jsx` - Liste bénéficiaires assignés
- [ ] Créer `PlanningMentor.jsx` - Planning des sessions
- [ ] Créer `RapportsMentor.jsx` - Rapports d'activité
- [ ] Créer route `/intervenants/portail-mentor`

**Fichiers à créer :**
- 4 fichiers pour portail mentor
- Layout spécialisé pour portail

#### Étape 3.2.3 : Portail Formateur

**Tâches :**
- [ ] Créer `DashboardFormateur.jsx`
- [ ] Créer `MesFormations.jsx` - Formations à animer
- [ ] Créer `SessionsFormateur.jsx` - Sessions planifiées
- [ ] Créer `EvaluationsFormateur.jsx` - Évaluations à faire
- [ ] Créer route `/intervenants/portail-formateur`

**Fichiers à créer :**
- 4 fichiers pour portail formateur

#### Étape 3.2.4 : Portail Coach

**Tâches :**
- [ ] Créer `DashboardCoach.jsx`
- [ ] Créer `MesCoaches.jsx` - Liste bénéficiaires
- [ ] Créer `PlanningCoach.jsx`
- [ ] Créer `RapportsCoach.jsx`
- [ ] Créer route `/intervenants/portail-coach`

**Fichiers à créer :**
- 4 fichiers pour portail coach

---

### 3.3 COMPLÉTER MODULE REPORTING

**Durée estimée :** 1 semaine

#### Étape 3.3.1 : Rapports Préconfigurés

**Tâches :**
- [ ] Créer `RapportsPreconfigures.jsx` - Liste rapports
- [ ] Créer composants pour chaque type :
  - `RapportProgrammes.jsx`
  - `RapportProjets.jsx`
  - `RapportCandidatures.jsx`
  - `RapportBeneficiaires.jsx`
  - `RapportFinancier.jsx`
- [ ] Paramètres configurables (période, filtres)

#### Étape 3.3.2 : Exports

**Tâches :**
- [ ] Créer `ExportExcel.jsx` - Export Excel
- [ ] Créer `ExportPDF.jsx` - Export PDF
- [ ] Utiliser bibliothèques : `xlsx`, `jspdf`
- [ ] Créer `ExportHistory.jsx` - Historique exports

**Packages à installer :**
```bash
npm install xlsx jspdf html2canvas
```

#### Étape 3.3.3 : Analytics Avancées

**Tâches :**
- [ ] Créer `AnalyticsAvancees.jsx`
- [ ] Créer `DataExplorer.jsx` - Exploration données
- [ ] Créer `CustomDashboards.jsx` - Dashboards personnalisables

---

## 🚀 PHASE 4 : MODULE RESSOURCES HUMAINES (P1)

**Durée :** 2 semaines  
**Priorité :** P1 (Important)

### 4.1 CRÉER TABLES BDD

**Tâches :**
- [ ] Créer toutes les tables (employes, postes, competences, etc.)
- [ ] Créer politiques RLS
- [ ] Tester migrations

**Script SQL complet dans section précédente**

### 4.2 CRÉER REPOSITORIES ET SERVICES

**Tâches :**
- [ ] Créer `EmployeRepository.js`
- [ ] Créer `PosteRepository.js`
- [ ] Créer `CompetenceRepository.js`
- [ ] Créer services correspondants

### 4.3 CRÉER MODULE RH

**Tâches :**
- [ ] Créer structure complète du module
- [ ] Implémenter tous les onglets
- [ ] CRUD complet pour chaque entité

**Structure complète dans section précédente**

---

## 🚀 PHASE 5 : ADMINISTRATION COMPLÈTE (P2)

**Durée :** 2 semaines  
**Priorité :** P2 (Souhaitable)

### 5.1 GESTION UTILISATEURS

**Tâches :**
- [ ] Créer `UtilisateursListe.jsx`
- [ ] Créer `UtilisateurDetail.jsx`
- [ ] Créer `UtilisateurForm.jsx`
- [ ] CRUD complet

### 5.2 RÔLES ET PERMISSIONS

**Tâches :**
- [ ] Créer `RolesPermissions.jsx`
- [ ] Définir système de permissions
- [ ] Interface de configuration
- [ ] Assignation aux utilisateurs

### 5.3 CONFIGURATION SYSTÈME

**Tâches :**
- [ ] Créer `ConfigurationSysteme.jsx`
- [ ] Créer `Parametres.jsx`
- [ ] Créer `Notifications.jsx`

### 5.4 LOGS

**Tâches :**
- [ ] Créer `LogsAudit.jsx`
- [ ] Créer `LogsSysteme.jsx`
- [ ] Créer `LogsExports.jsx`

---

## 📋 RÉSUMÉ DES PRIORITÉS

### P0 (Critique) - À faire en premier
1. ✅ Séparer Programmes et Projets
2. ✅ Créer Module Partenaires/Structures
3. ✅ Candidatures Publiques

### P1 (Important) - À faire ensuite
4. ✅ Compléter Bénéficiaires
5. ✅ Compléter Intervenants
6. ✅ Compléter Reporting
7. ✅ Créer Module RH

### P2 (Souhaitable) - À faire en dernier
8. ✅ Compléter Administration

---

## 🎯 ESTIMATION TOTALE

- **Phase 0** : 1 semaine
- **Phase 1** : 2-3 semaines
- **Phase 2** : 2 semaines
- **Phase 3** : 4 semaines
- **Phase 4** : 2 semaines
- **Phase 5** : 2 semaines

**TOTAL : 13-14 semaines (3-3.5 mois)**

---

## ✅ PROCHAINES ÉTAPES

1. Valider ce plan
2. Commencer Phase 0 : Analyse et Planification
3. Préparer environnement de développement
4. Créer backlog détaillé dans outil de gestion de projet

---

**Document créé le :** 2025-01-XX  
**Version :** 1.0  
**Statut :** ✅ Plan complet prêt pour implémentation

