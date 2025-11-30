import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { competencesService } from '@/services/competences.service'
import { employesService } from '@/services/employes.service'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './CompetenceDetail.css'

export default function CompetenceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [competence, setCompetence] = useState(null)
  const [employes, setEmployes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => {
    loadCompetence()
    loadEmployes()
  }, [id])

  const loadCompetence = async () => {
    setLoading(true)
    try {
      const result = await competencesService.getById(id)
      if (result.error) {
        logger.error('COMPETENCE_DETAIL', 'Erreur chargement compétence', result.error)
        return
      }
      setCompetence(result.data)
      logger.debug('COMPETENCE_DETAIL', 'Compétence chargée', { id, nom: result.data?.nom })
    } catch (error) {
      logger.error('COMPETENCE_DETAIL', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  const loadEmployes = async () => {
    try {
      const result = await competencesService.getByEmploye(id)
      // Note: getByEmploye retourne les compétences d'un employé, pas les employés d'une compétence
      // Il faudrait une méthode getEmployesByCompetence dans le service
      // Pour l'instant, on affichera un message
    } catch (error) {
      logger.error('COMPETENCE_DETAIL', 'Erreur chargement employés', error)
    }
  }

  if (loading) return <LoadingState />

  if (!competence) {
    return (
      <div className="competence-detail-error">
        <h2>Compétence non trouvée</h2>
        <Button onClick={() => navigate('/rh?tab=competences')}>Retour à la liste</Button>
      </div>
    )
  }

  return (
    <div className="competence-detail">
      <div className="competence-detail-header">
        <Button variant="secondary" onClick={() => navigate('/rh?tab=competences')}>
          <Icon name="ArrowLeft" size={16} />
          Retour
        </Button>
        <div className="competence-detail-title">
          <h1>{competence.nom}</h1>
          <span className="competence-detail-code">Code: {competence.code}</span>
        </div>
        <Button variant="primary" onClick={() => navigate(`/rh/competences/${id}/edit`)}>
          <Icon name="Edit" size={16} />
          Modifier
        </Button>
      </div>

      <div className="competence-detail-tabs">
        <button
          className={`competence-detail-tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Détails
        </button>
        <button
          className={`competence-detail-tab ${activeTab === 'employes' ? 'active' : ''}`}
          onClick={() => setActiveTab('employes')}
        >
          Employés
        </button>
      </div>

      <div className="competence-detail-content">
        {activeTab === 'details' && (
          <div className="competence-detail-info">
            {/* Section Informations générales */}
            <div className="competence-detail-section">
              <h2>Informations générales</h2>
              <div className="competence-detail-grid">
                <div className="competence-detail-field">
                  <label>Code</label>
                  <span>{competence.code || '-'}</span>
                </div>
                <div className="competence-detail-field">
                  <label>Nom</label>
                  <span>{competence.nom || '-'}</span>
                </div>
                <div className="competence-detail-field">
                  <label>Catégorie</label>
                  <span>{competence.categorie || '-'}</span>
                </div>
                <div className="competence-detail-field">
                  <label>Niveau maximum</label>
                  <span className="niveau-badge">Niveau {competence.niveau_max || 5}/10</span>
                </div>
                <div className="competence-detail-field">
                  <label>Statut</label>
                  <span>{competence.actif ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              {competence.description && (
                <div className="competence-detail-field full-width">
                  <label>Description</label>
                  <p className="competence-description">{competence.description}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'employes' && (
          <div className="competence-detail-employes">
            <h2>Employés ayant cette compétence</h2>
            <div className="empty-state">
              <Icon name="Info" size={48} />
              <p>La fonctionnalité de liste des employés par compétence sera disponible prochainement.</p>
              <p className="note-info">Pour voir les compétences d'un employé, consultez sa page de détail.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

