"use client"

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo, memo } from "react"
import { ChevronDown, Check, X } from "lucide-react"
import "./select.css"

type DropdownDirection = "up" | "down" | "auto"

interface SelectContextType {
  value: string | string[]
  onValueChange: (value: string | string[]) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  placeholder?: string
  multiple?: boolean
  selectedLabels: Map<string, string>
  setSelectedLabel: (value: string, label: string) => void
  registerOption: (value: string, label: string) => void
  longestOptionWidth: number
  direction: DropdownDirection
  calculatedDirection: "up" | "down"
  setCalculatedDirection: React.Dispatch<React.SetStateAction<"up" | "down">>
  desiredWidth?: number | string
  searchQuery: string // Added for filtering
  setSearchQuery: (query: string) => void // Added for filtering
}

const SelectContext = createContext<SelectContextType | null>(null)

export const useSelectContext = () => {
  // Exported for use in app/page.tsx
  const context = useContext(SelectContext)
  if (!context) {
    throw new Error("Select components must be used within a Select")
  }
  return context
}

interface SelectProps {
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
  children: React.ReactNode
  multiple?: boolean
  direction?: DropdownDirection
  width?: number | string
}

export const Select = memo(function Select({
  value,
  defaultValue,
  onValueChange,
  children,
  multiple = false,
  direction = "auto",
  width,
}: SelectProps) {
  const [internalValue, setInternalValue] = useState<string | string[]>(() => defaultValue || (multiple ? [] : ""))
  const [selectedLabels, setSelectedLabelsState] = useState<Map<string, string>>(() => new Map())
  const [open, setOpen] = useState(false)
  const [optionsMap, setOptionsMap] = useState<Map<string, string>>(new Map())
  const [longestOptionWidth, setLongestOptionWidth] = useState(0)
  const [calculatedDirection, setCalculatedDirection] = useState<"up" | "down">("down")
  const [searchQuery, setSearchQuery] = useState("") // New state for search query
  const measureRef = useRef<HTMLSpanElement>(null)

  const currentValue = value !== undefined ? value : internalValue

  const handleValueChange = useCallback(
    (newValue: string | string[]) => {
      if (value === undefined) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)

      // In single select mode, close the dropdown after selection
      if (!multiple) {
        setOpen(false)
      }
    },
    [value, onValueChange, multiple],
  )

  const setSelectedLabel = useCallback((value: string, label: string) => {
    setSelectedLabelsState((prev) => {
      const newMap = new Map(prev)
      newMap.set(value, label)
      return newMap
    })
  }, [])

  const registerOption = useCallback((value: string, label: string) => {
    setOptionsMap((prev) => {
      const newMap = new Map(prev)
      newMap.set(value, label)
      return newMap
    })
  }, [])

  // Calcular el ancho de la opción más larga
  useEffect(() => {
    if (measureRef.current && optionsMap.size > 0) {
      let maxWidth = 0
      const measurer = measureRef.current

      optionsMap.forEach((label) => {
        measurer.textContent = label
        const width = measurer.getBoundingClientRect().width
        maxWidth = Math.max(maxWidth, width)
      })

      const extraWidth = 60
      setLongestOptionWidth(Math.ceil(maxWidth) + extraWidth)
    }
  }, [optionsMap])

  const contextValue = useMemo(
    () => ({
      value: currentValue,
      onValueChange: handleValueChange,
      open,
      onOpenChange: setOpen,
      multiple,
      selectedLabels,
      setSelectedLabel,
      registerOption,
      longestOptionWidth,
      direction,
      calculatedDirection,
      setCalculatedDirection,
      desiredWidth: width,
      searchQuery, // Added to context
      setSearchQuery, // Added to context
    }),
    [
      currentValue,
      handleValueChange,
      open,
      multiple,
      selectedLabels,
      setSelectedLabel,
      registerOption,
      longestOptionWidth,
      direction,
      calculatedDirection,
      width,
      searchQuery,
      setSearchQuery,
    ],
  )

  return (
    <SelectContext.Provider value={contextValue}>
      <div className="select-root" style={{ width: typeof width === "number" ? `${width}px` : width }}>
        <span
          ref={measureRef}
          style={{
            position: "absolute",
            visibility: "hidden",
            whiteSpace: "nowrap",
            fontSize: "inherit",
            fontFamily: "inherit",
            fontWeight: "inherit",
            letterSpacing: "inherit",
            top: "-9999px",
            left: "-9999px",
          }}
          aria-hidden="true"
        />
        {children}
      </div>
    </SelectContext.Provider>
  )
})

