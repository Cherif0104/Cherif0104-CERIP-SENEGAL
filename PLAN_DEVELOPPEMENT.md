# 📋 PLAN DE DÉVELOPPEMENT COMPLET - ERP CERIP SENEGAL

## 🔍 ANALYSE DE L'ÉTAT ACTUEL

### ✅ Ce qui existe encore

- **Fichiers de documentation** :
  - `README.md` - Description du projet et fonctionnalités
  - `AUTHENTICATION_SETUP.md` - Configuration authentification Supabase
  - `package-lock.json` - Vide (pas de dépendances installées)

- **Configuration** :
  - Fichier `.env.local` mentionné (clés API Supabase)

### ❌ Ce qui a été supprimé

- **Structure complète du projet** (aucun dossier `src/`, `public/`, etc.)
- **Fichiers de configuration** (`package.json`, `vite.config.js`, etc.)
- **Tous les composants React**
- **Toutes les pages**
- **Tous les services**
- **Tous les styles**
- **Toutes les routes**

---

## 🎯 VISION DU PROJET

### Contexte
ERP (Enterprise Resource Planning) moderne pour la gestion complète des programmes d'insertion professionnelle au Sénégal (CERIP).

### Objectifs stratégiques
1. **Gestion complète des programmes** : De la création à la clôture
2. **Pipeline de candidatures** : Candidats → Éligibles → Bénéficiaires
3. **Suivi des bénéficiaires** : Dossiers 360°, formations, accompagnements, insertions
4. **Management des intervenants** : Mentors, formateurs, coaches
5. **Reporting avancé** : KPIs, métriques, analytics
6. **Risk Management** : Gestion des risques selon ISO 31000
7. **Conformité** : Standards ISO 9001 et conformité aux spécificités CERIP

### Spécificités CERIP
- **Taux d'insertion** : 72% (suivi en temps réel)
- **210 projets accompagnés** (dashboard dédié)
- **403 plans d'affaires** (module de gestion)
- **1500+ personnes formées** (statistiques formations)
- **200+ porteurs de projets incubés** (suivi détaillé)
- **Programmes spécifiques** : We4A (GIZ), FEMMPACT, etc.

---

## 🏗️ ARCHITECTURE PROPOSÉE

### Structure du projet

