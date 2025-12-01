-- Migration : Extensions pour module Projets
-- Date : 2025-01-05
-- Description : Tables et fonctions pour gestion complète des projets

-- ============================================
-- 1. AJOUTER projet_id À programme_depenses
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'programme_depenses' 
    AND column_name = 'projet_id'
  ) THEN
    ALTER TABLE public.programme_depenses 
    ADD COLUMN projet_id UUID REFERENCES public.projets(id) ON DELETE SET NULL;
    
    CREATE INDEX idx_programme_depenses_projet_id 
    ON public.programme_depenses(projet_id);
    
    COMMENT ON COLUMN public.programme_depenses.projet_id IS 
    'ID du projet associé (optionnel). Les dépenses projet sont comptabilisées dans le budget programme.';
  END IF;
END $$;

-- ============================================
-- 2. TABLE LIMITES DÉPENSES PAR PÉRIODE
-- ============================================

CREATE TABLE IF NOT EXISTS public.projet_limites_depenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projet_id UUID NOT NULL REFERENCES public.projets(id) ON DELETE CASCADE,
  programme_id TEXT NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
  periode_type TEXT NOT NULL CHECK (periode_type IN ('MENSUEL', 'TRIMESTRIEL', 'ANNUEL')),
  montant_max NUMERIC(15, 2) NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE,
  herite_du_programme BOOLEAN DEFAULT true,
  ajustement NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projet_limites_projet ON public.projet_limites_depenses(projet_id);
CREATE INDEX IF NOT EXISTS idx_projet_limites_programme ON public.projet_limites_depenses(programme_id);

COMMENT ON TABLE public.projet_limites_depenses IS 'Limites de dépenses par période pour les projets (héritées du programme ou ajustées)';

-- ============================================
-- 3. TABLE DEMANDES DE RALLONGE DE BUDGET
-- ============================================

