"use client"

import React from "react"
import "./style.css"

export interface StatusBadgeProps {

  children: React.ReactNode
  variant?: "success" | "warning" | "error" | "info" | "primary" | "secondary" | any
  customColor?: string
  width?: string | number
  className?: string
  onClick?: () => void
}

export default function StatusBadge({
  children,
  variant = "primary",
  customColor,
  width,
  className = "",
  onClick,
}: StatusBadgeProps) {
  const badgeStyle: React.CSSProperties = {
    ...(customColor && { backgroundColor: customColor }),
    ...(width && {
      width: typeof width === "number" ? `${width}px` : width,
    }),
  }

  const badgeClasses = ["status-badge", `status-badge--${variant}`, onClick ? "status-badge--clickable" : "", className]
    .filter(Boolean)
    .join(" ")

  return (
    <div
      className={badgeClasses}
      style={badgeStyle}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <span className="status-badge__text">{children}</span>
    </div>
  )
}
