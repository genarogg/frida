"use client"
import { ReactNode, MouseEventHandler, ButtonHTMLAttributes, AnchorHTMLAttributes, useState } from "react"
import "./buttons.css"

type ButtonProps = {
  children?: ReactNode
  icon?: ReactNode
  iconOnly?: boolean
  size?: "normal" | "small" | "large"
  dropdown?: boolean
  disabled?: boolean
  loading?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
  className?: string
} & ButtonHTMLAttributes<HTMLButtonElement>

const Button = ({
  children,
  icon,
  iconOnly = false,
  size = "normal",
  dropdown = false,
  disabled = false,
  loading = false,
  onClick,
  className = "",
  ...props
}: ButtonProps) => {
  const baseClass = "btn"
  const sizeClass = size !== "normal" ? `btn--${size}` : ""
  const iconOnlyClass = iconOnly ? "btn--icon-only" : ""
  const dropdownClass = dropdown ? "btn--dropdown" : ""
  const loadingClass = loading ? "btn--loading" : ""

  const classes = [baseClass, sizeClass, iconOnlyClass, dropdownClass, loadingClass, className]
    .filter(Boolean)
    .join(" ")

  return (
    <button className={classes} disabled={disabled || loading} onClick={onClick} {...props}>
      {icon && <span className="btn__icon">{icon}</span>}
      {!iconOnly && children}
    </button>
  )
}

type TooltipWrapperProps = {
  children: ReactNode
  tooltip?: ReactNode
}

const TooltipWrapper = ({ children, tooltip }: TooltipWrapperProps) => {
  return (
    <div className="tooltip-wrapper">
      {children}
      {tooltip && <div className="tooltip">{tooltip}</div>}
    </div>
  )
}

type DropdownProps = {
  trigger: ReactNode
  children: ReactNode
  className?: string
  triggerType?: "hover" | "click"
}

const Dropdown = ({ trigger, children, className = "", triggerType = "hover" }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleClick = () => {
    if (triggerType === "click") {
      setIsOpen(!isOpen)
    }
  }

  const handleMouseEnter = () => {
    if (triggerType === "hover") {
      setIsOpen(true)
    }
  }

  const handleMouseLeave = () => {
    if (triggerType === "hover") {
      setIsOpen(false)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (triggerType === "click" && !e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsOpen(false)
    }
  }

  const dropdownClass = `dropdown ${className} ${isOpen ? "dropdown--open" : ""} dropdown--${triggerType}`

  return (
    <div
      className={dropdownClass}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onBlur={handleBlur}
      tabIndex={triggerType === "click" ? 0 : -1}
    >
      {trigger}
      <div className="dropdown__menu">{children}</div>
    </div>
  )
}

type DropdownItemProps = {
  children: ReactNode
  icon?: ReactNode
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>
  href?: string
} & ButtonHTMLAttributes<HTMLButtonElement> & AnchorHTMLAttributes<HTMLAnchorElement>

const DropdownItem = ({ children, icon, onClick, href, ...props }: DropdownItemProps) => {
  const Component: any = href ? "a" : "button"

  return (
    <Component className="dropdown__item" onClick={onClick} href={href} {...props}>
      {icon && <span className="btn__icon">{icon}</span>}
      {children}
    </Component>
  )
}

export { Button, TooltipWrapper, Dropdown, DropdownItem }