CREATE TABLE IF NOT EXISTS public.projet_rallonges_budget (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projet_id UUID NOT NULL REFERENCES public.projets(id) ON DELETE CASCADE,
  programme_id TEXT NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
  montant_demande NUMERIC(15, 2) NOT NULL,
  motif TEXT NOT NULL,
  justificatif_url TEXT,
  statut TEXT DEFAULT 'EN_ATTENTE' CHECK (statut IN ('EN_ATTENTE', 'APPROUVEE', 'REFUSEE', 'ANNULEE')),
  approuve_par UUID REFERENCES auth.users(id),
  approuve_le TIMESTAMP WITH TIME ZONE,
  commentaire_approbation TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rallonges_projet ON public.projet_rallonges_budget(projet_id);
CREATE INDEX IF NOT EXISTS idx_rallonges_programme ON public.projet_rallonges_budget(programme_id);
CREATE INDEX IF NOT EXISTS idx_rallonges_statut ON public.projet_rallonges_budget(statut);

COMMENT ON TABLE public.projet_rallonges_budget IS 'Demandes de rallonge de budget pour les projets';

-- ============================================
-- 4. TABLE CRITÈRES D'ÉLIGIBILITÉ
-- ============================================

CREATE TABLE IF NOT EXISTS public.projet_criteres_eligibilite (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projet_id UUID NOT NULL REFERENCES public.projets(id) ON DELETE CASCADE,
  critere_nom TEXT NOT NULL,
  critere_type TEXT NOT NULL CHECK (critere_type IN (
    'AGE', 'GENRE', 'SITUATION', 'COMPETENCE', 'DIPLOME', 
    'EXPERIENCE', 'LOCALISATION', 'AUTRE'
  )),
  critere_config JSONB NOT NULL,
  poids INTEGER DEFAULT 1 CHECK (poids >= 1 AND poids <= 10),
  obligatoire BOOLEAN DEFAULT false,
  actif BOOLEAN DEFAULT true,
  ordre INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_criteres_projet ON public.projet_criteres_eligibilite(projet_id);
CREATE INDEX IF NOT EXISTS idx_criteres_actif ON public.projet_criteres_eligibilite(actif);

COMMENT ON TABLE public.projet_criteres_eligibilite IS 'Critères d''éligibilité configurables pour les projets';

-- ============================================
-- 5. TABLE ÉVALUATIONS CANDIDATS (SCORING)
-- ============================================

CREATE TABLE IF NOT EXISTS public.candidat_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidat_id UUID NOT NULL REFERENCES public.candidats(id) ON DELETE CASCADE,
  projet_id UUID NOT NULL REFERENCES public.projets(id) ON DELETE CASCADE,
  appel_id UUID REFERENCES public.appels_candidatures(id),
  score_total NUMERIC(5, 2) DEFAULT 0,
  scores_detail JSONB DEFAULT '{}'::jsonb,
  statut_eligibilite TEXT CHECK (statut_eligibilite IN ('ELIGIBLE', 'NON_ELIGIBLE', 'EN_ATTENTE')),
  notes TEXT,
  evalue_par UUID REFERENCES auth.users(id),
  evalue_le TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evaluations_candidat ON public.candidat_evaluations(candidat_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_projet ON public.candidat_evaluations(projet_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_appel ON public.candidat_evaluations(appel_id);

COMMENT ON TABLE public.candidat_evaluations IS 'Évaluations et scoring des candidats selon critères d''éligibilité';

-- ============================================
-- 6. TABLE RESSOURCES (SALLES, MATÉRIEL, ETC.)
-- ============================================

CREATE TABLE IF NOT EXISTS public.ressources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_ressource TEXT NOT NULL CHECK (type_ressource IN (
    'SALLE_INTERNE', 'SALLE_EXTERNE', 
    'MATERIEL_SONORE', 'MATERIEL_VIDEO', 'MATERIEL_INFORMATIQUE', 'MATERIEL_AUTRE',
    'TRANSPORT', 'RESTAURATION', 'AUTRE'
  )),
  nom TEXT NOT NULL,
  description TEXT,
  capacite INTEGER,
  localisation TEXT,
  proprietaire TEXT,
  cout_unitaire NUMERIC(15, 2),
  disponibilite JSONB DEFAULT '{}'::jsonb,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ressources_type ON public.ressources(type_ressource);
CREATE INDEX IF NOT EXISTS idx_ressources_actif ON public.ressources(actif);

COMMENT ON TABLE public.ressources IS 'Ressources disponibles (salles internes/externes, matériel, transport, restauration)';

-- ============================================
-- 7. TABLE RÉSERVATIONS DE RESSOURCES
-- ============================================

CREATE TABLE IF NOT EXISTS public.ressources_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activite_id UUID, -- Sera référencé après création table projet_activites
  ressource_id UUID NOT NULL REFERENCES public.ressources(id) ON DELETE CASCADE,
  projet_id UUID NOT NULL REFERENCES public.projets(id) ON DELETE CASCADE,
  date_debut TIMESTAMP WITH TIME ZONE NOT NULL,
  date_fin TIMESTAMP WITH TIME ZONE NOT NULL,
  quantite INTEGER DEFAULT 1,
  cout_total NUMERIC(15, 2),
  statut TEXT DEFAULT 'RESERVE' CHECK (statut IN ('RESERVE', 'CONFIRME', 'ANNULE', 'TERMINE')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (date_fin > date_debut)
);

CREATE INDEX IF NOT EXISTS idx_reservations_activite ON public.ressources_reservations(activite_id);
CREATE INDEX IF NOT EXISTS idx_reservations_ressource ON public.ressources_reservations(ressource_id);
CREATE INDEX IF NOT EXISTS idx_reservations_projet ON public.ressources_reservations(projet_id);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON public.ressources_reservations(date_debut, date_fin);

COMMENT ON TABLE public.ressources_reservations IS 'Réservations de ressources pour les activités projet';

-- ============================================
-- 8. TABLE ACTIVITÉS PROJET
-- ============================================

CREATE TABLE IF NOT EXISTS public.projet_activites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projet_id UUID NOT NULL REFERENCES public.projets(id) ON DELETE CASCADE,
  type_activite TEXT NOT NULL CHECK (type_activite IN (
    'FORMATION', 'ATELIER', 'REUNION', 'ENTRETIEN_INDIVIDUEL', 
    'ENTRETIEN_COLLECTIF', 'EVENEMENT', 'AUTRE'
  )),
  titre TEXT NOT NULL,
  description TEXT,
  date_activite DATE NOT NULL,
  heure_debut TIME,
  heure_fin TIME,
  duree_heures NUMERIC(4, 2),
  intervenant_id UUID REFERENCES auth.users(id),
  beneficiaires_ids TEXT[],
  statut TEXT DEFAULT 'PLANIFIE' CHECK (statut IN ('PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE')),
  cout_total NUMERIC(15, 2) DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activites_projet ON public.projet_activites(projet_id);
CREATE INDEX IF NOT EXISTS idx_activites_date ON public.projet_activites(date_activite);
CREATE INDEX IF NOT EXISTS idx_activites_statut ON public.projet_activites(statut);

COMMENT ON TABLE public.projet_activites IS 'Activités et interventions des projets';

-- Ajouter contrainte FK pour activite_id dans ressources_reservations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'ressources_reservations_activite_id_fkey'
  ) THEN
    ALTER TABLE public.ressources_reservations
    ADD CONSTRAINT ressources_reservations_activite_id_fkey
    FOREIGN KEY (activite_id) REFERENCES public.projet_activites(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================
-- 9. TABLE PRÉSENCE/ASSIDUITÉ
-- ============================================

CREATE TABLE IF NOT EXISTS public.activite_presences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activite_id UUID NOT NULL REFERENCES public.projet_activites(id) ON DELETE CASCADE,
  beneficiaire_id TEXT NOT NULL REFERENCES public.beneficiaires(id) ON DELETE CASCADE,
  present BOOLEAN NOT NULL,
  heure_arrivee TIME,
  heure_depart TIME,
  retard_minutes INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(activite_id, beneficiaire_id)
);

CREATE INDEX IF NOT EXISTS idx_presences_activite ON public.activite_presences(activite_id);
CREATE INDEX IF NOT EXISTS idx_presences_beneficiaire ON public.activite_presences(beneficiaire_id);

COMMENT ON TABLE public.activite_presences IS 'Présences et absences des bénéficiaires aux activités';

-- ============================================
-- 10. TABLE SCORES D'ASSIDUITÉ
-- ============================================

CREATE TABLE IF NOT EXISTS public.beneficiaire_assiduite (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiaire_id TEXT NOT NULL REFERENCES public.beneficiaires(id) ON DELETE CASCADE,
  projet_id UUID NOT NULL REFERENCES public.projets(id) ON DELETE CASCADE,
  periode_debut DATE NOT NULL,
  periode_fin DATE NOT NULL,
  activites_total INTEGER DEFAULT 0,
  activites_presentes INTEGER DEFAULT 0,
  activites_absentes INTEGER DEFAULT 0,
  activites_retard INTEGER DEFAULT 0,
  score_assiduite NUMERIC(5, 2) DEFAULT 0,
  seuil_alerte NUMERIC(5, 2) DEFAULT 80,
  statut TEXT DEFAULT 'NORMAL' CHECK (statut IN ('NORMAL', 'ALERTE', 'CRITIQUE')),
  notes TEXT,
  calcule_le TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assiduite_beneficiaire ON public.beneficiaire_assiduite(beneficiaire_id);
CREATE INDEX IF NOT EXISTS idx_assiduite_projet ON public.beneficiaire_assiduite(projet_id);
CREATE INDEX IF NOT EXISTS idx_assiduite_periode ON public.beneficiaire_assiduite(periode_debut, periode_fin);

COMMENT ON TABLE public.beneficiaire_assiduite IS 'Scores d''assiduité des bénéficiaires par projet et période';

-- ============================================
-- 11. TABLE DÉPENDANCES JALONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.jalon_dependances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jalon_id UUID NOT NULL REFERENCES public.programme_jalons(id) ON DELETE CASCADE,
  jalon_dependance_id UUID NOT NULL REFERENCES public.programme_jalons(id) ON DELETE CASCADE,
  type_dependance TEXT DEFAULT 'FIN_TO_START' CHECK (type_dependance IN (
    'FIN_TO_START', 'START_TO_START', 'FIN_TO_FIN'
  )),
  delai_jours INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (jalon_id != jalon_dependance_id)
);

CREATE INDEX IF NOT EXISTS idx_dependances_jalon ON public.jalon_dependances(jalon_id);
CREATE INDEX IF NOT EXISTS idx_dependances_dependance ON public.jalon_dependances(jalon_dependance_id);

COMMENT ON TABLE public.jalon_dependances IS 'Dépendances entre jalons (pour calcul automatique des dates)';

-- ============================================
-- 12. TABLE JALONS RÉCURRENTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.jalon_recurrence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jalon_id UUID NOT NULL REFERENCES public.programme_jalons(id) ON DELETE CASCADE,
  type_recurrence TEXT NOT NULL CHECK (type_recurrence IN (
    'QUOTIDIEN', 'HEBDOMADAIRE', 'MENSUEL', 'TRIMESTRIEL', 'SEMESTRIEL', 'ANNUEL'
  )),
  intervalle INTEGER DEFAULT 1 CHECK (intervalle > 0),
  date_fin_recurrence DATE,
  occurrences_max INTEGER CHECK (occurrences_max > 0),
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recurrence_jalon ON public.jalon_recurrence(jalon_id);
CREATE INDEX IF NOT EXISTS idx_recurrence_actif ON public.jalon_recurrence(actif);

COMMENT ON TABLE public.jalon_recurrence IS 'Configuration de jalons récurrents automatiques';

-- ============================================
-- 13. TABLE RAPPORTS PROJET
-- ============================================

CREATE TABLE IF NOT EXISTS public.projet_rapports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projet_id UUID NOT NULL REFERENCES public.projets(id) ON DELETE CASCADE,
  type_rapport TEXT NOT NULL CHECK (type_rapport IN (
    'COMPLET', 'FINANCIER', 'BENEFICIAIRES', 'ACTIVITES', 
    'JALONS', 'RISQUES', 'ASSIDUITE', 'CUSTOM'
  )),
  periode_debut DATE,
  periode_fin DATE,
  fichier_url TEXT,
  format_fichier TEXT CHECK (format_fichier IN ('EXCEL', 'PDF', 'WORD')),
  statut TEXT DEFAULT 'BROUILLON' CHECK (statut IN ('BROUILLON', 'PUBLIE', 'ARCHIVE')),
  publie_par UUID REFERENCES auth.users(id),
  publie_le TIMESTAMP WITH TIME ZONE,
  permissions JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rapports_projet ON public.projet_rapports(projet_id);
CREATE INDEX IF NOT EXISTS idx_rapports_statut ON public.projet_rapports(statut);

COMMENT ON TABLE public.projet_rapports IS 'Rapports générés pour les projets (brouillon, publié, archivé)';

-- ============================================
-- 14. TABLE PLANIFICATION RAPPORTS RÉCURRENTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.projet_rapports_recurrents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projet_id UUID NOT NULL REFERENCES public.projets(id) ON DELETE CASCADE,
  type_rapport TEXT NOT NULL,
  frequence TEXT NOT NULL CHECK (frequence IN (
    'HEBDOMADAIRE', 'MENSUEL', 'TRIMESTRIEL', 'SEMESTRIEL', 'ANNUEL'
  )),
  jour_envoi INTEGER CHECK (jour_envoi >= 1 AND jour_envoi <= 31),
  auto_publier BOOLEAN DEFAULT false,
  permissions JSONB DEFAULT '{}'::jsonb,
  actif BOOLEAN DEFAULT true,
  prochaine_generation DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rapports_recurrents_projet ON public.projet_rapports_recurrents(projet_id);
CREATE INDEX IF NOT EXISTS idx_rapports_recurrents_actif ON public.projet_rapports_recurrents(actif);

COMMENT ON TABLE public.projet_rapports_recurrents IS 'Planification de rapports récurrents automatiques';

-- ============================================
-- FONCTIONS SQL
-- ============================================

-- Fonction pour calculer le score d'assiduité
CREATE OR REPLACE FUNCTION public.calculer_score_assiduite(
  p_beneficiaire_id TEXT,
  p_projet_id UUID,
  p_periode_debut DATE,
  p_periode_fin DATE
) RETURNS NUMERIC AS $$
DECLARE
  v_total INTEGER;
  v_presentes INTEGER;
  v_score NUMERIC;
BEGIN
  -- Compter les activités totales dans la période
  SELECT COUNT(*) INTO v_total
  FROM public.projet_activites
  WHERE projet_id = p_projet_id
    AND date_activite BETWEEN p_periode_debut AND p_periode_fin
    AND statut = 'TERMINE';
  
  -- Compter les présences
  SELECT COUNT(*) INTO v_presentes
  FROM public.activite_presences ap
  JOIN public.projet_activites pa ON ap.activite_id = pa.id
  WHERE ap.beneficiaire_id = p_beneficiaire_id
    AND pa.projet_id = p_projet_id
    AND pa.date_activite BETWEEN p_periode_debut AND p_periode_fin
    AND ap.present = true;
  
  -- Calculer le score
  IF v_total > 0 THEN
    v_score := (v_presentes::NUMERIC / v_total::NUMERIC) * 100;
  ELSE
    v_score := 0;
  END IF;
  
  RETURN ROUND(v_score, 2);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier disponibilité ressource
CREATE OR REPLACE FUNCTION public.verifier_disponibilite_ressource(
  p_ressource_id UUID,
  p_date_debut TIMESTAMP WITH TIME ZONE,
  p_date_fin TIMESTAMP WITH TIME ZONE,
  p_exclure_reservation_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_conflict_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_conflict_count
  FROM public.ressources_reservations
  WHERE ressource_id = p_ressource_id
    AND statut IN ('RESERVE', 'CONFIRME')
    AND (id != p_exclure_reservation_id OR p_exclure_reservation_id IS NULL)
    AND (
      (date_debut <= p_date_debut AND date_fin > p_date_debut) OR
      (date_debut < p_date_fin AND date_fin >= p_date_fin) OR
      (date_debut >= p_date_debut AND date_fin <= p_date_fin)
    );
  
  RETURN v_conflict_count = 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS updated_at
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer trigger updated_at sur toutes les nouvelles tables
DO $$
DECLARE
  table_name TEXT;
  tables TEXT[] := ARRAY[
    'projet_limites_depenses',
    'projet_rallonges_budget',
    'projet_criteres_eligibilite',
    'candidat_evaluations',
    'ressources',
    'ressources_reservations',
    'projet_activites',
    'activite_presences',
    'beneficiaire_assiduite',
    'projet_rapports',
    'projet_rapports_recurrents'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables
  LOOP
    DROP TRIGGER IF EXISTS update_updated_at_trigger ON public.table_name;
    EXECUTE format('
      CREATE TRIGGER update_updated_at_trigger
      BEFORE UPDATE ON public.%I
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
    ', table_name);
  END LOOP;
END $$;

-- ============================================
-- RLS POLICIES (BASIQUES - À ADAPTER)
-- ============================================

-- Activer RLS sur toutes les nouvelles tables
ALTER TABLE public.projet_limites_depenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projet_rallonges_budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projet_criteres_eligibilite ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidat_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ressources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ressources_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projet_activites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activite_presences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaire_assiduite ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jalon_dependances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jalon_recurrence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projet_rapports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projet_rapports_recurrents ENABLE ROW LEVEL SECURITY;

-- Politiques de base pour admins et gestionnaires
DO $$
BEGIN
  -- Politique pour projet_activites
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projet_activites' 
    AND policyname = 'Allow full access for admins and managers'
  ) THEN
    CREATE POLICY "Allow full access for admins and managers on projet_activites"
      ON public.projet_activites FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid()
          AND u.role IN ('ADMIN_ORGANISME', 'GESTIONNAIRE', 'CHEF_PROJET')
        )
      );
  END IF;
  
  -- Politique pour ressources
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ressources' 
    AND policyname = 'Allow read for all authenticated users'
  ) THEN
    CREATE POLICY "Allow read for all authenticated users on ressources"
      ON public.ressources FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;
  
  -- (Ajouter d'autres politiques selon besoins spécifiques)
END $$;

