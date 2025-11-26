import { useState, useEffect } from 'react'
import { referentielsService } from '../../services/referentiels.service'
import { COMMUNES_SENEGAL } from '../../data/communesSenegal'
import SelectWithCreate from './SelectWithCreate'
import Icon from './Icon'
import './GeographicCascade.css'

// Régions du Sénégal (liste de référence)
const SENEGAL_REGIONS = [
  'Dakar', 'Thiès', 'Diourbel', 'Saint-Louis', 'Louga', 
  'Kaolack', 'Fatick', 'Kaffrine', 'Tambacounda', 'Kédougou',
  'Kolda', 'Sédhiou', 'Ziguinchor', 'Matam'
]

// Mapping régions → départements (structure simplifiée)
// Tu peux enrichir cette liste ou la charger depuis la base
const REGIONS_DEPARTEMENTS = {
  'Dakar': ['Dakar', 'Pikine', 'Rufisque', 'Guédiawaye'],
  'Thiès': ['Thiès', 'Mbour', 'Tivaouane'],
  'Diourbel': ['Diourbel', 'Bambey', 'Mbacké'],
  'Saint-Louis': ['Saint-Louis', 'Dagana', 'Podor'],
  'Louga': ['Louga', 'Kébémer', 'Linguère'],
  'Kaolack': ['Kaolack', 'Guinguinéo', 'Nioro du Rip'],
  'Fatick': ['Fatick', 'Foundiougne', 'Gossas'],
  'Kaffrine': ['Kaffrine', 'Birkilane', 'Koungheul', 'Malem Hodar'],
  'Tambacounda': ['Tambacounda', 'Bakel', 'Goudiry', 'Koumpentoum'],
  'Kédougou': ['Kédougou', 'Salémata', 'Saraya'],
  'Kolda': ['Kolda', 'Médina Yoro Foulah', 'Vélingara'],
  'Sédhiou': ['Sédhiou', 'Bounkiling', 'Goudomp'],
  'Ziguinchor': ['Ziguinchor', 'Bignona', 'Oussouye'],
  'Matam': ['Matam', 'Kanel', 'Ranérou Ferlo']
}