```
CERIP-SENEGAL/
├── public/                          # Assets statiques
│   ├── favicon.ico
│   └── logo.svg
├── src/
│   ├── assets/                      # Images, fonts, etc.
│   ├── components/                  # Composants réutilisables
│   │   ├── common/                  # Composants communs
│   │   │   ├── Icon.jsx
│   │   │   ├── LoadingState.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   └── DataTable.jsx
│   │   ├── layout/                  # Layout components
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   └── modules/                 # Composants modules
│   │       ├── ModuleHeader.jsx
│   │       ├── ModuleTabs.jsx
│   │       ├── KPICard.jsx
│   │       ├── MetricCard.jsx
│   │       ├── FunnelVisualization.jsx
│   │       ├── AlertsSection.jsx
│   │       ├── RiskMatrix.jsx
│   │       └── [ModuleDashboards]   # Dashboards par module
│   ├── modules/                     # Modules principaux
│   │   ├── programmes-projets/
│   │   │   ├── ProgrammesProjetsModule.jsx
│   │   │   ├── ProgrammesProjetsModule.css
│   │   │   └── dashboard/
│   │   │       └── ProgrammesProjetsDashboard.jsx
│   │   ├── candidatures/
│   │   │   ├── CandidaturesModule.jsx
│   │   │   ├── CandidaturesModule.css
│   │   │   └── dashboard/
│   │   │       └── CandidaturesDashboard.jsx
│   │   ├── beneficiaires/
│   │   │   ├── BeneficiairesModule.jsx
│   │   │   ├── BeneficiairesModule.css
│   │   │   └── dashboard/
│   │   │       └── BeneficiairesDashboard.jsx
│   │   ├── intervenants/
│   │   │   ├── IntervenantsModule.jsx
│   │   │   ├── IntervenantsModule.css
│   │   │   └── dashboard/
│   │   │       └── IntervenantsDashboard.jsx
│   │   ├── reporting/
│   │   │   ├── ReportingModule.jsx
│   │   │   ├── ReportingModule.css
│   │   │   └── dashboard/
│   │   │       └── ReportingDashboard.jsx
│   │   └── administration/
│   │       ├── AdministrationModule.jsx
│   │       ├── AdministrationModule.css
│   │       └── dashboard/
│   │           └── AdministrationDashboard.jsx
│   ├── pages/                       # Pages de l'application
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── dashboard/
│   │   │   ├── Dashboard.jsx        # Dashboard principal
│   │   │   └── Dashboard.css
│   │   ├── programmes/
│   │   │   ├── Programmes.jsx
│   │   │   ├── ProgrammeDetail.jsx
│   │   │   └── ProgrammeForm.jsx
│   │   ├── projets/
│   │   │   ├── Projets.jsx
│   │   │   ├── ProjetDetail.jsx
│   │   │   └── ProjetForm.jsx
│   │   ├── candidatures/
│   │   │   ├── AppelsCandidatures.jsx
│   │   │   ├── CandidatsPipeline.jsx
│   │   │   ├── Dossiers.jsx
│   │   │   └── CandidatDetail.jsx
│   │   ├── beneficiaires/
│   │   │   ├── Beneficiaires.jsx
│   │   │   ├── BeneficiaireDetail.jsx
│   │   │   └── BeneficiaireForm.jsx
│   │   ├── formations/
│   │   │   ├── Formations.jsx
│   │   │   └── FormationDetail.jsx
│   │   ├── intervenants/
│   │   │   ├── Mentors.jsx
│   │   │   ├── PortailMentor.jsx
│   │   │   ├── PortailFormateur.jsx
│   │   │   └── PortailCoach.jsx
│   │   ├── reporting/
│   │   │   └── Rapports.jsx
│   │   └── admin/
│   │       └── Referentiels.jsx
│   ├── services/                    # Services métier
│   │   ├── auth.service.js          # Authentification Supabase
│   │   ├── programmes.service.js
│   │   ├── projets.service.js
│   │   ├── candidatures.service.js
│   │   ├── beneficiaires.service.js
│   │   ├── analytics.service.js     # KPIs, statistiques
│   │   ├── riskManagement.service.js # ISO 31000
│   │   ├── resourceManagement.service.js # Ressources
│   │   ├── compliance.service.js    # ISO 9001
│   │   └── moduleStats.service.js   # Stats par module
│   ├── lib/                         # Configuration
│   │   └── supabase.js              # Client Supabase
│   ├── hooks/                       # Hooks React personnalisés
│   │   ├── useAuth.js
│   │   ├── useProgrammes.js
│   │   └── useAnalytics.js
│   ├── utils/                       # Utilitaires
│   │   ├── format.js
│   │   ├── validation.js
│   │   └── constants.js
│   ├── data/                        # Données statiques
│   │   └── referentiels.js
│   ├── styles/                      # Styles globaux
│   │   ├── globals.css
│   │   ├── modules.css              # Styles modules unifiés
│   │   └── variables.css            # Variables CSS
│   ├── App.jsx                      # Composant racine
│   ├── main.jsx                     # Point d'entrée
│   └── routes.jsx                   # Configuration routes
├── .env.local                       # Variables d'environnement (existant)
├── .env.example                     # Template .env
├── .gitignore
├── package.json                     # À créer
├── vite.config.js                   # À créer
├── vercel.json                      # Configuration déploiement
├── README.md                        # Existant
└── AUTHENTICATION_SETUP.md          # Existant
```

---

## 📐 DESIGN SYSTEM

### Palette de couleurs

