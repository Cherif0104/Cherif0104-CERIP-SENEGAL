import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { projetsJalonsService } from '@/services/projets-jalons.service'
import { projetsService } from '@/services/projets.service'
import { Timeline } from '@/components/common/Timeline'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { toast } from '@/components/common/Toast'
import { logger } from '@/utils/logger'
import './JalonsProjet.css'

export default function JalonsProjet() {
  const [searchParams] = useSearchParams()
  const projetIdFromUrl = searchParams.get('projet_id')
  
  const [jalons, setJalons] = useState([])
  const [projets, setProjets] = useState([])
  const [selectedProjet, setSelectedProjet] = useState(projetIdFromUrl || '')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [selectedProjet])

  const loadData = async () => {
    setLoading(true)
    try {
      // Charger projets pour le filtre
      const projResult = await projetsService.getAll()
      if (projResult.error) {
        logger.error('JALONS_PROJET', 'Erreur chargement projets', projResult.error)
      } else {
        setProjets(projResult.data || [])
      }

      // Charger jalons si projet sélectionné
      if (selectedProjet) {
        const jalonsResult = await projetsJalonsService.getByProjet(selectedProjet)
        if (jalonsResult.error) {
          logger.error('JALONS_PROJET', 'Erreur chargement jalons', jalonsResult.error)
          toast.error('Erreur lors du chargement des jalons')
        } else {
          setJalons(jalonsResult.data || [])
        }
      } else {
        setJalons([])
      }
    } catch (error) {
      logger.error('JALONS_PROJET', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  return (
    <div className="jalons-projet">
      <div className="jalons-header">
        <h2>Jalons par Projet</h2>
        <div className="jalons-filters">
          <Select
            label="Sélectionner un projet"
            value={selectedProjet}
            onChange={(e) => setSelectedProjet(e.target.value)}
            options={[
              { value: '', label: '-- Sélectionner un projet --' },
              ...(projets || []).map(p => ({ value: p.id, label: p.nom }))
            ]}
          />
          {selectedProjet && (
            <Button variant="primary" onClick={() => {/* TODO: Ouvrir modal création jalon */}}>
              <Icon name="Plus" size={16} />
              Ajouter un jalon
            </Button>
          )}
        </div>
      </div>

      {!selectedProjet ? (
        <EmptyState 
          icon="Calendar" 
          title="Sélectionner un projet" 
          message="Veuillez sélectionner un projet pour voir ses jalons (via son programme)" 
        />
      ) : jalons.length === 0 ? (
        <EmptyState 
          icon="Calendar" 
          title="Aucun jalon" 
          message="Ce projet n'a pas encore de jalons. Les jalons sont gérés au niveau du programme associé." 
        />
      ) : (
        <div className="jalons-content">
          <Timeline jalons={jalons} />
        </div>
      )}
    </div>
  )
}

