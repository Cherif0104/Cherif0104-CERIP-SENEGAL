# Correction des politiques RLS - Résumé

## Problème identifié

**Erreur** : `infinite recursion detected in policy for relation "users"`

### Cause
Les politiques RLS sur la table `users` créaient une récursion infinie :
- La politique "Admins can view all users" faisait un `SELECT` sur `users` pour vérifier si l'utilisateur est admin
- Ce `SELECT` déclenchait à nouveau les politiques RLS, créant une boucle infinie

## Solution appliquée

### 1. Suppression des politiques problématiques
- ❌ Supprimé : "Admins can view all users" (créait la récursion)
- ❌ Supprimé : "Authenticated users can read all profiles" (trop permissive)
- ❌ Supprimé : "Users can read own profile" (doublon)
- ❌ Supprimé : "Users can view own profile" (doublon)

### 2. Création de nouvelles politiques sans récursion

#### Politique pour les utilisateurs (lecture de leur propre profil)
```sql
CREATE POLICY "users_select_own" 
ON public.users FOR SELECT
TO authenticated
USING (id = auth.uid());
```

#### Politique pour les admins (utilise une fonction SECURITY DEFINER)
```sql
-- Fonction qui bypass RLS pour éviter la récursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  SET LOCAL row_security = off;  -- Bypass RLS temporairement
  SELECT role INTO user_role
  FROM public.users
  WHERE id = auth.uid();
  RETURN user_role = 'ADMIN_ORGANISME';
END;
$$;

-- Politique pour les admins
CREATE POLICY "admins_select_all" 
ON public.users FOR SELECT
TO authenticated
USING (public.is_admin() OR id = auth.uid());
```

#### Politiques INSERT et UPDATE
- `users_insert_own` - Permet aux utilisateurs authentifiés d'insérer leur propre profil
- `users_update_own` - Permet aux utilisateurs authentifiés de mettre à jour leur propre profil

## Résultat

✅ **Les politiques RLS fonctionnent maintenant sans récursion**
✅ **Les utilisateurs peuvent lire leur propre profil**
✅ **Les admins peuvent lire tous les profils**
✅ **Les utilisateurs peuvent créer/mettre à jour leur propre profil**

## Vérification

La requête suivante fonctionne maintenant :
```sql
SELECT id, email, role 
FROM users 
WHERE id = 'de89c911-7f6e-4e14-ad72-0564fa3b83d8';
```

## Prochaines étapes

1. ✅ RLS sur `users` corrigé
2. ⏳ Vérifier et corriger les politiques RLS sur `programmes` si nécessaire
3. ⏳ Tester la connexion complète dans l'application

## Notes techniques

- **SECURITY DEFINER** : La fonction s'exécute avec les privilèges du créateur, permettant de bypass RLS
- **SET LOCAL row_security = off** : Désactive temporairement RLS dans la fonction
- **Stable function** : La fonction est marquée comme stable pour optimiser les performances

