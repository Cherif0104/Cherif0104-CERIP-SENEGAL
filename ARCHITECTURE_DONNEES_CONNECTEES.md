# Architecture de Données Connectées - KPIs Basés sur Données Réelles

## 🎯 Objectif

Créer une architecture où **tous les modules sont interconnectés** et où **tous les KPIs sont calculés à partir de données réelles** liées entre elles, sans spéculation ni valeurs en dur.

---

## 🔗 Cartographie des Relations Inter-Modules

### Schéma de Relations Complet

```
┌─────────────────────────────────────────────────────────────────┐
│                    TABLEAU DE BORD PRINCIPAL                    │
│              (Agrégation de TOUS les modules)                   │
└─────────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  PROGRAMMES  │   │    PROJETS    │   │ CANDIDATURES  │
└───────────────┘   └───────────────┘   └───────────────┘
        │                   │                   │
        │                   │                   │
        ├───────────────────┼───────────────────┤
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ BÉNÉFICIAIRES │   │  INTERVENANTS │   │   TRÉSORERIE  │
└───────────────┘   └───────────────┘   └───────────────┘
        │                   │                   │
        │                   │                   │
        ├───────────────────┼───────────────────┤
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ PARTENAIRES  │   │      RH       │   │  GESTION TEMPS│
└───────────────┘   └───────────────┘   └───────────────┘
        │                   │                   │
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
                  ┌───────────────┐
                  │   REPORTING    │
                  └───────────────┘
```

---

## 📊 Relations Détaillées par Module

### 1. PROGRAMMES ↔ PROJETS
**Relation :** `projets.programme_id → programmes.id`

**KPIs Connectés :**
- ✅ Budget total programme = SUM(projets.budget_alloue)
- ✅ Budget consommé programme = SUM(programme_depenses.montant WHERE statut IN ['VALIDÉ', 'APPROUVÉ', 'PAYÉ'])
- ✅ Nombre projets = COUNT(projets WHERE programme_id = X)
- ✅ Projets en cours = COUNT(projets WHERE statut = 'EN_COURS')
- ✅ Projets terminés = COUNT(projets WHERE statut = 'TERMINE')
- ✅ Taux d'avancement programme = (projets terminés / total projets) * 100

**Service :** `globalMetricsService.getProgrammesKPIs()`

---

### 2. PROJETS ↔ CANDIDATURES
**Relation :** `appels_candidatures.projet_id → projets.id`  
**Relation :** `candidats.appel_id → appels_candidatures.id`

**KPIs Connectés :**
- ✅ Appels par projet = COUNT(appels_candidatures WHERE projet_id = X)
- ✅ Candidats par projet = COUNT(candidats WHERE appel_id IN (appels du projet))
- ✅ Candidats éligibles = COUNT(candidats WHERE statut_eligibilite = 'ELIGIBLE' AND appel_id IN (...))
- ✅ Taux d'éligibilité = (candidats éligibles / total candidats) * 100
- ✅ Appels ouverts = COUNT(appels WHERE date_ouverture <= NOW() AND date_fermeture >= NOW())

**Service :** `globalMetricsService.getCandidaturesKPIs()`

---

### 3. CANDIDATURES ↔ BÉNÉFICIAIRES
**Relation :** `beneficiaires.candidat_id → candidats.id`  
**Relation :** `beneficiaires.projet_id → projets.id`

**KPIs Connectés :**
- ✅ Taux de conversion = (bénéficiaires total / candidats total) * 100
- ✅ Bénéficiaires par projet = COUNT(beneficiaires WHERE projet_id = X)
- ✅ Bénéficiaires actifs = COUNT(beneficiaires WHERE statut NOT IN ['TERMINE', 'ABANDON'])
- ✅ Bénéficiaires accompagnés = COUNT(DISTINCT accompagnements.beneficiaire_id)
- ✅ Taux d'insertion = (insertions total / bénéficiaires total) * 100

**Service :** `globalMetricsService.getBeneficiairesKPIs()`

---

### 4. BÉNÉFICIAIRES ↔ INTERVENANTS
**Relation :** `beneficiaires.mentor_id → users.id`  
**Relation :** `beneficiaires.coach_id → users.id`  
**Relation :** `accompagnements.intervenant_id → users.id`

**KPIs Connectés :**
- ✅ Bénéficiaires par mentor = COUNT(beneficiaires WHERE mentor_id = X)
- ✅ Charge mentor = COUNT(beneficiaires WHERE mentor_id = X AND statut = 'ACTIF')
- ✅ Heures d'accompagnement = SUM(accompagnements.duree_heures WHERE intervenant_id = X)
- ✅ Taux d'occupation intervenant = (heures_utilisees / disponibilite) * 100

**Service :** `globalMetricsService.getIntervenantsKPIs()`

---

### 5. PROJETS ↔ TRÉSORERIE
**Relation :** `programme_depenses.projet_id → projets.id`  
**Relation :** `programme_depenses.programme_id → programmes.id`

