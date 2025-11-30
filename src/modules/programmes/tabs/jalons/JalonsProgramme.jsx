import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { jalonsService } from '@/services/jalons.service'
import { programmesService } from '@/services/programmes.service'
import { Timeline } from '@/components/common/Timeline'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { toast } from '@/components/common/Toast'
import { logger } from '@/utils/logger'
import './JalonsProgramme.css'

export default function JalonsProgramme() {
  const [searchParams] = useSearchParams()
  const programmeIdFromUrl = searchParams.get('programme_id')
  
  const [jalons, setJalons] = useState([])
  const [programmes, setProgrammes] = useState([])
  const [selectedProgramme, setSelectedProgramme] = useState(programmeIdFromUrl || '')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [selectedProgramme])

  const loadData = async () => {
    setLoading(true)
    try {
      // Charger programmes pour le filtre
      const progResult = await programmesService.getAll()
      if (progResult.error) {
        logger.error('JALONS_PROGRAMME', 'Erreur chargement programmes', progResult.error)
      } else {
        setProgrammes(progResult.data || [])
      }

      // Charger jalons si programme sélectionné
      if (selectedProgramme) {
        const jalonsResult = await jalonsService.getByProgramme(selectedProgramme)
        if (jalonsResult.error) {
          logger.error('JALONS_PROGRAMME', 'Erreur chargement jalons', jalonsResult.error)
          toast.error('Erreur lors du chargement des jalons')
        } else {
          setJalons(jalonsResult.data || [])
        }
      } else {
        setJalons([])
      }
    } catch (error) {
      logger.error('JALONS_PROGRAMME', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  return (
    <div className="jalons-programme">
      <div className="jalons-header">
        <h2>Jalons par Programme</h2>
        <div className="jalons-filters">
          <Select
            label="Sélectionner un programme"
            value={selectedProgramme}
            onChange={(e) => setSelectedProgramme(e.target.value)}
            options={[
              { value: '', label: '-- Sélectionner un programme --' },
              ...(programmes || []).map(p => ({ value: p.id, label: p.nom }))
            ]}
          />
          {selectedProgramme && (
            <Button variant="primary" onClick={() => {/* TODO: Ouvrir modal création jalon */}}>
              <Icon name="Plus" size={16} />
              Ajouter un jalon
            </Button>
          )}
        </div>
      </div>

      {!selectedProgramme ? (
        <EmptyState 
          icon="Calendar" 
          title="Sélectionner un programme" 
          message="Veuillez sélectionner un programme pour voir ses jalons" 
        />
      ) : jalons.length === 0 ? (
        <EmptyState 
          icon="Calendar" 
          title="Aucun jalon" 
          message="Ce programme n'a pas encore de jalons. Cliquez sur 'Ajouter un jalon' pour en créer." 
        />
      ) : (
        <div className="jalons-content">
          <Timeline jalons={jalons} />
        </div>
      )}
    </div>
  )
}

