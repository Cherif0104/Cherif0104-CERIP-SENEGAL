import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { postesService } from '@/services/postes.service'
import { employesService } from '@/services/employes.service'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './PosteDetail.css'

export default function PosteDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [poste, setPoste] = useState(null)
  const [employes, setEmployes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => {
    loadPoste()
    loadEmployes()
  }, [id])

  const loadPoste = async () => {
    setLoading(true)
    try {
      const result = await postesService.getByIdWithCount(id)
      if (result.error) {
        logger.error('POSTE_DETAIL', 'Erreur chargement poste', result.error)
        return
      }
      setPoste(result.data)
      logger.debug('POSTE_DETAIL', 'Poste chargé', { id, titre: result.data?.titre })
    } catch (error) {
      logger.error('POSTE_DETAIL', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  const loadEmployes = async () => {
    try {
      const result = await employesService.getByPoste(id)
      if (!result.error && result.data) {
        setEmployes(result.data)
      }
    } catch (error) {
      logger.error('POSTE_DETAIL', 'Erreur chargement employés', error)
    }
  }

  const formatCurrency = (amount) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) return <LoadingState />

  if (!poste) {
    return (
      <div className="poste-detail-error">
        <h2>Poste non trouvé</h2>
        <Button onClick={() => navigate('/rh?tab=postes')}>Retour à la liste</Button>
      </div>
    )
  }

  return (
    <div className="poste-detail">
      <div className="poste-detail-header">
        <Button variant="secondary" onClick={() => navigate('/rh?tab=postes')}>
          <Icon name="ArrowLeft" size={16} />
          Retour
        </Button>
        <div className="poste-detail-title">
          <h1>{poste.titre}</h1>
          <span className="poste-detail-code">Code: {poste.code}</span>
        </div>
        <Button variant="primary" onClick={() => navigate(`/rh/postes/${id}/edit`)}>
          <Icon name="Edit" size={16} />
          Modifier
        </Button>
      </div>

      <div className="poste-detail-tabs">
        <button
          className={`poste-detail-tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Détails
        </button>
        <button
          className={`poste-detail-tab ${activeTab === 'employes' ? 'active' : ''}`}
          onClick={() => setActiveTab('employes')}
        >
          Employés ({poste.nombre_employes || 0})
        </button>
      </div>

      <div className="poste-detail-content">
        {activeTab === 'details' && (
          <div className="poste-detail-info">
            {/* Section Informations générales */}
            <div className="poste-detail-section">
              <h2>Informations générales</h2>
              <div className="poste-detail-grid">
                <div className="poste-detail-field">
                  <label>Code</label>
                  <span>{poste.code || '-'}</span>
                </div>
                <div className="poste-detail-field">
                  <label>Titre</label>
                  <span>{poste.titre || '-'}</span>
                </div>
                <div className="poste-detail-field">
                  <label>Département</label>
                  <span>{poste.departement || '-'}</span>
                </div>
                <div className="poste-detail-field">
                  <label>Type de contrat</label>
                  <span>{poste.type_contrat || '-'}</span>
                </div>
                <div className="poste-detail-field">
                  <label>Niveau requis</label>
                  <span>{poste.niveau_requis || '-'}</span>
                </div>
                <div className="poste-detail-field">
                  <label>Statut</label>
                  <span className={`statut-badge statut-${poste.statut?.toLowerCase() || 'inconnu'}`}>
                    {poste.statut || '-'}
                  </span>
                </div>
              </div>
              {poste.description && (
                <div className="poste-detail-field full-width">
                  <label>Description</label>
                  <p className="poste-description">{poste.description}</p>
                </div>
              )}
            </div>

            {/* Section Salaire */}
            <div className="poste-detail-section">
              <h2>Salaire</h2>
              <div className="poste-detail-grid">
                <div className="poste-detail-field">
                  <label>Salaire minimum</label>
                  <span>{formatCurrency(poste.salaire_min)}</span>
                </div>
                <div className="poste-detail-field">
                  <label>Salaire maximum</label>
                  <span>{formatCurrency(poste.salaire_max)}</span>
                </div>
              </div>
            </div>

            {/* Section Compétences requises */}
            {poste.competences_requises && poste.competences_requises.length > 0 && (
              <div className="poste-detail-section">
                <h2>Compétences requises</h2>
                <div className="competences-list">
                  {poste.competences_requises.map((compId, index) => (
                    <span key={index} className="competence-tag">
                      {compId}
                    </span>
                  ))}
                </div>
                <p className="note-info">Note: Les noms complets des compétences seront affichés après implémentation de la relation.</p>
              </div>
            )}

            {/* Section Statistiques */}
            <div className="poste-detail-section">
              <h2>Statistiques</h2>
              <div className="poste-detail-grid">
                <div className="poste-detail-field">
                  <label>Nombre d'employés</label>
                  <span className="stat-value">{poste.nombre_employes || 0}</span>
                </div>
                <div className="poste-detail-field">
                  <label>Poste actif</label>
                  <span>{poste.actif ? 'Oui' : 'Non'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'employes' && (
          <div className="poste-detail-employes">
            <h2>Employés ayant ce poste</h2>
            {employes.length > 0 ? (
              <div className="employes-list">
                {employes.map((employe) => (
                  <div key={employe.id} className="employe-item" onClick={() => navigate(`/rh/employes/${employe.id}`)}>
                    <div className="employe-info">
                      <h3>
                        {employe.prenom} {employe.nom}
                      </h3>
                      <span className="employe-matricule">{employe.matricule}</span>
                    </div>
                    <span className={`statut-badge statut-${employe.statut?.toLowerCase() || 'inconnu'}`}>
                      {employe.statut || '-'}
                    </span>
                    <Icon name="ChevronRight" size={20} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Icon name="Users" size={48} />
                <p>Aucun employé n'occupe actuellement ce poste</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

