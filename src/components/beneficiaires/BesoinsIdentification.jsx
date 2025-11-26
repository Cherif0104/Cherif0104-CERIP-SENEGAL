import { useState, useEffect } from 'react'
import { beneficiairesService } from '../../services/beneficiaires.service'
import { toastService } from '../../services/toast.service'
import Icon from '../common/Icon'
import EmptyState from '../common/EmptyState'
import './BesoinsIdentification.css'

// Catégories de besoins modulables
const CATEGORIES_BESOINS = [
  { id: 'marketing', label: 'Marketing & Communication', icon: 'Megaphone' },
  { id: 'financier', label: 'Finance & Comptabilité', icon: 'DollarSign' },
  { id: 'management', label: 'Management', icon: 'Users' },
  { id: 'organisationnel', label: 'Organisationnel', icon: 'Building2' },
  { id: 'technique', label: 'Technique', icon: 'Wrench' },
  { id: 'juridique', label: 'Juridique', icon: 'Scale' }
]

export default function BesoinsIdentification({ beneficiaireId }) {
  const [besoins, setBesoins] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadBesoins()
  }, [beneficiaireId])

  const loadBesoins = async () => {
    setLoading(true)
    try {
      const { data } = await beneficiairesService.getBesoins(beneficiaireId)
      setBesoins(data || {})
    } catch (error) {
      console.error('Error loading besoins:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await beneficiairesService.updateBesoins(beneficiaireId, besoins)
      toastService.success('Besoins enregistrés avec succès')
    } catch (error) {
      console.error('Error saving besoins:', error)
      toastService.error('Erreur lors de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  const handleBesoinChange = (categorie, besoin, checked) => {
    setBesoins(prev => {
      const newBesoins = { ...prev }
      if (!newBesoins[categorie]) {
        newBesoins[categorie] = []
      }
      if (checked) {
        if (!newBesoins[categorie].includes(besoin)) {
          newBesoins[categorie] = [...newBesoins[categorie], besoin]
        }
      } else {
        newBesoins[categorie] = newBesoins[categorie].filter(b => b !== besoin)
      }
      return newBesoins
    })
  }

  const BESOINS_PAR_CATEGORIE = {
    marketing: ['Logo', 'Identité visuelle', 'Stratégie marketing', 'Communication digitale', 'Publicité'],
    financier: ['Gestion financière', 'Comptabilité', 'Budget', 'Financement', 'Fiscalité'],
    management: ['Leadership', 'Gestion d\'équipe', 'Planification', 'Décision', 'Ressources humaines'],
    organisationnel: ['Structure organisationnelle', 'Processus', 'Procédures', 'Organisation du travail'],
    technique: ['Infrastructure IT', 'Outils numériques', 'Systèmes', 'Technologie'],
    juridique: ['Statut juridique', 'Contrats', 'Conformité', 'Réglementation']
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="besoins-identification">
      <div className="besoins-header">
        <h3>Identification des besoins</h3>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          <Icon name="Save" size={18} />
          Enregistrer
        </button>
      </div>

      <div className="besoins-categories">
        {CATEGORIES_BESOINS.map((categorie) => (
          <div key={categorie.id} className="besoins-categorie">
            <div className="categorie-header">
              <Icon name={categorie.icon} size={20} />
              <h4>{categorie.label}</h4>
            </div>
            <div className="besoins-list">
              {BESOINS_PAR_CATEGORIE[categorie.id]?.map((besoin) => (
                <label key={besoin} className="besoin-checkbox">
                  <input
                    type="checkbox"
                    checked={besoins[categorie.id]?.includes(besoin) || false}
                    onChange={(e) => handleBesoinChange(categorie.id, besoin, e.target.checked)}
                  />
                  <span>{besoin}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(besoins).length === 0 && (
        <EmptyState
          icon="Target"
          title="Aucun besoin identifié"
          message="Cochez les besoins identifiés pour ce bénéficiaire"
        />
      )}
    </div>
  )
}

