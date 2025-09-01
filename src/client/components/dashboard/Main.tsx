"use client"
import type React from "react"
import ContentRenderer from "./sections"

interface DashboardContentProps {
  activePage: string
  children?: React.ReactNode
}

export default function DashboardContent({ activePage, children }: DashboardContentProps) {
  return <ContentRenderer activePage={activePage} children={children} />
}
