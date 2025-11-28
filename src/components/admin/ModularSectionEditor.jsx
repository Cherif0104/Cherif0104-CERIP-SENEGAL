import { useState, useEffect } from 'react'
import Icon from '../common/Icon'
import './ModularSections.css'

const FIELD_TYPES = [
  { value: 'text', label: 'Texte', icon: 'FileText' },
  { value: 'textarea', label: 'Texte long', icon: 'ScrollText' },
  { value: 'number', label: 'Nombre', icon: 'Hash' },
  { value: 'date', label: 'Date', icon: 'Calendar' },
  { value: 'email', label: 'Email', icon: 'Mail' },
  { value: 'tel', label: 'Téléphone', icon: 'Phone' },
  { value: 'select', label: 'Liste déroulante', icon: 'ChevronDown' },
  { value: 'multiselect', label: 'Liste multiple', icon: 'List' },
  { value: 'checkbox', label: 'Cases à cocher', icon: 'CheckSquare' }
]

const COMMON_ICONS = [
  'FileText', 'Folder', 'Briefcase', 'Users', 'DollarSign', 'Calendar',
  'MapPin', 'Phone', 'Mail', 'Handshake', 'Building', 'Target',
  'CheckCircle', 'AlertCircle', 'Info', 'Settings', 'Link', 'FileCheck'
]