**KPIs Connectés :**
- ✅ Budget consommé projet = SUM(programme_depenses.montant WHERE projet_id = X AND statut IN ['VALIDÉ', 'APPROUVÉ', 'PAYÉ'])
- ✅ Budget restant projet = budget_alloue - budget_consommé
- ✅ Taux de consommation = (budget_consommé / budget_alloue) * 100
- ✅ Dépenses par période = GROUP BY MONTH(date_depense)
- ✅ Flux de trésorerie = SUM(entrees) - SUM(sorties) par période

**Service :** `globalMetricsService.getTresorerieKPIs()`

---

### 6. PROJETS ↔ GESTION TEMPS
**Relation :** `temps_travail.projet_id → projets.id`  
**Relation :** `temps_travail.employe_id → employes.id`

**KPIs Connectés :**
- ✅ Heures travaillées par projet = SUM(temps_travail.duree_heures WHERE projet_id = X)
- ✅ Coût main d'œuvre projet = SUM(temps_travail.duree_heures * employes.salaire_horaire)
- ✅ Taux de charge employé = (heures_travaillees / heures_disponibles) * 100
- ✅ Absences par projet = COUNT(absences WHERE projet_id = X)

**Service :** `globalMetricsService.getGestionTempsKPIs()`

---

### 7. PROJETS ↔ RESSOURCES HUMAINES
**Relation :** `employes.projet_id → projets.id`  
**Relation :** `employes.programme_id → programmes.id`

**KPIs Connectés :**
- ✅ Employés par projet = COUNT(employes WHERE projet_id = X AND statut = 'ACTIF')
- ✅ Coût RH projet = SUM(employes.salaire WHERE projet_id = X)
- ✅ Postes ouverts = COUNT(postes WHERE statut = 'OUVERT')
- ✅ Compétences requises = COUNT(DISTINCT postes_competences.competence_id)

**Service :** `globalMetricsService.getRHKPIs()`

---

### 8. PROGRAMMES ↔ PARTENAIRES
**Relation :** `programme_financements.financeur_id → financeurs.id`  
**Relation :** `programme_financements.programme_id → programmes.id`

**KPIs Connectés :**
- ✅ Financements par programme = SUM(programme_financements.montant WHERE programme_id = X)
- ✅ Financeurs actifs = COUNT(DISTINCT programme_financements.financeur_id)
- ✅ Partenaires impliqués = COUNT(DISTINCT partenaires WHERE projet_id IN (...))

**Service :** `globalMetricsService.getPartenairesKPIs()`

---

### 9. TOUS MODULES ↔ REPORTING
**Relation :** Tous les modules alimentent les rapports

**KPIs Connectés :**
- ✅ Rapports générés = COUNT(rapports WHERE created_at >= DATE_TRUNC('month', NOW()))
- ✅ Rapports en attente = COUNT(rapports WHERE statut = 'EN_ATTENTE')
- ✅ Taux de complétion = (rapports_termines / rapports_total) * 100
- ✅ Exports réalisés = COUNT(rapports WHERE format IN ['EXCEL', 'PDF'])

**Service :** `globalMetricsService.getReportingKPIs()`

---

### 10. ADMINISTRATION ↔ TOUS MODULES
**Relation :** `users` (utilisateurs système)  
**Relation :** `audit_log` (logs de toutes les actions)

**KPIs Connectés :**
- ✅ Utilisateurs actifs = COUNT(users WHERE actif = true)
- ✅ Administrateurs = COUNT(users WHERE role LIKE '%ADMIN%')
- ✅ Logs d'audit (mois) = COUNT(audit_log WHERE created_at >= DATE_TRUNC('month', NOW()))
- ✅ Référentiels = COUNT(tables de référence)

**Service :** `globalMetricsService.getAdministrationKPIs()`

---

## 🏗️ Architecture de Services Interconnectés

### Service Central : `global-metrics.service.js`

**Fichier créé :** `src/services/global-metrics.service.js`

**Fonctionnalités :**
1. ✅ `getGlobalKPIs()` - Calcule tous les KPIs du Dashboard Principal depuis données réelles
2. ✅ `getModuleKPIs(moduleName, filters)` - Calcule KPIs d'un module spécifique avec toutes ses relations
3. ✅ Méthodes spécialisées pour chaque module :
   - `getProgrammesKPIs()`
   - `getProjetsKPIs()`
   - `getCandidaturesKPIs()`
   - `getBeneficiairesKPIs()`
   - `getIntervenantsKPIs()`
   - `getTresorerieKPIs()`
   - `getGestionTempsKPIs()`
   - `getPartenairesKPIs()`
   - `getRHKPIs()`
   - `getReportingKPIs()`
   - `getAdministrationKPIs()`

**Principe :**
- ✅ Aucune valeur en dur
- ✅ Tous les KPIs calculés depuis relations réelles
- ✅ Utilisation des foreign keys pour lier les données
- ✅ Gestion d'erreurs robuste avec fallback

---

## 📋 Mise à Jour des Services