```css
/* Couleurs principales CERIP */
--cerip-red: #dc2626;
--cerip-red-dark: #991b1b;
--cerip-blue: #2563eb;
--cerip-blue-dark: #1d4ed8;
--cerip-violet: #7c3aed;
--cerip-violet-dark: #6d28d9;
--cerip-orange: #f59e0b;
--cerip-orange-dark: #d97706;
--cerip-green: #10b981;
--cerip-green-dark: #059669;

/* Couleurs système */
--bg-primary: #ffffff;
--bg-secondary: #f9fafb;
--bg-tertiary: #f3f4f6;
--text-primary: #111827;
--text-secondary: #6b7280;
--border-color: #e5e7eb;

/* Couleurs statut */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

### Typographie

- **Famille** : Inter, system-ui, -apple-system
- **Tailles** : 12px, 14px, 16px, 18px, 24px, 32px
- **Poids** : 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Composants réutilisables

1. **ModuleHeader** : Titre, sous-titre, actions, refresh, badge MAJ
2. **ModuleTabs** : Système d'onglets unifié avec navigation par query params
3. **KPICard** : Carte KPI avec icône, valeur, label, trend (variantes : primary, secondary, accent, success)
4. **MetricCard** : Carte métrique avec progress bar, header, valeur, détail
5. **FunnelVisualization** : Visualisation en entonnoir (funnel chart)
6. **AlertsSection** : Section d'alertes avec priorité
7. **RiskMatrix** : Matrice de risques interactive
8. **DataTable** : Tableau de données moderne avec tri, filtres, pagination

### Espacements

- **Spacing scale** : 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
- **Border radius** : 4px, 6px, 8px, 12px, 16px
- **Shadows** : 0-4px, 0-8px, 0-12px

---

## 🎨 MODULES ET FONCTIONNALITÉS

### 1. Module Programmes & Projets

#### Dashboard
- **KPIs** :
  - Programmes actifs
  - Projets en cours
  - Budget total
  - Taux d'avancement global
- **Métriques** :
  - Budget consommé vs alloué
  - Financements reçus vs prévus
  - Jalons atteints vs prévus
  - Retards moyens
- **Funnel** : Programmes → Projets → Appels → Candidats
- **Alertes** :
  - Budgets critiques (>75%, >90%, >100%)
  - Jalons en retard
  - Financements manquants
  - Dépenses non validées

#### Tabs
1. **Dashboard** : Vue d'ensemble avec KPIs et métriques
2. **Programmes** : Liste des programmes (PRG)
   - Création, modification, clôture
   - Liens vers projets
   - Budget global
   - Financements
3. **Projets** : Liste des projets (PRJ)
   - Création, modification, clôture
   - Liens vers programme parent
   - Budget, jalons, échéances
   - Chef de projet assigné
4. **Appels** : Liste des appels à candidatures (APL)
   - Création, ouverture, fermeture
   - Liens vers projet parent
   - Critères d'éligibilité
5. **Pipeline** : Pipeline de candidats
   - Vue kanban : Candidats → Éligibles → Bénéficiaires
   - Filtres par statut, projet, appel

---

### 2. Module Candidatures

#### Dashboard
- **KPIs** :
  - Appels ouverts
  - Candidats en pipeline
  - Taux de conversion global
  - Dossiers en attente
- **Métriques** :
  - Candidats éligibles vs non éligibles
  - Taux d'éligibilité par appel
  - Dossiers complétés vs incomplets
- **Funnel** : Candidats → Éligibles → Convertis → Bénéficiaires
- **Alertes** :
  - Appels à fermer (échéance proche)
  - Dossiers en attente depuis >7 jours
  - Candidats bloqués sans raison

#### Tabs
1. **Dashboard** : Vue d'ensemble
2. **Appels** : Gestion des appels à candidatures
3. **Pipeline** : Pipeline de candidats (vue kanban)
4. **Dossiers** : Liste des dossiers de candidature
   - Statut : En attente, En cours, Validé, Refusé
   - Documents à compléter
   - Évaluation d'éligibilité

---

### 3. Module Bénéficiaires

#### Dashboard
- **KPIs** :
  - Bénéficiaires actifs
  - Taux d'insertion (72% CERIP)
  - Formations dispensées
  - Accompagnements en cours
- **Métriques** :
  - Insertions réalisées (emploi, création entreprise)
  - Projets créés par bénéficiaires
  - Revenus générés
  - Taux de complétion formations
- **Funnel** : Bénéficiaires → Formations → Accompagnements → Insertions
- **Alertes** :
  - Bénéficiaires sans accompagnement
  - Formations en retard
  - Insertions non documentées

#### Tabs
1. **Dashboard** : Vue d'ensemble
2. **Liste** : Liste des bénéficiaires (BEN)
   - Dossier 360° (diagnostic, plan d'action, suivi)
   - Statut : Pré-incubation, Incubation, Post-incubation, Inséré
   - Historique formations et accompagnements
3. **Formations** : Gestion des formations
   - Catalogue de formations
   - Sessions planifiées et réalisées
   - Participants par session
   - Évaluations
4. **Accompagnements** : Gestion des accompagnements
   - Mentoring
   - Coaching
   - Suivi post-formation
5. **Suivi** : Suivi des insertions
   - Insertions professionnelles
   - Créations d'entreprise
   - Suivi à 3, 6, 12 mois

---

### 4. Module Intervenants

#### Dashboard
- **KPIs** :
  - Mentors actifs
  - Formateurs actifs
  - Coaches actifs
  - Charge de travail moyenne
- **Métriques** :
  - Taux d'occupation
  - Performance intervenants
  - Satisfaction bénéficiaires
  - Disponibilités
- **Alertes** :
  - Surcharge intervenants
  - Disponibilités manquantes
  - Évaluations en attente

#### Tabs
1. **Dashboard** : Vue d'ensemble
2. **Mentors** : Liste des mentors
3. **Portail Mentor** : Interface dédiée mentors
   - Bénéficiaires assignés
   - Sessions de mentoring
   - Suivi et notes
4. **Portail Formateur** : Interface dédiée formateurs
   - Formations assignées
   - Sessions à animer
   - Évaluations à compléter
5. **Portail Coach** : Interface dédiée coaches
   - Accompagnements assignés
   - Suivi des bénéficiaires
   - Rapports de coaching

---

### 5. Module Reporting & Analytics

#### Dashboard
- **KPIs** :
  - Rapports générés (mois)
  - Rapports en attente
  - Taux de complétion
  - Exports réalisés
- **Métriques** :
  - Rapports par type
  - Rapports par module
  - Temps moyen de génération
- **Alertes** :
  - Rapports en retard
  - Données manquantes pour rapports

#### Tabs
1. **Dashboard** : Vue d'ensemble
2. **Rapports** : Liste des rapports disponibles
   - Rapports programmes
   - Rapports projets
   - Rapports bénéficiaires
   - Rapports financiers
   - Rapports conformité
3. **Analytics** : Analyses avancées
   - Tendances
   - Comparaisons période
   - Prévisions
   - Tableaux de bord personnalisés

---

### 6. Module Administration

#### Dashboard
- **KPIs** :
  - Utilisateurs actifs
  - Référentiels configurés
  - Modules activés
- **Métriques** :
  - Activité système
  - Taux de conformité
  - Erreurs système
- **Alertes** :
  - Configuration manquante
  - Référentiels à compléter
  - Sauvegardes à planifier

#### Tabs
1. **Dashboard** : Vue d'ensemble
2. **Référentiels** : Gestion des référentiels
   - Secteurs d'activité
   - Types de financement
   - Statuts projets
   - Types d'intervenants
   - etc.
3. **Utilisateurs** : Gestion des utilisateurs
   - Création, modification, désactivation
   - Gestion des rôles
   - Permissions
4. **Configuration** : Configuration système
   - Paramètres généraux
   - Intégrations
   - Notifications
   - Sauvegardes

---

## 🔐 AUTHENTIFICATION & SÉCURITÉ

### Authentification Supabase
- **Méthode** : Supabase Auth uniquement (pas de BYPASS)
- **Rôles** :
  - `ADMIN_SERIP` : Administrateur (accès complet)
  - `CHEF_PROJET` : Chef de projet
  - `MENTOR` : Mentor
  - `FORMATEUR` : Formateur
  - `COACH` : Coach

### Structure base de données
```sql
-- Table users
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  nom TEXT,
  prenom TEXT,
  role TEXT NOT NULL DEFAULT 'ADMIN_SERIP',
  telephone TEXT,
  actif BOOLEAN DEFAULT true,
  date_creation TIMESTAMP DEFAULT NOW(),
  date_modification TIMESTAMP DEFAULT NOW()
);

