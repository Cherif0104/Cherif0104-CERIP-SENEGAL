import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'

/**
 * Service Documents - Gestion de l'upload de documents vers Supabase Storage
 */
export const documentsService = {
  /**
   * Types de fichiers acceptés par défaut
   */
  ACCEPTED_TYPES: {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
  },

  /**
   * Taille maximale par défaut (10 MB)
   */
  MAX_FILE_SIZE: 10 * 1024 * 1024,

  /**
   * Valider un fichier
   */
  validateFile(file, acceptedTypes = null, maxSize = null) {
    const types = acceptedTypes || this.ACCEPTED_TYPES
    const maxSizeBytes = maxSize || this.MAX_FILE_SIZE

    if (!file) {
      return { valid: false, error: 'Aucun fichier fourni' }
    }

    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `Le fichier est trop volumineux. Taille maximale: ${Math.round(maxSizeBytes / 1024 / 1024)} MB`,
      }
    }

    // Vérifier le type MIME
    const fileType = file.type
    if (!Object.keys(types).includes(fileType)) {
      return {
        valid: false,
        error: `Type de fichier non accepté. Types acceptés: ${Object.keys(types).join(', ')}`,
      }
    }

    return { valid: true, error: null }
  },

  /**
   * Uploader un fichier vers Supabase Storage
   * @param {File} file - Le fichier à uploader
   * @param {string} bucket - Le bucket de stockage (défaut: 'candidats-documents')
   * @param {string} folder - Dossier dans le bucket (optionnel)
   * @returns {Promise<{data: {path: string, url: string}, error: Error|null}>}
   */
  async uploadFile(file, bucket = 'candidats-documents', folder = '') {
    logger.debug('DOCUMENTS_SERVICE', 'Upload fichier démarré', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      bucket,
      folder,
    })

    try {
      // Validation du fichier
      const validation = this.validateFile(file)
      if (!validation.valid) {
        logger.error('DOCUMENTS_SERVICE', 'Validation échouée', validation.error)
        return { data: null, error: new Error(validation.error) }
      }

      // Générer un nom de fichier unique
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 9)
      const fileExt = file.name.split('.').pop()
      const fileName = `${timestamp}_${randomStr}.${fileExt}`
      const filePath = folder ? `${folder}/${fileName}` : fileName

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

      if (error) {
        logger.error('DOCUMENTS_SERVICE', 'Erreur upload Supabase', error)
        return { data: null, error }
      }

      // Obtenir l'URL publique
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(filePath)

      logger.info('DOCUMENTS_SERVICE', 'Fichier uploadé avec succès', {
        path: data.path,
        publicUrl,
      })

      return {
        data: {
          path: data.path,
          url: publicUrl,
          fileName: file.name,
          size: file.size,
          mimeType: file.type,
        },
        error: null,
      }
    } catch (error) {
      logger.error('DOCUMENTS_SERVICE', 'Erreur inattendue upload', error)
      return { data: null, error }
    }
  },

  /**
   * Uploader plusieurs fichiers
   */
  async uploadFiles(files, bucket = 'candidats-documents', folder = '') {
    logger.debug('DOCUMENTS_SERVICE', 'Upload multiple fichiers', {
      count: files.length,
      bucket,
      folder,
    })

    const results = []
    const errors = []

    for (const file of files) {
      const result = await this.uploadFile(file, bucket, folder)
      if (result.error) {
        errors.push({ fileName: file.name, error: result.error })
      } else {
        results.push(result.data)
      }
    }

    return {
      data: results,
      errors: errors.length > 0 ? errors : null,
    }
  },

  /**
   * Supprimer un fichier
   */
  async deleteFile(path, bucket = 'candidats-documents') {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path])
      if (error) {
        logger.error('DOCUMENTS_SERVICE', 'Erreur suppression fichier', error)
        return { error }
      }
      logger.info('DOCUMENTS_SERVICE', 'Fichier supprimé', { path })
      return { error: null }
    } catch (error) {
      logger.error('DOCUMENTS_SERVICE', 'Erreur inattendue suppression', error)
      return { error }
    }
  },
}

