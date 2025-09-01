"use client"

import type React from "react"
import { useRef, useState } from "react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../ux'
import { Upload, FileUp, FolderUp } from "lucide-react"
import { useUploadStore } from "../zustand"

interface UploadSelectButtonProps {
  className?: string
}

export function UploadSelectButton({ className = "" }: UploadSelectButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const { upload } = useUploadStore()
  const [selectValue, setSelectValue] = useState<any>("")

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFolderUpload = () => {
    folderInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      await upload(files)
    }
    // Reset input para permitir seleccionar el mismo archivo nuevamente
    if (event.target) {
      event.target.value = ""
    }
    // Reset select value después de la acción
    setSelectValue("")
  }

  const handleSelectChange = (value: string | string[]) => {
    if (typeof value === "string") {
      setSelectValue(value)

      switch (value) {
        case "file":
          handleFileUpload()
          break
        case "folder":
          handleFolderUpload()
          break
      }
    }
  }

  return (
    <>
      <Select onValueChange={handleSelectChange} width={160}>
        <SelectTrigger >
          <Upload size={16} style={{ marginRight: "10px" }} />
          <SelectValue placeholder="Subir" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="file" check={false}>
            <FileUp size={16} style={{ marginRight: "10px" }} />
            Subir Archivo
          </SelectItem>
          <SelectItem value="folder" check={false}>
            <FolderUp size={16} style={{ marginRight: "10px" }} />
            Subir Carpeta
          </SelectItem >
        </SelectContent>
      </Select>

      {/* Input oculto para archivos */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        accept="*/*"
      />

      {/* Input oculto para carpetas */}
      <input
        ref={folderInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        {...({ webkitdirectory: "" } as any)}
        accept="*/*"
      />
    </>
  )
}