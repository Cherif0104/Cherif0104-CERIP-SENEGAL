import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'

/**
 * Service Ressources - Gestion des ressources (salles, matériel, transport, etc.)
 */
export const ressourcesService = {
  /**
   * Récupérer toutes les ressources
   */
  async getAll(options = {}) {
    try {
      logger.debug('RESSOURCES_SERVICE', 'getAll appelé', { options })
      
      let query = supabase
        .from('ressources')
        .select('*')
        .order('nom', { ascending: true })

      if (options.filters) {
        if (options.filters.type_ressource) {
          query = query.eq('type_ressource', options.filters.type_ressource)
        }
        if (options.filters.actif !== undefined) {
          query = query.eq('actif', options.filters.actif)
        }
      }

      const { data, error } = await query

      if (error) {
        logger.error('RESSOURCES_SERVICE', 'Erreur getAll', error)
        throw error
      }

      logger.debug('RESSOURCES_SERVICE', `getAll réussi: ${data?.length || 0} ressources`)
      return { data: data || [], error: null }
    } catch (error) {
      logger.error('RESSOURCES_SERVICE', 'Erreur globale getAll', error)
      return { data: [], error }
    }
  },

  /**
   * Récupérer une ressource par ID
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('ressources')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      logger.error('RESSOURCES_SERVICE', 'Erreur getById', error)
      return { data: null, error }
    }
  },

  /**
   * Créer une ressource
   */
  async create(ressourceData) {
    try {
      logger.debug('RESSOURCES_SERVICE', 'create appelé', { ressourceData })
      
      if (!ressourceData.nom || !ressourceData.nom.trim()) {
        throw new Error('nom est requis')
      }
      
      if (!ressourceData.type_ressource) {
        throw new Error('type_ressource est requis')
      }

      const dataToInsert = {
        type_ressource: ressourceData.type_ressource,
        nom: ressourceData.nom.trim(),
        description: ressourceData.description?.trim() || null,
        capacite: ressourceData.capacite ? parseInt(ressourceData.capacite) : null,
        localisation: ressourceData.localisation?.trim() || null,
        proprietaire: ressourceData.proprietaire?.trim() || null,
        cout_unitaire: ressourceData.cout_unitaire ? parseFloat(ressourceData.cout_unitaire) : null,
        unite_cout: ressourceData.unite_cout?.trim() || null,
        disponibilite: ressourceData.disponibilite || {},
        actif: ressourceData.actif !== undefined ? ressourceData.actif : true,
      }

      const { data, error } = await supabase
        .from('ressources')
        .insert(dataToInsert)
        .select()
        .single()

      if (error) {
        logger.error('RESSOURCES_SERVICE', 'Erreur création ressource', error)
        throw error
      }

      logger.info('RESSOURCES_SERVICE', 'Ressource créée avec succès', { id: data.id })
      return { data, error: null }
    } catch (error) {
      logger.error('RESSOURCES_SERVICE', 'Erreur create', error)
      return { 
        data: null, 
        error: {
          message: error?.message || 'Erreur lors de la création de la ressource',
          details: error?.details,
          hint: error?.hint
        }
      }
    }
  },

  /**
   * Mettre à jour une ressource
   */
  async update(id, ressourceData) {
    try {
      logger.debug('RESSOURCES_SERVICE', 'update appelé', { id, ressourceData })

      const updates = {}
      if (ressourceData.nom !== undefined) updates.nom = ressourceData.nom.trim()
      if (ressourceData.description !== undefined) updates.description = ressourceData.description?.trim() || null
      if (ressourceData.type_ressource !== undefined) updates.type_ressource = ressourceData.type_ressource
      if (ressourceData.capacite !== undefined) updates.capacite = ressourceData.capacite ? parseInt(ressourceData.capacite) : null
      if (ressourceData.localisation !== undefined) updates.localisation = ressourceData.localisation?.trim() || null
      if (ressourceData.proprietaire !== undefined) updates.proprietaire = ressourceData.proprietaire?.trim() || null
      if (ressourceData.cout_unitaire !== undefined) updates.cout_unitaire = ressourceData.cout_unitaire ? parseFloat(ressourceData.cout_unitaire) : null
      if (ressourceData.unite_cout !== undefined) updates.unite_cout = ressourceData.unite_cout?.trim() || null
      if (ressourceData.disponibilite !== undefined) updates.disponibilite = ressourceData.disponibilite
      if (ressourceData.actif !== undefined) updates.actif = ressourceData.actif

      const { data, error } = await supabase
        .from('ressources')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logger.error('RESSOURCES_SERVICE', 'Erreur update', error)
        throw error
      }

      logger.info('RESSOURCES_SERVICE', 'Ressource mise à jour avec succès', { id })
      return { data, error: null }
    } catch (error) {
      logger.error('RESSOURCES_SERVICE', 'Erreur update', error)
      return { data: null, error }
    }
  },

  /**
   * Supprimer une ressource
   */
  async delete(id) {
    try {
      logger.debug('RESSOURCES_SERVICE', 'delete appelé', { id })

      const { error } = await supabase
        .from('ressources')
        .delete()
        .eq('id', id)

      if (error) {
        logger.error('RESSOURCES_SERVICE', 'Erreur delete', error)
        throw error
      }

      logger.info('RESSOURCES_SERVICE', 'Ressource supprimée avec succès', { id })
      return { data: { id }, error: null }
    } catch (error) {
      logger.error('RESSOURCES_SERVICE', 'Erreur delete', error)
      return { 
        data: null, 
        error: {
          message: error?.message || 'Erreur lors de la suppression de la ressource',
          details: error?.details,
          hint: error?.hint
        }
      }
    }
  },

  /**
   * Vérifier disponibilité d'une ressource
   */
  async verifierDisponibilite(ressourceId, dateDebut, dateFin, exclureReservationId = null) {
    try {
      logger.debug('RESSOURCES_SERVICE', 'Vérification disponibilité', { ressourceId, dateDebut, dateFin })

      // Utiliser la fonction SQL si elle existe
      const { data: disponible, error: functionError } = await supabase.rpc('verifier_disponibilite_ressource', {
        p_ressource_id: ressourceId,
        p_date_debut: dateDebut,
        p_date_fin: dateFin,
        p_exclure_reservation_id: exclureReservationId,
      })

      if (!functionError && disponible !== null) {
        return { data: { disponible }, error: null }
      }

      // Calcul manuel si fonction SQL n'existe pas
      let query = supabase
        .from('ressources_reservations')
        .select('id')
        .eq('ressource_id', ressourceId)
        .in('statut', ['RESERVE', 'CONFIRME'])

      if (exclureReservationId) {
        query = query.neq('id', exclureReservationId)
      }

      // Vérifier chevauchements
      query = query.or(`and(date_debut.lte.${dateDebut},date_fin.gt.${dateDebut}),and(date_debut.lt.${dateFin},date_fin.gte.${dateFin}),and(date_debut.gte.${dateDebut},date_fin.lte.${dateFin})`)

      const { data: conflicts, error } = await query

      if (error) {
        logger.error('RESSOURCES_SERVICE', 'Erreur vérification disponibilité', error)
        throw error
      }

      return { data: { disponible: conflicts?.length === 0 }, error: null }
    } catch (error) {
      logger.error('RESSOURCES_SERVICE', 'Erreur verifierDisponibilite', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer les réservations d'une activité
   */
  async getReservationsByActivite(activiteId) {
    try {
      logger.debug('RESSOURCES_SERVICE', 'getReservationsByActivite appelé', { activiteId })
      
      const { data, error } = await supabase
        .from('ressources_reservations')
        .select(`
          *,
          ressources (
            id,
            nom,
            type_ressource,
            localisation,
            cout_unitaire,
            unite_cout
          )
        `)
        .eq('activite_id', activiteId)
        .order('date_debut', { ascending: false })

      if (error) {
        logger.error('RESSOURCES_SERVICE', 'Erreur getReservationsByActivite', error)
        throw error
      }

      logger.debug('RESSOURCES_SERVICE', `getReservationsByActivite réussi: ${data?.length || 0} réservations`)
      return { data: data || [], error: null }
    } catch (error) {
      logger.error('RESSOURCES_SERVICE', 'Erreur globale getReservationsByActivite', error)
      return { data: [], error }
    }
  },

  /**
   * Récupérer les réservations d'un projet
   */
  async getReservationsByProjet(projetId, options = {}) {
    try {
      logger.debug('RESSOURCES_SERVICE', 'getReservationsByProjet appelé', { projetId, options })
      
      let query = supabase
        .from('ressources_reservations')
        .select(`
          *,
          ressources (
            id,
            nom,
            type_ressource,
            localisation,
            cout_unitaire,
            unite_cout
          ),
          projet_activites (
            id,
            titre,
            date_activite
          )
        `)
        .eq('projet_id', projetId)
        .order('date_debut', { ascending: false })

      if (options.filters) {
        if (options.filters.ressource_id) {
          query = query.eq('ressource_id', options.filters.ressource_id)
        }
        if (options.filters.statut) {
          query = query.eq('statut', options.filters.statut)
        }
        if (options.filters.dateDebut) {
          query = query.gte('date_debut', options.filters.dateDebut)
        }
        if (options.filters.dateFin) {
          query = query.lte('date_fin', options.filters.dateFin)
        }
      }

      const { data, error } = await query

      if (error) {
        logger.error('RESSOURCES_SERVICE', 'Erreur getReservationsByProjet', error)
        throw error
      }

      logger.debug('RESSOURCES_SERVICE', `getReservationsByProjet réussi: ${data?.length || 0} réservations`)
      return { data: data || [], error: null }
    } catch (error) {
      logger.error('RESSOURCES_SERVICE', 'Erreur globale getReservationsByProjet', error)
      return { data: [], error }
    }
  },

  /**
   * Créer une réservation
   */
  async createReservation(reservationData) {
    try {
      logger.debug('RESSOURCES_SERVICE', 'createReservation appelé', { reservationData })
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!reservationData.ressource_id) {
        throw new Error('ressource_id est requis')
      }
      
      if (!reservationData.projet_id) {
        throw new Error('projet_id est requis')
      }
      
      if (!reservationData.date_debut || !reservationData.date_fin) {
        throw new Error('date_debut et date_fin sont requis')
      }

      // Vérifier disponibilité
      const disponibilite = await this.verifierDisponibilite(
        reservationData.ressource_id,
        reservationData.date_debut,
        reservationData.date_fin
      )

      if (disponibilite.error) {
        return { data: null, error: disponibilite.error }
      }

      if (!disponibilite.data.disponible) {
        return {
          data: null,
          error: {
            message: 'La ressource n\'est pas disponible pour cette période',
          }
        }
      }

      // Calculer le coût si nécessaire
      let coutTotal = null
      if (reservationData.ressource_id) {
        const { data: ressource } = await this.getById(reservationData.ressource_id)
        if (ressource && ressource.cout_unitaire) {
          const dureeHeures = (new Date(reservationData.date_fin) - new Date(reservationData.date_debut)) / (1000 * 60 * 60)
          coutTotal = ressource.cout_unitaire * (reservationData.quantite || 1) * Math.ceil(dureeHeures)
        }
      }

      const dataToInsert = {
        activite_id: reservationData.activite_id || null,
        ressource_id: reservationData.ressource_id,
        projet_id: reservationData.projet_id,
        date_debut: reservationData.date_debut,
        date_fin: reservationData.date_fin,
        quantite: reservationData.quantite || 1,
        cout_total: coutTotal,
        statut: reservationData.statut || 'RESERVE',
        notes: reservationData.notes?.trim() || null,
        created_by: user?.id || null,
      }

      const { data, error } = await supabase
        .from('ressources_reservations')
        .insert(dataToInsert)
        .select()
        .single()

      if (error) {
        logger.error('RESSOURCES_SERVICE', 'Erreur création réservation', error)
        throw error
      }

      logger.info('RESSOURCES_SERVICE', 'Réservation créée avec succès', { id: data.id })
      return { data, error: null }
    } catch (error) {
      logger.error('RESSOURCES_SERVICE', 'Erreur createReservation', error)
      return { 
        data: null, 
        error: {
          message: error?.message || 'Erreur lors de la création de la réservation',
          details: error?.details,
          hint: error?.hint
        }
      }
    }
  },

  /**
   * Mettre à jour une réservation
   */
  async updateReservation(id, reservationData) {
    try {
      logger.debug('RESSOURCES_SERVICE', 'updateReservation appelé', { id, reservationData })

      // Vérifier disponibilité si dates modifiées
      if (reservationData.date_debut || reservationData.date_fin) {
        const { data: existing } = await supabase
          .from('ressources_reservations')
          .select('ressource_id, date_debut, date_fin')
          .eq('id', id)
          .single()

        if (existing) {
          const dateDebut = reservationData.date_debut || existing.date_debut
          const dateFin = reservationData.date_fin || existing.date_fin
          
          const disponibilite = await this.verifierDisponibilite(
            existing.ressource_id,
            dateDebut,
            dateFin,
            id
          )

          if (disponibilite.error || !disponibilite.data.disponible) {
            return {
              data: null,
              error: {
                message: 'La ressource n\'est pas disponible pour cette période',
              }
            }
          }
        }
      }

      const updates = {}
      if (reservationData.activite_id !== undefined) updates.activite_id = reservationData.activite_id || null
      if (reservationData.date_debut !== undefined) updates.date_debut = reservationData.date_debut
      if (reservationData.date_fin !== undefined) updates.date_fin = reservationData.date_fin
      if (reservationData.quantite !== undefined) updates.quantite = reservationData.quantite || 1
      if (reservationData.cout_total !== undefined) updates.cout_total = reservationData.cout_total ? parseFloat(reservationData.cout_total) : null
      if (reservationData.statut !== undefined) updates.statut = reservationData.statut
      if (reservationData.notes !== undefined) updates.notes = reservationData.notes?.trim() || null

      const { data, error } = await supabase
        .from('ressources_reservations')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logger.error('RESSOURCES_SERVICE', 'Erreur updateReservation', error)
        throw error
      }

      logger.info('RESSOURCES_SERVICE', 'Réservation mise à jour avec succès', { id })
      return { data, error: null }
    } catch (error) {
      logger.error('RESSOURCES_SERVICE', 'Erreur updateReservation', error)
      return { data: null, error }
    }
  },

  /**
   * Supprimer une réservation
   */
  async deleteReservation(id) {
    try {
      logger.debug('RESSOURCES_SERVICE', 'deleteReservation appelé', { id })

      const { error } = await supabase
        .from('ressources_reservations')
        .delete()
        .eq('id', id)

      if (error) {
        logger.error('RESSOURCES_SERVICE', 'Erreur deleteReservation', error)
        throw error
      }

      logger.info('RESSOURCES_SERVICE', 'Réservation supprimée avec succès', { id })
      return { data: { id }, error: null }
    } catch (error) {
      logger.error('RESSOURCES_SERVICE', 'Erreur deleteReservation', error)
      return { 
        data: null, 
        error: {
          message: error?.message || 'Erreur lors de la suppression de la réservation',
          details: error?.details,
          hint: error?.hint
        }
      }
    }
  },
}

