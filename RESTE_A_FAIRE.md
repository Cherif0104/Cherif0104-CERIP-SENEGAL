# 📋 CE QUI RESTE À FAIRE
## ERP CERIP SENEGAL - État d'avancement et tâches restantes

**Date de mise à jour :** 2025-01-XX

---

## ✅ PHASES COMPLÉTÉES

### Phase 0 : Analyse et Planification
- ✅ Analyse complète effectuée
- ✅ Plan de développement créé

### Phase 1 : Restructuration Critique
- ✅ **Phase 1.1** : Séparation Programmes/Projets
- ✅ **Phase 1.2** : Module Partenaires/Structures

### Phase 2 : Candidatures Publiques
- ✅ **Phase 2.1** : Formulaires de recrutement publics
- ✅ **Phase 2.2** : Espace Candidat (authentification et suivi)

### Phase 3 : Complétion Modules Existants
- ✅ **Phase 3.1** : Module Bénéficiaires (Formations, Accompagnements, Suivi)
- ✅ **Phase 3.2** : Module Intervenants (Portails Mentor, Formateur, Coach)
- ✅ **Phase 3.3** : Module Reporting (Rapports préconfigurés et exports)

### Phase 4 : Module Ressources Humaines
- ✅ Structure du module créée
- ✅ Tables BDD créées
- ✅ Repositories et Services créés
- ✅ Dashboard et listes créés
- ✅ Filtres implémentés

---

## ⚠️ ÉLÉMENTS INCOMPLETS DANS LES PHASES FAITES

### Phase 4 (RH) - Fonctionnalités manquantes

#### 1. Formulaire de Création/Modification d'Employé
**Fichiers à créer :**
- [ ] `src/modules/ressources-humaines/tabs/employes/EmployeForm.jsx`
- [ ] `src/modules/ressources-humaines/tabs/employes/EmployeForm.css`
- [ ] `src/modules/ressources-humaines/tabs/employes/EmployeDetail.jsx`
- [ ] `src/modules/ressources-humaines/tabs/employes/EmployeDetail.css`

