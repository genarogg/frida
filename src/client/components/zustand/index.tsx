import { create } from "zustand"
import { uploadFiles, type UploadOptions } from "./uploadFiles"

interface UploadState {
  // Estado
  isUploading: boolean
  progress: number
  uploadedFiles: File[]
  error: string | null
  currentPath: string

  // Acciones
  upload: (
    files: FileList,
    options?: Omit<UploadOptions, "onProgress" | "onStart" | "onSuccess" | "onError" | "onComplete">,
  ) => Promise<boolean>
  reset: () => void
  setCurrentPath: (path: string) => void
}

export const useUploadStore = create<UploadState>((set, get) => ({
  // Estado inicial
  isUploading: false,
  progress: 0,
  uploadedFiles: [],
  error: null,
  currentPath: "/",

  // Función de upload
  upload: async (files: FileList, options = {}) => {
    set({ isUploading: true, progress: 0, error: null, uploadedFiles: [] })

    const { currentPath } = get()

    const uploadOptions: UploadOptions = {
      ...options,
      currentPath,
      onStart: (fileNames) => {
        console.log("Iniciando subida de archivos:", fileNames)
      },
      onProgress: (progress) => {
        set({ progress })
      },
      onSuccess: (files) => {
        set({ uploadedFiles: files })
      },
      onError: (error) => {
        set({ error })
      },
      onComplete: () => {
        set({ isUploading: false })
      },
    }

    return await uploadFiles(files, uploadOptions)
  },

  // Reset del estado
  reset: () => {
    set({
      isUploading: false,
      progress: 0,
      uploadedFiles: [],
      error: null,
    })
  },

  setCurrentPath: (path: string) => {
    // Asegurar que la ruta siempre termine con / si no es la raíz
    const normalizedPath = path === "/" ? "/" : path.endsWith("/") ? path : `${path}/`
    set({ currentPath: normalizedPath })
  },
}))
