import React from "react";
import "./btnExpancion.css";

interface BtnExpansionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const BtnExpansion: React.FC<BtnExpansionProps> = ({ children, className = "", ...props }) => {
  const expansion = (
    e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>
  ) => {
    const button = e.currentTarget as HTMLButtonElement;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    let x, y;

    if (e.type === "mousedown") {
      const mouseEvent = e as React.MouseEvent<HTMLButtonElement>;
      x = mouseEvent.clientX - rect.left - size / 2;
      y = mouseEvent.clientY - rect.top - size / 2;
    } else {
      const touchEvent = e as React.TouchEvent<HTMLButtonElement>;
      x = touchEvent.touches[0].clientX - rect.left - size / 2;
      y = touchEvent.touches[0].clientY - rect.top - size / 2;
    }

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.className = "ripple";

    button.appendChild(ripple);
    button.classList.add("ripple-active");

    setTimeout(() => {
      ripple.remove();
      button.classList.remove("ripple-active");
    }, 2000);
  };

  return (
    <button className={`btn-expancion ${className}`} onMouseDown={expansion} onTouchStart={expansion} {...props}>
      {children}
    </button>
  );
};

export default BtnExpansion;
