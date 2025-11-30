# 🚀 Pousser le projet vers GitHub

## Dépôt GitHub

**URL du dépôt** : https://github.com/Cherif0104/Cherif0104-CERIP-SENEGAL.git

Le dépôt est vide et prêt à recevoir le code.

## Commandes pour pousser le projet

### Étape 1 : Mettre à jour le remote

```bash
# Mettre à jour l'URL du remote vers le nouveau dépôt
git remote set-url origin https://github.com/Cherif0104/Cherif0104-CERIP-SENEGAL.git

# Vérifier que l'URL est correcte
git remote -v
```

### Étape 2 : Ajouter tous les fichiers

```bash
# Ajouter tous les fichiers (nouveaux et modifiés)
git add .

# Vérifier ce qui sera commité
git status
```

### Étape 3 : Créer le commit initial

```bash
git commit -m "feat: Initial commit - ERP CERIP SENEGAL

- Application ERP complète pour gestion des programmes d'insertion professionnelle
- Modules: Programmes, Projets, Candidatures, Bénéficiaires, Intervenants
- Intégration Supabase pour backend et authentification
- Interface moderne avec React + Vite
- Configuration Vercel pour déploiement
- Système de permissions et audit trail
- Gestion RH complète
- Module Administration"
```

### Étape 4 : Pousser vers GitHub

```bash
# Renommer la branche en main (si nécessaire)
git branch -M main

# Pousser vers GitHub
git push -u origin main
```

## Vérification

Une fois le push terminé :

1. Allez sur https://github.com/Cherif0104/Cherif0104-CERIP-SENEGAL
2. Vérifiez que tous les fichiers sont présents
3. Vérifiez que le README.md s'affiche correctement
4. Vérifiez que le `.gitignore` est présent
5. **Important** : Vérifiez que les fichiers sensibles (`.env`, `node_modules`, `dist`) ne sont PAS dans le dépôt

## En cas d'erreur

### Si le dépôt n'est pas vide

```bash
# Si le dépôt contient déjà des fichiers, forcez le push (ATTENTION!)
git push -u origin main --force
```

⚠️ **Attention** : `--force` écrase tout ce qui existe déjà dans le dépôt.

### Si vous avez des conflits

```bash
# Récupérer les changements du dépôt distant
git fetch origin

# Fusionner avec votre code local
git merge origin/main

# Résoudre les conflits manuellement, puis :
git add .
git commit -m "fix: Résolution conflits"
git push -u origin main
```

## Prochaines étapes

Une fois le code sur GitHub :

1. ✅ Vérifiez que tout est présent
2. ✅ Passez à la configuration Vercel (voir `DEPLOIEMENT.md`)
3. ✅ Configurez les variables d'environnement sur Vercel
4. ✅ Déployez l'application

---

**Besoin d'aide ?** Consultez `DEPLOIEMENT.md` pour le guide complet.

