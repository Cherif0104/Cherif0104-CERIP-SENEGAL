# 🚀 Guide de Déploiement - CERIP SENEGAL

## 📋 Prérequis

- Compte GitHub
- Compte Vercel
- Node.js 18+ installé
- Git installé

## 🔧 Étape 1 : Vider le dépôt GitHub existant

### Option A : Via GitHub Web Interface (Recommandé)

1. Allez sur https://github.com/Cherif0104/INCUBATEUR-THIES
2. Cliquez sur **Settings** (Paramètres)
3. Faites défiler jusqu'à la section **Danger Zone**
4. Cliquez sur **Delete this repository**
5. Entrez le nom du dépôt pour confirmer
6. **OU** créez un nouveau dépôt vide avec le nom que vous souhaitez

### Option B : Via Git (Ligne de commande)

Si vous avez déjà cloné le dépôt :

```bash
# Supprimer tous les fichiers sauf .git
git rm -rf .
git commit -m "Nettoyage du dépôt"
git push origin main --force
```

⚠️ **Attention** : Cette méthode force l'écrasement. Assurez-vous d'avoir une sauvegarde si nécessaire.

## 📦 Étape 2 : Préparer le projet local

### 2.1 Vérifier les fichiers essentiels

Assurez-vous que ces fichiers existent :
- ✅ `.gitignore` (configured)
- ✅ `package.json`
- ✅ `vercel.json`
- ✅ `README.md`
- ✅ `vite.config.js`

### 2.2 Variables d'environnement

Créez un fichier `.env.example` à la racine :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
```

⚠️ **Important** : Ne commitez JAMAIS le fichier `.env` avec vos vraies clés !

### 2.3 Build du projet

```bash
npm run build
```

Le dossier `dist/` sera créé automatiquement (déjà dans `.gitignore`).

## 🌐 Étape 3 : Initialiser Git et pousser vers GitHub

### 3.1 Initialiser Git (si pas déjà fait)

```bash
# Vérifier si Git est déjà initialisé
git status

# Si erreur, initialiser Git
git init

# Ajouter le remote (remplacez par votre URL)
git remote add origin https://github.com/Cherif0104/Cherif0104-CERIP-SENEGAL.git

# OU si le remote existe déjà, le mettre à jour
git remote set-url origin https://github.com/Cherif0104/Cherif0104-CERIP-SENEGAL.git
```

### 3.2 Premier commit et push

```bash
# Ajouter tous les fichiers
git add .

# Créer le commit initial
git commit -m "feat: Initial commit - ERP CERIP SENEGAL"

# Renommer la branche principale en main (si nécessaire)
git branch -M main

# Pousser vers GitHub (force si le dépôt était vide)
git push -u origin main --force
```

⚠️ **Note** : Utilisez `--force` uniquement si vous êtes sûr de vouloir écraser l'historique existant.

## ☁️ Étape 4 : Déployer sur Vercel

### 4.1 Créer un compte Vercel (si nécessaire)

1. Allez sur https://vercel.com
2. Cliquez sur **Sign Up**
3. Connectez-vous avec votre compte GitHub

### 4.2 Importer le projet

1. Dans le dashboard Vercel, cliquez sur **Add New Project**
2. Sélectionnez le dépôt **INCUBATEUR-THIES** (ou votre nom de dépôt)
3. Vercel détectera automatiquement Vite comme framework
4. Vérifiez les paramètres :
   - **Framework Preset** : Vite
   - **Root Directory** : `./` (la racine)
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
   - **Install Command** : `npm install`

### 4.3 Configurer les variables d'environnement

Avant de déployer, ajoutez les variables d'environnement dans Vercel :

1. Dans la section **Environment Variables**, ajoutez :
   - `VITE_SUPABASE_URL` = Votre URL Supabase
   - `VITE_SUPABASE_ANON_KEY` = Votre clé anonyme Supabase

2. Assurez-vous qu'elles sont activées pour :
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### 4.4 Déployer

1. Cliquez sur **Deploy**
2. Attendez la fin du build (2-3 minutes)
3. Une fois terminé, vous obtiendrez une URL de déploiement (ex: `https://cerip-senegal.vercel.app`)

## 🔄 Étape 5 : Configuration du déploiement automatique

Vercel est déjà configuré pour déployer automatiquement :
- ✅ À chaque push sur `main` → Déploiement en production
- ✅ À chaque pull request → Déploiement en preview

Le fichier `vercel.json` est déjà configuré avec les bonnes règles de routing.

## ✅ Vérification post-déploiement

### Checklist :

- [ ] Le site est accessible sur l'URL Vercel
- [ ] La connexion Supabase fonctionne (vérifier la console)
- [ ] L'authentification fonctionne
- [ ] Tous les modules sont accessibles
- [ ] Les styles CSS sont correctement chargés
- [ ] Les routes fonctionnent (navigation)

### En cas de problème :

1. **Erreur 404** : Vérifiez que `vercel.json` contient les rewrites SPA
2. **Erreur de connexion Supabase** : Vérifiez les variables d'environnement dans Vercel
3. **Erreur de build** : Consultez les logs dans Vercel Dashboard → Deployments → Logs

## 🔐 Sécurité

### Variables d'environnement

⚠️ **JAMAIS dans le code** :
- Clés API
- Secrets Supabase
- Tokens d'authentification
- Mots de passe

✅ **Toujours dans** :
- `.env.local` (local, ignoré par Git)
- Variables d'environnement Vercel (production)

## 📝 Commandes utiles

```bash
# Build local
npm run build

# Preview du build local
npm run preview

# Lancer en développement
npm run dev

# Vérifier les erreurs
npm run lint

# Vérifier les fichiers à commiter
git status

# Voir l'historique Git
git log --oneline
```

## 🆘 Support

En cas de problème :
1. Vérifiez les logs Vercel
2. Vérifiez la console du navigateur (F12)
3. Vérifiez que toutes les variables d'environnement sont correctement configurées
4. Contactez l'équipe de développement

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Vite](https://vitejs.dev/)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation React Router](https://reactrouter.com/)

---

**Dernière mise à jour** : Janvier 2025

