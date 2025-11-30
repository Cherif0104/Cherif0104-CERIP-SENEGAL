-- Migration : Création des tables permissions et roles_custom pour le module Administration
-- Date : 2025-01-03

-- Table : permissions
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  module TEXT NOT NULL, -- programmes, projets, candidatures, beneficiaires, rh, reporting, administration
  action TEXT NOT NULL, -- create, read, update, delete, view, export, approve
  description TEXT,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_permissions_module ON public.permissions(module);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON public.permissions(action);
CREATE INDEX IF NOT EXISTS idx_permissions_code ON public.permissions(code);
CREATE INDEX IF NOT EXISTS idx_permissions_actif ON public.permissions(actif);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_permissions_updated_at
  BEFORE UPDATE ON public.permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_permissions_updated_at();

-- Table : roles_custom
CREATE TABLE IF NOT EXISTS public.roles_custom (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb, -- Array de codes de permissions
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_roles_custom_code ON public.roles_custom(code);
CREATE INDEX IF NOT EXISTS idx_roles_custom_actif ON public.roles_custom(actif);
CREATE INDEX IF NOT EXISTS idx_roles_custom_permissions ON public.roles_custom USING GIN(permissions);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_roles_custom_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_roles_custom_updated_at
  BEFORE UPDATE ON public.roles_custom
  FOR EACH ROW
  EXECUTE FUNCTION update_roles_custom_updated_at();

-- Ajouter colonne actif à users si elle n'existe pas (si pas déjà fait)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name = 'actif'
  ) THEN
    ALTER TABLE public.users ADD COLUMN actif BOOLEAN DEFAULT true;
  END IF;
END $$;

-- RLS (Row Level Security) pour permissions
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- Politique : Lecture publique (pour vérifier les permissions), modification admin uniquement
CREATE POLICY "Anyone can view permissions"
  ON public.permissions FOR SELECT
  USING (actif = true);

CREATE POLICY "Admins can manage permissions"
  ON public.permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('ADMIN_SERIP', 'ADMIN_ORGANISME')
      AND (users.actif = true OR users.actif IS NULL)
    )
  );

-- RLS (Row Level Security) pour roles_custom
ALTER TABLE public.roles_custom ENABLE ROW LEVEL SECURITY;

-- Politique : Lecture publique, modification admin uniquement
CREATE POLICY "Anyone can view custom roles"
  ON public.roles_custom FOR SELECT
  USING (actif = true);

CREATE POLICY "Admins can manage custom roles"
  ON public.roles_custom FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('ADMIN_SERIP', 'ADMIN_ORGANISME')
      AND (users.actif = true OR users.actif IS NULL)
    )
  );

-- Ajouter colonne roles_custom à la table users si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name = 'roles_custom'
  ) THEN
    ALTER TABLE public.users ADD COLUMN roles_custom JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Insertion des permissions de base par module
