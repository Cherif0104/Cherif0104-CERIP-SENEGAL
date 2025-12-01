import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'

/**
 * Service Projet Activités - Gestion des activités projet
 */
export const projetActivitesService = {
  /**
   * Récupérer toutes les activités d'un projet
   */
  async getByProjet(projetId, options = {}) {
    try {
      logger.debug('PROJET_ACTIVITES_SERVICE', 'getByProjet appelé', { projetId, options })
      
      let query = supabase
        .from('projet_activites')
        .select('*')
        .eq('projet_id', projetId)
        .order('date_activite', { ascending: false })

      if (options.filters) {
        if (options.filters.type_activite) {
          query = query.eq('type_activite', options.filters.type_activite)
        }
        if (options.filters.statut) {
          query = query.eq('statut', options.filters.statut)
        }
        if (options.filters.dateDebut) {
          query = query.gte('date_activite', options.filters.dateDebut)
        }
        if (options.filters.dateFin) {
          query = query.lte('date_activite', options.filters.dateFin)
        }
      }

      const { data, error } = await query

      if (error) {
        logger.error('PROJET_ACTIVITES_SERVICE', 'Erreur getByProjet', error)
        throw error
      }

      logger.debug('PROJET_ACTIVITES_SERVICE', `getByProjet réussi: ${data?.length || 0} activités`)
      return { data: data || [], error: null }
    } catch (error) {
      logger.error('PROJET_ACTIVITES_SERVICE', 'Erreur globale getByProjet', error)
      return { data: [], error }
    }
  },

  /**
   * Récupérer une activité par ID
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('projet_activites')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      logger.error('PROJET_ACTIVITES_SERVICE', 'Erreur getById', error)
      return { data: null, error }
    }
  },

  /**
   * Créer une activité
   */
  async create(activiteData) {
    try {
      logger.debug('PROJET_ACTIVITES_SERVICE', 'create appelé', { activiteData })
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!activiteData.projet_id) {
        throw new Error('projet_id est requis')
      }
      
      const titre = activiteData.titre?.trim()
      if (!titre || titre === '') {
        throw new Error('titre est requis et ne peut pas être vide')
      }
      
      if (!activiteData.date_activite) {
        throw new Error('date_activite est requis')
      }

      const dataToInsert = {
        projet_id: activiteData.projet_id,
        type_activite: activiteData.type_activite || 'AUTRE',
        titre: titre,
        description: activiteData.description?.trim() || null,
        date_activite: activiteData.date_activite,
        heure_debut: activiteData.heure_debut || null,
        heure_fin: activiteData.heure_fin || null,
        duree_heures: activiteData.duree_heures ? parseFloat(activiteData.duree_heures) : null,
        intervenant_id: activiteData.intervenant_id || null,
        beneficiaires_ids: activiteData.beneficiaires_ids || [],
        statut: activiteData.statut || 'PLANIFIE',
        cout_total: activiteData.cout_total ? parseFloat(activiteData.cout_total) : 0,
        lieu: activiteData.lieu?.trim() || null,
        created_by: user?.id || null,
      }

      const { data, error } = await supabase
        .from('projet_activites')
        .insert(dataToInsert)
        .select()
        .single()

      if (error) {
        logger.error('PROJET_ACTIVITES_SERVICE', 'Erreur création activité', error)
        throw error
      }

      logger.info('PROJET_ACTIVITES_SERVICE', 'Activité créée avec succès', { id: data.id })
      return { data, error: null }
    } catch (error) {
      logger.error('PROJET_ACTIVITES_SERVICE', 'Erreur create', error)
      return { 
        data: null, 
        error: {
          message: error?.message || 'Erreur lors de la création de l\'activité',
          details: error?.details,
          hint: error?.hint
        }
      }
    }
  },

  /**
   * Mettre à jour une activité
   */
  async update(id, activiteData) {
    try {
      logger.debug('PROJET_ACTIVITES_SERVICE', 'update appelé', { id, activiteData })

      const updates = {}
      if (activiteData.titre !== undefined) updates.titre = activiteData.titre?.trim()
      if (activiteData.description !== undefined) updates.description = activiteData.description?.trim() || null
      if (activiteData.type_activite !== undefined) updates.type_activite = activiteData.type_activite
      if (activiteData.date_activite !== undefined) updates.date_activite = activiteData.date_activite
      if (activiteData.heure_debut !== undefined) updates.heure_debut = activiteData.heure_debut || null
      if (activiteData.heure_fin !== undefined) updates.heure_fin = activiteData.heure_fin || null
      if (activiteData.duree_heures !== undefined) updates.duree_heures = activiteData.duree_heures ? parseFloat(activiteData.duree_heures) : null
      if (activiteData.intervenant_id !== undefined) updates.intervenant_id = activiteData.intervenant_id || null
      if (activiteData.beneficiaires_ids !== undefined) updates.beneficiaires_ids = activiteData.beneficiaires_ids || []
      if (activiteData.statut !== undefined) updates.statut = activiteData.statut
      if (activiteData.cout_total !== undefined) updates.cout_total = activiteData.cout_total ? parseFloat(activiteData.cout_total) : 0

      const { data, error } = await supabase
        .from('projet_activites')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logger.error('PROJET_ACTIVITES_SERVICE', 'Erreur update', error)
        throw error
      }

      logger.info('PROJET_ACTIVITES_SERVICE', 'Activité mise à jour avec succès', { id })
      return { data, error: null }
    } catch (error) {
      logger.error('PROJET_ACTIVITES_SERVICE', 'Erreur update', error)
      return { data: null, error }
    }
  },

  /**
   * Supprimer une activité
   */
  async delete(id) {
    try {
      logger.debug('PROJET_ACTIVITES_SERVICE', 'delete appelé', { id })

      const { error } = await supabase
        .from('projet_activites')
        .delete()
        .eq('id', id)

      if (error) {
        logger.error('PROJET_ACTIVITES_SERVICE', 'Erreur delete', error)
        throw error
      }

      logger.info('PROJET_ACTIVITES_SERVICE', 'Activité supprimée avec succès', { id })
      return { data: { id }, error: null }
    } catch (error) {
      logger.error('PROJET_ACTIVITES_SERVICE', 'Erreur delete', error)
      return { 
        data: null, 
        error: {
          message: error?.message || 'Erreur lors de la suppression de l\'activité',
          details: error?.details,
          hint: error?.hint
        }
      }
    }
  },

  /**
   * Obtenir les statistiques d'activités pour un projet
   */
  async getStats(projetId) {
    try {
      logger.debug('PROJET_ACTIVITES_SERVICE', 'Calcul stats activités', { projetId })
      
      const { data: activites, error } = await supabase
        .from('projet_activites')
        .select('type_activite, statut, duree_heures, beneficiaires_ids, date_activite')
        .eq('projet_id', projetId)

      if (error) {
        logger.error('PROJET_ACTIVITES_SERVICE', 'Erreur récupération activités', error)
        throw error
      }

      const total = activites?.length || 0
      const terminees = activites?.filter(a => a.statut === 'TERMINE').length || 0
      const planifiees = activites?.filter(a => a.statut === 'PLANIFIE').length || 0
      const enCours = activites?.filter(a => a.statut === 'EN_COURS').length || 0

      const heuresTotal = activites?.reduce((sum, a) => {
        return sum + parseFloat(a.duree_heures || 0)
      }, 0) || 0

      // Répartition par type
      const repartitionParType = activites?.reduce((acc, a) => {
        const type = a.type_activite || 'AUTRE'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {}) || {}

      // Participants moyens
      const activitesAvecParticipants = activites?.filter(a => 
        a.beneficiaires_ids && a.beneficiaires_ids.length > 0
      ) || []
      const participantsMoyens = activitesAvecParticipants.length > 0
        ? activitesAvecParticipants.reduce((sum, a) => sum + (a.beneficiaires_ids?.length || 0), 0) / activitesAvecParticipants.length
        : 0

      return {
        data: {
          total,
          terminees,
          planifiees,
          enCours,
          heuresTotal,
          participantsMoyens: Math.round(participantsMoyens * 10) / 10,
          repartitionParType: Object.entries(repartitionParType).map(([type, count]) => ({
            type,
            count,
          })),
        },
        error: null
      }
    } catch (error) {
      logger.error('PROJET_ACTIVITES_SERVICE', 'Erreur getStats', error)
      return { data: null, error }
    }
  },

  /**
   * Enregistrer les présences pour une activité
   */
  async enregistrerPresences(activiteId, presences) {
    try {
      logger.debug('PROJET_ACTIVITES_SERVICE', 'enregistrerPresences appelé', { activiteId, presences })

      // Supprimer les présences existantes
      await supabase
        .from('activite_presences')
        .delete()
        .eq('activite_id', activiteId)

      // Insérer les nouvelles présences
      const presencesToInsert = presences.map(p => ({
        activite_id: activiteId,
        beneficiaire_id: p.beneficiaire_id,
        present: p.present !== undefined ? p.present : true,
        heure_arrivee: p.heure_arrivee || null,
        heure_depart: p.heure_depart || null,
        retard_minutes: p.retard_minutes || 0,
        notes: p.notes?.trim() || null,
      }))

      const { data, error } = await supabase
        .from('activite_presences')
        .insert(presencesToInsert)
        .select()

      if (error) {
        logger.error('PROJET_ACTIVITES_SERVICE', 'Erreur enregistrerPresences', error)
        throw error
      }

      logger.info('PROJET_ACTIVITES_SERVICE', 'Présences enregistrées avec succès', { activiteId, count: data.length })
      return { data, error: null }
    } catch (error) {
      logger.error('PROJET_ACTIVITES_SERVICE', 'Erreur enregistrerPresences', error)
      return { data: null, error }
    }
  },

  /**
   * Récupérer les présences d'une activité
   */
  async getPresences(activiteId) {
    try {
      const { data, error } = await supabase
        .from('activite_presences')
        .select(`
          *,
          beneficiaires (
            id,
            code,
            personne
          )
        `)
        .eq('activite_id', activiteId)

      if (error) throw error
      return { data: data || [], error: null }
    } catch (error) {
      logger.error('PROJET_ACTIVITES_SERVICE', 'Erreur getPresences', error)
      return { data: [], error }
    }
  },
}

