import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { projetMetricsService } from '@/services/projet-metrics.service'
import { projetDepensesService } from '@/services/projet-depenses.service'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { DataTable } from '@/components/common/DataTable'
import { Select } from '@/components/common/Select'
import { Input } from '@/components/common/Input'
import { exportToExcel, exportToPdf } from '@/utils/exportUtils'
import { toast } from '@/components/common/Toast'
import { formatDate, formatCurrency } from '@/utils/format'
import { logger } from '@/utils/logger'
import { useNavigate } from 'react-router-dom'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import './ReportingProjetDetail.css'

/**
 * Composant de reporting pour un projet spécifique
 * Gère les rapports configurés, récurrents, exports et permissions
 * @param {string} projetId - ID du projet
 */
export default function ReportingProjetDetail({ projetId: projetIdProp = null }) {
  const navigate = useNavigate()
  const [rapports, setRapports] = useState([])
  const [rapportsRecurrents, setRapportsRecurrents] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (projetIdProp) {
      loadRapports()
      loadRapportsRecurrents()
      loadMetrics()
    }
  }, [projetIdProp])

  const loadRapports = async () => {
    if (!projetIdProp) return
    
    try {
      const { data, error } = await supabase
        .from('projet_rapports')
        .select('*')
        .eq('projet_id', projetIdProp)
        .order('genere_le', { ascending: false })

      if (error) {
        logger.error('REPORTING_PROJET_DETAIL', 'Erreur chargement rapports', error)
      } else {
        setRapports(data || [])
      }
    } catch (error) {
      logger.error('REPORTING_PROJET_DETAIL', 'Erreur inattendue chargement rapports', error)
    }
  }

  const loadRapportsRecurrents = async () => {
    if (!projetIdProp) return
    
    try {
      const { data, error } = await supabase
        .from('projet_rapports_recurrents')
        .select('*')
        .eq('projet_id', projetIdProp)
        .eq('est_actif', true)
        .order('prochaine_generation', { ascending: true })

      if (error) {
        logger.error('REPORTING_PROJET_DETAIL', 'Erreur chargement rapports récurrents', error)
      } else {
        setRapportsRecurrents(data || [])
      }
    } catch (error) {
      logger.error('REPORTING_PROJET_DETAIL', 'Erreur inattendue chargement rapports récurrents', error)
    }
  }

  const loadMetrics = async () => {
    if (!projetIdProp) return
    
    setLoading(true)
    try {
      const metricsData = await projetMetricsService.getProjetMetrics(projetIdProp)
      setMetrics(metricsData)
    } catch (error) {
      logger.error('REPORTING_PROJET_DETAIL', 'Erreur chargement métriques', error)
    } finally {
      setLoading(false)
    }
  }

  const generateRapport = async (typeRapport) => {
    if (!projetIdProp || !metrics) return

    setGenerating(true)
    try {
      let dataToExport = []

      switch (typeRapport) {
        case 'financier':
          const { data: depenses } = await projetDepensesService.getByProjet(projetIdProp)
          dataToExport = [
            {
              'Budget alloué': formatCurrency(metrics.finances.budgetTotal),
              'Budget consommé': formatCurrency(metrics.finances.budgetConsomme),
              'Budget restant': formatCurrency(metrics.finances.budgetRestant),
              'Taux de consommation': `${metrics.finances.tauxConsommation.toFixed(1)}%`,
              'Dépenses validées': formatCurrency(metrics.finances.depensesValidees),
              'Nombre de dépenses': metrics.finances.nombreDepenses,
            },
            ...(depenses || []).map(d => ({
              'Date': formatDate(d.date_depense),
              'Libellé': d.libelle,
              'Montant': formatCurrency(d.montant),
              'Statut': d.statut,
              'Référence': d.reference || '-',
            }))
          ]
          break

        case 'avancement':
          dataToExport = [
            {
              'Projet': metrics.projet.nom,
              'Statut': metrics.projet.statut,
              'Date début': formatDate(metrics.projet.date_debut),
              'Date fin': formatDate(metrics.projet.date_fin),
              'Jalons terminés': `${metrics.jalons.termines}/${metrics.jalons.total}`,
              'Taux de complétion': `${metrics.jalons.tauxCompletion.toFixed(1)}%`,
              'Jalons en retard': metrics.jalons.enRetard,
            }
          ]
          break

        case 'beneficiaires':
          dataToExport = [
            {
              'Total bénéficiaires': metrics.beneficiaires.total,
              'Bénéficiaires actifs': metrics.beneficiaires.actifs,
              'Bénéficiaires accompagnés': metrics.beneficiaires.accompagnes,
              'Bénéficiaires insérés': metrics.beneficiaires.inserts,
              'Taux de conversion': `${metrics.beneficiaires.taux_conversion.toFixed(1)}%`,
              'Taux d\'insertion': `${metrics.beneficiaires.taux_insertion.toFixed(1)}%`,
            }
          ]
          break

        case 'complet':
          dataToExport = [
            {
              'Projet': metrics.projet.nom,
              'Code': metrics.projet.code,
              'Statut': metrics.projet.statut,
              'Date début': formatDate(metrics.projet.date_debut),
              'Date fin': formatDate(metrics.projet.date_fin),
              'Budget alloué': formatCurrency(metrics.finances.budgetTotal),
              'Budget consommé': formatCurrency(metrics.finances.budgetConsomme),
              'Taux de consommation': `${metrics.finances.tauxConsommation.toFixed(1)}%`,
              'Total bénéficiaires': metrics.beneficiaires.total,
              'Total candidats': metrics.candidats.total,
              'Jalons terminés': `${metrics.jalons.termines}/${metrics.jalons.total}`,
              'Activités totales': metrics.activites.total,
            }
          ]
          break

        default:
          toast.error('Type de rapport non reconnu')
          return
      }

      // Enregistrer le rapport
      const { data: { user } } = await supabase.auth.getUser()
      const { error: insertError } = await supabase
        .from('projet_rapports')
        .insert({
          projet_id: projetIdProp,
          titre: `Rapport ${typeRapport} - ${new Date().toLocaleDateString('fr-FR')}`,
          type_rapport: typeRapport.toUpperCase(),
          genere_par: user?.id,
          statut: 'GENERE',
        })

      if (insertError) {
        logger.error('REPORTING_PROJET_DETAIL', 'Erreur enregistrement rapport', insertError)
      }

      // Exporter
      exportToExcel(
        dataToExport,
        `rapport_${typeRapport}_projet_${projetIdProp}_${new Date().toISOString().split('T')[0]}`,
        `Rapport ${typeRapport}`
      )
      toast.success('Rapport généré avec succès')
    } catch (error) {
      logger.error('REPORTING_PROJET_DETAIL', 'Erreur génération rapport', error)
      toast.error('Erreur lors de la génération du rapport')
    } finally {
      setGenerating(false)
    }
  }

  const columns = [
    { 
      key: 'titre', 
      label: 'Titre'
    },
    { 
      key: 'type_rapport', 
      label: 'Type'
    },
    { 
      key: 'statut', 
      label: 'Statut',
      render: (value) => (
        <span className={`rapport-statut statut-${value?.toLowerCase()}`}>
          {value || '-'}
        </span>
      )
    },
    { 
      key: 'genere_le', 
      label: 'Généré le', 
      render: (value) => value ? formatDate(value) : '-' 
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {row.fichier_url && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(row.fichier_url, '_blank')}
            >
              <Icon name="Download" size={16} />
            </Button>
          )}
        </div>
      )
    },
  ]

  if (!projetIdProp) {
    return (
      <EmptyState 
        icon="FileText" 
        title="Projet non spécifié" 
        message="Impossible de charger les rapports sans ID de projet"
      />
    )
  }

  if (loading) {
    return <LoadingState message="Chargement des rapports..." />
  }

  return (
    <div className="reporting-projet-detail">
      <div className="reporting-header">
        <h2>Rapports du Projet</h2>
      </div>

      <div className="reporting-section">
        <h3>Générer un Rapport</h3>
        <div className="rapports-actions">
          <Button 
            variant="primary" 
            onClick={() => generateRapport('financier')}
            disabled={generating || !metrics}
          >
            <Icon name="DollarSign" size={16} />
            Rapport Financier
          </Button>
          <Button 
            variant="primary" 
            onClick={() => generateRapport('avancement')}
            disabled={generating || !metrics}
          >
            <Icon name="TrendingUp" size={16} />
            Rapport d'Avancement
          </Button>
          <Button 
            variant="primary" 
            onClick={() => generateRapport('beneficiaires')}
            disabled={generating || !metrics}
          >
            <Icon name="Users" size={16} />
            Rapport Bénéficiaires
          </Button>
          <Button 
            variant="primary" 
            onClick={() => generateRapport('complet')}
            disabled={generating || !metrics}
          >
            <Icon name="FileText" size={16} />
            Rapport Complet
          </Button>
        </div>
      </div>

      {rapportsRecurrents.length > 0 && (
        <div className="reporting-section">
          <h3>Rapports Récurrents Configurés</h3>
          <div className="rapports-recurrents-list">
            {rapportsRecurrents.map(rapport => (
              <div key={rapport.id} className="rapport-recurrent-card">
                <div className="rapport-recurrent-header">
                  <h4>{rapport.titre_modele}</h4>
                  <span className="rapport-frequence">{rapport.frequence}</span>
                </div>
                <div className="rapport-recurrent-body">
                  <p>Prochaine génération: {rapport.prochaine_generation ? formatDate(rapport.prochaine_generation) : '-'}</p>
                  <p>Dernière génération: {rapport.derniere_generation ? formatDate(rapport.derniere_generation) : 'Jamais'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="reporting-section">
        <h3>Historique des Rapports</h3>
        {rapports.length === 0 ? (
          <EmptyState 
            icon="FileText" 
            title="Aucun rapport généré" 
            message="Aucun rapport n'a encore été généré pour ce projet"
          />
        ) : (
          <DataTable
            columns={columns}
            data={rapports}
          />
        )}
      </div>
    </div>
  )
}