INSERT INTO public.permissions (code, nom, module, action, description) VALUES
  -- Permissions générales
  ('*', 'Tous les droits', 'all', 'all', 'Accès complet à tous les modules'),
  
  -- Permissions Programmes
  ('programmes.create', 'Créer un programme', 'programmes', 'create', 'Créer un nouveau programme'),
  ('programmes.read', 'Lire les programmes', 'programmes', 'read', 'Consulter les programmes'),
  ('programmes.update', 'Modifier un programme', 'programmes', 'update', 'Modifier un programme existant'),
  ('programmes.delete', 'Supprimer un programme', 'programmes', 'delete', 'Supprimer un programme'),
  ('programmes.view', 'Voir détails programme', 'programmes', 'view', 'Voir les détails d''un programme'),
  ('programmes.export', 'Exporter programmes', 'programmes', 'export', 'Exporter les données des programmes'),
  
  -- Permissions Projets
  ('projets.create', 'Créer un projet', 'projets', 'create', 'Créer un nouveau projet'),
  ('projets.read', 'Lire les projets', 'projets', 'read', 'Consulter les projets'),
  ('projets.update', 'Modifier un projet', 'projets', 'update', 'Modifier un projet existant'),
  ('projets.delete', 'Supprimer un projet', 'projets', 'delete', 'Supprimer un projet'),
  ('projets.view', 'Voir détails projet', 'projets', 'view', 'Voir les détails d''un projet'),
  ('projets.export', 'Exporter projets', 'projets', 'export', 'Exporter les données des projets'),
  
  -- Permissions Candidatures
  ('candidatures.create', 'Créer une candidature', 'candidatures', 'create', 'Créer une nouvelle candidature'),
  ('candidatures.read', 'Lire les candidatures', 'candidatures', 'read', 'Consulter les candidatures'),
  ('candidatures.update', 'Modifier une candidature', 'candidatures', 'update', 'Modifier une candidature existante'),
  ('candidatures.delete', 'Supprimer une candidature', 'candidatures', 'delete', 'Supprimer une candidature'),
  ('candidatures.evaluate', 'Évaluer candidature', 'candidatures', 'evaluate', 'Évaluer l''éligibilité d''une candidature'),
  ('candidatures.export', 'Exporter candidatures', 'candidatures', 'export', 'Exporter les données des candidatures'),
  
  -- Permissions Bénéficiaires
  ('beneficiaires.create', 'Créer un bénéficiaire', 'beneficiaires', 'create', 'Créer un nouveau bénéficiaire'),
  ('beneficiaires.read', 'Lire les bénéficiaires', 'beneficiaires', 'read', 'Consulter les bénéficiaires'),
  ('beneficiaires.update', 'Modifier un bénéficiaire', 'beneficiaires', 'update', 'Modifier un bénéficiaire existant'),
  ('beneficiaires.delete', 'Supprimer un bénéficiaire', 'beneficiaires', 'delete', 'Supprimer un bénéficiaire'),
  ('beneficiaires.view', 'Voir détails bénéficiaire', 'beneficiaires', 'view', 'Voir les détails d''un bénéficiaire'),
  ('beneficiaires.own', 'Voir ses propres données', 'beneficiaires', 'own', 'Voir uniquement ses propres données'),
  ('beneficiaires.export', 'Exporter bénéficiaires', 'beneficiaires', 'export', 'Exporter les données des bénéficiaires'),
  
  -- Permissions Ressources Humaines
  ('rh.employes', 'Gestion employés', 'rh', 'all', 'Gestion complète des employés'),
  ('rh.postes', 'Gestion postes', 'rh', 'all', 'Gestion complète des postes'),
  ('rh.competences', 'Gestion compétences', 'rh', 'all', 'Gestion complète des compétences'),
  ('rh.planning', 'Planning RH', 'rh', 'all', 'Gestion du planning RH'),
  
  -- Permissions Reporting
  ('reporting.view', 'Voir les rapports', 'reporting', 'view', 'Consulter les rapports'),
  ('reporting.export', 'Exporter rapports', 'reporting', 'export', 'Exporter les rapports'),
  ('reporting.financier', 'Rapports financiers', 'reporting', 'financier', 'Accès aux rapports financiers'),
  
  -- Permissions Administration
  ('administration.users', 'Gestion utilisateurs', 'administration', 'all', 'Gestion complète des utilisateurs'),
  ('administration.roles', 'Gestion rôles', 'administration', 'all', 'Gestion des rôles et permissions'),
  ('administration.config', 'Configuration système', 'administration', 'all', 'Modifier la configuration système'),
  ('administration.logs', 'Voir les logs', 'administration', 'view', 'Consulter les logs d''audit')
ON CONFLICT (code) DO NOTHING;

-- Insertion de rôles personnalisés par défaut (exemples)
-- Note: Les rôles par défaut (ADMIN_SERIP, etc.) sont gérés dans la table users
-- Ces rôles personnalisés sont optionnels et peuvent être créés pour des besoins spécifiques

-- Commentaires sur les tables
COMMENT ON TABLE public.permissions IS 'Permissions granulaires du système';
COMMENT ON COLUMN public.permissions.code IS 'Code unique de permission (ex: programmes.create)';
COMMENT ON COLUMN public.permissions.module IS 'Module concerné (programmes, projets, etc.)';
COMMENT ON COLUMN public.permissions.action IS 'Action autorisée (create, read, update, delete, etc.)';

COMMENT ON TABLE public.roles_custom IS 'Rôles personnalisés avec permissions spécifiques';
COMMENT ON COLUMN public.roles_custom.code IS 'Code unique du rôle personnalisé';
COMMENT ON COLUMN public.roles_custom.permissions IS 'Array de codes de permissions (ex: [''programmes.read'', ''projets.create''])';

COMMENT ON COLUMN public.users.roles_custom IS 'Array de codes de rôles personnalisés assignés à l''utilisateur';