interface SelectTriggerProps {
  children: React.ReactNode
}

/**
 * Encuentra el contenedor scrollable más cercano que puede afectar la posición del dropdown
 */
const findScrollableContainer = (element: HTMLElement): HTMLElement | null => {
  let current = element.parentElement

  while (current && current !== document.body) {
    const computedStyle = window.getComputedStyle(current)
    const hasScrollableOverflow =
      ["auto", "scroll", "overlay"].includes(computedStyle.overflowY) ||
      ["auto", "scroll", "overlay"].includes(computedStyle.overflow)

    // También verificar si tiene una altura fija que podría crear scroll
    const hasFixedHeight =
      computedStyle.height !== "auto" &&
      computedStyle.maxHeight !== "none" &&
      current.scrollHeight > current.clientHeight

    // Detectar contenedores comunes de modales, overlays y tablas
    const isModalContainer =
      current.classList.contains("modal") ||
      current.classList.contains("dialog") ||
      current.classList.contains("popover") ||
      current.classList.contains("overlay") ||
      current.classList.contains("table-container") ||
      current.tagName === "TABLE" ||
      current.tagName === "TBODY" ||
      (current.hasAttribute("role") &&
        ["dialog", "alertdialog", "grid"].includes(current.getAttribute("role") || "")) ||
      computedStyle.position === "fixed" ||
      computedStyle.position === "absolute"

    if (hasScrollableOverflow || hasFixedHeight || isModalContainer) {
      return current
    }

    current = current.parentElement
  }

  return null
}

/**
 * Calcula el espacio disponible considerando contenedores scrollables, modales y tablas
 */
const calculateAvailableSpace = (triggerRect: DOMRect, scrollableContainer: HTMLElement | null) => {
  const safetyMargin = 20
  let spaceAbove: number
  let spaceBelow: number

  if (scrollableContainer) {
    const containerRect = scrollableContainer.getBoundingClientRect()
    const containerStyle = window.getComputedStyle(scrollableContainer)

    // Considerar padding del contenedor
    const paddingTop = Number.parseInt(containerStyle.paddingTop, 10) || 0
    const paddingBottom = Number.parseInt(containerStyle.paddingBottom, 10) || 0

    // Calcular espacio dentro del contenedor
    spaceAbove = triggerRect.top - containerRect.top - paddingTop
    spaceBelow = containerRect.bottom - triggerRect.bottom - paddingBottom

    // Caso especial para tablas: usar espacio visible del viewport
    if (
      scrollableContainer.classList.contains("table-container") ||
      scrollableContainer.tagName === "TABLE" ||
      scrollableContainer.tagName === "TBODY"
    ) {
      const viewportHeight = window.innerHeight
      spaceAbove = Math.min(spaceAbove, triggerRect.top)
      spaceBelow = Math.min(spaceBelow, viewportHeight - triggerRect.bottom)
    }

    // Si el contenedor es scrollable, considerar el scroll actual
    if (scrollableContainer.scrollHeight > scrollableContainer.clientHeight) {
      const scrollTop = scrollableContainer.scrollTop
      const scrollBottom = scrollableContainer.scrollHeight - scrollableContainer.clientHeight - scrollTop

      // Ajustar espacios considerando el scroll disponible
      spaceAbove += Math.min(scrollTop, 0) // Solo si podemos scroll hacia arriba
      spaceBelow += Math.min(scrollBottom, 0) // Solo si podemos scroll hacia abajo
    }
  } else {
    // Usar viewport como referencia (comportamiento original mejorado)
    const viewportHeight = window.innerHeight
    spaceAbove = triggerRect.top
    spaceBelow = viewportHeight - triggerRect.bottom
  }

  return {
    spaceAbove: Math.max(0, spaceAbove),
    spaceBelow: Math.max(0, spaceBelow),
    safetyMargin,
  }
}

/**
 * Calcula la dirección antes de abrir el dropdown
 */
