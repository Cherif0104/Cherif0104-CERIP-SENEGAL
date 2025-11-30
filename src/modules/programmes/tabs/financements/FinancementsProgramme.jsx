import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { financementsService } from '@/services/financements.service'
import { programmesService } from '@/services/programmes.service'
import { financeursService } from '@/services/financeurs.service'
import { DataTable } from '@/components/common/DataTable'
import { Button } from '@/components/common/Button'
import { Select } from '@/components/common/Select'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { toast } from '@/components/common/Toast'
import { formatDate, formatCurrency } from '@/utils/format'
import { logger } from '@/utils/logger'
import './FinancementsProgramme.css'

export default function FinancementsProgramme() {
  const [searchParams] = useSearchParams()
  const programmeId = searchParams.get('programme_id')
  
  const [financements, setFinancements] = useState([])
  const [programmes, setProgrammes] = useState([])
  const [financeurs, setFinanceurs] = useState([])
  const [selectedProgramme, setSelectedProgramme] = useState(programmeId || '')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [selectedProgramme])

  const loadData = async () => {
    setLoading(true)
    try {
      // Charger programmes et financeurs pour les filtres
      const [progsResult, finResult, fincResult] = await Promise.all([
        programmesService.getAll(),
        financeursService.getAll(),
        selectedProgramme 
          ? financementsService.getByProgramme(selectedProgramme)
          : financementsService.getAll()
      ])

      if (progsResult.error) {
        logger.error('FINANCEMENTS_PROGRAMME', 'Erreur chargement programmes', progsResult.error)
      } else {
        setProgrammes(progsResult.data || [])
      }

      if (finResult.error) {
        logger.error('FINANCEMENTS_PROGRAMME', 'Erreur chargement financeurs', finResult.error)
      } else {
        setFinanceurs(finResult.data || [])
      }

      if (fincResult.error) {
        logger.error('FINANCEMENTS_PROGRAMME', 'Erreur chargement financements', fincResult.error)
        toast.error('Erreur lors du chargement des financements')
      } else {
        setFinancements(fincResult.data || [])
      }
    } catch (error) {
      logger.error('FINANCEMENTS_PROGRAMME', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'financeurs', label: 'Financeur', render: (value) => value?.nom || '-' },
    { key: 'programmes', label: 'Programme', render: (value) => value?.nom || '-' },
    { 
      key: 'montant_accorde', 
      label: 'Montant', 
      render: (value) => value ? formatCurrency(value) : '-' 
    },
    { key: 'devise', label: 'Devise', render: (value) => value || 'XOF' },
    { 
      key: 'date_signature', 
      label: 'Date signature', 
      render: (value) => value ? formatDate(value) : '-' 
    },
    { 
      key: 'date_debut', 
      label: 'Date début', 
      render: (value) => value ? formatDate(value) : '-' 
    },
    { 
      key: 'date_fin', 
      label: 'Date fin', 
      render: (value) => value ? formatDate(value) : '-' 
    },
  ]

  if (loading) return <LoadingState />

  const totalMontant = financements.reduce((sum, f) => sum + parseFloat(f.montant_accorde || 0), 0)

  return (
    <div className="financements-programme">
      <div className="financements-header">
        <h2>Financements par Programme</h2>
        <div className="financements-filters">
          <Select
            label="Filtrer par programme"
            value={selectedProgramme}
            onChange={(e) => setSelectedProgramme(e.target.value)}
            options={[
              { value: '', label: 'Tous les programmes' },
              ...(programmes || []).map(p => ({ value: p.id, label: p.nom }))
            ]}
          />
        </div>
      </div>

      {financements.length === 0 ? (
        <EmptyState 
          icon="DollarSign" 
          title="Aucun financement" 
          message={selectedProgramme ? "Aucun financement pour ce programme" : "Aucun financement enregistré"} 
        />
      ) : (
        <>
          <div className="financements-summary">
            <div className="summary-card">
              <Icon name="DollarSign" size={24} />
              <div>
                <div className="summary-label">Total financé</div>
                <div className="summary-value">{formatCurrency(totalMontant)}</div>
              </div>
            </div>
            <div className="summary-card">
              <Icon name="Briefcase" size={24} />
              <div>
                <div className="summary-label">Nombre de financements</div>
                <div className="summary-value">{financements.length}</div>
              </div>
            </div>
          </div>

          <div className="financements-list">
            <DataTable columns={columns} data={financements} />
          </div>
        </>
      )}
    </div>
  )
}

