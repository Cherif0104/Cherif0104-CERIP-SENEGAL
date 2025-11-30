import { useState } from 'react'
import { Icon } from '@/components/common/Icon'
import './UploadDocuments.css'

export default function UploadDocuments({ documents, onChange, documentsRequis = [] }) {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (files) => {
    const validFiles = files.filter((file) => {
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        alert(`Le fichier ${file.name} dépasse la taille maximale de 10MB`)
        return false
      }
      return true
    })

    onChange([...documents, ...validFiles])
  }

  const removeDocument = (index) => {
    const newDocuments = documents.filter((_, i) => i !== index)
    onChange(newDocuments)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getRequiredDocuments = () => {
    return documentsRequis.filter((doc) => doc.obligatoire !== false)
  }

  const requiredDocs = getRequiredDocuments()
  const hasRequiredDocs = requiredDocs.length > 0

  return (
    <div className="upload-documents">
      {hasRequiredDocs && (
        <div className="required-docs-info">
          <h4>Documents requis *</h4>
          <ul>
            {requiredDocs.map((doc, index) => (
              <li key={index}>{doc.type || doc.nom || `Document ${index + 1}`}</li>
            ))}
          </ul>
        </div>
      )}

      <div
        className={`upload-dropzone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={handleChange}
          className="file-input"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
        <label htmlFor="file-upload" className="upload-label">
          <Icon name="Upload" size={32} />
          <p>
            <strong>Glissez-déposez vos fichiers ici</strong> ou cliquez pour sélectionner
          </p>
          <span className="upload-hint">
            Formats acceptés: PDF, DOC, DOCX, JPG, PNG (max 10MB par fichier)
          </span>
        </label>
      </div>

      {documents.length > 0 && (
        <div className="uploaded-files">
          <h4>Fichiers sélectionnés ({documents.length})</h4>
          <ul className="files-list">
            {documents.map((file, index) => (
              <li key={index} className="file-item">
                <div className="file-info">
                  <Icon name="FileText" size={20} />
                  <div>
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeDocument(index)}
                  className="remove-file-btn"
                  aria-label="Supprimer"
                >
                  <Icon name="X" size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

