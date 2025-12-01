import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { candidaturesService } from '@/services/candidatures.service'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { Button } from '@/components/common/Button'
import { toast } from '@/components/common/Toast'
import { logger } from '@/utils/logger'
import { formatDate } from '@/utils/format'
import './CandidatsPipeline.css'

export default function CandidatsPipeline() {
  const navigate = useNavigate()
  const [candidats, setCandidats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCandidats()
  }, [])

  const loadCandidats = async () => {
    setLoading(true)
    try {
      const { data, error } = await candidaturesService.getAll()
      if (error) {
        logger.error('CANDIDATS_PIPELINE', 'Erreur chargement candidats', error)
        toast.error('Erreur lors du chargement des candidats')
        return
      }
      setCandidats(data || [])
      logger.debug('CANDIDATS_PIPELINE', `${data?.length || 0} candidats chargés`)
    } catch (error) {
      logger.error('CANDIDATS_PIPELINE', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  // Grouper les candidats par statut
  const columns = useMemo(() => {
    const grouped = {
      'en-attente': [],
      'en-evaluation': [],
      'eligible': [],
      'accepte': [],
      'refuse': []
    }

    candidats.forEach(candidat => {
      const statut = candidat.statut_global?.toLowerCase() || candidat.statut_eligibilite?.toLowerCase() || 'en-attente'
      
      if (statut.includes('attente') || statut === 'en_attente') {
        grouped['en-attente'].push(candidat)
      } else if (statut.includes('evaluation') || statut === 'en_evaluation') {
        grouped['en-evaluation'].push(candidat)
      } else if (statut.includes('eligible') || statut === 'eligible') {
        grouped['eligible'].push(candidat)
      } else if (statut.includes('accepte') || statut === 'accepte' || statut === 'accepté') {
        grouped['accepte'].push(candidat)
      } else if (statut.includes('refuse') || statut === 'refuse' || statut === 'refusé') {
        grouped['refuse'].push(candidat)
      } else {
        grouped['en-attente'].push(candidat)
      }
    })

    return [
      { 
        id: 'en-attente', 
        title: 'En attente', 
        items: grouped['en-attente'],
        color: '#f59e0b'
      },
      { 
        id: 'en-evaluation', 
        title: 'En évaluation', 
        items: grouped['en-evaluation'],
        color: '#3b82f6'
      },
      { 
        id: 'eligible', 
        title: 'Éligible', 
        items: grouped['eligible'],
        color: '#10b981'
      },
      { 
        id: 'accepte', 
        title: 'Accepté', 
        items: grouped['accepte'],
        color: '#059669'
      },
      { 
        id: 'refuse', 
        title: 'Refusé', 
        items: grouped['refuse'],
        color: '#ef4444'
      },
    ]
  }, [candidats])

  const getNomComplet = (candidat) => {
    if (candidat.personne) {
      return `${candidat.personne.prenom || ''} ${candidat.personne.nom || ''}`.trim()
    }
    if (candidat.prenom || candidat.nom) {
      return `${candidat.prenom || ''} ${candidat.nom || ''}`.trim()
    }
    return candidat.raison_sociale || 'Candidat sans nom'
  }

  const totalCandidats = candidats.length

  if (loading) return <LoadingState />

  return (
    <div className="pipeline-kanban">
      <div className="pipeline-header">
        <div>
          <h2>Pipeline des candidats</h2>
          <p className="pipeline-subtitle">
            <strong>{totalCandidats}</strong> candidat(s) au total
          </p>
        </div>
      </div>

      {totalCandidats === 0 ? (
        <EmptyState
          icon="Users"
          title="Aucun candidat"
          message="Aucun candidat n'a été trouvé dans le système"
        />
      ) : (
        <div className="pipeline-columns">
          {columns.map((column) => (
            <div key={column.id} className="pipeline-column">
              <div className="pipeline-column-header" style={{ borderTopColor: column.color }}>
                <h3>{column.title}</h3>
                <span className="pipeline-count">{column.items.length}</span>
              </div>
              <div className="pipeline-items">
                {column.items.length === 0 ? (
                  <div className="pipeline-empty">
                    <Icon name="Inbox" size={32} />
                    <p>Aucun candidat</p>
                  </div>
                ) : (
                  column.items.map((candidat) => (
                    <div 
                      key={candidat.id} 
                      className="pipeline-card"
                      onClick={() => navigate(`/candidatures/${candidat.id}`)}
                    >
                      <div className="pipeline-card-header">
                        <h4>{getNomComplet(candidat)}</h4>
                        {candidat.code && (
                          <span className="pipeline-card-code">{candidat.code}</span>
                        )}
                      </div>
                      <div className="pipeline-card-body">
                        {candidat.appels_candidatures && (
                          <div className="pipeline-card-item">
                            <Icon name="Bell" size={14} />
                            <span>{candidat.appels_candidatures.titre}</span>
                          </div>
                        )}
                        {candidat.projets && (
                          <div className="pipeline-card-item">
                            <Icon name="FolderKanban" size={14} />
                            <span>{candidat.projets.nom}</span>
                          </div>
                        )}
                        {candidat.date_candidature && (
                          <div className="pipeline-card-item">
                            <Icon name="Calendar" size={14} />
                            <span>{formatDate(candidat.date_candidature)}</span>
                          </div>
                        )}
                      </div>
                      <div className="pipeline-card-footer">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/candidatures/${candidat.id}`)
                          }}
                        >
                          <Icon name="Eye" size={14} />
                          Voir
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
