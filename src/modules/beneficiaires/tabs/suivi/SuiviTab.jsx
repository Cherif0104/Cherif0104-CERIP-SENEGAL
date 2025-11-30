import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { MetricCard } from '@/components/modules/MetricCard'
import { logger } from '@/utils/logger'
import './SuiviTab.css'

export default function SuiviTab() {
  const [stats, setStats] = useState(null)
  const [insertions, setInsertions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSuivi()
  }, [])

  const loadSuivi = async () => {
    setLoading(true)
    try {
      // Récupérer les insertions
      const { data: insertionsData, error: insertionsError } = await supabase
        .from('suivi_insertion')
        .select('*, beneficiaires_projet:beneficiaire_projet_id(*, beneficiaires(*), projets(*))')
        .order('date_suivi', { ascending: false })

      if (insertionsError) {
        logger.error('SUIVI_TAB', 'Erreur chargement insertions', insertionsError)
      } else {
        setInsertions(insertionsData || [])
      }

      // Récupérer les projets entrepreneuriaux
      const { data: projetsEntrep, error: projetsError } = await supabase
        .from('projets_entrepreneuriaux')
        .select('*, beneficiaires_projet:beneficiaire_projet_id(*, beneficiaires(*))')

      if (projetsError) {
        logger.error('SUIVI_TAB', 'Erreur chargement projets', projetsError)
      }

      // Calculer les statistiques
      const totalInsertions = insertionsData?.length || 0
      const totalProjets = projetsEntrep?.length || 0
      const avecEmploi = insertionsData?.filter((i) => i.type_contrat)?.length || 0
      const totalEmplois = projetsEntrep?.reduce((sum, p) => sum + (p.emplois_crees || 0), 0) || 0

      setStats({
        totalInsertions,
        totalProjets,
        avecEmploi,
        totalEmplois,
        projetsEntrep: projetsEntrep || [],
      })

      logger.debug('SUIVI_TAB', 'Données de suivi chargées')
    } catch (error) {
      logger.error('SUIVI_TAB', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  return (
    <div className="suivi-tab">
      <div className="tab-header">
        <h2>Suivi des Insertions</h2>
      </div>

      {stats && (
        <div className="stats-grid">
          <MetricCard
            title="Total insertions"
            value={stats.totalInsertions}
            detail="Insertions professionnelles"
          />
          <MetricCard
            title="Avec emploi"
            value={stats.avecEmploi}
            detail={`Sur ${stats.totalInsertions} insertions`}
          />
          <MetricCard
            title="Projets créés"
            value={stats.totalProjets}
            detail="Projets entrepreneuriaux"
          />
          <MetricCard
            title="Emplois créés"
            value={stats.totalEmplois}
            detail="Par les projets"
          />
        </div>
      )}

      <div className="suivi-content">
        <div className="insertions-section">
          <h3>Insertions Professionnelles</h3>
          {insertions.length === 0 ? (
            <EmptyState
              icon="Briefcase"
              title="Aucune insertion"
              message="Aucune insertion professionnelle enregistrée"
            />
          ) : (
            <div className="insertions-list">
              <table className="suivi-table">
                <thead>
                  <tr>
                    <th>Bénéficiaire</th>
                    <th>Date suivi</th>
                    <th>Situation</th>
                    <th>Type contrat</th>
                    <th>Revenu mensuel</th>
                  </tr>
                </thead>
                <tbody>
                  {insertions.map((insertion) => {
                    const benef = insertion.beneficiaires_projet?.beneficiaires
                    return (
                      <tr key={insertion.id}>
                        <td>
                          {benef
                            ? `${benef.prenom || ''} ${benef.nom || ''}`.trim() ||
                              benef.raison_sociale ||
                              '-'
                            : '-'}
                        </td>
                        <td>{new Date(insertion.date_suivi).toLocaleDateString('fr-FR')}</td>
                        <td>{insertion.situation || '-'}</td>
                        <td>{insertion.type_contrat || '-'}</td>
                        <td>
                          {insertion.revenu_mensuel_estime
                            ? new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'XOF',
                                minimumFractionDigits: 0,
                              }).format(insertion.revenu_mensuel_estime)
                            : '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="projets-section">
          <h3>Projets Entrepreneuriaux</h3>
          {stats?.projetsEntrep?.length === 0 ? (
            <EmptyState
              icon="Lightbulb"
              title="Aucun projet"
              message="Aucun projet entrepreneurial enregistré"
            />
          ) : (
            <div className="projets-list">
              <table className="suivi-table">
                <thead>
                  <tr>
                    <th>Projet</th>
                    <th>Bénéficiaire</th>
                    <th>Secteur</th>
                    <th>Statut</th>
                    <th>Emplois créés</th>
                    <th>CA Année 1</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.projetsEntrep?.map((projet) => {
                    const benef = projet.beneficiaires_projet?.beneficiaires
                    return (
                      <tr key={projet.id}>
                        <td>{projet.nom_projet || '-'}</td>
                        <td>
                          {benef
                            ? `${benef.prenom || ''} ${benef.nom || ''}`.trim() ||
                              benef.raison_sociale ||
                              '-'
                            : '-'}
                        </td>
                        <td>{projet.secteur || '-'}</td>
                        <td>{projet.statut || '-'}</td>
                        <td>{projet.emplois_crees || 0}</td>
                        <td>
                          {projet.chiffre_affaires_annee1
                            ? new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'XOF',
                                minimumFractionDigits: 0,
                              }).format(projet.chiffre_affaires_annee1)
                            : '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

