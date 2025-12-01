-- Migration : Enrichissement de la table programmes
-- Date : 2025-01-04
-- Description : Ajout des colonnes pour genre, secteur, localisation, financeurs multiples, exécutants

-- ============================================
-- AJOUT DE COLONNES MANQUANTES
-- ============================================

-- Genre cible (pour les critères d'éligibilité)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'programmes' 
    AND column_name = 'genre_cible'
  ) THEN
    ALTER TABLE public.programmes 
    ADD COLUMN genre_cible TEXT[];
  END IF;
END $$;

-- Type d'activité
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'programmes' 
    AND column_name = 'type_activite'
  ) THEN
    ALTER TABLE public.programmes 
    ADD COLUMN type_activite TEXT;
  END IF;
END $$;

-- Secteurs d'activité (array pour plusieurs secteurs)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'programmes' 
    AND column_name = 'secteurs_activite'
  ) THEN
    ALTER TABLE public.programmes 
    ADD COLUMN secteurs_activite TEXT[];
  END IF;
END $$;

-- Région cible (déjà existe : regions_cibles)
-- Commune cible
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'programmes' 
    AND column_name = 'communes_cibles'
  ) THEN
    ALTER TABLE public.programmes 
    ADD COLUMN communes_cibles TEXT[];
  END IF;
END $$;

-- Arrondissements cibles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'programmes' 
    AND column_name = 'arrondissements_cibles'
  ) THEN
    ALTER TABLE public.programmes 
    ADD COLUMN arrondissements_cibles TEXT[];
  END IF;
END $$;

-- Financeurs multiples (array d'IDs)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'programmes' 
    AND column_name = 'financeurs_ids'
  ) THEN
    ALTER TABLE public.programmes 
    ADD COLUMN financeurs_ids UUID[];
  END IF;
END $$;

-- Exécutants multiples (array d'IDs de structures/partenaires)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'programmes' 
    AND column_name = 'executants_ids'
  ) THEN
    ALTER TABLE public.programmes 
    ADD COLUMN executants_ids UUID[];
  END IF;
END $$;

-- Organisation exécutante principale
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'programmes' 
    AND column_name = 'organisation_executante_id'
  ) THEN
    ALTER TABLE public.programmes 
    ADD COLUMN organisation_executante_id UUID;
  END IF;
END $$;

-- Commentaires
COMMENT ON COLUMN public.programmes.genre_cible IS 'Genres cibles du programme (ex: [''Homme'', ''Femme'', ''Mixte''])';
COMMENT ON COLUMN public.programmes.type_activite IS 'Type d''activité principale du programme';
COMMENT ON COLUMN public.programmes.secteurs_activite IS 'Secteurs d''activité ciblés (array)';
COMMENT ON COLUMN public.programmes.communes_cibles IS 'Communes cibles du programme';
COMMENT ON COLUMN public.programmes.arrondissements_cibles IS 'Arrondissements cibles du programme';
COMMENT ON COLUMN public.programmes.financeurs_ids IS 'IDs des financeurs (array) - pour financements multiples';
COMMENT ON COLUMN public.programmes.executants_ids IS 'IDs des exécutants/partenaires (array)';
COMMENT ON COLUMN public.programmes.organisation_executante_id IS 'Organisation exécutante principale';

-- ============================================
-- INDEXES POUR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_programmes_type_activite 
ON public.programmes(type_activite);

CREATE INDEX IF NOT EXISTS idx_programmes_secteurs_activite 
ON public.programmes USING GIN(secteurs_activite);

CREATE INDEX IF NOT EXISTS idx_programmes_regions_cibles 
ON public.programmes USING GIN(regions_cibles);

CREATE INDEX IF NOT EXISTS idx_programmes_communes_cibles 
ON public.programmes USING GIN(communes_cibles);

CREATE INDEX IF NOT EXISTS idx_programmes_financeurs_ids 
ON public.programmes USING GIN(financeurs_ids);

CREATE INDEX IF NOT EXISTS idx_programmes_executants_ids 
ON public.programmes USING GIN(executants_ids);

-- ============================================
-- MISE À JOUR DES COMMENTAIRES EXISTANTS
-- ============================================

COMMENT ON TABLE public.programmes IS 'Programmes d''insertion professionnelle avec critères détaillés';