export default function ModularSectionEditor({
  section = null,
  onSave,
  onCancel
}) {
  const isEdit = !!section
  
  const [sectionData, setSectionData] = useState({
    id: section?.id || `section_${Date.now()}`,
    label: section?.label || '',
    icon: section?.icon || 'FileText',
    ordre: section?.ordre || 0,
    collapsible: section?.collapsible !== undefined ? section.collapsible : true,
    champs: section?.champs || []
  })

  const [editingFieldIndex, setEditingFieldIndex] = useState(null)
  const [newField, setNewField] = useState({
    name: '',
    label: '',
    type: 'text',
    required: false,
    ordre: sectionData.champs.length + 1,
    placeholder: '',
    help: '',
    validation: {}
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (section) {
      setSectionData({
        id: section.id,
        label: section.label || '',
        icon: section.icon || 'FileText',
        ordre: section.ordre || 0,
        collapsible: section.collapsible !== undefined ? section.collapsible : true,
        champs: section.champs || []
      })
    }
  }, [section])

  const validate = () => {
    const newErrors = {}
    
    if (!sectionData.label || sectionData.label.trim().length < 2) {
      newErrors.label = 'Le label doit contenir au moins 2 caractères'
    }

    // Vérifier que les noms de champs sont uniques
    const fieldNames = sectionData.champs.map(f => f.name).filter(Boolean)
    const duplicates = fieldNames.filter((name, index) => fieldNames.indexOf(name) !== index)
    if (duplicates.length > 0) {
      newErrors.champs = 'Les noms de champs doivent être uniques'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) {
      return
    }

    const sectionToSave = {
      ...sectionData,
      champs: sectionData.champs
        .map((f, idx) => ({ ...f, ordre: f.ordre || idx + 1 }))
        .sort((a, b) => (a.ordre || 0) - (b.ordre || 0))
    }

    onSave(sectionToSave)
  }

  const handleAddField = () => {
    if (!newField.name || !newField.label) {
      setErrors({ field: 'Le nom et le label sont requis' })
      return
    }

    // Vérifier que le nom n'existe pas déjà
    if (sectionData.champs.some(f => f.name === newField.name)) {
      setErrors({ field: 'Ce nom de champ existe déjà' })
      return
    }

    const fieldToAdd = {
      ...newField,
      ordre: sectionData.champs.length + 1
    }

    setSectionData(prev => ({
      ...prev,
      champs: [...prev.champs, fieldToAdd]
    }))

    setNewField({
      name: '',
      label: '',
      type: 'text',
      required: false,
      ordre: sectionData.champs.length + 2,
      placeholder: '',
      help: '',
      validation: {}
    })
    setErrors({})
  }

  const handleEditField = (index) => {
    const field = sectionData.champs[index]
    setNewField({ ...field })
    setEditingFieldIndex(index)
  }

  const handleUpdateField = () => {
    if (!newField.name || !newField.label) {
      setErrors({ field: 'Le nom et le label sont requis' })
      return
    }

    // Vérifier que le nom n'existe pas déjà (sauf pour le champ en cours d'édition)
    const nameExists = sectionData.champs.some((f, idx) => 
      f.name === newField.name && idx !== editingFieldIndex
    )
    if (nameExists) {
      setErrors({ field: 'Ce nom de champ existe déjà' })
      return
    }

    const updatedChamps = [...sectionData.champs]
    updatedChamps[editingFieldIndex] = { ...newField }

    setSectionData(prev => ({
      ...prev,
      champs: updatedChamps
    }))

    setNewField({
      name: '',
      label: '',
      type: 'text',
      required: false,
      ordre: sectionData.champs.length + 1,
      placeholder: '',
      help: '',
      validation: {}
    })
    setEditingFieldIndex(null)
    setErrors({})
  }

  const handleRemoveField = (index) => {
    const updatedChamps = sectionData.champs.filter((_, idx) => idx !== index)
      .map((f, idx) => ({ ...f, ordre: idx + 1 }))
    setSectionData(prev => ({
      ...prev,
      champs: updatedChamps
    }))
  }

  const handleMoveField = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sectionData.champs.length - 1)
    ) {
      return
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1
    const updatedChamps = [...sectionData.champs]
    const [moved] = updatedChamps.splice(index, 1)
    updatedChamps.splice(newIndex, 0, moved)

    const reorderedChamps = updatedChamps.map((f, idx) => ({
      ...f,
      ordre: idx + 1
    }))

    setSectionData(prev => ({
      ...prev,
      champs: reorderedChamps
    }))
  }

  const handleCancelField = () => {
    setNewField({
      name: '',
      label: '',
      type: 'text',
      required: false,
      ordre: sectionData.champs.length + 1,
      placeholder: '',
      help: '',
      validation: {}
    })
    setEditingFieldIndex(null)
    setErrors({})
  }

  return (
    <div className="modular-section-editor">
      <div className="modular-section-editor__header">
        <h3>{isEdit ? 'Modifier la section' : 'Nouvelle section'}</h3>
      </div>

      <div className="modular-section-editor__body">
        {/* Informations de base de la section */}
        <div className="form-group">
          <label htmlFor="section-label">
            Label de la section *
          </label>
          <input
            type="text"
            id="section-label"
            value={sectionData.label}
            onChange={(e) => setSectionData(prev => ({ ...prev, label: e.target.value }))}
            className={`input ${errors.label ? 'input-error' : ''}`}
            placeholder="Ex: Informations partenaires"
          />
          {errors.label && <span className="error-message">{errors.label}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="section-icon">Icône</label>
          <select
            id="section-icon"
            value={sectionData.icon}
            onChange={(e) => setSectionData(prev => ({ ...prev, icon: e.target.value }))}
            className="input"
          >
            {COMMON_ICONS.map(icon => (
              <option key={icon} value={icon}>{icon}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="section-ordre">Ordre</label>
          <input
            type="number"
            id="section-ordre"
            value={sectionData.ordre}
            onChange={(e) => setSectionData(prev => ({ ...prev, ordre: parseInt(e.target.value) || 0 }))}
            className="input"
            min="0"
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={sectionData.collapsible}
              onChange={(e) => setSectionData(prev => ({ ...prev, collapsible: e.target.checked }))}
            />
            Section repliable (accordéon)
          </label>
        </div>

        {/* Liste des champs */}
        <div className="modular-section-editor__fields">
          <h4>Champs de la section</h4>
          
          {sectionData.champs.length > 0 && (
            <div className="fields-list">
              {sectionData.champs.map((field, index) => (
                <div key={index} className="field-item">
                  <div className="field-item__header">
                    <Icon name={FIELD_TYPES.find(t => t.value === field.type)?.icon || 'FileText'} size={16} />
                    <span className="field-item__label">{field.label}</span>
                    <span className="field-item__type">({field.type})</span>
                    {field.required && <span className="field-item__required">*</span>}
                  </div>
                  <div className="field-item__actions">
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => handleMoveField(index, 'up')}
                      disabled={index === 0}
                      title="Déplacer vers le haut"
                    >
                      <Icon name="ChevronUp" size={16} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => handleMoveField(index, 'down')}
                      disabled={index === sectionData.champs.length - 1}
                      title="Déplacer vers le bas"
                    >
                      <Icon name="ChevronDown" size={16} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => handleEditField(index)}
                      title="Modifier"
                    >
                      <Icon name="Edit" size={16} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon btn-icon--danger"
                      onClick={() => handleRemoveField(index)}
                      title="Supprimer"
                    >
                      <Icon name="Trash2" size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Formulaire d'ajout/édition de champ */}
          <div className="field-editor">
            <h5>{editingFieldIndex !== null ? 'Modifier le champ' : 'Ajouter un champ'}</h5>
            
            {errors.field && <span className="error-message">{errors.field}</span>}

            <div className="form-grid">
              <div className="form-group">
                <label>Nom du champ *</label>
                <input
                  type="text"
                  value={newField.name}
                  onChange={(e) => setNewField(prev => ({ ...prev, name: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                  className="input"
                  placeholder="nom_du_champ"
                  disabled={editingFieldIndex !== null}
                />
                <small>Utilisé comme identifiant (snake_case)</small>
              </div>

              <div className="form-group">
                <label>Label *</label>
                <input
                  type="text"
                  value={newField.label}
                  onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
                  className="input"
                  placeholder="Label affiché"
                />
              </div>

              <div className="form-group">
                <label>Type *</label>
                <select
                  value={newField.type}
                  onChange={(e) => setNewField(prev => ({ ...prev, type: e.target.value }))}
                  className="input"
                >
                  {FIELD_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newField.required}
                    onChange={(e) => setNewField(prev => ({ ...prev, required: e.target.checked }))}
                  />
                  Champ requis
                </label>
              </div>

              {(newField.type === 'text' || newField.type === 'textarea' || newField.type === 'email' || newField.type === 'tel') && (
                <div className="form-group form-group--full">
                  <label>Placeholder</label>
                  <input
                    type="text"
                    value={newField.placeholder}
                    onChange={(e) => setNewField(prev => ({ ...prev, placeholder: e.target.value }))}
                    className="input"
                    placeholder="Texte d'aide"
                  />
                </div>
              )}

              <div className="form-group form-group--full">
                <label>Aide contextuelle</label>
                <input
                  type="text"
                  value={newField.help}
                  onChange={(e) => setNewField(prev => ({ ...prev, help: e.target.value }))}
                  className="input"
                  placeholder="Texte d'aide affiché sous le champ"
                />
              </div>
            </div>

            <div className="field-editor__actions">
              {editingFieldIndex !== null ? (
                <>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancelField}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleUpdateField}
                  >
                    <Icon name="Save" size={16} />
                    Mettre à jour
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddField}
                >
                  <Icon name="Plus" size={16} />
                  Ajouter le champ
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="modular-section-editor__footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
        >
          Annuler
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
        >
          <Icon name="Save" size={16} />
          {isEdit ? 'Enregistrer' : 'Créer'} la section
        </button>
      </div>
    </div>
  )
}

