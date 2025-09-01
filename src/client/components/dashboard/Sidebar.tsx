"use client"
import { useState } from "react"

interface DashboardSidebarProps {
  isOpen: boolean
  activePage: string
  onPageChange: (page: string) => void
  onToggle: () => void
}

export default function DashboardSidebar({ isOpen, activePage, onPageChange, onToggle }: DashboardSidebarProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const navigationItems = [
    {
      id: "inicio",
      label: "Inicio",
      subsections: [
        { id: "inicio-dashboard", label: "Dashboard" },
        { id: "inicio-resumen", label: "Resumen" },
        { id: "inicio-actividad", label: "Actividad Reciente" },
      ],
    },
    {
      id: "estadisticas",
      label: "Estadísticas",
      subsections: [
        { id: "estadisticas-ventas", label: "Ventas" },
        { id: "estadisticas-usuarios", label: "Usuarios" },
        { id: "estadisticas-trafico", label: "Tráfico" },
      ],
    },
    {
      id: "usuarios",
      label: "Usuarios",
      subsections: [
        { id: "usuarios-lista", label: "Lista de Usuarios" },
        { id: "usuarios-roles", label: "Roles y Permisos" },
        { id: "usuarios-nuevo", label: "Nuevo Usuario" },
      ],
    },
    { id: "reportes", label: "Reportes" }, // No subsections
    { id: "configuracion", label: "Configuración" }, // No subsections
    { id: "ayuda", label: "Ayuda" }, // No subsections
  ]

  const handleSectionClick = (item: any) => {
    if (item.subsections) {
      // If section has subsections, toggle expansion
      if (expandedSection === item.id) {
        setExpandedSection(null)
      } else {
        setExpandedSection(item.id)
      }
    } else {
      // If no subsections, navigate directly
      onPageChange(item.id)
    }
  }

  const handleSubsectionClick = (subsectionId: string) => {
    onPageChange(subsectionId)
  }

  return (
    <>
      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <h2>Dashboard</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {navigationItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleSectionClick(item)}
                  className={`nav-item ${activePage === item.id || (item.subsections && item.subsections.some((sub) => activePage === sub.id)) ? "active" : ""} ${item.subsections ? "has-subsections" : ""}`}
                >
                  <span className="nav-item-content">
                    {item.label}
                    {item.subsections && (
                      <span className={`nav-arrow ${expandedSection === item.id ? "expanded" : ""}`}>▼</span>
                    )}
                  </span>
                </button>

                {item.subsections && (
                  <ul className={`subsections ${expandedSection === item.id ? "expanded" : ""}`}>
                    {item.subsections.map((subsection) => (
                      <li key={subsection.id}>
                        <button
                          onClick={() => handleSubsectionClick(subsection.id)}
                          className={`nav-subsection ${activePage === subsection.id ? "active" : ""}`}
                        >
                          {subsection.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {isOpen && <div className="sidebar-overlay" onClick={onToggle}></div>}
    </>
  )
}
