import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'
import { documentsService } from './documents.service'

/**
 * Service Programme Depenses - Gestion des dépenses détaillées des programmes
 */
export const programmeDepensesService = {
  /**
   * Récupérer toutes les dépenses d'un programme
   */
  async getByProgramme(programmeId, options = {}) {
    try {
      logger.debug('PROGRAMME_DEPENSES_SERVICE', 'getByProgramme appelé', { programmeId, options })
      
      let query = supabase
        .from('programme_depenses')
        .select('*')
        .eq('programme_id', programmeId)
        .order('date_depense', { ascending: false })

      if (options.filters) {
        if (options.filters.statut) {
          query = query.eq('statut', options.filters.statut)
        }
        if (options.filters.dateDebut) {
          query = query.gte('date_depense', options.filters.dateDebut)
        }
        if (options.filters.dateFin) {
          query = query.lte('date_depense', options.filters.dateFin)
        }
      }

      const { data, error } = await query

      if (error) {
        logger.error('PROGRAMME_DEPENSES_SERVICE', 'Erreur getByProgramme', error)
        throw error
      }

      logger.debug('PROGRAMME_DEPENSES_SERVICE', `getByProgramme réussi: ${data?.length || 0} dépenses`)
      return { data: data || [], error: null }
    } catch (error) {
      logger.error('PROGRAMME_DEPENSES_SERVICE', 'Erreur globale getByProgramme', error)
      return { data: [], error }
    }
  },

  /**
   * Récupérer une dépense par ID
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('programme_depenses')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      logger.error('PROGRAMME_DEPENSES_SERVICE', 'Erreur getById', error)
      return { data: null, error }
    }
  },

  /**
   * Créer une dépense
   */
  async create(depenseData, file = null) {
    try {
      logger.debug('PROGRAMME_DEPENSES_SERVICE', 'create appelé', { depenseData })
      
      // Upload du fichier si fourni (on continue même si l'upload échoue)
      let justificatifUrl = depenseData.justificatif_url || null
      let uploadFailed = false
      if (file) {
        try {
          const uploadResult = await documentsService.uploadFile(
            file,
            'programme-justificatifs',
            `${depenseData.programme_id}`
          )
          if (uploadResult.error) {
            logger.error('PROGRAMME_DEPENSES_SERVICE', 'Erreur upload fichier', uploadResult.error)
            uploadFailed = true
            // On continue quand même la création de la dépense sans le fichier
            // L'utilisateur pourra l'ajouter plus tard
            logger.warn('PROGRAMME_DEPENSES_SERVICE', 'Création de la dépense sans justificatif suite à l\'erreur d\'upload')
          } else {
            justificatifUrl = uploadResult.data?.url || uploadResult.data?.path
          }
        } catch (uploadError) {
          logger.error('PROGRAMME_DEPENSES_SERVICE', 'Erreur exception upload', uploadError)
          uploadFailed = true
          // On continue quand même
        }
      }

      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser()
      
      // Valider les champs requis
      if (!depenseData.programme_id) {
        throw new Error('programme_id est requis')
      }
      
      const libelle = depenseData.libelle?.trim()
      if (!libelle || libelle === '') {
        throw new Error('libelle est requis et ne peut pas être vide')
      }
      
      // S'assurer que le montant est un nombre valide
      let montant = typeof depenseData.montant === 'string' 
        ? parseFloat(depenseData.montant.replace(/,/g, '.').replace(/\s/g, '')) 
        : parseFloat(depenseData.montant)
      
      if (isNaN(montant) || montant <= 0) {
        throw new Error('montant doit être un nombre positif supérieur à 0')
      }
      
      // Arrondir à 2 décimales pour NUMERIC(15, 2)
      montant = Math.round(montant * 100) / 100
      
      if (!depenseData.date_depense) {
        throw new Error('date_depense est requis')
      }

      // Formater la date au format DATE (YYYY-MM-DD) si c'est un timestamp
      let dateDepense = depenseData.date_depense.toString().trim()
      if (dateDepense.includes('T')) {
        dateDepense = dateDepense.split('T')[0]
      }
      
      // Valider le format de date (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(dateDepense)) {
        throw new Error('Format de date invalide. Format attendu: YYYY-MM-DD')
      }

      // Valider le statut
      const statutsValides = ['BROUILLON', 'VALIDE', 'PAYE', 'ANNULE']
      const statut = depenseData.statut && statutsValides.includes(depenseData.statut) 
        ? depenseData.statut 
        : 'BROUILLON'
      
      // Préparer les données à insérer avec seulement les colonnes valides
      const dataToInsert = {
        programme_id: depenseData.programme_id.toString().trim(),
        libelle: libelle,
        montant: montant,
        date_depense: dateDepense,
        description: depenseData.description?.trim() || null,
        reference: depenseData.reference?.trim() || null,
        statut: statut,
        justificatif_url: justificatifUrl,
        created_by: user?.id || null,
      }
      
      // S'assurer qu'on n'envoie pas de valeurs undefined
      Object.keys(dataToInsert).forEach(key => {
        if (dataToInsert[key] === undefined) {
          delete dataToInsert[key]
        }
      })

      logger.debug('PROGRAMME_DEPENSES_SERVICE', 'Données à insérer', dataToInsert)
      
      // Vérifier que le programme existe avant l'insertion
      const { data: programmeExists, error: programmeError } = await supabase
        .from('programmes')
        .select('id')
        .eq('id', dataToInsert.programme_id)
        .single()
      
      if (programmeError || !programmeExists) {
        logger.error('PROGRAMME_DEPENSES_SERVICE', 'Programme non trouvé', {
          programme_id: dataToInsert.programme_id,
          error: programmeError
        })
        throw new Error(`Le programme avec l'ID "${dataToInsert.programme_id}" n'existe pas ou n'est pas accessible.`)
      }

      // Utiliser la fonction SQL SECURITY DEFINER pour éviter les problèmes de volatilité avec PostgREST
      const { data: functionResult, error: functionError } = await supabase.rpc('insert_programme_depense', {
        p_programme_id: dataToInsert.programme_id,
        p_libelle: dataToInsert.libelle,
        p_montant: dataToInsert.montant,
        p_date_depense: dataToInsert.date_depense,
        p_description: dataToInsert.description,
        p_reference: dataToInsert.reference,
        p_statut: dataToInsert.statut,
        p_justificatif_url: dataToInsert.justificatif_url,
        p_created_by: dataToInsert.created_by
      })

      // La fonction RPC retourne un tableau, prendre le premier élément
      let data = functionResult && functionResult.length > 0 ? functionResult[0] : null
      let error = functionError

      // Si la fonction a réussi, récupérer les données complètes de la dépense créée
      if (!error && data && data.id) {
        const { data: fullData, error: selectError } = await supabase
          .from('programme_depenses')
          .select('id, programme_id, libelle, montant, date_depense, statut, reference, justificatif_url, description, created_by, created_at')
          .eq('id', data.id)
          .single()
        
        if (selectError) {
          // Si on ne peut pas récupérer les données complètes, utiliser celles de la fonction
          logger.warn('PROGRAMME_DEPENSES_SERVICE', 'Impossible de récupérer les données complètes, utilisation des données de la fonction', selectError)
        } else if (fullData) {
          // Utiliser les données complètes
          data = fullData
        }
      }

      if (error) {
        // Logger toutes les informations disponibles sur l'erreur
        const errorDetails = {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          statusCode: error.statusCode,
          dataToInsert: JSON.stringify(dataToInsert, null, 2),
          user: user ? { id: user.id, email: user.email } : null,
        }
        
        logger.error('PROGRAMME_DEPENSES_SERVICE', 'Erreur détaillée Supabase', errorDetails)
        
        // Afficher aussi dans la console pour debug
        console.error('❌ ERREUR CRÉATION DÉPENSE:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          dataToInsert,
        })
        
        // Créer un message d'erreur plus informatif
        let userMessage = error.message || 'Erreur lors de la création de la dépense'
        
        if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
          userMessage = 'Permissions insuffisantes. Vérifiez que votre rôle vous permet de créer des dépenses.'
        } else if (error.code === '23503' || error.message?.includes('foreign key')) {
          userMessage = 'Le programme spécifié n\'existe pas ou n\'est pas accessible.'
        } else if (error.code === '23514' || error.message?.includes('check constraint')) {
          userMessage = 'Les données fournies ne respectent pas les contraintes (statut invalide, etc.).'
        } else if (error.code === 'PGRST116') {
          userMessage = 'Erreur de format de données. Vérifiez que tous les champs sont correctement remplis.'
        } else if (error.details) {
          userMessage = `${error.message}: ${error.details}`
        } else if (error.hint) {
          userMessage = `${error.message} (${error.hint})`
        }
        
        const enhancedError = new Error(userMessage)
        enhancedError.originalError = error
        enhancedError.details = errorDetails
        throw enhancedError
      }

      logger.info('PROGRAMME_DEPENSES_SERVICE', 'Dépense créée avec succès', { id: data.id, uploadFailed })
      
      // Ajouter une métadonnée pour indiquer si l'upload a échoué
      if (uploadFailed) {
        data._uploadFailed = true
      }
      
      return { data, error: null, uploadFailed }
    } catch (error) {
      logger.error('PROGRAMME_DEPENSES_SERVICE', 'Erreur create', {
        error,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        depenseData
      })
      return { 
        data: null, 
        error: {
          message: error?.message || 'Erreur lors de la création de la dépense',
          details: error?.details,
          hint: error?.hint
        }
      }
    }
  },

  /**
   * Mettre à jour une dépense
   */
  async update(id, depenseData, file = null) {
    try {
      logger.debug('PROGRAMME_DEPENSES_SERVICE', 'update appelé', { id, depenseData })
      
      // Upload du nouveau fichier si fourni (on continue même si l'upload échoue)
      let justificatifUrl = depenseData.justificatif_url
      let uploadFailed = false
      if (file) {
        try {
          const uploadResult = await documentsService.uploadFile(
            file,
            'programme-justificatifs',
            `${depenseData.programme_id}`
          )
          if (uploadResult.error) {
            logger.error('PROGRAMME_DEPENSES_SERVICE', 'Erreur upload fichier', uploadResult.error)
            uploadFailed = true
            // On continue quand même la mise à jour sans le fichier
            logger.warn('PROGRAMME_DEPENSES_SERVICE', 'Mise à jour de la dépense sans nouveau justificatif suite à l\'erreur d\'upload')
          } else {
            justificatifUrl = uploadResult.data?.url || uploadResult.data?.path
          }
        } catch (uploadError) {
          logger.error('PROGRAMME_DEPENSES_SERVICE', 'Erreur exception upload', uploadError)
          uploadFailed = true
          // On continue quand même
        }
      }

      // Utiliser la fonction SQL SECURITY DEFINER pour éviter les problèmes de volatilité avec PostgREST
      const { data: functionResult, error: functionError } = await supabase.rpc('update_programme_depense', {
        p_id: id,
        p_programme_id: depenseData.programme_id || null,
        p_libelle: depenseData.libelle || null,
        p_montant: depenseData.montant || null,
        p_date_depense: depenseData.date_depense || null,
        p_description: depenseData.description || null,
        p_reference: depenseData.reference || null,
        p_statut: depenseData.statut || null,
        p_justificatif_url: justificatifUrl || null
      })

      // La fonction RPC retourne un tableau, prendre le premier élément
      let data = functionResult && functionResult.length > 0 ? functionResult[0] : null
      let error = functionError

      // Si la fonction a réussi mais qu'on n'a pas de données, récupérer les données complètes
      if (!error && !data) {
        const { data: fullData, error: selectError } = await supabase
          .from('programme_depenses')
          .select('*')
          .eq('id', id)
          .single()
        
        if (selectError) {
          logger.warn('PROGRAMME_DEPENSES_SERVICE', 'Impossible de récupérer les données complètes après mise à jour', selectError)
        } else if (fullData) {
          data = fullData
        }
      }

      if (error) {
        // Logger toutes les informations disponibles sur l'erreur
        const errorDetails = {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          statusCode: error.statusCode,
          dataToUpdate: JSON.stringify(dataToUpdate, null, 2),
        }
        
        logger.error('PROGRAMME_DEPENSES_SERVICE', 'Erreur détaillée Supabase update', errorDetails)
        
        // Afficher aussi dans la console pour debug
        console.error('❌ ERREUR MISE À JOUR DÉPENSE:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          dataToUpdate,
        })
        
        // Créer un message d'erreur plus informatif
        let userMessage = error.message || 'Erreur lors de la mise à jour de la dépense'
        
        if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
          userMessage = 'Permissions insuffisantes. Vérifiez que votre rôle vous permet de modifier des dépenses.'
        } else if (error.code === '23503' || error.message?.includes('foreign key')) {
          userMessage = 'Le programme spécifié n\'existe pas ou n\'est pas accessible.'
        } else if (error.code === '23514' || error.message?.includes('check constraint')) {
          userMessage = 'Les données fournies ne respectent pas les contraintes (statut invalide, etc.).'
        } else if (error.code === 'PGRST116') {
          userMessage = 'Erreur de format de données. Vérifiez que tous les champs sont correctement remplis.'
        } else if (error.details) {
          userMessage = `${error.message}: ${error.details}`
        } else if (error.hint) {
          userMessage = `${error.message} (${error.hint})`
        }
        
        const enhancedError = new Error(userMessage)
        enhancedError.originalError = error
        enhancedError.details = errorDetails
        throw enhancedError
      }

      logger.info('PROGRAMME_DEPENSES_SERVICE', 'Dépense mise à jour avec succès', { id, uploadFailed })
      
      // Ajouter une métadonnée pour indiquer si l'upload a échoué
      if (uploadFailed) {
        data._uploadFailed = true
      }
      
      return { data, error: null, uploadFailed }
    } catch (error) {
      logger.error('PROGRAMME_DEPENSES_SERVICE', 'Erreur update', error)
      return { data: null, error }
    }
  },

  /**
   * Supprimer une dépense
   */
  async delete(id) {
    try {
      logger.debug('PROGRAMME_DEPENSES_SERVICE', 'delete appelé', { id })

      // Utiliser la fonction SQL SECURITY DEFINER pour éviter les problèmes de volatilité avec PostgREST
      const { data, error } = await supabase.rpc('delete_programme_depense', {
        p_id: id
      })

      if (error) {
        // Logger toutes les informations disponibles sur l'erreur
        const errorDetails = {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          statusCode: error.statusCode,
        }
        
        logger.error('PROGRAMME_DEPENSES_SERVICE', 'Erreur détaillée Supabase delete', errorDetails)
        
        // Afficher aussi dans la console pour debug
        console.error('❌ ERREUR SUPPRESSION DÉPENSE:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        })
        
        // Créer un message d'erreur plus informatif
        let userMessage = error.message || 'Erreur lors de la suppression de la dépense'
        
        if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
          userMessage = 'Permissions insuffisantes. Vérifiez que votre rôle vous permet de supprimer des dépenses.'
        } else if (error.details) {
          userMessage = `${error.message}: ${error.details}`
        } else if (error.hint) {
          userMessage = `${error.message} (${error.hint})`
        }
        
        const enhancedError = new Error(userMessage)
        enhancedError.originalError = error
        enhancedError.details = errorDetails
        throw enhancedError
      }

      logger.info('PROGRAMME_DEPENSES_SERVICE', 'Dépense supprimée avec succès', { id: data || id })
      return { data: { id: data || id }, error: null }
    } catch (error) {
      logger.error('PROGRAMME_DEPENSES_SERVICE', 'Erreur delete', error)
      return { 
        data: null, 
        error: {
          message: error?.message || 'Erreur lors de la suppression de la dépense',
          details: error?.details,
          hint: error?.hint
        }
      }
    }
  },

  /**
   * Obtenir les statistiques de dépenses pour un programme
   * 
   * Règle de calcul du budget consommé (reporting) :
   * - Inclut les dépenses avec statut : PAYE, VALIDE, APPROUVE, APPROVED
   * - Mode reporting : engagements pris (même si non payés)
   * - Mode cashflow : uniquement les dépenses payées
   */
  async getStats(programmeId, mode = 'reporting') {
    try {
      logger.debug('PROGRAMME_DEPENSES_SERVICE', 'Calcul stats dépenses', { programmeId, mode })
      
      const { data: depenses, error } = await supabase
        .from('programme_depenses')
        .select('montant, date_depense, statut')
        .eq('programme_id', programmeId)

      if (error) {
        logger.error('PROGRAMME_DEPENSES_SERVICE', 'Erreur récupération dépenses', error)
        throw error
      }

      logger.debug('PROGRAMME_DEPENSES_SERVICE', `Dépenses trouvées: ${depenses?.length || 0}`, {
        depenses: depenses?.map(d => ({ statut: d.statut, montant: d.montant }))
      })

      // Normaliser et parser les montants
      const parseMontant = (montant) => {
        if (!montant) return 0
        // Gérer les chaînes avec espaces (ex: "1 000 000")
        const cleaned = String(montant).replace(/\s/g, '').replace(/,/g, '.')
        const parsed = parseFloat(cleaned)
        return isNaN(parsed) ? 0 : parsed
      }

      // Statuts de consommation selon le mode
      const getStatusesForConsumption = () => {
        if (mode === 'cashflow') {
          // Cash flow : uniquement les dépenses payées
          return ['PAYE', 'PAYÉ', 'PAID', 'paye', 'payé', 'paid']
        } else {
          // Reporting : engagements pris (VALIDÉ, APPROUVÉ, PAYÉ)
          return [
            'PAYE', 'PAYÉ', 'PAID', 'paye', 'payé', 'paid',
            'VALIDE', 'VALIDÉ', 'VALIDATED', 'valide', 'validé', 'validated',
            'APPROUVE', 'APPROUVÉ', 'APPROVED', 'approuve', 'approuvé', 'approved'
          ]
        }
      }

      const statusesConsommation = getStatusesForConsumption()
      
      // Normaliser les statuts pour comparaison (insensible à la casse)
      const normalizeStatut = (statut) => {
        if (!statut) return ''
        return String(statut).toUpperCase().trim()
      }

      // Calculer les totaux
      let totalDepense = 0
      let depensesValidees = 0
      let depensesPayees = 0
      let depensesEnAttente = 0
      let depensesAnnulees = 0

      depenses?.forEach(d => {
        const montant = parseMontant(d.montant)
        const statutNormalise = normalizeStatut(d.statut)
        
        totalDepense += montant

        // Vérifier si le statut est dans la liste de consommation
        const isConsommation = statusesConsommation.some(s => normalizeStatut(s) === statutNormalise)
        
        if (isConsommation) {
          depensesValidees += montant
        }

        // Détail par statut
        if (statutNormalise === 'PAYE' || statutNormalise === 'PAYÉ' || statutNormalise === 'PAID') {
          depensesPayees += montant
        } else if (statutNormalise === 'BROUILLON' || statutNormalise === 'DRAFT' || statutNormalise === 'PENDING') {
          depensesEnAttente += montant
        } else if (statutNormalise === 'ANNULE' || statutNormalise === 'CANCELLED' || statutNormalise === 'CANCELED') {
          depensesAnnulees += montant
        }
      })

      // Récupérer le budget du programme
      const { data: programme, error: progError } = await supabase
        .from('programmes')
        .select('budget')
        .eq('id', programmeId)
        .single()

      if (progError) {
        logger.error('PROGRAMME_DEPENSES_SERVICE', 'Erreur récupération programme', progError)
      }

      const budgetTotal = parseMontant(programme?.budget || 0)
      const budgetConsomme = depensesValidees // Budget consommé = somme des dépenses avec statut de consommation
      const budgetRestant = budgetTotal - budgetConsomme
      const tauxConsommation = budgetTotal > 0 ? (budgetConsomme / budgetTotal) * 100 : 0

      const stats = {
        totalDepense,
        depensesValidees: budgetConsomme, // Alias pour compatibilité
        budgetConsomme, // Budget consommé (reporting)
        depensesPayees,
        depensesEnAttente,
        depensesAnnulees,
        budgetTotal,
        budgetRestant,
        tauxConsommation: Math.round(tauxConsommation * 100) / 100,
        nombreDepenses: depenses?.length || 0,
        mode, // Indiquer le mode utilisé
      }

      logger.debug('PROGRAMME_DEPENSES_SERVICE', 'Stats calculées', stats)

      return {
        data: stats,
        error: null
      }
    } catch (error) {
      logger.error('PROGRAMME_DEPENSES_SERVICE', 'Erreur getStats', error)
      return { data: null, error }
    }
  },

  /**
   * Obtenir l'évolution temporelle des dépenses pour un programme
   */
  async getEvolutionData(programmeId, groupBy = 'month') {
    try {
      const { data: depenses, error } = await supabase
        .from('programme_depenses')
        .select('montant, date_depense, statut')
        .eq('programme_id', programmeId)
        .order('date_depense', { ascending: true })

      if (error) throw error

      if (!depenses || depenses.length === 0) {
        return {
          data: [],
          error: null
        }
      }

      // Grouper par période
      const grouped = {}
      depenses.forEach(d => {
        const date = new Date(d.date_depense)
        let key

        if (groupBy === 'month') {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        } else if (groupBy === 'week') {
          const week = Math.ceil(date.getDate() / 7)
          key = `${date.getFullYear()}-W${String(week).padStart(2, '0')}`
        } else {
          key = date.toISOString().split('T')[0]
        }

        if (!grouped[key]) {
          grouped[key] = {
            periode: key,
            total: 0,
            validees: 0,
            payees: 0,
            brouillons: 0,
            count: 0
          }
        }

        grouped[key].total += parseFloat(d.montant || 0)
        grouped[key].count += 1

        if (d.statut === 'VALIDE') {
          grouped[key].validees += parseFloat(d.montant || 0)
        } else if (d.statut === 'PAYE') {
          grouped[key].payees += parseFloat(d.montant || 0)
          grouped[key].validees += parseFloat(d.montant || 0) // Payées = validées aussi
        } else if (d.statut === 'BROUILLON') {
          grouped[key].brouillons += parseFloat(d.montant || 0)
        }
      })

      const result = Object.values(grouped).sort((a, b) => a.periode.localeCompare(b.periode))

      return {
        data: result,
        error: null
      }
    } catch (error) {
      logger.error('PROGRAMME_DEPENSES_SERVICE', 'Erreur getEvolutionData', error)
      return { data: null, error }
    }
  },
}

