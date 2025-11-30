import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { employesService } from '@/services/employes.service'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './EmployeDetail.css'

export default function EmployeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [employe, setEmploye] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => {
    loadEmploye()
  }, [id])

  const loadEmploye = async () => {
    setLoading(true)
    try {
      const result = await employesService.getByIdWithRelations(id)
      if (result.error) {
        logger.error('EMPLOYE_DETAIL', 'Erreur chargement employé', result.error)
        return
      }
      setEmploye(result.data)
      logger.debug('EMPLOYE_DETAIL', 'Employé chargé', { id, nom: result.data?.nom })
    } catch (error) {
      logger.error('EMPLOYE_DETAIL', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('fr-FR')
    } catch {
      return dateString
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

  if (!employe) {
    return (
      <div className="employe-detail-error">
        <h2>Employé non trouvé</h2>
        <Button onClick={() => navigate('/rh?tab=employes')}>Retour à la liste</Button>
      </div>
    )
  }

  return (
    <div className="employe-detail">
      <div className="employe-detail-header">
        <Button variant="secondary" onClick={() => navigate('/rh?tab=employes')}>
          <Icon name="ArrowLeft" size={16} />
          Retour
        </Button>
        <div className="employe-detail-title">
          <h1>
            {employe.prenom} {employe.nom}
          </h1>
          <span className="employe-detail-matricule">Matricule: {employe.matricule}</span>
        </div>
        <Button variant="primary" onClick={() => navigate(`/rh/employes/${id}/edit`)}>
          <Icon name="Edit" size={16} />
          Modifier
        </Button>
      </div>

      <div className="employe-detail-tabs">
        <button
          className={`employe-detail-tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Détails
        </button>
        <button
          className={`employe-detail-tab ${activeTab === 'competences' ? 'active' : ''}`}
          onClick={() => setActiveTab('competences')}
        >
          Compétences
        </button>
        <button
          className={`employe-detail-tab ${activeTab === 'evaluations' ? 'active' : ''}`}
          onClick={() => setActiveTab('evaluations')}
        >
          Évaluations
        </button>
      </div>

      <div className="employe-detail-content">
        {activeTab === 'details' && (
          <div className="employe-detail-info">
            {/* Section Informations personnelles */}
            <div className="employe-detail-section">
              <h2>Informations personnelles</h2>
              <div className="employe-detail-grid">
                <div className="employe-detail-field">
                  <label>Matricule</label>
                  <span>{employe.matricule || '-'}</span>
                </div>
                <div className="employe-detail-field">
                  <label>Prénom</label>
                  <span>{employe.prenom || '-'}</span>
                </div>
                <div className="employe-detail-field">
                  <label>Nom</label>
                  <span>{employe.nom || '-'}</span>
                </div>
                <div className="employe-detail-field">
                  <label>Email</label>
                  <span>{employe.email || '-'}</span>
                </div>
                <div className="employe-detail-field">
                  <label>Téléphone</label>
                  <span>{employe.telephone || '-'}</span>
                </div>
                <div className="employe-detail-field">
                  <label>Date de naissance</label>
                  <span>{formatDate(employe.date_naissance)}</span>
                </div>
              </div>
            </div>

            {/* Section Type et contrat */}
            <div className="employe-detail-section">
              <h2>Type et contrat</h2>
              <div className="employe-detail-grid">
                <div className="employe-detail-field">
                  <label>Type d'employé</label>
                  <span>{employe.type_employe || '-'}</span>
                </div>
                <div className="employe-detail-field">
                  <label>Type de contrat</label>
                  <span>
                    {employe.type_contrat || '-'}
                    {employe.est_prestataire && ' (Prestataire)'}
                    {employe.est_lie_projet && ' (Lié à un projet)'}
                    {employe.est_lie_programme && ' (Lié à un programme)'}
                  </span>
                </div>
                <div className="employe-detail-field">
                  <label>Statut</label>
                  <span className={`statut-badge statut-${employe.statut?.toLowerCase() || 'inconnu'}`}>
                    {employe.statut || '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section Poste et salaire */}
            <div className="employe-detail-section">
              <h2>Poste et salaire</h2>
              <div className="employe-detail-grid">
                <div className="employe-detail-field">
                  <label>Poste</label>
                  <span>{employe.poste?.titre || employe.poste?.nom || '-'}</span>
                </div>
                <div className="employe-detail-field">
                  <label>Salaire</label>
                  <span>{formatCurrency(employe.salaire)}</span>
                </div>
                <div className="employe-detail-field">
                  <label>Manager</label>
                  <span>
                    {employe.manager
                      ? `${employe.manager.prenom || ''} ${employe.manager.nom || ''}`.trim() || employe.manager.matricule
                      : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section Dates */}
            <div className="employe-detail-section">
              <h2>Dates</h2>
              <div className="employe-detail-grid">
                <div className="employe-detail-field">
                  <label>Date d'embauche</label>
                  <span>{formatDate(employe.date_embauche)}</span>
                </div>
                {employe.date_fin_contrat && (
                  <div className="employe-detail-field">
                    <label>Date de fin de contrat</label>
                    <span>{formatDate(employe.date_fin_contrat)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Section Liens projet/programme */}
            {(employe.projet_id || employe.programme_id) && (
              <div className="employe-detail-section">
                <h2>Liens projet/programme</h2>
                <div className="employe-detail-grid">
                  {employe.projet_id && (
                    <div className="employe-detail-field">
                      <label>Projet</label>
                      <span>{employe.projet?.nom || employe.projet?.titre || employe.projet_id}</span>
                    </div>
                  )}
                  {employe.programme_id && (
                    <div className="employe-detail-field">
                      <label>Programme</label>
                      <span>{employe.programme?.nom || employe.programme?.titre || employe.programme_id}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Section Adresse */}
            {(employe.adresse || employe.ville || employe.pays) && (
              <div className="employe-detail-section">
                <h2>Adresse</h2>
                <div className="employe-detail-grid">
                  {employe.adresse && (
                    <div className="employe-detail-field">
                      <label>Adresse</label>
                      <span>{employe.adresse}</span>
                    </div>
                  )}
                  {employe.ville && (
                    <div className="employe-detail-field">
                      <label>Ville</label>
                      <span>{employe.ville}</span>
                    </div>
                  )}
                  {employe.pays && (
                    <div className="employe-detail-field">
                      <label>Pays</label>
                      <span>{employe.pays}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'competences' && (
          <div className="employe-detail-competences">
            <h2>Compétences</h2>
            {employe.employes_competences && employe.employes_competences.length > 0 ? (
              <div className="competences-list">
                {employe.employes_competences.map((ec) => (
                  <div key={ec.id} className="competence-item">
                    <div className="competence-header">
                      <h3>{ec.competence?.nom || ec.competence_id}</h3>
                      <span className="competence-niveau">Niveau {ec.niveau}/5</span>
                    </div>
                    {ec.competence?.description && (
                      <p className="competence-description">{ec.competence.description}</p>
                    )}
                    {ec.notes && <p className="competence-notes">{ec.notes}</p>}
                    <div className="competence-meta">
                      <span>Évalué le: {formatDate(ec.date_evaluation)}</span>
                      {ec.evalue_par && <span>Par: {ec.evalue_par}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Icon name="BookOpen" size={48} />
                <p>Aucune compétence enregistrée</p>
                <Button variant="primary" onClick={() => navigate(`/rh/employes/${id}/edit`)}>
                  Ajouter des compétences
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'evaluations' && (
          <div className="employe-detail-evaluations">
            <h2>Évaluations</h2>
            {employe.evaluations && employe.evaluations.length > 0 ? (
              <div className="evaluations-list">
                {employe.evaluations.map((evalItem) => (
                  <div key={evalItem.id} className="evaluation-item">
                    <div className="evaluation-header">
                      <h3>{evalItem.type_evaluation || 'Évaluation'}</h3>
                      <span className="evaluation-date">{formatDate(evalItem.date_evaluation)}</span>
                    </div>
                    {evalItem.note && (
                      <div className="evaluation-note">
                        Note: {evalItem.note}/{evalItem.note_max || 20}
                      </div>
                    )}
                    {evalItem.commentaires && (
                      <p className="evaluation-commentaires">{evalItem.commentaires}</p>
                    )}
                    <div className="evaluation-meta">
                      {evalItem.evalue_par && <span>Évalué par: {evalItem.evalue_par}</span>}
                      {evalItem.statut && <span className={`statut-badge statut-${evalItem.statut.toLowerCase()}`}>{evalItem.statut}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Icon name="FileText" size={48} />
                <p>Aucune évaluation enregistrée</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

