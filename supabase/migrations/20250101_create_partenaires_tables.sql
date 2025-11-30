-- Migration : Création des tables pour le module Partenaires/Structures
-- Date : 2025-01-XX

-- ============================================
-- ORGANISMES INTERNATIONAUX
-- ============================================

CREATE TABLE IF NOT EXISTS public.organismes_internationaux (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  type TEXT, -- ONG, Agence, Institution, Organisation Internationale, etc.
  pays TEXT,
  adresse TEXT,
  site_web TEXT,
  email TEXT,
  telephone TEXT,
  contacts JSONB DEFAULT '[]'::jsonb, -- Array de contacts [{nom, fonction, email, telephone}]
  notes TEXT,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE public.organismes_internationaux IS 'Organismes internationaux partenaires de CERIP';

-- ============================================
-- FINANCEURS
-- ============================================

CREATE TABLE IF NOT EXISTS public.financeurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  type TEXT, -- Institution, Fondation, Entreprise, Gouvernement, etc.
  pays TEXT,
  adresse TEXT,
  site_web TEXT,
  email TEXT,
  telephone TEXT,
  contacts JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE public.financeurs IS 'Financeurs des projets et programmes';

-- ============================================
-- PARTENAIRES
-- ============================================

CREATE TABLE IF NOT EXISTS public.partenaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  type_partenariat TEXT, -- Technique, Financier, Stratégique, Opérationnel, etc.
  domaines_collaboration JSONB DEFAULT '[]'::jsonb, -- Array de domaines
  pays TEXT,
  adresse TEXT,
  site_web TEXT,
  email TEXT,
  telephone TEXT,
  contacts JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE public.partenaires IS 'Partenaires stratégiques et opérationnels';

-- ============================================
-- STRUCTURES
-- ============================================

CREATE TABLE IF NOT EXISTS public.structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  type TEXT, -- Entreprise, Association, Coopérative, GIE, etc.
  secteur TEXT, -- Secteur d'activité
  adresse TEXT,
  site_web TEXT,
  email TEXT,
  telephone TEXT,
  contacts JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE public.structures IS 'Structures locales (entreprises, associations, etc.)';

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_organismes_code ON public.organismes_internationaux(code);
CREATE INDEX IF NOT EXISTS idx_organismes_actif ON public.organismes_internationaux(actif);
CREATE INDEX IF NOT EXISTS idx_organismes_type ON public.organismes_internationaux(type);

CREATE INDEX IF NOT EXISTS idx_financeurs_code ON public.financeurs(code);
CREATE INDEX IF NOT EXISTS idx_financeurs_actif ON public.financeurs(actif);
CREATE INDEX IF NOT EXISTS idx_financeurs_type ON public.financeurs(type);

CREATE INDEX IF NOT EXISTS idx_partenaires_code ON public.partenaires(code);
CREATE INDEX IF NOT EXISTS idx_partenaires_actif ON public.partenaires(actif);
CREATE INDEX IF NOT EXISTS idx_partenaires_type ON public.partenaires(type_partenariat);

CREATE INDEX IF NOT EXISTS idx_structures_code ON public.structures(code);
CREATE INDEX IF NOT EXISTS idx_structures_actif ON public.structures(actif);
CREATE INDEX IF NOT EXISTS idx_structures_type ON public.structures(type);

-- ============================================
-- TRIGGERS updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organismes_updated_at BEFORE UPDATE ON public.organismes_internationaux
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financeurs_updated_at BEFORE UPDATE ON public.financeurs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partenaires_updated_at BEFORE UPDATE ON public.partenaires
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_structures_updated_at BEFORE UPDATE ON public.structures
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Organismes Internationaux
ALTER TABLE public.organismes_internationaux ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active organismes"
  ON public.organismes_internationaux FOR SELECT
  USING (
    actif = true 
    OR auth.uid() IN (
      SELECT id FROM public.users 
      WHERE role IN ('ADMIN_SERIP', 'ADMIN_ORGANISME', 'GESTIONNAIRE', 'CONSULTANT')
    )
  );

CREATE POLICY "Admins can insert organismes"
  ON public.organismes_internationaux FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.users 
      WHERE role IN ('ADMIN_SERIP', 'ADMIN_ORGANISME', 'GESTIONNAIRE')
    )
  );

CREATE POLICY "Admins can update organismes"
  ON public.organismes_internationaux FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM public.users 
      WHERE role IN ('ADMIN_SERIP', 'ADMIN_ORGANISME', 'GESTIONNAIRE')
    )
  );

CREATE POLICY "Only super admins can delete organismes"
  ON public.organismes_internationaux FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM public.users 
      WHERE role = 'ADMIN_SERIP'
    )
  );

-- Financeurs
ALTER TABLE public.financeurs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active financeurs"
  ON public.financeurs FOR SELECT
  USING (
    actif = true 
    OR auth.uid() IN (
      SELECT id FROM public.users 
      WHERE role IN ('ADMIN_SERIP', 'ADMIN_ORGANISME', 'GESTIONNAIRE', 'CONSULTANT')
    )
  );

CREATE POLICY "Admins can insert financeurs"
  ON public.financeurs FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.users 
      WHERE role IN ('ADMIN_SERIP', 'ADMIN_ORGANISME', 'GESTIONNAIRE')
    )
  );

CREATE POLICY "Admins can update financeurs"
  ON public.financeurs FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM public.users 
      WHERE role IN ('ADMIN_SERIP', 'ADMIN_ORGANISME', 'GESTIONNAIRE')
    )
  );

CREATE POLICY "Only super admins can delete financeurs"
  ON public.financeurs FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM public.users 
      WHERE role = 'ADMIN_SERIP'
    )
  );

-- Partenaires
ALTER TABLE public.partenaires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active partenaires"
  ON public.partenaires FOR SELECT
  USING (
    actif = true 
    OR auth.uid() IN (
      SELECT id FROM public.users 
      WHERE role IN ('ADMIN_SERIP', 'ADMIN_ORGANISME', 'GESTIONNAIRE', 'CONSULTANT')
    )
  );

CREATE POLICY "Admins can insert partenaires"
  ON public.partenaires FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.users 
      WHERE role IN ('ADMIN_SERIP', 'ADMIN_ORGANISME', 'GESTIONNAIRE')
    )
  );

CREATE POLICY "Admins can update partenaires"
  ON public.partenaires FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM public.users 
      WHERE role IN ('ADMIN_SERIP', 'ADMIN_ORGANISME', 'GESTIONNAIRE')
    )
  );

CREATE POLICY "Only super admins can delete partenaires"
  ON public.partenaires FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM public.users 
      WHERE role = 'ADMIN_SERIP'
    )
  );

-- Structures
ALTER TABLE public.structures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active structures"
  ON public.structures FOR SELECT
  USING (
    actif = true 
    OR auth.uid() IN (
      SELECT id FROM public.users 
      WHERE role IN ('ADMIN_SERIP', 'ADMIN_ORGANISME', 'GESTIONNAIRE', 'CONSULTANT')
    )
  );

CREATE POLICY "Admins can insert structures"
  ON public.structures FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.users 
      WHERE role IN ('ADMIN_SERIP', 'ADMIN_ORGANISME', 'GESTIONNAIRE')
    )
  );

CREATE POLICY "Admins can update structures"
  ON public.structures FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM public.users 
      WHERE role IN ('ADMIN_SERIP', 'ADMIN_ORGANISME', 'GESTIONNAIRE')
    )
  );

CREATE POLICY "Only super admins can delete structures"
  ON public.structures FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM public.users 
      WHERE role = 'ADMIN_SERIP'
    )
  );

