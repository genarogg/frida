"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check, Info } from "lucide-react"
import "./checkbox-group.css"

interface CheckboxOption {
    id: string
    label: string
    description?: string
    disabled?: boolean
}

interface CheckboxGroupProps {
    title: string
    subtitle?: string
    options: CheckboxOption[]
    selectedValues: string[]
    onChange: (values: string[]) => void
    allowMultiple?: boolean
    maxSelections?: number
    disabled?: boolean
    showSelectAll?: boolean
}

export default function CheckboxGroup({
    title,
    subtitle,
    options,
    selectedValues,
    onChange,
    allowMultiple = true,
    maxSelections,
    disabled = false,
    showSelectAll = false,
}: CheckboxGroupProps) {
    const handleOptionToggle = (optionId: string) => {
        if (disabled) return

        if (allowMultiple) {
            if (selectedValues.includes(optionId)) {
                // Remove from selection
                onChange(selectedValues.filter((id) => id !== optionId))
            } else {
                // Add to selection (check max limit)
                if (!maxSelections || selectedValues.length < maxSelections) {
                    onChange([...selectedValues, optionId])
                }
            }
        } else {
            // Single selection mode (radio behavior)
            if (selectedValues.includes(optionId)) {
                onChange([]) // Deselect if already selected
            } else {
                onChange([optionId]) // Select only this one
            }
        }
    }

    const handleSelectAll = () => {
        if (disabled) return

        const enabledOptions = options.filter((opt) => !opt.disabled).map((opt) => opt.id)
        const allSelected = enabledOptions.every((id) => selectedValues.includes(id))

        if (allSelected) {
            // Deseleccionar todos
            onChange([])
        } else {
            // Seleccionar todos (respetando el límite máximo)
            if (maxSelections) {
                onChange(enabledOptions.slice(0, maxSelections))
            } else {
                onChange(enabledOptions)
            }
        }
    }

    // Verificar si todos los elementos están seleccionados
    const enabledOptions = options.filter((opt) => !opt.disabled)
    const allSelected = enabledOptions.length > 0 && enabledOptions.every((opt) => selectedValues.includes(opt.id))

    const isMaxReached = maxSelections && selectedValues.length >= maxSelections

    return (
        <div className={`checkbox-group ${disabled ? "checkbox-group--disabled" : ""}`}>
            <div className="checkbox-group__header">
                <h3 className="checkbox-group__title">{title}</h3>
                {subtitle && <p className="checkbox-group__subtitle">{subtitle}</p>}

                {allowMultiple && maxSelections && (
                    <div className="checkbox-group__counter">
                        <span className={selectedValues.length >= maxSelections ? "counter--max" : ""}>
                            {selectedValues.length} / {maxSelections}
                        </span>
                    </div>
                )}
            </div>

            <div className="checkbox-group__options">
                {/* Botón de seleccionar todos con la misma estética que las opciones */}
                {showSelectAll && allowMultiple && (
                    <motion.div
                        className={`checkbox-option select-all-option ${allSelected ? "checkbox-option--selected" : ""}`}
                        onClick={handleSelectAll}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="checkbox-option__checkbox">
                            <motion.div
                                className="checkbox-option__fill"
                                initial={false}
                                animate={{
                                    scale: allSelected ? 1 : 0,
                                    opacity: allSelected ? 1 : 0,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30,
                                }}
                            />

                            <motion.div
                                className="checkbox-option__checkmark"
                                initial={false}
                                animate={{
                                    scale: allSelected ? 1 : 0,
                                    opacity: allSelected ? 1 : 0,
                                    rotate: allSelected ? 0 : -180,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 600,
                                    damping: 25,
                                    delay: allSelected ? 0.1 : 0,
                                }}
                            >
                                <Check size={16} strokeWidth={3} />
                            </motion.div>
                        </div>

                        <div className="checkbox-option__content">
                            <div className="checkbox-option__label">
                                {allSelected ? "Deseleccionar todos" : "Seleccionar todos"}
                                {maxSelections && !allSelected && <span className="select-all-limit">(máx. {maxSelections})</span>}
                            </div>
                            <div className="checkbox-option__description">
                                <Info size={14} />
                                {allSelected
                                    ? "Desmarca todas las opciones seleccionadas"
                                    : maxSelections
                                        ? `Selecciona hasta ${maxSelections} opciones automáticamente`
                                        : "Selecciona todas las opciones disponibles"}
                            </div>
                        </div>

                        {allSelected && (
                            <motion.div
                                className="checkbox-option__indicator select-all-indicator"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            >
                                ✓
                            </motion.div>
                        )}
                    </motion.div>
                )}

                <AnimatePresence>
                    {options.map((option, index) => {
                        const isSelected = selectedValues.includes(option.id)
                        const isDisabled = disabled || option.disabled || (isMaxReached && !isSelected)
                        // Ajustar el delay para tener en cuenta el botón de seleccionar todos
                        const animationDelay = showSelectAll && allowMultiple ? (index + 1) * 0.05 : index * 0.05

                        return (
                            <motion.div
                                key={option.id}
                                className={`checkbox-option ${isSelected ? "checkbox-option--selected" : ""} ${isDisabled ? "checkbox-option--disabled" : ""}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: animationDelay }}
                                whileHover={isDisabled ? {} : { scale: 1.02 }}
                                whileTap={isDisabled ? {} : { scale: 0.98 }}
                                onClick={() => handleOptionToggle(option.id)}
                            >
                                <div className="checkbox-option__checkbox">
                                    <motion.div
                                        className="checkbox-option__fill"
                                        initial={false}
                                        animate={{
                                            scale: isSelected ? 1 : 0,
                                            opacity: isSelected ? 1 : 0,
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 30,
                                        }}
                                    />

                                    <motion.div
                                        className="checkbox-option__checkmark"
                                        initial={false}
                                        animate={{
                                            scale: isSelected ? 1 : 0,
                                            opacity: isSelected ? 1 : 0,
                                            rotate: isSelected ? 0 : -180,
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 600,
                                            damping: 25,
                                            delay: isSelected ? 0.1 : 0,
                                        }}
                                    >
                                        <Check size={16} strokeWidth={3} />
                                    </motion.div>
                                </div>

                                <div className="checkbox-option__content">
                                    <div className="checkbox-option__label">
                                        {option.label}
                                        {!allowMultiple && <span className="checkbox-option__mode">(Solo uno)</span>}
                                    </div>
                                    {option.description && (
                                        <div className="checkbox-option__description">
                                            <Info size={14} />
                                            {option.description}
                                        </div>
                                    )}
                                </div>

                                {isSelected && (
                                    <motion.div
                                        className="checkbox-option__indicator"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                    >
                                        ✓
                                    </motion.div>
                                )}
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            {isMaxReached && allowMultiple && (
                <motion.div
                    className="checkbox-group__warning"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    <Info size={16} />
                    Has alcanzado el límite máximo de selecciones ({maxSelections})
                </motion.div>
            )}
        </div>
    )
}
