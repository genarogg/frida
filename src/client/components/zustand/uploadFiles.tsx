export interface UploadOptions {
  onProgress?: (progress: number) => void
  onStart?: (files: string[]) => void
  onSuccess?: (files: File[]) => void
  onError?: (error: string) => void
  onComplete?: () => void
  uploadUrl?: string
  currentPath?: string
}

export const uploadFiles = async (files: FileList, options: UploadOptions = {}): Promise<boolean> => {
  if (files.length === 0) return false

  const {
    onProgress,
    onStart,
    onSuccess,
    onError,
    onComplete,
    uploadUrl = "http://localhost:4000/upload",
    currentPath = "/",
  } = options

  const fileNames = Array.from(files).map((f) => f.name)
  onStart?.(fileNames)

  try {
    const formData = new FormData()

    Array.from(files).forEach((file) => {
      formData.append(`files`, file)

      // Obtener la ruta relativa del archivo (para carpetas) o usar solo el nombre
      const relativePath = file.webkitRelativePath || file.name

      // Concatenar la ruta actual con la ruta del archivo
      const fullPath = currentPath === "/" ? relativePath : `${currentPath}${relativePath}`

      // Enviar la ruta completa al servidor
      formData.append("filePaths", fullPath)
    })

    // Upload with progress tracking
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100)
        onProgress?.(progress)
      }
    })

    return new Promise<boolean>((resolve) => {
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          //@notification
          onSuccess?.(Array.from(files))
          resolve(true)
        } else {
          const errorMsg = "Error al subir archivos"
          //@notification
          onError?.(errorMsg)
          resolve(false)
        }
        onComplete?.()
      })

      xhr.addEventListener("error", () => {
        const errorMsg = "Error de conexión al subir archivos"
        //@notification
        onError?.(errorMsg)
        onComplete?.()
        resolve(false)
      })

      xhr.open("POST", uploadUrl)
      xhr.send(formData)
    })
  } catch (error) {
    console.error("Upload error:", error)
    const errorMsg = "Error al subir archivos"
    //@notification
    onError?.(errorMsg)
    onComplete?.()
    return false
  }
}
