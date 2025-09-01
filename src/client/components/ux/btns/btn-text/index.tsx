import React from 'react'
import "./btnText.css"

interface BtnTextProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}

const BtnText: React.FC<BtnTextProps> = ({ children, onClick, className }) => {
  return (
    <div className={`btn-text ${className}`} onClick={onClick}>
      <button type="button" onClick={onClick}>
        <span>{children}</span>
      </button>
    </div>
  );
};

export default BtnText;
