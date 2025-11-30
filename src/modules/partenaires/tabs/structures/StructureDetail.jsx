import { useEffect, useState } from 'react'
import { structuresService } from '@/services/structures.service'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import '../organismes/OrganismeDetail.css'

export default function StructureDetail({ id, onClose, onEdit }) {
  const [structure, setStructure] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStructure()
  }, [id])

  const loadStructure = async () => {
    setLoading(true)
    try {
      const { data, error } = await structuresService.getById(id)
      if (error) {
        logger.error('STRUCTURE_DETAIL', 'Erreur chargement structure', error)
        return
      }
      setStructure(data)
    } catch (error) {
      logger.error('STRUCTURE_DETAIL', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  if (!structure) {
    return (
      <div className="organisme-detail-error">
        <p>Structure non trouvée</p>
        <Button onClick={onClose}>Retour</Button>
      </div>
    )
  }

  const contacts = Array.isArray(structure.contacts) ? structure.contacts : []

  return (
    <div className="organisme-detail">
      <div className="organisme-detail-header">
        <Button onClick={onClose} variant="secondary">
          <Icon name="ArrowLeft" size={16} />
          Retour
        </Button>
        <div className="header-actions">
          <Button onClick={() => onEdit(structure.id)} variant="primary">
            <Icon name="Edit" size={16} />
            Modifier
          </Button>
        </div>
      </div>

      <div className="organisme-detail-content">
        <div className="detail-section">
          <h2>{structure.nom}</h2>
          <div className="detail-badge code">{structure.code}</div>
          <div className={`detail-badge statut ${structure.actif ? 'actif' : 'inactif'}`}>
            {structure.actif ? 'Actif' : 'Inactif'}
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <label>Type</label>
            <p>{structure.type || '-'}</p>
          </div>
          <div className="detail-item">
            <label>Secteur</label>
            <p>{structure.secteur || '-'}</p>
          </div>
          <div className="detail-item">
            <label>Email</label>
            <p>{structure.email || '-'}</p>
          </div>
          <div className="detail-item">
            <label>Téléphone</label>
            <p>{structure.telephone || '-'}</p>
          </div>
          <div className="detail-item full-width">
            <label>Adresse</label>
            <p>{structure.adresse || '-'}</p>
          </div>
          <div className="detail-item full-width">
            <label>Site web</label>
            <p>
              {structure.site_web ? (
                <a href={structure.site_web} target="_blank" rel="noopener noreferrer">
                  {structure.site_web}
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

        {structure.notes && (
          <div className="detail-section">
            <h3>Notes</h3>
            <p className="notes-text">{structure.notes}</p>
          </div>
        )}

        <div className="detail-section">
          <div className="detail-meta">
            <span>Créé le: {new Date(structure.created_at).toLocaleDateString('fr-FR')}</span>
            <span>Modifié le: {new Date(structure.updated_at).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

