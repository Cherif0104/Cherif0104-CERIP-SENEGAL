import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthCandidat } from '@/hooks/useAuthCandidat'
import { candidaturesService } from '@/services/candidatures.service'
import { DataTable } from '@/components/common/DataTable'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './MesCandidatures.css'

export default function MesCandidatures() {
  const { profile } = useAuthCandidat()
  const navigate = useNavigate()
  const [candidatures, setCandidatures] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.candidat?.id) {
      loadCandidatures()
    }
  }, [profile])

  const loadCandidatures = async () => {
    setLoading(true)
    try {
      // Si on a un candidat_id, récupérer directement
      if (profile.candidat?.id) {
        const { data, error } = await candidaturesService.getById(profile.candidat.id)
        if (error) {
          logger.error('MES_CANDIDATURES', 'Erreur chargement candidature', error)
          // Récupérer toutes et filtrer par email
          const { data: allData } = await candidaturesService.getAll()
          const filtered = (allData || []).filter((c) => c.email === profile.candidat.email)
          setCandidatures(filtered)
        } else {
          setCandidatures(data ? [data] : [])
        }
      } else {
        // Sinon, récupérer toutes et filtrer par email
        const { data, error } = await candidaturesService.getAll()
        if (error) {
          logger.error('MES_CANDIDATURES', 'Erreur chargement candidatures', error)
          return
        }
        const filtered = (data || []).filter((c) => c.email === profile?.email || c.email === profile?.candidat?.email)
        setCandidatures(filtered)
      }

      logger.debug('MES_CANDIDATURES', `Candidatures chargées`)
    } catch (error) {
      logger.error('MES_CANDIDATURES', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatutBadgeClass = (statut) => {
    const statutLower = statut?.toLowerCase().replace(/\s+/g, '-') || ''
    return `statut-badge statut-${statutLower}`
  }

  const columns = [
    {
      key: 'appel_id',
      label: 'Appel',
      render: (_, row) => {
        // TODO: Récupérer le titre de l'appel depuis la relation
        return row.appels_candidatures?.titre || `Appel ${row.appel_id?.substring(0, 8)}...` || '-'
      },
    },
    {
      key: 'statut_eligibilite',
      label: 'Statut',
      render: (value) => (
        <span className={getStatutBadgeClass(value)}>{value || 'EN_ATTENTE_ÉLIGIBILITÉ'}</span>
      ),
    },
    {
      key: 'date_inscription',
      label: 'Date de candidature',
      render: (value) =>
        value ? new Date(value).toLocaleDateString('fr-FR', { dateStyle: 'long' }) : '-',
    },
    {
      key: 'updated_at',
      label: 'Dernière mise à jour',
      render: (value) => (value ? new Date(value).toLocaleDateString('fr-FR') : '-'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => navigate(`/candidat/candidature/${row.id}`)}
          className="action-button"
          title="Voir détails"
        >
          <Icon name="Eye" size={16} />
          Voir
        </button>
      ),
    },
  ]

  if (loading) return <LoadingState />

  return (
    <div className="mes-candidatures">
      <div className="page-header">
        <h1>Mes Candidatures</h1>
        <p>Suivez l'évolution de vos candidatures</p>
      </div>

      {candidatures.length === 0 ? (
        <EmptyState
          icon="FileText"
          title="Aucune candidature"
          message="Vous n'avez pas encore de candidatures. Consultez les appels à candidatures ouverts pour postuler."
          action={
            <button
              onClick={() => navigate('/appels')}
              className="btn-primary"
            >
              Voir les appels ouverts
            </button>
          }
        />
      ) : (
        <div className="candidatures-content">
          <DataTable columns={columns} data={candidatures} />
        </div>
      )}
    </div>
  )
}

