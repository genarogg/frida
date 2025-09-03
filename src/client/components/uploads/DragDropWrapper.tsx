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

  // Función para procesar archivos de carpetas recursivamente
  const processDirectoryEntry = useCallback(
    async (entry: FileSystemDirectoryEntry): Promise<File[]> => {
      const files: File[] = []
      
      return new Promise((resolve) => {
        const reader = entry.createReader()
        
        const readEntries = () => {
          reader.readEntries(async (entries) => {
            if (entries.length === 0) {
              resolve(files)
              return
            }

            const promises = entries.map(async (entry) => {
              if (entry.isFile) {
                return new Promise<File>((resolveFile) => {
                  (entry as FileSystemFileEntry).file((file) => {
                    resolveFile(file)
                  })
                })
              } else if (entry.isDirectory) {
                return processDirectoryEntry(entry as FileSystemDirectoryEntry)
              }
              return []
            })

            const results = await Promise.all(promises)
            results.forEach((result) => {
              if (Array.isArray(result)) {
                files.push(...result)
              } else {
                files.push(result)
              }
            })

            readEntries() // Continuar leyendo si hay más entradas
          })
        }

        readEntries()
      })
    },
    []
  )

  // Función para procesar todos los elementos arrastrados
  const processDataTransferItems = useCallback(
    async (items: DataTransferItemList): Promise<File[]> => {
      const files: File[] = []
      const promises: Promise<File[]>[] = []

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry()
          
          if (entry) {
            if (entry.isFile) {
              // Es un archivo individual
              promises.push(
                new Promise((resolve) => {
                  (entry as FileSystemFileEntry).file((file) => {
                    resolve([file])
                  })
                })
              )
            } else if (entry.isDirectory) {
              // Es una carpeta
              promises.push(processDirectoryEntry(entry as FileSystemDirectoryEntry))
            }
          }
        }
      }

      const results = await Promise.all(promises)
      results.forEach((result) => {
        files.push(...result)
      })

      return files
    },
    [processDirectoryEntry]
  )

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

      try {
        let allFiles: File[] = []

        // Procesar elementos usando webkitGetAsEntry para manejar carpetas
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
          allFiles = await processDataTransferItems(e.dataTransfer.items)
        } else {
          // Fallback para archivos individuales si webkitGetAsEntry no está disponible
          const files = e.dataTransfer.files
          if (files && files.length > 0) {
            allFiles = Array.from(files)
          }
        }

        if (allFiles.length > 0) {
          // Filtrar archivos por tipo si se especifica
          let filteredFiles = allFiles

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
            // Crear un FileList desde los archivos filtrados
            const fileList = new DataTransfer()
            filteredFiles.forEach((file) => fileList.items.add(file))
            await upload(fileList.files)
          }
        }
      } catch (error) {
        console.error('Error procesando archivos arrastrados:', error)
      }
    },
    [accept, disabled, isUploading, upload, processDataTransferItems],
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
            <div>Suelta los archivos o carpetas aquí</div>
          </div>
        </div>
      )}
    </div>
  )
}