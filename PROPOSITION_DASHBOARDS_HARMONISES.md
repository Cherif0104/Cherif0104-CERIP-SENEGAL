# Proposition d'Harmonisation des Tableaux de Bord

## 🎯 Objectif

Créer une structure harmonisée et cohérente pour tous les tableaux de bord de l'application, en s'inspirant du dashboard le plus complet (ProgrammeDashboardDetail) et en appliquant les standards établis.

---

## 📐 Structure Standard Proposée

### Template de Base (Tous les Dashboards)

```jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KPICard } from '@/components/modules/KPICard'
import { MetricCard } from '@/components/modules/MetricCard'
import { AlertsSection } from '@/components/modules/AlertsSection'
import { DonutChart } from '@/components/modules/DonutChart'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { DataTable } from '@/components/common/DataTable'
import { logger } from '@/utils/logger'
import { formatCurrency, formatDate } from '@/utils/format'
import './DashboardModule.css'

export default function DashboardModule() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState([])
  const [recentItems, setRecentItems] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Charger toutes les données nécessaires
      const [statsData, alertsData, recentData] = await Promise.all([
        loadStats(),
        loadAlerts(),
        loadRecentItems(),
      ])
      
      setStats(statsData)
      setAlerts(alertsData)
      setRecentItems(recentData)
    } catch (error) {
      logger.error('DASHBOARD', 'Erreur chargement données', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState message="Chargement du tableau de bord..." />

  return (
    <div className="dashboard-modern">
      {/* 1. EN-TÊTE */}
      <div className="dashboard-header-modern">
        <div>
          <h1>Titre Dashboard</h1>
          <p className="dashboard-subtitle">Description / Sous-titre</p>
        </div>
        <div className="dashboard-actions">
          <Button variant="primary" onClick={() => navigate('/module/new')}>
            <Icon name="Plus" size={16} />
            Nouveau
          </Button>
          <button onClick={loadDashboardData} className="dashboard-refresh">
            <Icon name="RefreshCw" size={18} />
            Actualiser
          </button>
        </div>
      </div>

      {/* 2. ALERTES */}
      {alerts.length > 0 && (
        <div className="dashboard-alerts">
          <AlertsSection alerts={alerts} />
        </div>
      )}

      {/* 3. KPIs PRINCIPAUX */}
      <div className="dashboard-kpis-modern">
        <KPICard
          icon="Icon1"
          value={stats?.kpi1 || 0}
          label="Label KPI 1"
          variant="primary"
        />
        <KPICard
          icon="Icon2"
          value={stats?.kpi2 || 0}
          label="Label KPI 2"
          variant="success"
        />
        <KPICard
          icon="Icon3"
          value={stats?.kpi3 || 0}
          label="Label KPI 3"
          variant="warning"
        />
        <KPICard
          icon="Icon4"
          value={stats?.kpi4 || 0}
          label="Label KPI 4"
          variant="accent"
        />
      </div>

      {/* 4. MÉTRIQUES DÉTAILLÉES */}
      <div className="dashboard-metrics-modern">
        <MetricCard
          title="Métrique 1"
          value={formatCurrency(stats?.metric1 || 0)}
          detail="Détail contextuel"
          progress={stats?.progress1 || 0}
        />
        <MetricCard
          title="Métrique 2"
          value={stats?.metric2 || 0}
          detail="Détail contextuel"
          progress={stats?.progress2 || 0}
        />
      </div>

      {/* 5. VISUALISATIONS */}
      <div className="dashboard-charts-modern">
        <div className="chart-card-modern">
          <DonutChart
            title="Répartition par statut"
            data={[
              { name: 'statut1', label: 'Statut 1', value: stats?.statut1 || 0, color: '#3b82f6' },
              { name: 'statut2', label: 'Statut 2', value: stats?.statut2 || 0, color: '#10b981' },
            ]}
            centerValue={stats?.total || 0}
            centerLabel="Total"
            height={280}
          />
        </div>
      </div>

      {/* 6. DONNÉES RÉCENTES */}
      {recentItems.length > 0 && (
        <div className="dashboard-recent-modern">
          <div className="dashboard-recent-header">
            <h3>Éléments récents</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/module')}
            >
              Voir tout →
            </Button>
          </div>
          <DataTable
            columns={[
              { key: 'nom', label: 'Nom' },
              { key: 'date', label: 'Date', render: (v) => formatDate(v) },
              { key: 'statut', label: 'Statut' },
            ]}
            data={recentItems.slice(0, 5)}
            onRowClick={(row) => navigate(`/module/${row.id}`)}
          />
        </div>
      )}

      {/* 7. SECTIONS SPÉCIFIQUES */}
      <div className="dashboard-sections-modern">
        {/* Sections métier spécifiques */}
      </div>
    </div>
  )
}
```

