# 🧪 Guide de Test Manuel - Fonctionnalités Implémentées

## 🚀 Démarrage

1. **Lancer l'application :**
   ```bash
   npm run dev
   ```

2. **Ouvrir dans le navigateur :**
   - URL : `http://localhost:5173`
   - Ouvrir la console (F12) pour voir les logs

---

## ✅ Test 1 : Audit Trail dans ProgrammeDetail

### Étapes

1. **Se connecter** avec votre compte (`cerip-thies@gmail.com`)

2. **Naviguer vers un programme :**
   - Aller dans "Programmes & Projets"
   - Cliquer sur un programme existant
   - OU créer un nouveau programme

3. **Vérifier l'onglet Historique :**
   - Dans la page de détail du programme
   - Vérifier qu'il y a 2 onglets : "Détails" et "Historique"
   - Cliquer sur l'onglet "Historique"

4. **Vérifier l'affichage :**
   - ✅ L'historique des modifications s'affiche
   - ✅ Chaque entrée montre : Action (INSERT, UPDATE, etc.), Date, Utilisateur
   - ✅ Les champs modifiés sont listés
   - ✅ Bouton "Voir les modifications détaillées" disponible pour les UPDATE

5. **Tester les modifications :**
   - Modifier le nom du programme
   - Sauvegarder
   - Revenir sur l'onglet "Historique"
   - ✅ Une nouvelle entrée UPDATE apparaît
   - ✅ Les champs modifiés sont visibles

### Résultat attendu
- ✅ Onglet "Historique" fonctionnel
- ✅ Historique complet affiché
- ✅ Modifications tracées automatiquement

---

## ✅ Test 2 : Validation Temps Réel dans ProgrammeForm

### Étapes

1. **Aller sur le formulaire :**
   - Cliquer sur "Nouveau programme" ou modifier un programme existant

2. **Tester validation nom (requis) :**
   - Laisser le champ "Nom" vide
   - Cliquer ailleurs ou modifier un autre champ
   - ✅ Message d'erreur apparaît : "Le nom est requis"
   - ✅ Le champ devient rouge

3. **Tester validation dates :**
   - Entrer une date de début : 2025-12-31
   - Entrer une date de fin : 2025-01-01 (antérieure)
   - ✅ Avertissement apparaît : "La date de fin doit être postérieure à la date de début"
   - ✅ Le champ date de fin devient rouge

4. **Tester validation budget :**
   - Entrer un budget négatif : -1000
   - ✅ Avertissement apparaît : "Le budget doit être positif ou nul"

5. **Tester indicateur de validation :**
   - Corriger toutes les erreurs
   - ✅ L'indicateur en bas devient vert : "Formulaire valide"
   - ✅ Le bouton "Créer" est activé

6. **Tester soumission avec erreurs :**
   - Créer des erreurs dans le formulaire
   - Essayer de cliquer sur "Créer"
   - ✅ Le bouton est désactivé si le formulaire est invalide
   - ✅ Les erreurs sont affichées en haut du formulaire

### Résultat attendu
- ✅ Validation temps réel fonctionnelle
- ✅ Messages d'erreur clairs
- ✅ Indicateur de validation visible
- ✅ Bouton désactivé si formulaire invalide

---

## ✅ Test 3 : Business Rules Engine

### Étapes

1. **Tester règle budget :**
   - Créer un programme avec budget = -500
   - ✅ La validation bloque (règle PROG-001)

2. **Tester règle dates :**
   - Créer un programme avec date_fin < date_debut
   - ✅ La validation bloque (règle PROG-002)

3. **Tester règle nom requis :**
   - Créer un programme sans nom
   - ✅ La validation bloque (règle PROG-004)

### Résultat attendu
- ✅ Toutes les règles métier sont appliquées
- ✅ Les messages d'erreur correspondent aux règles

---

## ✅ Test 4 : Cache (Console)

### Étapes

1. **Ouvrir la console** (F12)

2. **Charger une liste :**
   - Aller dans "Programmes & Projets"
   - Regarder la console
   - ✅ Voir les logs `[REPOSITORY] findAll réussi`
   - ✅ Voir `fromCache: false` (première fois)

3. **Recharger la liste :**
   - Actualiser la page (F5)
   - Regarder la console
   - ✅ Voir `Cache hit` (si cache activé)
   - ✅ Ou `fromCache: true`

