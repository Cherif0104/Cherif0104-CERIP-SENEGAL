import { useState, useEffect } from 'react'
import { beneficiairesService } from '@/services/beneficiaires.service'
import { assiduiteService } from '@/services/assiduite.service'
import { DataTable } from '@/components/common/DataTable'
import { Button } from '@/components/common/Button'
import { Select } from '@/components/common/Select'
import { Input } from '@/components/common/Input'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { MetricCard } from '@/components/modules/MetricCard'
import { toast } from '@/components/common/Toast'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/utils/format'
import { logger } from '@/utils/logger'
import { useNavigate } from 'react-router-dom'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import './BeneficiairesProjet.css'

/**
 * Composant de gestion des bénéficiaires pour un projet spécifique
 * Inclut suivi individuel et collectif, diagnostics, transferts
 * @param {string} projetId - ID du projet
 */
export default function BeneficiairesProjet({ projetId: projetIdProp = null }) {
  const navigate = useNavigate()
  const [beneficiaires, setBeneficiaires] = useState([])
  const [assiduiteScores, setAssiduiteScores] = useState({})
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingAssiduite, setLoadingAssiduite] = useState(false)
  const [filters, setFilters] = useState({
    statut_global: '',
    search: '',
  })

  useEffect(() => {
    if (projetIdProp) {
      loadBeneficiaires()
      loadStats()
    }
  }, [projetIdProp, filters])

  useEffect(() => {
    if (projetIdProp && beneficiaires.length > 0) {
      loadAssiduiteScores()
    }
  }, [projetIdProp, beneficiaires])

  const loadBeneficiaires = async () => {
    if (!projetIdProp) return
    
    setLoading(true)
    try {
      const { data, error } = await beneficiairesService.getByProjet(projetIdProp)
      
      if (error) {
        logger.error('BENEFICIAIRES_PROJET', 'Erreur chargement bénéficiaires', error)
        toast.error('Erreur lors du chargement des bénéficiaires')
      } else {
        let filtered = data || []
        
        // Appliquer les filtres
        if (filters.statut_global) {
          filtered = filtered.filter(b => b.statut_global === filters.statut_global)
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          filtered = filtered.filter(b => 
            (b.personne?.nom?.toLowerCase().includes(searchLower)) ||
            (b.personne?.prenom?.toLowerCase().includes(searchLower)) ||
            (b.code?.toLowerCase().includes(searchLower))
          )
        }
        
        setBeneficiaires(filtered)
      }
    } catch (error) {
      logger.error('BENEFICIAIRES_PROJET', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    if (!projetIdProp) return
    
    try {
      const { data } = await beneficiairesService.getByProjet(projetIdProp)
      if (!data) return

      const total = data.length
      const actifs = data.filter(b => 
        b.statut_global && !['TERMINE', 'ABANDON', 'ABANDONNE'].includes(b.statut_global.toUpperCase())
      ).length

      // Récupérer les accompagnements
      const beneficiaireIds = data.map(b => b.id)
      const { data: accompagnements } = await supabase
        .from('accompagnements')
        .select('beneficiaire_id, statut')
        .in('beneficiaire_id', beneficiaireIds)

      const accompagnes = new Set(accompagnements?.map(a => a.beneficiaire_id) || []).size

      // Récupérer les insertions
      const { data: insertions } = await supabase
        .from('insertions')
        .select('beneficiaire_id')
        .in('beneficiaire_id', beneficiaireIds)

      const inserts = insertions?.length || 0
      const tauxInsertion = total > 0 ? (inserts / total) * 100 : 0

      setStats({
        total,
        actifs,
        accompagnes,
        inserts,
        tauxInsertion,
      })
    } catch (error) {
      logger.error('BENEFICIAIRES_PROJET', 'Erreur chargement stats', error)
    }
  }

  const loadAssiduiteScores = async () => {
    if (!projetIdProp || beneficiaires.length === 0) return
    
    setLoadingAssiduite(true)
    try {
      const scores = {}
      for (const beneficiaire of beneficiaires) {
        const result = await assiduiteService.getAssiduiteByProjet(projetIdProp, beneficiaire.id)
        if (!result.error && result.data) {
          scores[beneficiaire.id] = result.data.score || 0
        } else {
          scores[beneficiaire.id] = 0
        }
      }
      setAssiduiteScores(scores)
    } catch (error) {
      logger.error('BENEFICIAIRES_PROJET', 'Erreur chargement assiduité', error)
    } finally {
      setLoadingAssiduite(false)
    }
  }

  const handleRowClick = (row) => {
    navigate(`/beneficiaires/${row.id}`)
  }

  const columns = [
    { 
      key: 'code', 
      label: 'Code'
    },
    { 
      key: 'personne', 
      label: 'Nom complet', 
      render: (value) => value ? `${value.prenom || ''} ${value.nom || ''}`.trim() || '-' : '-' 
    },
    { 
      key: 'statut_global', 
      label: 'Statut',
      render: (value) => (
        <span className={`beneficiaire-statut statut-${value?.toLowerCase().replace(/\s+/g, '-') || 'actif'}`}>
          {value || 'Actif'}
        </span>
      )
    },
    { 
      key: 'date_entree', 
      label: 'Date entrée', 
      render: (value) => value ? formatDate(value) : '-' 
    },
    {
      key: 'assiduite',
      label: 'Assiduité',
      render: (_, row) => {
        const score = assiduiteScores[row.id] ?? null
        if (score === null) {
          return loadingAssiduite ? <span>...</span> : <span>-</span>
        }
        const scoreValue = typeof score === 'number' ? score : (score.score || 0)
        const isLow = scoreValue < 80
        return (
          <span className={`assiduite-score ${isLow ? 'low' : ''}`}>
            {scoreValue.toFixed(1)}%
            {isLow && <Icon name="AlertTriangle" size={14} style={{ marginLeft: '4px', color: '#ef4444' }} />}
          </span>
        )
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleRowClick(row)}
          >
            Voir détails
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/beneficiaires/${row.id}?tab=diagnostics`)}
            title="Voir diagnostics"
          >
            <Icon name="FileText" size={16} />
          </Button>
        </div>
      )
    },
  ]

  if (!projetIdProp) {
    return (
      <EmptyState 
        icon="Users" 
        title="Projet non spécifié" 
        message="Impossible de charger les bénéficiaires sans ID de projet"
      />
    )
  }

  return (
    <div className="beneficiaires-projet">
      <div className="beneficiaires-header">
        <h2>Bénéficiaires du Projet</h2>
        <div className="beneficiaires-actions">
          <PermissionGuard permission="beneficiaires.create">
            <Button 
              variant="primary" 
              onClick={() => navigate(`/beneficiaires/new?projet_id=${projetIdProp}`)}
            >
              <Icon name="Plus" size={16} />
              Nouveau bénéficiaire
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {stats && (
        <div className="beneficiaires-metrics">
          <MetricCard
            title="Bénéficiaires actifs"
            value={stats.actifs}
            detail={`${stats.total} au total`}
            variant="primary"
          />
          <MetricCard
            title="Accompagnés"
            value={stats.accompagnes}
            detail={`${stats.total} au total`}
            variant="secondary"
          />
          <MetricCard
            title="Insérés"
            value={stats.inserts}
            detail={`${stats.tauxInsertion.toFixed(1)}% de taux d'insertion`}
            variant="success"
          />
        </div>
      )}

      <div className="beneficiaires-filters">
        <Input
          label="Recherche"
          type="text"
          placeholder="Nom, prénom, code..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <Select
          label="Statut"
          value={filters.statut_global}
          onChange={(e) => setFilters({ ...filters, statut_global: e.target.value })}
          options={[
            { value: '', label: 'Tous les statuts' },
            { value: 'ACTIF', label: 'Actif' },
            { value: 'EN_ACCOMPAGNEMENT', label: 'En accompagnement' },
            { value: 'INSERTE', label: 'Inséré' },
            { value: 'TERMINE', label: 'Terminé' },
            { value: 'ABANDON', label: 'Abandon' },
          ]}
        />
        {(filters.statut_global || filters.search) && (
          <Button 
            variant="outline" 
            onClick={() => setFilters({ statut_global: '', search: '' })}
          >
            Réinitialiser
          </Button>
        )}
      </div>

      {loading ? (
        <LoadingState message="Chargement des bénéficiaires..." />
      ) : beneficiaires.length === 0 ? (
        <EmptyState 
          icon="Users" 
          title="Aucun bénéficiaire" 
          message="Ce projet n'a pas encore de bénéficiaires associés"
        />
      ) : (
        <>
          <div className="beneficiaires-summary">
            <p>
              <strong>{beneficiaires.length}</strong> bénéficiaire(s) trouvé(s)
            </p>
          </div>
          <DataTable
            columns={columns}
            data={beneficiaires}
            onRowClick={handleRowClick}
          />
        </>
      )}
    </div>
  )
}