**Fonctionnalités à implémenter :**
- Formulaire avec tous les champs :
  - Informations personnelles (nom, prénom, email, téléphone, date de naissance)
  - Type d'employé (PROFESSEUR, FORMATEUR, CHARGE_PROJET, DIRECTEUR, COORDINATEUR, COACH, MENTOR)
  - Type de contrat (CDI, CDD, STAGE, PRESTATION, PROJET, PROGRAMME)
  - Dates (embauche, fin de contrat si applicable)
  - Poste (sélection depuis liste)
  - Salaire
  - Statut (ACTIF, INACTIF, CONGE, DEMISSION)
  - Manager (sélection depuis liste d'employés)
  - Liens projet/programme (si contrat temporaire)
  - Indicateurs (est_prestataire, est_lie_projet, est_lie_programme)
  - Adresse, ville, pays
  - Photo (upload)
- Validation en temps réel
- Gestion conditionnelle des champs (afficher/masquer selon type de contrat)
- Génération automatique du matricule
- Page de détail avec toutes les informations + compétences + évaluations

**Routes à ajouter dans `routes.jsx` :**
```jsx
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
```

#### 2. Formulaires Postes
**Fichiers à créer :**
- [ ] `src/modules/ressources-humaines/tabs/postes/PosteForm.jsx`
- [ ] `src/modules/ressources-humaines/tabs/postes/PosteDetail.jsx`

#### 3. Formulaires Compétences
**Fichiers à créer :**
- [ ] `src/modules/ressources-humaines/tabs/competences/CompetenceForm.jsx`
- [ ] `src/modules/ressources-humaines/tabs/competences/CompetenceDetail.jsx`

#### 4. Gestion Compétences Employés
**Fichiers à créer :**
- [ ] `src/modules/ressources-humaines/tabs/employes/EmployeCompetences.jsx` (dans la page détail)
- Interface pour ajouter/modifier compétences avec niveau (1-5)

#### 5. Gestion Évaluations
**Fichiers à créer :**
- [ ] `src/modules/ressources-humaines/tabs/employes/EmployeEvaluations.jsx`
- [ ] `src/modules/ressources-humaines/tabs/employes/EvaluationForm.jsx`

---

## 🚧 PHASE 5 : ADMINISTRATION COMPLÈTE (P2)

**Priorité :** P2 (Souhaitable)  
**Durée estimée :** 2 semaines

### 5.1 Gestion Utilisateurs

**Fichiers à créer :**
- [ ] `src/modules/administration/tabs/utilisateurs/UtilisateursListe.jsx`
- [ ] `src/modules/administration/tabs/utilisateurs/UtilisateurDetail.jsx`
- [ ] `src/modules/administration/tabs/utilisateurs/UtilisateurForm.jsx`
- [ ] `src/modules/administration/tabs/utilisateurs/UtilisateursListe.css`

**Fonctionnalités :**
- Liste de tous les utilisateurs avec filtres (rôle, statut, organisme)
- Création/Modification utilisateur
- Activation/Désactivation compte
- Réinitialisation mot de passe
- Attribution rôle
- Lien avec employé (si applicable)

### 5.2 Rôles et Permissions

**Fichiers à créer :**
- [ ] `src/modules/administration/tabs/roles/RolesPermissions.jsx`
- [ ] `src/modules/administration/tabs/roles/RoleForm.jsx`

**Fonctionnalités :**
- Liste des rôles existants
- Définition système de permissions granulaires
- Création/modification rôles personnalisés
- Matrice de permissions (module × action)
- Assignation rôles aux utilisateurs
- Interface de configuration des permissions

**Table BDD à créer/modifier :**
```sql
-- Permissions granulaires
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Rôles personnalisés
CREATE TABLE IF NOT EXISTS public.roles_custom (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Relation utilisateurs-rôles (si plusieurs rôles par utilisateur)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS roles_custom JSONB DEFAULT '[]'::jsonb;
```

### 5.3 Configuration Système

**Fichiers à créer :**
- [ ] `src/modules/administration/tabs/configuration/ConfigurationSysteme.jsx`
- [ ] `src/modules/administration/tabs/configuration/Parametres.jsx`
- [ ] `src/modules/administration/tabs/configuration/Notifications.jsx`

**Fonctionnalités :**
- Paramètres généraux (nom organisme, logo, adresse, etc.)
- Configuration emails (SMTP, templates)
- Configuration notifications (types, canaux)
- Paramètres de sécurité (durée session, complexité mots de passe)
- Paramètres de localisation (devise, format dates, langue)
- Sauvegarde/restauration configuration

**Table BDD à créer :**
```sql
CREATE TABLE IF NOT EXISTS public.configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cle TEXT UNIQUE NOT NULL,
  valeur JSONB,
  type TEXT, -- string, number, boolean, object
  categorie TEXT, -- general, email, security, etc.
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5.4 Logs et Audit

**Fichiers à créer :**
- [ ] `src/modules/administration/tabs/logs/LogsAudit.jsx`
- [ ] `src/modules/administration/tabs/logs/LogsSysteme.jsx`
- [ ] `src/modules/administration/tabs/logs/LogsExports.jsx`

**Fonctionnalités :**
- Affichage logs d'audit (table `audit_logs` existante)
- Filtres (utilisateur, action, date, module)
- Export logs
- Logs système (erreurs, warnings)
- Historique des exports
- Visualisation timeline des actions

### 5.5 Structure Module Administration

**Structure à créer :**
```
src/modules/administration/
├── AdministrationModule.jsx
├── AdministrationModule.css
└── tabs/
    ├── dashboard/
    │   └── AdministrationDashboard.jsx
    ├── utilisateurs/
    │   ├── UtilisateursListe.jsx
    │   ├── UtilisateurDetail.jsx
    │   └── UtilisateurForm.jsx
    ├── roles/
    │   ├── RolesPermissions.jsx
    │   └── RoleForm.jsx
    ├── configuration/
    │   ├── ConfigurationSysteme.jsx
    │   ├── Parametres.jsx
    │   └── Notifications.jsx
    └── logs/
        ├── LogsAudit.jsx
        ├── LogsSysteme.jsx
        └── LogsExports.jsx
```

**Routes à ajouter :**
```jsx
{
  path: 'administration',
  element: <AdministrationModule />,
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
```

---

## 🔧 AMÉLIORATIONS OPTIONNELLES

### Dans Module Partenaires
- [ ] Historique des financements (lier avec table `financements`)
- [ ] Recherche avancée (ILIKE dans repositories)
- [ ] Export Excel/PDF pour chaque type
- [ ] Relations avec Programmes/Projets (tables de liaison)

### Dans Module RH
- [ ] Planning RH complet (calendrier visuel)
- [ ] Gestion des congés
- [ ] Tableau de bord RH avec KPIs avancés
- [ ] Rapports RH (taux de rotation, coûts, etc.)

### Général
- [ ] Amélioration DataTable (pagination serveur, tri avancé)
- [ ] Recherche globale dans l'application
- [ ] Notifications système en temps réel
- [ ] Mode sombre/clair
- [ ] Multi-langues (Français/Wolof)

---

## 📊 RÉSUMÉ DES TÂCHES RESTANTES

### Critique (Avant mise en production)
1. ✅ **Formulaire Employé** (Phase 4 - incomplet)
2. ✅ **Page Détail Employé** (Phase 4 - incomplet)
3. ✅ **Formulaires Postes et Compétences** (Phase 4 - incomplet)

### Important (P2)
4. ✅ **Phase 5 : Administration Complète**
   - Gestion Utilisateurs
   - Rôles et Permissions
   - Configuration Système
   - Logs et Audit

### Souhaitable (Améliorations futures)
5. ⚠️ Améliorations optionnelles listées ci-dessus

---

## 🎯 PRIORISATION RECOMMANDÉE

### Sprints immédiats

**Sprint 1 (1 semaine) : Compléter Phase 4 RH**
- Formulaire Employé (création/modification)
- Page Détail Employé
- Formulaires Postes et Compétences
- Gestion Compétences Employés
- Routes et navigation

**Sprint 2 (1 semaine) : Phase 5.1 - Gestion Utilisateurs**
- Module Administration (structure)
- Liste Utilisateurs
- Formulaire Utilisateur
- Page Détail Utilisateur

**Sprint 3 (1 semaine) : Phase 5.2-5.4**
- Rôles et Permissions
- Configuration Système
- Logs et Audit

---

**Document créé le :** 2025-01-XX  
**Dernière mise à jour :** 2025-01-XX

