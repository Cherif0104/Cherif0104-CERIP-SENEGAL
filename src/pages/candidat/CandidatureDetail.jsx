import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { candidaturesService } from '@/services/candidatures.service'
import { supabase } from '@/lib/supabase'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './CandidatureDetail.css'

export default function CandidatureDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [candidature, setCandidature] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCandidature()
  }, [id])

  const loadCandidature = async () => {
    setLoading(true)
    try {
      const { data, error } = await candidaturesService.getById(id)
      if (error) {
        logger.error('CANDIDATURE_DETAIL', 'Erreur chargement candidature', error)
        return
      }
      setCandidature(data)

      // Charger les documents
      const { data: docs } = await supabase
        .from('documents_candidats')
        .select('*')
        .eq('candidat_id', id)

      setDocuments(docs || [])
    } catch (error) {
      logger.error('CANDIDATURE_DETAIL', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatutBadgeClass = (statut) => {
    const statutLower = statut?.toLowerCase().replace(/\s+/g, '-') || ''
    return `statut-badge statut-${statutLower}`
  }

  const downloadDocument = async (doc) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.chemin_fichier)

      if (error) throw error

      const url = window.URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.nom_fichier
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      logger.error('CANDIDATURE_DETAIL', 'Erreur téléchargement document', error)
      alert('Erreur lors du téléchargement du document')
    }
  }

  if (loading) return <LoadingState />

  if (!candidature) {
    return (
      <div className="candidature-detail-error">
        <Icon name="AlertCircle" size={48} />
        <h2>Candidature non trouvée</h2>
        <Button onClick={() => navigate('/candidat/mes-candidatures')}>Retour</Button>
      </div>
    )
  }

  return (
    <div className="candidature-detail">
      <div className="detail-header">
        <Button variant="secondary" onClick={() => navigate('/candidat/mes-candidatures')}>
          <Icon name="ArrowLeft" size={16} />
          Retour
        </Button>
        <div className="header-info">
          <h1>Détail de ma candidature</h1>
          <span className={getStatutBadgeClass(candidature.statut_eligibilite)}>
            {candidature.statut_eligibilite || 'EN_ATTENTE_ÉLIGIBILITÉ'}
          </span>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <h2>Informations sur l'appel</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Appel à candidatures</label>
              <p>{candidature.appels_candidatures?.titre || 'N/A'}</p>
            </div>
            {candidature.appels_candidatures?.date_fermeture && (
              <div className="info-item">
                <label>Date de clôture</label>
                <p>{new Date(candidature.appels_candidatures.date_fermeture).toLocaleDateString('fr-FR')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="detail-section">
          <h2>Mes informations</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Nom</label>
              <p>{candidature.nom || '-'}</p>
            </div>
            <div className="info-item">
              <label>Prénom</label>
              <p>{candidature.prenom || '-'}</p>
            </div>
            <div className="info-item">
              <label>Email</label>
              <p>{candidature.email || '-'}</p>
            </div>
            <div className="info-item">
              <label>Téléphone</label>
              <p>{candidature.telephone || '-'}</p>
            </div>
            {candidature.raison_sociale && (
              <div className="info-item">
                <label>Raison sociale</label>
                <p>{candidature.raison_sociale}</p>
              </div>
            )}
            {candidature.secteur && (
              <div className="info-item">
                <label>Secteur</label>
                <p>{candidature.secteur}</p>
              </div>
            )}
            <div className="info-item">
              <label>Date de candidature</label>
              <p>
                {candidature.date_inscription
                  ? new Date(candidature.date_inscription).toLocaleDateString('fr-FR', {
                      dateStyle: 'long',
                    })
                  : '-'}
              </p>
            </div>
          </div>
        </div>

        {documents.length > 0 && (
          <div className="detail-section">
            <h2>Documents soumis ({documents.length})</h2>
            <div className="documents-list">
              {documents.map((doc) => (
                <div key={doc.id} className="document-item">
                  <div className="document-info">
                    <Icon name="FileText" size={24} />
                    <div>
                      <span className="document-name">{doc.nom_fichier}</span>
                      <span className="document-type">{doc.type_document}</span>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => downloadDocument(doc)}
                  >
                    <Icon name="Download" size={16} />
                    Télécharger
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {candidature.notes && (
          <div className="detail-section">
            <h2>Notes</h2>
            <div className="notes-content">{candidature.notes}</div>
          </div>
        )}
      </div>
    </div>
  )
}

