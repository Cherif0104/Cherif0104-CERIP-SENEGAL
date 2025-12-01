-- Migration : Correction de la fonction update_programme_budget_consomme
-- Date : 2025-01-04
-- Description : Marquer la fonction comme VOLATILE pour autoriser les opérations SET

CREATE OR REPLACE FUNCTION public.update_programme_budget_consomme()
RETURNS TRIGGER 
LANGUAGE plpgsql
VOLATILE
AS $$
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
$$;