const calculateDropdownDirection = (
  trigger: HTMLElement,
  direction: DropdownDirection,
  optionsCount = 5,
): "up" | "down" => {
  // Si la dirección está forzada, respetarla
  if (direction === "up") return "up"
  if (direction === "down") return "down"

  // Para dirección 'auto', calcular basado en espacio disponible
  const triggerRect = trigger.getBoundingClientRect()
  const scrollableContainer = findScrollableContainer(trigger)

  // Estimar altura del contenido basado en número de opciones
  const estimatedItemHeight = 32 // altura aproximada de cada item
  const estimatedContentHeight = Math.min(240, optionsCount * estimatedItemHeight + 16) // padding

  const { spaceAbove, spaceBelow, safetyMargin } = calculateAvailableSpace(triggerRect, scrollableContainer)

  // Lógica de decisión
  const isInTable = trigger.closest('table, .table-container, [role="grid"]')

  let shouldOpenUpward = false

  if (isInTable) {
    // En tablas, priorizar abrir hacia arriba si hay poco espacio abajo
    if (spaceBelow < estimatedContentHeight + safetyMargin) {
      shouldOpenUpward = true
    }
  } else {
    // Lógica original para otros contextos
    if (spaceBelow < estimatedContentHeight + safetyMargin) {
      if (spaceAbove >= estimatedContentHeight + safetyMargin) {
        shouldOpenUpward = true
      } else if (spaceAbove > spaceBelow) {
        shouldOpenUpward = true
      }
    }
  }

  // Debug log
  if (process.env.NODE_ENV === "development") {
    console.log("Pre-calculated dropdown direction:", {
      direction,
      spaceAbove: Math.round(spaceAbove),
      spaceBelow: Math.round(spaceBelow),
      estimatedContentHeight,
      shouldOpenUpward,
      hasScrollableContainer: !!scrollableContainer,
      containerType: scrollableContainer?.tagName || "none",
      isInTable: !!isInTable,
      optionsCount,
    })
  }

  return shouldOpenUpward ? "up" : "down"
}

export const SelectTrigger = memo(function SelectTrigger({ children }: SelectTriggerProps) {
  const {
    open,
    onOpenChange,
    longestOptionWidth,
    direction,
    selectedLabels,
    setCalculatedDirection,
    desiredWidth,
    setSearchQuery,
  } = useSelectContext()
  const triggerRef = useRef<HTMLButtonElement>(null)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (!open && triggerRef.current) {
        // Clear search query when opening
        setSearchQuery("")
        // Calcular dirección ANTES de abrir
        const optionsCount = selectedLabels?.size || 5 // usar número de opciones registradas
        const calculatedDir = calculateDropdownDirection(triggerRef.current, direction, optionsCount)

        // Actualizar la dirección calculada
        setCalculatedDirection(calculatedDir)

        // Pequeño delay para asegurar que el estado se actualice antes de abrir
        requestAnimationFrame(() => {
          onOpenChange(true)
        })
      } else {
        onOpenChange(false)
      }
    },
    [open, onOpenChange, direction, selectedLabels, setCalculatedDirection, setSearchQuery],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()

        if (!open && triggerRef.current) {
          // Clear search query when opening
          setSearchQuery("")
          // Calcular dirección ANTES de abrir
          const optionsCount = selectedLabels?.size || 5
          const calculatedDir = calculateDropdownDirection(triggerRef.current, direction, optionsCount)

          setCalculatedDirection(calculatedDir)

          requestAnimationFrame(() => {
            onOpenChange(true)
          })
        } else {
          onOpenChange(false)
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        if (!open && triggerRef.current) {
          // Clear search query when opening
          setSearchQuery("")
          const optionsCount = selectedLabels?.size || 5
          const calculatedDir = calculateDropdownDirection(triggerRef.current, direction, optionsCount)

          setCalculatedDirection(calculatedDir)

          requestAnimationFrame(() => {
            onOpenChange(true)
          })
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        onOpenChange(false)
      }
    },
    [open, onOpenChange, direction, selectedLabels, setCalculatedDirection, setSearchQuery],
  )

  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      // Check if focus moved outside the select component
      const currentTarget = e.currentTarget
      const relatedTarget = e.relatedTarget as Node

      // If the new focus is outside the select root, close it
      setTimeout(() => {
        const selectRoot = currentTarget.closest(".select-root")
        if (selectRoot && relatedTarget && !selectRoot.contains(relatedTarget)) {
          onOpenChange(false)
        }
      }, 0)
    },
    [onOpenChange],
  )

  // Aplicar el ancho: priorizar desiredWidth, luego longestOptionWidth
  const triggerStyle: React.CSSProperties = useMemo(() => {
    if (desiredWidth) {
      return {
        width: typeof desiredWidth === "number" ? `${desiredWidth}px` : desiredWidth,
      }
    } else if (longestOptionWidth > 0) {
      return {
        minWidth: `${longestOptionWidth}px`,
      }
    }
    return {}
  }, [desiredWidth, longestOptionWidth])

  return (
    <button
      ref={triggerRef}
      className="select-trigger"
      style={triggerStyle}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      data-state={open ? "open" : "closed"}
      aria-expanded={open}
      aria-haspopup="listbox"
    >
      {children}
      <ChevronDown className="select-icon" />
    </button>
  )
})

