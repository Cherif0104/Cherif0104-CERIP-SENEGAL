import { useState } from 'react'
import Icon from '../common/Icon'
import ConfirmModal from '../common/ConfirmModal'
import ModularSectionEditor from './ModularSectionEditor'
import './ModularSections.css'

export default function ModularSections({
  sections = [],
  onSectionsChange,
  mode = 'edit' // 'edit' | 'view'
}) {
  const [expandedSections, setExpandedSections] = useState(new Set())
  const [editingSection, setEditingSection] = useState(null)
  const [showEditor, setShowEditor] = useState(false)
  const [deletingSectionId, setDeletingSectionId] = useState(null)

  const isEditMode = mode === 'edit'

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const handleAddSection = () => {
    setEditingSection(null)
    setShowEditor(true)
  }

  const handleEditSection = (section) => {
    setEditingSection(section)
    setShowEditor(true)
  }

  const handleSaveSection = (sectionData) => {
    let updatedSections

    if (editingSection) {
      // Modification
      updatedSections = sections.map(s =>
        s.id === editingSection.id ? sectionData : s
      )
    } else {
      // Ajout
      updatedSections = [...sections, sectionData]
    }

    // Trier par ordre
    updatedSections.sort((a, b) => (a.ordre || 0) - (b.ordre || 0))

    onSectionsChange(updatedSections)
    setShowEditor(false)
    setEditingSection(null)
  }

  const handleDeleteSection = (sectionId) => {
    const updatedSections = sections.filter(s => s.id !== sectionId)
    onSectionsChange(updatedSections)
    setDeletingSectionId(null)
  }

  const handleMoveSection = (sectionId, direction) => {
    const index = sections.findIndex(s => s.id === sectionId)
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sections.length - 1)
    ) {
      return
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1
    const updatedSections = [...sections]
    const [moved] = updatedSections.splice(index, 1)
    updatedSections.splice(newIndex, 0, moved)

    // Réorganiser les ordres
    const reorderedSections = updatedSections.map((s, idx) => ({
      ...s,
      ordre: idx + 1
    }))

    onSectionsChange(reorderedSections)
  }

  const renderField = (field, sectionId) => {
    const fieldId = `${sectionId}_${field.name}`
    const value = field.value || ''

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <input
            type={field.type}
            id={fieldId}
            name={field.name}
            value={value}
            onChange={(e) => {
              const updatedSections = sections.map(s => {
                if (s.id === sectionId) {
                  return {
                    ...s,
                    champs: s.champs.map(f =>
                      f.name === field.name ? { ...f, value: e.target.value } : f
                    )
                  }
                }
                return s
              })
              onSectionsChange(updatedSections)
            }}
            className="input"
            placeholder={field.placeholder}
            required={field.required}
            disabled={!isEditMode}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            id={fieldId}
            name={field.name}
            value={value}
            onChange={(e) => {
              const updatedSections = sections.map(s => {
                if (s.id === sectionId) {
                  return {
                    ...s,
                    champs: s.champs.map(f =>
                      f.name === field.name ? { ...f, value: e.target.value } : f
                    )
                  }
                }
                return s
              })
              onSectionsChange(updatedSections)
            }}
            className="input"
            min={field.validation?.min}
            max={field.validation?.max}
            required={field.required}
            disabled={!isEditMode}
          />
        )

      case 'textarea':
        return (
          <textarea
            id={fieldId}
            name={field.name}
            value={value}
            onChange={(e) => {
              const updatedSections = sections.map(s => {
                if (s.id === sectionId) {
                  return {
                    ...s,
                    champs: s.champs.map(f =>
                      f.name === field.name ? { ...f, value: e.target.value } : f
                    )
                  }
                }
                return s
              })
              onSectionsChange(updatedSections)
            }}
            className="input"
            placeholder={field.placeholder}
            rows={field.rows || 3}
            required={field.required}
            disabled={!isEditMode}
          />
        )

      case 'date':
        return (
          <input
            type="date"
            id={fieldId}
            name={field.name}
            value={value}
            onChange={(e) => {
              const updatedSections = sections.map(s => {
                if (s.id === sectionId) {
                  return {
                    ...s,
                    champs: s.champs.map(f =>
                      f.name === field.name ? { ...f, value: e.target.value } : f
                    )
                  }
                }
                return s
              })
              onSectionsChange(updatedSections)
            }}
            className="input"
            required={field.required}
            disabled={!isEditMode}
          />
        )

      case 'select':
      case 'multiselect':
        return (
          <select
            id={fieldId}
            name={field.name}
            value={field.type === 'multiselect' ? (value || []) : value}
            onChange={(e) => {
              const newValue = field.type === 'multiselect'
                ? Array.from(e.target.selectedOptions, opt => opt.value)
                : e.target.value
              
              const updatedSections = sections.map(s => {
                if (s.id === sectionId) {
                  return {
                    ...s,
                    champs: s.champs.map(f =>
                      f.name === field.name ? { ...f, value: newValue } : f
                    )
                  }
                }
                return s
              })
              onSectionsChange(updatedSections)
            }}
            className="input"
            multiple={field.type === 'multiselect'}
            required={field.required}
            disabled={!isEditMode}
          >
            {field.options?.map(opt => (
              <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
                {typeof opt === 'string' ? opt : opt.label}
              </option>
            ))}
          </select>
        )

      case 'checkbox':
        return (
          <label className="checkbox-label">
            <input
              type="checkbox"
              id={fieldId}
              name={field.name}
              checked={!!value}
              onChange={(e) => {
                const updatedSections = sections.map(s => {
                  if (s.id === sectionId) {
                    return {
                      ...s,
                      champs: s.champs.map(f =>
                        f.name === field.name ? { ...f, value: e.target.checked } : f
                      )
                    }
                  }
                  return s
                })
                onSectionsChange(updatedSections)
              }}
              disabled={!isEditMode}
            />
            {field.label}
          </label>
        )

      default:
        return null
    }
  }

  if (sections.length === 0 && !isEditMode) {
    return null
  }

  return (
    <div className="modular-sections">
      {isEditMode && (
        <div className="modular-sections__header">
          <h3>Informations complémentaires</h3>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleAddSection}
          >
            <Icon name="Plus" size={16} />
            Ajouter une section
          </button>
        </div>
      )}

      {sections.length === 0 && isEditMode && (
        <div className="modular-sections__empty">
          <Icon name="Info" size={24} />
          <p>Aucune section complémentaire. Cliquez sur "Ajouter une section" pour en créer une.</p>
        </div>
      )}

      {sections.map((section) => {
        const isExpanded = expandedSections.has(section.id) || !section.collapsible
        const shouldShowContent = section.collapsible ? isExpanded : true

        return (
          <div key={section.id} className="modular-section">
            <div
              className={`modular-section__header ${section.collapsible ? 'modular-section__header--clickable' : ''}`}
              onClick={() => section.collapsible && toggleSection(section.id)}
            >
              <div className="modular-section__header-left">
                <Icon name={section.icon || 'FileText'} size={20} />
                <h4>{section.label}</h4>
              </div>
              <div className="modular-section__header-right">
                {isEditMode && (
                  <>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMoveSection(section.id, 'up')
                      }}
                      disabled={sections.findIndex(s => s.id === section.id) === 0}
                      title="Déplacer vers le haut"
                    >
                      <Icon name="ChevronUp" size={16} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMoveSection(section.id, 'down')
                      }}
                      disabled={sections.findIndex(s => s.id === section.id) === sections.length - 1}
                      title="Déplacer vers le bas"
                    >
                      <Icon name="ChevronDown" size={16} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditSection(section)
                      }}
                      title="Modifier"
                    >
                      <Icon name="Edit" size={16} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon btn-icon--danger"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeletingSectionId(section.id)
                      }}
                      title="Supprimer"
                    >
                      <Icon name="Trash2" size={16} />
                    </button>
                  </>
                )}
                {section.collapsible && (
                  <Icon
                    name={isExpanded ? 'ChevronUp' : 'ChevronDown'}
                    size={20}
                    className="modular-section__chevron"
                  />
                )}
              </div>
            </div>

            {shouldShowContent && (
              <div className="modular-section__content">
                {section.champs && section.champs.length > 0 ? (
                  <div className="modular-section__fields">
                    {section.champs
                      .sort((a, b) => (a.ordre || 0) - (b.ordre || 0))
                      .map((field) => (
                        <div key={field.name} className="form-group">
                          <label htmlFor={`${section.id}_${field.name}`}>
                            {field.label}
                            {field.required && <span className="required">*</span>}
                          </label>
                          {renderField(field, section.id)}
                          {field.help && (
                            <small className="field-help">{field.help}</small>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="modular-section__empty-fields">
                    <p>Aucun champ dans cette section.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Modal d'édition de section */}
      {showEditor && (
        <div className="modular-section-editor-modal">
          <div className="modular-section-editor-modal__backdrop" onClick={() => setShowEditor(false)} />
          <div className="modular-section-editor-modal__content">
            <ModularSectionEditor
              section={editingSection}
              onSave={handleSaveSection}
              onCancel={() => {
                setShowEditor(false)
                setEditingSection(null)
              }}
            />
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        open={deletingSectionId !== null}
        title="Supprimer la section"
        description={`Êtes-vous sûr de vouloir supprimer la section "${sections.find(s => s.id === deletingSectionId)?.label}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={() => handleDeleteSection(deletingSectionId)}
        onCancel={() => setDeletingSectionId(null)}
      />
    </div>
  )
}

