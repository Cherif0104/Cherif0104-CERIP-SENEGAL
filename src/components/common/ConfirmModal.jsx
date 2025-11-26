import { X, AlertTriangle } from 'lucide-react'
import './ConfirmModal.css'

/**
 * Composant ConfirmModal - Remplace confirm() natif
 * 
 * @param {boolean} open - Modal ouverte ou fermée
 * @param {string} title - Titre de la confirmation
 * @param {string} description - Description détaillée
 * @param {string} confirmLabel - Label du bouton de confirmation (défaut: "Confirmer")
 * @param {string} cancelLabel - Label du bouton d'annulation (défaut: "Annuler")
 * @param {string} variant - Variante: 'danger' | 'warning' | 'info'
 * @param {function} onConfirm - Callback de confirmation
 * @param {function} onCancel - Callback d'annulation
 */
export default function ConfirmModal({
  open = false,
  title = "Confirmer l'action",
  description = "Êtes-vous sûr de vouloir effectuer cette action ?",
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = 'warning',
  onConfirm,
  onCancel
}) {
  if (!open) return null

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel()
    }
  }

  return (
    <div 
      className="confirm-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-description"
    >
      <div className={`confirm-modal confirm-modal--${variant}`}>
        <div className="confirm-modal__header">
          <div className="confirm-modal__icon">
            <AlertTriangle size={24} />
          </div>
          <h3 id="confirm-modal-title" className="confirm-modal__title">
            {title}
          </h3>
          <button
            className="confirm-modal__close"
            onClick={handleCancel}
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="confirm-modal__body">
          <p id="confirm-modal-description" className="confirm-modal__description">
            {description}
          </p>
        </div>

        <div className="confirm-modal__footer">
          <button
            className="cta cta-secondary"
            onClick={handleCancel}
          >
            {cancelLabel}
          </button>
          <button
            className={`cta cta-primary ${variant === 'danger' ? 'cta-danger' : ''}`}
            onClick={handleConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