-- Trigger automatique pour création profil
-- (Voir AUTHENTICATION_SETUP.md)
```

### Row Level Security (RLS)
- Politiques RLS configurées pour toutes les tables
- Accès basé sur les rôles
- Isolation des données par utilisateur/intervenant

---

## 📊 RISK MANAGEMENT (ISO 31000)

### Types de risques

#### 1. Risque budgétaire (30% poids)
- **Dépassement budget** : Consommé > Alloué
- **Sous-consommation** : Consommé << Alloué (mauvais signal)
- **Écarts prévision/réalisation** : Déviation > 10%

#### 2. Risque opérationnel (25% poids)
- **Retards jalons** : Jalon en retard > 7 jours
- **Indicateurs non atteints** : KPI < Objectif
- **Délais dépassés** : Échéance dépassée

#### 3. Risque financier (20% poids)
- **Financements non reçus** : Financement prévu non reçu
- **Engagements non honorés** : Engagement non respecté
- **Délais de paiement** : Paiement en retard > 30 jours

#### 4. Risque de conformité (15% poids)
- **Rapports en retard** : Rapport non soumis à l'échéance
- **Documents manquants** : Documents obligatoires manquants
- **Non-conformité ISO** : Écart par rapport aux standards

#### 5. Risque de performance (10% poids)
- **Taux de conversion faible** : Conversion < 30%
- **Taux d'insertion faible** : Insertion < 50%
- **Objectifs non atteints** : Objectif < 80%

### Calcul du score de risque
```
Score = (Probabilité × Impact) / 100
Niveaux :
- LOW (0-25)
- MEDIUM (25-50)
- HIGH (50-75)
- CRITICAL (75-100)

