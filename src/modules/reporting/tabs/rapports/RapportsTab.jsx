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
  },
  {
    id: 'projets',
    title: 'Rapport Projets',
    description: 'Détails des projets par programme avec indicateurs de performance',
    icon: 'FolderOpen',
    component: RapportProjets,
  },
  {
    id: 'candidatures',
    title: 'Rapport Candidatures',
    description: 'Analyse des candidatures par appel, statut et éligibilité',
    icon: 'Users',
    component: RapportCandidatures,
  },
  {
    id: 'beneficiaires',
    title: 'Rapport Bénéficiaires',
    description: 'Suivi des bénéficiaires et taux d\'insertion',
    icon: 'UserCheck',
    component: RapportBeneficiaires,
  },
  {
    id: 'financier',
    title: 'Rapport Financier',
    description: 'État financier, flux de trésorerie et prévisions',
    icon: 'DollarSign',
    component: RapportFinancier,
  },
]

export default function RapportsTab() {
  const [selectedRapport, setSelectedRapport] = useState(null)

  if (selectedRapport) {
    const RapportComponent = selectedRapport.component
    return (
      <div className="rapports-tab">
        <div className="rapport-header">
          <Button variant="secondary" onClick={() => setSelectedRapport(null)}>
            <Icon name="ArrowLeft" size={16} />
            Retour à la liste
          </Button>
          <h2>{selectedRapport.title}</h2>
        </div>
        <RapportComponent />
      </div>
    )
  }

  return (
    <div className="rapports-tab">
      <div className="rapports-header">
        <h2>Rapports Préconfigurés</h2>
        <p className="subtitle">Sélectionnez un rapport pour le générer et l'exporter</p>
      </div>

      <div className="rapports-grid">
        {RAPPORTS_DISPONIBLES.map((rapport) => (
          <RapportCard
            key={rapport.id}
            title={rapport.title}
            description={rapport.description}
            icon={rapport.icon}
            onClick={() => setSelectedRapport(rapport)}
          />
        ))}
      </div>
    </div>
  )
}

