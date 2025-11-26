# 🚀 CERIP SENEGAL - ERP de Gestion des Programmes d'Insertion

Application web moderne de type ERP (Enterprise Resource Planning) pour la gestion complète des programmes d'insertion professionnelle au Sénégal.

## ✨ Fonctionnalités Principales

### 📊 Modules Disponibles

1. **Tableau de bord** - Vue d'ensemble avec KPIs, métriques et alertes
2. **Programmes & Projets** - Gestion complète des programmes et projets
3. **Candidatures** - Pipeline de candidats avec évaluation d'éligibilité
4. **Bénéficiaires** - Dossiers 360° avec diagnostic, plan d'action et suivi
5. **Portails Intervenants** - Portails dédiés pour Mentors, Formateurs et Coaches
6. **Reporting & Analytics** - Rapports et analyses avancées
7. **Administration** - Gestion des référentiels et paramètres

### 🎯 Caractéristiques ERP SAP-like

- **Nomenclature documentaire** : PRG (Programmes), PRJ (Projets), APL (Appels), CAN (Candidats), BEN (Bénéficiaires)
- **Traçabilité complète** : Chaîne PRG → PRJ → APL → CAN → BEN avec liens relationnels
- **Redondance fonctionnelle** : Affichage contextuel des informations parentes/enfants
- **Formulaires modulaires** : Composants réutilisables avec validation avancée
- **Référentiels dynamiques** : Ajout de nouvelles valeurs directement depuis les formulaires
- **Assignations** : Gestion des chefs de projet et intervenants (mentors, formateurs, coaches)

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+ et npm
- Compte Supabase

### Installation

```bash
# Cloner le repository
git clone https://github.com/Cherif0104/CERIP-SENEGAL.git
cd CERIP-SENEGAL

# Installer les dépendances
npm install
```

### Configuration

Créez un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon
```

Voir `env.example` pour le template.

### Développement

```bash
npm run dev
```

L'application sera accessible sur **http://localhost:5173**

### Build Production

```bash
npm run build
```

Le dossier `dist/` sera généré avec les fichiers optimisés.

## 📦 Déploiement

### Vercel (Recommandé)

1. Connectez votre repository GitHub à Vercel
2. Ajoutez les variables d'environnement dans Vercel Dashboard
3. Vercel déploiera automatiquement à chaque push sur `main`

Le fichier `vercel.json` est déjà configuré.

## 🏗️ Structure du Projet

```
CERIP-SENEGAL/
├── public/          # Assets statiques
├── src/
│   ├── components/ # Composants React réutilisables
│   ├── pages/        # Pages de l'application
│   ├── services/     # Services API (Supabase)
│   ├── lib/          # Configuration Supabase
│   ├── hooks/        # Hooks React personnalisés
│   ├── utils/        # Utilitaires
│   ├── data/         # Données statiques
│   └── styles/       # Styles globaux
├── .gitignore
├── package.json
├── vite.config.js
├── vercel.json
└── README.md
```

## 🛠️ Stack Technologique

- **Frontend** : React 19 + Vite
- **Backend** : Supabase (PostgreSQL + API REST)
- **Routing** : React Router DOM v6
- **UI** : Composants modulaires avec CSS Variables
- **Icons** : Lucide React
- **Charts** : Recharts

## 📝 Scripts Disponibles

- `npm run dev` - Lancer le serveur de développement
- `npm run build` - Build de production
- `npm run preview` - Prévisualiser le build
- `npm run lint` - Linter le code

## 🔄 Workflow Git

```bash
# Ajouter les modifications
git add .

# Créer un commit
git commit -m "feat: Description"

# Pousser vers GitHub
git push origin main
```

## 📄 Licence

Ce projet est privé et propriétaire de CERIP-SENEGAL.

## 👥 Support

Pour toute question ou problème, contactez l'équipe de développement.
