-- Migration 003 : Système de gestion du temps
-- Saisie temps, planning, absences, feuilles de temps

-- Table de saisie de temps
CREATE TABLE IF NOT EXISTS public.temps_travail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  intervenant_id TEXT, -- Lien vers intervenants si existe
  projet_id UUID REFERENCES public.projets(id),
  programme_id TEXT REFERENCES public.programmes(id),
  beneficiaire_id TEXT REFERENCES public.beneficiaires(id),
  activite TEXT NOT NULL, -- Type d'activité (mentorat, formation, etc.)
  date_travail DATE NOT NULL,
  heures DECIMAL(4,2) NOT NULL CHECK (heures > 0 AND heures <= 24), -- Heures travaillées (max 24h/jour)
  description TEXT,
  taux_horaire NUMERIC DEFAULT 0, -- Taux horaire pour calcul coût
  cout_total NUMERIC GENERATED ALWAYS AS (heures * COALESCE(taux_horaire, 0)) STORED,
  statut TEXT DEFAULT 'SAISI' CHECK (statut IN ('SAISI', 'VALIDE', 'REFUSE', 'PAYE')),
  
  valide_par UUID REFERENCES auth.users(id),
  date_validation TIMESTAMP WITH TIME ZONE,
  commentaire_validation TEXT,
  
  feuille_temps_id UUID, -- Lien vers feuille de temps si regroupé
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de planning des interventions
CREATE TABLE IF NOT EXISTS public.planning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  projet_id UUID REFERENCES public.projets(id),
  programme_id TEXT REFERENCES public.programmes(id),
  beneficiaire_id TEXT REFERENCES public.beneficiaires(id),
  
  type_intervention TEXT NOT NULL, -- 'MENTORAT', 'FORMATION', 'ACCOMPAGNEMENT', etc.
  date_prevue DATE NOT NULL,
  heure_debut TIME,
  heure_fin TIME,
  duree_prevue DECIMAL(4,2), -- Heures prévues
  
  lieu TEXT,
  modalite TEXT CHECK (modalite IN ('PRESENTIEL', 'VISIO', 'TELEPHONE', 'AUTRE')),
  statut TEXT DEFAULT 'PLANIFIE' CHECK (statut IN ('PLANIFIE', 'CONFIRME', 'REALISE', 'ANNULE', 'REPORTE')),
  
  date_reelle DATE, -- Si reporté
  heures_reelles DECIMAL(4,2), -- Si différent de prévu
  temps_travail_id UUID REFERENCES public.temps_travail(id), -- Lien vers saisie temps si réalisé
  
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des absences
CREATE TABLE IF NOT EXISTS public.absences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type_absence TEXT NOT NULL CHECK (type_absence IN ('CONGE', 'MALADIE', 'FORMATION', 'CONGES_EXCEPTIONNELS', 'AUTRE')),
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  nombre_jours INTEGER GENERATED ALWAYS AS (date_fin - date_debut + 1) STORED,
  statut TEXT DEFAULT 'DEMANDE' CHECK (statut IN ('DEMANDE', 'APPROUVE', 'REFUSE', 'ANNULE')),
  
  motif TEXT,
  justificatif_url TEXT,
  
  approuve_par UUID REFERENCES auth.users(id),
  date_approbation TIMESTAMP WITH TIME ZONE,
  commentaire TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte : date_fin >= date_debut
  CHECK (date_fin >= date_debut)
);

-- Table des feuilles de temps (regroupement mensuel)
CREATE TABLE IF NOT EXISTS public.feuilles_temps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  periode_mois INTEGER NOT NULL CHECK (periode_mois >= 1 AND periode_mois <= 12),
  periode_annee INTEGER NOT NULL CHECK (periode_annee >= 2000),
  
  total_heures DECIMAL(6,2) DEFAULT 0, -- Total heures travaillées
  heures_validees DECIMAL(6,2) DEFAULT 0,
  cout_total NUMERIC DEFAULT 0,
  
  statut TEXT DEFAULT 'BROUILLON' CHECK (statut IN ('BROUILLON', 'SOUMISE', 'VALIDE', 'REFUSE', 'PAYE')),
  
  soumise_le TIMESTAMP WITH TIME ZONE,
  validee_par UUID REFERENCES auth.users(id),
  validee_le TIMESTAMP WITH TIME ZONE,
  commentaire_validation TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte unique : une seule feuille de temps par utilisateur/mois/année
  UNIQUE(user_id, periode_mois, periode_annee)
);

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_temps_travail_user ON public.temps_travail(user_id, date_travail);
CREATE INDEX IF NOT EXISTS idx_temps_travail_projet ON public.temps_travail(projet_id);
CREATE INDEX IF NOT EXISTS idx_temps_travail_statut ON public.temps_travail(statut);