---

## 🎨 CSS Harmonisé

### Fichier : `src/styles/dashboard-base.css`

```css
/* ============================================
   DASHBOARD MODERN - Styles de Base
   ============================================ */

.dashboard-modern {
  padding: 24px;
  background: #f9fafb;
  min-height: calc(100vh - 200px);
}

/* En-tête */
.dashboard-header-modern {
  background: white;
  border-radius: 16px;
  padding: 24px 32px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(243, 244, 246, 0.8);
}

.dashboard-header-modern h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.dashboard-subtitle {
  margin: 0;
  font-size: 16px;
  color: #6b7280;
  font-weight: 400;
}

.dashboard-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.dashboard-refresh {
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dashboard-refresh:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #1f2937;
}

/* Alertes */
.dashboard-alerts {
  margin-bottom: 24px;
}

/* KPIs Principaux */
.dashboard-kpis-modern {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

/* Métriques Détaillées */
.dashboard-metrics-modern {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

/* Visualisations */
.dashboard-charts-modern {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.chart-card-modern {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(243, 244, 246, 0.8);
}

/* Données Récentes */
.dashboard-recent-modern {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(243, 244, 246, 0.8);
  margin-bottom: 24px;
}

.dashboard-recent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f3f4f6;
}

.dashboard-recent-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

/* Sections Spécifiques */
.dashboard-sections-modern {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.dashboard-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(243, 244, 246, 0.8);
  margin-bottom: 24px;
}

.dashboard-section h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  padding-bottom: 12px;
  border-bottom: 2px solid #f3f4f6;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-modern {
    padding: 16px;
  }

  .dashboard-header-modern {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }

  .dashboard-kpis-modern,
  .dashboard-metrics-modern {
    grid-template-columns: 1fr;
  }

  .dashboard-charts-modern {
    grid-template-columns: 1fr;
  }

  .dashboard-sections-modern {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .dashboard-kpis-modern {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-metrics-modern {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-charts-modern {
    grid-template-columns: 1fr;
  }
}
```

---

## 📋 Spécifications par Dashboard

### 1. Dashboard Principal (`/dashboard`)

**KPIs (4):**
- Programmes actifs
- Projets en cours
- Budget total
- Taux de conversion

**Métriques:**
- Budget consommé (avec prévision)
- Candidats totaux
- Bénéficiaires actifs

**Visualisations:**
- DonutChart : Budget Total
- DonutChart : Programmes Actifs
- DonutChart : Projets en Cours
- DonutChart : Répartition Programmes
- DonutChart : Répartition Projets
- DonutChart : Prévision Budget (6 mois)
- DonutChart : Risque Budget

**Sections Spécifiques:**
- RecommandationsWidget
- Risques Projets Widget

---

### 2. Dashboard Programmes (Liste)

**KPIs (4):**
- Programmes actifs
- Budget total
- Taux d'avancement
- Projets associés

**Métriques:**
- Budget consommé (avec barre de progression)

**Visualisations:**
- FunnelVisualization : Programmes → Projets

**Alertes:**
- Budget critique (> 90%)
- Budget élevé (> 75%)

**À Ajouter:**
- Graphique de tendance (évolution temporelle)
- Liste des 5-10 programmes récents

---

### 3. Dashboard Programme (Détail) - ✅ REFERENCE

**KPIs (6):**
- Budget total
- Taux de consommation
- Projets
- Bénéficiaires
- Candidats
- Taux d'objectifs

