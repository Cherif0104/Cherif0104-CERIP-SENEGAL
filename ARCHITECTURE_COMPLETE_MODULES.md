# 🏗️ ARCHITECTURE COMPLÈTE DES MODULES - DÉFINITION DÉTAILLÉE

**Date :** 2025-01-05  
**Référence :** Module Programme (validé)  
**Objectif :** Définir l'architecture complète de tous les modules du système

---

## 📋 TABLE DES MATIÈRES

1. [Architecture de Référence - Module Programme](#1-architecture-de-référence---module-programme)
2. [Module Projets](#2-module-projets)
3. [Module Partenaires](#3-module-partenaires)
4. [Module Bénéficiaires](#4-module-bénéficiaires)
5. [Module Candidatures](#5-module-candidatures)
6. [Module Intervenants](#6-module-intervenants)
7. [Module Ressources Humaines](#7-module-ressources-humaines)
8. [Module Administration](#8-module-administration)
9. [Module Reporting](#9-module-reporting)
10. [Module Finances](#10-module-finances)
11. [Standards et Patterns](#standards-et-patterns)

---

## 1. ARCHITECTURE DE RÉFÉRENCE - MODULE PROGRAMME

### ✅ Structure Validée

```
src/
├── pages/programmes/
│   ├── ProgrammeDetail.jsx          # Page détail avec onglets
│   ├── ProgrammeDetail.css
│   ├── ProgrammeForm.jsx            # Formulaire création/édition
│   ├── ProgrammeForm.css
│   └── tabs/
│       ├── ProgrammeCandidats.jsx
│       └── ProgrammeBeneficiaires.jsx
│
├── modules/programmes/
│   ├── ProgrammesModule.jsx         # Module principal (liste)
│   ├── ProgrammesModule.css
│   └── tabs/
│       ├── dashboard/
│       │   ├── ProgrammeDashboardDetail.jsx  # Dashboard complet
│       │   └── ProgrammeDashboardDetail.css
│       ├── depenses/
│       │   ├── DepensesProgramme.jsx        # Gestion dépenses
│       │   ├── DepensesProgramme.css
│       │   ├── DepenseForm.jsx
│       │   └── DepenseForm.css
│       ├── risques/
│       │   ├── RisquesProgramme.jsx
│       │   └── RisquesProgramme.css
│       ├── jalons/
│       │   ├── JalonsProgramme.jsx
│       │   └── JalonsProgramme.css
│       └── reporting/
│           ├── ReportingProgramme.jsx
│           └── ReportingProgramme.css
│
└── services/
    ├── programmes.service.js         # CRUD programmes
    ├── programme-depenses.service.js # Gestion dépenses
    ├── programme-metrics.service.js  # Calculs métriques
    └── programmes-risques.service.js # Gestion risques
```

### 📊 Onglets ProgrammeDetail

1. **Vue d'ensemble** (dashboard) - `ProgrammeDashboardDetail`
   - 6 KPIs principaux (scroll horizontal)
   - Sections : Finances, Projets, Candidats, Bénéficiaires, Accompagnements, Performance
   - Alertes automatiques
   - Dépenses récentes

2. **Dépenses** - `DepensesProgramme`
   - 4 cartes statistiques (Budget total, Dépenses validées, Budget restant, Taux consommation)
   - Filtres (Date début, Date fin, Statut)
   - Tableau des dépenses avec actions

3. **Projets** - Liste des projets associés

4. **Candidats** - `ProgrammeCandidats`

5. **Bénéficiaires** - `ProgrammeBeneficiaires`

6. **Risques** - `RisquesProgramme`

7. **Jalons** - `JalonsProgramme`

8. **Reporting** - `ReportingProgramme`

9. **Détails** - Informations générales

10. **Historique** - Audit trail

### 🔧 Services Programme

- `programmes.service.js` : CRUD complet
- `programme-depenses.service.js` : Gestion dépenses (getByProgramme, create, update, delete, getStats)
- `programme-metrics.service.js` : Agrégation métriques (getProgrammeMetrics)
- `programmes-risques.service.js` : Gestion risques

### 🎨 Patterns Identifiés

1. **Page Detail** : Composant avec onglets, navigation par URL (`?tab=xxx`)
2. **Onglets** : Composants dans `modules/[module]/tabs/`
3. **Services** : Un service principal + services spécialisés
4. **Dashboard** : KPIs + sections métriques + alertes
5. **Formulaires** : Composants séparés avec validation
6. **Styles** : CSS par composant, cohérence visuelle

---

## 2. MODULE PROJETS

### 📁 Structure Cible

```
src/
├── pages/projets/
│   ├── ProjetDetail.jsx              # ✅ EXISTE - À compléter
│   ├── ProjetDetail.css
│   ├── ProjetForm.jsx                # À créer
│   └── ProjetForm.css
│
├── modules/projets/
│   ├── ProjetsModule.jsx             # ✅ EXISTE
│   ├── ProjetsModule.css
│   └── tabs/
│       ├── dashboard/
│       │   ├── ProjetDashboardDetail.jsx  # ✅ CRÉÉ
│       │   └── ProjetDashboardDetail.css
│       ├── depenses/
│       │   ├── DepensesProjet.jsx         # ✅ CRÉÉ
│       │   ├── DepensesProjet.css
│       │   ├── DepenseForm.jsx            # À créer (réutiliser DepenseForm programme)
│       │   └── DepenseForm.css
│       ├── activites/
│       │   ├── ActivitesProjet.jsx         # À créer
│       │   ├── ActivitesProjet.css
│       │   ├── ActiviteForm.jsx
│       │   └── ActiviteForm.css
│       ├── candidats/
│       │   ├── CandidatsProjet.jsx         # À créer
│       │   └── CandidatsProjet.css
│       ├── beneficiaires/
│       │   ├── BeneficiairesProjet.jsx     # À créer (suivi individuel + collectif)
│       │   └── BeneficiairesProjet.css
│       ├── assiduite/
│       │   ├── AssiduiteProjet.jsx         # À créer (scoring assiduité)
│       │   └── AssiduiteProjet.css
│       ├── ressources/
│       │   ├── RessourcesProjet.jsx        # À créer (réservations)
│       │   └── RessourcesProjet.css
│       ├── risques/
│       │   ├── RisquesProjet.jsx           # À créer (remontée programme)
│       │   └── RisquesProjet.css
│       ├── jalons/
│       │   ├── JalonsProjet.jsx            # À créer (liés programme, récurrents)
│       │   └── JalonsProjet.css
│       └── reporting/
│           ├── ReportingProjet.jsx         # À créer (rapports récurrents)
│           └── ReportingProjet.css
│
└── services/
    ├── projets.service.js             # ✅ EXISTE
    ├── projet-depenses.service.js      # ✅ CRÉÉ
    ├── projet-metrics.service.js       # ✅ CRÉÉ
    ├── projet-activites.service.js     # À créer
    ├── projet-rallonges.service.js     # À créer
    ├── criteres-eligibilite.service.js # À créer
    ├── ressources.service.js           # À créer
    └── assiduite.service.js            # À créer
```

### 📊 Onglets ProjetDetail (Définis)

1. **Vue d'ensemble** ✅ - `ProjetDashboardDetail`
   - 6 KPIs : Budget alloué, Taux consommation, Bénéficiaires, Candidats éligibles, Jalons terminés, Appels ouverts
   - Sections : Finances, Progression (Jalons), Bénéficiaires, Candidats, Activités

2. **Budgets & Dépenses** ✅ - `DepensesProjet`
   - 4 cartes stats
   - Filtres
   - Tableau dépenses
   - ⚠️ À ajouter : Limites période, Demandes rallonge

3. **Activités** - `ActivitesProjet` ⚠️ À créer
   - Liste activités (formations, ateliers, etc.)
   - Formulaire création activité
   - Réservations ressources associées
   - Suivi présence

4. **Candidats** - `CandidatsProjet` ⚠️ À créer
   - Liste candidats par appel
   - Filtres critères éligibilité
   - Scoring/évaluation
   - Interface configuration critères

5. **Bénéficiaires** - `BeneficiairesProjet` ⚠️ À créer
   - Liste bénéficiaires projet
   - Suivi individuel (diagnostics multi-domaines)
   - Suivi collectif
   - Transferts entre projets

6. **Assiduité** - `AssiduiteProjet` ⚠️ À créer
   - Scores assiduité par bénéficiaire
   - Seuils d'alerte configurables
   - Graphiques évolution
   - Alertes automatiques

7. **Ressources** - `RessourcesProjet` ⚠️ À créer
   - Réservations salles (internes/externes)
   - Réservations matériel
   - Transport, restauration
   - Calendrier disponibilités

8. **Risques** - `RisquesProjet` ⚠️ À créer
   - Matrice risques projet
   - Remontée automatique au programme
   - Alertes risques critiques

9. **Jalons** - `JalonsProjet` ⚠️ À créer
   - Jalons liés aux jalons programme
   - Jalons récurrents automatiques
   - Dépendances entre jalons
   - Timeline

10. **Reporting** - `ReportingProjet` ⚠️ À créer
    - Rapports configurés
    - Rapports récurrents (mensuels)
    - Export Excel/PDF
    - Permissions par rôle

11. **Détails** ✅ - Informations générales

12. **Historique** ✅ - Audit trail

### 🔧 Services Projets (À créer/compléter)

- ✅ `projets.service.js` : CRUD
- ✅ `projet-depenses.service.js` : Dépenses projet
- ✅ `projet-metrics.service.js` : Métriques
- ⚠️ `projet-activites.service.js` : CRUD activités, présence
- ⚠️ `projet-rallonges.service.js` : Demandes rallonge budget
- ⚠️ `criteres-eligibilite.service.js` : Configuration critères, scoring
- ⚠️ `ressources.service.js` : Gestion ressources, réservations
- ⚠️ `assiduite.service.js` : Calcul scores, alertes

### 📝 Fonctionnalités Spécifiques

**Budget & Finances :**
- Budget alloué depuis programme
- Dépenses comptabilisées dans budget programme
- Limites par période (mensuelle/trimestrielle) - héritées ou ajustées
- Demandes rallonge avec workflow approbation

**Bénéficiaires :**
- 1 bénéficiaire = 1 projet à la fois
- Transfert via diagnostics multi-domaines (intervenants)
- Suivi individuel ET collectif

**Candidats & Appels :**
- Plusieurs appels possibles par projet
- Critères d'éligibilité configurables (interface modulaire)
- Scoring avec pondération
- Filtres sélectifs

**Jalons :**
- Liés aux jalons programme
- Récurrents automatiques si besoin
- Gestion dépendances

**Risques :**
- Remontée automatique au programme si besoin
- Alertes automatiques risques critiques

**Activités :**
- Tous types (formations, ateliers, etc.)
- Réservation ressources
- Suivi présence/absence

**Assiduité :**
- Scoring avec seuils ajustables
- Alertes (ex. 80% par défaut)

**Reporting :**
- Rapports récurrents (fréquence configurable)
- Publication contrôlée (brouillon → publié)
- Permissions par rôle

---

## 3. MODULE PARTENAIRES

### 📁 Structure Cible

```
src/
├── pages/partenaires/
│   ├── PartenaireDetail.jsx
│   ├── PartenaireDetail.css
│   ├── PartenaireForm.jsx
│   └── PartenaireForm.css
│
├── modules/partenaires/
│   ├── PartenairesModule.jsx
│   ├── PartenairesModule.css
│   └── tabs/
│       ├── dashboard/
│       │   ├── PartenaireDashboardDetail.jsx
│       │   └── PartenaireDashboardDetail.css
│       ├── conventions/
│       │   ├── ConventionsPartenaire.jsx
│       │   └── ConventionsPartenaire.css
│       ├── financements/
│       │   ├── FinancementsPartenaire.jsx
│       │   └── FinancementsPartenaire.css
│       ├── projets/
│       │   ├── ProjetsPartenaire.jsx
│       │   └── ProjetsPartenaire.css
│       └── reporting/
│           ├── ReportingPartenaire.jsx
│           └── ReportingPartenaire.css
│
└── services/
    ├── partenaires.service.js         # ✅ EXISTE
    ├── partenaires-metrics.service.js # À créer
    └── conventions.service.js          # À créer
```

### 📊 Onglets PartenaireDetail

1. **Vue d'ensemble** - Dashboard
   - KPIs : Nombre conventions, Montant total financé, Projets associés, Statut partenariat
   - Sections : Conventions actives, Financements, Projets, Historique

2. **Conventions** - Gestion conventions partenariat
   - Liste conventions
   - Formulaire création/édition
   - Statuts, dates, montants
   - Documents associés

3. **Financements** - Financements du partenaire
   - Liste financements
   - Suivi versements
   - Échéances

4. **Projets** - Projets financés par le partenaire
   - Liste projets associés
   - Contribution par projet

5. **Reporting** - Rapports pour le partenaire
   - Rapports d'activité
   - Rapports financiers

6. **Détails** - Informations générales partenaire

7. **Historique** - Audit trail

### 🔧 Services Partenaires

- ✅ `partenaires.service.js` : CRUD
- ⚠️ `partenaires-metrics.service.js` : Métriques partenariat
- ⚠️ `conventions.service.js` : Gestion conventions

---

## 4. MODULE BÉNÉFICIAIRES

### 📁 Structure Cible

```
src/
├── pages/beneficiaires/
│   ├── BeneficiaireDetail.jsx
│   ├── BeneficiaireDetail.css
│   ├── BeneficiaireForm.jsx
│   └── BeneficiaireForm.css
│
├── modules/beneficiaires/
│   ├── BeneficiairesModule.jsx
│   ├── BeneficiairesModule.css
│   └── tabs/
│       ├── dashboard/
│       │   ├── BeneficiaireDashboardDetail.jsx
│       │   └── BeneficiaireDashboardDetail.css
│       ├── suivi/
│       │   ├── SuiviBeneficiaire.jsx
│       │   └── SuiviBeneficiaire.css
│       ├── diagnostics/
│       │   ├── DiagnosticsBeneficiaire.jsx
│       │   └── DiagnosticsBeneficiaire.css
│       ├── accompagnements/
│       │   ├── AccompagnementsBeneficiaire.jsx
│       │   └── AccompagnementsBeneficiaire.css
│       ├── insertions/
│       │   ├── InsertionsBeneficiaire.jsx
│       │   └── InsertionsBeneficiaire.css
│       └── assiduite/
│           ├── AssiduiteBeneficiaire.jsx
│           └── AssiduiteBeneficiaire.css
│
└── services/
    ├── beneficiaires.service.js       # ✅ EXISTE
    ├── beneficiaires-metrics.service.js # À créer
    ├── diagnostics.service.js          # À créer
    └── assiduite.service.js            # À créer (partagé avec projets)
```

### 📊 Onglets BeneficiaireDetail

1. **Vue d'ensemble** - Dashboard
   - KPIs : Projet actuel, Statut, Taux assiduité, Nombre accompagnements, Insertions
   - Sections : Informations personnelles, Projet actuel, Statistiques

2. **Suivi** - Suivi global bénéficiaire
   - Timeline parcours
   - Événements importants
   - Évolution statut

3. **Diagnostics** - Diagnostics multi-domaines
   - Liste diagnostics par domaine
   - Formulaire création diagnostic
   - Historique évaluations
   - Transferts entre projets (via diagnostics)

4. **Accompagnements** - Accompagnements reçus
   - Liste accompagnements
   - Heures totales
   - Intervenants

5. **Insertions** - Suivi insertions
   - Insertions réussies
   - Entreprises
   - Durée maintien

6. **Assiduité** - Scores assiduité
   - Évolution par période
   - Détails présences/absences
   - Alertes

7. **Détails** - Informations générales

8. **Historique** - Audit trail

### 🔧 Services Bénéficiaires

- ✅ `beneficiaires.service.js` : CRUD
- ⚠️ `beneficiaires-metrics.service.js` : Métriques individuelles
- ⚠️ `diagnostics.service.js` : Gestion diagnostics multi-domaines
- ⚠️ `assiduite.service.js` : Calcul scores (partagé)

---

## 5. MODULE CANDIDATURES

### 📁 Structure Cible

```
src/
├── pages/candidatures/
│   ├── CandidatureDetail.jsx
│   ├── CandidatureDetail.css
│   ├── CandidatureForm.jsx
│   └── CandidatureForm.css
│
├── modules/candidatures/
│   ├── CandidaturesModule.jsx
│   ├── CandidaturesModule.css
│   └── tabs/
│       ├── dashboard/
│       │   ├── CandidatureDashboardDetail.jsx
│       │   └── CandidatureDashboardDetail.css
│       ├── appels/
│       │   ├── AppelsCandidatures.jsx
│       │   └── AppelsCandidatures.css
│       ├── evaluation/
│       │   ├── EvaluationCandidature.jsx
│       │   └── EvaluationCandidature.css
│       └── selection/
│           ├── SelectionCandidatures.jsx
│           └── SelectionCandidatures.css
│
└── services/
    ├── candidatures.service.js        # ✅ EXISTE
    ├── appels.service.js               # ✅ EXISTE
    ├── candidatures-metrics.service.js # À créer
    └── evaluation.service.js           # À créer (scoring)
```

### 📊 Onglets CandidatureDetail

1. **Vue d'ensemble** - Dashboard
   - KPIs : Appels postulés, Statut éligibilité, Score total, Classement
   - Sections : Informations candidat, Appels, Évaluations

2. **Appels** - Appels à candidatures
   - Liste appels postulés
   - Statut par appel
   - Critères éligibilité

3. **Évaluation** - Évaluations reçues
   - Scores par critère
   - Détails évaluation
   - Commentaires

4. **Sélection** - Processus sélection
   - Statut sélection
   - Classement
   - Décisions

5. **Détails** - Informations générales

6. **Historique** - Audit trail

### 🔧 Services Candidatures

- ✅ `candidatures.service.js` : CRUD
- ✅ `appels.service.js` : Gestion appels
- ⚠️ `candidatures-metrics.service.js` : Métriques
- ⚠️ `evaluation.service.js` : Scoring, évaluation

---

## 6. MODULE INTERVENANTS

### 📁 Structure Cible

```
src/
├── pages/intervenants/
│   ├── IntervenantDetail.jsx
│   ├── IntervenantDetail.css
│   ├── IntervenantForm.jsx
│   └── IntervenantForm.css
│
├── modules/intervenants/
│   ├── IntervenantsModule.jsx
│   ├── IntervenantsModule.css
│   └── tabs/
│       ├── dashboard/
│       │   ├── IntervenantDashboardDetail.jsx
│       │   └── IntervenantDashboardDetail.css
│       ├── activites/
│       │   ├── ActivitesIntervenant.jsx
│       │   └── ActivitesIntervenant.css
│       ├── diagnostics/
│       │   ├── DiagnosticsIntervenant.jsx
│       │   └── DiagnosticsIntervenant.css
│       └── planning/
│           ├── PlanningIntervenant.jsx
│           └── PlanningIntervenant.css
│
└── services/
    ├── intervenants.service.js         # À créer
    └── intervenants-metrics.service.js # À créer
```

### 📊 Onglets IntervenantDetail

1. **Vue d'ensemble** - Dashboard
   - KPIs : Activités réalisées, Heures totales, Bénéficiaires accompagnés, Diagnostics réalisés
   - Sections : Informations, Statistiques, Planning

2. **Activités** - Activités animées
   - Liste activités
   - Heures par activité
   - Bénéficiaires participants

3. **Diagnostics** - Diagnostics réalisés
   - Liste diagnostics
   - Domaines couverts
   - Bénéficiaires diagnostiqués

4. **Planning** - Planning intervenant
   - Calendrier activités
   - Disponibilités
   - Réservations

5. **Détails** - Informations générales

6. **Historique** - Audit trail

---

## 7. MODULE RESSOURCES HUMAINES

### 📁 Structure Cible

```
src/
├── pages/rh/
│   ├── EmployeDetail.jsx
│   ├── EmployeDetail.css
│   ├── EmployeForm.jsx
│   └── EmployeForm.css
│
├── modules/rh/
│   ├── RHModule.jsx
│   ├── RHModule.css
│   └── tabs/
│       ├── dashboard/
│       │   ├── RHDashboardDetail.jsx
│       │   └── RHDashboardDetail.css
│       ├── employes/
│       │   ├── EmployesRH.jsx
│       │   └── EmployesRH.css
│       ├── postes/
│       │   ├── PostesRH.jsx
│       │   └── PostesRH.css
│       ├── competences/
│       │   ├── CompetencesRH.jsx
│       │   └── CompetencesRH.css
│       ├── formations/
│       │   ├── FormationsRH.jsx
│       │   └── FormationsRH.css
│       └── evaluations/
│           ├── EvaluationsRH.jsx
│           └── EvaluationsRH.css
│
└── services/
    ├── employes.service.js             # ✅ EXISTE
    ├── postes.service.js               # ✅ EXISTE
    ├── competences.service.js          # ✅ EXISTE
    ├── formations.service.js           # ✅ EXISTE
    └── rh-metrics.service.js            # À créer
```

### 📊 Onglets RHModule

1. **Dashboard** - Vue d'ensemble RH
   - KPIs : Effectif total, Postes ouverts, Formations en cours, Taux rotation
   - Sections : Statistiques, Alertes, Activités récentes

2. **Employés** - Gestion employés
   - Liste employés
   - Fiches individuelles
   - Contrats

3. **Postes** - Gestion postes
   - Liste postes
   - Postes ouverts
   - Compétences requises

4. **Compétences** - Référentiel compétences
   - Liste compétences
   - Mapping postes/compétences
   - Évaluations

5. **Formations** - Formations RH
   - Catalogue formations
   - Planifications
   - Suivi participations

6. **Évaluations** - Évaluations performance
   - Évaluations employés
   - Objectifs
   - Suivi

---

## 8. MODULE ADMINISTRATION

### 📁 Structure Cible

```
src/
├── pages/admin/
│   └── AdminDashboard.jsx
│
├── modules/administration/
│   ├── AdministrationModule.jsx
│   ├── AdministrationModule.css
│   └── tabs/
│       ├── dashboard/
│       │   ├── AdminDashboardDetail.jsx
│       │   └── AdminDashboardDetail.css
│       ├── users/
│       │   ├── UsersAdmin.jsx
│       │   └── UsersAdmin.css
│       ├── permissions/
│       │   ├── PermissionsAdmin.jsx
│       │   └── PermissionsAdmin.css
│       ├── configuration/
│       │   ├── ConfigurationAdmin.jsx
│       │   └── ConfigurationAdmin.css
│       ├── referentiels/
│       │   ├── ReferentielsAdmin.jsx
│       │   └── ReferentielsAdmin.css
│       └── audit/
│           ├── AuditAdmin.jsx
│           └── AuditAdmin.css
│
└── services/
    ├── users.service.js                 # ✅ EXISTE
    ├── permissions.service.js           # ✅ EXISTE
    ├── configuration.service.js         # ✅ EXISTE
    ├── referentiels.service.js          # ✅ EXISTE
    └── audit.service.js                 # ✅ EXISTE
```

### 📊 Onglets AdministrationModule

1. **Dashboard** - Vue d'ensemble admin
   - KPIs : Utilisateurs actifs, Modules configurés, Actions audit, Alertes système
   - Sections : Statistiques système, Activités récentes

2. **Utilisateurs** - Gestion utilisateurs
   - Liste utilisateurs
   - Création/édition
   - Rôles

3. **Permissions** - Gestion permissions
   - Matrice permissions
   - Rôles
   - Attribution

4. **Configuration** - Configuration système
   - Paramètres généraux
   - Modules
   - Intégrations

5. **Référentiels** - Gestion référentiels
   - Référentiels dynamiques
   - Valeurs
   - Hiérarchies

6. **Audit** - Logs audit
   - Consultation logs
   - Filtres
   - Export

---

## 9. MODULE REPORTING

### 📁 Structure Cible

```
src/
├── modules/reporting/
│   ├── ReportingModule.jsx
│   ├── ReportingModule.css
│   └── tabs/
│       ├── dashboard/
│       │   ├── ReportingDashboardDetail.jsx
│       │   └── ReportingDashboardDetail.css
│       ├── rapports/
│       │   ├── RapportsReporting.jsx
│       │   └── RapportsReporting.css
│       └── exports/
│           ├── ExportsReporting.jsx
│           └── ExportsReporting.css
│
└── services/
    └── reporting.service.js            # ✅ EXISTE
```

### 📊 Onglets ReportingModule

1. **Dashboard** - Vue d'ensemble reporting
   - KPIs : Rapports générés, Rapports publiés, Exports réalisés
   - Sections : Rapports récents, Types disponibles

2. **Rapports** - Gestion rapports
   - Liste rapports
   - Création rapports
   - Publication
   - Permissions

3. **Exports** - Exports données
   - Formats disponibles
   - Historique exports
   - Planification

---

## 10. MODULE FINANCES

### 📁 Structure Cible

```
src/
├── modules/finances/
│   ├── FinancesModule.jsx
│   ├── FinancesModule.css
│   └── tabs/
│       ├── dashboard/
│       │   ├── FinancesDashboardDetail.jsx
│       │   └── FinancesDashboardDetail.css
│       ├── tresorerie/
│       │   ├── TresorerieFinances.jsx
│       │   └── TresorerieFinances.css
│       ├── financements/
│       │   ├── FinancementsFinances.jsx
│       │   └── FinancementsFinances.css
│       └── depenses/
│           ├── DepensesFinances.jsx
│           └── DepensesFinances.css
│
└── services/
    ├── tresorerie.service.js           # ✅ EXISTE
    ├── financements.service.js          # ✅ EXISTE
    └── finances-metrics.service.js      # À créer
```

### 📊 Onglets FinancesModule

1. **Dashboard** - Vue d'ensemble finances
   - KPIs : Budget total, Dépenses totales, Financements reçus, Trésorerie
   - Sections : Évolution, Répartition, Alertes

2. **Trésorerie** - Gestion trésorerie
   - Flux entrées/sorties
   - Solde
   - Prévisions

3. **Financements** - Gestion financements
   - Liste financements
   - Versements
   - Échéances

4. **Dépenses** - Vue globale dépenses
   - Dépenses tous programmes/projets
   - Filtres
   - Statistiques

---

## STANDARDS ET PATTERNS

### 🎯 Structure Standard Module

```
modules/[module]/
├── [Module]Module.jsx          # Module principal (liste)
├── [Module]Module.css
└── tabs/
    ├── dashboard/
    │   ├── [Module]DashboardDetail.jsx
    │   └── [Module]DashboardDetail.css
    ├── [onglet1]/
    │   ├── [Onglet1][Module].jsx
    │   └── [Onglet1][Module].css
    └── ...
```

### 📄 Structure Standard Page Detail

```
pages/[module]/
├── [Module]Detail.jsx          # Page détail avec onglets
├── [Module]Detail.css
├── [Module]Form.jsx            # Formulaire création/édition
└── [Module]Form.css
```

### 🔧 Structure Standard Service

```
services/
├── [module].service.js          # CRUD principal
├── [module]-[specialite].service.js  # Services spécialisés
└── [module]-metrics.service.js  # Calculs métriques
```

### 📊 Pattern Dashboard

1. **En-tête** : Titre + métadonnées (statut, dates)
2. **Alertes** : Section `AlertsSection` si alertes
3. **KPIs Principaux** : 6 KPIs en ligne horizontale avec scroll
4. **Sections Métriques** : Sections thématiques avec `MetricCard`
5. **Listes Récentes** : Tableaux données récentes (ex: dépenses)
6. **Graphiques** : `DonutChart` pour répartitions

### 🎨 Pattern Onglet Liste

1. **Header** : Titre + bouton création
2. **Filtres** : Filtres recherche/tri
3. **Tableau** : `DataTable` avec colonnes configurables
4. **Actions** : Actions par ligne (voir, éditer, supprimer)

### 🔐 Pattern Permissions

- Utiliser `PermissionGuard` pour protéger actions
- Vérifier permissions dans services si nécessaire
- Logger accès refusés

### 📝 Pattern Formulaires

1. **Validation** : Validation côté client + serveur
2. **États** : Loading, error, success
3. **Upload fichiers** : Via `documentsService`
4. **Audit** : Logger création/modification

### 🗄️ Pattern Services

1. **Méthodes standard** : `getAll`, `getById`, `create`, `update`, `delete`
2. **Options** : Paramètres `options` pour filtres/pagination
3. **Retour** : `{ data, error }`
4. **Logging** : Logger toutes les opérations
5. **Gestion erreurs** : Messages utilisateur clairs

---

## 📋 CHECKLIST IMPLÉMENTATION PAR MODULE

### Module Projets
- [x] Structure de base
- [x] Dashboard
- [x] Onglet Dépenses
- [ ] Onglet Activités
- [ ] Onglet Candidats
- [ ] Onglet Bénéficiaires
- [ ] Onglet Assiduité
- [ ] Onglet Ressources
- [ ] Onglet Risques
- [ ] Onglet Jalons
- [ ] Onglet Reporting
- [ ] Services manquants

### Module Partenaires
- [ ] Structure complète
- [ ] Tous onglets
- [ ] Services

### Module Bénéficiaires
- [ ] Structure complète
- [ ] Tous onglets
- [ ] Services

### Module Candidatures
- [ ] Structure complète
- [ ] Tous onglets
- [ ] Services

### Module Intervenants
- [ ] Structure complète
- [ ] Tous onglets
- [ ] Services

### Module RH
- [ ] Structure complète
- [ ] Tous onglets
- [ ] Services

### Module Administration
- [ ] Structure complète
- [ ] Tous onglets
- [ ] Services

### Module Reporting
- [ ] Structure complète
- [ ] Tous onglets
- [ ] Services

### Module Finances
- [ ] Structure complète
- [ ] Tous onglets
- [ ] Services

---

## 🎯 PROCHAINES ÉTAPES

1. **Prioriser modules** : Définir ordre d'implémentation
2. **Créer templates** : Générer templates basés sur Programme
3. **Implémenter progressivement** : Module par module
4. **Tests** : Valider chaque module avant suivant
5. **Documentation** : Documenter spécificités chaque module

---

**Document créé le :** 2025-01-05  
**Dernière mise à jour :** 2025-01-05  
**Version :** 1.0

