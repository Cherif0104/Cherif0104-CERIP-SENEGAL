import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'
import { documentsService } from './documents.service'
import { projetsService } from './projets.service'

/**
 * Service Projet Depenses - Gestion des dépenses détaillées des projets
 * Les dépenses projet sont comptabilisées dans le budget programme
 */
export const projetDepensesService = {
  /**
   * Récupérer toutes les dépenses d'un projet
   */
  async getByProjet(projetId, options = {}) {
    try {
      logger.debug('PROJET_DEPENSES_SERVICE', 'getByProjet appelé', { projetId, options })
      
      // Récupérer le projet pour obtenir son programme_id
      const { data: projet, error: projetError } = await projetsService.getById(projetId)
      if (projetError || !projet) {
        logger.error('PROJET_DEPENSES_SERVICE', 'Erreur récupération projet', projetError)
        return { data: [], error: projetError || new Error('Projet non trouvé') }
      }

      let query = supabase
        .from('programme_depenses')
        .select('*')
        .eq('programme_id', projet.programme_id)
        .eq('projet_id', projetId)
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
        logger.error('PROJET_DEPENSES_SERVICE', 'Erreur getByProjet', error)
        throw error
      }

      logger.debug('PROJET_DEPENSES_SERVICE', `getByProjet réussi: ${data?.length || 0} dépenses`)
      return { data: data || [], error: null }
    } catch (error) {
      logger.error('PROJET_DEPENSES_SERVICE', 'Erreur globale getByProjet', error)
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
      logger.error('PROJET_DEPENSES_SERVICE', 'Erreur getById', error)
      return { data: null, error }
    }
  },

  /**
   * Créer une dépense pour un projet
   */
  async create(depenseData, file = null) {
    try {
      logger.debug('PROJET_DEPENSES_SERVICE', 'create appelé', { depenseData })
      
      // Récupérer le projet pour obtenir programme_id
      if (!depenseData.projet_id) {
        throw new Error('projet_id est requis')
      }

      const { data: projet, error: projetError } = await projetsService.getById(depenseData.projet_id)
      if (projetError || !projet) {
        throw new Error('Projet non trouvé')
      }

      // Vérifier limites de période si configurées
      if (depenseData.montant) {
        const limiteCheck = await this.checkLimitesPeriode(
          depenseData.projet_id,
          depenseData.date_depense,
          parseFloat(depenseData.montant)
        )
        if (limiteCheck.error) {
          return { data: null, error: limiteCheck.error }
        }
        if (limiteCheck.warning) {
          logger.warn('PROJET_DEPENSES_SERVICE', 'Alerte limite dépense', limiteCheck.warning)
        }
      }

      // Upload du fichier si fourni
      let justificatifUrl = depenseData.justificatif_url || null
      let uploadFailed = false
      if (file) {
        try {
          const uploadResult = await documentsService.uploadFile(
            file,
            'programme-justificatifs',
            `${projet.programme_id}`
          )
          if (uploadResult.error) {
            logger.error('PROJET_DEPENSES_SERVICE', 'Erreur upload fichier', uploadResult.error)
            uploadFailed = true
            logger.warn('PROJET_DEPENSES_SERVICE', 'Création de la dépense sans justificatif suite à l\'erreur d\'upload')
          } else {
            justificatifUrl = uploadResult.data?.url || uploadResult.data?.path
          }
        } catch (uploadError) {
          logger.error('PROJET_DEPENSES_SERVICE', 'Erreur exception upload', uploadError)
          uploadFailed = true
        }
      }

      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser()
      
      // Valider les champs requis
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
      
      // Arrondir à 2 décimales
      montant = Math.round(montant * 100) / 100
      
      if (!depenseData.date_depense) {
        throw new Error('date_depense est requis')
      }

      // Formater la date
      let dateDepense = depenseData.date_depense.toString().trim()
      if (dateDepense.includes('T')) {
        dateDepense = dateDepense.split('T')[0]
      }
      
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(dateDepense)) {
        throw new Error('Format de date invalide. Format attendu: YYYY-MM-DD')
      }

      // Valider le statut
      const statutsValides = ['BROUILLON', 'VALIDE', 'PAYE', 'ANNULE']
      const statut = depenseData.statut && statutsValides.includes(depenseData.statut) 
        ? depenseData.statut 
        : 'BROUILLON'

      // Préparer les données avec programme_id ET projet_id
      const dataToInsert = {
        programme_id: projet.programme_id.toString().trim(),
        projet_id: depenseData.projet_id,
        libelle: libelle,
        montant: montant,
        date_depense: dateDepense,
        description: depenseData.description?.trim() || null,
        reference: depenseData.reference?.trim() || null,
        statut: statut,
        justificatif_url: justificatifUrl,
        created_by: user?.id || null,
      }

      // Utiliser la fonction SQL SECURITY DEFINER
      const { data: functionResult, error: functionError } = await supabase.rpc('create_programme_depense', {
        p_programme_id: dataToInsert.programme_id,
        p_projet_id: dataToInsert.projet_id,
        p_libelle: dataToInsert.libelle,
        p_montant: dataToInsert.montant,
        p_date_depense: dataToInsert.date_depense,
        p_description: dataToInsert.description,
        p_reference: dataToInsert.reference,
        p_statut: dataToInsert.statut,
        p_justificatif_url: dataToInsert.justificatif_url
      })

      let data = functionResult
      let error = functionError

      // Si la fonction a réussi, récupérer les données complètes
      if (!error && data && data.id) {
        const { data: fullData, error: selectError } = await supabase
          .from('programme_depenses')
          .select('id, programme_id, projet_id, libelle, montant, date_depense, statut, reference, justificatif_url, description, created_by, created_at')
          .eq('id', data.id)
          .single()
        
        if (selectError) {
          logger.warn('PROJET_DEPENSES_SERVICE', 'Impossible de récupérer les données complètes', selectError)
        } else if (fullData) {
          data = fullData
        }
      }

      if (error) {
        logger.error('PROJET_DEPENSES_SERVICE', 'Erreur création dépense', error)
        throw error
      }

      logger.info('PROJET_DEPENSES_SERVICE', 'Dépense créée avec succès', { id: data.id, uploadFailed })
      
      if (uploadFailed) {
        data._uploadFailed = true
      }
      
      return { data, error: null, uploadFailed }
    } catch (error) {
      logger.error('PROJET_DEPENSES_SERVICE', 'Erreur create', error)
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
      logger.debug('PROJET_DEPENSES_SERVICE', 'update appelé', { id, depenseData })
      
      // Récupérer la dépense existante
      const { data: depenseExistante, error: fetchError } = await this.getById(id)
      if (fetchError || !depenseExistante) {
        throw new Error('Dépense non trouvée')
      }

      // Vérifier limites si montant modifié
      if (depenseData.montant && depenseData.montant !== depenseExistante.montant) {
        const limiteCheck = await this.checkLimitesPeriode(
          depenseExistante.projet_id,
          depenseExistante.date_depense,
          parseFloat(depenseData.montant)
        )
        if (limiteCheck.error) {
          return { data: null, error: limiteCheck.error }
        }
      }

      // Upload du nouveau fichier si fourni
      let justificatifUrl = depenseData.justificatif_url || depenseExistante.justificatif_url
      let uploadFailed = false
      if (file) {
        try {
          const uploadResult = await documentsService.uploadFile(
            file,
            'programme-justificatifs',
            `${depenseExistante.programme_id}`
          )
          if (uploadResult.error) {
            logger.error('PROJET_DEPENSES_SERVICE', 'Erreur upload fichier', uploadResult.error)
            uploadFailed = true
          } else {
            justificatifUrl = uploadResult.data?.url || uploadResult.data?.path
          }
        } catch (uploadError) {
          logger.error('PROJET_DEPENSES_SERVICE', 'Erreur exception upload', uploadError)
          uploadFailed = true
        }
      }

      // Préparer les données
      let montant = depenseData.montant
      if (montant) {
        montant = typeof montant === 'string' 
          ? parseFloat(montant.replace(/,/g, '.').replace(/\s/g, '')) 
          : parseFloat(montant)
        if (!isNaN(montant) && montant > 0) {
          montant = Math.round(montant * 100) / 100
        } else {
          montant = depenseExistante.montant
        }
      } else {
        montant = depenseExistante.montant
      }

      // Utiliser la fonction SQL
      const { data: functionResult, error: functionError } = await supabase.rpc('update_programme_depense', {
        p_id: id,
        p_programme_id: depenseExistante.programme_id,
        p_projet_id: depenseExistante.projet_id,
        p_libelle: depenseData.libelle?.trim() || depenseExistante.libelle,
        p_montant: montant,
        p_date_depense: depenseData.date_depense || depenseExistante.date_depense,
        p_description: depenseData.description?.trim() || depenseExistante.description,
        p_reference: depenseData.reference?.trim() || depenseExistante.reference,
        p_statut: depenseData.statut || depenseExistante.statut,
        p_justificatif_url: justificatifUrl
      })

      // La fonction retourne un tableau, prendre le premier élément
      let data = functionResult && functionResult.length > 0 ? functionResult[0] : null
      let error = functionError

      // Récupérer les données complètes si nécessaire
      if (!error && (!data || !data.id)) {
        const { data: fullData, error: selectError } = await supabase
          .from('programme_depenses')
          .select('*')
          .eq('id', id)
          .single()
        
        if (selectError) {
          logger.warn('PROJET_DEPENSES_SERVICE', 'Impossible de récupérer les données complètes', selectError)
        } else if (fullData) {
          data = fullData
        }
      }

      if (error) {
        logger.error('PROJET_DEPENSES_SERVICE', 'Erreur update', error)
        throw error
      }

      logger.info('PROJET_DEPENSES_SERVICE', 'Dépense mise à jour avec succès', { id, uploadFailed })
      
      if (uploadFailed) {
        data._uploadFailed = true
      }
      
      return { data, error: null, uploadFailed }
    } catch (error) {
      logger.error('PROJET_DEPENSES_SERVICE', 'Erreur update', error)
      return { data: null, error }
    }
  },

  /**
   * Supprimer une dépense
   */
  async delete(id) {
    try {
      logger.debug('PROJET_DEPENSES_SERVICE', 'delete appelé', { id })

      const { data, error } = await supabase.rpc('delete_programme_depense', {
        p_id: id
      })

      if (error) {
        logger.error('PROJET_DEPENSES_SERVICE', 'Erreur delete', error)
        throw error
      }

      logger.info('PROJET_DEPENSES_SERVICE', 'Dépense supprimée avec succès', { id: data || id })
      return { data: { id: data || id }, error: null }
    } catch (error) {
      logger.error('PROJET_DEPENSES_SERVICE', 'Erreur delete', error)
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
   * Obtenir les statistiques de dépenses pour un projet
   */
  async getStats(projetId, mode = 'reporting') {
    try {
      logger.debug('PROJET_DEPENSES_SERVICE', 'Calcul stats dépenses', { projetId, mode })
      
      // Récupérer le projet pour obtenir programme_id
      const { data: projet, error: projetError } = await projetsService.getById(projetId)
      if (projetError || !projet) {
        throw new Error('Projet non trouvé')
      }

      const { data: depenses, error } = await supabase
        .from('programme_depenses')
        .select('montant, date_depense, statut')
        .eq('programme_id', projet.programme_id)
        .eq('projet_id', projetId)

      if (error) {
        logger.error('PROJET_DEPENSES_SERVICE', 'Erreur récupération dépenses', error)
        throw error
      }

      const parseAmount = (amount) => parseFloat(String(amount).replace(/\s/g, '') || 0)

      const totalDepense = depenses?.reduce((sum, d) => sum + parseAmount(d.montant), 0) || 0

      const consumptionStatuses = mode === 'cashflow'
        ? ['PAYE', 'PAYÉ', 'PAID']
        : ['PAYE', 'PAYÉ', 'PAID', 'VALIDE', 'VALIDÉ', 'VALIDATED', 'APPROUVE', 'APPROUVÉ', 'APPROVED']

      const budgetConsomme = depenses?.filter(d => consumptionStatuses.includes(d.statut?.toUpperCase()))
        .reduce((sum, d) => sum + parseAmount(d.montant), 0) || 0

      const depensesValidees = depenses?.filter(d => ['VALIDE', 'VALIDÉ', 'VALIDATED', 'APPROUVE', 'APPROUVÉ', 'APPROVED', 'PAYE', 'PAYÉ', 'PAID'].includes(d.statut?.toUpperCase()))
        .reduce((sum, d) => sum + parseAmount(d.montant), 0) || 0

      const depensesPayees = depenses?.filter(d => ['PAYE', 'PAYÉ', 'PAID'].includes(d.statut?.toUpperCase()))
        .reduce((sum, d) => sum + parseAmount(d.montant), 0) || 0

      const depensesEnAttente = depenses?.filter(d => ['BROUILLON', 'PENDING', 'EN_ATTENTE'].includes(d.statut?.toUpperCase()))
        .reduce((sum, d) => sum + parseAmount(d.montant), 0) || 0

      const depensesAnnulees = depenses?.filter(d => ['ANNULE', 'ANNULÉ', 'CANCELLED'].includes(d.statut?.toUpperCase()))
        .reduce((sum, d) => sum + parseAmount(d.montant), 0) || 0

      // Récupérer le budget alloué du projet
      const budgetAlloue = parseAmount(projet.budget_alloue || 0)
      const budgetRestant = budgetAlloue - budgetConsomme
      const tauxConsommation = budgetAlloue > 0 ? (budgetConsomme / budgetAlloue) * 100 : 0

      return {
        data: {
          totalDepense,
          budgetConsomme,
          depensesValidees,
          depensesPayees,
          depensesEnAttente,
          depensesAnnulees,
          budgetAlloue,
          budgetRestant,
          tauxConsommation: Math.round(tauxConsommation * 100) / 100,
          nombreDepenses: depenses?.length || 0,
        },
        error: null
      }
    } catch (error) {
      logger.error('PROJET_DEPENSES_SERVICE', 'Erreur getStats', error)
      return { data: null, error }
    }
  },

  /**
   * Vérifier limites de dépenses par période
   */
  async checkLimitesPeriode(projetId, dateDepense, montant) {
    try {
      logger.debug('PROJET_DEPENSES_SERVICE', 'Vérification limites période', { projetId, dateDepense, montant })

      // Récupérer le projet
      const { data: projet, error: projetError } = await projetsService.getById(projetId)
      if (projetError || !projet) {
        return { error: new Error('Projet non trouvé') }
      }

      const date = new Date(dateDepense)
      const annee = date.getFullYear()
      const mois = date.getMonth() + 1
      const trimestre = Math.ceil(mois / 3)

      // Vérifier limite mensuelle
      const limiteMensuelle = await supabase
        .from('projet_limites_depenses')
        .select('*')
        .eq('projet_id', projetId)
        .eq('periode_type', 'MENSUEL')
        .lte('date_debut', `${annee}-${String(mois).padStart(2, '0')}-01`)
        .or(`date_fin.is.null,date_fin.gte.${annee}-${String(mois).padStart(2, '0')}-01`)
        .single()

      if (limiteMensuelle.data) {
        // Calculer dépenses du mois
        const debutMois = `${annee}-${String(mois).padStart(2, '0')}-01`
        const finMois = new Date(annee, mois, 0).toISOString().split('T')[0]

        const { data: depensesMois } = await supabase
          .from('programme_depenses')
          .select('montant, statut')
          .eq('projet_id', projetId)
          .gte('date_depense', debutMois)
          .lte('date_depense', finMois)
          .in('statut', ['VALIDE', 'PAYE', 'VALIDÉ', 'PAYÉ'])

        const totalMois = depensesMois?.reduce((sum, d) => sum + parseFloat(d.montant || 0), 0) || 0
        const nouveauTotal = totalMois + montant
        const limite = parseFloat(limiteMensuelle.data.montant_max)

        if (nouveauTotal > limite) {
          return {
            error: new Error(`Limite mensuelle dépassée: ${nouveauTotal.toLocaleString('fr-FR')} > ${limite.toLocaleString('fr-FR')} FCFA`),
            warning: `Attention: limite mensuelle presque atteinte (${((nouveauTotal / limite) * 100).toFixed(1)}%)`
          }
        }
        if (nouveauTotal / limite > 0.9) {
          return {
            warning: `Attention: limite mensuelle presque atteinte (${((nouveauTotal / limite) * 100).toFixed(1)}%)`
          }
        }
      }

      // Vérifier limite trimestrielle
      const limiteTrimestrielle = await supabase
        .from('projet_limites_depenses')
        .select('*')
        .eq('projet_id', projetId)
        .eq('periode_type', 'TRIMESTRIEL')
        .lte('date_debut', `${annee}-${String(mois).padStart(2, '0')}-01`)
        .or(`date_fin.is.null,date_fin.gte.${annee}-${String(mois).padStart(2, '0')}-01`)
        .single()

      if (limiteTrimestrielle.data) {
        const debutTrimestre = `${annee}-${String((trimestre - 1) * 3 + 1).padStart(2, '0')}-01`
        const finTrimestre = new Date(annee, trimestre * 3, 0).toISOString().split('T')[0]

        const { data: depensesTrimestre } = await supabase
          .from('programme_depenses')
          .select('montant, statut')
          .eq('projet_id', projetId)
          .gte('date_depense', debutTrimestre)
          .lte('date_depense', finTrimestre)
          .in('statut', ['VALIDE', 'PAYE', 'VALIDÉ', 'PAYÉ'])

        const totalTrimestre = depensesTrimestre?.reduce((sum, d) => sum + parseFloat(d.montant || 0), 0) || 0
        const nouveauTotal = totalTrimestre + montant
        const limite = parseFloat(limiteTrimestrielle.data.montant_max)

        if (nouveauTotal > limite) {
          return {
            error: new Error(`Limite trimestrielle dépassée: ${nouveauTotal.toLocaleString('fr-FR')} > ${limite.toLocaleString('fr-FR')} FCFA`)
          }
        }
        if (nouveauTotal / limite > 0.9) {
          return {
            warning: `Attention: limite trimestrielle presque atteinte (${((nouveauTotal / limite) * 100).toFixed(1)}%)`
          }
        }
      }

      return { error: null, warning: null }
    } catch (error) {
      logger.error('PROJET_DEPENSES_SERVICE', 'Erreur checkLimitesPeriode', error)
      return { error, warning: null }
    }
  },
}

