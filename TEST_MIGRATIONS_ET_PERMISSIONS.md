# ✅ Tests - Migrations et Permissions

**Date :** 2025-01-03  
**Statut :** ✅ Migrations appliquées

---

## 🔄 Migrations Appliquées

### 1. Configuration Tables ✅
- ✅ Table `configuration` créée
- ✅ 16 configurations par défaut insérées
- ✅ RLS activé (admin uniquement)
- ✅ Triggers configurés

### 2. Permissions Tables ✅
- ✅ Table `permissions` créée
- ✅ Table `roles_custom` créée
- ✅ Colonne `roles_custom` ajoutée à `users`
- ✅ 42 permissions par défaut insérées
- ✅ RLS activé

---

## 🧪 Tests à Effectuer

### Test 1 : Configuration - Chargement

1. **Navigation** : Aller dans Administration → Configuration
2. **Vérifier** : Les champs sont préremplis avec les valeurs par défaut
3. **Résultat attendu** : ✅ Tous les champs chargés depuis la BDD

### Test 2 : Configuration - Sauvegarde

1. **Modifier** : Changer le nom de l'organisme (ex: "CERIP Senegal Test")
2. **Changer** : Modifier la devise (ex: "EUR")
3. **Sauvegarder** : Cliquer sur "Sauvegarder"
4. **Vérifier** : Message de succès affiché
5. **Recharger** : Rafraîchir la page
6. **Résultat attendu** : ✅ Les modifications sont persistées

### Test 3 : Permissions - Vérification

#### Test 3.1 : Hook usePermission

```jsx
import { usePermission } from '@/hooks/usePermission'

function TestComponent() {
  const { hasPermission, loading } = usePermission('programmes.create')
  
  if (loading) return <div>Chargement...</div>
  if (!hasPermission) return <div>Permission refusée</div>
  
  return <button>Créer Programme</button>
}
```

#### Test 3.2 : Composant PermissionGuard

```jsx
import PermissionGuard from '@/components/common/PermissionGuard'

<PermissionGuard permission="programmes.create">
  <button>Créer Programme</button>
</PermissionGuard>

<PermissionGuard 
  permission={['programmes.create', 'projets.create']}
  requireAll={false}
>
  <button>Créer (Programme ou Projet)</button>
</PermissionGuard>
```

#### Test 3.3 : Service Permissions

```js
import { permissionsService } from '@/services/permissions.service'

// Vérifier une permission
const hasPerm = await permissionsService.checkCurrentUserPermission('programmes.create')

// Vérifier plusieurs permissions (au moins une)
const hasAny = await permissionsService.hasAnyPermission(userId, [
  'programmes.create',
  'projets.create'
])

// Vérifier toutes les permissions
const hasAll = await permissionsService.hasAllPermissions(userId, [
  'programmes.create',
  'programmes.update'
])
```

---

## 📝 Exemples d'Utilisation

### 1. Protéger un bouton

```jsx
import PermissionGuard from '@/components/common/PermissionGuard'

function ProgrammesListe() {
  return (
    <div>
      <h2>Programmes</h2>
      <PermissionGuard permission="programmes.create">
        <Button onClick={handleCreate}>
          Nouveau programme
        </Button>
      </PermissionGuard>
      
      {/* Liste des programmes */}
    </div>
  )
}
```

### 2. Protéger une route

```jsx
import { usePermission } from '@/hooks/usePermission'
import { Navigate } from 'react-router-dom'

function ProtectedAdminRoute({ children }) {
  const { hasPermission, loading } = usePermission('administration.users')
  
  if (loading) return <LoadingState />
  if (!hasPermission) return <Navigate to="/" replace />
  
  return children
}
```

### 3. Afficher conditionnellement

```jsx
import { usePermission } from '@/hooks/usePermission'

function ProgrammeActions({ programme }) {
  const canEdit = usePermission('programmes.update')
  const canDelete = usePermission('programmes.delete')
  
  return (
    <div>
      {canEdit.hasPermission && (
        <Button onClick={() => handleEdit(programme)}>
          Modifier
        </Button>
      )}
      {canDelete.hasPermission && (
        <Button variant="danger" onClick={() => handleDelete(programme)}>
          Supprimer
        </Button>
      )}
    </div>
  )
}
```

