import { useState, useRef } from 'react'
import { programmeDocumentsService } from '../../services/programme-documents.service'
import { toastService } from '../../services/toast.service'
import Icon from '../common/Icon'
import './ProgrammeComponents.css'

const TYPES = [
  { value: 'CONVENTION', label: 'Convention' },
  { value: 'RAPPORT', label: 'Rapport' },
  { value: 'FACTURE', label: 'Facture' },
  { value: 'JUSTIFICATIF', label: 'Justificatif' },
  { value: 'AUTRE', label: 'Autre' }
]

export default function DocumentUploader({ programmeId, type, onSave, onCancel }) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [formData, setFormData] = useState({
    type: type || 'CONVENTION',
    nom: '',
    description: '',
    date_expiration: ''
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)
  const dropZoneRef = useRef(null)

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
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleFileSelect = (file) => {
    // Vérifier la taille (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toastService.error('Le fichier est trop volumineux (max 10MB)')
      return
    }

    setSelectedFile(file)
    if (!formData.nom) {
      setFormData(prev => ({ ...prev, nom: file.name }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedFile && !formData.nom) {
      toastService.error('Veuillez sélectionner un fichier ou renseigner un nom')
      return
    }

    if (!formData.nom) {
      toastService.error('Veuillez renseigner un nom pour le document')
      return
    }

    setUploading(true)
    try {
      const documentData = {
        programme_id: programmeId,
        type: formData.type,
        nom: formData.nom,
        description: formData.description || null,
        date_expiration: formData.date_expiration || null
      }

      const { data, error } = await programmeDocumentsService.create(documentData, selectedFile)

      if (error) {
        toastService.error(error.message || 'Erreur lors de l\'upload')
      } else {
        toastService.success('Document uploadé avec succès')
        onSave()
      }
    } catch (error) {
      console.error('Error uploading document:', error)
      toastService.error('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content modal-content--large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Ajouter un document</h3>
          <button
            type="button"
            className="btn-icon"
            onClick={onCancel}
            disabled={uploading}
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="type">Type de document *</label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="input"
              required
            >
              {TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="nom">Nom du document *</label>
            <input
              type="text"
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="input"
              placeholder="Ex: Convention de financement 2024"
              required
            />
          </div>

          {/* Zone de drop */}
          <div className="form-group">
            <label>Fichier *</label>
            <div
              ref={dropZoneRef}
              className={`file-drop-zone ${dragActive ? 'file-drop-zone--active' : ''} ${selectedFile ? 'file-drop-zone--has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInput}
                className="file-input-hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
              {selectedFile ? (
                <div className="file-selected">
                  <Icon name="File" size={32} />
                  <div>
                    <strong>{selectedFile.name}</strong>
                    <span>{formatFileSize(selectedFile.size)}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-icon btn-icon--small"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFile(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                  >
                    <Icon name="X" size={16} />
                  </button>
                </div>
              ) : (
                <div className="file-drop-content">
                  <Icon name="Upload" size={48} />
                  <p>
                    <strong>Glissez-déposez un fichier ici</strong>
                    <br />
                    ou cliquez pour sélectionner
                  </p>
                  <small>PDF, Word, Excel, Images (max 10MB)</small>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={3}
              placeholder="Description optionnelle..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="date_expiration">Date d'expiration</label>
            <input
              type="date"
              id="date_expiration"
              value={formData.date_expiration}
              onChange={(e) => setFormData({ ...formData, date_expiration: e.target.value })}
              className="input"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={uploading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={uploading || !selectedFile}
            >
              {uploading ? (
                <>
                  <div className="spinner-small"></div>
                  Upload en cours...
                </>
              ) : (
                <>
                  <Icon name="Upload" size={16} />
                  Uploader
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

