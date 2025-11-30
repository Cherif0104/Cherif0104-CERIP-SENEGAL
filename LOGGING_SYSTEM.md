# Système de Logging - Documentation

## Vue d'ensemble

Un système de logging centralisé a été mis en place pour suivre toutes les actions, erreurs et problèmes dans l'application. Cela permet de comprendre exactement ce qui se passe à chaque étape.

## Utilisation dans le code

### Importer le logger

```javascript
import { logger } from '@/utils/logger'
```

### Types de logs disponibles

#### 1. Debug (informations détaillées)
```javascript
logger.debug('CATEGORY', 'Message', { data: 'optionnel' })
```

#### 2. Info (informations importantes)
```javascript
logger.info('CATEGORY', 'Message', { data: 'optionnel' })
```

#### 3. Warning (avertissements)
```javascript
logger.warn('CATEGORY', 'Message', { data: 'optionnel' })
```

#### 4. Error (erreurs)
```javascript
logger.error('CATEGORY', 'Message', error)
```

#### 5. Action utilisateur
```javascript
logger.action('ACTION_NAME', { details: 'optionnel' })
```

#### 6. Appel API
```javascript
logger.api('GET', '/api/endpoint', request, response, error)
```

## Logs déjà intégrés

### Authentification
- ✅ `Login.jsx` - Toutes les tentatives de connexion
- ✅ `useAuth.js` - Hook d'authentification
- ✅ `auth.service.js` - Service d'authentification
  - signIn
  - signUp
  - getCurrentUser
  - getUserProfile
  - ensureUserProfile

### Configuration
- ✅ `supabase.js` - Initialisation Supabase

### Application
- ✅ `main.jsx` - Démarrage de l'application

## Accès aux logs en développement

En mode développement, les logs sont disponibles dans la console du navigateur avec des couleurs pour chaque niveau :

- 🔵 **DEBUG** (gris) - Informations détaillées
- 🔵 **INFO** (bleu) - Informations importantes
- 🟡 **WARN** (orange) - Avertissements
- 🔴 **ERROR** (rouge) - Erreurs

### Commandes console (mode dev uniquement)

Ouvrez la console du navigateur (F12) et utilisez :

```javascript
// Voir tous les logs
window.logs()

// Voir les logs filtrés
window.logger.getLogs({ level: 'ERROR' })
window.logger.getLogs({ category: 'AUTH' })
window.logger.getLogs({ category: 'AUTH_SERVICE' })

// Exporter les logs en JSON
window.exportLogs()

// Effacer les logs
window.clearLogs()
```

## Format des logs

Chaque log contient :
- `timestamp` - Date et heure ISO
- `level` - Niveau (DEBUG, INFO, WARN, ERROR)
- `category` - Catégorie (AUTH, API, etc.)
- `message` - Message descriptif
- `data` - Données supplémentaires (optionnel)
- `id` - Identifiant unique

## Dépannage de la connexion

Avec le système de logs, vous pouvez maintenant :

1. **Cliquer sur "Se connecter"**
2. **Ouvrir la console (F12)**
3. **Observer les logs** qui montrent exactement où le processus bloque

### Séquence attendue des logs lors d'une connexion

```
[INFO] [APP] Application démarrée
[DEBUG] [SUPABASE] Configuration Supabase vérifiée
[DEBUG] [USE_AUTH] Initialisation du hook useAuth
[DEBUG] [USE_AUTH] Vérification de la session utilisateur...
[ACTION] [LOGIN_ATTEMPT] Action: LOGIN_ATTEMPT
[DEBUG] [AUTH] Appel de signIn...
[DEBUG] [USE_AUTH] signIn appelé depuis useAuth
[DEBUG] [AUTH_SERVICE] signIn appelé
[DEBUG] [AUTH_SERVICE] Appel à supabase.auth.signInWithPassword...
[DEBUG] [AUTH_SERVICE] signInWithPassword terminé en XXXms
[DEBUG] [AUTH_SERVICE] Utilisateur authentifié
[DEBUG] [AUTH_SERVICE] Vérification/création du profil utilisateur...
[DEBUG] [AUTH_SERVICE] getUserProfile appelé
[DEBUG] [AUTH_SERVICE] Requête Supabase pour récupérer le profil...
[DEBUG] [AUTH_SERVICE] Profil récupéré avec succès
[INFO] [AUTH_SERVICE] Connexion réussie en XXXms
[ACTION] [LOGIN_SUCCESS] Action: LOGIN_SUCCESS
```

Si le processus bloque, les logs indiqueront **exactement** à quelle étape et pourquoi.

## Résolution des problèmes

### Problème : Le bouton tourne indéfiniment

**Solution :**
1. Ouvrez la console (F12)
2. Cherchez les logs avec `[AUTH]` ou `[AUTH_SERVICE]`
3. Identifiez la dernière étape qui s'est exécutée
4. Regardez s'il y a des erreurs après cette étape
5. Le log vous dira exactement où et pourquoi ça bloque

### Problème : Erreur de connexion silencieuse

**Solution :**
- Les erreurs sont maintenant loggées avec `[ERROR]`
- Cherchez dans la console les logs en rouge
- Chaque erreur contient le message et la stack trace complète

### Problème : Performance lente

**Solution :**
- Chaque log inclut le temps d'exécution en millisecondes
- Identifiez les étapes qui prennent le plus de temps
- Exemple : `signInWithPassword terminé en 5234ms` = lent !

## Export et analyse

### Exporter les logs

```javascript
// Dans la console
window.exportLogs()
```

Cela télécharge un fichier JSON avec tous les logs pour analyse ultérieure.

### Analyser les logs

```javascript
// Erreurs uniquement
const errors = window.logger.getLogs({ level: 'ERROR' })

// Logs d'authentification uniquement
const authLogs = window.logger.getLogs({ category: 'AUTH' })

// Logs des 10 dernières minutes
const recent = window.logger.getLogs({
  startDate: new Date(Date.now() - 10 * 60 * 1000).toISOString()
})
```

## Bonnes pratiques

1. **Utilisez des catégories cohérentes** : AUTH, API, UI, etc.
2. **Loggez les erreurs avec le contexte complet**
3. **Utilisez DEBUG pour les détails techniques**
4. **Utilisez INFO pour les actions importantes**
5. **Utilisez ERROR pour toutes les erreurs**

## Exemples d'utilisation

```javascript
// Dans un composant
logger.action('BUTTON_CLICKED', { buttonName: 'Submit', formId: 'login' })

// Dans un service
logger.api('POST', '/api/login', { email }, response, null)

// Dans un hook
logger.debug('USE_FORM', 'Validation du formulaire', { errors: 2 })

// Gestion d'erreur
try {
  await someOperation()
} catch (error) {
  logger.error('SERVICE', 'Erreur lors de l\'opération', error)
}
```

## Configuration

Les logs peuvent être configurés dans `src/utils/logger.js` :

- `maxLogs` - Nombre maximum de logs en mémoire (défaut: 1000)
- `level` - Niveau minimum de log (défaut: DEBUG en dev, INFO en prod)
- `enableConsole` - Activer/désactiver la console (défaut: true)
- `enableStorage` - Persister les logs dans localStorage (défaut: false)

