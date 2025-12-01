-- Migration : Fonctions SQL pour gestion des dépenses projet
-- Date : 2025-01-05
-- Description : Fonctions RPC pour créer, mettre à jour et supprimer des dépenses avec support projet_id

-- ============================================
-- FONCTION : create_programme_depense (avec projet_id)
-- ============================================

CREATE OR REPLACE FUNCTION public.create_programme_depense(
  p_programme_id TEXT,
  p_projet_id UUID DEFAULT NULL,
  p_libelle TEXT,
  p_montant NUMERIC(15, 2),
  p_date_depense DATE,
  p_description TEXT DEFAULT NULL,
  p_reference TEXT DEFAULT NULL,
  p_statut TEXT DEFAULT 'BROUILLON',
  p_justificatif_url TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  programme_id TEXT,
  projet_id UUID,
  libelle TEXT,
  montant NUMERIC(15, 2),
  date_depense DATE,
  statut TEXT,
  reference TEXT,
  justificatif_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
  v_created_by UUID;
BEGIN
  -- Récupérer l'utilisateur actuel
  v_created_by := auth.uid();
  
  -- Insérer la dépense
  INSERT INTO public.programme_depenses (
    programme_id,
    projet_id,
    libelle,
    montant,
    date_depense,
    description,
    reference,
    statut,
    justificatif_url,
    created_by
  ) VALUES (
    p_programme_id,
    p_projet_id,
    p_libelle,
    p_montant,
    p_date_depense,
    p_description,
    p_reference,
    p_statut,
    p_justificatif_url,
    v_created_by
  )
  RETURNING programme_depenses.id INTO v_id;
  
  -- Retourner les données créées
  RETURN QUERY
  SELECT 
    d.id,
    d.programme_id,
    d.projet_id,
    d.libelle,
    d.montant,
    d.date_depense,
    d.statut,
    d.reference,
    d.justificatif_url,
    d.created_at
  FROM public.programme_depenses d
  WHERE d.id = v_id;
END;
$$;

-- ============================================
-- FONCTION : update_programme_depense (avec projet_id)
-- ============================================

CREATE OR REPLACE FUNCTION public.update_programme_depense(
  p_id UUID,
  p_programme_id TEXT DEFAULT NULL,
  p_projet_id UUID DEFAULT NULL,
  p_libelle TEXT DEFAULT NULL,
  p_montant NUMERIC(15, 2) DEFAULT NULL,
  p_date_depense DATE DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_reference TEXT DEFAULT NULL,
  p_statut TEXT DEFAULT NULL,
  p_justificatif_url TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  programme_id TEXT,
  projet_id UUID,
  libelle TEXT,
  montant NUMERIC(15, 2),
  date_depense DATE,
  statut TEXT,
  reference TEXT,
  justificatif_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_depense RECORD;
BEGIN
  -- Récupérer la dépense existante
  SELECT * INTO v_depense
  FROM public.programme_depenses
  WHERE id = p_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Dépense non trouvée avec l''ID: %', p_id;
  END IF;
  
  -- Mettre à jour uniquement les champs fournis
  UPDATE public.programme_depenses
  SET
    programme_id = COALESCE(p_programme_id, v_depense.programme_id),
    projet_id = COALESCE(p_projet_id, v_depense.projet_id),
    libelle = COALESCE(p_libelle, v_depense.libelle),
    montant = COALESCE(p_montant, v_depense.montant),
    date_depense = COALESCE(p_date_depense, v_depense.date_depense),
    description = COALESCE(p_description, v_depense.description),
    reference = COALESCE(p_reference, v_depense.reference),
    statut = COALESCE(p_statut, v_depense.statut),
    justificatif_url = COALESCE(p_justificatif_url, v_depense.justificatif_url),
    updated_at = NOW()
  WHERE id = p_id;
  
  -- Retourner les données mises à jour
  RETURN QUERY
  SELECT 
    d.id,
    d.programme_id,
    d.projet_id,
    d.libelle,
    d.montant,
    d.date_depense,
    d.statut,
    d.reference,
    d.justificatif_url,
    d.updated_at
  FROM public.programme_depenses d
  WHERE d.id = p_id;
END;
$$;

-- ============================================
-- FONCTION : delete_programme_depense
-- ============================================

CREATE OR REPLACE FUNCTION public.delete_programme_depense(
  p_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_programme_id TEXT;
BEGIN
  -- Récupérer le programme_id avant suppression
  SELECT programme_id INTO v_programme_id
  FROM public.programme_depenses
  WHERE id = p_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Dépense non trouvée avec l''ID: %', p_id;
  END IF;
  
  -- Supprimer la dépense
  DELETE FROM public.programme_depenses
  WHERE id = p_id;
  
  -- Retourner l'ID supprimé
  RETURN p_id;
END;
$$;

-- ============================================
-- FONCTION : insert_programme_depense (sans projet_id, pour compatibilité)
-- ============================================

-- Si la fonction n'existe pas déjà, la créer
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'insert_programme_depense'
  ) THEN
    CREATE OR REPLACE FUNCTION public.insert_programme_depense(
      p_programme_id TEXT,
      p_libelle TEXT,
      p_montant NUMERIC(15, 2),
      p_date_depense DATE,
      p_description TEXT DEFAULT NULL,
      p_reference TEXT DEFAULT NULL,
      p_statut TEXT DEFAULT 'BROUILLON',
      p_justificatif_url TEXT DEFAULT NULL,
      p_created_by UUID DEFAULT NULL
    )
    RETURNS TABLE (
      id UUID,
      programme_id TEXT,
      libelle TEXT,
      montant NUMERIC(15, 2),
      date_depense DATE,
      statut TEXT,
      reference TEXT,
      justificatif_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE
    )
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      v_id UUID;
      v_user_id UUID;
    BEGIN
      -- Récupérer l'utilisateur actuel si non fourni
      v_user_id := COALESCE(p_created_by, auth.uid());
      
      -- Insérer la dépense
      INSERT INTO public.programme_depenses (
        programme_id,
        libelle,
        montant,
        date_depense,
        description,
        reference,
        statut,
        justificatif_url,
        created_by
      ) VALUES (
        p_programme_id,
        p_libelle,
        p_montant,
        p_date_depense,
        p_description,
        p_reference,
        p_statut,
        p_justificatif_url,
        v_user_id
      )
      RETURNING programme_depenses.id INTO v_id;
      
      -- Retourner les données créées
      RETURN QUERY
      SELECT 
        d.id,
        d.programme_id,
        d.libelle,
        d.montant,
        d.date_depense,
        d.statut,
        d.reference,
        d.justificatif_url,
        d.created_at
      FROM public.programme_depenses d
      WHERE d.id = v_id;
    END;
    $$;
  END IF;
END $$;

-- Commentaires
COMMENT ON FUNCTION public.create_programme_depense IS 'Créer une dépense programme avec support projet_id optionnel';
COMMENT ON FUNCTION public.update_programme_depense IS 'Mettre à jour une dépense programme avec support projet_id';
COMMENT ON FUNCTION public.delete_programme_depense IS 'Supprimer une dépense programme';

