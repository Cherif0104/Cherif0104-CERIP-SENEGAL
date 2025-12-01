# Guide de Style - Référence Application CERIP Senegal

## Vue d'ensemble

Ce document définit les standards de style unifiés pour toute l'application, basés sur le style du module Programmes/Projets.

## Structure des Modules

### Module Principal
Chaque module doit suivre cette structure :
```
ModuleHeader (titre + sous-titre + bouton refresh + actions)
  ↓
Contenu du module (liste, dashboard, etc.)
```

### ModuleHeader
- **Titre** : `font-size: 24px`, `font-weight: 600`, `color: #1f2937`
- **Sous-titre** : `font-size: 14px`, `color: #6b7280`
- **Bouton Refresh** : Icône de rafraîchissement
- **Bouton Création** : Style `create-*-button` avec :
  - `font-size: 16px`
  - `font-weight: 600`
  - `padding: 12px 24px`
  - `box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3)`
  - Effet hover : `transform: translateY(-2px)`

## Cartes de Statistiques (KPIs)

### Structure
```jsx
<div className="*-stats">
  <div className="stat-card-modern">
    <div className="stat-icon stat-icon-{primary|success|warning|default}">
      <Icon name="..." size={24} />
    </div>
    <div className="stat-content">
      <div className="stat-value">{valeur}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
</div>
```

