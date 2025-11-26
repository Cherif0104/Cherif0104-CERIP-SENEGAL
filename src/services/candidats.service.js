// Service de gestion des candidats avec Supabase
import { supabase } from '../lib/supabase'

const TABLE = 'candidats'

// Utilitaire local pour calculer l'âge à partir d'une date de naissance
const computeAge = (dateString) => {
  if (!dateString) {
    return { valid: false, age: null }
  }

  const birth = new Date(dateString)
  if (Number.isNaN(birth.getTime())) {
    return { valid: false, age: null }
  }

  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return { valid: true, age }
}

// Évaluation avancée de l'éligibilité :
// 1) Calcul de base sur la tranche d'âge (si aucune règle programme trouvée)
// 2) Si un appel est lié, on remonte au projet puis au programme,
//    on lit la table programme_eligibilite (si elle existe) et on applique :
//    - age_min / age_max
//    - genres_autorises (si candidat.genre existe)
//    - zones (si candidat.ville existe)
// Les nouveaux statuts possibles :
// - ELIGIBLE
// - HORS_TRANCHE_AGE
// - HORS_ZONE
// - GENRE_NON_AUTORISE
// - NON_ELIGIBLE
// - A_VERIFIER
const evaluateEligibility = async (candidat) => {
  const { valid, age } = computeAge(candidat.date_naissance)

  // Baseline : uniquement sur l'âge si aucune autre info
  let baselineStatut = 'A_VERIFIER'
  if (valid) {
    if (age >= 18 && age <= 35) {
      baselineStatut = 'ELIGIBLE'
      } else {
      baselineStatut = 'HORS_TRANCHE_AGE'
    }
  }

  // Sans appel, on ne peut pas remonter au programme
  if (!candidat.appel_id) {
    return baselineStatut
  }

  try {
    // 1) Récupérer l'appel pour trouver le projet
    const { data: appel, error: appelError } = await supabase
      .from('appels_candidatures')
      .select('id, projet_id')
      .eq('id', candidat.appel_id)
      .single()

    if (appelError || !appel?.projet_id) {
      return baselineStatut
    }

    // 2) Récupérer le projet pour trouver le programme
    const { data: projet, error: projetError } = await supabase
      .from('projets')
      .select('id, programme_id')
      .eq('id', appel.projet_id)
      .single()

    if (projetError || !projet?.programme_id) {
      return baselineStatut
    }

    // 3) Récupérer les règles d'éligibilité du programme
    const { data: regle, error: regleError } = await supabase
      .from('programme_eligibilite')
      .select('*')
      .eq('programme_id', projet.programme_id)
      .single()

    // Si la table n'existe pas ou aucune règle définie, on reste sur la baseline
    if (regleError || !regle) {
      return baselineStatut
    }

    const motifs = []

    // Tranche d'âge spécifique au programme
    if (regle.age_min != null && valid && age < regle.age_min) {
      motifs.push('AGE_INFERIEUR_MIN')
    }
    if (regle.age_max != null && valid && age > regle.age_max) {
      motifs.push('AGE_SUPERIEUR_MAX')
    }

    // Genre (si le champ existe côté candidat et des genres sont définis)
    if (Array.isArray(regle.genres_autorises) && regle.genres_autorises.length && candidat.genre) {
      if (!regle.genres_autorises.includes(candidat.genre)) {
        motifs.push('GENRE_NON_AUTORISE')
      }
    }

    // Zones (vérification sur region/departement/commune)
    if (Array.isArray(regle.zones) && regle.zones.length) {
      const candidatZones = [
        candidat.region,
        candidat.departement,
        candidat.commune,
        candidat.ville
      ].filter(Boolean).map(z => z.toLowerCase())
      
      const inZone = regle.zones.some((z) => {
        const zoneLower = typeof z === 'string' ? z.toLowerCase() : ''
        return candidatZones.some(cz => cz.includes(zoneLower) || zoneLower.includes(cz))
      })
      
      if (!inZone) {
        motifs.push('HORS_ZONE')
      }
    }

    // Si aucun motif d'exclusion, on est éligible (si l'âge est cohérent)
    if (motifs.length === 0) {
      return valid ? 'ELIGIBLE' : 'A_VERIFIER'
    }

    // Priorité de lecture des motifs → statut
    if (motifs.includes('HORS_ZONE')) {
      return 'HORS_ZONE'
    }

    if (motifs.includes('GENRE_NON_AUTORISE')) {
      return 'GENRE_NON_AUTORISE'
    }

    if (motifs.includes('AGE_INFERIEUR_MIN') || motifs.includes('AGE_SUPERIEUR_MAX')) {
      return 'HORS_TRANCHE_AGE'
    }

    return 'NON_ELIGIBLE'
  } catch (error) {
    console.error('Error evaluating eligibility with programme rules:', error)
    return baselineStatut
  }
}

