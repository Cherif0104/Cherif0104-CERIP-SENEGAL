import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { tresorerieService } from '@/services/tresorerie.service'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { KPICard } from '@/components/modules/KPICard'
import { Icon } from '@/components/common/Icon'
import { Button } from '@/components/common/Button'
import { logger } from '@/utils/logger'
import './TresorerieDashboard.css'

export default function TresorerieDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [selectedCompte, setSelectedCompte] = useState(null)

  useEffect(() => {
    loadDashboard()
  }, [selectedCompte])

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const { data, error } = await tresorerieService.getDashboard(selectedCompte)
      if (error) {
        logger.error('TRESORERIE_DASHBOARD', 'Erreur chargement dashboard', error)
      } else {
        setDashboardData(data)
      }
    } catch (error) {
      logger.error('TRESORERIE_DASHBOARD', 'Erreur inattendue', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount || 0)
  }

  if (loading) {
    return <LoadingState message="Chargement du dashboard trésorerie..." />
  }

  if (!dashboardData) {
    return <EmptyState icon="TrendingDown" title="Aucune donnée" message="Aucune donnée de trésorerie disponible." />
  }

  const { comptes, total_soldes, total_encaissements_mois, total_decaissements_mois, solde_net_mois } =
    dashboardData

  return (
    <div className="tresorerie-dashboard">
      <div className="tresorerie-dashboard-header">
        <h1>Dashboard Trésorerie</h1>
        <Button variant="primary" onClick={loadDashboard}>
          <Icon name="RefreshCw" size={16} />
          Actualiser
        </Button>
      </div>

      {/* KPIs Globaux */}
      <div className="tresorerie-kpis">
        <KPICard
          icon="Wallet"
          title="Solde Total"
          value={formatCurrency(total_soldes)}
          trend={total_soldes >= 0 ? 'up' : 'down'}
          variant={total_soldes >= 0 ? 'success' : 'danger'}
        />
        <KPICard
          icon="TrendingUp"
          title="Encaissements Mois"
          value={formatCurrency(total_encaissements_mois)}
          trend="up"
          variant="success"
        />
        <KPICard
          icon="TrendingDown"
          title="Décaissements Mois"
          value={formatCurrency(total_decaissements_mois)}
          trend="down"
          variant="warning"
        />
        <KPICard
          icon="BarChart"
          title="Solde Net Mois"
          value={formatCurrency(solde_net_mois)}
          trend={solde_net_mois >= 0 ? 'up' : 'down'}
          variant={solde_net_mois >= 0 ? 'success' : 'danger'}
        />
      </div>

      {/* Liste des Comptes */}
      <div className="tresorerie-comptes-section">
        <h2>Comptes Bancaires</h2>
        {comptes && comptes.length > 0 ? (
          <div className="comptes-list">
            {comptes.map((compte) => (
              <div
                key={compte.id}
                className={`compte-card ${selectedCompte === compte.id ? 'selected' : ''}`}
                onClick={() => setSelectedCompte(selectedCompte === compte.id ? null : compte.id)}
              >
                <div className="compte-header">
                  <div>
                    <h3>{compte.nom}</h3>
                    <p className="compte-info">
                      {compte.banque} - {compte.numero_compte || 'N/A'}
                    </p>
                  </div>
                  <div className={`compte-solde ${compte.solde_actuel >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(compte.solde_actuel)}
                  </div>
                </div>
                <div className="compte-details">
                  <span className="compte-type">{compte.type_compte}</span>
                  <span className={`compte-status ${compte.actif ? 'actif' : 'inactif'}`}>
                    {compte.actif ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="CreditCard" title="Aucun compte" message="Aucun compte bancaire configuré." />
        )}
      </div>

      {/* Actions rapides */}
      <div className="tresorerie-actions">
        <Button variant="primary" onClick={() => navigate('/tresorerie/compte/new')}>
          <Icon name="Plus" size={16} />
          Nouveau Compte
        </Button>
        <Button variant="secondary" onClick={() => navigate('/tresorerie/flux/new?type=ENCAISSEMENT')}>
          <Icon name="DollarSign" size={16} />
          Encaissement
        </Button>
        <Button variant="secondary" onClick={() => navigate('/tresorerie/flux/new?type=DECAISSEMENT')}>
          <Icon name="Minus" size={16} />
          Décaissement
        </Button>
        <Button variant="secondary" onClick={() => navigate('/tresorerie/prevision/new')}>
          <Icon name="Calendar" size={16} />
          Prévision
        </Button>
      </div>
    </div>
  )
}

