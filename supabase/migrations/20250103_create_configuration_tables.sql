-- Migration : Création de la table configuration pour le module Administration
-- Date : 2025-01-03

-- Table : configuration
CREATE TABLE IF NOT EXISTS public.configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cle TEXT UNIQUE NOT NULL,
  valeur JSONB,
  type TEXT NOT NULL DEFAULT 'string', -- string, number, boolean, object, array
  categorie TEXT NOT NULL DEFAULT 'general', -- general, securite, localisation, email, notifications
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_configuration_categorie ON public.configuration(categorie);
CREATE INDEX IF NOT EXISTS idx_configuration_cle ON public.configuration(cle);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_configuration_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_configuration_updated_at
  BEFORE UPDATE ON public.configuration
  FOR EACH ROW
  EXECUTE FUNCTION update_configuration_updated_at();

-- Ajouter colonne actif à users si elle n'existe pas
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

-- RLS (Row Level Security)
ALTER TABLE public.configuration ENABLE ROW LEVEL SECURITY;

-- Politique : Seuls les administrateurs peuvent lire/modifier la configuration
CREATE POLICY "Admins can view configuration"
  ON public.configuration FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('ADMIN_SERIP', 'ADMIN_ORGANISME')
      AND (users.actif = true OR users.actif IS NULL)
    )
  );

CREATE POLICY "Admins can insert configuration"
  ON public.configuration FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('ADMIN_SERIP', 'ADMIN_ORGANISME')
      AND (users.actif = true OR users.actif IS NULL)
    )
  );

CREATE POLICY "Admins can update configuration"
  ON public.configuration FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('ADMIN_SERIP', 'ADMIN_ORGANISME')
      AND (users.actif = true OR users.actif IS NULL)
    )
  );

CREATE POLICY "Admins can delete configuration"
  ON public.configuration FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('ADMIN_SERIP', 'ADMIN_ORGANISME')
      AND (users.actif = true OR users.actif IS NULL)
    )
  );

-- Insertion des configurations par défaut
INSERT INTO public.configuration (cle, valeur, type, categorie, description) VALUES
  ('nom_organisme', '"CERIP Senegal"', 'string', 'general', 'Nom de l''organisme'),
  ('adresse', 'null', 'string', 'general', 'Adresse de l''organisme'),
  ('telephone', 'null', 'string', 'general', 'Téléphone de contact'),
  ('email', 'null', 'string', 'general', 'Email de contact'),
  ('site_web', 'null', 'string', 'general', 'Site web'),
  ('duree_session', '24', 'number', 'securite', 'Durée de session en heures'),
  ('complexite_mot_de_passe', '"medium"', 'string', 'securite', 'Niveau de complexité du mot de passe (low, medium, high)'),
  ('tentatives_max', '5', 'number', 'securite', 'Nombre maximum de tentatives de connexion avant blocage'),
  ('devise', '"XOF"', 'string', 'localisation', 'Devise par défaut'),
  ('format_date', '"DD/MM/YYYY"', 'string', 'localisation', 'Format d''affichage des dates'),
  ('langue', '"fr"', 'string', 'localisation', 'Langue par défaut (fr, en, wo)'),
  ('smtp_host', 'null', 'string', 'email', 'Serveur SMTP'),
  ('smtp_port', '587', 'number', 'email', 'Port SMTP'),
  ('smtp_user', 'null', 'string', 'email', 'Utilisateur SMTP'),
  ('smtp_password', 'null', 'string', 'email', 'Mot de passe SMTP'),
  ('email_from', 'null', 'string', 'email', 'Email expéditeur par défaut')
ON CONFLICT (cle) DO NOTHING;

-- Commentaires sur la table
COMMENT ON TABLE public.configuration IS 'Configuration système de l''application';
COMMENT ON COLUMN public.configuration.cle IS 'Clé unique de configuration (ex: nom_organisme, devise)';
COMMENT ON COLUMN public.configuration.valeur IS 'Valeur de la configuration (format JSON)';
COMMENT ON COLUMN public.configuration.type IS 'Type de la valeur (string, number, boolean, object, array)';
COMMENT ON COLUMN public.configuration.categorie IS 'Catégorie de configuration (general, securite, localisation, email, notifications)';

