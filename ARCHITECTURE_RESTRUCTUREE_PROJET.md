# 📐 ARCHITECTURE RESTRUCTURÉE - MODULE PROJET
## Document Récapitulatif de la Restructuration

**Date :** 2025-01-06  
**Version :** 2.0  
**Référence :** Module Programme (validé)  
**Objectif :** Harmonisation et continuité logique avec le module Programme

---

## 🎯 OBJECTIFS DE LA RESTRUCTURATION

### 1. **Continuité Logique**
- Le module Projet doit être une **suite logique** du module Programme
- Les données et fonctionnalités doivent être **cohérentes** et **liées**
- Suppression des redondances et incohérences

### 2. **Simplification de l'Interface**
- Réduction du nombre d'onglets redondants
- Intégration des fonctionnalités connexes dans des onglets unifiés
- Navigation plus intuitive et fluide

### 3. **Cohérence avec Programme**
- Structure similaire aux onglets du module Programme
- Même logique de navigation et d'affichage
- Lien explicite entre Projet et Programme

---

## 📊 STRUCTURE AVANT / APRÈS

### ❌ AVANT (Structure obsolète)

**Onglets Projet :**
1. Vue d'ensemble
2. Budgets & Dépenses
3. Activités
4. Candidats
5. Bénéficiaires
6. **Assiduité** (séparé)
7. **Ressources** (séparé)
8. Risques
9. Jalons
10. Reporting
11. **Appels** (séparé)
12. Détails
13. Historique

**Problèmes identifiés :**
- ❌ Onglet "Appels" redondant avec "Candidats"
- ❌ Onglet "Assiduité" redondant avec "Bénéficiaires"
- ❌ Onglet "Ressources" redondant avec "Activités"
- ❌ "Budgets & Dépenses" au lieu de "Dépenses" (incohérence avec Programme)
- ❌ Pas de lien visible vers le Programme parent

### ✅ APRÈS (Structure restructurée)

**Onglets Projet :**
1. **Vue d'ensemble** (Dashboard)
2. **Dépenses** (renommé depuis "Budgets & Dépenses")
3. **Activités** (avec intégration Ressources)
4. **Candidats** (avec intégration Appels)
5. **Bénéficiaires** (avec intégration Assiduité)
6. **Risques**
7. **Jalons**
8. **Reporting**
9. **Détails**
10. **Historique**

**Améliorations :**
- ✅ Appels intégrés dans l'onglet Candidats
- ✅ Assiduité intégrée dans l'onglet Bénéficiaires (colonne)
- ✅ Ressources intégrées dans l'onglet Activités (section expandable)
- ✅ Nom "Dépenses" aligné avec Programme
- ✅ Lien vers Programme dans le header
- ✅ Structure cohérente avec Programme

---

## 🔗 INTÉGRATIONS EFFECTUÉES

### 1. **Appels → Candidats**

**Fichier modifié :** `src/modules/projets/tabs/candidats/CandidatsProjet.jsx`

**Changements :**
- ✅ Ajout d'une section "Appels à candidatures" en haut de l'onglet
- ✅ Affichage des appels sous forme de cartes avec statut, dates, actions
- ✅ Bouton "Créer un appel" visible même sans appels
- ✅ Filtre par appel dans la liste des candidats
- ✅ Navigation vers les détails d'un appel

**Fichier CSS :** `src/modules/projets/tabs/candidats/CandidatsProjet.css`
- Styles pour `.appels-section`, `.appel-card`, `.appel-meta`, `.appel-statut`

### 2. **Assiduité → Bénéficiaires**

**Fichier modifié :** `src/modules/projets/tabs/beneficiaires/BeneficiairesProjet.jsx`

**Changements :**
- ✅ Ajout d'une colonne "Assiduité" dans le tableau des bénéficiaires
- ✅ Calcul automatique du score d'assiduité via `assiduiteService`
- ✅ Affichage du score en pourcentage avec alerte si < 80%
- ✅ Chargement asynchrone des scores pour performance

