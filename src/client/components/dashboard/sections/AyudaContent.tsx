"use client"
import { useState, useEffect } from "react"
import {
  Folder,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  Archive,
  AlertCircle,
  Loader2,
} from "lucide-react"
import type { JSX } from "react/jsx-runtime"

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFileStructure()
  }, [])

  const fetchFileStructure = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("http://localhost:4000/get-files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
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

  const getFileIcon = (node: FileNode) => {
    if (node.type === "folder") {
      return <Folder className="w-4 h-4 text-blue-500" />
    }

    const extension = node.name.split(".").pop()?.toLowerCase()
    const mimetype = node.mimetype?.toLowerCase()

    if (mimetype?.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension || "")) {
      return <FileImage className="w-4 h-4 text-green-500" />
    }
    if (mimetype?.startsWith("video/") || ["mp4", "avi", "mov", "wmv", "flv", "webm"].includes(extension || "")) {
      return <FileVideo className="w-4 h-4 text-purple-500" />
    }
    if (mimetype?.startsWith("audio/") || ["mp3", "wav", "flac", "aac", "ogg"].includes(extension || "")) {
      return <FileAudio className="w-4 h-4 text-orange-500" />
    }
    if (
      ["js", "ts", "jsx", "tsx", "html", "css", "json", "xml", "py", "java", "cpp", "c", "php"].includes(
        extension || "",
      )
    ) {
      return <FileCode className="w-4 h-4 text-indigo-500" />
    }
    if (["zip", "rar", "7z", "tar", "gz"].includes(extension || "")) {
      return <Archive className="w-4 h-4 text-yellow-500" />
    }
    if (["txt", "md", "doc", "docx", "pdf"].includes(extension || "")) {
      return <FileText className="w-4 h-4 text-gray-500" />
    }

    return <File className="w-4 h-4 text-gray-400" />
  }

  const renderFileNode = (node: FileNode, level = 0): JSX.Element => {
    const indent = level * 20

    return (
      <div key={node.path} style={{ marginLeft: `${indent}px` }} className="mb-1">
        <div className="flex items-center gap-2">
          {getFileIcon(node)}
          <span className={node.type === "folder" ? "font-semibold text-blue-600" : "text-gray-700"}>{node.name}</span>
          {node.type === "file" && node.size && (
            <span className="text-xs text-gray-500">({(node.size / 1024).toFixed(2)} KB)</span>
          )}
        </div>
        {node.children?.map((child) => renderFileNode(child, level + 1))}
      </div>
    )
  }

  return (
    <div className="main-content">
      <div className="flex items-center gap-2 mb-4">
        <Folder className="w-6 h-6 text-blue-500" />
        <h1 className="text-2xl font-bold">Estructura de Archivos</h1>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Cargando estructura de archivos...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>Error: {error}</span>
          <button
            onClick={fetchFileStructure}
            className="ml-auto px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm"
          >
            Reintentar
          </button>
        </div>
      )}

      {fileStructure && (
        <div>
          <div className="bg-gray-50 p-4 rounded-lg mb-4 border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-semibold">Carpeta:</span> {fileStructure.folderName}
              </div>
              <div>
                <span className="font-semibold">Total archivos:</span> {fileStructure.totalFiles}
              </div>
              <div>
                <span className="font-semibold">Tamaño total:</span>{" "}
                {(fileStructure.totalSize / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
            {renderFileNode(fileStructure.structure)}
          </div>
        </div>
      )}
    </div>
  )
}