### 4. Permissions multiples

```jsx
// Au moins une des permissions
<PermissionGuard 
  permission={['programmes.create', 'projets.create']}
  requireAll={false}
>
  <Button>Créer</Button>
</PermissionGuard>

// Toutes les permissions requises
<PermissionGuard 
  permission={['programmes.read', 'programmes.update']}
  requireAll={true}
>
  <Button>Modifier</Button>
</PermissionGuard>
```

---

## 🔍 Vérification dans Supabase

### Vérifier la table configuration

```sql
SELECT * FROM public.configuration ORDER BY categorie, cle;
```

**Résultat attendu** : 16 lignes avec les configurations par défaut

### Vérifier la table permissions

```sql
SELECT code, nom, module, action FROM public.permissions 
WHERE actif = true 
ORDER BY module, action;
```

**Résultat attendu** : 42 lignes avec toutes les permissions

### Vérifier les permissions d'un utilisateur

```sql
-- Récupérer le rôle d'un utilisateur
SELECT id, email, role, roles_custom 
FROM public.users 
WHERE id = 'user-uuid-here';

-- Vérifier les permissions de ce rôle
SELECT p.* 
FROM public.permissions p
WHERE p.actif = true
AND (
  p.code = '*' 
  OR p.code LIKE 'programmes.%'  -- Exemple pour programmes
);
```

---

## ✅ Checklist de Tests

### Configuration
- [ ] Chargement des valeurs par défaut
- [ ] Modification et sauvegarde (Général)
- [ ] Modification et sauvegarde (Sécurité)
- [ ] Modification et sauvegarde (Localisation)
- [ ] Modification et sauvegarde (Email)
- [ ] Persistance après rechargement

### Permissions
- [ ] Hook `usePermission` fonctionne
- [ ] Composant `PermissionGuard` masque/affiche correctement
- [ ] Service `permissionsService.hasPermission` retourne correct
- [ ] Service `permissionsService.hasAnyPermission` fonctionne
- [ ] Service `permissionsService.hasAllPermissions` fonctionne
- [ ] Permissions par rôle (ADMIN_SERIP a tous les droits)
- [ ] Permissions par module (ex: programmes.*)

---

## 🐛 Problèmes Potentiels

### Problème 1 : RLS bloque l'accès
**Symptôme** : Erreur "permission denied"  
**Solution** : Vérifier que l'utilisateur connecté a le rôle ADMIN_SERIP ou ADMIN_ORGANISME

### Problème 2 : Permissions non trouvées
**Symptôme** : `hasPermission` retourne toujours false  
**Solution** : 
1. Vérifier que les permissions existent dans la table
2. Vérifier que l'utilisateur a un rôle valide
3. Vérifier les logs dans la console

### Problème 3 : Configuration ne se sauvegarde pas
**Symptôme** : Erreur lors de la sauvegarde  
**Solution** :
1. Vérifier RLS sur la table configuration
2. Vérifier que l'utilisateur est admin
3. Vérifier les logs dans la console

---

## 📊 Fichiers Créés

### Services et Repositories
- ✅ `src/data/repositories/PermissionRepository.js`
- ✅ `src/services/permissions.service.js`

### Composants et Hooks
- ✅ `src/components/common/PermissionGuard.jsx`
- ✅ `src/components/common/PermissionGuard.css`
- ✅ `src/hooks/usePermission.js`

### Documentation
- ✅ `TEST_MIGRATIONS_ET_PERMISSIONS.md`

---

## 🎯 Prochaines Étapes

1. **Tester** la sauvegarde de configuration dans l'interface
2. **Intégrer** PermissionGuard dans quelques composants existants
3. **Vérifier** que les permissions fonctionnent correctement
4. **Documenter** les permissions utilisées dans chaque module

