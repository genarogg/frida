"use client"
import { BtnLoki, Button } from "../ux"
import { UploadSelectButton } from "../uploads"

interface DashboardHeaderProps {
  onToggleSidebar: () => void
}

export default function DashboardHeader({ onToggleSidebar }: DashboardHeaderProps) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <BtnLoki onClick={onToggleSidebar} className="mobile-menu-btn" />
          <h1>Panel de Control</h1>
        </div>
        <div className="header-actions">
          <UploadSelectButton />
          <button className="notification-btn">🔔</button>
          <div className="user-profile">
            <span>Usuario</span>
            <div className="avatar">U</div>
          </div>
        </div>
      </div>
    </header>
  )
}