### 1. `analytics.service.js` ✅ MIS À JOUR
- ✅ `getGlobalKPIs()` délègue maintenant à `globalMetricsService.getGlobalKPIs()`
- ✅ `getModuleStats()` délègue maintenant à `globalMetricsService.getModuleKPIs()`
- ✅ Fallback vers méthodes locales si erreur

### 2. Dashboards Mis à Jour ✅

#### Dashboard Principal (`Dashboard.jsx`)
- ✅ Utilise `analyticsService.getGlobalKPIs()` qui délègue à `globalMetricsService`
- ✅ Tous les KPIs basés sur données réelles interconnectées

#### BeneficiairesDashboard ✅
- ✅ Utilise `analyticsService.getModuleStats('beneficiaires')`
- ✅ Affiche : Bénéficiaires actifs, Taux d'insertion, Accompagnés, Insérés

#### CandidaturesDashboard ✅
- ✅ Utilise `analyticsService.getModuleStats('candidatures')`
- ✅ Affiche : Appels ouverts, Candidats, Éligibles, Taux d'éligibilité

#### IntervenantsDashboard ✅
- ✅ Utilise `analyticsService.getModuleStats('intervenants')`
- ✅ Affiche : Mentors, Formateurs, Coaches, Total

#### ReportingDashboard ✅
- ✅ Utilise `analyticsService.getModuleStats('reporting')`
- ✅ Affiche : Rapports générés, En attente, Taux de complétion, Exports

#### AdministrationDashboard ✅
- ✅ Utilise `globalMetricsService.getModuleKPIs('administration')`
- ✅ Affiche : Utilisateurs actifs, Référentiels, Logs d'audit, Administrateurs

---

## ✅ Checklist de Connexion des Modules

Pour chaque module, vérifier :

### Relations
- [x] Relations base de données définies (foreign keys)
- [x] Services utilisent les relations pour calculer KPIs
- [x] Pas de valeurs en dur ou spéculatives

### KPIs
- [x] Tous les KPIs calculés depuis données réelles
- [x] Relations inter-modules utilisées
- [x] Formules de calcul documentées

### Services
- [x] Service métriques utilise relations
- [x] Pas de données mockées
- [x] Gestion d'erreurs appropriée

### Dashboards
- [x] Dashboards utilisent `globalMetricsService` ou `analyticsService`
- [x] KPIs affichés sont basés sur données réelles
- [x] Actualisation automatique si nécessaire

---

## 📊 Exemples de Calculs Réels

### Exemple 1 : Budget Consommé Programme
```javascript
// AVANT (spéculatif)
const budgetConsomme = 0 // Valeur en dur

// APRÈS (données réelles)
const { data: depenses } = await supabase
  .from('programme_depenses')
  .select('montant, statut')
  .eq('programme_id', programmeId)

const statusesConsommation = ['PAYE', 'PAYÉ', 'VALIDE', 'VALIDÉ', 'APPROUVÉ']
const budgetConsomme = depenses?.reduce((sum, d) => {
  if (statusesConsommation.includes(d.statut.toUpperCase())) {
    return sum + parseFloat(d.montant || 0)
  }
  return sum
}, 0) || 0
```

### Exemple 2 : Taux de Conversion Candidats → Bénéficiaires
```javascript
// AVANT (spéculatif)
const tauxConversion = 0 // Valeur en dur

// APRÈS (données réelles interconnectées)
// 1. Récupérer candidats (liés aux appels)
const { data: candidats } = await supabase
  .from('candidats')
  .select('id, appel_id')
  .in('appel_id', appelIds)

// 2. Récupérer bénéficiaires (liés aux candidats)
const candidatIds = candidats?.map(c => c.id) || []
const { data: beneficiaires } = await supabase
  .from('beneficiaires')
  .select('id, candidat_id')
  .in('candidat_id', candidatIds)

// 3. Calculer taux
const tauxConversion = candidats.length > 0
  ? Math.round((beneficiaires.length / candidats.length) * 100)
  : 0
```

---

## 🚀 Avantages de cette Architecture

1. **Données Réelles** : Tous les KPIs reflètent l'état réel de la base de données
2. **Interconnexion** : Les modules sont liés via foreign keys, pas isolés
3. **Maintenabilité** : Un seul service centralisé pour tous les calculs
4. **Évolutivité** : Facile d'ajouter de nouveaux KPIs ou relations
5. **Fiabilité** : Pas de valeurs en dur, tout est calculé dynamiquement
6. **Performance** : Calculs en parallèle avec Promise.all
7. **Traçabilité** : Tous les calculs sont loggés et traçables

---

## 📝 Notes Importantes

1. **Foreign Keys** : Toutes les relations doivent avoir des foreign keys définies dans Supabase
2. **RLS Policies** : Les politiques RLS doivent permettre la lecture des données liées
3. **Performance** : Pour de grandes quantités de données, considérer l'ajout d'index
4. **Cache** : Pour optimiser, on peut ajouter un système de cache (à implémenter)
5. **Actualisation** : Les dashboards se rafraîchissent automatiquement au chargement

---

**Date de création :** 2025-01-XX
**Version :** 1.0
**Statut :** ✅ Implémenté