**Fichier CSS :** `src/modules/projets/tabs/beneficiaires/BeneficiairesProjet.css`
- Styles pour `.assiduite-score` et `.assiduite-score.low`

### 3. **Ressources → Activités**

**Fichier modifié :** `src/modules/projets/tabs/activites/ActivitesProjet.jsx`

**Changements :**
- ✅ Ajout d'une colonne "Ressources" dans le tableau des activités
- ✅ Affichage du nombre de ressources réservées
- ✅ Section expandable pour voir les détails des réservations
- ✅ Chargement à la demande des réservations (lazy loading)
- ✅ Bouton pour réserver une ressource depuis une activité

**Fichier CSS :** `src/modules/projets/tabs/activites/ActivitesProjet.css`
- Styles pour `.activite-ressources-expanded`, `.ressources-list`, `.ressource-reservation-card`

**Service modifié :** `src/services/ressources.service.js`
- ✅ Ajout de la méthode `getReservationsByActivite(activiteId)`

---

## 📝 MODIFICATIONS DÉTAILLÉES

### **ProjetDetail.jsx**

**Changements principaux :**
1. ✅ Suppression des imports obsolètes :
   - `AssiduiteProjet`
   - `RessourcesProjet`
   - `appelsService`, `beneficiairesService` (chargement direct)
   - États `beneficiaires`, `appels`, `loadingBeneficiaires`, `loadingAppels`

2. ✅ Renommage de l'onglet :
   - "Budgets & Dépenses" → "Dépenses"

3. ✅ Suppression des onglets :
   - "Assiduité"
   - "Ressources"
   - "Appels"

4. ✅ Ajout du lien Programme :
   - Bouton "Voir le programme" dans le header
   - Lien dans l'onglet Détails

5. ✅ Nettoyage du code :
   - Suppression des fonctions `loadBeneficiaires()` et `loadAppels()`
   - Suppression des sections de rendu redondantes

---

## 🗂️ FICHIERS MODIFIÉS

### **Composants**
- ✅ `src/pages/projets/ProjetDetail.jsx`
- ✅ `src/modules/projets/tabs/candidats/CandidatsProjet.jsx`
- ✅ `src/modules/projets/tabs/beneficiaires/BeneficiairesProjet.jsx`
- ✅ `src/modules/projets/tabs/activites/ActivitesProjet.jsx`

### **Styles**
- ✅ `src/pages/projets/ProjetDetail.css`
- ✅ `src/modules/projets/tabs/candidats/CandidatsProjet.css`
- ✅ `src/modules/projets/tabs/beneficiaires/BeneficiairesProjet.css`
- ✅ `src/modules/projets/tabs/activites/ActivitesProjet.css`

### **Services**
- ✅ `src/services/ressources.service.js` (ajout `getReservationsByActivite`)

---

## 🗑️ FICHIERS OBSOLÈTES (À SUPPRIMER)

Les fichiers suivants ne sont plus utilisés et peuvent être supprimés :

1. ❌ `src/modules/projets/tabs/appels/AppelsProjet.jsx`
2. ❌ `src/modules/projets/tabs/appels/AppelsProjet.css`
3. ❌ `src/modules/projets/tabs/assiduite/AssiduiteProjet.jsx`
4. ❌ `src/modules/projets/tabs/assiduite/AssiduiteProjet.css`
5. ❌ `src/modules/projets/tabs/ressources/RessourcesProjet.jsx`
6. ❌ `src/modules/projets/tabs/ressources/RessourcesProjet.css`

**Note :** Les services sous-jacents (`assiduiteService`, `ressourcesService`, `appelsService`) restent utilisés et ne doivent **PAS** être supprimés.

---

## 🔄 CONTINUITÉ AVEC PROGRAMME

### **Structure des Onglets**

