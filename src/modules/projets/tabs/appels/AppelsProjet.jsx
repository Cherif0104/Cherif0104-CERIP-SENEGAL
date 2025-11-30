import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { appelsService } from '@/services/appels.service'
import { projetsService } from '@/services/projets.service'
import { DataTable } from '@/components/common/DataTable'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { Select } from '@/components/common/Select'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import { useNavigate } from 'react-router-dom'
import { formatDate } from '@/utils/format'
import { toast } from '@/components/common/Toast'
import { logger } from '@/utils/logger'
import './AppelsProjet.css'

export default function AppelsProjet() {
  const [searchParams] = useSearchParams()
  const projetIdFromUrl = searchParams.get('projet_id')
  
  const [appels, setAppels] = useState([])
  const [projets, setProjets] = useState([])
  const [selectedProjet, setSelectedProjet] = useState(projetIdFromUrl || '')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [selectedProjet])

  const loadData = async () => {
    setLoading(true)
    try {
      // Charger projets pour le filtre
      const projResult = await projetsService.getAll()
      if (projResult.error) {
        logger.error('APPELS_PROJET', 'Erreur chargement projets', projResult.error)
      } else {
        setProjets(projResult.data || [])
      }

      // Charger appels
      const appelsResult = await appelsService.getAll(selectedProjet || null)
      if (appelsResult.error) {
        logger.error('APPELS_PROJET', 'Erreur chargement appels', appelsResult.error)
        toast.error('Erreur lors du chargement des appels')
      } else {
        setAppels(appelsResult.data || [])
      }
    } catch (error) {
      logger.error('APPELS_PROJET', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'titre', label: 'Titre' },
    { key: 'description', label: 'Description', render: (value) => value ? (value.length > 100 ? value.substring(0, 100) + '...' : value) : '-' },
    { 
      key: 'statut', 
      label: 'Statut', 
      render: (value) => (
        <span className={`statut-badge statut-${value?.toLowerCase().replace(/\s+/g, '-')}`}>
          {value || '-'}
        </span>
      )
    },
    { 
      key: 'date_ouverture', 
      label: 'Date ouverture', 
      render: (value) => value ? formatDate(value) : '-' 
    },
    { 
      key: 'date_fermeture', 
      label: 'Date fermeture', 
      render: (value) => value ? formatDate(value) : '-' 
    },
    { 
      key: 'actions', 
      label: 'Actions', 
      render: (_, row) => (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(`/candidatures/appels/${row.id}`)}
        >
          Voir détails
        </Button>
      )
    },
  ]

  if (loading) return <LoadingState />

  return (
    <div className="appels-projet">
      <div className="appels-header">
        <h2>Appels à Candidatures par Projet</h2>
        <div className="appels-filters">
          <Select
            label="Filtrer par projet"
            value={selectedProjet}
            onChange={(e) => setSelectedProjet(e.target.value)}
            options={[
              { value: '', label: 'Tous les projets' },
              ...(projets || []).map(p => ({ value: p.id, label: p.nom }))
            ]}
          />
          <PermissionGuard permission="candidatures.create">
            <Button variant="primary" onClick={() => navigate(`/candidatures/appels/new${selectedProjet ? `?projet_id=${selectedProjet}` : ''}`)}>
              <Icon name="Plus" size={16} />
              Nouvel appel
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {appels.length === 0 ? (
        <EmptyState
          icon="Bell"
          title="Aucun appel"
          message={selectedProjet ? "Ce projet n'a pas encore d'appels à candidatures" : "Aucun appel à candidatures enregistré"}
        />
      ) : (
        <>
          <div className="appels-info">
            <span>
              {appels.length} appel(s) à candidatures
              {selectedProjet && ' pour ce projet'}
            </span>
          </div>
          <div className="appels-content">
            <DataTable columns={columns} data={appels} />
          </div>
        </>
      )}
    </div>
  )
}

