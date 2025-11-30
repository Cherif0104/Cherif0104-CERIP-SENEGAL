import { useState, useEffect } from 'react'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'

export default function HistoriqueFinancements({ financeurId }) {
  const [historique, setHistorique] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistorique()
  }, [financeurId])

  const loadHistorique = async () => {
    setLoading(true)
    // TODO: Créer service pour récupérer historique des financements
    // Pour l'instant, on attend la table financements avec lien vers financeur
    setHistorique([])
    setLoading(false)
  }

  if (loading) return <LoadingState />

  return (
    <div className="historique-financements">
      <h3>Historique des Financements</h3>
      {historique.length === 0 ? (
        <EmptyState
          icon="History"
          title="Aucun historique"
          message="L'historique des financements sera affiché ici une fois les données liées"
        />
      ) : (
        <div>
          {/* TODO: Afficher tableau historique */}
        </div>
      )}
    </div>
  )
}

