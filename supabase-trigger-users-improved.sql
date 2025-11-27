-- Trigger amélioré pour créer automatiquement un profil dans la table users
-- avec meilleure gestion d'erreurs
-- 
-- Instructions:
-- 1. Connectez-vous à votre projet Supabase
-- 2. Allez dans SQL Editor
-- 3. Exécutez ce script

-- Supprimer l'ancien trigger et fonction s'ils existent
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Fonction pour créer automatiquement un profil utilisateur
-- avec gestion d'erreurs améliorée
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insérer le profil dans la table users
  -- ON CONFLICT permet d'éviter les erreurs si le profil existe déjà
  INSERT INTO public.users (
    id,
    email,
    nom,
    prenom,
    role,
    actif,
    date_creation
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nom', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'ADMIN_SERIP'),
    true,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    nom = COALESCE(EXCLUDED.nom, users.nom),
    prenom = COALESCE(EXCLUDED.prenom, users.prenom),
    role = COALESCE(EXCLUDED.role, users.role);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- En cas d'erreur, logger l'erreur mais ne pas bloquer la création du compte auth
    RAISE WARNING 'Error creating user profile for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;

-- Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Vérifier que la table users existe et a les bonnes colonnes
-- Si la table n'existe pas, vous devez la créer d'abord avec cette structure :
/*
CREATE TABLE IF NOT EXISTS public.users (
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

-- Créer un index sur email pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Désactiver RLS temporairement pour permettre au trigger de fonctionner
-- OU créer une politique qui permet au trigger de fonctionner
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
-- OU créer une politique :
-- CREATE POLICY "Trigger can insert users" ON public.users FOR INSERT WITH CHECK (true);
*/

