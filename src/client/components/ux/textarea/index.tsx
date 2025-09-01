"use client"
import type React from "react"
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import Icon from "../icon"
import "./textarea.css"

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  className?: string
  name: string
  icon?: React.ReactNode
  iconFixed?: boolean
  id?: string
  required?: boolean
  disabled?: boolean
  hasContentState?: boolean
  placeholder: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  value?: string
  defaultValue?: string
  error?: string
  label?: string
  "aria-label"?: string
  "aria-describedby"?: string
  rows?: number
  maxLength?: number
}

export interface TextareaRef {
  focus: () => void
  blur: () => void
  getValue: () => string
  setValue: (value: string) => void
}

const Textarea = forwardRef<TextareaRef, TextareaProps>(
  (
    {
      className = "",
      icon,
      iconFixed = false,
      name,
      id = name,
      required = false,
      disabled = false,
      hasContentState = false,
      placeholder,
      onChange,
      value,
      defaultValue,
      error,
      label,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedBy,
      rows = 4,
      maxLength,
      ...restProps
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const [hasContent, setHasContent] = useState(hasContentState)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Determinar si es un textarea controlado
    const isControlled = value !== undefined

    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
      blur: () => textareaRef.current?.blur(),
      getValue: () => textareaRef.current?.value || "",
      setValue: (newValue: string) => {
        if (textareaRef.current) {
          textareaRef.current.value = newValue
          setHasContent(newValue !== "")
        }
      },
    }))

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      setHasContent(newValue !== "")
      onChange?.(e)
    }

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true)
      restProps.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false)
      restProps.onBlur?.(e)
    }

    // Sincronizar hasContent con hasContentState y value
    useEffect(() => {
      if (textareaRef.current) {
        const initialValue = isControlled ? value || "" : textareaRef.current.value || ""
        setHasContent(initialValue !== "" || hasContentState)
      }
    }, [value, isControlled, hasContentState])

    useEffect(() => {
      setHasContent(hasContentState)
    }, [hasContentState])

    // IDs únicos para accesibilidad
    const errorId = error ? `${id}-error` : undefined
    const describedBy = [ariaDescribedBy, errorId].filter(Boolean).join(" ") || undefined

    return (
      <div className={`textarea-wrapper ${className}`}>
        {label && (
          <label htmlFor={id} className="textarea-label">
            {label}
            {required && (
              <span className="required-indicator" aria-label="requerido">
                *
              </span>
            )}
          </label>
        )}

        <div
          className={`
                    container-textarea 
                    ${isFocused ? "focus" : ""} 
                    ${icon ? "" : "no-icon"} 
                    ${error ? "error" : ""} 
                    ${disabled ? "disabled" : ""} 
                    ${!iconFixed && icon ? "icon-placehorder" : ""}
                `}
        >
          {/* Icono */}
          {icon && iconFixed && (
            <div className="label-ico" aria-hidden="true">
              <Icon icon={icon} />
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            name={name}
            id={id}
            required={required}
            disabled={disabled}
            rows={rows}
            maxLength={maxLength}
            value={isControlled ? value : undefined}
            defaultValue={!isControlled ? defaultValue : undefined}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            aria-label={ariaLabel || (label ? undefined : placeholder)}
            aria-describedby={describedBy}
            aria-invalid={error ? "true" : "false"}
            {...restProps}
          />

          {/* Placeholder flotante */}
          <span className={`holder ${hasContent || isFocused ? "has-content" : ""}`} aria-hidden="true">
            {icon && !iconFixed && (
              <div className="label-ico" aria-hidden="true">
                <Icon icon={icon} />
              </div>
            )}
            {placeholder}
          </span>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div id={errorId} className="error-message" role="alert" aria-live="polite">
            {error}
          </div>
        )}
      </div>
    )
  },
)

Textarea.displayName = "Textarea"

export default Textarea
