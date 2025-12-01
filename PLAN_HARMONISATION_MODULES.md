# 🎨 PLAN D'HARMONISATION DES MODULES
## Application du Style de Référence Programme/Projet

**Date :** 2025-01-06  
**Référence :** Module Programme (validé)  
**Objectif :** Unifier le style et la structure de tous les modules selon la référence Programme/Projet

---

## 📋 MODULES À HARMONISER

### ✅ Modules Déjà Harmonisés
- ✅ **Programmes** (référence)
- ✅ **Projets** (restructuré et harmonisé)

### 🔄 Modules à Harmoniser

1. **Partenaires** - Priorité : Haute
2. **Bénéficiaires** - Priorité : Haute
3. **Candidatures** - Priorité : Moyenne
4. **Intervenants** - Priorité : Moyenne
5. **Ressources Humaines** - Priorité : Moyenne
6. **Administration** - Priorité : Basse
7. **Reporting** - Priorité : Basse

---

## 🎯 STANDARDS À APPLIQUER

### 1. **Structure de Liste (Onglet Liste)**

#### **KPIs Statistiques**
```jsx
<div className="module-stats">
  <div className="stat-card-modern">
    <div className="stat-icon-primary">...</div>
    <div className="stat-content">
      <div className="stat-value">{total}</div>
      <div className="stat-label">Total</div>
    </div>
  </div>
  // ... autres KPIs
</div>
```

#### **Filtres Modernes**
```jsx
<div className="liste-filters-modern">
  <div className="filters-header">
    <h3>Filtres</h3>
    <div className="view-mode-toggle">
      <button className="view-btn active">Table</button>
      <button className="view-btn">Cartes</button>
    </div>
  </div>
  <div className="filters-content">
    // Filtres...
  </div>
</div>
```

#### **Barre d'Information**
```jsx
<div className="liste-info-modern">
  <div className="info-content">
    <span>{filteredItems.length} élément(s) trouvé(s)</span>
  </div>
</div>
```

#### **Vue Cartes**
```jsx
<div className="module-cards-grid">
  {items.map(item => (
    <div className="module-card">
      <div className="module-card-header">
        <h3 className="module-card-title">{item.nom}</h3>
        <span className="module-card-code">{item.code}</span>
      </div>
      <div className="module-card-body">
        // Contenu...
      </div>
    </div>
  ))}
</div>
```

### 2. **Structure de Page Détail**

#### **Header**
```jsx
<div className="module-detail-header">
  <Button onClick={() => navigate('/module')}>← Retour</Button>
  <div className="module-detail-title">
    <h1>{item.nom}</h1>
    <div className="module-detail-meta">
      <span className="module-detail-id">ID: {item.id}</span>
      {item.code && <span className="module-detail-code">Code: {item.code}</span>}
      {item.statut && <span className={`module-detail-statut statut-${item.statut}`}>{item.statut}</span>}
    </div>
  </div>
</div>
```

#### **Onglets**
```jsx
<div className="module-detail-tabs">
  <button className={`module-detail-tab ${activeTab === 'dashboard' ? 'active' : ''}`}>
    Vue d'ensemble
  </button>
  // ... autres onglets
</div>
```

### 3. **Styles CSS**

Utiliser les classes de base définies dans :
- `src/styles/module-base.css` (classes génériques)
- `src/modules/programmes/tabs/liste/ProgrammesListe.css` (référence)

---

## 📝 PLAN D'IMPLÉMENTATION PAR MODULE

### **1. Module Partenaires**

**Fichiers à modifier :**
- `src/modules/partenaires/tabs/organismes/OrganismesListe.jsx`
- `src/modules/partenaires/tabs/financeurs/FinanceursListe.jsx`
- `src/modules/partenaires/tabs/partenaires/PartenairesListe.jsx`
- `src/modules/partenaires/tabs/structures/StructuresListe.jsx`