CREATE INDEX IF NOT EXISTS idx_planning_user ON public.planning(user_id, date_prevue);
CREATE INDEX IF NOT EXISTS idx_planning_statut ON public.planning(statut);
CREATE INDEX IF NOT EXISTS idx_planning_dates ON public.planning(date_prevue, date_reelle);

CREATE INDEX IF NOT EXISTS idx_absences_user ON public.absences(user_id, date_debut);
CREATE INDEX IF NOT EXISTS idx_absences_dates ON public.absences(date_debut, date_fin);

CREATE INDEX IF NOT EXISTS idx_feuilles_temps_user ON public.feuilles_temps(user_id, periode_annee, periode_mois);
CREATE INDEX IF NOT EXISTS idx_feuilles_temps_statut ON public.feuilles_temps(statut);

-- Fonction pour mettre à jour le total de la feuille de temps
CREATE OR REPLACE FUNCTION public.update_feuille_temps_total()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.feuilles_temps
    SET total_heures = (
        SELECT COALESCE(SUM(heures), 0)
        FROM public.temps_travail
        WHERE feuille_temps_id = NEW.feuille_temps_id
      ),
      cout_total = (
        SELECT COALESCE(SUM(cout_total), 0)
        FROM public.temps_travail
        WHERE feuille_temps_id = NEW.feuille_temps_id
      ),
      updated_at = NOW()
    WHERE id = NEW.feuille_temps_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feuilles_temps
    SET total_heures = (
        SELECT COALESCE(SUM(heures), 0)
        FROM public.temps_travail
        WHERE feuille_temps_id = OLD.feuille_temps_id
      ),
      cout_total = (
        SELECT COALESCE(SUM(cout_total), 0)
        FROM public.temps_travail
        WHERE feuille_temps_id = OLD.feuille_temps_id
      ),
      updated_at = NOW()
    WHERE id = OLD.feuille_temps_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour la feuille de temps
CREATE TRIGGER trigger_update_feuille_temps
  AFTER INSERT OR UPDATE OR DELETE ON public.temps_travail
  FOR EACH ROW
  WHEN (NEW.feuille_temps_id IS NOT NULL OR OLD.feuille_temps_id IS NOT NULL)
  EXECUTE FUNCTION public.update_feuille_temps_total();

-- Activer RLS
ALTER TABLE public.temps_travail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feuilles_temps ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour temps_travail
-- Les utilisateurs peuvent voir/modifier leur propre temps
CREATE POLICY "Temps travail propre"
  ON public.temps_travail FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Les admins peuvent tout voir
CREATE POLICY "Temps travail admin"
  ON public.temps_travail FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('ADMIN_ORGANISME', 'CHEF_PROJET')
    )
  );

-- Politiques RLS pour planning
CREATE POLICY "Planning propre"
  ON public.planning FOR ALL
  USING (auth.uid() = user_id OR auth.role() = 'authenticated')
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'authenticated');

-- Politiques RLS pour absences
CREATE POLICY "Absences propre"
  ON public.absences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Absences admin"
  ON public.absences FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('ADMIN_ORGANISME', 'CHEF_PROJET')
    )
  );

-- Politiques RLS pour feuilles_temps
CREATE POLICY "Feuilles temps propre"
  ON public.feuilles_temps FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Feuilles temps admin"
  ON public.feuilles_temps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('ADMIN_ORGANISME', 'CHEF_PROJET')
    )
  );

-- Commentaires
COMMENT ON TABLE public.temps_travail IS 'Saisie de temps travaillé par intervenant';
COMMENT ON TABLE public.planning IS 'Planning des interventions prévues';
COMMENT ON TABLE public.absences IS 'Gestion des absences (congés, maladie, etc.)';
COMMENT ON TABLE public.feuilles_temps IS 'Feuilles de temps mensuelles regroupées';

