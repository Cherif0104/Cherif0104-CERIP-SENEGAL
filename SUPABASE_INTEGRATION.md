# Intégration Supabase - Structure existante

## Configuration Supabase

Votre projet Supabase est déjà configuré :
- **URL** : `https://rbhuuswonlotxtsedhrj.supabase.co`
- **Clé anonyme** : Configurée dans `.env.local`

## Structure de la base de données

Votre base de données contient déjà les tables suivantes avec leur structure réelle :

### Tables principales

1. **users** (UUID, RLS activé)
   - Colonnes : id, email, role, nom, prenom, telephone, organisation_id, metadata
   - Rôles disponibles : ADMIN_ORGANISME, BAILLEUR, BENEFICIAIRE, MENTOR, COACH, FORMATEUR, GPERFORM

2. **programmes** (TEXT ID, RLS activé)
   - Colonnes : id, nom, description, type, budget, date_debut, date_fin, statut
   - Statuts : BROUILLON, PLANIFIÉ, OUVERT, EN_COURS, FERMÉ, ARCHIVÉ, etc.

3. **projets** (UUID, RLS activé)
   - Colonnes : id, programme_id, nom, description, type_activite, budget, date_debut, date_fin, statut
   - Statuts : PLANIFIE, EN_COURS, TERMINE, ANNULE

4. **appels_candidatures** (UUID, RLS activé)
   - Colonnes : id, projet_id, titre, description, date_ouverture, date_fermeture, statut

5. **candidats** (UUID, RLS activé)
   - Colonnes nombreuses : id, appel_id, personne_id, organisation_id, statut_global, statut_eligibilite, etc.

6. **beneficiaires** (TEXT ID, RLS activé)
   - Colonnes nombreuses : id, candidat_id, projet_id, personne_id, user_id, mentor_id, etc.

### Tables supplémentaires

- **mentors** : Gestion des mentors
- **formations** : Gestion des formations
- **accompagnements** : Suivi des accompagnements
- **financements** : Financements programmes/projets
- **depenses** : Dépenses programmes/projets
- **programme_budget_lignes** : Lignes budgétaires
- **programme_indicateurs** : Indicateurs de performance
- **programme_rapports** : Rapports de programmes
- **dossiers** : Dossiers de bénéficiaires
- **questionnaires** : Questionnaires d'évaluation
- Et bien d'autres...

## Adaptations faites dans le code

Les services ont été adaptés pour :
- ✅ Utiliser les UUIDs au lieu de codes générés
- ✅ Utiliser les noms de colonnes réels (budget au lieu de budget_total, etc.)
- ✅ Utiliser les statuts réels de votre base
- ✅ S'adapter à la structure réelle des relations (personnes, organisations, etc.)

## Notes importantes

1. **IDs** : Les tables utilisent des UUIDs générés automatiquement par Supabase, pas de génération de codes PRG-XXX, etc.

2. **Statuts** : Les statuts sont en majuscules avec underscores (EN_COURS, PLANIFIE, etc.)

3. **Relations** : Certaines tables utilisent des relations avec `personnes` et `organisations` en plus des relations directes

4. **RLS** : Toutes les tables principales ont RLS activé, vérifiez vos politiques de sécurité

## Prochaines étapes

1. Tester l'authentification avec vos utilisateurs existants
2. Vérifier les politiques RLS pour s'assurer que les utilisateurs peuvent accéder aux données
3. Ajouter des données de test si nécessaire
4. Personnaliser les formulaires selon vos besoins spécifiques

