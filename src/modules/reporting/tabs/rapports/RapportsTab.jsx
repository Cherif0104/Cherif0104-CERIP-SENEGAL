import { useState } from 'react'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { RapportCard } from './RapportCard'
import RapportProgrammes from './RapportProgrammes'
import RapportProjets from './RapportProjets'
import RapportCandidatures from './RapportCandidatures'
import RapportBeneficiaires from './RapportBeneficiaires'
import RapportFinancier from './RapportFinancier'
import './RapportsTab.css'

const RAPPORTS_DISPONIBLES = [
  {
    id: 'programmes',
    title: 'Rapport Programmes',
    description: 'Vue d\'ensemble des programmes avec statistiques et budgets',
    icon: 'BookOpen',
    component: RapportProgrammes,
    color: '#3b82f6',
  },
  {
    id: 'projets',
    title: 'Rapport Projets',
    description: 'Détails des projets par programme avec indicateurs de performance',
    icon: 'FolderOpen',
    component: RapportProjets,
    color: '#10b981',
  },
  {
    id: 'candidatures',
    title: 'Rapport Candidatures',
    description: 'Analyse des candidatures par appel, statut et éligibilité',
    icon: 'Users',
    component: RapportCandidatures,
    color: '#8b5cf6',
  },
  {
    id: 'beneficiaires',
    title: 'Rapport Bénéficiaires',
    description: 'Suivi des bénéficiaires et taux d\'insertion',
    icon: 'UserCheck',
    component: RapportBeneficiaires,
    color: '#f59e0b',
  },
  {
    id: 'financier',
    title: 'Rapport Financier',
    description: 'État financier, flux de trésorerie et prévisions',
    icon: 'DollarSign',
    component: RapportFinancier,
    color: '#ef4444',
  },
]

export default function RapportsTab() {
  const [selectedRapport, setSelectedRapport] = useState(null)

  if (selectedRapport) {
    const RapportComponent = selectedRapport.component
    return (
      <div className="rapports-tab">
        <div className="rapport-header-modern">
          <Button variant="outline" onClick={() => setSelectedRapport(null)}>
            <Icon name="ArrowLeft" size={16} />
            Retour à la liste
          </Button>
          <div className="rapport-header-content">
            <h2>{selectedRapport.title}</h2>
            <p className="rapport-header-description">{selectedRapport.description}</p>
          </div>
        </div>
        <div className="rapport-content-wrapper">
          <RapportComponent />
        </div>
      </div>
    )
  }

  return (
    <div className="rapports-tab">
      {/* KPIs Statistiques */}
      <div className="rapports-stats">
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-primary">
            <Icon name="FileText" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{RAPPORTS_DISPONIBLES.length}</div>
            <div className="stat-label">Rapports Disponibles</div>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-success">
            <Icon name="Download" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">Excel / PDF</div>
            <div className="stat-label">Formats d'export</div>
          </div>
        </div>
      </div>

      {/* En-tête */}
      <div className="rapports-header-modern">
        <div>
          <h2>Rapports Préconfigurés</h2>
          <p className="subtitle">Sélectionnez un rapport pour le générer et l'exporter</p>
        </div>
      </div>

      {/* Grille de rapports */}
      <div className="rapports-grid-modern">
        {RAPPORTS_DISPONIBLES.map((rapport) => (
          <RapportCard
            key={rapport.id}
            title={rapport.title}
            description={rapport.description}
            icon={rapport.icon}
            color={rapport.color}
            onClick={() => setSelectedRapport(rapport)}
          />
        ))}
      </div>
    </div>
  )
}
