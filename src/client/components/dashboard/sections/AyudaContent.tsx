"use client"
import { useState } from "react"
import type { JSX } from "react/jsx-runtime" // Import JSX to fix the undeclared variable error

interface FileNode {
  name: string
  type: "file" | "folder"
  path: string
  relativePath: string
  size?: number
  mimetype?: string
  lastModified?: Date
  children?: FileNode[]
}

interface FolderStructureResponse {
  success: boolean
  message: string
  folderName: string
  structure: FileNode
  totalFiles: number
  totalSize: number
}

export default function AyudaContent() {
  const [fileStructure, setFileStructure] = useState<FolderStructureResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFileStructure = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("http://localhost:4000/get-files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      })
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      const data: FolderStructureResponse = await response.json()
      setFileStructure(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener archivos")
    } finally {
      setLoading(false)
    }
  }

  const renderFileNode = (node: FileNode, level = 0): JSX.Element => {
    const indent = level * 20

    if (node.type === "folder") {
      return (
        <div key={node.path} style={{ marginLeft: `${indent}px` }}>
          <div style={{ fontWeight: "bold", color: "#007bff", marginBottom: "4px" }}>📁 {node.name}</div>
          {node.children?.map((child) => renderFileNode(child, level + 1))}
        </div>
      )
    } else {
      const sizeInKB = node.size ? (node.size / 1024).toFixed(2) : "0"
      return (
        <div key={node.path} style={{ marginLeft: `${indent}px`, marginBottom: "2px" }}>
          <span style={{ color: "#6c757d" }}>
            📄 {node.name} ({sizeInKB} KB)
          </span>
        </div>
      )
    }
  }

  return (
    <div className="main-content">
      <h1>Centro de Ayuda</h1>
      <p>Encuentra respuestas a tus preguntas y obtén soporte técnico.</p>
      <div className="help-sections">
        <div className="help-card">
          <h3>❓ Preguntas Frecuentes</h3>
          <ul>
            <li>¿Cómo cambio mi contraseña?</li>
            <li>¿Cómo genero un reporte?</li>
            <li>¿Cómo agrego nuevos usuarios?</li>
          </ul>
        </div>
        <div className="help-card">
          <h3>📞 Contacto</h3>
          <p>Email: soporte@dashboard.com</p>
          <p>Teléfono: +1 234 567 8900</p>
          <p>Horario: Lun-Vie 9:00-18:00</p>
        </div>
        <div className="help-card">
          <h3>📚 Documentación</h3>
          <p>Accede a la documentación completa y guías de usuario.</p>
          <button className="help-btn">Ver Documentación</button>
        </div>

        <div className="help-card">
          <h3>📁 Estructura de Archivos</h3>
          <p>Visualiza la estructura completa de archivos del sistema.</p>
          <button className="help-btn" onClick={fetchFileStructure} disabled={loading}>
            {loading ? "Cargando..." : "Obtener Estructura"}
          </button>

          {error && (
            <div
              style={{
                color: "red",
                marginTop: "10px",
                padding: "10px",
                backgroundColor: "#ffe6e6",
                borderRadius: "4px",
              }}
            >
              Error: {error}
            </div>
          )}

          {fileStructure && (
            <div style={{ marginTop: "15px" }}>
              <div style={{ marginBottom: "10px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
                <strong>Carpeta:</strong> {fileStructure.folderName}
                <br />
                <strong>Total de archivos:</strong> {fileStructure.totalFiles}
                <br />
                <strong>Tamaño total:</strong> {(fileStructure.totalSize / 1024 / 1024).toFixed(2)} MB
              </div>
              <div
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  border: "1px solid #dee2e6",
                  padding: "10px",
                  borderRadius: "4px",
                  backgroundColor: "#ffffff",
                }}
              >
                {renderFileNode(fileStructure.structure)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
