// Service de gestion des bénéficiaires avec Supabase
import { supabase } from '../lib/supabase'

const TABLE = 'beneficiaires'

export const beneficiairesService = {
  async getAll(projetId = null, filters = {}) {
    try {
      let query = supabase.from(TABLE).select('*').order('date_affectation', { ascending: false })

      if (projetId) {
        query = query.eq('projet_id', projetId)
      }

      let { data, error } = await query
      if (error) {
        return { data: [], error }
      }

      data = data || []

      if (filters.statut) {
        data = data.filter(b => b.statut === filters.statut)
      }
      if (filters.intervenant) {
        data = data.filter(b =>
          b.mentor_id === filters.intervenant ||
          b.formateur_id === filters.intervenant ||
          b.coach_id === filters.intervenant
        )
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        data = data.filter(b =>
          b.nom?.toLowerCase().includes(searchLower) ||
          b.prenom?.toLowerCase().includes(searchLower) ||
          b.email?.toLowerCase().includes(searchLower)
        )
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching beneficiaires:', error)
      return { data: [], error }
    }
  },

  async getById(id) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching beneficiaire:', error)
      return { data: null, error }
    }
  },

  async assignIntervenant(beneficiaireId, intervenantId, role) {
    try {
      const fieldName = role === 'MENTOR' ? 'mentor_id' :
        role === 'FORMATEUR' ? 'formateur_id' :
          role === 'COACH' ? 'coach_id' : null

      if (!fieldName) {
        return { data: null, error: { message: 'Invalid role' } }
      }

      const { error } = await supabase
        .from(TABLE)
        .update({ [fieldName]: intervenantId })
        .eq('id', beneficiaireId)

      return { data: { id: beneficiaireId, [fieldName]: intervenantId }, error }
    } catch (error) {
      console.error('Error assigning intervenant:', error)
      return { data: null, error }
    }
  },

  async getByIntervenant(intervenantId, role) {
    try {
      const fieldName = role === 'MENTOR' ? 'mentor_id' :
        role === 'FORMATEUR' ? 'formateur_id' :
          role === 'COACH' ? 'coach_id' : null

      if (!fieldName) {
        return { data: [], error: { message: 'Invalid role' } }
      }

      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq(fieldName, intervenantId)
        .order('date_affectation', { ascending: false })

      const result = (data || []).map(b => ({
        ...b,
        has_plan_action: !!b.plan_action_id
      }))

      return { data: result, error }
    } catch (error) {
      console.error('Error fetching beneficiaires by intervenant:', error)
      return { data: [], error }
    }
  },

  async getHistorique(beneficiaireId) {
    try {
      const { data: beneficiaire, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('id', beneficiaireId)
        .single()

      if (error || !beneficiaire) {
        return { data: null, error: error || { message: 'Bénéficiaire not found' } }
      }

      const historique = []

      if (beneficiaire.candidat_id) {
        const { data: candidat } = await supabase
          .from('candidats')
          .select('*')
          .eq('id', beneficiaire.candidat_id)
          .single()

        if (candidat) {
          historique.push({
            type: 'Candidat',
            description: `Inscription comme candidat`,
            date: candidat.date_inscription
          })
        }
      }

      historique.push({
        type: 'Bénéficiaire',
        description: `Conversion en bénéficiaire - Affectation au projet`,
        date: beneficiaire.date_affectation
      })

      historique.sort((a, b) => new Date(a.date) - new Date(b.date))

      return { data: { etapes: historique }, error: null }
    } catch (error) {
      console.error('Error fetching historique:', error)
      return { data: null, error }
    }
  },

  async create(beneficiaire) {
    try {
      const beneficiaireData = {
        nom: beneficiaire.nom,
        prenom: beneficiaire.prenom,
        email: beneficiaire.email,
        telephone: beneficiaire.telephone || null,
        date_naissance: beneficiaire.date_naissance || null,
        genre: beneficiaire.genre || null,
        adresse: beneficiaire.adresse || null,
        ville: beneficiaire.ville || null,
        region: beneficiaire.region || null,
        departement: beneficiaire.departement || null,
        commune: beneficiaire.commune || null,
        projet_id: beneficiaire.projet_id || null,
        statut: beneficiaire.statut || 'ACTIF',
        date_affectation: new Date().toISOString(),
        mentor_id: beneficiaire.mentor_id || null,
        formateur_id: beneficiaire.formateur_id || null,
        coach_id: beneficiaire.coach_id || null
      }

      const { data, error } = await supabase
        .from(TABLE)
        .insert(beneficiaireData)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating beneficiaire:', error)
      return { data: null, error }
    }
  },

  async update(beneficiaireId, data) {
    try {
      const updateData = {
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone || null,
        date_naissance: data.date_naissance || null,
        genre: data.genre || null,
        adresse: data.adresse || null,
        ville: data.ville || null,
        region: data.region || null,
        departement: data.departement || null,
        commune: data.commune || null,
        projet_id: data.projet_id || null,
        statut: data.statut,
        mentor_id: data.mentor_id || null,
        formateur_id: data.formateur_id || null,
        coach_id: data.coach_id || null
      }

      const { data, error } = await supabase
        .from(TABLE)
        .update(updateData)
        .eq('id', beneficiaireId)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating beneficiaire:', error)
      return { data: null, error }
    }
  },

  async getBesoins(beneficiaireId) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('besoins')
        .eq('id', beneficiaireId)
        .single()

      if (error && error.code !== 'PGRST116') {
        return { data: {}, error }
      }

      return { data: data?.besoins || {}, error: null }
    } catch (error) {
      console.error('Error fetching besoins:', error)
      return { data: {}, error }
    }
  },

  async updateBesoins(beneficiaireId, besoins) {
    try {
      const { error } = await supabase
        .from(TABLE)
        .update({ besoins })
        .eq('id', beneficiaireId)

      return { data: { id: beneficiaireId, besoins }, error }
    } catch (error) {
      console.error('Error updating besoins:', error)
      return { data: null, error }
    }
  }
}
