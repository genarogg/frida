"use client"
import type React from "react"
import { useState, useEffect } from "react"
import "./dashboard-layout.css"
import DashboardHeader from "./sections/DashboardHeader"
import DashboardSidebar from "./sections/DashboardSidebar"
import DashboardContent from "./sections/DashboardContent"

interface DashboardLayoutProps {
  children?: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [activePage, setActivePage] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("dashboard-active-page") || "inicio"
    }
    return "inicio"
  })
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem("dashboard-active-page", activePage)
  }, [activePage])

  const handlePageChange = (page: string) => {
    if (page === activePage) return

    setIsTransitioning(true)
    setIsSidebarOpen(false)
    setTimeout(() => {
      setActivePage(page)
      setIsTransitioning(false)
    }, 150)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="dashboard-container">
      <DashboardSidebar
        isOpen={isSidebarOpen}
        activePage={activePage}
        onPageChange={handlePageChange}
        onToggle={toggleSidebar}
      />

      <div className="main-container">
        <DashboardHeader onToggleSidebar={toggleSidebar} />

        <main className={`content ${isTransitioning ? "fade-out" : "fade-in"}`}>
          <DashboardContent activePage={activePage}>{children}</DashboardContent>
        </main>
      </div>
    </div>
  )
}
