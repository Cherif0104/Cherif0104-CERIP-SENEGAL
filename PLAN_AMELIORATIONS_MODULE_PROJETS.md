# 🎯 PLAN D'AMÉLIORATION - MODULE PROJETS

**Date de début :** 2025-01-03  
**Basé sur :** Améliorations réussies du module Programmes

---

## ✅ AMÉLIORATIONS EN COURS

### Priorité 0 (Critique)
- ✅ **Messages succès/erreur dans ProjetForm** - En cours
- ⏳ **Optimiser Dashboard** - À faire
- ⏳ **Compléter Risques** - À faire
- ⏳ **Compléter Jalons** - À faire

### Priorité 1 (Important)
- ⏳ **Filtres et recherche** - À faire
- ⏳ **Exports Excel/PDF** - À faire
- ⏳ **Bénéficiaires/candidatures** - À faire
- ⏳ **Permissions** - À faire
- ⏳ **Budgets et Appels** - À faire

---

## 📝 FICHIERS À MODIFIER/CRÉER

### À modifier
1. `src/pages/projets/ProjetForm.jsx` ✅ En cours
2. `src/pages/projets/ProjetDetail.jsx`
3. `src/modules/projets/tabs/dashboard/ProjetsDashboard.jsx`
4. `src/modules/projets/tabs/liste/ProjetsListe.jsx`
5. `src/modules/projets/tabs/risques/RisquesProjet.jsx`
6. `src/modules/projets/tabs/jalons/JalonsProjet.jsx`
7. `src/modules/projets/tabs/reporting/ReportingProjet.jsx`
8. `src/modules/projets/tabs/appels/AppelsProjet.jsx`

### À créer
1. Services (si nécessaire) :
   - `src/services/projets-jalons.service.js` (ou adapter jalons.service.js)
2. CSS manquants :
   - `src/modules/projets/tabs/risques/RisquesProjet.css`
   - `src/modules/projets/tabs/jalons/JalonsProjet.css`
   - `src/modules/projets/tabs/reporting/ReportingProjet.css`
   - `src/modules/projets/tabs/liste/ProjetsListe.css`
   - `src/pages/projets/ProjetDetail.css` (améliorer)

---

## 🔄 RÉUTILISATION DES COMPOSANTS EXISTANTS

- ✅ `Toast` - Déjà créé pour Programmes
- ✅ `Timeline` - Déjà créé pour Programmes
- ✅ `riskManagement.service` - Existe déjà
- ✅ `exportUtils` - Existe déjà
- ✅ `PermissionGuard` - Existe déjà

---

**Statut :** En cours d'implémentation

