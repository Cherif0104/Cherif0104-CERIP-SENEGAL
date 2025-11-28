import { useEffect, useState, useMemo } from 'react'
import { referentielsService } from '../../services/referentiels.service'
import { toastService } from '../../services/toast.service'
import { REFERENTIEL_CATEGORIES, getAllReferentielTypes, getReferentielMetadata } from '../../data/referentiels-categories'
import BackButton from '../../components/common/BackButton'
import Icon from '../../components/common/Icon'
import ReferentielCard from '../../components/admin/ReferentielCard'
import FormBuilder from '../../components/admin/FormBuilder'
import LoadingState from '../../components/common/LoadingState'
import EmptyState from '../../components/common/EmptyState'
import './Referentiels.css'

const isFormulaireType = (type) => {
  return type?.startsWith('FORMULAIRE_') || 
         type?.startsWith('FICHE_DIAGNOSTIC_') || 
         type?.startsWith('QUESTIONNAIRE_') || 
         type?.startsWith('QUIZ_') || 
         type?.startsWith('RECUEIL_BESOINS_') ||
         type === 'CRITERE_ELIGIBILITE' || 
         type === 'WORKFLOW_CANDIDATURE' || 
         type === 'CHAMP_FORMULAIRE'
}

export default function Referentiels() {
  const [viewMode, setViewMode] = useState('overview') // 'overview' | 'type' | 'table'
  const [selectedType, setSelectedType] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // 'all' | 'active' | 'inactive'
  const [sortBy, setSortBy] = useState('label') // 'label' | 'code' | 'actif' | 'created_at'
  const [sortOrder, setSortOrder] = useState('asc') // 'asc' | 'desc'
  
  // États pour l'édition
  const [editingId, setEditingId] = useState(null)
  const [editingLabel, setEditingLabel] = useState('')
  const [showFormBuilder, setShowFormBuilder] = useState(false)
  const [formBuilderConfig, setFormBuilderConfig] = useState(null)

  // Charger les éléments d'un type spécifique
  const load = async (type) => {
    setLoading(true)
    try {
      const { data, error } = await referentielsService.getAllByType(type)
      if (!error) {
        setItems(data || [])
      } else {
        toastService.error('Erreur lors du chargement')
        setItems([])
      }
    } catch (error) {
      console.error('Error loading referentiels:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  // Filtrer et trier les éléments
  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...items]

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        item.label?.toLowerCase().includes(query) ||
        item.code?.toLowerCase().includes(query)
      )
    }

    // Filtre par statut
    if (filterStatus === 'active') {
      filtered = filtered.filter(item => item.actif)
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(item => !item.actif)
    }

    // Tri
    filtered.sort((a, b) => {
      let aVal, bVal
      switch (sortBy) {
        case 'code':
          aVal = a.code || ''
          bVal = b.code || ''
          break
        case 'actif':
          aVal = a.actif ? 1 : 0
          bVal = b.actif ? 1 : 0
          break
        case 'created_at':
          aVal = new Date(a.created_at || 0)
          bVal = new Date(b.created_at || 0)
          break
        default:
          aVal = a.label || ''
          bVal = b.label || ''
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    })

    return filtered
  }, [items, searchQuery, filterStatus, sortBy, sortOrder])

  // Gestion de la sélection d'un type
  const handleSelectType = (type) => {
    setSelectedType(type)
    setViewMode('type')
    load(type)
  }

  const handleBackToOverview = () => {
    setSelectedType(null)
    setSelectedCategory(null)
    setViewMode('overview')
    setItems([])
    setSearchQuery('')
  }

  const handleSelectCategory = (categoryKey) => {
    setSelectedCategory(categoryKey)
    setSearchQuery('')
  }

  // Édition
  const startEdit = (item) => {
    setEditingId(item.id)
    setEditingLabel(item.label)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingLabel('')
  }

  const saveEdit = async (id) => {
    const label = editingLabel.trim()
    if (!label) return

    const { error } = await referentielsService.update(id, {
      label,
      code: label.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')
    })

    if (!error) {
      await load(selectedType)
      cancelEdit()
      toastService.success('Modification enregistrée')
    } else {
      toastService.error('Erreur lors de la modification')
    }
  }

  const deleteItem = async (id) => {
    if (!window.confirm('Supprimer cette valeur ? Cette action est irréversible.')) return
    const { error } = await referentielsService.delete(id)
    if (!error) {
      setItems(prev => prev.filter(i => i.id !== id))
      toastService.success('Élément supprimé')
    } else {
      toastService.error('Erreur lors de la suppression')
    }
  }

  const toggleActive = async (item) => {
    const { error } = await referentielsService.update(item.id, {
      actif: !item.actif
    })
    if (!error) {
      setItems(prev =>
        prev.map(i => (i.id === item.id ? { ...i, actif: !i.actif } : i))
      )
      toastService.success(item.actif ? 'Élément masqué' : 'Élément activé')
    } else {
      toastService.error('Erreur lors de la modification')
    }
  }

  const handleConfigureForm = async (type) => {
    // Charger le premier référentiel de ce type pour configuration
    const { data } = await referentielsService.getAllByType(type)
    if (data && data.length > 0) {
      setFormBuilderConfig(data[0])
      setShowFormBuilder(true)
    } else {
      // Créer un nouveau référentiel pour ce type
      const { data: newData, error } = await referentielsService.create({
        type,
        code: type,
        label: `Configuration ${type}`,
        actif: true,
        ordre: 0
      })
      if (!error && newData) {
        setFormBuilderConfig(newData)
        setShowFormBuilder(true)
      }
    }
  }

  const handleFormBuilderSave = async (config) => {
    if (!formBuilderConfig) return

    const { error } = await referentielsService.update(formBuilderConfig.id, {
      meta: config
    })

    if (!error) {
      await load(selectedType)
      setShowFormBuilder(false)
      setFormBuilderConfig(null)
      toastService.success('Formulaire enregistré avec succès')
    } else {
      toastService.error('Erreur lors de la sauvegarde')
    }
  }

  // Vue d'ensemble par catégories
  if (viewMode === 'overview') {
    const filteredCategories = selectedCategory
      ? { [selectedCategory]: REFERENTIEL_CATEGORIES[selectedCategory] }
      : REFERENTIEL_CATEGORIES

    return (
      <div className="referentiels-page">
        <div className="referentiels-header">
          <BackButton to="/dashboard" label="Retour au tableau de bord" />
          <h1>Gestion des référentiels</h1>
        </div>

        <div className="referentiels-overview">
          <div className="referentiels-overview-intro">
            <p className="referentiels-overview-description">
              Gérez tous les référentiels de votre ERP. Organisez-les par catégories pour une navigation intuitive.
            </p>
          </div>

          {/* Filtres de catégorie */}
          <div className="referentiels-category-filters">
            <button
              type="button"
              className={`referentiel-category-filter ${!selectedCategory ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              <Icon name="LayoutGrid" size={18} />
              Toutes les catégories
            </button>
            {Object.entries(REFERENTIEL_CATEGORIES).map(([key, category]) => (
              <button
                key={key}
                type="button"
                className={`referentiel-category-filter ${selectedCategory === key ? 'active' : ''}`}
                onClick={() => handleSelectCategory(key)}
                style={{ '--category-color': category.color }}
              >
                <Icon name={category.icon} size={18} />
                {category.label}
              </button>
            ))}
          </div>

          {/* Cards par catégorie */}
          {Object.entries(filteredCategories).map(([categoryKey, category]) => (
            <div key={categoryKey} className="referentiels-category-section">
              <div className="referentiels-category-header">
                <div className="referentiels-category-header-left">
                  <div 
                    className="referentiels-category-icon"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <Icon name={category.icon} size={24} color={category.color} />
                  </div>
                  <div>
                    <h2 className="referentiels-category-title">{category.label}</h2>
                    <p className="referentiels-category-description">{category.description}</p>
                  </div>
                </div>
              </div>

              <div className="referentiels-cards-grid">
                {category.types.map(typeInfo => (
                  <ReferentielCard
                    key={typeInfo.value}
                    type={typeInfo.value}
                    onSelect={handleSelectType}
                    onConfigure={handleConfigureForm}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Vue détaillée d'un type spécifique
  const metadata = selectedType ? getReferentielMetadata(selectedType) : null

  return (
    <div className="referentiels-page">
      <div className="referentiels-header">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleBackToOverview}
        >
          <Icon name="ArrowLeft" size={16} />
          Retour à l'overview
        </button>
        <div className="referentiels-header-content">
          <div>
            <h1>{metadata?.label || selectedType}</h1>
            <p className="referentiels-header-subtitle">{metadata?.description || 'Gestion des éléments'}</p>
          </div>
          <div className="referentiels-view-toggle">
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'type' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('type')}
            >
              <Icon name="List" size={16} />
              Liste
            </button>
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('table')}
            >
              <Icon name="Table" size={16} />
              Tableau
            </button>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="referentiels-toolbar">
        <div className="referentiels-search">
          <Icon name="Search" size={18} />
          <input
            type="text"
            className="input"
            placeholder="Rechercher par nom ou code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="referentiels-filters-group">
          <select
            className="input"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs uniquement</option>
            <option value="inactive">Masqués uniquement</option>
          </select>
          <select
            className="input"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              setSortBy(field)
              setSortOrder(order)
            }}
          >
            <option value="label-asc">Trier par nom (A-Z)</option>
            <option value="label-desc">Trier par nom (Z-A)</option>
            <option value="code-asc">Trier par code (A-Z)</option>
            <option value="code-desc">Trier par code (Z-A)</option>
            <option value="actif-desc">Actifs en premier</option>
            <option value="actif-asc">Masqués en premier</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Chargement des éléments..." />
      ) : filteredAndSortedItems.length === 0 ? (
        <EmptyState
          icon="FileText"
          title={searchQuery ? "Aucun résultat" : "Aucun élément"}
          description={searchQuery ? "Essayez avec d'autres mots-clés" : "Commencez par créer un élément"}
        />
      ) : viewMode === 'table' ? (
        // Vue tableau
        <div className="referentiels-table-container">
          <table className="referentiels-table">
            <thead>
              <tr>
                <th>Label</th>
                <th>Code</th>
                <th>Statut</th>
                {isFormulaireType(selectedType) && <th>Config</th>}
                <th style={{ width: 180 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    {editingId === item.id ? (
                      <input
                        className="input input-sm"
                        value={editingLabel}
                        onChange={(e) => setEditingLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(item.id)
                          if (e.key === 'Escape') cancelEdit()
                        }}
                        autoFocus
                      />
                    ) : (
                      item.label
                    )}
                  </td>
                  <td>
                    <code className="referentiel-code">{item.code}</code>
                  </td>
                  <td>
                    <span className={`referentiel-status-badge ${item.actif ? 'active' : 'inactive'}`}>
                      {item.actif ? (
                        <>
                          <Icon name="CheckCircle" size={12} />
                          Actif
                        </>
                      ) : (
                        <>
                          <Icon name="EyeOff" size={12} />
                          Masqué
                        </>
                      )}
                    </span>
                  </td>
                  {isFormulaireType(selectedType) && (
                    <td>
                      {item.meta && Object.keys(item.meta).length > 0 ? (
                        <span className="referentiel-config-badge">
                          <Icon name="CheckCircle" size={12} />
                          Configuré
                        </span>
                      ) : (
                        <span className="referentiel-config-badge empty">Non configuré</span>
                      )}
                    </td>
                  )}
                  <td className="referentiels-actions">
                    {editingId === item.id ? (
                      <>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => saveEdit(item.id)}
                          title="Enregistrer"
                        >
                          <Icon name="Check" size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={cancelEdit}
                          title="Annuler"
                        >
                          <Icon name="X" size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => startEdit(item)}
                          title="Modifier"
                        >
                          <Icon name="Edit" size={16} />
                        </button>
                        {isFormulaireType(selectedType) && (
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => {
                              setFormBuilderConfig(item)
                              setShowFormBuilder(true)
                            }}
                            title="Configurer"
                          >
                            <Icon name="Settings" size={16} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => toggleActive(item)}
                          title={item.actif ? 'Masquer' : 'Afficher'}
                        >
                          <Icon name={item.actif ? 'EyeOff' : 'Eye'} size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon btn-icon--danger"
                          onClick={() => deleteItem(item.id)}
                          title="Supprimer"
                        >
                          <Icon name="Trash2" size={16} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Vue liste (cards)
        <div className="referentiels-items-grid">
          {filteredAndSortedItems.map((item) => (
            <div key={item.id} className="referentiel-item-card">
              <div className="referentiel-item-card-header">
                <div>
                  <h3>{item.label}</h3>
                  <code className="referentiel-code">{item.code}</code>
                </div>
                <span className={`referentiel-status-badge ${item.actif ? 'active' : 'inactive'}`}>
                  {item.actif ? (
                    <>
                      <Icon name="CheckCircle" size={12} />
                      Actif
                    </>
                  ) : (
                    <>
                      <Icon name="EyeOff" size={12} />
                      Masqué
                    </>
                  )}
                </span>
              </div>
              {isFormulaireType(selectedType) && item.meta && (
                <div className="referentiel-item-card-meta">
                  <Icon name="FileText" size={14} />
                  <span>Formulaire configuré ({item.meta.champs?.length || 0} champ{item.meta.champs?.length !== 1 ? 's' : ''})</span>
                </div>
              )}
              <div className="referentiel-item-card-actions">
                {editingId === item.id ? (
                  <>
                    <input
                      className="input input-sm"
                      value={editingLabel}
                      onChange={(e) => setEditingLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(item.id)
                        if (e.key === 'Escape') cancelEdit()
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={() => saveEdit(item.id)}
                    >
                      <Icon name="Check" size={14} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={cancelEdit}
                    >
                      <Icon name="X" size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => startEdit(item)}
                    >
                      <Icon name="Edit" size={14} />
                      Modifier
                    </button>
                    {isFormulaireType(selectedType) && (
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => {
                          setFormBuilderConfig(item)
                          setShowFormBuilder(true)
                        }}
                      >
                        <Icon name="Settings" size={14} />
                        Configurer
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => toggleActive(item)}
                    >
                      <Icon name={item.actif ? 'EyeOff' : 'Eye'} size={14} />
                      {item.actif ? 'Masquer' : 'Afficher'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteItem(item.id)}
                    >
                      <Icon name="Trash2" size={14} />
                      Supprimer
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal constructeur de formulaires */}
      {showFormBuilder && formBuilderConfig && (
        <div className="referentiels-meta-modal">
          <div className="referentiels-meta-modal-content form-builder-modal">
            <FormBuilder
              initialConfig={formBuilderConfig}
              onSave={handleFormBuilderSave}
              onCancel={() => {
                setShowFormBuilder(false)
                setFormBuilderConfig(null)
              }}
              referentielType={selectedType}
            />
          </div>
        </div>
      )}
    </div>
  )
}
