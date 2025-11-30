import { useEffect, useState } from 'react'
import { organismesService } from '@/services/organismes.service'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import './OrganismeDetail.css'

export default function OrganismeDetail({ id, onClose, onEdit }) {
  const [organisme, setOrganisme] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrganisme()
  }, [id])

  const loadOrganisme = async () => {
    setLoading(true)
    try {
      const { data, error } = await organismesService.getById(id)
      if (error) {
        logger.error('ORGANISME_DETAIL', 'Erreur chargement organisme', error)
        return
      }
      setOrganisme(data)
    } catch (error) {
      logger.error('ORGANISME_DETAIL', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  if (!organisme) {
    return (
      <div className="organisme-detail-error">
        <p>Organisme non trouvé</p>
        <Button onClick={onClose}>Retour</Button>
      </div>
    )
  }

  const contacts = Array.isArray(organisme.contacts) ? organisme.contacts : []

  return (
    <div className="organisme-detail">
      <div className="organisme-detail-header">
        <Button onClick={onClose} variant="secondary">
          <Icon name="ArrowLeft" size={16} />
          Retour
        </Button>
        <div className="header-actions">
          <Button onClick={() => onEdit(organisme.id)} variant="primary">
            <Icon name="Edit" size={16} />
            Modifier
          </Button>
        </div>
      </div>

      <div className="organisme-detail-content">
        <div className="detail-section">
          <h2>{organisme.nom}</h2>
          <div className="detail-badge code">{organisme.code}</div>
          <div className={`detail-badge statut ${organisme.actif ? 'actif' : 'inactif'}`}>
            {organisme.actif ? 'Actif' : 'Inactif'}
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <label>Type</label>
            <p>{organisme.type || '-'}</p>
          </div>
          <div className="detail-item">
            <label>Pays</label>
            <p>{organisme.pays || '-'}</p>
          </div>
          <div className="detail-item">
            <label>Email</label>
            <p>{organisme.email || '-'}</p>
          </div>
          <div className="detail-item">
            <label>Téléphone</label>
            <p>{organisme.telephone || '-'}</p>
          </div>
          <div className="detail-item full-width">
            <label>Adresse</label>
            <p>{organisme.adresse || '-'}</p>
          </div>
          <div className="detail-item full-width">
            <label>Site web</label>
            <p>
              {organisme.site_web ? (
                <a href={organisme.site_web} target="_blank" rel="noopener noreferrer">
                  {organisme.site_web}
                </a>
              ) : (
                '-'
              )}
            </p>
          </div>
        </div>

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

        {organisme.notes && (
          <div className="detail-section">
            <h3>Notes</h3>
            <p className="notes-text">{organisme.notes}</p>
          </div>
        )}

        <div className="detail-section">
          <div className="detail-meta">
            <span>Créé le: {new Date(organisme.created_at).toLocaleDateString('fr-FR')}</span>
            <span>Modifié le: {new Date(organisme.updated_at).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

