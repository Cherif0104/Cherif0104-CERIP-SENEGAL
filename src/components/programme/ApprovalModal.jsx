import { useState } from 'react'
import Icon from '../common/Icon'
import './ProgrammeComponents.css'

export default function ApprovalModal({ etape, onApprove, onReject, onCancel }) {
  const [commentaire, setCommentaire] = useState('')
  const [action, setAction] = useState(null) // 'APPROUVE' ou 'REJETE'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (action === 'APPROUVE') {
      onApprove(commentaire || null)
    } else if (action === 'REJETE') {
      if (!commentaire.trim()) {
        alert('Veuillez indiquer un motif de rejet')
        return
      }
      onReject(commentaire)
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Approbation - {etape.etape}</h3>
          <button
            type="button"
            className="btn-icon"
            onClick={onCancel}
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Action *</label>
            <div className="approval-actions">
              <button
                type="button"
                className={`approval-action-btn ${action === 'APPROUVE' ? 'active' : ''}`}
                onClick={() => setAction('APPROUVE')}
              >
                <Icon name="CheckCircle" size={20} />
                <span>Approuver</span>
              </button>
              <button
                type="button"
                className={`approval-action-btn approval-action-btn--danger ${action === 'REJETE' ? 'active' : ''}`}
                onClick={() => setAction('REJETE')}
              >
                <Icon name="XCircle" size={20} />
                <span>Rejeter</span>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="commentaire">
              Commentaire {action === 'REJETE' && <span className="text-danger">*</span>}
            </label>
            <textarea
              id="commentaire"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              className="input"
              rows={4}
              placeholder={action === 'REJETE' ? 'Veuillez indiquer le motif de rejet...' : 'Commentaire optionnel...'}
              required={action === 'REJETE'}
            />
            {action === 'REJETE' && (
              <small className="text-danger">
                Un motif de rejet est obligatoire
              </small>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`btn ${action === 'REJETE' ? 'btn-danger' : 'btn-success'}`}
              disabled={!action || (action === 'REJETE' && !commentaire.trim())}
            >
              {action === 'APPROUVE' ? (
                <>
                  <Icon name="CheckCircle" size={16} />
                  Approuver
                </>
              ) : (
                <>
                  <Icon name="XCircle" size={16} />
                  Rejeter
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