**Actions :**
1. ✅ Ajouter section KPIs statistiques
2. ✅ Remplacer filtres par `liste-filters-modern`
3. ✅ Ajouter `liste-info-modern`
4. ✅ Implémenter vue cartes avec `module-cards-grid`
5. ✅ Appliquer styles CSS de référence

### **2. Module Bénéficiaires**

**Fichiers à modifier :**
- `src/pages/beneficiaires/Beneficiaires.jsx` (liste principale)

**Actions :**
1. ✅ Ajouter section KPIs statistiques
2. ✅ Remplacer filtres par `liste-filters-modern`
3. ✅ Ajouter `liste-info-modern`
4. ✅ Implémenter vue cartes
5. ✅ Appliquer styles CSS de référence

### **3. Module Candidatures**

**Fichiers à modifier :**
- `src/modules/candidatures/CandidaturesModule.jsx`

**Actions :**
1. ✅ Analyser structure actuelle
2. ✅ Appliquer style de référence
3. ✅ Ajouter KPIs et filtres modernes

### **4. Module Intervenants**

**Fichiers à modifier :**
- Composants de liste dans `src/modules/intervenants/`

**Actions :**
1. ✅ Analyser structure actuelle
2. ✅ Appliquer style de référence

### **5. Module Ressources Humaines**

**Fichiers à modifier :**
- Composants de liste dans `src/modules/ressources-humaines/`

**Actions :**
1. ✅ Analyser structure actuelle
2. ✅ Appliquer style de référence

### **6. Module Administration**

**Fichiers à modifier :**
- `src/modules/administration/tabs/utilisateurs/UtilisateursListe.jsx`

**Actions :**
1. ✅ Analyser structure actuelle
2. ✅ Appliquer style de référence

### **7. Module Reporting**

**Fichiers à modifier :**
- Composants dans `src/modules/reporting/`

**Actions :**
1. ✅ Analyser structure actuelle
2. ✅ Appliquer style de référence

---

## 🔧 ÉTAPES GÉNÉRALES POUR CHAQUE MODULE

### **Étape 1 : Analyse**
- [ ] Lire le composant de liste actuel
- [ ] Identifier les KPIs à afficher
- [ ] Identifier les filtres existants
- [ ] Vérifier si vue cartes existe

### **Étape 2 : Implémentation**
- [ ] Ajouter section KPIs avec `stat-card-modern`
- [ ] Remplacer filtres par `liste-filters-modern`
- [ ] Ajouter `liste-info-modern`
- [ ] Implémenter vue cartes si nécessaire
- [ ] Appliquer styles CSS

### **Étape 3 : Test**
- [ ] Vérifier affichage KPIs
- [ ] Tester filtres
- [ ] Tester vue cartes/table
- [ ] Vérifier responsive

---

## 📊 PRIORISATION

### **Phase 1 - Priorité Haute** (Semaine 1)
1. ✅ Partenaires
2. ✅ Bénéficiaires

### **Phase 2 - Priorité Moyenne** (Semaine 2)
3. ✅ Candidatures
4. ✅ Intervenants
5. ✅ Ressources Humaines

### **Phase 3 - Priorité Basse** (Semaine 3)
6. ✅ Administration
7. ✅ Reporting

---

## ✅ CHECKLIST GLOBALE

### **Structure**
- [ ] KPIs statistiques en haut
- [ ] Filtres modernes avec toggle vue
- [ ] Barre d'information
- [ ] Vue cartes implémentée
- [ ] Vue table avec colonnes cliquables

### **Styles**
- [ ] Classes CSS de référence appliquées
- [ ] Responsive (mobile, tablette, desktop)
- [ ] Badges de statut cohérents
- [ ] Couleurs harmonisées

### **Fonctionnalités**
- [ ] Recherche fonctionnelle
- [ ] Filtres fonctionnels
- [ ] Toggle vue cartes/table
- [ ] Navigation vers détails

---

**Date de création :** 2025-01-06  
**Dernière mise à jour :** 2025-01-06  
**Statut :** En cours