4. **Modifier un programme :**
   - Modifier un programme
   - Sauvegarder
   - Regarder la console
   - ✅ Voir `Cache invalidated: programmes`

5. **Recharger la liste :**
   - Actualiser la page
   - ✅ Les nouvelles données sont chargées (cache invalidé)

### Résultat attendu
- ✅ Cache fonctionnel (vérifier dans logs)
- ✅ Invalidation automatique lors des modifications

---

## ✅ Test 5 : Logs et Traçabilité

### Étapes

1. **Ouvrir la console** (F12)

2. **Effectuer des actions :**
   - Créer un programme
   - Modifier un programme
   - Consulter un programme

3. **Vérifier les logs :**
   - ✅ Voir les logs `[AUDIT_SERVICE]` pour chaque action
   - ✅ Voir les logs `[BUSINESS_RULES]` pour les validations
   - ✅ Voir les logs `[REPOSITORY]` pour les opérations données
   - ✅ Voir les logs `[ENTITY_VALIDATOR]` pour les validations

4. **Utiliser les commandes de log :**
   - Dans la console, taper : `window.logs()`
   - ✅ Voir tous les logs avec couleurs
   - ✅ Filtrer : `window.logs({ level: 'ERROR' })`
   - ✅ Filtrer par tag : `window.logs({ tag: 'AUDIT_SERVICE' })`

### Résultat attendu
- ✅ Toutes les actions sont loggées
- ✅ Les logs sont structurés et faciles à lire
- ✅ Commandes console fonctionnelles

---

## ✅ Test 6 : Performance

### Étapes

1. **Ouvrir Chrome DevTools** (F12)

2. **Onglet Network :**
   - Actualiser la page
   - ✅ Vérifier le temps de chargement
   - ✅ Objectif : < 3s

3. **Onglet Performance :**
   - Enregistrer une session
   - Naviguer dans l'application
   - Arrêter l'enregistrement
   - ✅ Analyser les performances

4. **Lighthouse :**
   - Onglet Lighthouse dans DevTools
   - Lancer un audit
   - ✅ Score actuel (objectif > 70, cible > 90)

### Résultat attendu
- ✅ Performance acceptable
- ✅ Métriques mesurées

---

## 🔍 Vérifications dans la Base de Données

### Audit Log

1. **Se connecter à Supabase :**
   - Aller dans SQL Editor

2. **Vérifier les logs d'audit :**
   ```sql
   SELECT * FROM audit_log 
   WHERE table_name = 'programmes' 
   ORDER BY timestamp DESC 
   LIMIT 10;
   ```

3. **Vérifications :**
   - ✅ Les opérations INSERT/UPDATE/DELETE sont loggées
   - ✅ Les old_values et new_values sont présents
   - ✅ Les changed_fields sont listés
   - ✅ Le user_id et user_email sont présents

---

## 📊 Checklist Complète

### Audit Trail
- [ ] Onglet "Historique" visible dans ProgrammeDetail
- [ ] Historique s'affiche avec les données
- [ ] Modifications automatiquement tracées
- [ ] Détails des modifications visibles

### Validation
- [ ] Validation temps réel fonctionne
- [ ] Messages d'erreur clairs
- [ ] Indicateur de validation (vert/rouge)
- [ ] Bouton désactivé si formulaire invalide

### Règles Métier
- [ ] Budget négatif bloqué
- [ ] Dates incohérentes bloquées
- [ ] Champs requis validés

### Cache
- [ ] Cache fonctionne (vérifier dans logs)
- [ ] Invalidation fonctionne après modification

### Performance
- [ ] Temps de chargement acceptable
- [ ] Pas d'erreurs console
- [ ] Interface responsive

---

## 🐛 Problèmes Connus / À Surveiller

1. **Bundle size** : Actuellement > 500KB (optimisation prévue Phase 2)
2. **Cache** : Vérifier que l'invalidation fonctionne correctement
3. **Audit Trail** : S'assurer que tous les triggers sont actifs

---

## 📝 Notes de Test

**Date de test :** _________________

**Testeur :** _________________

**Navigateur :** _________________

**Résultats :**
- Audit Trail : ☐ OK ☐ Problèmes
- Validation : ☐ OK ☐ Problèmes
- Cache : ☐ OK ☐ Problèmes
- Performance : ☐ OK ☐ Problèmes

**Commentaires :**
_________________________________
_________________________________
_________________________________

---

**Bonne chance pour les tests ! 🚀**