interface SelectValueProps {
  placeholder?: string
}

export const SelectValue = memo(function SelectValue({ placeholder }: SelectValueProps) {
  const { value, multiple, selectedLabels } = useSelectContext()

  const displayValue = useMemo(() => {
    // For single select
    if (!multiple) {
      return value ? selectedLabels.get(value as string) || value : placeholder
    }

    // For multiple select, just show the placeholder
    return placeholder
  }, [value, multiple, selectedLabels, placeholder])

  return (
    <span className="select-value" data-placeholder={!value || multiple ? "" : undefined}>
      {displayValue}
    </span>
  )
})

type SelectTagsProps = {}

export const SelectTags = memo(function SelectTags({}: SelectTagsProps) {
  const { value, multiple, selectedLabels, onValueChange } = useSelectContext()

  const removeTag = useCallback(
    (valueToRemove: string, e: React.MouseEvent) => {
      e.stopPropagation()
      if (multiple && Array.isArray(value)) {
        const newValue = value.filter((v) => v !== valueToRemove)
        onValueChange(newValue)
      }
    },
    [multiple, value, onValueChange],
  )

  const tags = useMemo(() => {
    if (!multiple) return null
    const values = Array.isArray(value) ? value : []
    if (values.length === 0) return null

    return values.map((val) => (
      <SelectTag key={val} value={val} label={selectedLabels.get(val) || val} onRemove={removeTag} />
    ))
  }, [multiple, value, selectedLabels, removeTag])

  if (!tags) return null

  return <div className="select-tags-wrapper">{tags}</div>
})

interface SelectTagProps {
  value: string
  label: string
  onRemove: (value: string, e: React.MouseEvent) => void
}

const SelectTag = memo(function SelectTag({ value, label, onRemove }: SelectTagProps) {
  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      onRemove(value, e)
    },
    [value, onRemove],
  )

  return (
    <div className="select-tag">
      <span className="select-tag-text">{label}</span>
      <button className="select-tag-remove" onClick={handleRemove} type="button">
        <X />
      </button>
    </div>
  )
})

interface SelectContentProps {
  children: React.ReactNode
}

export const SelectContent = memo(function SelectContent({ children }: SelectContentProps) {
  const {
    open,
    onOpenChange,
    direction,
    calculatedDirection,
    desiredWidth,
    longestOptionWidth,
    searchQuery,
    setSearchQuery,
  } = useSelectContext()
  const contentRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Function to filter children based on search query
// Function to filter children based on search query
const filterChildren = useCallback((children: React.ReactNode, query: string): React.ReactNode => {
  if (!query) return children

  const lowerQuery = query.toLowerCase()

  const filterElement = (element: React.ReactNode): React.ReactNode => {
    if (!React.isValidElement(element)) return null

    // Handle SelectItem
    if (element.type === SelectItem) {
      const props = element.props as { children: React.ReactNode; value: string }
      const label = typeof props.children === "string" ? props.children : props.value

      if (label.toLowerCase().includes(lowerQuery)) {
        return element
      }
      return null
    }

    // Handle SelectLabel (categories)
    if (element.type === SelectLabel) {
      return element
    }

    // Handle SelectSeparator
    if (element.type === SelectSeparator) {
      return element
    }

    // Handle React.Fragment
    if (element.type === React.Fragment) {
      const fragmentProps = element.props as { children: React.ReactNode }
      const filteredChildren = React.Children.toArray(fragmentProps.children).map(filterElement).filter(Boolean)

      if (filteredChildren.length === 0) return null

      return React.createElement(React.Fragment, { key: element.key }, ...filteredChildren)
    }

    // Handle other elements with children
    if (element.props && typeof element.props === 'object' && element.props !== null && 'children' in element.props) {
      const elementProps = element.props as { children: React.ReactNode }
      const filteredChildren = React.Children.toArray(elementProps.children).map(filterElement).filter(Boolean)

      if (filteredChildren.length === 0) return null

      return React.cloneElement(element, { key: element.key }, ...filteredChildren)
    }

    return element
  }

  const filteredChildren = React.Children.toArray(children).map(filterElement).filter(Boolean)

  return filteredChildren.length > 0 ? filteredChildren : <div className="select-no-results">No results found.</div>
}, [])

  // Apply filtering to children
  const filteredChildren = useMemo(() => {
    return filterChildren(children, searchQuery)
  }, [children, searchQuery, filterChildren])

  // Rest of the component remains the same...
  const contentStyle: React.CSSProperties = useMemo(() => {
    if (desiredWidth) {
      return {
        width: typeof desiredWidth === "number" ? `${desiredWidth}px` : desiredWidth,
      }
    } else if (longestOptionWidth > 0) {
      return {
        minWidth: `${longestOptionWidth}px`,
      }
    }
    return {}
  }, [desiredWidth, longestOptionWidth])

  useEffect(() => {
    if (open) {
      // Focus the search input when the dropdown opens
      const timeoutId = setTimeout(() => {
        searchInputRef.current?.focus()

        const handleClickOutside = (event: MouseEvent) => {
          const target = event.target as Node
          const selectRoot = contentRef.current?.closest(".select-root")

          if (selectRoot && !selectRoot.contains(target)) {
            onOpenChange(false)
          }
        }

        document.addEventListener("click", handleClickOutside, true)

        return () => {
          document.removeEventListener("click", handleClickOutside, true)
        }
      }, 0)

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onOpenChange(false)
        }
      }

      document.addEventListener("keydown", handleEscape)

      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener("keydown", handleEscape)
      }
    }
  }, [open, onOpenChange])

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value)
    },
    [setSearchQuery],
  )

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Prevent closing the select when pressing Enter or Space in the search input
    if (e.key === "Enter" || e.key === " ") {
      e.stopPropagation()
    }
  }, [])

  if (!open) return null

  // Usar la dirección pre-calculada
  const shouldOpenUpward = direction === "up" || (direction === "auto" && calculatedDirection === "up")

  return (
    <div
      ref={contentRef}
      className="select-content"
      style={contentStyle}
      data-open-upward={shouldOpenUpward}
      role="listbox"
    >
      <div className="select-search-wrapper">
        <input
          ref={searchInputRef}
          type="text"
          className="select-search-input"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
          aria-label="Search select options"
        />
      </div>
      {filteredChildren}
    </div>
  )
})

