import { useState, useEffect } from 'react'
import { programmeDocumentsService } from '../../services/programme-documents.service'
import { toastService } from '../../services/toast.service'
import Icon from '../common/Icon'
import LoadingState from '../common/LoadingState'
import './ProgrammeComponents.css'

export default function DocumentViewer({ document, onClose }) {
  const [loading, setLoading] = useState(false)
  const [versions, setVersions] = useState([])
  const [loadingVersions, setLoadingVersions] = useState(false)

  useEffect(() => {
    if (document) {
      loadVersions()
    }
  }, [document])

  const loadVersions = async () => {
    setLoadingVersions(true)
    try {
      const { data, error } = await programmeDocumentsService.getVersions(document.id)
      if (!error) {
        setVersions(data || [])
      }
    } catch (error) {
      console.error('Error loading versions:', error)
    } finally {
      setLoadingVersions(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (mimeType) => {
    if (!mimeType) return 'FileText'
    if (mimeType.includes('pdf')) return 'FileText'
    if (mimeType.includes('word') || mimeType.includes('document')) return 'FileText'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'FileSpreadsheet'
    if (mimeType.includes('image')) return 'FileText' // Image icon not available, use FileText
    return 'FileText'
  }

  const canPreview = (mimeType) => {
    if (!mimeType) return false
    return mimeType.includes('pdf') || mimeType.includes('image')
  }

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <LoadingState message="Chargement du document..." />
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content--large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>{document.nom}</h3>
            <p className="modal-subtitle">v{document.version}</p>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="document-viewer">
            <div className="document-viewer-info">
              <div className="info-grid">
                <div className="info-item">
                  <Icon name="File" size={18} />
                  <div>
                    <label>Type</label>
                    <span>{document.type}</span>
                  </div>
                </div>
                <div className="info-item">
                  <Icon name="Calendar" size={18} />
                  <div>
                    <label>Date d'upload</label>
                    <span>{formatDate(document.date_upload)}</span>
                  </div>
                </div>
                <div className="info-item">
                  <Icon name="Package" size={18} />
                  <div>
                    <label>Taille</label>
                    <span>{formatFileSize(document.taille)}</span>
                  </div>
                </div>
                {document.date_expiration && (
                  <div className="info-item">
                    <Icon name="Calendar" size={18} />
                    <div>
                      <label>Date d'expiration</label>
                      <span>{formatDate(document.date_expiration)}</span>
                    </div>
                  </div>
                )}
              </div>

              {document.description && (
                <div className="document-description">
                  <h4>Description</h4>
                  <p>{document.description}</p>
                </div>
              )}

              <div className="document-actions">
                <a
                  href={document.fichier_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <Icon name="Download" size={16} />
                  Télécharger
                </a>
                {canPreview(document.mime_type) && (
                  <a
                    href={document.fichier_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                  >
                    <Icon name="Eye" size={16} />
                    Prévisualiser
                  </a>
                )}
              </div>
            </div>

            {/* Prévisualisation */}
            {canPreview(document.mime_type) && (
              <div className="document-preview">
                <h4>Prévisualisation</h4>
                <div className="preview-container">
                  {document.mime_type.includes('pdf') ? (
                    <iframe
                      src={document.fichier_url}
                      className="preview-iframe"
                      title="Document preview"
                    />
                  ) : document.mime_type.includes('image') ? (
                    <img
                      src={document.fichier_url}
                      alt={document.nom}
                      className="preview-image"
                    />
                  ) : null}
                </div>
              </div>
            )}

            {/* Historique des versions */}
            {(versions.length > 0 || document.version > 1) && (
              <div className="document-versions">
                <h4>Historique des versions</h4>
                {loadingVersions ? (
                  <LoadingState message="Chargement des versions..." />
                ) : (
                  <div className="versions-list">
                    <div className="version-item version-item--current">
                      <div className="version-header">
                        <Icon name={getFileIcon(document.mime_type)} size={20} />
                        <div>
                          <strong>Version {document.version} (actuelle)</strong>
                          <span>{formatDate(document.date_upload)}</span>
                        </div>
                      </div>
                      <a
                        href={document.fichier_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-icon btn-icon--small"
                      >
                        <Icon name="Download" size={16} />
                      </a>
                    </div>
                    {versions.map(version => (
                      <div key={version.id} className="version-item">
                        <div className="version-header">
                          <Icon name={getFileIcon(version.mime_type)} size={20} />
                          <div>
                            <strong>Version {version.version}</strong>
                            <span>{formatDate(version.date_upload)}</span>
                          </div>
                        </div>
                        <a
                          href={version.fichier_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-icon btn-icon--small"
                        >
                          <Icon name="Download" size={16} />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

