# 🚀 Guide de Déploiement Netlify - CERIP-SENEGAL

## ✅ Configuration Prête

Le fichier `netlify.toml` est déjà configuré avec :
- ✅ Build command : `npm run build`
- ✅ Output directory : `dist`
- ✅ Redirections SPA pour React Router
- ✅ Headers de cache optimisés

## 📋 Étapes de Déploiement

### Étape 1 : Créer un Compte Netlify

1. Allez sur **https://www.netlify.com**
2. Cliquez sur **"Sign up"**
3. Choisissez **"Continue with GitHub"**
4. Autorisez Netlify à accéder à votre compte GitHub

### Étape 2 : Importer le Projet

1. Dans le Dashboard Netlify, cliquez sur **"Add new site"** → **"Import an existing project"**
2. Choisissez **"Deploy with GitHub"**
3. Autorisez Netlify à accéder à vos repositories
4. Sélectionnez le repository **"CERIP-SENEGAL"**

### Étape 3 : Configuration du Déploiement

Netlify détectera automatiquement :
- ✅ **Build command** : `npm run build` (depuis `netlify.toml`)
- ✅ **Publish directory** : `dist` (depuis `netlify.toml`)
- ✅ **Framework** : Vite (détecté automatiquement)

**Ne changez rien**, cliquez sur **"Deploy site"** !

### Étape 4 : Variables d'Environnement (IMPORTANT)

**AVANT le premier déploiement**, ajoutez les variables :

1. Dans **Site settings** → **Environment variables**
2. Cliquez sur **"Add variable"**
3. Ajoutez ces 2 variables :

**Variable 1 :**
- **Key** : `VITE_SUPABASE_URL`
- **Value** : `https://rbhuuswonlotxtsedhrj.supabase.co`
- **Scopes** : ✅ Production, ✅ Deploy previews, ✅ Branch deploys

**Variable 2 :**
- **Key** : `VITE_SUPABASE_ANON_KEY`
- **Value** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiaHV1c3dvbmxvdHh0c2VkaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NTk4ODksImV4cCI6MjA3OTIzNTg4OX0.fwBz1vOtIR6Cx-YiINn_HHeK0S2Y8f0S9dEGCS2vjPY`
- **Scopes** : ✅ Production, ✅ Deploy previews, ✅ Branch deploys

4. Cliquez sur **"Save"**

### Étape 5 : Déploiement

1. Netlify va automatiquement :
   - Installer les dépendances (`npm install`)
   - Builder le projet (`npm run build`)
   - Déployer le dossier `dist/`

2. Une fois terminé, vous recevrez une URL : `https://cerip-senegal-xxx.netlify.app`

## 🔄 Déploiements Automatiques

Netlify déploie automatiquement :
- ✅ **À chaque push sur `main`** → Déploiement en production
- ✅ **À chaque pull request** → Déploiement de prévisualisation
- ✅ **À chaque commit** → Nouveau déploiement

## 📊 Monitoring

Dans le Dashboard Netlify, vous pouvez :
- Voir les logs de déploiement
- Monitorer les performances
- Voir les erreurs en temps réel
- Gérer les domaines personnalisés
- Voir les analytics

## 🔗 URLs Disponibles

- **Production** : `https://cerip-senegal-xxx.netlify.app`
- **Preview** : Une URL unique pour chaque PR/branche

## 🛠️ Configuration Avancée

### Domaine Personnalisé

1. Allez dans **Site settings** → **Domain management**
2. Cliquez sur **"Add custom domain"**
3. Suivez les instructions DNS

### Variables d'Environnement Additionnelles

Si vous ajoutez d'autres variables plus tard :
1. **Site settings** → **Environment variables**
2. Ajoutez la nouvelle variable
3. Redéployez (automatique au prochain push)

## 🆘 Dépannage

### Le déploiement échoue ?

1. **Vérifiez les logs** dans Netlify Dashboard → **Deploys** → Cliquez sur le déploiement
2. **Vérifiez les variables d'environnement** (elles doivent être exactement comme ci-dessus)
3. **Testez localement** : `npm run build` doit fonctionner

### L'application ne se charge pas ?

1. Vérifiez que les variables d'environnement sont bien configurées
2. Vérifiez la console du navigateur pour les erreurs
3. Vérifiez que Supabase est accessible

### Erreur 404 sur les routes ?

C'est normal ! Netlify est configuré avec `netlify.toml` pour gérer le routing SPA.
Si ça ne fonctionne pas, vérifiez que `netlify.toml` est bien dans le repository.

## ✅ Checklist de Déploiement

- [ ] Compte Netlify créé
- [ ] Projet importé depuis GitHub
- [ ] Variables d'environnement ajoutées (VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY)
- [ ] Déploiement réussi
- [ ] Application accessible via l'URL Netlify
- [ ] Test de connexion fonctionnel

## 🎯 Prochaines Étapes

Une fois déployé :
1. Testez l'application sur l'URL Netlify
2. Partagez le lien avec votre équipe
3. Configurez un domaine personnalisé si nécessaire
4. Continuez à développer : chaque push = nouveau déploiement automatique !

---

**Besoin d'aide ?** Consultez la documentation Netlify : https://docs.netlify.com

