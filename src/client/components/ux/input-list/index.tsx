"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import { Plus, X, Edit3, Check } from "lucide-react"
import Input from "../input"
import "./input-list.css"

interface InputListItem {
  text: string
  active: boolean
}

interface InputListProps {
  title: string
  placeholder?: string
  items: InputListItem[]
  onChange: (items: InputListItem[]) => void
  maxItems?: number
  disabled?: boolean
  emptyMessage?: string
  className?: string
  allowEdit?: boolean
  showActiveToggle?: boolean
  showRemoveButton?: boolean
}

const InputList: React.FC<InputListProps> = ({
  title,
  placeholder = "Agregar nuevo elemento...",
  items = [],
  onChange,
  maxItems,
  disabled = false,
  emptyMessage = "No hay elementos agregados.",
  className = "",
  allowEdit = true,
  showActiveToggle = true,
  showRemoveButton = false,
}) => {
  const [inputValue, setInputValue] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const editInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  const handleAddItem = useCallback(() => {
    const trimmedValue = inputValue.trim()

    if (!trimmedValue) return

    // Check if item already exists
    if (items.some((item) => item.text === trimmedValue)) {
      return
    }

    // Check max items limit
    if (maxItems && items.length >= maxItems) {
      return
    }

    setIsAdding(true)

    // Simulate a small delay for better UX
    setTimeout(() => {
      const newItems = [...items, { text: trimmedValue, active: true }]
      onChange(newItems)
      setInputValue("")
      setIsAdding(false)
    }, 150)
  }, [inputValue, items, onChange, maxItems])

  const handleRemoveItem = useCallback(
    (indexToRemove: number) => {
      // If we're editing this item, cancel editing
      if (editingIndex === indexToRemove) {
        setEditingIndex(null)
        setEditingValue("")
      }

      const newItems = items.filter((_, index) => index !== indexToRemove)
      onChange(newItems)
    },
    [items, onChange, editingIndex],
  )

  const handleToggleActive = useCallback(
    (index: number) => {
      const newItems = [...items]
      newItems[index] = { ...newItems[index], active: !newItems[index].active }
      onChange(newItems)
    },
    [items, onChange],
  )

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault()
        handleAddItem()
      }
    },
    [handleAddItem],
  )

  // Start editing an item
  const handleStartEdit = useCallback(
    (index: number) => {
      if (!allowEdit || disabled) return

      setEditingIndex(index)
      setEditingValue(items[index].text)
    },
    [allowEdit, disabled, items],
  )

  // Save edited item
  const handleSaveEdit = useCallback(() => {
    if (editingIndex === null) return

    const trimmedValue = editingValue.trim()

    if (!trimmedValue) {
      // If empty, cancel editing
      setEditingIndex(null)
      setEditingValue("")
      return
    }

    // Check if the new value already exists (excluding the current item)
    const otherItems = items.filter((_, index) => index !== editingIndex)
    if (otherItems.some((item) => item.text === trimmedValue)) {
      return
    }

    const newItems = [...items]
    newItems[editingIndex] = { ...newItems[editingIndex], text: trimmedValue }
    onChange(newItems)

    setEditingIndex(null)
    setEditingValue("")
  }, [editingIndex, editingValue, items, onChange])

  // Cancel editing
  const handleCancelEdit = useCallback(() => {
    setEditingIndex(null)
    setEditingValue("")
  }, [])

  // Handle edit input change
  const handleEditInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingValue(e.target.value)
  }, [])

  // Handle edit input key press
  const handleEditKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault()
        handleSaveEdit()
      } else if (e.key === "Escape") {
        e.preventDefault()
        handleCancelEdit()
      }
    },
    [handleSaveEdit, handleCancelEdit],
  )

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingIndex !== null && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingIndex])

  const canAddMore = !maxItems || items.length < maxItems
  const activeCount = items.filter((item) => item.active).length

  return (
    <div className={`input-list-container ${className}`}>
      {/* Title */}
      <div className="input-list-title">{title}</div>

      {/* Input Section */}
      <div className="input-list-input-section">
        <div className="input-list-input-wrapper">
          <Input
            name="list-input"
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={disabled || !canAddMore}
            hasContentState={false}
          />
        </div>

        <button
          className={`input-list-add-btn ${isAdding ? "adding" : ""}`}
          onClick={handleAddItem}
          disabled={disabled || !inputValue.trim() || !canAddMore || isAdding}
          title="Agregar elemento"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Items List */}
      <div className="input-list-items-section">
        {items.length > 0 ? (
          <>
            <div className="input-list-items-header">
              <span>
                Elementos actuales ({items.length})
                {showActiveToggle && <span className="active-count"> - {activeCount} activos</span>}
              </span>
              {maxItems && (
                <span className="input-list-limit">
                  {items.length}/{maxItems}
                </span>
              )}
            </div>

            <div className="input-list-items">
              {items.map((item, index) => (
                <div key={`${item.text}-${index}`} className={`input-list-item ${!item.active ? "inactive" : ""}`}>
                  <div className="input-list-item-content">
                    {editingIndex === index ? (
                      // Edit mode
                      <div className="input-list-edit-container">
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editingValue}
                          onChange={handleEditInputChange}
                          onKeyDown={handleEditKeyPress}
                          onBlur={handleSaveEdit}
                          className="input-list-edit-input"
                          disabled={disabled}
                        />
                        <button
                          className="input-list-save-btn"
                          onClick={handleSaveEdit}
                          disabled={disabled}
                          title="Guardar cambios"
                        >
                          <Check size={12} />
                        </button>
                      </div>
                    ) : (
                      // View mode
                      <span
                        className={`input-list-item-text ${allowEdit && !disabled ? "editable" : ""}`}
                        onClick={() => handleStartEdit(index)}
                        title={allowEdit && !disabled ? "Haz clic para editar" : ""}
                      >
                        {item.text}
                      </span>
                    )}
                  </div>

                  <div className="input-list-item-actions">
                    {showActiveToggle && (
                      <label className="input-list-checkbox-container">
                        <input
                          type="checkbox"
                          checked={item.active}
                          onChange={() => handleToggleActive(index)}
                          disabled={disabled}
                          className="input-list-checkbox"
                        />
                        <span className="input-list-checkbox-checkmark"></span>
                      </label>
                    )}

                    {allowEdit && !disabled && editingIndex !== index && (
                      <button
                        className="input-list-edit-btn"
                        onClick={() => handleStartEdit(index)}
                        title="Editar elemento"
                      >
                        <Edit3 size={12} />
                      </button>
                    )}

                    {showRemoveButton && (
                      <button
                        className="input-list-remove-btn"
                        onClick={() => handleRemoveItem(index)}
                        disabled={disabled}
                        title="Eliminar elemento"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="input-list-empty">{emptyMessage}</div>
        )}
      </div>

      {/* Max items warning */}
      {maxItems && items.length >= maxItems && (
        <div className="input-list-warning">Has alcanzado el límite máximo de {maxItems} elementos.</div>
      )}
    </div>
  )
}

export default InputList
