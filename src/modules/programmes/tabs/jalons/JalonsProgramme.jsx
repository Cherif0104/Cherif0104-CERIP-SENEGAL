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
import { KPIDonut } from '@/components/modules/KPIDonut'
import { DonutChart } from '@/components/modules/DonutChart'
import { toast } from '@/components/common/Toast'
import { logger } from '@/utils/logger'
import { useNavigate } from 'react-router-dom'
import './JalonsProgramme.css'

/**
 * Composant de gestion des jalons pour un programme spécifique
 * @param {string} programmeId - ID du programme (optionnel, si non fourni permet de sélectionner)
 */
export default function JalonsProgramme({ programmeId: programmeIdProp = null }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const programmeIdFromUrl = searchParams.get('programme_id')
  const programmeId = programmeIdProp || programmeIdFromUrl

  const handleJalonClick = (jalon) => {
    navigate(`/programmes/${jalon.programme_id}/jalons/${jalon.id}`)
  }
  
  const [jalons, setJalons] = useState([])
  const [programmes, setProgrammes] = useState([])
  const [selectedProgramme, setSelectedProgramme] = useState(programmeId || '')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (programmeId) {
      setSelectedProgramme(programmeId)
    }
    loadData()
  }, [programmeId, selectedProgramme])

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

  // Calculer les statistiques de jalons
  const jalonStats = {
    total: jalons.length,
    termines: jalons.filter(j => j.statut === 'TERMINE' || j.statut === 'VALIDE').length,
    enCours: jalons.filter(j => j.statut === 'EN_COURS' || j.statut === 'EN_ATTENTE').length,
    enRetard: jalons.filter(j => {
      if (j.statut === 'TERMINE' || j.statut === 'VALIDE') return false
      if (!j.date_prevue) return false
      return new Date(j.date_prevue) < new Date()
    }).length,
  }

  const repartitionJalons = [
    { label: 'Terminés', value: jalonStats.termines, color: '#10b981' },
    { label: 'En cours', value: jalonStats.enCours, color: '#3b82f6' },
    { label: 'En retard', value: jalonStats.enRetard, color: '#ef4444' },
  ].filter(item => item.value > 0)

  return (
    <div className="jalons-programme">
      {/* Header */}
      <div className="jalons-header">
        <div>
          <h2>{programmeId ? 'Jalons du Programme' : 'Jalons par Programme'}</h2>
          <p className="jalons-subtitle">
            Suivi des jalons et milestones du programme
          </p>
        </div>
        <div className="jalons-header-actions">
          {!programmeId && (
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
            </div>
          )}
          {selectedProgramme && (
            <Button variant="primary" onClick={() => {/* TODO: Ouvrir modal création jalon */}}>
              <Icon name="Plus" size={16} />
              Ajouter un jalon
            </Button>
          )}
        </div>
      </div>

      {!selectedProgramme && !programmeId ? (
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
        <>
          {/* KPIs Section */}
          {jalonStats.total > 0 && (
            <div className="jalons-stats">
              <KPIDonut
                title="Total Jalons"
                value={jalonStats.total}
                total={jalonStats.total}
                label="Jalons"
                variant="primary"
              />
              <KPIDonut
                title="Terminés"
                value={jalonStats.termines}
                total={jalonStats.total}
                label="Terminés"
                variant="success"
                subtitle={`${jalonStats.total > 0 ? ((jalonStats.termines / jalonStats.total) * 100).toFixed(1) : 0}% du total`}
              />
              {jalonStats.enCours > 0 && (
                <KPIDonut
                  title="En cours"
                  value={jalonStats.enCours}
                  total={jalonStats.total}
                  label="En cours"
                  variant="primary"
                  subtitle={`${jalonStats.total > 0 ? ((jalonStats.enCours / jalonStats.total) * 100).toFixed(1) : 0}% du total`}
                />
              )}
              {jalonStats.enRetard > 0 && (
                <KPIDonut
                  title="En retard"
                  value={jalonStats.enRetard}
                  total={jalonStats.total}
                  label="Retard"
                  variant="danger"
                  subtitle={`${jalonStats.total > 0 ? ((jalonStats.enRetard / jalonStats.total) * 100).toFixed(1) : 0}% du total`}
                />
              )}
            </div>
          )}

          {/* Charts Section */}
          {repartitionJalons.length > 0 && (
            <div className="jalons-charts">
              <DonutChart
                title="Répartition par statut"
                data={repartitionJalons}
              />
            </div>
          )}

          {/* Timeline */}
          <div className="jalons-content">
            <Timeline 
              jalons={jalons} 
              onJalonClick={handleJalonClick}
            />
          </div>
        </>
      )}
    </div>
  )
}

