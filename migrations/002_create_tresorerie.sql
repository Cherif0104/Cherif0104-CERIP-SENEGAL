-- Migration 002 : Système de trésorerie complet
-- Gestion des comptes bancaires, flux de trésorerie, prévisions

-- Table des comptes bancaires
CREATE TABLE IF NOT EXISTS public.comptes_bancaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  numero_compte TEXT,
  banque TEXT NOT NULL,
  type_compte TEXT NOT NULL CHECK (type_compte IN ('COURANT', 'EPARGNE', 'CAISSE', 'AUTRE')),
  devise TEXT DEFAULT 'XOF',
  solde_initial NUMERIC DEFAULT 0,
  solde_actuel NUMERIC DEFAULT 0, -- Calculé automatiquement
  actif BOOLEAN DEFAULT true,
  responsable_id UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des flux de trésorerie (encaissements/décaissements)
CREATE TABLE IF NOT EXISTS public.flux_tresorerie (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compte_bancaire_id UUID REFERENCES public.comptes_bancaires(id),
  type_flux TEXT NOT NULL CHECK (type_flux IN ('ENCAISSEMENT', 'DECAISSEMENT')),
  categorie TEXT NOT NULL, -- 'FINANCEMENT', 'DEPENSE', 'FRAIS', 'AUTRE'
  libelle TEXT NOT NULL,
  montant NUMERIC NOT NULL,
  devise TEXT DEFAULT 'XOF',
  date_operation DATE NOT NULL,
  date_valeur DATE, -- Date valeur bancaire
  reference TEXT, -- Référence paiement/facture
  moyen_paiement TEXT, -- 'VIREMENT', 'CHEQUE', 'ESPECES', 'CARTE', etc.
  
  -- Liens vers autres entités
  programme_id TEXT REFERENCES public.programmes(id),
  projet_id UUID REFERENCES public.projets(id),
  depense_id UUID, -- Lien vers depenses ou programme_depenses
  financement_id UUID, -- Lien vers financements
  
  statut TEXT DEFAULT 'PREVU' CHECK (statut IN ('PREVU', 'EN_COURS', 'REALISE', 'ANNULE')),
  justificatif_url TEXT,
  notes TEXT,
  
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des prévisions de trésorerie
CREATE TABLE IF NOT EXISTS public.previsions_tresorerie (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compte_bancaire_id UUID REFERENCES public.comptes_bancaires(id),
  type_flux TEXT NOT NULL CHECK (type_flux IN ('ENCAISSEMENT', 'DECAISSEMENT')),
  libelle TEXT NOT NULL,
  montant NUMERIC NOT NULL,
  devise TEXT DEFAULT 'XOF',
  date_prevue DATE NOT NULL,
  periodicite TEXT, -- 'UNIQUE', 'MENSUEL', 'TRIMESTRIEL', 'ANNUEL'
  date_fin_periode DATE, -- Pour prévisions récurrentes
  
  -- Liens
  programme_id TEXT REFERENCES public.programmes(id),
  projet_id UUID REFERENCES public.projets(id),
  
  statut TEXT DEFAULT 'PREVU' CHECK (statut IN ('PREVU', 'REALISE', 'ANNULE', 'REPORTE')),
  realise_id UUID REFERENCES public.flux_tresorerie(id), -- Lien vers flux réalisé
  
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_flux_tresorerie_compte ON public.flux_tresorerie(compte_bancaire_id);
CREATE INDEX IF NOT EXISTS idx_flux_tresorerie_date ON public.flux_tresorerie(date_operation);
CREATE INDEX IF NOT EXISTS idx_flux_tresorerie_type ON public.flux_tresorerie(type_flux, statut);
CREATE INDEX IF NOT EXISTS idx_flux_tresorerie_programme ON public.flux_tresorerie(programme_id);
CREATE INDEX IF NOT EXISTS idx_flux_tresorerie_projet ON public.flux_tresorerie(projet_id);

CREATE INDEX IF NOT EXISTS idx_previsions_compte ON public.previsions_tresorerie(compte_bancaire_id);
CREATE INDEX IF NOT EXISTS idx_previsions_date ON public.previsions_tresorerie(date_prevue);

-- Fonction pour mettre à jour le solde du compte
CREATE OR REPLACE FUNCTION public.update_solde_compte()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.type_flux = 'ENCAISSEMENT' AND NEW.statut = 'REALISE' THEN
      UPDATE public.comptes_bancaires
      SET solde_actuel = solde_actuel + NEW.montant,
          updated_at = NOW()
      WHERE id = NEW.compte_bancaire_id;
    ELSIF NEW.type_flux = 'DECAISSEMENT' AND NEW.statut = 'REALISE' THEN
      UPDATE public.comptes_bancaires
      SET solde_actuel = solde_actuel - NEW.montant,
          updated_at = NOW()
      WHERE id = NEW.compte_bancaire_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Gérer le changement de statut ou de montant
    IF OLD.statut != NEW.statut OR OLD.montant != NEW.montant THEN
      -- Annuler l'ancien impact
      IF OLD.type_flux = 'ENCAISSEMENT' AND OLD.statut = 'REALISE' THEN
        UPDATE public.comptes_bancaires
        SET solde_actuel = solde_actuel - OLD.montant
        WHERE id = OLD.compte_bancaire_id;
      ELSIF OLD.type_flux = 'DECAISSEMENT' AND OLD.statut = 'REALISE' THEN
        UPDATE public.comptes_bancaires
        SET solde_actuel = solde_actuel + OLD.montant
        WHERE id = OLD.compte_bancaire_id;
      END IF;
      
      -- Appliquer le nouvel impact
      IF NEW.type_flux = 'ENCAISSEMENT' AND NEW.statut = 'REALISE' THEN
        UPDATE public.comptes_bancaires
        SET solde_actuel = solde_actuel + NEW.montant
        WHERE id = NEW.compte_bancaire_id;
      ELSIF NEW.type_flux = 'DECAISSEMENT' AND NEW.statut = 'REALISE' THEN
        UPDATE public.comptes_bancaires
        SET solde_actuel = solde_actuel - NEW.montant
        WHERE id = NEW.compte_bancaire_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement le solde
CREATE TRIGGER trigger_update_solde_compte
  AFTER INSERT OR UPDATE ON public.flux_tresorerie
  FOR EACH ROW
  EXECUTE FUNCTION public.update_solde_compte();

-- Activer RLS
ALTER TABLE public.comptes_bancaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flux_tresorerie ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.previsions_tresorerie ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour comptes_bancaires
CREATE POLICY "Comptes bancaires lecture"
  ON public.comptes_bancaires FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Comptes bancaires écriture"
  ON public.comptes_bancaires FOR ALL
  USING (auth.role() = 'authenticated');

-- Politiques RLS pour flux_tresorerie
CREATE POLICY "Flux trésorerie lecture"
  ON public.flux_tresorerie FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Flux trésorerie écriture"
  ON public.flux_tresorerie FOR ALL
  USING (auth.role() = 'authenticated');

-- Politiques RLS pour previsions_tresorerie
CREATE POLICY "Prévisions trésorerie lecture"
  ON public.previsions_tresorerie FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Prévisions trésorerie écriture"
  ON public.previsions_tresorerie FOR ALL
  USING (auth.role() = 'authenticated');

-- Commentaires
COMMENT ON TABLE public.comptes_bancaires IS 'Comptes bancaires et caisse - Gestion multi-comptes';
COMMENT ON TABLE public.flux_tresorerie IS 'Flux de trésorerie (encaissements/décaissements)';
COMMENT ON TABLE public.previsions_tresorerie IS 'Prévisions de trésorerie pour planification';