### Styles
- **Container** : `display: grid`, `grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))`, `gap: 20px`
- **Carte** : 
  - `background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)`
  - `border-radius: 16px`
  - `padding: 24px`
  - `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
  - Effet hover : `transform: translateY(-4px)`
  - Barre supérieure au hover : `linear-gradient(90deg, #3b82f6, #8b5cf6)`

### Couleurs des Icônes
- **Primary** : `linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)`
- **Success** : `linear-gradient(135deg, #10b981 0%, #059669 100%)`
- **Warning** : `linear-gradient(135deg, #f59e0b 0%, #d97706 100%)`
- **Default** : `linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)`

### Typographie
- **Valeur** : `font-size: 28px`, `font-weight: 800`, `color: #111827`, `letter-spacing: -0.5px`
- **Label** : `font-size: 13px`, `font-weight: 500`, `color: #6b7280`, `text-transform: uppercase`, `letter-spacing: 0.5px`

## Section Filtres

### Structure
```jsx
<div className="liste-filters-modern">
  <div className="filters-header">
    <h3>Filtres de recherche</h3>
    <div className="view-mode-toggle">
      <button className="view-btn active">Table</button>
      <button className="view-btn">Cards</button>
    </div>
  </div>
  <div className="filters-content">
    <div className="filter-group">
      <Input label="..." />
    </div>
  </div>
</div>
```

### Styles
- **Container** : 
  - `background: white`
  - `border-radius: 16px`
  - `padding: 24px`
  - `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
  - `border: 1px solid rgba(243, 244, 246, 0.8)`
- **Header** : 
  - `border-bottom: 2px solid #f3f4f6`
  - `padding-bottom: 16px`
- **Toggle Vue** : 
  - `background: #f3f4f6`
  - `border-radius: 8px`
  - Bouton actif : `background: white`, `color: #3b82f6`, `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)`
- **Filtres** : `display: grid`, `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))`, `gap: 16px`

## Barre d'Information

### Structure
```jsx
<div className="liste-info-modern">
  <div className="info-content">
    <Icon name="Info" size={16} />
    <span>
      <strong>{count}</strong> élément(s) sur <strong>{total}</strong>
    </span>
  </div>
</div>
```

### Styles
- `background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)`
- `border-left: 4px solid #3b82f6`
- `border-radius: 8px`
- `padding: 16px 20px`
- `color: #1e40af`
- `font-weight: 500`

## Tableau de Données

### Wrapper
```jsx
<div className="data-table-wrapper">
  <DataTable columns={columns} data={data} />
</div>
```

### Styles
- `background: white`
- `border-radius: 16px`
- `padding: 24px`
- `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
- `border: 1px solid rgba(243, 244, 246, 0.8)`

### Cellules Nom avec Code
```jsx
<div className="*-name-cell">
  <span className="*-name">{nom}</span>
  <span className="*-code">{code}</span>
</div>
```

### Styles
- **Cellule** : `padding: 4px 8px`, `margin: -4px -8px`, `border-radius: 6px`
- **Hover** : `background: #f3f4f6`, couleur nom → `#3b82f6`
- **Nom** : `font-weight: 600`, `font-size: 14px`
- **Code** : `font-size: 12px`, `font-family: 'Monaco', 'Menlo', monospace`, `background: #f3f4f6`, `padding: 2px 6px`, `border-radius: 4px`

## Vue en Cartes

### Structure
```jsx
<div className="*-cards-grid">
  <div className="*-card">
    <div className="*-card-header">
      <div className="*-card-title">
        <h4>{nom}</h4>
        <span className="*-card-code">{code}</span>
      </div>
      <span className="statut-badge-modern">{statut}</span>
    </div>
    <div className="*-card-body">
      <div className="*-card-item">
        <Icon name="..." size={16} />
        <span>{valeur}</span>
      </div>
    </div>
    <div className="*-card-actions">
      <button className="card-action-btn">...</button>
    </div>
  </div>
</div>
```

### Styles
- **Grid** : `display: grid`, `grid-template-columns: repeat(auto-fill, minmax(360px, 1fr))`, `gap: 24px`
- **Carte** : 
  - `background: white`
  - `border-radius: 16px`
  - `padding: 24px`
  - `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
  - Effet hover : `transform: translateY(-4px)`, barre supérieure visible
- **Header** : `border-bottom: 1px solid #e5e7eb` (implicite via margin-bottom)
- **Body** : `border-bottom: 1px solid #e5e7eb`, `padding-bottom: 20px`
- **Actions** : Boutons avec hover coloré (premier : bleu, dernier : jaune)

## Badges de Statut

### Styles
- `padding: 6px 12px`
- `border-radius: 12px`
- `font-size: 11px`
- `font-weight: 600`
- `text-transform: uppercase`
- `letter-spacing: 0.5px`

### Couleurs par Statut
- **Actif/En cours** : `background: #dcfce7`, `color: #166534`
- **Terminé/Clôturé** : `background: #dbeafe`, `color: #1e40af`
- **Brouillon** : `background: #f3f4f6`, `color: #4b5563`
- **Annulé** : `background: #fee2e2`, `color: #991b1b`

## Responsive Design

### Mobile (max-width: 640px)
- Stats : `grid-template-columns: 1fr`
- Filtres : `grid-template-columns: 1fr`
- Cartes : `grid-template-columns: 1fr`
- Padding réduit : `16px` au lieu de `24px`

### Tablette (641px - 1024px)
- Stats : `grid-template-columns: repeat(2, 1fr)`
- Cartes : `grid-template-columns: repeat(2, 1fr)`

## Couleurs Principales

- **Primary Blue** : `#3b82f6`
- **Success Green** : `#10b981`
- **Warning Orange** : `#f59e0b`
- **Default Purple** : `#8b5cf6`
- **Text Primary** : `#1f2937`
- **Text Secondary** : `#6b7280`
- **Background** : `#f9fafb`
- **Border** : `#e5e7eb`

## Espacements

- **Petit** : `8px`
- **Moyen** : `16px`
- **Grand** : `24px`
- **Très grand** : `32px`

## Ombres

- **Légère** : `0 2px 4px rgba(0, 0, 0, 0.06)`
- **Moyenne** : `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
- **Forte** : `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`

## Transitions

- **Standard** : `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`
- **Rapide** : `all 0.2s ease`

## Application

Tous les modules doivent suivre ces standards :
- ✅ Programmes
- ✅ Projets
- ⏳ Partenaires
- ⏳ Bénéficiaires
- ⏳ Candidatures
- ⏳ Intervenants
- ⏳ Ressources Humaines
- ⏳ Administration
- ⏳ Reporting
- ⏳ Finances

