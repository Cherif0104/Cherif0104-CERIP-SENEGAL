import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { logger } from '@/utils/logger'
import './PlanningRH.css'

export default function PlanningRH() {
  const [loading, setLoading] = useState(true)
  const [planning, setPlanning] = useState([])

  useEffect(() => {
    loadPlanning()
  }, [])

  const loadPlanning = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('planning_rh')
        .select('*, employes:employe_id(nom, prenom, matricule)')
        .order('date', { ascending: true })

      if (error) {
        logger.error('PLANNING_RH', 'Erreur chargement planning', error)
        return
      }
      setPlanning(data || [])
    } catch (error) {
      logger.error('PLANNING_RH', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  return (
    <div className="planning-rh">
      <div className="tab-header">
        <h2>Planning RH</h2>
      </div>

      {planning.length === 0 ? (
        <EmptyState
          icon="Calendar"
          title="Aucun planning"
          message="Aucune entrée de planning enregistrée"
        />
      ) : (
        <div className="planning-content">
          <table className="planning-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Employé</th>
                <th>Type</th>
                <th>Heure début</th>
                <th>Heure fin</th>
                <th>Durée</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {planning.map((item) => {
                const employe = item.employes
                return (
                  <tr key={item.id}>
                    <td>{new Date(item.date).toLocaleDateString('fr-FR')}</td>
                    <td>
                      {employe
                        ? `${employe.prenom || ''} ${employe.nom || ''}`.trim() ||
                          employe.matricule ||
                          '-'
                        : '-'}
                    </td>
                    <td>{item.type || '-'}</td>
                    <td>{item.heure_debut || '-'}</td>
                    <td>{item.heure_fin || '-'}</td>
                    <td>{item.duree_heures ? `${item.duree_heures}h` : '-'}</td>
                    <td>{item.description || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

