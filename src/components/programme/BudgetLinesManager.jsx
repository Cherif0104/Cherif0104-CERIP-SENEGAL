import { useState, useEffect } from 'react'
import { programmeBudgetService } from '../../services/programme-budget.service'
import { toastService } from '../../services/toast.service'
import Icon from '../common/Icon'
import ConfirmModal from '../common/ConfirmModal'
import LoadingState from '../common/LoadingState'
import './ProgrammeComponents.css'

const TYPE_LIGNES = [
  { value: 'PERSONNEL', label: 'Personnel', icon: 'Users' },
  { value: 'EQUIPEMENT', label: 'Équipement', icon: 'Package' },
  { value: 'FORMATION', label: 'Formation', icon: 'GraduationCap' },
  { value: 'FRAIS_GENERAUX', label: 'Frais généraux', icon: 'Receipt' },
  { value: 'AUTRES', label: 'Autres', icon: 'MoreVertical' }
]

export default function BudgetLinesManager({ programmeId, mode = 'edit' }) {
  const [loading, setLoading] = useState(true)
  const [budgetLines, setBudgetLines] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [formData, setFormData] = useState({
    code_ligne: '',
    libelle: '',
    type_ligne: 'PERSONNEL',
    budget_alloue: '',
    ordre: 0,
    description: ''
  })

  const isEditMode = mode === 'edit'

  useEffect(() => {
    if (programmeId) {
      loadBudgetLines()
    }
  }, [programmeId])

  const loadBudgetLines = async () => {
    setLoading(true)
    try {
      const { data, error } = await programmeBudgetService.getBudgetLines(programmeId)
      if (error) {
        toastService.error('Erreur lors du chargement des lignes budgétaires')
      } else {
        setBudgetLines(data || [])
      }
    } catch (error) {
      console.error('Error loading budget lines:', error)
      toastService.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingId(null)
    setFormData({
      code_ligne: '',
      libelle: '',
      type_ligne: 'PERSONNEL',
      budget_alloue: '',
      ordre: budgetLines.length + 1,
      description: ''
    })
    setShowForm(true)
  }

  const handleEdit = (line) => {
    setEditingId(line.id)
    setFormData({
      code_ligne: line.code_ligne,
      libelle: line.libelle,
      type_ligne: line.type_ligne,
      budget_alloue: line.budget_alloue.toString(),
      ordre: line.ordre,
      description: line.description || ''
    })
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()

    if (!formData.code_ligne || !formData.libelle || !formData.budget_alloue) {
      toastService.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      const budgetLineData = {
        programme_id: programmeId,
        code_ligne: formData.code_ligne,
        libelle: formData.libelle,
        type_ligne: formData.type_ligne,
        budget_alloue: parseFloat(formData.budget_alloue),
        ordre: parseInt(formData.ordre) || 0,
        description: formData.description || null
      }

      let result
      if (editingId) {
        result = await programmeBudgetService.updateBudgetLine(editingId, budgetLineData)
      } else {
        result = await programmeBudgetService.createBudgetLine(budgetLineData)
      }

      if (result.error) {
        toastService.error(result.error.message || 'Erreur lors de la sauvegarde')
      } else {
        toastService.success(`Ligne budgétaire ${editingId ? 'modifiée' : 'créée'} avec succès`)
        setShowForm(false)
        setEditingId(null)
        loadBudgetLines()
      }
    } catch (error) {
      console.error('Error saving budget line:', error)
      toastService.error('Erreur lors de la sauvegarde')
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return

    try {
      const { error } = await programmeBudgetService.deleteBudgetLine(deletingId)
      if (error) {
        toastService.error('Erreur lors de la suppression')
      } else {
        toastService.success('Ligne budgétaire supprimée avec succès')
        setDeletingId(null)
        loadBudgetLines()
      }
    } catch (error) {
      console.error('Error deleting budget line:', error)
      toastService.error('Erreur lors de la suppression')
    }
  }

  const formatCurrency = (value) => {
    if (!value) return '0'
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(value)
  }

  const calculateDisponible = (line) => {
    const alloue = parseFloat(line.budget_alloue || 0)
    const engage = parseFloat(line.budget_engage || 0)
    const depense = parseFloat(line.budget_depense || 0)
    return alloue - engage - depense
  }

  if (loading) {
    return <LoadingState message="Chargement des lignes budgétaires..." />
  }

  return (
    <div className="budget-lines-manager">
      {isEditMode && (
        <div className="budget-lines-header">
          <h3>Lignes budgétaires</h3>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleAdd}
          >
            <Icon name="Plus" size={16} />
            Ajouter une ligne
          </button>
        </div>
      )}

      {budgetLines.length === 0 && (
        <div className="empty-state">
          <Icon name="DollarSign" size={32} />
          <p>Aucune ligne budgétaire définie</p>
          {isEditMode && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAdd}
            >
              Créer la première ligne
            </button>
          )}
        </div>
      )}

      {budgetLines.length > 0 && (
        <div className="budget-lines-table">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Libellé</th>
                <th>Type</th>
                <th>Alloué</th>
                <th>Engagé</th>
                <th>Dépensé</th>
                <th>Disponible</th>
                {isEditMode && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {budgetLines.map((line) => {
                const disponible = calculateDisponible(line)
                const typeInfo = TYPE_LIGNES.find(t => t.value === line.type_ligne)
                
                return (
                  <tr key={line.id}>
                    <td><strong>{line.code_ligne}</strong></td>
                    <td>{line.libelle}</td>
                    <td>
                      <span className="badge badge--type">
                        <Icon name={typeInfo?.icon || 'FileText'} size={14} />
                        {typeInfo?.label || line.type_ligne}
                      </span>
                    </td>
                    <td className="text-right">{formatCurrency(line.budget_alloue)}</td>
                    <td className="text-right">{formatCurrency(line.budget_engage)}</td>
                    <td className="text-right">{formatCurrency(line.budget_depense)}</td>
                    <td className={`text-right ${disponible < 0 ? 'text-danger' : disponible === 0 ? 'text-warning' : 'text-success'}`}>
                      <strong>{formatCurrency(disponible)}</strong>
                    </td>
                    {isEditMode && (
                      <td>
                        <div className="action-buttons">
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => handleEdit(line)}
                            title="Modifier"
                          >
                            <Icon name="Edit" size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon btn-icon--danger"
                            onClick={() => setDeletingId(line.id)}
                            title="Supprimer"
                          >
                            <Icon name="Trash2" size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Formulaire modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Modifier la ligne budgétaire' : 'Nouvelle ligne budgétaire'}</h3>
              <button
                type="button"
                className="btn-icon"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                }}
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="modal-body">
              <div className="form-group">
                <label htmlFor="code_ligne">Code ligne *</label>
                <input
                  type="text"
                  id="code_ligne"
                  value={formData.code_ligne}
                  onChange={(e) => setFormData({ ...formData, code_ligne: e.target.value.toUpperCase() })}
                  className="input"
                  placeholder="Ex: PER-001"
                  required
                  disabled={!!editingId}
                />
                <small>Code unique pour cette ligne (ne peut pas être modifié)</small>
              </div>

              <div className="form-group">
                <label htmlFor="libelle">Libellé *</label>
                <input
                  type="text"
                  id="libelle"
                  value={formData.libelle}
                  onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                  className="input"
                  placeholder="Ex: Salaires et charges"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="type_ligne">Type de ligne *</label>
                <select
                  id="type_ligne"
                  value={formData.type_ligne}
                  onChange={(e) => setFormData({ ...formData, type_ligne: e.target.value })}
                  className="input"
                  required
                >
                  {TYPE_LIGNES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="budget_alloue">Budget alloué (XOF) *</label>
                <input
                  type="number"
                  id="budget_alloue"
                  value={formData.budget_alloue}
                  onChange={(e) => setFormData({ ...formData, budget_alloue: e.target.value })}
                  className="input"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="ordre">Ordre</label>
                <input
                  type="number"
                  id="ordre"
                  value={formData.ordre}
                  onChange={(e) => setFormData({ ...formData, ordre: parseInt(e.target.value) || 0 })}
                  className="input"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={3}
                  placeholder="Description optionnelle..."
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <Icon name="Save" size={16} />
                  {editingId ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={deletingId !== null}
        title="Supprimer la ligne budgétaire"
        description="Êtes-vous sûr de vouloir supprimer cette ligne budgétaire ? Cette action est irréversible. Les engagements et dépenses associés seront également supprimés."
        variant="danger"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  )
}