Score global = Σ(Score_risque × Poids) / 100
```

### Composants Risk Management
- **RiskDashboard** : Vue d'ensemble des risques
- **RiskMatrix** : Matrice interactive (Probabilité × Impact)
- **RiskAlerts** : Alertes prioritaires
- **RiskMitigation** : Plans d'action et suivi

---

## 📈 KPI ET MÉTRIQUES

### KPI opérationnels
- Taux de conversion (Candidats → Bénéficiaires)
- Taux d'insertion (Bénéficiaires → Insertions) : **72% CERIP**
- Taux de satisfaction
- Nombre de projets accompagnés : **210 CERIP**
- Nombre de formations dispensées : **1500+ CERIP**
- Taux de complétion formations
- Plans d'affaires : **403 CERIP**
- Porteurs incubés : **200+ CERIP**

### KPI financiers
- Budget consommé vs alloué
- Financements reçus vs prévus
- Coût par bénéficiaire
- ROI (Retour sur Investissement)
- Écart budgétaire moyen

### KPI de risque
- Score de risque global
- Nombre de risques critiques
- Taux de mitigation
- Temps moyen de résolution

### KPI de conformité
- Taux de conformité ISO
- Rapports à jour
- Documents complétés
- Audit trail complet

---

## 🗄️ STRUCTURE BASE DE DONNÉES

### Tables principales

#### Programmes (programmes)
- id, code (PRG-XXX), nom, description
- date_debut, date_fin, budget_total
- statut, responsable_id
- created_at, updated_at

#### Projets (projets)
- id, code (PRJ-XXX), nom, description
- programme_id (FK), date_debut, date_fin
- budget_alloue, budget_consomme
- chef_projet_id (FK), statut
- jalons (JSON), created_at, updated_at

#### Appels à candidatures (appels_candidatures)
- id, code (APL-XXX), nom, description
- projet_id (FK), date_ouverture, date_fermeture
- criteres_eligibilite (JSON), statut
- created_at, updated_at

#### Candidats (candidats)
- id, code (CAN-XXX), nom, prenom, email
- appel_id (FK), statut
- date_candidature, eligible
- dossier (JSON), created_at, updated_at

#### Bénéficiaires (beneficiaires)
- id, code (BEN-XXX), candidat_id (FK)
- statut (Pré-incubation, Incubation, Post-incubation, Inséré)
- diagnostic (JSON), plan_action (JSON)
- mentor_id (FK), coach_id (FK)
- created_at, updated_at

#### Formations (formations)
- id, nom, description, duree
- formateur_id (FK), date_planifiee, date_realisee
- participants (JSON), evaluation (JSON)
- created_at, updated_at

#### Insertions (insertions)
- id, beneficiaire_id (FK)
- type (Emploi, Création entreprise)
- date_insertion, suivi_3mois, suivi_6mois, suivi_12mois
- created_at, updated_at

#### Intervenants (intervenants)
- id, user_id (FK), type (Mentor, Formateur, Coach)
- specialite, disponibilite
- charge_travail, performance
- created_at, updated_at

#### Financements (financements)
- id, projet_id (FK), montant, date_prevu, date_recu
- statut, source, created_at, updated_at

#### Risques (risques)
- id, projet_id (FK), type, probabilite, impact
- score, niveau, plan_mitigation
- statut, created_at, updated_at

---

## 🚀 PLAN D'IMPLÉMENTATION

### Phase 1 : Infrastructure de base (Priorité 1)

#### Étape 1.1 : Configuration du projet
- [ ] Créer `package.json` avec dépendances
  - React 19, Vite, React Router DOM v6
  - Supabase client
  - Lucide React (icônes)
  - Recharts (graphiques)
- [ ] Créer `vite.config.js`
- [ ] Créer `.env.example`
- [ ] Créer `.gitignore`
- [ ] Installer dépendances

#### Étape 1.2 : Configuration Supabase
- [ ] Créer `src/lib/supabase.js` (client Supabase)
- [ ] Vérifier connexion à Supabase
- [ ] Configurer variables d'environnement

#### Étape 1.3 : Structure de base
- [ ] Créer structure de dossiers complète
- [ ] Créer `src/main.jsx` (point d'entrée)
- [ ] Créer `src/App.jsx` (composant racine)
- [ ] Créer `src/routes.jsx` (configuration routes)

---

### Phase 2 : Authentification (Priorité 1)

#### Étape 2.1 : Services authentification
- [ ] Créer `src/services/auth.service.js`
  - signIn, signUp, signOut
  - getCurrentUser, getUserProfile
  - ensureUserProfile
- [ ] Créer hook `src/hooks/useAuth.js`

#### Étape 2.2 : Pages authentification
- [ ] Créer `src/pages/auth/Login.jsx`
- [ ] Créer `src/pages/auth/Register.jsx`
- [ ] Créer `src/components/layout/ProtectedRoute.jsx`

#### Étape 2.3 : Layout principal
- [ ] Créer `src/components/layout/Header.jsx`
- [ ] Créer `src/components/layout/Sidebar.jsx`
- [ ] Créer `src/components/layout/Layout.jsx`

---

### Phase 3 : Design System (Priorité 1)

#### Étape 3.1 : Styles globaux
- [ ] Créer `src/styles/variables.css` (variables CSS)
- [ ] Créer `src/styles/globals.css` (styles globaux)
- [ ] Créer `src/styles/modules.css` (styles modules unifiés)

#### Étape 3.2 : Composants communs
- [ ] Créer `src/components/common/Icon.jsx`
- [ ] Créer `src/components/common/LoadingState.jsx`
- [ ] Créer `src/components/common/EmptyState.jsx`
- [ ] Créer `src/components/common/Button.jsx`
- [ ] Créer `src/components/common/Input.jsx`
- [ ] Créer `src/components/common/Select.jsx`
- [ ] Créer `src/components/common/DataTable.jsx`

---

### Phase 4 : Dashboard principal (Priorité 1)

#### Étape 4.1 : Dashboard
- [ ] Créer `src/pages/dashboard/Dashboard.jsx`
- [ ] Créer `src/pages/dashboard/Dashboard.css`
- [ ] Implémenter KPIs principaux
- [ ] Implémenter métriques globales
- [ ] Implémenter graphiques (Recharts)

#### Étape 4.2 : Services analytics
- [ ] Créer `src/services/analytics.service.js`
  - Calcul KPIs globaux
  - Calcul métriques
  - Statistiques par module

---

### Phase 5 : Composants modules réutilisables (Priorité 2)

#### Étape 5.1 : Composants de base
- [ ] Créer `src/components/modules/ModuleHeader.jsx` + CSS
- [ ] Créer `src/components/modules/ModuleTabs.jsx` + CSS
- [ ] Créer `src/components/modules/KPICard.jsx` + CSS
- [ ] Créer `src/components/modules/MetricCard.jsx` + CSS

#### Étape 5.2 : Composants avancés
- [ ] Créer `src/components/modules/FunnelVisualization.jsx` + CSS
- [ ] Créer `src/components/modules/AlertsSection.jsx` + CSS
- [ ] Créer `src/components/modules/RiskMatrix.jsx` + CSS

---

### Phase 6 : Services métier (Priorité 2)

#### Étape 6.1 : Services CRUD
- [ ] Créer `src/services/programmes.service.js`
- [ ] Créer `src/services/projets.service.js`
- [ ] Créer `src/services/candidatures.service.js`
- [ ] Créer `src/services/beneficiaires.service.js`

#### Étape 6.2 : Services avancés
- [ ] Créer/Améliorer `src/services/riskManagement.service.js`
  - Calculs risques (budget, opérationnel, financier, conformité, performance)
  - Matrice de risques
  - Score de risque global
  - Alertes risques
- [ ] Créer/Améliorer `src/services/resourceManagement.service.js`
  - Ressources humaines
  - Ressources financières
  - Ressources temporelles
- [ ] Créer/Améliorer `src/services/compliance.service.js`
  - Conformité ISO 31000
  - Conformité ISO 9001
  - Audit trail
- [ ] Créer `src/services/moduleStats.service.js`
  - Statistiques par module
  - KPIs par module

---

### Phase 7 : Module Programmes & Projets (Priorité 2)

#### Étape 7.1 : Dashboard module
- [ ] Créer `src/components/modules/ProgrammesProjetsDashboard.jsx`
- [ ] Intégrer KPIs, métriques, funnel, alertes

#### Étape 7.2 : Tabs
- [ ] Créer `src/components/modules/ProgrammesTab.jsx`
- [ ] Créer `src/components/modules/ProjetsTab.jsx`
- [ ] Créer `src/components/modules/AppelsTab.jsx`
- [ ] Créer `src/components/modules/PipelineTab.jsx`

#### Étape 7.3 : Pages
- [ ] Créer `src/pages/programmes/Programmes.jsx`
- [ ] Créer `src/pages/programmes/ProgrammeDetail.jsx`
- [ ] Créer `src/pages/programmes/ProgrammeForm.jsx`
- [ ] Créer `src/pages/projets/Projets.jsx`
- [ ] Créer `src/pages/projets/ProjetDetail.jsx`
- [ ] Créer `src/pages/projets/ProjetForm.jsx`
- [ ] Créer `src/pages/candidatures/AppelsCandidatures.jsx`
- [ ] Créer `src/pages/candidatures/CandidatsPipeline.jsx`

#### Étape 7.4 : Module complet
- [ ] Créer `src/modules/programmes-projets/ProgrammesProjetsModule.jsx`
- [ ] Créer `src/modules/programmes-projets/ProgrammesProjetsModule.css`

---

### Phase 8 : Module Candidatures (Priorité 2)

#### Étape 8.1 : Dashboard module
- [ ] Créer `src/components/modules/CandidaturesDashboard.jsx`

#### Étape 8.2 : Tabs
- [ ] Créer `src/components/modules/DossiersTab.jsx`

#### Étape 8.3 : Pages
- [ ] Créer `src/pages/candidatures/Dossiers.jsx`
- [ ] Créer `src/pages/candidatures/CandidatDetail.jsx`

#### Étape 8.4 : Module complet
- [ ] Créer `src/modules/candidatures/CandidaturesModule.jsx`
- [ ] Créer `src/modules/candidatures/CandidaturesModule.css`

---

### Phase 9 : Module Bénéficiaires (Priorité 2)

#### Étape 9.1 : Dashboard module
- [ ] Créer `src/components/modules/BeneficiairesDashboard.jsx`

#### Étape 9.2 : Tabs
- [ ] Créer `src/components/modules/BeneficiairesListeTab.jsx`
- [ ] Créer `src/components/modules/FormationsTab.jsx`
- [ ] Créer `src/components/modules/AccompagnementsTab.jsx`
- [ ] Créer `src/components/modules/SuiviTab.jsx`

#### Étape 9.3 : Pages
- [ ] Créer `src/pages/beneficiaires/Beneficiaires.jsx`
- [ ] Créer `src/pages/beneficiaires/BeneficiaireDetail.jsx`
- [ ] Créer `src/pages/beneficiaires/BeneficiaireForm.jsx`
- [ ] Créer `src/pages/formations/Formations.jsx`
- [ ] Créer `src/pages/formations/FormationDetail.jsx`

#### Étape 9.4 : Module complet
- [ ] Créer `src/modules/beneficiaires/BeneficiairesModule.jsx`
- [ ] Créer `src/modules/beneficiaires/BeneficiairesModule.css`

---

### Phase 10 : Module Intervenants (Priorité 3)

#### Étape 10.1 : Dashboard module
- [ ] Créer `src/components/modules/IntervenantsDashboard.jsx`

#### Étape 10.2 : Tabs
- [ ] Créer `src/components/modules/PortailMentorTab.jsx`
- [ ] Créer `src/components/modules/PortailFormateurTab.jsx`
- [ ] Créer `src/components/modules/PortailCoachTab.jsx`

#### Étape 10.3 : Pages
- [ ] Créer `src/pages/intervenants/Mentors.jsx`
- [ ] Créer `src/pages/intervenants/PortailMentor.jsx`
- [ ] Créer `src/pages/intervenants/PortailFormateur.jsx`
- [ ] Créer `src/pages/intervenants/PortailCoach.jsx`

#### Étape 10.4 : Module complet
- [ ] Créer `src/modules/intervenants/IntervenantsModule.jsx`
- [ ] Créer `src/modules/intervenants/IntervenantsModule.css`

---

### Phase 11 : Module Reporting (Priorité 3)

#### Étape 11.1 : Dashboard module
- [ ] Créer `src/components/modules/ReportingDashboard.jsx`

#### Étape 11.2 : Tabs
- [ ] Créer `src/components/modules/RapportsTab.jsx`

#### Étape 11.3 : Pages
- [ ] Créer `src/pages/reporting/Rapports.jsx`

#### Étape 11.4 : Module complet
- [ ] Créer `src/modules/reporting/ReportingModule.jsx`
- [ ] Créer `src/modules/reporting/ReportingModule.css`

---

### Phase 12 : Module Administration (Priorité 3)

#### Étape 12.1 : Dashboard module
- [ ] Créer `src/components/modules/AdministrationDashboard.jsx`

#### Étape 12.2 : Tabs
- [ ] Créer `src/components/modules/ReferentielsTab.jsx`
- [ ] Créer `src/components/modules/UtilisateursTab.jsx`
- [ ] Créer `src/components/modules/ConfigurationTab.jsx`

#### Étape 12.3 : Pages
- [ ] Créer `src/pages/admin/Referentiels.jsx`

#### Étape 12.4 : Module complet
- [ ] Créer `src/modules/administration/AdministrationModule.jsx`
- [ ] Créer `src/modules/administration/AdministrationModule.css`

---

### Phase 13 : Intégration et tests (Priorité 4)

#### Étape 13.1 : Mise à jour App.jsx
- [ ] Importer tous les modules
- [ ] Configurer toutes les routes
- [ ] Gérer la navigation

#### Étape 13.2 : Tests
- [ ] Tester authentification
- [ ] Tester chaque module
- [ ] Tester navigation
- [ ] Tester calculs KPIs
- [ ] Tester Risk Management
- [ ] Tester conformité

#### Étape 13.3 : Optimisations
- [ ] Optimiser performances
- [ ] Gérer erreurs
- [ ] Ajouter loading states
- [ ] Gérer cas limites

---

## 📝 CONVENTIONS DE CODE

### Nomenclature

#### Fichiers
- **Composants** : PascalCase (`ProgrammesProjetsModule.jsx`)
- **Services** : camelCase (`auth.service.js`)
- **Hooks** : camelCase avec préfixe `use` (`useAuth.js`)
- **Utilitaires** : camelCase (`format.js`)
- **Styles** : kebab-case (`modules.css`)

#### Code
- **Variables** : camelCase (`const programmeId = ...`)
- **Constantes** : UPPER_SNAKE_CASE (`const MAX_ITEMS = ...`)
- **Composants** : PascalCase (`const ProgrammeCard = () => ...`)
- **Fonctions** : camelCase (`const calculateKPI = () => ...`)

### Structure composant React

```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { someService } from '@/services/some.service';
import './Component.css';