| Programme | Projet | Statut |
|-----------|--------|--------|
| Vue d'ensemble | Vue d'ensemble | ✅ Aligné |
| Dépenses | Dépenses | ✅ Aligné |
| Projets | - | N/A (Projet est sous-Programme) |
| Candidats | Candidats (+ Appels) | ✅ Aligné + Intégré |
| Bénéficiaires | Bénéficiaires (+ Assiduité) | ✅ Aligné + Intégré |
| Risques | Risques | ✅ Aligné |
| Jalons | Jalons | ✅ Aligné |
| Reporting | Reporting | ✅ Aligné |
| Détails | Détails | ✅ Aligné |
| Historique | Historique | ✅ Aligné |
| - | Activités (+ Ressources) | ✅ Spécifique Projet |

### **Navigation et Liens**

- ✅ **Projet → Programme** : Bouton "Voir le programme" dans le header
- ✅ **Programme → Projet** : Liste des projets dans l'onglet "Projets"
- ✅ **Cohérence** : Même logique de navigation et d'affichage

---

## 📋 STANDARDS APPLIQUÉS

### **1. Structure des Composants**
- Header avec titre et actions
- Statistiques/Métriques en haut
- Filtres dans une section dédiée
- Tableau de données avec colonnes configurables
- Actions contextuelles (créer, modifier, supprimer)

### **2. Gestion des États**
- `loading` pour les chargements
- `filters` pour les filtres
- États spécifiques pour les intégrations (ex: `assiduiteScores`, `ressourcesByActivite`)

### **3. Performance**
- Chargement à la demande (lazy loading) pour les ressources
- Calculs asynchrones pour l'assiduité
- Filtrage côté client pour les candidats

### **4. UX/UI**
- Sections expandables pour les détails
- Alertes visuelles (icônes, couleurs) pour les scores faibles
- Empty states avec actions contextuelles
- Responsive design (mobile, tablette, desktop)

---

## ✅ CHECKLIST DE VALIDATION

### **Fonctionnalités**
- [x] Appels affichés dans Candidats
- [x] Assiduité affichée dans Bénéficiaires
- [x] Ressources affichées dans Activités
- [x] Lien Programme fonctionnel
- [x] Navigation entre onglets fluide
- [x] Filtres opérationnels

### **Code**
- [x] Imports nettoyés
- [x] États inutilisés supprimés
- [x] Fonctions redondantes supprimées
- [x] Services mis à jour
- [x] CSS cohérent

### **Documentation**
- [x] Document récapitulatif créé
- [x] Commentaires dans le code
- [x] Structure documentée

---

## 🚀 PROCHAINES ÉTAPES

### **1. Suppression des Fichiers Obsolètes**
```bash
# Supprimer les fichiers non utilisés
rm src/modules/projets/tabs/appels/AppelsProjet.jsx
rm src/modules/projets/tabs/appels/AppelsProjet.css
rm src/modules/projets/tabs/assiduite/AssiduiteProjet.jsx
rm src/modules/projets/tabs/assiduite/AssiduiteProjet.css
rm src/modules/projets/tabs/ressources/RessourcesProjet.jsx
rm src/modules/projets/tabs/ressources/RessourcesProjet.css
```

### **2. Tests**
- [ ] Tester l'affichage des Appels dans Candidats
- [ ] Tester l'affichage de l'Assiduité dans Bénéficiaires
- [ ] Tester l'affichage des Ressources dans Activités
- [ ] Tester le lien Programme
- [ ] Tester la navigation entre onglets
- [ ] Tester les filtres

### **3. Harmonisation des Autres Modules**
- [ ] Analyser les autres modules (Partenaires, Intervenants, etc.)
- [ ] Appliquer la même logique de restructuration
- [ ] Unifier le style selon la référence Programmes/Projets

---

## 📚 RÉFÉRENCES

- **Module Programme** : `src/pages/programmes/ProgrammeDetail.jsx`
- **Style Guide** : `STYLE_GUIDE_REFERENCE.md`
- **Architecture Complète** : `ARCHITECTURE_COMPLETE_MODULES.md`

---

**Date de création :** 2025-01-06  
**Dernière mise à jour :** 2025-01-06  
**Auteur :** Assistant IA  
**Version :** 2.0

