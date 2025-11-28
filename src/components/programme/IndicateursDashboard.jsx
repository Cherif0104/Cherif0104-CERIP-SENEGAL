import { useState, useEffect } from 'react'
import { programmeIndicateursService } from '../../services/programme-indicateurs.service'
import { toastService } from '../../services/toast.service'
import Icon from '../common/Icon'
import LoadingState from '../common/LoadingState'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import './ProgrammeComponents.css'

export default function IndicateursDashboard({ programmeId }) {
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState(null)
  const [selectedType, setSelectedType] = useState('ALL') // ALL, QUANTITATIF, QUALITATIF

  useEffect(() => {
    if (programmeId) {
      loadDashboard()
    }
  }, [programmeId])

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const { data, error } = await programmeIndicateursService.getDashboard(programmeId)
      if (error) {
        toastService.error('Erreur lors du chargement du tableau de bord')
      } else {
        setDashboard(data)
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
      toastService.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const formatValue = (value, unite) => {
    if (value === null || value === undefined) return 'N/A'
    return `${value}${unite ? ` ${unite}` : ''}`
  }

  const getTauxColor = (taux) => {
    if (taux >= 100) return '#10b981'
    if (taux >= 80) return '#f59e0b'
    return '#ef4444'
  }

  const filteredIndicateurs = dashboard?.indicateurs.filter(ind => {
    if (selectedType === 'ALL') return true
    return ind.type === selectedType
  }) || []

  if (loading) {
    return <LoadingState message="Chargement du tableau de bord..." />
  }

  if (!dashboard) {
    return (
      <div className="empty-state">
        <Icon name="BarChart" size={32} />
        <p>Aucune donnée disponible</p>
      </div>
    )
  }

  // Préparer les données pour les graphiques
  const evolutionData = filteredIndicateurs
    .filter(ind => ind.type === 'QUANTITATIF' && ind.stats?.evolution?.length > 0)
    .map(ind => {
      const evolution = ind.stats.evolution
      const dataPoints = evolution.map(e => ({
        date: new Date(e.date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        valeur: e.valeur,
        taux: e.taux
      }))
      return {
        indicateur: ind.libelle,
        data: dataPoints
      }
    })

  const tauxData = filteredIndicateurs
    .filter(ind => ind.type === 'QUANTITATIF' && ind.stats?.taux_realisation !== null)
    .map(ind => ({
      nom: ind.libelle,
      taux: ind.stats.taux_realisation,
      cible: ind.cible,
      unite: ind.unite
    }))

  return (
    <div className="indicateurs-dashboard">
      <div className="dashboard-header">
        <h3>Tableau de bord des indicateurs</h3>
        <div className="dashboard-filters">
          <button
            className={`filter-btn ${selectedType === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedType('ALL')}
          >
            Tous ({dashboard.total_indicateurs})
          </button>
          <button
            className={`filter-btn ${selectedType === 'QUANTITATIF' ? 'active' : ''}`}
            onClick={() => setSelectedType('QUANTITATIF')}
          >
            Quantitatifs ({dashboard.indicateurs_quantitatifs})
          </button>
          <button
            className={`filter-btn ${selectedType === 'QUALITATIF' ? 'active' : ''}`}
            onClick={() => setSelectedType('QUALITATIF')}
          >
            Qualitatifs ({dashboard.indicateurs_qualitatifs})
          </button>
        </div>
      </div>

      {/* Résumé */}
      <div className="dashboard-summary">
        <div className="summary-card">
          <div className="summary-card-header">
            <Icon name="BarChart" size={24} />
            <h4>Total indicateurs</h4>
          </div>
          <div className="summary-card-value">{dashboard.total_indicateurs}</div>
        </div>

        <div className="summary-card">
          <div className="summary-card-header">
            <Icon name="CheckCircle" size={24} />
            <h4>Avec mesures</h4>
          </div>
          <div className="summary-card-value">{dashboard.indicateurs_avec_mesures}</div>
          <div className="summary-card-note">
            {dashboard.total_indicateurs > 0
              ? `${((dashboard.indicateurs_avec_mesures / dashboard.total_indicateurs) * 100).toFixed(0)}%`
              : '0%'}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-header">
            <Icon name="AlertCircle" size={24} />
            <h4>Sans mesures</h4>
          </div>
          <div className="summary-card-value">{dashboard.indicateurs_sans_mesures}</div>
        </div>

        {dashboard.taux_moyen_realisation > 0 && (
          <div className="summary-card">
            <div className="summary-card-header">
              <Icon name="TrendingUp" size={24} />
              <h4>Taux moyen</h4>
            </div>
            <div className="summary-card-value" style={{ color: getTauxColor(dashboard.taux_moyen_realisation) }}>
              {dashboard.taux_moyen_realisation.toFixed(1)}%
            </div>
          </div>
        )}
      </div>

      {/* Graphique des taux de réalisation */}
      {tauxData.length > 0 && (
        <div className="dashboard-chart">
          <h4>Taux de réalisation par indicateur</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tauxData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="nom" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis 
                domain={[0, 120]}
                label={{ value: 'Taux (%)', angle: -90, position: 'insideLeft' }}
                fontSize={12}
              />
              <Tooltip 
                formatter={(value) => `${value.toFixed(1)}%`}
                labelStyle={{ color: '#333' }}
              />
              <Bar dataKey="taux" name="Taux de réalisation">
                {tauxData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getTauxColor(entry.taux)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Graphiques d'évolution */}
      {evolutionData.length > 0 && (
        <div className="dashboard-evolution">
          <h4>Évolution des indicateurs quantitatifs</h4>
          <div className="evolution-charts">
            {evolutionData.slice(0, 3).map((item, index) => (
              <div key={index} className="evolution-chart">
                <h5>{item.indicateur}</h5>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={item.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="valeur" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Valeur"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste détaillée */}
      <div className="dashboard-details">
        <h4>Détail des indicateurs</h4>
        <div className="indicateurs-detail-list">
          {filteredIndicateurs.map((indicateur) => {
            const taux = indicateur.stats?.taux_realisation
            const derniereMesure = indicateur.stats?.derniere_mesure

            return (
              <div key={indicateur.id} className="indicateur-detail-card">
                <div className="indicateur-detail-header">
                  <div>
                    <h5>{indicateur.libelle}</h5>
                    <span className="indicateur-detail-code">{indicateur.code}</span>
                  </div>
                  {taux !== null && taux !== undefined && (
                    <div 
                      className="indicateur-taux-badge"
                      style={{ 
                        background: getTauxColor(taux),
                        color: 'white',
                        borderColor: getTauxColor(taux)
                      }}
                    >
                      {taux.toFixed(1)}%
                    </div>
                  )}
                </div>

                <div className="indicateur-detail-body">
                  {indicateur.type === 'QUANTITATIF' && (
                    <div className="indicateur-detail-stats">
                      <div className="stat-row">
                        <span className="stat-label">Cible:</span>
                        <span className="stat-value">{formatValue(indicateur.cible, indicateur.unite)}</span>
                      </div>
                      {derniereMesure && (
                        <div className="stat-row">
                          <span className="stat-label">Dernière mesure:</span>
                          <span className="stat-value">
                            {formatValue(derniereMesure.valeur_quantitative, indicateur.unite)}
                          </span>
                        </div>
                      )}
                      {taux !== null && taux !== undefined && (
                        <div className="stat-row">
                          <span className="stat-label">Taux:</span>
                          <span className="stat-value" style={{ color: getTauxColor(taux) }}>
                            {taux.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {indicateur.type === 'QUALITATIF' && derniereMesure && (
                    <div className="indicateur-detail-qualitatif">
                      <p>{derniereMesure.valeur_qualitative}</p>
                    </div>
                  )}

                  {indicateur.stats?.total_mesures > 0 && (
                    <div className="indicateur-detail-meta">
                      <Icon name="FileCheck" size={14} />
                      <span>{indicateur.stats.total_mesures} mesure(s) enregistrée(s)</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