**Métriques:**
- Budget consommé
- Budget restant
- Dépenses validées
- Projets en cours
- Projets terminés
- Projets en retard
- Candidats totaux
- Taux d'éligibilité
- Bénéficiaires actifs
- Taux de conversion
- Taux d'insertion

**Visualisations:**
- DonutChart : Répartition projets par statut
- DonutChart : Répartition bénéficiaires par statut
- DonutChart : Répartition candidats par statut
- DonutChart : Répartition activités par statut

**Alertes:**
- Dépenses non comptabilisées
- Budget critique
- Projets en retard

**Données Récentes:**
- Table : 10 dernières dépenses

**Sections:**
- Finances
- Progression
- Bénéficiaires
- Candidats
- Activités

---

### 4. Dashboard Projets (Liste)

**KPIs (4):**
- Projets actifs
- Budget total
- Taux d'avancement
- Total projets

**Métriques:**
- Budget consommé (avec barre de progression)

**Visualisations:**
- FunnelVisualization : Projets

**Alertes:**
- Budget critique (> 90%)
- Budget élevé (> 75%)

**À Ajouter:**
- Graphique de tendance
- Liste des 5-10 projets récents

---

### 5. Dashboard Ressources Humaines

**KPIs (5):**
- Total employés
- Employés actifs
- Total postes
- Postes ouverts
- Compétences

**À Ajouter:**
- Métriques : Taux d'occupation postes, Charge moyenne
- Visualisations : DonutChart répartition employés par type, DonutChart répartition par département
- Alertes : Postes vacants critiques, Contrats expirant
- Données récentes : 5 derniers employés, 5 derniers postes créés

---

### 6. Dashboard Partenaires

**KPIs (4):**
- Organismes Internationaux
- Financeurs
- Partenaires
- Structures

**À Ajouter:**
- Métriques : Total partenaires actifs, Total financements
- Visualisations : DonutChart répartition par type
- Alertes : Partenaires inactifs
- Données récentes : 5 derniers partenaires ajoutés

---

### 7. Dashboard Bénéficiaires

**KPIs (4):**
- Bénéficiaires actifs
- Taux d'insertion
- Formations
- Accompagnements

**À Ajouter:**
- Métriques : Taux de conversion candidats→bénéficiaires, Taux d'assiduité
- Visualisations : DonutChart répartition par statut, DonutChart répartition par secteur
- Alertes : Bénéficiaires en difficulté, Assiduité faible
- Données récentes : 5 derniers bénéficiaires ajoutés

---

### 8. Dashboard Candidatures

**KPIs (4):**
- Appels ouverts
- Candidats
- Éligibles
- Taux d'éligibilité

**À Ajouter:**
- Métriques : Taux de conversion, Candidats en attente
- Visualisations : DonutChart répartition par statut, DonutChart répartition par appel
- Alertes : Appels fermant bientôt, Candidats en attente longue
- Données récentes : 5 derniers candidats, 5 derniers appels

---

### 9. Dashboard Intervenants

**KPIs (4):**
- Mentors
- Formateurs
- Coaches
- Total intervenants

**À Ajouter:**
- Métriques : Charge moyenne, Disponibilité
- Visualisations : DonutChart répartition par type, DonutChart répartition par charge
- Alertes : Surcharge intervenants, Disponibilité faible
- Données récentes : 5 derniers intervenants ajoutés

---

### 10. Dashboard Administration

**KPIs (4):**
- Utilisateurs actifs
- Référentiels
- Configuration
- Logs d'audit (à ajouter)

**À Ajouter:**
- Métriques : Sessions actives, Actions aujourd'hui
- Visualisations : DonutChart répartition par rôle, Graphique activité utilisateurs
- Alertes : Tentatives de connexion suspectes, Erreurs système
- Données récentes : 10 dernières actions d'audit

---

### 11. Dashboard Reporting

**KPIs (4):**
- Rapports générés
- En attente
- Taux de complétion
- Exports

**À Ajouter:**
- Métriques : Rapports ce mois, Temps moyen génération
- Visualisations : DonutChart répartition par type, Graphique évolution génération
- Alertes : Rapports en échec, Rapports en attente longue
- Données récentes : 5 derniers rapports générés

---

## 🔄 Plan d'Implémentation

