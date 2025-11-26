-- Trigger pour créer automatiquement un profil dans la table users
-- lors de la création d'un compte dans Supabase Auth
-- 
-- Instructions:
-- 1. Connectez-vous à votre projet Supabase
-- 2. Allez dans SQL Editor
-- 3. Exécutez ce script

-- Fonction pour créer automatiquement un profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger qui s'exécute après l'insertion d'un nouvel utilisateur dans auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Note: Assurez-vous que la table users existe avec les colonnes suivantes:
-- - id (uuid, primary key, references auth.users(id))
-- - email (text)
-- - nom (text)
-- - prenom (text)
-- - role (text, default 'ADMIN_SERIP')
-- - actif (boolean, default true)
-- - date_creation (timestamp)

