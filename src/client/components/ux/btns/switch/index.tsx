"use client"

import "./toggle-button-1.css"

interface ToggleButton1Props {
    isOn: boolean
    onToggle: () => void
}

export default function ToggleButton({ isOn, onToggle }: ToggleButton1Props) {
    return (
        <button
            className={`toggle-btn-1 ${isOn ? "toggle-btn-1--on" : "toggle-btn-1--off"}`}
            onClick={onToggle}
            aria-label={`Toggle switch ${isOn ? "on" : "off"}`}
        >
            <div className="toggle-btn-1__circle"></div>
        </button>
    )
}