export const candidatsService = {
  /**
   * Évalue l'éligibilité d'un candidat (méthode publique)
   * Retourne un objet avec statut_eligibilite
   */
  async evaluateEligibility(candidat) {
    const statut_eligibilite = await evaluateEligibility(candidat)
    return { statut_eligibilite }
  },

  async getAll(appelId = null, filters = {}) {
    try {
      let query = supabase.from(TABLE).select('*').order('date_inscription', { ascending: false })

      if (appelId) {
        query = query.eq('appel_id', appelId)
      }

      const { data, error } = await query
      if (error) {
        return { data: [], error }
      }

      let result = data || []

      // Filtres côté client
      if (filters.statut) {
        result = result.filter(c => c.statut === filters.statut)
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        result = result.filter(c =>
          c.nom?.toLowerCase().includes(searchLower) ||
          c.prenom?.toLowerCase().includes(searchLower) ||
          c.email?.toLowerCase().includes(searchLower)
        )
      }

      return { data: result, error: null }
    } catch (error) {
      console.error('Error fetching candidats:', error)
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
      console.error('Error fetching candidat:', error)
      return { data: null, error }
    }
  },

  async create(candidat) {
    try {
      const statut_eligibilite = await evaluateEligibility(candidat)

      const candidatData = {
        nom: candidat.nom,
        prenom: candidat.prenom,
        email: candidat.email,
        telephone: candidat.telephone,
        appel_id: candidat.appel_id || null,
        statut: candidat.statut || 'NOUVEAU',
        date_inscription: new Date().toISOString(),
        date_naissance: candidat.date_naissance || null,
        genre: candidat.genre || null,
        adresse: candidat.adresse || null,
        ville: candidat.ville || null,
        region: candidat.region || null,
        departement: candidat.departement || null,
        commune: candidat.commune || null,
        statut_eligibilite
      }

      const { data, error } = await supabase
        .from(TABLE)
        .insert(candidatData)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating candidat:', error)
      return { data: null, error }
    }
  },

  async update(id, candidat) {
    try {
      const statut_eligibilite = await evaluateEligibility(candidat)

      const updateData = {
        nom: candidat.nom,
        prenom: candidat.prenom,
        email: candidat.email,
        telephone: candidat.telephone,
        appel_id: candidat.appel_id || null,
        statut: candidat.statut,
        date_naissance: candidat.date_naissance || null,
        genre: candidat.genre || null,
        adresse: candidat.adresse || null,
        ville: candidat.ville || null,
        region: candidat.region || null,
        departement: candidat.departement || null,
        commune: candidat.commune || null,
        statut_eligibilite
      }

      const { data, error } = await supabase
        .from(TABLE)
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating candidat:', error)
      return { data: null, error }
    }
  },

  async convertToBeneficiaire(candidatId, projetId) {
    try {
      const { data: candidat, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('id', candidatId)
        .single()

      if (error || !candidat) {
        return { data: null, error: error || { message: 'Candidat not found' } }
      }

      const beneficiaireData = {
        id: candidatId, // garder le même id pour la continuité
        nom: candidat.nom,
        prenom: candidat.prenom,
        email: candidat.email,
        telephone: candidat.telephone,
        candidat_id: candidatId,
        projet_id: projetId,
        date_affectation: new Date().toISOString(),
        statut: 'ACTIF'
      }

      const { data: beneficiaire, error: insertError } = await supabase
        .from('beneficiaires')
        .insert(beneficiaireData)
        .select('*')
        .single()

      if (insertError) {
        return { data: null, error: insertError }
      }

      const { error: updateError } = await supabase
        .from(TABLE)
        .update({ statut: 'CONVERTI', beneficiaire_id: beneficiaire.id })
        .eq('id', candidatId)

      if (updateError) {
        return { data: null, error: updateError }
      }

      return { data: beneficiaire, error: null }
    } catch (error) {
      console.error('Error converting candidat to beneficiaire:', error)
      return { data: null, error }
    }
  },

  async getDiagnostic(candidatId) {
    try {
      const { data, error } = await supabase
        .from('diagnostics')
        .select('*')
        .eq('candidat_id', candidatId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching diagnostic:', error)
      return { data: null, error }
    }
  },

  async updateStatut(candidatId, statut) {
    try {
      const { error } = await supabase
        .from(TABLE)
        .update({ statut })
        .eq('id', candidatId)

      return { data: { id: candidatId, statut }, error }
    } catch (error) {
      console.error('Error updating statut:', error)
      return { data: null, error }
    }
  }
}
