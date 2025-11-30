import { supabase } from '@/lib/supabase'
import { candidaturesService } from './candidatures.service'
import { logger } from '@/utils/logger'

/**
 * Service Candidatures Publiques
 * Gère les candidatures soumises sans authentification
 */
export const candidaturesPublicService = {
  /**
   * Soumettre une candidature publique (sans authentification)
   * @param {Object} candidatureData - Données de la candidature
   * @param {Array} documents - Fichiers à uploader
   */
  async submitCandidature(candidatureData, documents = []) {
    try {
      logger.debug('CANDIDATURES_PUBLIC_SERVICE', 'submitCandidature appelé', {
        appelId: candidatureData.appel_id,
        email: candidatureData.email,
      })

      // 1. Créer le candidat
      const candidatData = {
        appel_id: candidatureData.appel_id,
        email: candidatureData.email,
        telephone: candidatureData.telephone,
        nom: candidatureData.nom,
        prenom: candidatureData.prenom,
        raison_sociale: candidatureData.raison_sociale,
        secteur: candidatureData.secteur,
        adresse: candidatureData.adresse,
        region_id: candidatureData.region_id,
        departement_id: candidatureData.departement_id,
        commune_id: candidatureData.commune_id,
        statut: 'NOUVEAU',
        statut_eligibilite: 'EN_ATTENTE_ÉLIGIBILITÉ',
        date_inscription: new Date().toISOString(),
      }

      const { data: candidat, error: candidatError } = await candidaturesService.create(candidatData)

      if (candidatError) {
        logger.error('CANDIDATURES_PUBLIC_SERVICE', 'Erreur création candidat', candidatError)
        throw candidatError
      }

      logger.debug('CANDIDATURES_PUBLIC_SERVICE', 'Candidat créé', { id: candidat.id })

      // 2. Upload des documents
      const uploadedDocuments = []
      if (documents && documents.length > 0) {
        for (const doc of documents) {
          try {
            const { data: uploadedDoc, error: uploadError } = await this.uploadDocument(
              candidat.id,
              candidatureData.appel_id,
              doc
            )

            if (uploadError) {
              logger.error('CANDIDATURES_PUBLIC_SERVICE', 'Erreur upload document', {
                filename: doc.name,
                error: uploadError,
              })
              // Continue même si un document échoue
              continue
            }

            uploadedDocuments.push(uploadedDoc)
          } catch (error) {
            logger.error('CANDIDATURES_PUBLIC_SERVICE', 'Erreur inattendue upload', error)
          }
        }
      }

      logger.info('CANDIDATURES_PUBLIC_SERVICE', 'Candidature soumise avec succès', {
        candidatId: candidat.id,
        documentsCount: uploadedDocuments.length,
      })

      return {
        data: {
          candidat,
          documents: uploadedDocuments,
        },
        error: null,
      }
    } catch (error) {
      logger.error('CANDIDATURES_PUBLIC_SERVICE', 'Erreur globale submitCandidature', error)
      return {
        data: null,
        error: {
          message: error.message || 'Erreur lors de la soumission de la candidature',
          details: error,
        },
      }
    }
  },

  /**
   * Upload un document pour une candidature
   */
  async uploadDocument(candidatId, appelId, file) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${candidatId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `candidatures/${fileName}`

      // Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      // Récupérer l'URL publique
      const {
        data: { publicUrl },
      } = supabase.storage.from('documents').getPublicUrl(filePath)

      // Enregistrer en base de données
      const { data: document, error: dbError } = await supabase
        .from('documents_candidats')
        .insert({
          candidat_id: candidatId,
          appel_id: appelId,
          type_document: file.name.split('.').pop().toUpperCase(), // Extension comme type
          nom_fichier: file.name,
          chemin_fichier: filePath,
          taille_fichier: file.size,
          mime_type: file.type,
        })
        .select()
        .single()

      if (dbError) {
        logger.error('CANDIDATURES_PUBLIC_SERVICE', 'Erreur enregistrement document en BDD', dbError)
        // Supprimer le fichier uploadé si l'enregistrement échoue
        await supabase.storage.from('documents').remove([filePath])
        throw dbError
      }

      return { data: document, error: null }
    } catch (error) {
      logger.error('CANDIDATURES_PUBLIC_SERVICE', 'Erreur uploadDocument', error)
      return { data: null, error }
    }
  },
}

