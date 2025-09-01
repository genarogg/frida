"use client"

import type React from "react"
import { useState, useEffect, useRef, memo, useCallback } from "react"
import "./modal.css"

interface ModalProps {
  title?: string
  icon?: React.ReactNode
  children: React.ReactNode | (() => React.ReactNode)
  buttonClassName?: string
  buttonText?: string
  onclick?: () => void
  maxWidth?: string
  cancel?: boolean
  onCancel?: () => void
  cancelText?: string
  lazy?: boolean
  preventClose?: boolean // 🔥 NUEVA: Previene el cierre del modal
  onValidateClose?: () => boolean // 🔥 NUEVA: Función de validación antes de cerrar
  type?: "btn" // 🔥 NUEVA: Tipo de modal - cuando es "btn" muestra solo el icono
}

// 🔥 OPTIMIZACIÓN CRÍTICA: Memoizar el Modal
const Modal = memo(function Modal({ 
  title, 
  icon, 
  children, 
  buttonClassName, 
  buttonText = "Guardar", 
  onclick,
  maxWidth = "500px",
  cancel = false,
  onCancel,
  cancelText = "Cancelar",
  lazy = true,
  preventClose = false, // 🔥 NUEVA: Por defecto se puede cerrar
  onValidateClose, // 🔥 NUEVA: Función de validación opcional
  type // 🔥 NUEVA: Tipo de modal
}: ModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [hasBeenOpened, setHasBeenOpened] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const openModal = useCallback(() => {
    setIsOpen(true)
    setIsClosing(false)
    setHasBeenOpened(true)
  }, [])

  // 🔥 NUEVA: Función para validar si se puede cerrar (solo para guardar)
  const canCloseOnSave = useCallback(() => {
    if (preventClose) return false
    if (onValidateClose) return onValidateClose()
    return true
  }, [preventClose, onValidateClose])

  // Función para cerrar sin validación (cancelar/cerrar)
  const closeModal = useCallback(() => {
    if (preventClose) {
      return // Solo preventClose puede bloquear el cierre por cancelación
    }
    setIsClosing(true)
  }, [preventClose])

  const handleSave = useCallback(() => {
    if (onclick) {
      onclick()
    }
    // Solo cerrar si se puede cerrar (aplicar validación solo aquí)
    if (canCloseOnSave()) {
      setIsClosing(true)
    }
  }, [onclick, canCloseOnSave])

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel()
    }
    closeModal() // Siempre cerrar en cancelar (no aplicar validación)
  }, [onCancel, closeModal])

  // Manejar el evento animationend para detectar cuando termina la animación de cierre
  useEffect(() => {
    const content = contentRef.current

    const handleAnimationEnd = (e: AnimationEvent) => {
      if (isClosing && e.animationName === "contentHide") {
        setIsOpen(false)
        setIsClosing(false)
      }
    }

    if (content) {
      content.addEventListener("animationend", handleAnimationEnd as any)
    }

    return () => {
      if (content) {
        content.removeEventListener("animationend", handleAnimationEnd as any)
      }
    }
  }, [isClosing])

  // Manejar overflow del body y eventos de teclado
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal() // Escape siempre cierra (cancelación)
      }
    }

    if (isOpen && !isClosing) {
      document.addEventListener("keydown", handleEsc)
      document.body.style.overflow = "hidden"
    } else {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = "unset"
    }

    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, isClosing, closeModal])

  // Cerrar modal al hacer click fuera del contenido
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal() // Click fuera siempre cierra (cancelación)
    }
  }, [closeModal])

  // 🔥 MODIFICADO: Determinar si es solo icono basado en type="btn" o la ausencia del título
  const isIconOnly = type === "btn" 

  // Renderizar el contenido del botón basado en isIconOnly
  const renderButtonContent = useCallback(() => {
    if (isIconOnly) {
      return <span className="modal-trigger-icon onli-icon">{icon}</span>
    }
    
    return (
      <>
        {icon && <span className="modal-trigger-icon">{icon}</span>}
        <span>{title}</span>
      </>
    )
  }, [isIconOnly, icon, title])

  // 🔥 OPTIMIZACIÓN CRÍTICA: Renderizar contenido solo cuando sea necesario
  const renderModalContent = useCallback(() => {
    if (!lazy) {
      // Si no es lazy, renderizar children normalmente
      return typeof children === 'function' ? children() : children
    }

    // Si es lazy, solo renderizar después de la primera apertura
    if (!hasBeenOpened) {
      return null
    }

    return typeof children === 'function' ? children() : children
  }, [lazy, hasBeenOpened, children])

  // 🔥 OPTIMIZACIÓN CRÍTICA: Botón trigger siempre presente
  const triggerButton = (
    <button 
      className={`modal-trigger ${isIconOnly ? 'modal-trigger-icon-only' : ''} ${buttonClassName || ""}`} 
      onClick={openModal}
      title={isIconOnly ? (title || "Abrir modal") : undefined}
    >
      {renderButtonContent()}
    </button>
  )

  // 🔥 OPTIMIZACIÓN CRÍTICA: Solo renderizar overlay cuando esté abierto
  if (!isOpen) {
    return triggerButton
  }

  return (
    <>
      {triggerButton}

      <div className={`modal-overlay ${isClosing ? "modal-overlay-closing" : ""}`} onClick={handleOverlayClick}>
        <div ref={contentRef} className={`modal-content ${isClosing ? "modal-content-closing" : ""}`} style={{ maxWidth }}>
          <div className="modal-header">
            <h2 className="modal-title">
              {icon && <span className="modal-title-icon">{icon}</span>}
              {title || "Modal"}
            </h2>
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>
          </div>
          <div className="modal-body">
            {/* 🔥 OPTIMIZACIÓN CRÍTICA: Renderizado lazy del contenido */}
            {renderModalContent()}
          </div>
          <div className="modal-footer">
            <div className={`modal-footer-buttons ${cancel ? 'modal-footer-buttons-with-cancel' : ''}`}>
              {cancel && (
                <button className="modal-cancel-button" onClick={handleCancel}>
                  {cancelText}
                </button>
              )}
              <button className="modal-save-button" onClick={handleSave}>
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
})

export default Modal
