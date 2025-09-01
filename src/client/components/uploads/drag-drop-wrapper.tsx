"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { useUploadStore } from "../zustand"
import "./upload.css"

interface DragDropWrapperProps {
  children: React.ReactNode
  accept?: string
  className?: string
  disabled?: boolean
}

export const DragDropWrapper: React.FC<DragDropWrapperProps> = ({
  children,
  accept = "*/*",
  className = "",
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)
  const { upload, isUploading } = useUploadStore()
  const wrapperRef = useRef<HTMLDivElement>(null)

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (disabled || isUploading) return

      setDragCounter((prev) => prev + 1)

      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragOver(true)
      }
    },
    [disabled, isUploading],
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setDragCounter((prev) => {
      const newCounter = prev - 1
      if (newCounter === 0) {
        setIsDragOver(false)
      }
      return newCounter
    })
  }, [])

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (disabled || isUploading) return

      e.dataTransfer.dropEffect = "copy"
    },
    [disabled, isUploading],
  )

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      setIsDragOver(false)
      setDragCounter(0)

      if (disabled || isUploading) return

      const files = e.dataTransfer.files
      if (files && files.length > 0) {
        // Filter files by accept type if specified
        let filteredFiles = Array.from(files)

        if (accept !== "*/*") {
          const acceptTypes = accept.split(",").map((type) => type.trim())
          filteredFiles = filteredFiles.filter((file) => {
            return acceptTypes.some((acceptType) => {
              if (acceptType.startsWith(".")) {
                return file.name.toLowerCase().endsWith(acceptType.toLowerCase())
              }
              if (acceptType.includes("*")) {
                const baseType = acceptType.split("/")[0]
                return file.type.startsWith(baseType)
              }
              return file.type === acceptType
            })
          })
        }

        if (filteredFiles.length > 0) {
          const fileList = new DataTransfer()
          filteredFiles.forEach((file) => fileList.items.add(file))
          await upload(fileList.files)
        }
      }
    },
    [accept, disabled, isUploading, upload],
  )

  const isDisabled = disabled || isUploading

  return (
    <div
      ref={wrapperRef}
      className={`drag-drop-wrapper ${className}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}

      {isDragOver && !isDisabled && (
        <div className={`drag-drop-overlay ${isDragOver ? "active" : ""}`}>
          <div className="drag-drop-text">
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24" style={{ marginBottom: "12px" }}>
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <div>Suelta los archivos aquí</div>
          </div>
        </div>
      )}
    </div>
  )
}