export const Component = ({ prop1, prop2 }) => {
  // Hooks
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Effects
  useEffect(() => {
    loadData();
  }, []);

  // Functions
  const loadData = async () => {
    try {
      setLoading(true);
      const result = await someService.getData();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Render
  if (loading) return <LoadingState />;
  if (!data) return <EmptyState />;

  return (
    <div className="component">
      {/* Contenu */}
    </div>
  );
};
```

---

## 🧪 TESTS ET VALIDATION

### Checklist fonctionnelle

- [ ] Authentification fonctionne (login, logout, register)
- [ ] Navigation entre modules fonctionne
- [ ] Dashboard principal affiche les KPIs
- [ ] Chaque module affiche son dashboard
- [ ] Tabs navigation fonctionne dans chaque module
- [ ] CRUD fonctionne pour chaque entité
- [ ] Calculs KPIs corrects
- [ ] Risk Management fonctionne
- [ ] Conformité ISO implémentée
- [ ] Responsive design (mobile, tablette, desktop)

### Checklist technique

- [ ] Pas d'erreurs console
- [ ] Performance acceptable (< 3s chargement)
- [ ] Code linter OK
- [ ] Types corrects (si TypeScript)
- [ ] Gestion erreurs complète
- [ ] Loading states partout
- [ ] Empty states partout

---

## 📦 DÉPLOIEMENT

### Configuration Vercel

Créer `vercel.json` :
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Variables d'environnement

Dans Vercel Dashboard :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 🎯 PRIORITÉS D'IMPLÉMENTATION

### Priorité 1 (Fondations)
1. Infrastructure de base
2. Authentification
3. Design System
4. Dashboard principal

### Priorité 2 (Modules principaux)
1. Composants modules réutilisables
2. Services métier
3. Module Programmes & Projets
4. Module Candidatures
5. Module Bénéficiaires

### Priorité 3 (Modules secondaires)
1. Module Intervenants
2. Module Reporting
3. Module Administration

### Priorité 4 (Finalisation)
1. Intégration complète
2. Tests
3. Optimisations
4. Documentation

---

## 📚 RESSOURCES

### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [React Router Documentation](https://reactrouter.com)

### Standards
- [ISO 31000 - Risk Management](https://www.iso.org/iso-31000-risk-management.html)
- [ISO 9001 - Quality Management](https://www.iso.org/iso-9001-quality-management.html)

---

## ✅ PROCHAINES ÉTAPES IMMÉDIATES

1. **Créer la structure de base** : `package.json`, `vite.config.js`, structure dossiers
2. **Configurer Supabase** : Client, authentification
3. **Créer le Design System** : Variables CSS, composants communs
4. **Implémenter l'authentification** : Login, Register, ProtectedRoute
5. **Créer le Layout** : Header, Sidebar, Layout principal
6. **Créer le Dashboard principal** : KPIs, métriques, graphiques

---

**Date de création** : 29 novembre 2025  
**Version** : 1.0  
**Status** : Plan de développement complet - Prêt pour implémentation

