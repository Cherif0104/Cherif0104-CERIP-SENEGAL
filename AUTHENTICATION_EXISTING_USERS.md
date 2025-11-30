# Utilisation des utilisateurs existants Supabase

## Vue d'ensemble

Votre application utilise maintenant **les mêmes données d'authentification et utilisateurs** qui existent déjà dans votre base Supabase.

## Structure existante

### Utilisateurs Supabase Auth
- **Table** : `auth.users` (gérée par Supabase)
- **Nombre** : 2 utilisateurs actuellement
- **Fonction** : Authentification (connexion/déconnexion)

### Profils utilisateurs
- **Table** : `public.users`
- **Nombre** : 20 utilisateurs actuellement
- **Structure** :
  - `id` (UUID) - Lié à `auth.users.id`
  - `email` (TEXT)
  - `role` (TEXT) - ADMIN_ORGANISME, BAILLEUR, BENEFICIAIRE, MENTOR, COACH, FORMATEUR, GPERFORM
  - `nom`, `prenom`, `telephone`
  - `organisation_id`
  - `metadata` (JSONB)

## Fonctionnement de l'authentification

### 1. Connexion (signIn)
```javascript
// Utilise Supabase Auth pour vérifier email/password
const { data, error } = await authService.signIn(email, password)

// Si succès :
// - L'utilisateur est authentifié dans Supabase Auth
// - Le profil est récupéré depuis public.users
// - Si le profil n'existe pas, il est créé automatiquement
```

### 2. Récupération du profil
```javascript
// Récupère le profil depuis public.users
const { data: profile } = await authService.getUserProfile(userId)

// Le profil contient toutes les infos (nom, prenom, role, etc.)
```

### 3. Inscription (signUp)
```javascript
// Crée un nouvel utilisateur dans Supabase Auth
// ET crée automatiquement son profil dans public.users
const { data, error } = await authService.signUp(email, password, nom, prenom, role)
```

## Exemple d'utilisateur existant

D'après votre base de données, voici un exemple :
- **Email** : `admin1@cerip.sn`
- **Role** : `ADMIN_ORGANISME`
- **Nom** : `Sarr`
- **Prénom** : `Fatou`
- **Téléphone** : `+221 77 101 45 67`

## Rôles disponibles

Les rôles suivants sont configurés dans votre base :
- `ADMIN_ORGANISME` - Administrateur de l'organisme
- `BAILLEUR` - Bailleur de fonds
- `BENEFICIAIRE` - Bénéficiaire
- `MENTOR` - Mentor
- `COACH` - Coach
- `FORMATEUR` - Formateur
- `GPERFORM` - Gestionnaire de performance

## Synchronisation automatique

Le service `auth.service.js` garantit que :
1. ✅ Lors de la connexion, le profil est récupéré depuis `public.users`
2. ✅ Si le profil n'existe pas (utilisateur auth sans profil public), il est créé automatiquement
3. ✅ Les données sont synchronisées entre `auth.users` et `public.users`

## Notes importantes

### Pour se connecter avec un utilisateur existant
1. Utilisez l'email et le mot de passe configurés dans Supabase Auth
2. Si vous ne connaissez pas le mot de passe, réinitialisez-le via Supabase Dashboard
3. Le profil sera automatiquement récupéré depuis `public.users`

### Pour créer un nouvel utilisateur
1. Utilisez la page d'inscription (`/register`)
2. Le système créera automatiquement :
   - Un compte dans `auth.users` (Supabase Auth)
   - Un profil dans `public.users` avec les informations fournies

### Si un utilisateur auth existe sans profil public
- Le système créera automatiquement un profil lors de la première connexion
- Les données par défaut seront utilisées si nécessaire

## Tests

Pour tester avec un utilisateur existant :
1. Allez sur `/login`
2. Utilisez un email existant dans votre base (ex: `admin1@cerip.sn`)
3. Utilisez le mot de passe configuré dans Supabase Auth
4. Si le mot de passe est oublié, réinitialisez-le depuis le Supabase Dashboard

## Prochaines étapes

- ✅ Authentification configurée pour utiliser les données existantes
- ✅ Synchronisation automatique entre auth.users et public.users
- ⏳ Tester la connexion avec un utilisateur existant
- ⏳ Vérifier que les données s'affichent correctement dans l'application

