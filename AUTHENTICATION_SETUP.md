# Configuration de l'authentification réelle avec Supabase

## Vue d'ensemble

Le système d'authentification utilise maintenant **uniquement Supabase Auth**, sans système BYPASS. Tous les utilisateurs doivent avoir un compte dans Supabase Auth et un profil correspondant dans la table `users`.

## Structure de la base de données

### Table `users`

La table `users` doit contenir les colonnes suivantes :

```sql
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
```

### Rôles disponibles

- `ADMIN_SERIP` : Administrateur SERIP-CAS (accès complet)
- `CHEF_PROJET` : Chef de projet
- `MENTOR` : Mentor
- `FORMATEUR` : Formateur
- `COACH` : Coach

## Configuration Supabase

### 1. Créer le trigger automatique

Exécutez le script `supabase-trigger-users.sql` dans le SQL Editor de Supabase. Ce script crée un trigger qui :

- Crée automatiquement un profil dans `users` lors de l'inscription
- Utilise les métadonnées de l'utilisateur (nom, prénom, rôle) si disponibles
- Définit un rôle par défaut `ADMIN_SERIP` si non spécifié

### 2. Configurer les politiques RLS (Row Level Security)

Assurez-vous que les politiques RLS sont configurées pour permettre :

- **Lecture** : Les utilisateurs peuvent lire leur propre profil
- **Écriture** : Les utilisateurs peuvent modifier leur propre profil (sauf le rôle)
- **Admin** : Les administrateurs peuvent lire/modifier tous les profils

Exemple de politiques :

```sql
-- Permettre aux utilisateurs de lire leur propre profil
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Permettre aux utilisateurs de modifier leur propre profil (sauf rôle)
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.users WHERE id = auth.uid()));

-- Permettre aux admins de tout faire
CREATE POLICY "Admins can manage all users"
  ON public.users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'ADMIN_SERIP'
    )
  );
```

## Inscription d'un nouvel utilisateur

### Via l'interface

1. L'utilisateur clique sur "Créer un compte"
2. Il est redirigé vers une page de contact (actuellement)
3. Un administrateur doit créer le compte manuellement

### Via le code (pour les admins)

```javascript
import { authService } from './services/auth.service'

// Créer un compte avec un rôle spécifique
const result = await authService.signUp(
  'user@example.com',
  'password123',
  'Nom',
  'Prénom',
  'CHEF_PROJET' // Rôle
)
```

## Connexion

L'utilisateur se connecte avec son email et mot de passe via Supabase Auth. Le système :

1. Authentifie l'utilisateur via Supabase Auth
2. Récupère le profil depuis la table `users`
3. Crée automatiquement un profil si nécessaire (via `ensureUserProfile`)

## Récupération du rôle

Le rôle est **toujours récupéré depuis la table `users`**, pas depuis `user_metadata`. Cela garantit :

- Une source unique de vérité
- La possibilité de modifier les rôles sans ré-authentifier
- La cohérence avec le reste de l'ERP

## Migration depuis le système BYPASS

Si vous aviez des comptes de test avec le BYPASS :

1. Créez les comptes correspondants dans Supabase Auth
2. Créez les profils dans la table `users` avec les mêmes rôles
3. Les utilisateurs devront utiliser leurs nouveaux identifiants

## Sécurité

- Les mots de passe sont hashés par Supabase
- Les sessions sont gérées par Supabase Auth
- Les rôles sont stockés dans la base de données (pas dans le token JWT)
- Les politiques RLS protègent l'accès aux données

## Dépannage

### L'utilisateur ne peut pas se connecter

1. Vérifiez que le compte existe dans Supabase Auth
2. Vérifiez que le profil existe dans la table `users`
3. Vérifiez les politiques RLS

### Le rôle n'est pas correct

1. Vérifiez la table `users` pour le bon rôle
2. Vérifiez que `getUserProfile` récupère bien depuis `users`
3. Videz le cache du navigateur si nécessaire

### Le profil n'est pas créé automatiquement

1. Vérifiez que le trigger est bien installé
2. Vérifiez les logs Supabase pour les erreurs
3. Créez manuellement le profil si nécessaire

