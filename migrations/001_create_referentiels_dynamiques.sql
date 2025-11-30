-- Migration 001 : Amélioration système référentiels dynamiques
-- Adaptation de la table referentiels existante pour système d'auto-apprentissage

-- Créer la table valeurs_referentiels si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.valeurs_referentiels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referentiel_code TEXT NOT NULL, -- Code du référentiel (ex: 'types_programmes')
  valeur TEXT NOT NULL,
  code TEXT, -- Code unique optionnel
  description TEXT,
  ordre INTEGER DEFAULT 0,
  actif BOOLEAN DEFAULT true,
  parent_id UUID REFERENCES public.valeurs_referentiels(id) ON DELETE SET NULL, -- Pour hiérarchie
  usage_count INTEGER DEFAULT 0, -- Nombre d'utilisations (apprentissage)
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte unique : même valeur ne peut pas exister deux fois dans un référentiel
  UNIQUE(referentiel_code, valeur)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_valeurs_referentiels_code ON public.valeurs_referentiels(referentiel_code);
CREATE INDEX IF NOT EXISTS idx_valeurs_referentiels_actif ON public.valeurs_referentiels(referentiel_code, actif) WHERE actif = true;
CREATE INDEX IF NOT EXISTS idx_valeurs_referentiels_usage ON public.valeurs_referentiels(referentiel_code, usage_count DESC);

-- Fonction pour incrémenter usage_count
CREATE OR REPLACE FUNCTION public.increment_referentiel_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Incrémenter usage_count quand une valeur est utilisée
  -- Cette fonction sera appelée depuis les triggers sur les tables qui utilisent les référentiels
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Activer RLS
ALTER TABLE public.valeurs_referentiels ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour valeurs_referentiels
-- Lecture : tous les utilisateurs authentifiés
CREATE POLICY "Valeurs référentiels lecture"
  ON public.valeurs_referentiels FOR SELECT
  USING (auth.role() = 'authenticated');

-- Écriture : tous les utilisateurs authentifiés (pour permettre création dynamique)
CREATE POLICY "Valeurs référentiels écriture"
  ON public.valeurs_referentiels FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Valeurs référentiels modification"
  ON public.valeurs_referentiels FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Commentaires
COMMENT ON TABLE public.valeurs_referentiels IS 'Valeurs dynamiques des référentiels - Système d''auto-apprentissage';
COMMENT ON COLUMN public.valeurs_referentiels.usage_count IS 'Nombre d''utilisations - pour suggestions intelligentes';
COMMENT ON COLUMN public.valeurs_referentiels.referentiel_code IS 'Code du référentiel (ex: types_programmes, statuts_projet)';

