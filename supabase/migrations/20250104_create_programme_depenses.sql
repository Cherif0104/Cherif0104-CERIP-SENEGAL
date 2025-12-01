-- Migration : Création de la table programme_depenses
-- Date : 2025-01-04
-- Description : Table pour gérer les dépenses détaillées des programmes avec pièces justificatives

-- ============================================
-- AJOUT DE LA COLONNE budget_consomme SI NÉCESSAIRE
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'programmes' 
    AND column_name = 'budget_consomme'
  ) THEN
    ALTER TABLE public.programmes 
    ADD COLUMN budget_consomme NUMERIC(15, 2) DEFAULT 0;
    
    COMMENT ON COLUMN public.programmes.budget_consomme IS 'Montant total du budget consommé pour le programme (calculé automatiquement)';
  END IF;
END $$;

-- ============================================
-- CRÉATION DE LA TABLE programme_depenses
-- ============================================

CREATE TABLE IF NOT EXISTS public.programme_depenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id TEXT NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
  libelle TEXT NOT NULL,
  montant NUMERIC(15, 2) NOT NULL,
  date_depense DATE NOT NULL,
  description TEXT,
  reference TEXT,
  statut TEXT NOT NULL DEFAULT 'BROUILLON' CHECK (statut IN ('BROUILLON', 'VALIDE', 'PAYE', 'ANNULE')),
  justificatif_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Commentaires
COMMENT ON TABLE public.programme_depenses IS 'Dépenses détaillées pour chaque programme avec pièces justificatives';
COMMENT ON COLUMN public.programme_depenses.programme_id IS 'ID du programme associé';
COMMENT ON COLUMN public.programme_depenses.libelle IS 'Libellé de la dépense';
COMMENT ON COLUMN public.programme_depenses.montant IS 'Montant de la dépense en FCFA';
COMMENT ON COLUMN public.programme_depenses.date_depense IS 'Date de la dépense';
COMMENT ON COLUMN public.programme_depenses.description IS 'Description détaillée de la dépense';
COMMENT ON COLUMN public.programme_depenses.reference IS 'Référence de la facture ou pièce justificative';
COMMENT ON COLUMN public.programme_depenses.statut IS 'Statut de la dépense: BROUILLON, VALIDE, PAYE, ANNULE';
COMMENT ON COLUMN public.programme_depenses.justificatif_url IS 'URL du document justificatif dans Supabase Storage';

-- ============================================
-- INDEXES POUR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_programme_depenses_programme_id 
ON public.programme_depenses(programme_id);

CREATE INDEX IF NOT EXISTS idx_programme_depenses_date_depense 
ON public.programme_depenses(date_depense DESC);

CREATE INDEX IF NOT EXISTS idx_programme_depenses_statut 
ON public.programme_depenses(statut);

CREATE INDEX IF NOT EXISTS idx_programme_depenses_created_by 
ON public.programme_depenses(created_by);

-- ============================================
-- TRIGGER POUR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION public.update_programme_depenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_programme_depenses_updated_at
  BEFORE UPDATE ON public.programme_depenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_programme_depenses_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.programme_depenses ENABLE ROW LEVEL SECURITY;

-- Politique : Les admins et gestionnaires peuvent tout faire
CREATE POLICY "Allow full access for admins and managers on programme_depenses"
  ON public.programme_depenses FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users 
      WHERE role IN ('ADMIN_ORGANISME', 'GESTIONNAIRE')
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.users 
      WHERE role IN ('ADMIN_ORGANISME', 'GESTIONNAIRE')
    )
  );

-- Politique : Les chefs de projet peuvent lire les dépenses pour leurs programmes
CREATE POLICY "Allow read for project managers on programme_depenses"
  ON public.programme_depenses FOR SELECT
  USING (
    programme_id IN (
      SELECT p.id FROM public.programmes p
      WHERE p.id = programme_depenses.programme_id
      AND EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid()
        AND u.role = 'CHEF_PROJET'
      )
    )
  );

-- Politique : Les chefs de projet peuvent créer des dépenses pour leurs programmes
CREATE POLICY "Allow create for project managers on programme_depenses"
  ON public.programme_depenses FOR INSERT
  WITH CHECK (
    programme_id IN (
      SELECT p.id FROM public.programmes p
      WHERE p.id = programme_depenses.programme_id
      AND EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid()
        AND u.role = 'CHEF_PROJET'
      )
    )
  );

-- Politique : Les utilisateurs peuvent lire leurs propres dépenses
CREATE POLICY "Allow read own expenses on programme_depenses"
  ON public.programme_depenses FOR SELECT
  USING (auth.uid() = created_by);

-- ============================================
-- FONCTION POUR MISE À JOUR AUTOMATIQUE DU budget_consomme
-- ============================================

CREATE OR REPLACE FUNCTION public.update_programme_budget_consomme()
RETURNS TRIGGER AS $$
DECLARE
  v_programme_id TEXT;
BEGIN
  -- Déterminer le programme_id selon le type d'opération
  IF TG_OP = 'DELETE' THEN
    v_programme_id := OLD.programme_id;
  ELSE
    v_programme_id := NEW.programme_id;
  END IF;

  -- Calculer le budget consommé pour le programme
  UPDATE public.programmes
  SET budget_consomme = (
    SELECT COALESCE(SUM(montant), 0)
    FROM public.programme_depenses
    WHERE programme_id = v_programme_id
    AND statut IN ('VALIDE', 'PAYE')
  )
  WHERE id = v_programme_id;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_programme_budget_consomme
  AFTER INSERT OR UPDATE OR DELETE ON public.programme_depenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_programme_budget_consomme();

