# Modèle de Formulaires Multi-Étapes - Guide d'Utilisation

## 🎯 Objectif

Créer un modèle standardisé pour tous les formulaires de l'application avec :
- Navigation par étapes (Précédent/Suivant)
- Validation par étape
- Tips contextuels
- Support jusqu'à 20 étapes
- Composants réutilisables

## 📦 Composants Disponibles

### 1. MultiStepForm
Formulaire multi-étapes avec navigation et progression visuelle.

### 2. GeographicSelector
Sélection géographique dégressive (Pays → Régions → Communes → Arrondissements).

### 3. SelectCreatable
Select avec bouton "Autre..." pour créer de nouvelles valeurs dynamiquement.

### 4. FormStepBuilder
Helper pour construire facilement des formulaires multi-étapes.

### 5. Tooltip & TipBox
Composants pour afficher des conseils et informations utiles.

## 🔧 Utilisation Basique

### Étape 1 : Importer les composants

```jsx
import { MultiStepForm } from '@/components/forms/MultiStepForm'
import { FormStepBuilder, validators } from '@/components/forms/FormStepBuilder'
import { GeographicSelector } from '@/components/forms/GeographicSelector'
import { SelectCreatable } from '@/components/common/SelectCreatable'
import { TipBox } from '@/components/common/Tooltip'
```

### Étape 2 : Créer le formulaire avec FormStepBuilder

```jsx
const builder = new FormStepBuilder()

// Étape 1 : Nom
builder.addStep({
  id: 'nom',
  title: 'Informations de base',
  description: 'Commencez par les informations essentielles',
  tip: 'Choisissez un nom clair et descriptif pour faciliter l\'identification',
  validate: validators.combine(
    validators.required('nom', 'Le nom'),
    validators.minLength('nom', 'Le nom', 5)
  ),
  content: ({ formData, onChange, errors }) => (
    <div>
      <Input
        label="Nom"
        value={formData.nom}
        onChange={(e) => onChange('nom', e.target.value)}
        error={errors.nom}
        required
      />
      <TipBox
        type="info"
        title="Conseil"
        content="Utilisez un nom court mais descriptif"
      />
    </div>
  ),
})

// Étape 2 : Localisation
builder.addStep({
  id: 'localisation',
  title: 'Zone géographique',
  description: 'Définissez la zone d\'intervention',
  validate: validators.combine(
    validators.required('regions_cibles', 'Les régions')
  ),
  content: ({ formData, onChange, errors }) => (
    <GeographicSelector
      label="Zone d'intervention"
      value={{
        pays: 'Sénégal',
        regions: formData.regions_cibles || [],
        communes: formData.communes_cibles || [],
        arrondissements: formData.arrondissements_cibles || [],
      }}
      onChange={(geo) => {
        onChange('regions_cibles', geo.regions)
        onChange('communes_cibles', geo.communes)
        onChange('arrondissements_cibles', geo.arrondissements)
      }}
      tip="Sélectionnez les zones où le programme sera actif"
      error={errors.regions_cibles}
    />
  ),
})

const steps = builder.build()
```

### Étape 3 : Utiliser MultiStepForm

```jsx
<MultiStepForm
  steps={steps}
  initialData={formData}
  onSubmit={handleSubmit}
  onCancel={() => navigate('/programmes')}
  title="Nouveau programme"
  loading={loading}
/>
```

## 📝 Structure Complète pour ProgrammeForm (20 étapes)

```jsx
const steps = [
  // Étapes 1-5 : Informations de base
  { id: 'nom', title: 'Nom et description', ... },
  { id: 'type', title: 'Type et statut', ... },
  { id: 'dates', title: 'Dates', ... },
  { id: 'budget', title: 'Budget', ... },
  { id: 'objectifs', title: 'Objectifs', ... },
  
  // Étapes 6-10 : Critères d'éligibilité
  { id: 'genre', title: 'Genre cible', ... },
  { id: 'activite', title: 'Type d\'activité', ... },
  { id: 'secteurs', title: 'Secteurs d\'activité', ... },
  { id: 'age', title: 'Tranches d\'âge', ... },
  { id: 'competences', title: 'Compétences requises', ... },
  
  // Étapes 11-15 : Localisation
  { id: 'regions', title: 'Régions', ... },
  { id: 'departements', title: 'Départements', ... },
  { id: 'communes', title: 'Communes', ... },
  { id: 'arrondissements', title: 'Arrondissements', ... },
  { id: 'zones', title: 'Zones spécifiques', ... },
  
  // Étapes 16-20 : Financement et partenaires
  { id: 'financeurs', title: 'Financeurs', ... },
  { id: 'executants', title: 'Exécutants', ... },
  { id: 'partenaires', title: 'Partenaires', ... },
  { id: 'ressources', title: 'Ressources', ... },
  { id: 'complementaires', title: 'Informations complémentaires', ... },
]
```

## 💡 Tips Utiles

### Tips Contextuels

```jsx
<TipBox
  type="info"
  title="Conseil"
  content="Les informations saisies seront utilisées pour l'éligibilité"
/>

<TipBox
  type="warning"
  title="Attention"
  content="Vérifiez bien les dates avant de continuer"
/>

<TipBox
  type="success"
  title="Parfait"
  content="Vous pouvez ajouter jusqu'à 20 secteurs d'activité"
/>
```

### Tips dans les champs

```jsx
<SelectCreatable
  label="Secteur d'activité"
  tip="Cliquez sur 'Autre...' pour ajouter un nouveau secteur"
  ...
/>
```

## ✅ Bonnes Pratiques

1. **Diviser en étapes logiques** : Groupez les champs liés ensemble
2. **Validation par étape** : Validez chaque étape avant de passer à la suivante
3. **Tips utiles** : Ajoutez des conseils pour guider l'utilisateur
4. **Étapes optionnelles** : Marquez les étapes non essentielles comme optionnelles
5. **Sauvegarde automatique** : Pensez à sauvegarder automatiquement les données

## 🔄 Conversion d'un Formulaire Existant

1. Identifier les sections actuelles
2. Convertir chaque section en une ou plusieurs étapes
3. Utiliser FormStepBuilder pour construire les étapes
4. Remplacer le formulaire existant par MultiStepForm
5. Tester la navigation et la validation

## 📚 Exemples

Voir :
- `src/pages/depenses/DepenseFormPage.jsx` - Exemple complet
- `src/pages/programmes/ProgrammeForm.jsx` - À convertir (exemple actuel)

