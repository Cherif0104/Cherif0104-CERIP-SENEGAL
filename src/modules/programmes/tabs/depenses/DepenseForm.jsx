import { useState, useEffect } from 'react'
import { programmeDepensesService } from '@/services/programme-depenses.service'
import { programmesService } from '@/services/programmes.service'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { toast } from '@/components/common/Toast'
import { logger } from '@/utils/logger'
import './DepenseForm.css'

export default function DepenseForm({ programmeId, depense = null, onClose }) {
  const [loading, setLoading] = useState(false)
  const [programme, setProgramme] = useState(null)
  const [formData, setFormData] = useState({
    libelle: '',
    montant: '',
    date_depense: new Date().toISOString().split('T')[0],
    description: '',
    reference: '',
    statut: 'BROUILLON',
    justificatif_url: null,
  })
  const [file, setFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (depense) {
      setFormData({
        libelle: depense.libelle || '',
        montant: depense.montant?.toString() || '',
        date_depense: depense.date_depense ? depense.date_depense.split('T')[0] : new Date().toISOString().split('T')[0],
        description: depense.description || '',
        reference: depense.reference || '',
        statut: depense.statut || 'BROUILLON',
        justificatif_url: depense.justificatif_url || null,
      })
      if (depense.justificatif_url) {
        setFilePreview(depense.justificatif_url)
      }
    }
    loadProgramme()
  }, [depense, programmeId])

  const loadProgramme = async () => {
    if (!programmeId) return
    try {
      const { data, error } = await programmesService.getById(programmeId)
      if (error) {
        logger.error('DEPENSE_FORM', 'Erreur chargement programme', error)
      } else {
        setProgramme(data)
      }
    } catch (error) {
      logger.error('DEPENSE_FORM', 'Erreur inattendue', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    // Vérifier la taille (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('Le fichier ne doit pas dépasser 10MB')
      return
    }

    // Vérifier le type de fichier
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Type de fichier non autorisé. Formats acceptés: PDF, images, Word, Excel')
      return
    }

    setFile(selectedFile)

    // Afficher un aperçu pour les images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setFilePreview(null)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setFilePreview(null)
    setFormData(prev => ({ ...prev, justificatif_url: null }))
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.libelle || formData.libelle.trim() === '') {
      newErrors.libelle = 'Le libellé est requis'
    }

    if (!formData.montant || parseFloat(formData.montant) <= 0) {
      newErrors.montant = 'Le montant doit être supérieur à 0'
    }

    if (!formData.date_depense) {
      newErrors.date_depense = 'La date est requise'
    }

    if (programme && programme.budget) {
      // Vérifier si le montant ne dépasse pas le budget restant
      // (Cette vérification sera faite côté serveur mais on peut prévenir)
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire')
      return
    }

    setLoading(true)
    try {
      const depenseData = {
        programme_id: programmeId,
        libelle: formData.libelle.trim(),
        montant: parseFloat(formData.montant),
        date_depense: formData.date_depense,
        description: formData.description.trim() || null,
        reference: formData.reference.trim() || null,
        statut: formData.statut,
        justificatif_url: formData.justificatif_url,
      }

      let result
      if (depense) {
        // Mise à jour
        result = await programmeDepensesService.update(depense.id, depenseData, file)
        if (result.error) {
          toast.error('Erreur lors de la mise à jour de la dépense')
          return
        }
        toast.success('Dépense mise à jour avec succès')
      } else {
        // Création
        result = await programmeDepensesService.create(depenseData, file)
        if (result.error) {
          toast.error('Erreur lors de la création de la dépense')
          return
        }
        toast.success('Dépense créée avec succès')
      }

      if (onClose) {
        onClose()
      }
    } catch (error) {
      logger.error('DEPENSE_FORM', 'Erreur soumission', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="depense-form-overlay" onClick={(e) => {
      if (e.target.classList.contains('depense-form-overlay')) {
        onClose()
      }
    }}>
      <div className="depense-form-modal">
        <div className="depense-form-header">
          <h2>{depense ? 'Modifier la dépense' : 'Nouvelle dépense'}</h2>
          <button onClick={onClose} className="close-button">
            <Icon name="X" size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="depense-form">
          {programme && (
            <div className="form-info">
              <p><strong>Programme:</strong> {programme.nom}</p>
              {programme.budget && (
                <p><strong>Budget:</strong> {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                  minimumFractionDigits: 0,
                }).format(programme.budget)}</p>
              )}
            </div>
          )}

          <div className="form-row">
            <Input
              label="Libellé"
              name="libelle"
              value={formData.libelle}
              onChange={handleChange}
              required
              error={errors.libelle}
              placeholder="Ex: Achat matériel informatique"
            />
          </div>

          <div className="form-row form-row-2">
            <Input
              label="Montant (FCFA)"
              name="montant"
              type="number"
              step="0.01"
              min="0"
              value={formData.montant}
              onChange={handleChange}
              required
              error={errors.montant}
            />
            <Input
              label="Date de dépense"
              name="date_depense"
              type="date"
              value={formData.date_depense}
              onChange={handleChange}
              required
              error={errors.date_depense}
            />
          </div>

          <div className="form-row form-row-2">
            <Input
              label="Référence"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              placeholder="Ex: FACT-2024-001"
            />
            <Select
              label="Statut"
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              options={[
                { value: 'BROUILLON', label: 'Brouillon' },
                { value: 'VALIDE', label: 'Validé' },
                { value: 'PAYE', label: 'Payé' },
                { value: 'ANNULE', label: 'Annulé' },
              ]}
            />
          </div>

          <div className="form-row">
            <Input
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              isTextArea
              rows={4}
              placeholder="Détails supplémentaires sur la dépense..."
            />
          </div>

          <div className="form-row">
            <div className="file-upload-section">
              <label className="file-upload-label">
                Pièce justificative
                <span className="file-upload-hint">(PDF, images, Word, Excel - max 10MB)</span>
              </label>
              {file || filePreview ? (
                <div className="file-preview">
                  {filePreview && filePreview.startsWith('data:image/') ? (
                    <img src={filePreview} alt="Aperçu" className="file-preview-image" />
                  ) : (
                    <div className="file-preview-info">
                      <Icon name="FileText" size={48} />
                      <p>{file?.name || 'Fichier existant'}</p>
                      {file && <p className="file-size">{(file.size / 1024).toFixed(2)} KB</p>}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="remove-file-button"
                  >
                    <Icon name="X" size={16} />
                    Supprimer
                  </button>
                </div>
              ) : (
                <div className="file-upload-area">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                    className="file-input"
                    id="justificatif-file"
                  />
                  <label htmlFor="justificatif-file" className="file-upload-button">
                    <Icon name="Upload" size={20} />
                    Choisir un fichier
                  </label>
                  <p className="file-upload-text">ou glissez-déposez un fichier ici</p>
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : (depense ? 'Mettre à jour' : 'Créer')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

