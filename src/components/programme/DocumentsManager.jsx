import { useState, useEffect } from 'react'
import { programmeDocumentsService } from '../../services/programme-documents.service'
import { toastService } from '../../services/toast.service'
import Icon from '../common/Icon'
import LoadingState from '../common/LoadingState'
import DocumentUploader from './DocumentUploader'
import DocumentViewer from './DocumentViewer'
import './ProgrammeComponents.css'

const TYPES = [
  { value: 'CONVENTION', label: 'Convention', icon: 'FileSignature', color: '#3b82f6' },
  { value: 'RAPPORT', label: 'Rapport', icon: 'FileText', color: '#10b981' },
  { value: 'FACTURE', label: 'Facture', icon: 'Receipt', color: '#f59e0b' },
  { value: 'JUSTIFICATIF', label: 'Justificatif', icon: 'FileCheck', color: '#8b5cf6' },
  { value: 'AUTRE', label: 'Autre', icon: 'File', color: '#6b7280' }
]

const STATUTS = [
  { value: 'BROUILLON', label: 'Brouillon', color: '#6b7280' },
  { value: 'VALIDE', label: 'Validé', color: '#10b981' },
  { value: 'ARCHIVE', label: 'Archivé', color: '#8b5cf6' }
]

export default function DocumentsManager({ programmeId, mode = 'edit' }) {
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState([])
  const [filterType, setFilterType] = useState('ALL')
  const [filterStatut, setFilterStatut] = useState('ALL')
  const [showUploader, setShowUploader] = useState(false)
  const [showViewer, setShowViewer] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [uploadType, setUploadType] = useState('CONVENTION')

  const isEditMode = mode === 'edit'

  useEffect(() => {
    if (programmeId) {
      loadDocuments()
      programmeDocumentsService.initStorage()
    }
  }, [programmeId])

  const loadDocuments = async () => {
    setLoading(true)
    try {
      const { data, error } = await programmeDocumentsService.getAll(programmeId)
      if (error) {
        toastService.error('Erreur lors du chargement des documents')
      } else {
        setDocuments(data || [])
      }
    } catch (error) {
      console.error('Error loading documents:', error)
      toastService.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = (type) => {
    setUploadType(type)
    setShowUploader(true)
  }

  const handleView = (document) => {
    setSelectedDocument(document)
    setShowViewer(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return
    }

    try {
      const { error } = await programmeDocumentsService.delete(id)
      if (error) {
        toastService.error('Erreur lors de la suppression')
      } else {
        toastService.success('Document supprimé avec succès')
        await loadDocuments()
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      toastService.error('Erreur lors de la suppression')
    }
  }

  const handleValidate = async (id) => {
    try {
      const { error } = await programmeDocumentsService.validate(id)
      if (error) {
        toastService.error('Erreur lors de la validation')
      } else {
        toastService.success('Document validé avec succès')
        await loadDocuments()
      }
    } catch (error) {
      console.error('Error validating document:', error)
      toastService.error('Erreur lors de la validation')
    }
  }

  const handleArchive = async (id) => {
    try {
      const { error } = await programmeDocumentsService.archive(id)
      if (error) {
        toastService.error('Erreur lors de l\'archivage')
      } else {
        toastService.success('Document archivé avec succès')
        await loadDocuments()
      }
    } catch (error) {
      console.error('Error archiving document:', error)
      toastService.error('Erreur lors de l\'archivage')
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
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const getTypeInfo = (type) => {
    return TYPES.find(t => t.value === type) || TYPES[0]
  }

  const getStatutInfo = (statut) => {
    return STATUTS.find(s => s.value === statut) || STATUTS[0]
  }

  const filteredDocuments = documents.filter(d => {
    if (filterType !== 'ALL' && d.type !== filterType) return false
    if (filterStatut !== 'ALL' && d.statut !== filterStatut) return false
    return true
  })

  if (loading) {
    return <LoadingState message="Chargement des documents..." />
  }

  return (
    <div className="documents-manager">
      <div className="documents-header">
        <div>
          <h3>Documents</h3>
          <p className="documents-subtitle">Gérez les documents du programme (conventions, rapports, factures, justificatifs)</p>
        </div>
        {isEditMode && (
          <div className="documents-actions">
            {TYPES.slice(0, 4).map(type => (
              <button
                key={type.value}
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handleUpload(type.value)}
                style={{ borderLeft: `3px solid ${type.color}` }}
              >
                <Icon name={type.icon} size={16} />
                Ajouter {type.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filtres */}
      <div className="documents-filters">
        <div className="filter-group">
          <label>Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input input-sm"
          >
            <option value="ALL">Tous les types</option>
            {TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Statut:</label>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="input input-sm"
          >
            <option value="ALL">Tous les statuts</option>
            {STATUTS.map(statut => (
              <option key={statut.value} value={statut.value}>{statut.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste des documents */}
      {filteredDocuments.length === 0 ? (
        <div className="empty-state">
          <Icon name="Folder" size={32} />
          <p>Aucun document {filterType !== 'ALL' || filterStatut !== 'ALL' ? 'correspondant aux filtres' : ''}</p>
          {isEditMode && filterType === 'ALL' && filterStatut === 'ALL' && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleUpload('CONVENTION')}
            >
              Ajouter le premier document
            </button>
          )}
        </div>
      ) : (
        <div className="documents-list">
          {filteredDocuments.map(document => {
            const typeInfo = getTypeInfo(document.type)
            const statutInfo = getStatutInfo(document.statut)
            const isExpired = document.date_expiration && new Date(document.date_expiration) < new Date()

            return (
              <div key={document.id} className={`document-card ${isExpired ? 'document-card--expired' : ''}`}>
                <div className="document-card-header">
                  <div className="document-card-title">
                    <Icon name={typeInfo.icon} size={20} style={{ color: typeInfo.color }} />
                    <div>
                      <h4>{document.nom}</h4>
                      <span className="document-card-meta">
                        {formatDate(document.date_upload)} • v{document.version} • {formatFileSize(document.taille)}
                      </span>
                    </div>
                  </div>
                  <div className="document-card-badges">
                    <span
                      className="badge"
                      style={{
                        background: typeInfo.color,
                        color: 'white',
                        borderColor: typeInfo.color
                      }}
                    >
                      {typeInfo.label}
                    </span>
                    <span
                      className="badge"
                      style={{
                        background: statutInfo.color,
                        color: 'white',
                        borderColor: statutInfo.color
                      }}
                    >
                      {statutInfo.label}
                    </span>
                    {isExpired && (
                      <span className="badge badge--danger">
                        <Icon name="AlertTriangle" size={12} />
                        Expiré
                      </span>
                    )}
                  </div>
                </div>

                {document.description && (
                  <div className="document-card-body">
                    <p>{document.description}</p>
                  </div>
                )}

                {document.date_expiration && (
                  <div className="document-card-meta-info">
                    <Icon name="Calendar" size={14} />
                    <span>Expire le: {formatDate(document.date_expiration)}</span>
                  </div>
                )}

                <div className="document-card-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleView(document)}
                  >
                    <Icon name="Eye" size={14} />
                    Voir
                  </button>
                  <a
                    href={document.fichier_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <Icon name="Download" size={14} />
                    Télécharger
                  </a>
                  {isEditMode && (
                    <>
                      {document.statut === 'BROUILLON' && (
                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          onClick={() => handleValidate(document.id)}
                        >
                          <Icon name="CheckCircle" size={14} />
                          Valider
                        </button>
                      )}
                      {document.statut === 'VALIDE' && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleArchive(document.id)}
                        >
                          <Icon name="Archive" size={14} />
                          Archiver
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-icon btn-icon--danger"
                        onClick={() => handleDelete(document.id)}
                        title="Supprimer"
                      >
                        <Icon name="Trash2" size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Uploader modal */}
      {showUploader && (
        <DocumentUploader
          programmeId={programmeId}
          type={uploadType}
          onSave={() => {
            setShowUploader(false)
            loadDocuments()
          }}
          onCancel={() => setShowUploader(false)}
        />
      )}

      {/* Viewer modal */}
      {showViewer && selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => {
            setShowViewer(false)
            setSelectedDocument(null)
          }}
        />
      )}
    </div>
  )
}

