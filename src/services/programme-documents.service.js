// Service de gestion documentaire des programmes
import { supabase } from '../lib/supabase'

const TABLE = 'programme_documents'
const TABLE_VERSIONS = 'programme_document_versions'
const STORAGE_BUCKET = 'programme-documents'

export const programmeDocumentsService = {
  /**
   * Initialise le bucket de stockage si nécessaire
   */
  async initStorage() {
    try {
      // Vérifier si le bucket existe
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      
      if (listError) {
        console.error('Error listing buckets:', listError)
        return { error: listError }
      }

      const bucketExists = buckets?.some(b => b.name === STORAGE_BUCKET)
      
      if (!bucketExists) {
        // Le bucket sera créé manuellement dans Supabase Dashboard
        console.warn(`Bucket ${STORAGE_BUCKET} n'existe pas. Veuillez le créer dans Supabase Dashboard.`)
      }

      return { data: { bucket: STORAGE_BUCKET }, error: null }
    } catch (error) {
      console.error('Error initializing storage:', error)
      return { data: null, error }
    }
  },

  /**
   * Récupère tous les documents d'un programme
   */
  async getAll(programmeId, filters = {}) {
    try {
      let query = supabase
        .from(TABLE)
        .select('*')
        .eq('programme_id', programmeId)

      if (filters.type) {
        query = query.eq('type', filters.type)
      }

      if (filters.statut) {
        query = query.eq('statut', filters.statut)
      }

      const { data, error } = await query.order('date_upload', { ascending: false })

      return { data: data || [], error }
    } catch (error) {
      console.error('Error fetching documents:', error)
      return { data: [], error }
    }
  },

  /**
   * Récupère un document par ID
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('id', id)
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error fetching document:', error)
      return { data: null, error }
    }
  },

  /**
   * Récupère les versions d'un document
   */
  async getVersions(documentId) {
    try {
      const { data, error } = await supabase
        .from(TABLE_VERSIONS)
        .select('*')
        .eq('document_id', documentId)
        .order('version', { ascending: false })

      return { data: data || [], error }
    } catch (error) {
      console.error('Error fetching document versions:', error)
      return { data: [], error }
    }
  },

  /**
   * Upload un fichier vers Supabase Storage
   */
  async uploadFile(file, programmeId, documentType) {
    try {
      // Générer un nom de fichier unique
      const timestamp = Date.now()
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = `${programmeId}/${documentType}/${timestamp}_${sanitizedName}`

      // Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Error uploading file:', uploadError)
        return { data: null, error: uploadError }
      }

      // Récupérer l'URL publique
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath)

      return {
        data: {
          path: filePath,
          url: urlData.publicUrl,
          size: file.size,
          mimeType: file.type
        },
        error: null
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      return { data: null, error }
    }
  },

  /**
   * Crée un nouveau document
   */
  async create(document, file) {
    try {
      let uploadResult = null

      // Upload du fichier si fourni
      if (file) {
        uploadResult = await this.uploadFile(file, document.programme_id, document.type)
        if (uploadResult.error) {
          return { data: null, error: uploadResult.error }
        }
      } else if (!document.fichier_url) {
        return { data: null, error: { message: 'Fichier requis' } }
      }

      const documentData = {
        programme_id: document.programme_id,
        type: document.type,
        nom: document.nom,
        description: document.description || null,
        fichier_url: uploadResult?.data?.url || document.fichier_url,
        fichier_path: uploadResult?.data?.path || document.fichier_path || '',
        taille: uploadResult?.data?.size || document.taille || null,
        mime_type: uploadResult?.data?.mimeType || document.mime_type || null,
        version: 1,
        statut: document.statut || 'BROUILLON',
        date_expiration: document.date_expiration || null
      }

      const { data, error } = await supabase
        .from(TABLE)
        .insert(documentData)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating document:', error)
      return { data: null, error }
    }
  },

  /**
   * Met à jour un document
   */
  async update(id, document, newFile = null) {
    try {
      const updateData = {
        type: document.type,
        nom: document.nom,
        description: document.description,
        statut: document.statut,
        date_expiration: document.date_expiration || null
      }

      // Si un nouveau fichier est fourni, créer une nouvelle version
      if (newFile) {
        const currentDoc = await this.getById(id)
        if (currentDoc.data) {
          // Sauvegarder l'ancienne version
          await supabase
            .from(TABLE_VERSIONS)
            .insert({
              document_id: id,
              version: currentDoc.data.version,
              fichier_url: currentDoc.data.fichier_url,
              fichier_path: currentDoc.data.fichier_path,
              taille: currentDoc.data.taille,
              mime_type: currentDoc.data.mime_type
            })

          // Upload du nouveau fichier
          const uploadResult = await this.uploadFile(
            newFile,
            currentDoc.data.programme_id,
            document.type
          )

          if (uploadResult.error) {
            return { data: null, error: uploadResult.error }
          }

          updateData.fichier_url = uploadResult.data.url
          updateData.fichier_path = uploadResult.data.path
          updateData.taille = uploadResult.data.size
          updateData.mime_type = uploadResult.data.mimeType
          updateData.version = currentDoc.data.version + 1
        }
      }

      const { data, error } = await supabase
        .from(TABLE)
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating document:', error)
      return { data: null, error }
    }
  },

  /**
   * Supprime un document
   */
  async delete(id) {
    try {
      // Récupérer le document pour supprimer le fichier
      const { data: document } = await this.getById(id)
      
      if (document?.fichier_path) {
        // Supprimer le fichier du storage
        const { error: storageError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([document.fichier_path])

        if (storageError) {
          console.warn('Error deleting file from storage:', storageError)
        }
      }

      // Supprimer le document de la base
      const { error } = await supabase
        .from(TABLE)
        .delete()
        .eq('id', id)

      return { data: { id }, error }
    } catch (error) {
      console.error('Error deleting document:', error)
      return { data: null, error }
    }
  },

  /**
   * Télécharge un fichier
   */
  async downloadFile(filePath) {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .download(filePath)

      return { data, error }
    } catch (error) {
      console.error('Error downloading file:', error)
      return { data: null, error }
    }
  },

  /**
   * Récupère l'URL publique d'un fichier
   */
  getPublicUrl(filePath) {
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath)

    return data.publicUrl
  },

  /**
   * Valide un document
   */
  async validate(id) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .update({ statut: 'VALIDE' })
        .eq('id', id)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error validating document:', error)
      return { data: null, error }
    }
  },

  /**
   * Archive un document
   */
  async archive(id) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .update({ statut: 'ARCHIVE' })
        .eq('id', id)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error archiving document:', error)
      return { data: null, error }
    }
  }
}

