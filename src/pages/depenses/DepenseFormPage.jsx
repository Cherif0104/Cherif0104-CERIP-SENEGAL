import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { programmeDepensesService } from '@/services/programme-depenses.service'
import { programmesService } from '@/services/programmes.service'
import { MultiStepForm } from '@/components/forms/MultiStepForm'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { LoadingState } from '@/components/common/LoadingState'
import { toast } from '@/components/common/Toast'
import { logger } from '@/utils/logger'
import { Icon } from '@/components/common/Icon'
import './DepenseFormPage.css'

export default function DepenseFormPage() {
  const navigate = useNavigate()
  const { id, programme_id } = useParams() // ID de la dépense si édition, programme_id depuis l'URL
  const programmeId = programme_id
  
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(!!id) // Charger données si édition
  const [programme, setProgramme] = useState(null)
  const [formData, setFormData] = useState({
    libelle: '',
    montant: '',
    date_depense: new Date().toISOString().split('T')[0],
    description: '',
    reference: '',
    statut: 'BROUILLON',
    programme_id: programmeId || '',
    justificatif_url: null,
  })
  const [file, setFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (id) {
      loadDepense()
    }
    if (programmeId) {
      loadProgramme()
    }
  }, [id, programmeId])

  const loadDepense = async () => {
    setLoadingData(true)
    try {
      const { data, error } = await programmeDepensesService.getById(id)
      if (error) {
        logger.error('DEPENSE_FORM_PAGE', 'Erreur chargement dépense', error)
        toast.error('Erreur lors du chargement de la dépense')
        if (programmeId) {
          navigate(`/programmes/${programmeId}`)
        } else {
          navigate('/programmes')
        }
        return
      }
      setFormData({
        libelle: data.libelle || '',
        montant: data.montant?.toString() || '',
        date_depense: data.date_depense ? data.date_depense.split('T')[0] : new Date().toISOString().split('T')[0],
        description: data.description || '',
        reference: data.reference || '',
        statut: data.statut || 'BROUILLON',
        programme_id: data.programme_id || programmeId || '',
        justificatif_url: data.justificatif_url || null,
      })
      if (data.justificatif_url) {
        setFilePreview(data.justificatif_url)
      }
      if (data.programme_id) {
        loadProgramme(data.programme_id)
      }
    } catch (error) {
      logger.error('DEPENSE_FORM_PAGE', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoadingData(false)
    }
  }

  const loadProgramme = async (progId = null) => {
    const idToLoad = progId || programmeId
    if (!idToLoad) return
    try {
      const { data, error } = await programmesService.getById(idToLoad)
      if (error) {
        logger.error('DEPENSE_FORM_PAGE', 'Erreur chargement programme', error)
      } else {
        setProgramme(data)
      }
    } catch (error) {
      logger.error('DEPENSE_FORM_PAGE', 'Erreur inattendue', error)
    }
  }

  const validateStep1 = (data) => {
    const stepErrors = {}
    if (!data.libelle || data.libelle.trim() === '') {
      stepErrors.libelle = 'Le libellé est requis'
    }
    if (!data.montant || parseFloat(data.montant) <= 0) {
      stepErrors.montant = 'Le montant doit être supérieur à 0'
    }
    if (!data.date_depense) {
      stepErrors.date_depense = 'La date est requise'
    }
    return Object.keys(stepErrors).length > 0 ? stepErrors : null
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('Le fichier ne doit pas dépasser 10MB')
      return
    }

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
    handleChange('justificatif_url', null)
  }

  const handleSubmit = async (data) => {
    setLoading(true)
    try {
      // S'assurer que programme_id est défini
      if (!programmeId && !data.programme_id) {
        toast.error('Le programme est requis')
        return
      }

      const depenseData = {
        programme_id: data.programme_id || programmeId,
        libelle: (data.libelle || '').trim(),
        montant: parseFloat(data.montant) || 0,
        date_depense: data.date_depense || new Date().toISOString().split('T')[0],
        description: (data.description || '').trim() || null,
        reference: (data.reference || '').trim() || null,
        statut: data.statut || 'BROUILLON',
        justificatif_url: data.justificatif_url || null,
      }

      logger.debug('DEPENSE_FORM_PAGE', 'Données à envoyer', depenseData)

      let result
      if (id) {
        result = await programmeDepensesService.update(id, depenseData, file)
        if (result.error) {
          const errorMessage = result.error?.message || result.error?.details || result.error?.hint || 'Erreur lors de la mise à jour de la dépense'
          toast.error(`Erreur: ${errorMessage}`)
          logger.error('DEPENSE_FORM_PAGE', 'Erreur mise à jour dépense', { 
            error: result.error, 
            depenseData,
            hasFile: !!file 
          })
          return
        }
        
        // Afficher un avertissement si le fichier n'a pas pu être uploadé
        if (file && (result.uploadFailed || !result.data?.justificatif_url)) {
          toast.warning('Dépense mise à jour mais le nouveau fichier n\'a pas pu être uploadé. Veuillez vérifier que le bucket "programme-justificatifs" existe dans Supabase Storage. Vous pourrez ajouter le fichier plus tard.')
        } else {
          toast.success('Dépense mise à jour avec succès')
        }
      } else {
        result = await programmeDepensesService.create(depenseData, file)
        if (result.error) {
          const errorMessage = result.error?.message || result.error?.details || result.error?.hint || 'Erreur lors de la création de la dépense'
          toast.error(`Erreur: ${errorMessage}`)
          logger.error('DEPENSE_FORM_PAGE', 'Erreur création dépense', { 
            error: result.error, 
            depenseData,
            hasFile: !!file 
          })
          return
        }
        
        // Afficher un avertissement si le fichier n'a pas pu être uploadé
        if (file && (result.uploadFailed || !result.data?.justificatif_url)) {
          toast.warning('Dépense créée mais le fichier n\'a pas pu être uploadé. Veuillez vérifier que le bucket "programme-justificatifs" existe dans Supabase Storage. Vous pourrez ajouter le fichier plus tard.')
        } else {
          toast.success('Dépense créée avec succès')
        }
      }

      navigate(`/programmes/${depenseData.programme_id}?tab=finances`)
    } catch (error) {
      logger.error('DEPENSE_FORM_PAGE', 'Erreur soumission', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return <LoadingState message="Chargement de la dépense..." />
  }

  // Créer les étapes du formulaire avec accès aux variables du composant
  const steps = [
    {
      title: 'Informations',
      validate: validateStep1,
      content: ({ formData, onChange, errors }) => (
        <div className="depense-form-step">
          <div className="depense-form-step-header">
            <h3>Informations de la dépense</h3>
            <p>Renseignez les informations principales de la dépense</p>
          </div>
          
          {programme && (
            <div className="depense-form-programme-info">
              <Icon name="FolderKanban" size={20} />
              <div>
                <strong>Programme:</strong> {programme.nom}
                {programme.budget && (
                  <span> • Budget: {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'XOF',
                    minimumFractionDigits: 0,
                  }).format(programme.budget)}</span>
                )}
              </div>
            </div>
          )}

          <div className="form-fields-grid">
            <Input
              label="Libellé"
              name="libelle"
              value={formData.libelle}
              onChange={(e) => onChange('libelle', e.target.value)}
              required
              error={errors.libelle}
              placeholder="Ex: Achat matériel informatique"
            />

            <Input
              label="Montant (FCFA)"
              name="montant"
              type="number"
              step="0.01"
              min="0"
              value={formData.montant}
              onChange={(e) => onChange('montant', e.target.value)}
              required
              error={errors.montant}
            />

            <Input
              label="Date de dépense"
              name="date_depense"
              type="date"
              value={formData.date_depense}
              onChange={(e) => onChange('date_depense', e.target.value)}
              required
              error={errors.date_depense}
            />

            <Input
              label="Référence"
              name="reference"
              value={formData.reference}
              onChange={(e) => onChange('reference', e.target.value)}
              placeholder="Ex: FACT-2024-001"
            />
          </div>

          <Select
            label="Statut"
            value={formData.statut}
            onChange={(e) => onChange('statut', e.target.value)}
            options={[
              { value: 'BROUILLON', label: 'Brouillon' },
              { value: 'VALIDE', label: 'Validé' },
              { value: 'PAYE', label: 'Payé' },
              { value: 'ANNULE', label: 'Annulé' },
            ]}
          />
        </div>
      ),
    },
    {
      title: 'Détails',
      content: ({ formData, onChange }) => (
        <div className="depense-form-step">
          <div className="depense-form-step-header">
            <h3>Détails supplémentaires</h3>
            <p>Ajoutez une description détaillée de la dépense</p>
          </div>

          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => onChange('description', e.target.value)}
            isTextArea
            rows={8}
            placeholder="Détails supplémentaires sur la dépense..."
          />
        </div>
      ),
    },
    {
      title: 'Pièce jointe',
      content: ({ formData, onChange }) => (
        <div className="depense-form-step">
          <div className="depense-form-step-header">
            <h3>Pièce justificative</h3>
            <p>Joignez un document justificatif (facture, reçu, etc.)</p>
          </div>

          <div className="file-upload-section">
            {file || filePreview ? (
              <div className="file-preview">
                {filePreview && filePreview.startsWith('data:image/') ? (
                  <>
                    <img src={filePreview} alt="Aperçu" className="file-preview-image" />
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="remove-file-button"
                    >
                      <Icon name="X" size={16} />
                      Supprimer
                    </button>
                  </>
                ) : (
                  <div className="file-preview-info">
                    <Icon name="FileText" size={48} />
                    <p>{file?.name || 'Fichier existant'}</p>
                    {file && <p className="file-size">{(file.size / 1024).toFixed(2)} KB</p>}
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="remove-file-button"
                    >
                      <Icon name="X" size={16} />
                      Supprimer
                    </button>
                  </div>
                )}
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
                  <Icon name="Upload" size={24} />
                  <span>Choisir un fichier</span>
                </label>
                <p className="file-upload-text">ou glissez-déposez un fichier ici</p>
                <p className="file-upload-hint">
                  Formats acceptés: PDF, images (JPG, PNG), Word, Excel - Max 10MB
                </p>
              </div>
            )}
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="depense-form-page">
      <MultiStepForm
        steps={steps}
        initialData={formData}
        onSubmit={handleSubmit}
        onCancel={() => navigate(programmeId ? `/programmes/${programmeId}` : '/programmes')}
        title={id ? 'Modifier la dépense' : 'Nouvelle dépense'}
        loading={loading}
      />
    </div>
  )
}

