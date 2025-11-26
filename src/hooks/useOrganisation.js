import { useState, useEffect } from 'react'
import { authService } from '../services/auth.service'
import { organisationsService } from '../services/organisations.service'
import { mockDataService } from '../data/mockData.service'

/**
 * Hook personnalisé pour gérer l'organisation active
 * Standardise la logique organisationId dans toutes les pages
 * 
 * @returns {object} { organisationId, loading, error, retry, user }
 */
export default function useOrganisation() {
  const [organisationId, setOrganisationId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)

  const loadOrganisation = async () => {
    try {
      setLoading(true)
      setError(null)

      // Récupérer la session
      const { data: { session } } = await authService.getSession()
      if (!session?.user) {
        setError('Session non trouvée. Veuillez vous reconnecter.')
        setLoading(false)
        return
      }

      setUser(session.user)

      // Vérifier d'abord le localStorage
      const savedOrg = localStorage.getItem('cerip_active_organisation')
      if (savedOrg) {
        try {
          const org = JSON.parse(savedOrg)
          if (org && org.id) {
            setOrganisationId(org.id)
            setLoading(false)
            // Continuer pour vérifier si l'org est toujours valide
          }
        } catch (parseError) {
          console.error('Error parsing saved org:', parseError)
          localStorage.removeItem('cerip_active_organisation')
        }
      }

      // Toujours essayer de charger depuis le service pour être sûr
      try {
        const { data: org, error: orgError } = await organisationsService.getActiveOrganisation(session.user.id)
        
        if (orgError && !organisationId) {
          console.error('Error loading organisation:', orgError)
          const fallbackOrg = mockDataService.getOrganisations()[0]
          if (fallbackOrg) {
            setOrganisationId(fallbackOrg.id)
            localStorage.setItem('cerip_active_organisation', JSON.stringify(fallbackOrg))
          } else {
            setError('Impossible de charger l\'organisation. Certaines fonctionnalités peuvent être limitées.')
          }
        } else if (org && org.id) {
          setOrganisationId(org.id)
          localStorage.setItem('cerip_active_organisation', JSON.stringify(org))
        } else if (!organisationId) {
          setOrganisationId(null)
        }
      } catch (orgError) {
        console.error('Error loading organisation:', orgError)
        if (!organisationId) {
          const fallbackOrg = mockDataService.getOrganisations()[0]
          if (fallbackOrg) {
            setOrganisationId(fallbackOrg.id)
            localStorage.setItem('cerip_active_organisation', JSON.stringify(fallbackOrg))
          } else {
            setError('Erreur lors du chargement de l\'organisation.')
          }
        }
      }
    } catch (err) {
      console.error('Error in useOrganisation:', err)
      setError('Une erreur est survenue lors du chargement.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrganisation()
  }, [])

  const retry = () => {
    loadOrganisation()
  }

  return {
    organisationId,
    loading,
    error,
    retry,
    user
  }
}

