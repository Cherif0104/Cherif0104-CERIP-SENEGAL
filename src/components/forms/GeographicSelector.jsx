import { useState, useEffect } from 'react'
import { geographieService } from '@/services/geographie.service'
import { SelectMulti } from '@/components/common/SelectMulti'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { LoadingState } from '@/components/common/LoadingState'
import { logger } from '@/utils/logger'
import './GeographicSelector.css'

/**
 * GeographicSelector - Composant dégressif pour sélection géographique
 * Pays (Sénégal) → Régions → Départements → Communes → Arrondissements
 * Avec sélection multiple et affichage des sélections
 */
export function GeographicSelector({
  label = 'Localisation géographique',
  value = {
    pays: 'Sénégal',
    regions: [],
    departements: [],
    communes: [],
    arrondissements: [],
  },
  onChange,
  required = false,
  error,
  showPays = true,
  showArrondissements = true,
  tip,
}) {
  const [pays] = useState('Sénégal') // Fixe pour le Sénégal
  const [selectedRegions, setSelectedRegions] = useState(value.regions || [])
  const [selectedDepartements, setSelectedDepartements] = useState(value.departements || [])
  const [selectedCommunes, setSelectedCommunes] = useState(value.communes || [])
  const [selectedArrondissements, setSelectedArrondissements] = useState(value.arrondissements || [])
  
  const [regions, setRegions] = useState([])
  const [departements, setDepartements] = useState([])
  const [communes, setCommunes] = useState([])
  const [arrondissements, setArrondissements] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [loadingDepartements, setLoadingDepartements] = useState(false)
  const [loadingCommunes, setLoadingCommunes] = useState(false)
  const [loadingArrondissements, setLoadingArrondissements] = useState(false)
  
  const [showSelected, setShowSelected] = useState(true)

  // Charger les régions au montage
  useEffect(() => {
    loadRegions()
  }, [])

  // Charger les départements quand les régions changent
  useEffect(() => {
    if (selectedRegions.length > 0) {
      loadDepartements(selectedRegions)
    } else {
      setDepartements([])
      setSelectedDepartements([])
      setCommunes([])
      setSelectedCommunes([])
      setArrondissements([])
      setSelectedArrondissements([])
    }
  }, [selectedRegions])

  // Charger les communes quand les départements changent
  useEffect(() => {
    if (selectedDepartements.length > 0) {
      loadCommunes(selectedDepartements)
    } else {
      setCommunes([])
      setSelectedCommunes([])
      setArrondissements([])
      setSelectedArrondissements([])
    }
  }, [selectedDepartements])

  // Charger les arrondissements quand les communes changent
  useEffect(() => {
    if (showArrondissements && selectedCommunes.length > 0) {
      loadArrondissements(selectedCommunes)
    } else {
      setArrondissements([])
      setSelectedArrondissements([])
    }
  }, [selectedCommunes, showArrondissements])

  // Notifier le parent des changements
  useEffect(() => {
    if (onChange) {
      onChange({
        pays,
        regions: selectedRegions,
        departements: selectedDepartements,
        communes: selectedCommunes,
        arrondissements: selectedArrondissements,
      })
    }
  }, [selectedRegions, selectedDepartements, selectedCommunes, selectedArrondissements])

  const loadRegions = async () => {
    setLoading(true)
    try {
      const { data, error } = await geographieService.getRegions()
      if (error) throw error
      setRegions(data || [])
      
      // Si on a des régions dans value, les sélectionner
      if (value.regions && value.regions.length > 0) {
        setSelectedRegions(value.regions)
      }
    } catch (error) {
      logger.error('GEOGRAPHIC_SELECTOR', 'Erreur chargement régions', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDepartements = async (regionIds) => {
    setLoadingDepartements(true)
    try {
      // Charger les départements pour toutes les régions sélectionnées
      const allDepartements = []
      for (const regionId of regionIds) {
        const { data, error } = await geographieService.getDepartements(regionId)
        if (!error && data) {
          allDepartements.push(...data)
        }
      }
      // Dédupliquer
      const uniqueDepartements = Array.from(
        new Map(allDepartements.map(d => [d.value, d])).values()
      )
      setDepartements(uniqueDepartements)
      
      // Si on a des départements dans value, les sélectionner (si compatibles)
      if (value.departements && value.departements.length > 0) {
        const validDepartements = value.departements.filter(d => 
          uniqueDepartements.some(dd => dd.value === d)
        )
        if (validDepartements.length > 0) {
          setSelectedDepartements(validDepartements)
        }
      }
    } catch (error) {
      logger.error('GEOGRAPHIC_SELECTOR', 'Erreur chargement départements', error)
    } finally {
      setLoadingDepartements(false)
    }
  }

  const loadCommunes = async (departementIds) => {
    setLoadingCommunes(true)
    try {
      // Charger les communes pour tous les départements sélectionnés
      const allCommunes = []
      for (const departementId of departementIds) {
        const { data, error } = await geographieService.getCommunes(departementId)
        if (!error && data) {
          allCommunes.push(...data)
        }
      }
      // Dédupliquer
      const uniqueCommunes = Array.from(
        new Map(allCommunes.map(c => [c.value, c])).values()
      )
      setCommunes(uniqueCommunes)
      
      // Si on a des communes dans value, les sélectionner (si compatibles)
      if (value.communes && value.communes.length > 0) {
        const validCommunes = value.communes.filter(c => 
          uniqueCommunes.some(cc => cc.value === c)
        )
        if (validCommunes.length > 0) {
          setSelectedCommunes(validCommunes)
        }
      }
    } catch (error) {
      logger.error('GEOGRAPHIC_SELECTOR', 'Erreur chargement communes', error)
    } finally {
      setLoadingCommunes(false)
    }
  }

  const loadArrondissements = async (communeIds) => {
    setLoadingArrondissements(true)
    try {
      // Charger les arrondissements pour toutes les communes sélectionnées
      const allArrondissements = []
      for (const communeId of communeIds) {
        const { data, error } = await geographieService.getArrondissements(communeId)
        if (!error && data) {
          allArrondissements.push(...data)
        }
      }
      // Dédupliquer
      const uniqueArrondissements = Array.from(
        new Map(allArrondissements.map(a => [a.value, a])).values()
      )
      setArrondissements(uniqueArrondissements)
      
      // Si on a des arrondissements dans value, les sélectionner (si compatibles)
      if (value.arrondissements && value.arrondissements.length > 0) {
        const validArrondissements = value.arrondissements.filter(a => 
          uniqueArrondissements.some(aa => aa.value === a)
        )
        if (validArrondissements.length > 0) {
          setSelectedArrondissements(validArrondissements)
        }
      }
    } catch (error) {
      logger.error('GEOGRAPHIC_SELECTOR', 'Erreur chargement arrondissements', error)
      // Pas d'erreur si la table n'existe pas
      setArrondissements([])
    } finally {
      setLoadingArrondissements(false)
    }
  }

  const getSelectedLabel = (id, options) => {
    const option = options.find(o => o.value === id)
    return option?.label || id
  }

  const removeSelection = (type, id) => {
    if (type === 'region') {
      const newRegions = selectedRegions.filter(r => r !== id)
      setSelectedRegions(newRegions)
      // Réinitialiser les niveaux inférieurs
      setSelectedDepartements([])
      setSelectedCommunes([])
      setSelectedArrondissements([])
    } else if (type === 'departement') {
      const newDepartements = selectedDepartements.filter(d => d !== id)
      setSelectedDepartements(newDepartements)
      // Réinitialiser les niveaux inférieurs
      setSelectedCommunes([])
      setSelectedArrondissements([])
    } else if (type === 'commune') {
      const newCommunes = selectedCommunes.filter(c => c !== id)
      setSelectedCommunes(newCommunes)
      // Réinitialiser les niveaux inférieurs
      setSelectedArrondissements([])
    } else if (type === 'arrondissement') {
      setSelectedArrondissements(selectedArrondissements.filter(a => a !== id))
    }
  }

  const clearAll = () => {
    setSelectedRegions([])
    setSelectedDepartements([])
    setSelectedCommunes([])
    setSelectedArrondissements([])
  }

  if (loading) {
    return <LoadingState message="Chargement des données géographiques..." />
  }

  const totalSelections = selectedRegions.length + selectedDepartements.length + 
                         selectedCommunes.length + selectedArrondissements.length

  return (
    <div className={`geographic-selector ${error ? 'geographic-selector-error' : ''}`}>
      <div className="geographic-selector-header">
        <label className="geographic-selector-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
        {tip && (
          <div className="geographic-selector-tip">
            <Icon name="Info" size={16} />
            <span>{tip}</span>
          </div>
        )}
      </div>

      {/* Pays (fixe) */}
      {showPays && (
        <div className="geographic-level">
          <div className="geographic-level-label">
            <Icon name="Globe" size={16} />
            <span>Pays</span>
          </div>
          <div className="geographic-level-value">{pays}</div>
        </div>
      )}

      {/* Régions */}
      <div className="geographic-level">
        <div className="geographic-level-label">
          <Icon name="MapPin" size={16} />
          <span>Régions {selectedRegions.length > 0 && `(${selectedRegions.length})`}</span>
        </div>
        <SelectMulti
          options={regions}
          selectedValues={selectedRegions}
          onChange={(values) => {
            setSelectedRegions(values)
            // Réinitialiser les niveaux inférieurs si on désélectionne
            if (values.length === 0) {
              setSelectedDepartements([])
              setSelectedCommunes([])
              setSelectedArrondissements([])
            }
          }}
          placeholder="Sélectionner les régions..."
        />
        {selectedRegions.length > 0 && showSelected && (
          <div className="selected-items">
            {selectedRegions.map(regionId => (
              <span key={regionId} className="selected-item">
                {getSelectedLabel(regionId, regions)}
                <button
                  type="button"
                  onClick={() => removeSelection('region', regionId)}
                  className="remove-item"
                  title="Retirer"
                >
                  <Icon name="X" size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Départements */}
      {selectedRegions.length > 0 && (
        <div className="geographic-level">
          <div className="geographic-level-label">
            <Icon name="Map" size={16} />
            <span>
              Départements {selectedDepartements.length > 0 && `(${selectedDepartements.length})`}
              {loadingDepartements && <span className="loading-text">Chargement...</span>}
            </span>
          </div>
          <SelectMulti
            options={departements}
            selectedValues={selectedDepartements}
            onChange={(values) => {
              setSelectedDepartements(values)
              if (values.length === 0) {
                setSelectedCommunes([])
                setSelectedArrondissements([])
              }
            }}
            placeholder="Sélectionner les départements..."
            disabled={loadingDepartements}
          />
          {selectedDepartements.length > 0 && showSelected && (
            <div className="selected-items">
              {selectedDepartements.map(depId => (
                <span key={depId} className="selected-item">
                  {getSelectedLabel(depId, departements)}
                  <button
                    type="button"
                    onClick={() => removeSelection('departement', depId)}
                    className="remove-item"
                    title="Retirer"
                  >
                    <Icon name="X" size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Communes */}
      {selectedDepartements.length > 0 && (
        <div className="geographic-level">
          <div className="geographic-level-label">
            <Icon name="Building2" size={16} />
            <span>
              Communes {selectedCommunes.length > 0 && `(${selectedCommunes.length})`}
              {loadingCommunes && <span className="loading-text">Chargement...</span>}
            </span>
          </div>
          <SelectMulti
            options={communes}
            selectedValues={selectedCommunes}
            onChange={(values) => {
              setSelectedCommunes(values)
              if (values.length === 0) {
                setSelectedArrondissements([])
              }
            }}
            placeholder="Sélectionner les communes..."
            disabled={loadingCommunes}
          />
          {selectedCommunes.length > 0 && showSelected && (
            <div className="selected-items">
              {selectedCommunes.map(communeId => (
                <span key={communeId} className="selected-item">
                  {getSelectedLabel(communeId, communes)}
                  <button
                    type="button"
                    onClick={() => removeSelection('commune', communeId)}
                    className="remove-item"
                    title="Retirer"
                  >
                    <Icon name="X" size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Arrondissements */}
      {showArrondissements && selectedCommunes.length > 0 && (
        <div className="geographic-level">
          <div className="geographic-level-label">
            <Icon name="Home" size={16} />
            <span>
              Arrondissements {selectedArrondissements.length > 0 && `(${selectedArrondissements.length})`}
              {loadingArrondissements && <span className="loading-text">Chargement...</span>}
            </span>
          </div>
          <SelectMulti
            options={arrondissements}
            selectedValues={selectedArrondissements}
            onChange={(values) => setSelectedArrondissements(values)}
            placeholder="Sélectionner les arrondissements..."
            disabled={loadingArrondissements || arrondissements.length === 0}
          />
          {selectedArrondissements.length > 0 && showSelected && (
            <div className="selected-items">
              {selectedArrondissements.map(arrId => (
                <span key={arrId} className="selected-item">
                  {getSelectedLabel(arrId, arrondissements)}
                  <button
                    type="button"
                    onClick={() => removeSelection('arrondissement', arrId)}
                    className="remove-item"
                    title="Retirer"
                  >
                    <Icon name="X" size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bouton pour réinitialiser */}
      {totalSelections > 0 && (
        <div className="geographic-actions">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearAll}
          >
            <Icon name="X" size={14} />
            Tout réinitialiser
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowSelected(!showSelected)}
          >
            <Icon name={showSelected ? 'EyeOff' : 'Eye'} size={14} />
            {showSelected ? 'Masquer' : 'Afficher'} les sélections
          </Button>
        </div>
      )}

      {error && (
        <span className="geographic-selector-error-message">{error}</span>
      )}
    </div>
  )
}

