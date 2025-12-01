import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

/**
 * Composant de redirection pour gérer les anciennes routes
 */
export default function RedirectRoute({ to, replace = true }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const programmeId = searchParams.get('programme_id')
    
    if (programmeId && to.includes(':programme_id')) {
      // Remplacer :programme_id par la valeur réelle
      const redirectPath = to.replace(':programme_id', programmeId)
      navigate(redirectPath, { replace })
    } else if (to) {
      navigate(to, { replace })
    }
  }, [navigate, searchParams, to, replace])

  return null
}
