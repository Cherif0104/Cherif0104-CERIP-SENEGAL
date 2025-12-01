import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { mentorsService } from '@/services/mentors.service'
import { DataTable } from '@/components/common/DataTable'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { Icon } from '@/components/common/Icon'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import { toast } from '@/components/common/Toast'
import { logger } from '@/utils/logger'
import './MentorsListe.css'

export default function MentorsListe() {
  const navigate = useNavigate()
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpecialite, setFilterSpecialite] = useState('')
  const [viewMode, setViewMode] = useState('table')

  useEffect(() => {
    loadMentors()
  }, [])

  const loadMentors = async () => {
    setLoading(true)
    try {
      const { data, error } = await mentorsService.getAll()
      if (error) {
        logger.error('MENTORS_LISTE', 'Erreur chargement mentors', error)
        toast.error('Erreur lors du chargement des mentors')
        return
      }
      setMentors(data || [])
      logger.debug('MENTORS_LISTE', `${data?.length || 0} mentors chargés`)
    } catch (error) {
      logger.error('MENTORS_LISTE', 'Erreur inattendue', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  // Filtrer et rechercher
  const filteredMentors = useMemo(() => {
    return mentors.filter(mentor => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const user = mentor.users
        const nomComplet = user ? `${user.prenom || ''} ${user.nom || ''}`.trim() : ''
        const email = user?.email || ''
        const matchesSearch = 
          nomComplet.toLowerCase().includes(searchLower) ||
          email.toLowerCase().includes(searchLower) ||
          mentor.specialite?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      if (filterSpecialite && mentor.specialite !== filterSpecialite) return false

      return true
    })
  }, [mentors, searchTerm, filterSpecialite])

  // Extraire les valeurs uniques pour les filtres
  const specialites = useMemo(() => [...new Set(mentors.map(m => m.specialite).filter(Boolean))], [mentors])

  // Calculer les statistiques
  const stats = useMemo(() => {
    const actifs = mentors.filter(m => {
      const user = m.users
      return user && user.actif !== false
    }).length
    const disponibles = mentors.filter(m => {
      const charge = m.charge_actuelle || 0
      const chargeMax = m.charge_max || 0
      return charge < chargeMax
    }).length
    const totalCharge = mentors.reduce((sum, m) => sum + (m.charge_actuelle || 0), 0)
    const totalChargeMax = mentors.reduce((sum, m) => sum + (m.charge_max || 0), 0)

    return {
      total: mentors.length,
      actifs,
      disponibles,
      totalCharge,
      totalChargeMax
    }
  }, [mentors])

  const getNomComplet = (mentor) => {
    const user = mentor.users
    if (user) {
      const nomComplet = `${user.prenom || ''} ${user.nom || ''}`.trim()
      return nomComplet || user.email || '-'
    }
    return '-'
  }

  const columns = [
    {
      key: 'nom',
      label: 'Nom',
      render: (_, row) => {
        const nomComplet = getNomComplet(row)
        return (
          <div 
            className="mentor-name-cell"
            onClick={() => navigate(`/intervenants/mentor/${row.id}`)}
          >
            <span className="mentor-name">{nomComplet}</span>
          </div>
        )
      },
    },
    {
      key: 'specialite',
      label: 'Spécialité',
      render: (value) => value || '-',
    },
    {
      key: 'secteurs',
      label: 'Secteurs',
      render: (value) => {
        if (Array.isArray(value)) {
          return value.length > 0 ? value.join(', ') : '-'
        }
        return value || '-'
      },
    },
    {
      key: 'regions',
      label: 'Régions',
      render: (value) => {
        if (Array.isArray(value)) {
          return value.length > 0 ? value.join(', ') : '-'
        }
        return value || '-'
      },
    },
    {
      key: 'charge',
      label: 'Charge',
      render: (_, row) => {
        const actuelle = row.charge_actuelle || 0
        const max = row.charge_max || 0
        if (max === 0) return '-'
        const pourcentage = Math.round((actuelle / max) * 100)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span>{actuelle}h / {max}h</span>
            <div style={{ 
              width: '60px', 
              height: '4px', 
              background: '#e5e7eb', 
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.min(pourcentage, 100)}%`,
                height: '100%',
                background: pourcentage > 80 ? '#ef4444' : pourcentage > 60 ? '#f59e0b' : '#10b981',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        )
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate(`/intervenants/mentor/${row.id}`)}
            className="action-button"
            title="Voir détails"
          >
            <Icon name="Eye" size={16} />
          </button>
        </div>
      ),
    },
  ]

  if (loading) return <LoadingState />

  return (
    <div className="mentors-liste">
      {/* KPIs Statistiques */}
      <div className="mentors-stats">
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-primary">
            <Icon name="Users" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Mentors</div>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-success">
            <Icon name="CheckCircle" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.actifs}</div>
            <div className="stat-label">Actifs</div>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-default">
            <Icon name="UserCheck" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.disponibles}</div>
            <div className="stat-label">Disponibles</div>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon stat-icon-warning">
            <Icon name="Clock" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalCharge}h</div>
            <div className="stat-label">Charge totale / {stats.totalChargeMax}h</div>
          </div>
        </div>
      </div>

      {/* Filtres Modernes */}
      <div className="liste-filters-modern">
        <div className="filters-header">
          <h3>Filtres</h3>
          <div className="view-mode-toggle">
            <button
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <Icon name="Table" size={16} />
              Table
            </button>
            <button
              className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
            >
              <Icon name="Grid" size={16} />
              Cartes
            </button>
          </div>
        </div>
        <div className="filters-content">
          <Input
            label="Recherche"
            type="text"
            placeholder="Nom, email, spécialité..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {specialites.length > 0 && (
            <Select
              label="Spécialité"
              value={filterSpecialite}
              onChange={(e) => setFilterSpecialite(e.target.value)}
              options={[
                { value: '', label: 'Toutes les spécialités' },
                ...specialites.map(s => ({ value: s, label: s }))
              ]}
            />
          )}
          {(searchTerm || filterSpecialite) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setFilterSpecialite('')
              }}
            >
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {/* Barre d'information */}
      <div className="liste-info-modern">
        <div className="info-content">
          <span>
            <strong>{filteredMentors.length}</strong> mentor(s) trouvé(s)
            {filteredMentors.length !== mentors.length && ` sur ${mentors.length}`}
          </span>
        </div>
      </div>

      {/* Contenu */}
      {filteredMentors.length === 0 ? (
        <EmptyState
          icon="UserCog"
          title="Aucun mentor"
          message={
            mentors.length === 0
              ? "Commencez par créer un nouveau mentor"
              : "Aucun mentor ne correspond aux filtres"
          }
          action={
            mentors.length === 0 && (
              <PermissionGuard permission="intervenants.create">
                <Button onClick={() => navigate('/intervenants/mentor/new')} variant="primary">
                  <Icon name="Plus" size={16} />
                  Nouveau mentor
                </Button>
              </PermissionGuard>
            )
          }
        />
      ) : viewMode === 'cards' ? (
        <div className="mentors-cards-grid">
          {filteredMentors.map(mentor => {
            const nomComplet = getNomComplet(mentor)
            const chargeActuelle = mentor.charge_actuelle || 0
            const chargeMax = mentor.charge_max || 0
            const pourcentage = chargeMax > 0 ? Math.round((chargeActuelle / chargeMax) * 100) : 0
            return (
              <div key={mentor.id} className="mentor-card">
                <div className="mentor-card-header">
                  <h3 className="mentor-card-title">{nomComplet}</h3>
                  {mentor.users?.email && (
                    <span className="mentor-card-email">{mentor.users.email}</span>
                  )}
                </div>
                <div className="mentor-card-body">
                  {mentor.specialite && (
                    <div className="mentor-card-item">
                      <Icon name="Briefcase" size={16} />
                      <span>{mentor.specialite}</span>
                    </div>
                  )}
                  {mentor.secteurs && Array.isArray(mentor.secteurs) && mentor.secteurs.length > 0 && (
                    <div className="mentor-card-item">
                      <Icon name="Tag" size={16} />
                      <span>{mentor.secteurs.join(', ')}</span>
                    </div>
                  )}
                  {mentor.regions && Array.isArray(mentor.regions) && mentor.regions.length > 0 && (
                    <div className="mentor-card-item">
                      <Icon name="MapPin" size={16} />
                      <span>{mentor.regions.join(', ')}</span>
                    </div>
                  )}
                  {chargeMax > 0 && (
                    <div className="mentor-card-item">
                      <Icon name="Clock" size={16} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span>{chargeActuelle}h / {chargeMax}h</span>
                          <span style={{ 
                            color: pourcentage > 80 ? '#ef4444' : pourcentage > 60 ? '#f59e0b' : '#10b981',
                            fontWeight: 600
                          }}>
                            {pourcentage}%
                          </span>
                        </div>
                        <div style={{ 
                          width: '100%', 
                          height: '6px', 
                          background: '#e5e7eb', 
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${Math.min(pourcentage, 100)}%`,
                            height: '100%',
                            background: pourcentage > 80 ? '#ef4444' : pourcentage > 60 ? '#f59e0b' : '#10b981',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mentor-card-actions">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/intervenants/mentor/${mentor.id}`)}
                  >
                    <Icon name="Eye" size={14} />
                    Voir détails
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="data-table-wrapper">
          <DataTable columns={columns} data={filteredMentors} />
        </div>
      )}
    </div>
  )
}