interface SelectItemProps {
  value: string
  children: React.ReactNode
  disabled?: boolean
}

export const SelectItem = memo(function SelectItem({ value, children, disabled }: SelectItemProps) {
  const { value: selectedValue, onValueChange, multiple, setSelectedLabel, registerOption } = useSelectContext()

  const isSelected = useMemo(() => {
    return multiple ? Array.isArray(selectedValue) && selectedValue.includes(value) : selectedValue === value
  }, [multiple, selectedValue, value])

  useEffect(() => {
    // Store the label for this value and register for width calculation
    if (typeof children === "string") {
      setSelectedLabel(value, children)
      registerOption(value, children)
    } else if (React.isValidElement(children)) {
      // Handle case where children is a React element with string content
      const props = children.props as { children?: React.ReactNode }
      if (typeof props.children === "string") {
        const label = props.children
        setSelectedLabel(value, label)
        registerOption(value, label)
      } else {
        // Fallback: use value as label
        setSelectedLabel(value, value)
        registerOption(value, value)
      }
    } else {
      // Fallback: use value as label
      setSelectedLabel(value, value)
      registerOption(value, value)
    }
  }, [value, children, setSelectedLabel, registerOption])

  const handleClick = useCallback(() => {
    if (disabled) return

    if (multiple) {
      const currentValues = Array.isArray(selectedValue) ? selectedValue : []
      const newValues = isSelected ? currentValues.filter((v) => v !== value) : [...currentValues, value]
      onValueChange(newValues)
    } else {
      onValueChange(value)
    }
  }, [disabled, multiple, selectedValue, isSelected, value, onValueChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        if (!disabled) {
          handleClick()
        }
      }
    },
    [disabled, handleClick],
  )

  return (
    <div
      className={`select-item ${multiple ? "select-item-multiple" : ""}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-selected={isSelected ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      role="option"
      aria-selected={isSelected}
      tabIndex={disabled ? -1 : 0}
    >
      {multiple && (
        <div className="select-item-checkbox">
          <Check />
        </div>
      )}
      {children}
      {!multiple && isSelected && <Check className="select-item-indicator" />}
    </div>
  )
})

export const SelectSeparator = memo(function SelectSeparator() {
  return <div className="select-separator" />
})

interface SelectLabelProps {
  children: React.ReactNode
}

export const SelectLabel = memo(function SelectLabel({ children }: SelectLabelProps) {
  return <div className="select-label">{children}</div>
})
