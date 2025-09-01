"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import "./animated-checkbox.css"

interface AnimatedCheckboxProps {
    isChecked?: boolean
    onToggle?: () => void
    label: string
    disabled?: boolean
}

export default function AnimatedCheckbox({ isChecked, onToggle, label, disabled = false }: AnimatedCheckboxProps) {
    return (
        <label className={`checkbox-container ${disabled ? "checkbox-container--disabled" : ""}`}>
            <div className="checkbox-wrapper">
                <motion.div
                    className={`checkbox ${isChecked ? "checkbox--checked" : ""}`}
                    onClick={disabled ? undefined : onToggle}
                    whileHover={disabled ? {} : { scale: 1.05 }}
                    whileTap={disabled ? {} : { scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                    <motion.div
                        className="checkbox__fill"
                        initial={false}
                        animate={{
                            scale: isChecked ? 1 : 0,
                            opacity: isChecked ? 1 : 0,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                            duration: 0.2,
                        }}
                    />

                    <motion.div
                        className="checkbox__checkmark"
                        initial={false}
                        animate={{
                            scale: isChecked ? 1 : 0,
                            opacity: isChecked ? 1 : 0,
                            rotate: isChecked ? 0 : -180,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 600,
                            damping: 25,
                            delay: isChecked ? 0.1 : 0,
                        }}
                    >
                        <Check size={14} strokeWidth={3} />
                    </motion.div>
                </motion.div>
            </div>

            <motion.span
                className="checkbox-label"
                initial={false}
                animate={{
                    color: isChecked ? "#2563eb" : "#374151",
                }}
                transition={{ duration: 0.2 }}
            >
                {label}
            </motion.span>
        </label>
    )
}
