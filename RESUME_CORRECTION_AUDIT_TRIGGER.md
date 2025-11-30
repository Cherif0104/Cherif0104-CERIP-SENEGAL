# ✅ Correction - Erreur "SET is not allowed in a non-volatile function"

**Date :** 2025-01-03  
**Problème :** Erreur PostgreSQL lors de l'accès aux tables `users` et `configuration`

---

## 🐛 Problème Identifié

L'erreur `SET is not allowed in a non-volatile function` se produisait lors de :
- L'accès à la table `users` (liste des utilisateurs)
- L'accès à la table `configuration` (chargement de la configuration)

**Cause :**
La fonction `audit_trigger()` utilisait `SET search_path TO 'public'` dans sa définition, ce qui cause un conflit avec PostgreSQL lorsqu'elle est appelée dans un contexte RLS (Row Level Security).

---

## ✅ Solution Appliquée

### Migration SQL : `fix_audit_trigger_set_search_path`

**Changement :**
- Supprimé : `SET search_path TO 'public'` de la fonction `audit_trigger()`
- Utilisation : Schéma qualifié explicitement (`public.audit_log`) au lieu de dépendre du `search_path`

**Avant :**
```sql
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'  -- ❌ Problème ici
AS $$ ... $$;
```

**Après :**
```sql
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
-- ✅ Supprimé : SET search_path TO 'public'
-- Utiliser le schema qualifié explicitement à la place
AS $$ ... $$;
```

---

## ✅ Résultat

- ✅ Migration appliquée avec succès
- ✅ Les requêtes sur `users` fonctionnent maintenant
- ✅ Les requêtes sur `configuration` fonctionnent maintenant
- ✅ Le trigger d'audit continue de fonctionner correctement

---

## 📝 Note Technique

**Pourquoi cela fonctionne maintenant ?**

En utilisant le schéma qualifié explicitement (`public.audit_log`), nous n'avons plus besoin de modifier le `search_path`, ce qui élimine le conflit avec PostgreSQL RLS.

La fonction reste `SECURITY DEFINER` pour permettre l'insertion dans `audit_log` même si l'utilisateur n'a pas directement les permissions sur cette table.

---

## ✅ Statut

**Problème résolu !** Les erreurs ne devraient plus apparaître lors de :
- Chargement de la liste des utilisateurs
- Chargement de la configuration système
- Toutes autres opérations utilisant ces tables

