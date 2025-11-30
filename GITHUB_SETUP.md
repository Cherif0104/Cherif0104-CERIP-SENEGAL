# 🔧 Guide de Configuration GitHub

## Nouveau Dépôt GitHub

Le dépôt pour ce projet est : **https://github.com/Cherif0104/Cherif0104-CERIP-SENEGAL.git**

Le dépôt est déjà créé et vide, prêt à recevoir le code du projet.

### Méthode 2 : Vider via Git (si vous avez les droits)

```bash
# Supprimer tous les fichiers du dépôt (sauf .git)
git rm -rf .
git commit -m "chore: Nettoyage complet du dépôt"
git push origin main --force

# ⚠️ ATTENTION : Cette commande supprime TOUT. Assurez-vous d'avoir une sauvegarde.
```

### Méthode 3 : Créer un nouveau dépôt (Plus propre)

1. Allez sur https://github.com/new
2. Créez un nouveau dépôt nommé `INCUBATEUR-THIES` (ou le nom que vous préférez)
3. **Ne cochez PAS** "Initialize this repository with a README"
4. Cliquez sur **Create repository**

## Initialiser et pousser le projet

Une fois le dépôt vide ou créé, suivez ces étapes :

```bash
# 1. Vérifier si Git est initialisé
git status

# 2. Si Git n'est pas initialisé, l'initialiser
git init

# 3. Ajouter le remote GitHub
git remote add origin https://github.com/Cherif0104/Cherif0104-CERIP-SENEGAL.git

# OU si le remote existe déjà, le mettre à jour
git remote set-url origin https://github.com/Cherif0104/Cherif0104-CERIP-SENEGAL.git

# 4. Vérifier le remote
git remote -v

# 5. Ajouter tous les fichiers
git add .

# 6. Créer le commit initial
git commit -m "feat: Initial commit - ERP CERIP SENEGAL

- Application ERP complète pour gestion des programmes d'insertion
- Modules: Programmes, Projets, Candidatures, Bénéficiaires, Intervenants
- Intégration Supabase pour backend et authentification
- Interface moderne avec React + Vite
- Configuration Vercel pour déploiement"

# 7. Renommer la branche en main (si nécessaire)
git branch -M main

# 8. Pousser vers GitHub (avec force si le dépôt était vide)
git push -u origin main --force

# ⚠️ Note : --force est nécessaire uniquement si vous avez vidé le dépôt
# Sinon, utilisez simplement : git push -u origin main
```

## Vérification

Après le push, vérifiez que :
- ✅ Tous les fichiers sont présents sur GitHub
- ✅ Le README.md s'affiche correctement
- ✅ Le `.gitignore` est présent
- ✅ Les fichiers sensibles (.env) ne sont PAS présents

## Structure du dépôt

Le dépôt doit contenir :
- `/src` - Code source de l'application
- `/public` - Fichiers statiques
- `/supabase/migrations` - Migrations SQL
- `package.json` - Dépendances npm
- `vite.config.js` - Configuration Vite
- `vercel.json` - Configuration Vercel
- `.gitignore` - Fichiers ignorés par Git
- `README.md` - Documentation du projet
- `DEPLOIEMENT.md` - Guide de déploiement

## Protection de la branche main (Optionnel mais recommandé)

1. Allez dans **Settings** → **Branches**
2. Cliquez sur **Add rule** pour `main`
3. Cochez :
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require conversation resolution before merging
4. Cliquez sur **Create**

Cela empêche les push directs sur `main` et force l'utilisation de Pull Requests.

---

**Prêt pour le déploiement Vercel ?** Suivez le guide dans `DEPLOIEMENT.md`

