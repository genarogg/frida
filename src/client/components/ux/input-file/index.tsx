"use client"

import type React from "react"
import { useState } from "react"
import { Upload, FileText, X, Eye, CheckCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface InputFileProps {
  name: string
  value?: File | null
  onChange: (file: File | null) => void
  accept?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  maxSize?: string
  label?: string
  icon?: React.ReactNode
}

const InputFile: React.FC<InputFileProps> = ({
  name,
  value = null,
  onChange,
  accept = ".pdf,.jpg,.jpeg,.png,.gif,.webp",
  placeholder = "Haz clic para seleccionar un archivo",
  required = false,
  disabled = false,
  maxSize = "Máximo 10MB",
  label,
  icon = <FileText size={16} />,
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const isImage = (file: File) => {
    return file.type.startsWith("image/")
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    // Si no se seleccionó ningún archivo (canceló la selección), mantener el archivo actual
    if (!file) {
      return
    }

    setIsUploading(true)

    // Simular tiempo de carga
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (isImage(file)) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }

    setIsUploading(false)
    onChange(file)
  }

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
    setImagePreview(null)
  }

  const hasFile = !!value
  const displayName = value?.name || placeholder

  return (
    <>
      <div>
        {label && (
          <label
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            {icon && <span style={{ marginRight: "8px" }}>{icon}</span>}
            {label}
            {required && <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>}
          </label>
        )}

        <motion.div
          style={{
            position: "relative",
            border: `2px dashed ${hasFile ? "#10b981" : "#d1d5db"}`,
            borderRadius: "8px",
            padding: hasFile && imagePreview ? "8px" : "16px",
            textAlign: "center",
            backgroundColor: hasFile ? "#f0fdf4" : "#f9fafb",
            transition: "all 0.3s ease",
            cursor: disabled ? "not-allowed" : "pointer",
            overflow: "hidden",
            opacity: disabled ? 0.6 : 1,
            minHeight: hasFile && imagePreview ? "120px" : "80px",
          }}
          whileHover={!disabled ? { scale: 1.02 } : {}}
          whileTap={!disabled ? { scale: 0.98 } : {}}
        >
          <input
            name={name}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={disabled}
            required={required}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: 0,
              cursor: disabled ? "not-allowed" : "pointer",
              zIndex: 1,
            }}
          />

          {/* Botón de eliminar */}
          <AnimatePresence>
            {hasFile && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleRemoveFile}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 2,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={12} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Botón para ver imagen completa */}
          <AnimatePresence>
            {hasFile && imagePreview && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={(e) => {
                  e.stopPropagation()
                  setShowImageModal(true)
                }}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "40px",
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 2,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Eye size={12} />
              </motion.button>
            )}
          </AnimatePresence>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              position: "relative",
              zIndex: 0,
            }}
          >
            <AnimatePresence mode="wait">
              {isUploading ? (
                <motion.div
                  key="uploading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <Upload size={24} style={{ color: "#3b82f6" }} />
                  </motion.div>
                  <div style={{ fontSize: "14px", color: "#3b82f6", fontWeight: "500" }}>Subiendo archivo...</div>
                </motion.div>
              ) : hasFile ? (
                <motion.div
                  key="uploaded"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                  }}
                >
                  {imagePreview ? (
                    <motion.img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "4px",
                        border: "1px solid #e5e7eb",
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    />
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <CheckCircle size={24} style={{ color: "#10b981" }} />
                    </motion.div>
                  )}
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#374151",
                      fontWeight: "500",
                      textAlign: "center",
                      wordBreak: "break-word",
                      maxWidth: "100%",
                    }}
                  >
                    {displayName}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Upload size={24} style={{ color: "#6b7280" }} />
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      fontWeight: "normal",
                    }}
                  >
                    {displayName}
                  </div>
                  {maxSize && <div style={{ fontSize: "12px", color: "#9ca3af" }}>{maxSize}</div>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Modal para ver imagen completa */}
      <AnimatePresence>
        {showImageModal && imagePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImageModal(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px",
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "relative",
                maxWidth: "90vw",
                maxHeight: "90vh",
                backgroundColor: "white",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
            >
              <button
                onClick={() => setShowImageModal(false)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "rgba(0, 0, 0, 0.5)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 1001,
                }}
              >
                <X size={16} />
              </button>
              <img
                src={imagePreview || "/placeholder.svg"}
                alt="Vista completa"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default InputFile
