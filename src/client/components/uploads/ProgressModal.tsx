"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useUploadStore } from "../zustand"
import "./upload.css"

export const ProgressModal: React.FC = () => {
  const { isUploading, progress, error, uploadedFiles, reset } = useUploadStore()
  const [isVisible, setIsVisible] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (isUploading) {
      setIsVisible(true)
      setShowSuccess(false)
    } else if (uploadedFiles.length > 0 && !error) {
      setShowSuccess(true)
      // Auto-hide success message after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
        setShowSuccess(false)
        reset()
      }, 3000)
      return () => clearTimeout(timer)
    } else if (error) {
      // Keep modal open on error until user closes it
      setShowSuccess(false)
    } else {
      setIsVisible(false)
      setShowSuccess(false)
    }
  }, [isUploading, uploadedFiles, error, reset])

  const handleClose = () => {
    setIsVisible(false)
    setShowSuccess(false)
    reset()
  }

  if (!isVisible) return null

  return (
    <div className={`progress-modal ${isVisible ? "visible" : ""}`}>
      <div className="progress-modal-header">
        <h3 className="progress-modal-title">
          {isUploading ? "Subiendo archivos..." : showSuccess ? "Subida completada" : "Error en la subida"}
        </h3>
        <button className="progress-modal-close" onClick={handleClose} type="button">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>

      <div className="progress-modal-body">
        {isUploading && (
          <div className="progress-bar-container">
            <div className="progress-bar-label">
              <span>Progreso</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-status">Subiendo archivos...</div>
          </div>
        )}

        {error && (
          <div className="progress-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {showSuccess && uploadedFiles.length > 0 && (
          <div className="progress-success">
            <strong>¡Éxito!</strong> Se subieron {uploadedFiles.length} archivo(s) correctamente.
          </div>
        )}
      </div>
    </div>
  )
}
