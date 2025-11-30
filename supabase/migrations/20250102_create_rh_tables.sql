-- Migration : Création des tables pour le module Ressources Humaines
-- Date : 2025-01-02

-- Table : postes
CREATE TABLE IF NOT EXISTS public.postes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  titre TEXT NOT NULL,
  description TEXT,
  departement TEXT,
  type_contrat TEXT, -- CDI, CDD, Stage, Consultance, etc.
  salaire_min NUMERIC,
  salaire_max NUMERIC,
  niveau_requis TEXT, -- Junior, Intermédiaire, Senior, Expert
  competences_requises JSONB DEFAULT '[]'::jsonb,
  statut TEXT DEFAULT 'OUVERT', -- OUVERT, FERME, SUSPENDU
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table : competences
CREATE TABLE IF NOT EXISTS public.competences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  categorie TEXT, -- Technique, Management, Communication, etc.
  description TEXT,
  niveau_max INTEGER DEFAULT 5, -- Niveau maximum (1-5)
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table : employes
CREATE TABLE IF NOT EXISTS public.employes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) UNIQUE,
  matricule TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT,
  telephone TEXT,
  date_naissance DATE,
  date_embauche DATE,
  date_fin_contrat DATE,
  poste_id UUID REFERENCES public.postes(id),
  salaire NUMERIC,
  type_contrat TEXT NOT NULL, -- CDI, CDD, STAGE, PRESTATION, PROJET, PROGRAMME
  type_employe TEXT, -- PROFESSEUR, FORMATEUR, CHARGE_PROJET, DIRECTEUR, COORDINATEUR, etc.
  statut TEXT DEFAULT 'ACTIF', -- ACTIF, INACTIF, CONGE, DEMISSION
  manager_id UUID REFERENCES public.employes(id),
  -- Lien vers projet ou programme si contrat temporaire
  projet_id UUID REFERENCES public.projets(id),
  programme_id TEXT REFERENCES public.programmes(id),
  -- Indicateurs de type de contrat
  est_prestataire BOOLEAN DEFAULT false,
  est_lie_projet BOOLEAN DEFAULT false,
  est_lie_programme BOOLEAN DEFAULT false,
  adresse TEXT,
  ville TEXT,
  pays TEXT DEFAULT 'Sénégal',
  photo_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de liaison : employes_competences
CREATE TABLE IF NOT EXISTS public.employes_competences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employe_id UUID REFERENCES public.employes(id) ON DELETE CASCADE,
  competence_id UUID REFERENCES public.competences(id) ON DELETE CASCADE,
  niveau INTEGER DEFAULT 1 CHECK (niveau >= 1 AND niveau <= 5),
  date_evaluation DATE DEFAULT CURRENT_DATE,
  evalue_par UUID REFERENCES public.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employe_id, competence_id)
);

-- Table : evaluations
CREATE TABLE IF NOT EXISTS public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employe_id UUID REFERENCES public.employes(id) ON DELETE CASCADE,
  evaluateur_id UUID REFERENCES public.users(id),
  type_evaluation TEXT, -- Annuelle, Trimestrielle, Probatoire, etc.
  periode_debut DATE,
  periode_fin DATE,
  date_evaluation DATE DEFAULT CURRENT_DATE,
  notes_globale NUMERIC,
  commentaires TEXT,
  objectifs_atteints JSONB DEFAULT '[]'::jsonb,
  objectifs_futurs JSONB DEFAULT '[]'::jsonb,
  competences_evaluees JSONB DEFAULT '[]'::jsonb,
  statut TEXT DEFAULT 'BROUILLON', -- BROUILLON, VALIDE, ARCHIVE
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table : planning_rh
CREATE TABLE IF NOT EXISTS public.planning_rh (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employe_id UUID REFERENCES public.employes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL, -- PRESENCE, ABSENCE, CONGE, FORMATION, etc.
  heure_debut TIME,
  heure_fin TIME,
  duree_heures NUMERIC,
  description TEXT,
  projet_id UUID REFERENCES public.projets(id),
  programme_id TEXT REFERENCES public.programmes(id),
  statut TEXT DEFAULT 'PLANIFIE', -- PLANIFIE, VALIDE, REALISE, ANNULE
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_employes_user_id ON public.employes(user_id);
CREATE INDEX IF NOT EXISTS idx_employes_poste_id ON public.employes(poste_id);
CREATE INDEX IF NOT EXISTS idx_employes_manager_id ON public.employes(manager_id);
CREATE INDEX IF NOT EXISTS idx_employes_matricule ON public.employes(matricule);
CREATE INDEX IF NOT EXISTS idx_employes_statut ON public.employes(statut);
CREATE INDEX IF NOT EXISTS idx_employes_type_contrat ON public.employes(type_contrat);
CREATE INDEX IF NOT EXISTS idx_employes_type_employe ON public.employes(type_employe);
CREATE INDEX IF NOT EXISTS idx_employes_projet_id ON public.employes(projet_id);
CREATE INDEX IF NOT EXISTS idx_employes_programme_id ON public.employes(programme_id);
CREATE INDEX IF NOT EXISTS idx_employes_prestataire ON public.employes(est_prestataire);

CREATE INDEX IF NOT EXISTS idx_employes_competences_employe ON public.employes_competences(employe_id);
CREATE INDEX IF NOT EXISTS idx_employes_competences_competence ON public.employes_competences(competence_id);

CREATE INDEX IF NOT EXISTS idx_evaluations_employe ON public.evaluations(employe_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_date ON public.evaluations(date_evaluation);

CREATE INDEX IF NOT EXISTS idx_planning_rh_employe ON public.planning_rh(employe_id);
CREATE INDEX IF NOT EXISTS idx_planning_rh_date ON public.planning_rh(date);
CREATE INDEX IF NOT EXISTS idx_planning_rh_type ON public.planning_rh(type);

-- RLS (Row Level Security)
ALTER TABLE public.postes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employes_competences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning_rh ENABLE ROW LEVEL SECURITY;

-- Politiques RLS basiques (à adapter selon vos besoins)
-- Les admins peuvent tout faire
CREATE POLICY "Admins peuvent tout faire sur postes" ON public.postes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'ADMIN_ORGANISME'
    )
  );

CREATE POLICY "Admins peuvent tout faire sur competences" ON public.competences
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'ADMIN_ORGANISME'
    )
  );

CREATE POLICY "Admins peuvent tout faire sur employes" ON public.employes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'ADMIN_ORGANISME'
    )
  );

CREATE POLICY "Employes peuvent voir leur propre profil" ON public.employes
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'ADMIN_ORGANISME'
    )
  );

CREATE POLICY "Admins peuvent tout faire sur employes_competences" ON public.employes_competences
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'ADMIN_ORGANISME'
    )
  );

CREATE POLICY "Admins peuvent tout faire sur evaluations" ON public.evaluations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'ADMIN_ORGANISME'
    )
  );

CREATE POLICY "Admins peuvent tout faire sur planning_rh" ON public.planning_rh
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'ADMIN_ORGANISME'
    )
  );

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_postes_updated_at BEFORE UPDATE ON public.postes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competences_updated_at BEFORE UPDATE ON public.competences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employes_updated_at BEFORE UPDATE ON public.employes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employes_competences_updated_at BEFORE UPDATE ON public.employes_competences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON public.evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planning_rh_updated_at BEFORE UPDATE ON public.planning_rh
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

