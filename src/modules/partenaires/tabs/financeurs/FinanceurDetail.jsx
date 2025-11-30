import { useEffect, useState } from 'react'
import { financeursService } from '@/services/financeurs.service'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { logger } from '@/utils/logger'
import '../organismes/OrganismeDetail.css'

export default function FinanceurDetail({ id, onClose, onEdit }) {
  const [financeur, setFinanceur] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFinanceur()
  }, [id])

  const loadFinanceur = async () => {
    setLoading(true)
    try {
      const { data, error } = await financeursService.getById(id)
      if (error) {
        logger.error('FINANCEUR_DETAIL', 'Erreur chargement financeur', error)
        return
      }
      setFinanceur(data)
    } catch (error) {
      logger.error('FINANCEUR_DETAIL', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  if (!financeur) {
    return (
      <div className="organisme-detail-error">
        <p>Financeur non trouvé</p>
        <Button onClick={onClose}>Retour</Button>
      </div>
    )
  }

  const contacts = Array.isArray(financeur.contacts) ? financeur.contacts : []

  return (
    <div className="organisme-detail">
      <div className="organisme-detail-header">
        <Button onClick={onClose} variant="secondary">
          <Icon name="ArrowLeft" size={16} />
          Retour
        </Button>
        <div className="header-actions">
          <Button onClick={() => onEdit(financeur.id)} variant="primary">
            <Icon name="Edit" size={16} />
            Modifier
          </Button>
        </div>
      </div>

      <div className="organisme-detail-content">
        <div className="detail-section">
          <h2>{financeur.nom}</h2>
          <div className="detail-badge code">{financeur.code}</div>
          <div className={`detail-badge statut ${financeur.actif ? 'actif' : 'inactif'}`}>
            {financeur.actif ? 'Actif' : 'Inactif'}
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <label>Type</label>
            <p>{financeur.type || '-'}</p>
          </div>
          <div className="detail-item">
            <label>Pays</label>
            <p>{financeur.pays || '-'}</p>
          </div>
          <div className="detail-item">
            <label>Email</label>
            <p>{financeur.email || '-'}</p>
          </div>
          <div className="detail-item">
            <label>Téléphone</label>
            <p>{financeur.telephone || '-'}</p>
          </div>
          <div className="detail-item full-width">
            <label>Adresse</label>
            <p>{financeur.adresse || '-'}</p>
          </div>
          <div className="detail-item full-width">
            <label>Site web</label>
            <p>
              {financeur.site_web ? (
                <a href={financeur.site_web} target="_blank" rel="noopener noreferrer">
                  {financeur.site_web}
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

        {financeur.notes && (
          <div className="detail-section">
            <h3>Notes</h3>
            <p className="notes-text">{financeur.notes}</p>
          </div>
        )}

        <div className="detail-section">
          <div className="detail-meta">
            <span>Créé le: {new Date(financeur.created_at).toLocaleDateString('fr-FR')}</span>
            <span>Modifié le: {new Date(financeur.updated_at).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