### Phase 1 : Infrastructure (Priorité Haute)
1. ✅ Créer `src/styles/dashboard-base.css`
2. ✅ Importer dans `src/styles/globals.css`
3. ✅ Vérifier que KPICard et MetricCard sont harmonisés

### Phase 2 : Dashboards Simples (Priorité Moyenne)
1. ⚠️ Enrichir RHDashboard
2. ⚠️ Enrichir PartenairesDashboard
3. ⚠️ Enrichir BeneficiairesDashboard
4. ⚠️ Enrichir CandidaturesDashboard
5. ⚠️ Enrichir IntervenantsDashboard
6. ⚠️ Enrichir AdministrationDashboard
7. ⚠️ Enrichir ReportingDashboard

### Phase 3 : Dashboards Avancés (Priorité Moyenne)
1. ⚠️ Améliorer Dashboard principal (organisation)
2. ⚠️ Ajouter listes récentes (Programmes/Projets liste)
3. ⚠️ Standardiser ProgrammeDashboardDetail comme template

### Phase 4 : Optimisations (Priorité Basse)
1. ⚠️ Lazy loading graphiques
2. ⚠️ Cache métriques
3. ⚠️ Actualisation automatique

---

## ✅ Checklist d'Harmonisation par Dashboard

Pour chaque dashboard, vérifier et implémenter :

### Structure
- [ ] En-tête avec titre et sous-titre
- [ ] Actions rapides (si applicable)
- [ ] Utilisation de `dashboard-modern` comme container

### Contenu
- [ ] Alertes (si applicable)
- [ ] KPIs principaux (4-6 cartes avec KPICard)
- [ ] Métriques détaillées (avec MetricCard)
- [ ] Visualisations (DonutChart, FunnelVisualization, etc.)
- [ ] Données récentes / Listes
- [ ] Sections spécifiques métier

### Technique
- [ ] Loading states
- [ ] Error handling
- [ ] Navigation vers détails
- [ ] Responsive design
- [ ] Utilisation des classes CSS harmonisées

---

## 📊 Matrice de Priorité

| Dashboard | Priorité | Complexité | État Actuel | Action Requise |
|-----------|----------|------------|-------------|----------------|
| **Principal** | Haute | Moyenne | ✅ Bon | Améliorer organisation |
| **Programmes (Liste)** | Haute | Faible | ✅ Bon | Ajouter listes récentes |
| **Programme (Détail)** | Haute | Élevée | ✅ Excellent | Standardiser comme template |
| **Projets (Liste)** | Haute | Faible | ✅ Bon | Ajouter listes récentes |
| **RH** | Moyenne | Faible | ⚠️ Basique | Enrichir complètement |
| **Partenaires** | Moyenne | Faible | ⚠️ Basique | Enrichir complètement |
| **Bénéficiaires** | Moyenne | Faible | ⚠️ Basique | Enrichir complètement |
| **Candidatures** | Moyenne | Faible | ⚠️ Basique | Enrichir complètement |
| **Intervenants** | Moyenne | Faible | ⚠️ Basique | Enrichir complètement |
| **Administration** | Basse | Faible | ⚠️ Basique | Enrichir complètement |
| **Reporting** | Basse | Faible | ⚠️ Basique | Enrichir complètement |

---

## 🎯 Standards de Qualité

### KPIs
- Minimum 4 KPIs par dashboard
- Maximum 6 KPIs pour éviter surcharge
- Utiliser KPICard harmonisé
- Variantes cohérentes (primary, success, warning, danger, accent, secondary)

### Métriques
- Utiliser MetricCard avec barres de progression
- Détails contextuels pertinents
- Variantes selon état (success, danger, warning)

### Visualisations
- DonutChart pour répartitions
- FunnelVisualization pour processus
- Graphiques de tendance pour évolutions temporelles
- Lazy loading pour graphiques lourds

### Alertes
- Priorités : CRITICAL, HIGH, WARNING, INFO
- Actions cliquables si applicable
- Seuils configurables

### Données Récentes
- Maximum 5-10 éléments
- Colonnes essentielles uniquement
- Navigation vers détails
- Lien "Voir tout" vers liste complète

---

**Date de création :** 2025-01-XX
**Version :** 1.0
**Statut :** Proposition

