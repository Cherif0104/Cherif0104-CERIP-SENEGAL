-- Migration : Correction des politiques RLS pour programme_depenses
-- Date : 2025-01-04
-- Description : Ajouter une politique plus permissive pour permettre aux utilisateurs authentifiés de créer des dépenses

-- ============================================
-- POLITIQUE POUR UTILISATEURS AUTHENTIFIÉS
-- ============================================

-- Supprimer l'ancienne politique si elle existe (pour éviter les doublons)
DROP POLICY IF EXISTS "Allow authenticated users to create expenses on programme_depenses" ON public.programme_depenses;

-- Politique : Tous les utilisateurs authentifiés peuvent créer des dépenses
CREATE POLICY "Allow authenticated users to create expenses on programme_depenses"
  ON public.programme_depenses FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Politique : Les utilisateurs authentifiés peuvent lire les dépenses qu'ils ont créées
CREATE POLICY IF NOT EXISTS "Allow authenticated users to read own expenses on programme_depenses"
  ON public.programme_depenses FOR SELECT
  USING (auth.uid() = created_by);

-- Note: Les autres politiques existantes (pour admins, gestionnaires, chefs de projet) restent actives
-- et prennent priorité grâce à leur spécificité

