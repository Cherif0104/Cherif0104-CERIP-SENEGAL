import { useEffect, useState } from 'react'
import { partenairesService } from '@/services/partenaires.service'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import '../organismes/OrganismeDetail.css'

export default function PartenaireDetail({ id, onClose, onEdit }) {
  const [partenaire, setPartenaire] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPartenaire()
  }, [id])

  const loadPartenaire = async () => {
    setLoading(true)
    try {
      const { data, error } = await partenairesService.getById(id)
      if (error) {
        logger.error('PARTENAIRE_DETAIL', 'Erreur chargement partenaire', error)
        return
      }
      setPartenaire(data)
    } catch (error) {
      logger.error('PARTENAIRE_DETAIL', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  if (!partenaire) {
    return (
      <div className="organisme-detail-error">
        <p>Partenaire non trouvé</p>
        <Button onClick={onClose}>Retour</Button>
      </div>
    )
  }

  const contacts = Array.isArray(partenaire.contacts) ? partenaire.contacts : []
  const domaines = Array.isArray(partenaire.domaines_collaboration) ? partenaire.domaines_collaboration : []

  return (
    <div className="organisme-detail">
      <div className="organisme-detail-header">
        <Button onClick={onClose} variant="secondary">
          <Icon name="ArrowLeft" size={16} />
          Retour
        </Button>
        <div className="header-actions">
          <Button onClick={() => onEdit(partenaire.id)} variant="primary">
            <Icon name="Edit" size={16} />
            Modifier
          </Button>
        </div>
      </div>

      <div className="organisme-detail-content">
        <div className="detail-section">
          <h2>{partenaire.nom}</h2>
          <div className="detail-badge code">{partenaire.code}</div>
          <div className={`detail-badge statut ${partenaire.actif ? 'actif' : 'inactif'}`}>
            {partenaire.actif ? 'Actif' : 'Inactif'}
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <label>Type de partenariat</label>
            <p>{partenaire.type_partenariat || '-'}</p>
          </div>
          <div className="detail-item">
            <label>Pays</label>
            <p>{partenaire.pays || '-'}</p>
          </div>
          <div className="detail-item">
            <label>Email</label>
            <p>{partenaire.email || '-'}</p>
          </div>
          <div className="detail-item">
            <label>Téléphone</label>
            <p>{partenaire.telephone || '-'}</p>
          </div>
          <div className="detail-item full-width">
            <label>Adresse</label>
            <p>{partenaire.adresse || '-'}</p>
          </div>
          <div className="detail-item full-width">
            <label>Site web</label>
            <p>
              {partenaire.site_web ? (
                <a href={partenaire.site_web} target="_blank" rel="noopener noreferrer">
                  {partenaire.site_web}
                </a>
              ) : (
                '-'
              )}
            </p>
          </div>
        </div>

        {domaines.length > 0 && (
          <div className="detail-section">
            <h3>Domaines de collaboration</h3>
            <div className="domaines-list">
              {domaines.map((domaine, index) => (
                <span key={index} className="domaine-badge">
                  {domaine}
                </span>
              ))}
            </div>
          </div>
        )}

        {contacts.length > 0 && (
          <div className="detail-section">
            <h3>Contacts</h3>
            <div className="contacts-list">
              {contacts.map((contact, index) => (
                <div key={index} className="contact-item">
                  <div className="contact-name">
                    <strong>{contact.nom || 'N/A'}</strong>
                    {contact.fonction && <span className="contact-fonction">{contact.fonction}</span>}
                  </div>
                  {contact.email && <div className="contact-info">{contact.email}</div>}
                  {contact.telephone && <div className="contact-info">{contact.telephone}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {partenaire.notes && (
          <div className="detail-section">
            <h3>Notes</h3>
            <p className="notes-text">{partenaire.notes}</p>
          </div>
        )}

        <div className="detail-section">
          <div className="detail-meta">
            <span>Créé le: {new Date(partenaire.created_at).toLocaleDateString('fr-FR')}</span>
            <span>Modifié le: {new Date(partenaire.updated_at).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

