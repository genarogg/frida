import React from "react";

import "./btnThor.css";

interface BtnThorProps {
  onClick?: () => void;
  className?: string;
}

const BtnThor: React.FC<BtnThorProps> = ({
  onClick,
  className = " ",
}) => {

  const active = () => {
    document.getElementById("btn-hamburguer-thor")?.classList.toggle("active")
  }

  return (
    <button
      onClick={() => {
        active();
        onClick && onClick();
      }}
      className={`btn-thor ${className} `}
      id="btn-hamburguer-thor"

    >
      <span className="hamburguer">
        <span className="bar bar-1"></span>
        <span className="bar bar-2"></span>
        <span className="bar bar-3"></span>
      </span>
    </button >
  );
};

export default BtnThor;
