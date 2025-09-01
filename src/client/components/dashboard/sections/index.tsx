"use client"
import type React from "react"
import InicioContent from "./InicioContent"
//import EstadisticasContent from "./EstadisticasContent"
import UsuariosContent from "./UsuariosContent"
import ReportesContent from "./ReportesContent"
import ConfiguracionContent from "./ConfiguracionContent"
import AyudaContent from "./AyudaContent"

interface ContentRendererProps {
  activePage: string
  children?: React.ReactNode
}

export default function ContentRenderer({ activePage, children }: ContentRendererProps) {
  const renderContent = () => {
    switch (activePage) {
      case "inicio":
        return <InicioContent />
      case "estadisticas":
        return <InicioContent />
      case "usuarios":
        return <UsuariosContent />
      case "reportes":
        return <ReportesContent />
      case "configuracion":
        return <ConfiguracionContent />
      case "ayuda":
        return <AyudaContent />
      default:
        return children
    }
  }

  return renderContent()
}