export default function GeographicCascade({
  regions = [],
  departements = [],
  communes = [],
  onRegionsChange,
  onDepartementsChange,
  onCommunesChange
}) {
  const [regionsList, setRegionsList] = useState([])
  const [departementsList, setDepartementsList] = useState([])
  const [communesList, setCommunesList] = useState([])
  const [selectedRegions, setSelectedRegions] = useState([])
  const [confirmedRegions, setConfirmedRegions] = useState([])
  const [loading, setLoading] = useState(false)

  // Charger les régions du Sénégal au montage
  useEffect(() => {
    loadRegions()
  }, [])

  // Initialiser avec les régions déjà sélectionnées
  useEffect(() => {
    if (Array.isArray(regions) && regions.length > 0) {
      setSelectedRegions(regions)
      setConfirmedRegions(regions)
      loadDepartementsForRegions(regions)
      loadCommunesForRegions(regions)
    }
  }, [regions])

  const loadRegions = async () => {
    setLoading(true)
    try {
      const { data } = await referentielsService.getByType('REGION')
      let filtered = data || []
      
      const existingLabels = filtered.map(r => r.label)
      SENEGAL_REGIONS.forEach(reg => {
        if (!existingLabels.includes(reg)) {
          filtered.push({ 
            code: reg.toUpperCase().replace(/\s+/g, '_'), 
            label: reg 
          })
        }
      })
      
      setRegionsList(filtered)
    } catch (error) {
      console.error('Error loading regions:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDepartementsForRegions = async (regionsSelected) => {
    if (!regionsSelected || regionsSelected.length === 0) {
      setDepartementsList([])
      return
    }

    setLoading(true)
    try {
      // Charger tous les départements depuis le référentiel
      const { data } = await referentielsService.getByType('DEPARTEMENT')
      let allDepartements = data || []
      
      // Filtrer par régions sélectionnées
      // Si le référentiel a un champ 'region', on filtre directement
      // Sinon, on utilise le mapping local
      let filtered = []
      
      if (allDepartements.length > 0 && allDepartements[0].region) {
        // Filtrer par champ region dans le référentiel
        filtered = allDepartements.filter(dept => 
          regionsSelected.includes(dept.region)
        )
      } else {
        // Utiliser le mapping local
        const deptNames = new Set()
        regionsSelected.forEach(region => {
          const depts = REGIONS_DEPARTEMENTS[region] || []
          depts.forEach(dept => deptNames.add(dept))
        })
        
        filtered = allDepartements.filter(dept => 
          deptNames.has(dept.label) || deptNames.has(dept.code)
        )
        
        // Ajouter les départements du mapping qui ne sont pas dans le référentiel
        deptNames.forEach(deptName => {
          if (!filtered.find(d => d.label === deptName || d.code === deptName)) {
            filtered.push({
              code: deptName.toUpperCase().replace(/\s+/g, '_'),
              label: deptName
            })
          }
        })
      }
      
      setDepartementsList(filtered)
      
      // Auto-remplir les départements
      const deptLabels = filtered.map(d => d.label)
      if (onDepartementsChange && deptLabels.length > 0) {
        onDepartementsChange({ 
          target: { 
            name: 'departements', 
            value: deptLabels 
          } 
        })
      }
    } catch (error) {
      console.error('Error loading departements:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCommunesForRegions = async (regionsSelected) => {
    if (!regionsSelected || regionsSelected.length === 0) {
      setCommunesList([])
      return
    }

    setLoading(true)
    try {
      // Charger toutes les communes depuis le référentiel
      const { data } = await referentielsService.getByType('COMMUNE')
      let allCommunes = data || []
      
      // Récupérer les départements des régions sélectionnées
      const deptNames = new Set()
      regionsSelected.forEach(region => {
        const depts = REGIONS_DEPARTEMENTS[region] || []
        depts.forEach(dept => deptNames.add(dept))
      })
      
      // Extraire toutes les communes des départements sélectionnés depuis COMMUNES_SENEGAL
      const communesFromData = new Set()
      deptNames.forEach(deptName => {
        const communes = COMMUNES_SENEGAL[deptName] || []
        communes.forEach(commune => communesFromData.add(commune))
      })
      
      // Filtrer les communes du référentiel par département
      let filtered = []
      
      if (allCommunes.length > 0 && allCommunes[0].departement) {
        filtered = allCommunes.filter(commune => 
          Array.from(deptNames).some(dept => 
            commune.departement === dept || commune.departement?.includes(dept)
          )
        )
      }
      
      // Ajouter les communes du fichier de données qui ne sont pas dans le référentiel
      communesFromData.forEach(communeName => {
        if (!filtered.find(c => c.label === communeName || c.code === communeName)) {
          filtered.push({
            code: communeName.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, ''),
            label: communeName
          })
        }
      })
      
      setCommunesList(filtered)
      
      // Auto-remplir les communes
      const communeLabels = filtered.map(c => c.label)
      if (onCommunesChange && communeLabels.length > 0) {
        onCommunesChange({ 
          target: { 
            name: 'communes', 
            value: communeLabels 
          } 
        })
      }
    } catch (error) {
      console.error('Error loading communes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegionsSelection = (e) => {
    const values = Array.isArray(e.target.value) ? e.target.value : []
    setSelectedRegions(values)
  }

  const handleConfirmRegions = () => {
    if (selectedRegions.length === 0) {
      return
    }
    
    setConfirmedRegions(selectedRegions)
    
    // Notifier le parent
    if (onRegionsChange) {
      onRegionsChange({ 
        target: { 
          name: 'regions', 
          value: selectedRegions 
        } 
      })
    }
    
    // Charger automatiquement départements et communes
    loadDepartementsForRegions(selectedRegions)
    loadCommunesForRegions(selectedRegions)
  }

  return (
    <div className="geographic-cascade">
      <div className="geographic-cascade-header">
        <p className="geographic-cascade-info">
          <strong>Périmètre géographique - Sénégal</strong>
        </p>
        <small>Sélectionnez une ou plusieurs régions, puis confirmez pour charger automatiquement les départements et communes.</small>
      </div>

      <div className="geographic-regions-section">
        <SelectWithCreate
          label="Régions"
          name="regions_temp"
          value={selectedRegions}
          onChange={handleRegionsSelection}
          options={regionsList}
          typeReferentiel="REGION"
          placeholder="Sélectionner une ou plusieurs régions"
          multiple={true}
        />
        
        {selectedRegions.length > 0 && (
          <button
            type="button"
            className="btn btn-primary btn-confirm-regions"
            onClick={handleConfirmRegions}
            disabled={loading}
          >
            <Icon name="Check" size={16} />
            Confirmer la sélection ({selectedRegions.length} région{selectedRegions.length > 1 ? 's' : ''})
          </button>
        )}
        
        {confirmedRegions.length > 0 && (
          <div className="confirmed-regions-badge">
            <Icon name="CheckCircle" size={14} />
            <span>{confirmedRegions.length} région{confirmedRegions.length > 1 ? 's' : ''} confirmée{confirmedRegions.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {confirmedRegions.length > 0 && (
        <>
          <SelectWithCreate
            label="Départements"
            name="departements"
            value={Array.isArray(departements) ? departements : []}
            onChange={onDepartementsChange}
            options={departementsList}
            typeReferentiel="DEPARTEMENT"
            placeholder={`${departementsList.length} département${departementsList.length > 1 ? 's' : ''} disponible${departementsList.length > 1 ? 's' : ''} (pré-sélectionnés)`}
            multiple={true}
          />

          <SelectWithCreate
            label="Communes / Arrondissements"
            name="communes"
            value={Array.isArray(communes) ? communes : []}
            onChange={onCommunesChange}
            options={communesList}
            typeReferentiel="COMMUNE"
            placeholder={`${communesList.length} commune${communesList.length > 1 ? 's' : ''} disponible${communesList.length > 1 ? 's' : ''} (pré-sélectionnées)`}
            multiple={true}
          />
        </>
      )}
    </div>
  )
}

