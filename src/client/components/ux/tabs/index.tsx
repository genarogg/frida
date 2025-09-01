"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import "./tabs.css"

interface TabItem {
    titulo: string
    componente: React.ReactNode
}

interface TabsProps {
    tabs: TabItem[]
    defaultTab?: number
    className?: string
}

const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab = 0, className = "" }) => {
    const [activeTab, setActiveTab] = useState(defaultTab)
    const [backgroundStyle, setBackgroundStyle] = useState({ width: 0, left: 0 })
    const [scrollIndicators, setScrollIndicators] = useState({ left: false, right: false })
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
    const headerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        updateBackground()
        updateScrollIndicators()
    }, [activeTab])

    useEffect(() => {
        // Actualizar el fondo cuando el componente se monta
        const timer = setTimeout(() => {
            updateBackground()
            updateScrollIndicators()
        }, 100)
        return () => clearTimeout(timer)
    }, [])

    const updateBackground = () => {
        const activeTabElement = tabRefs.current[activeTab]
        if (activeTabElement) {
            setBackgroundStyle({
                width: activeTabElement.offsetWidth,
                left: activeTabElement.offsetLeft,
            })
        }
    }

    const updateScrollIndicators = () => {
        const headerElement = headerRef.current
        if (headerElement) {
            const { scrollLeft, scrollWidth, clientWidth } = headerElement

            setScrollIndicators({
                left: scrollLeft > 0,
                right: scrollLeft < scrollWidth - clientWidth - 1,
            })
        }
    }

    const handleTabClick = (index: number) => {
        setActiveTab(index)

        // Scroll al tab activo en pantallas pequeñas
        const activeTabElement = tabRefs.current[index]
        const headerElement = headerRef.current

        if (activeTabElement && headerElement && window.innerWidth <= 400) {
            const tabLeft = activeTabElement.offsetLeft
            const tabWidth = activeTabElement.offsetWidth
            const headerWidth = headerElement.offsetWidth
            const scrollLeft = tabLeft - headerWidth / 2 + tabWidth / 2

            headerElement.scrollTo({
                left: scrollLeft,
                behavior: "smooth",
            })
        }
    }

    const handleScroll = () => {
        updateScrollIndicators()
    }

    // Manejar redimensionamiento de ventana
    useEffect(() => {
        const handleResize = () => {
            updateBackground()
            updateScrollIndicators()
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [activeTab])

    return (
        <div className={`tabs-container ${className}`}>
            <div className="tabs-wrapper">
                <div className="tabs-header" ref={headerRef} onScroll={handleScroll}>
                    {/* Fondo animado que se mueve entre pestañas */}
                    <motion.div
                        className="tab-background"
                        animate={{
                            width: backgroundStyle.width,
                            left: backgroundStyle.left,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                            mass: 0.8,
                        }}
                    />

                    {tabs.map((tab, index) => (
                        <button
                            key={index}
                            ref={(el: any) => (tabRefs.current[index] = el)}
                            className={`tab-button ${activeTab === index ? "active" : ""}`}
                            onClick={() => handleTabClick(index)}
                            title={tab.titulo} // Tooltip para pantallas muy pequeñas
                        >
                            {tab.titulo}
                        </button>
                    ))}
                </div>

                {/* Indicadores de scroll */}
                <div className={`scroll-indicator scroll-indicator-left ${scrollIndicators.left ? "" : "hidden"}`}>
                    <div className="scroll-arrow scroll-arrow-left">‹</div>
                </div>
                <div className={`scroll-indicator scroll-indicator-right ${scrollIndicators.right ? "" : "hidden"}`}>
                    <div className="scroll-arrow scroll-arrow-right">›</div>
                </div>
            </div>

            <div className="tab-content">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        className="tab-panel"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{
                            duration: 0.2,
                            ease: [0.4, 0.0, 0.2, 1],
                        }}
                    >
                        {tabs[activeTab]?.componente}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}

export default Tabs
