-- Script pour créer la table users si elle n'existe pas
-- Exécutez ce script dans Supabase SQL Editor AVANT d'installer le trigger

-- Créer la table users si elle n'existe pas
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

-- Désactiver RLS pour permettre au trigger de fonctionner
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Vérifier que la table a été créée
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

