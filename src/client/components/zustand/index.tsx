import { create } from 'zustand'
import { uploadFiles, UploadOptions } from './uploadFiles'

interface UploadState {
  // Estado
  isUploading: boolean
  progress: number
  uploadedFiles: File[]
  error: string | null
  
  // Acciones
  upload: (files: FileList, options?: Omit<UploadOptions, 'onProgress' | 'onStart' | 'onSuccess' | 'onError' | 'onComplete'>) => Promise<boolean>
  reset: () => void
}

export const useUploadStore = create<UploadState>((set, get) => ({
  // Estado inicial
  isUploading: false,
  progress: 0,
  uploadedFiles: [],
  error: null,

  // Función de upload
  upload: async (files: FileList, options = {}) => {
    set({ isUploading: true, progress: 0, error: null, uploadedFiles: [] })

    const uploadOptions: UploadOptions = {
      ...options,
      onStart: (fileNames) => {
        console.log('Iniciando subida de archivos:', fileNames)
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
      }
    }

    return await uploadFiles(files, uploadOptions)
  },

  // Reset del estado
  reset: () => {
    set({
      isUploading: false,
      progress: 0,
      uploadedFiles: [],
      error: null
    })
  }
}))