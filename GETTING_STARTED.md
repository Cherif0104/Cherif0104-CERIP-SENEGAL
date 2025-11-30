# Guide de Démarrage - ERP CERIP Senegal

## Prérequis

- Node.js 18+ installé
- Compte Supabase créé
- Git (optionnel)

## Installation

1. **Cloner le projet** (si depuis Git) ou assurez-vous d'être dans le dossier du projet

2. **Installer les dépendances** :
```bash
npm install
```

3. **Configurer les variables d'environnement** :

Créez un fichier `.env.local` à la racine du projet :
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
```

Vous trouverez ces informations dans votre dashboard Supabase :
- Projet > Settings > API
- `URL` → VITE_SUPABASE_URL
- `anon/public` key → VITE_SUPABASE_ANON_KEY

## Configuration de la Base de Données Supabase

### 1. Créer les tables nécessaires

Exécutez les scripts SQL suivants dans le SQL Editor de Supabase :

#### Table `users`
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  nom TEXT,
  prenom TEXT,
  role TEXT NOT NULL DEFAULT 'ADMIN_SERIP',
  telephone TEXT,
  actif BOOLEAN DEFAULT true,
  date_creation TIMESTAMP DEFAULT NOW(),
  date_modification TIMESTAMP DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users"
  ON public.users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'ADMIN_SERIP'
    )
  );
```

#### Table `programmes`
```sql
CREATE TABLE public.programmes (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  description TEXT,
  date_debut DATE,
  date_fin DATE,
  budget_total NUMERIC DEFAULT 0,
  statut TEXT DEFAULT 'Planifié',
  responsable_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.programmes ENABLE ROW LEVEL SECURITY;
```

#### Table `projets`
```sql
CREATE TABLE public.projets (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  description TEXT,
  programme_id INTEGER REFERENCES public.programmes(id),
  date_debut DATE,
  date_fin DATE,
  budget_alloue NUMERIC DEFAULT 0,
  budget_consomme NUMERIC DEFAULT 0,
  chef_projet_id UUID REFERENCES public.users(id),
  statut TEXT DEFAULT 'Planifié',
  jalons JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.projets ENABLE ROW LEVEL SECURITY;
```

#### Table `appels_candidatures`
```sql
CREATE TABLE public.appels_candidatures (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  description TEXT,
  projet_id INTEGER REFERENCES public.projets(id),
  date_ouverture DATE,
  date_fermeture DATE,
  criteres_eligibilite JSONB DEFAULT '{}'::jsonb,
  statut TEXT DEFAULT 'Planifié',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.appels_candidatures ENABLE ROW LEVEL SECURITY;
```

#### Table `candidats`
```sql
CREATE TABLE public.candidats (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT,
  telephone TEXT,
  appel_id INTEGER REFERENCES public.appels_candidatures(id),
  statut TEXT DEFAULT 'En attente',
  eligible BOOLEAN DEFAULT false,
  date_candidature TIMESTAMP DEFAULT NOW(),
  dossier JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.candidats ENABLE ROW LEVEL SECURITY;
```

#### Table `beneficiaires`
```sql
CREATE TABLE public.beneficiaires (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  candidat_id INTEGER REFERENCES public.candidats(id),
  statut TEXT DEFAULT 'Pré-incubation',
  diagnostic JSONB DEFAULT '{}'::jsonb,
  plan_action JSONB DEFAULT '{}'::jsonb,
  mentor_id UUID REFERENCES public.users(id),
  coach_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.beneficiaires ENABLE ROW LEVEL SECURITY;
```

#### Table `intervenants`
```sql
CREATE TABLE public.intervenants (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) UNIQUE,
  type TEXT NOT NULL, -- Mentor, Formateur, Coach
  specialite TEXT,
  disponibilite INTEGER DEFAULT 40, -- heures/semaine
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.intervenants ENABLE ROW LEVEL SECURITY;
```

#### Table `financements`
```sql
CREATE TABLE public.financements (
  id SERIAL PRIMARY KEY,
  projet_id INTEGER REFERENCES public.projets(id),
  montant NUMERIC NOT NULL,
  date_prevu DATE,
  date_recu DATE,
  statut TEXT DEFAULT 'En attente',
  source TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.financements ENABLE ROW LEVEL SECURITY;
```

#### Table `insertions`
```sql
CREATE TABLE public.insertions (
  id SERIAL PRIMARY KEY,
  beneficiaire_id INTEGER REFERENCES public.beneficiaires(id),
  type TEXT NOT NULL, -- Emploi, Création entreprise
  date_insertion DATE,
  suivi_3mois JSONB,
  suivi_6mois JSONB,
  suivi_12mois JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.insertions ENABLE ROW LEVEL SECURITY;
```

#### Table `risques`
```sql
CREATE TABLE public.risques (
  id SERIAL PRIMARY KEY,
  projet_id INTEGER REFERENCES public.projets(id),
  type TEXT NOT NULL,
  nom TEXT NOT NULL,
  probabilite INTEGER CHECK (probabilite >= 0 AND probabilite <= 100),
  impact INTEGER CHECK (impact >= 0 AND impact <= 100),
  score NUMERIC GENERATED ALWAYS AS ((probabilite * impact) / 100.0) STORED,
  niveau TEXT,
  plan_mitigation TEXT,
  statut TEXT DEFAULT 'Actif',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.risques ENABLE ROW LEVEL SECURITY;
```

### 2. Créer le trigger pour les utilisateurs

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nom, prenom, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'nom',
    NEW.raw_user_meta_data->>'prenom',
    COALESCE(NEW.raw_user_meta_data->>'role', 'ADMIN_SERIP')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Démarrage

```bash
npm run dev
```

L'application sera accessible sur **http://localhost:5173**

## Premier Utilisateur

1. Accédez à la page Register : http://localhost:5173/register
2. Créez votre compte avec le rôle `ADMIN_SERIP`
3. Connectez-vous avec vos identifiants

## Structure du Projet

```
src/
├── components/     # Composants réutilisables
├── modules/        # Modules principaux de l'ERP
├── pages/          # Pages de l'application
├── services/       # Services API (Supabase)
├── hooks/          # Hooks React personnalisés
├── utils/          # Utilitaires
├── styles/         # Styles CSS
└── lib/            # Configuration (Supabase)
```

## Commandes Disponibles

- `npm run dev` - Lancer le serveur de développement
- `npm run build` - Créer un build de production
- `npm run preview` - Prévisualiser le build de production
- `npm run lint` - Vérifier le code avec ESLint

## Support

Pour toute question ou problème, consultez la documentation ou contactez l'équipe de développement.

