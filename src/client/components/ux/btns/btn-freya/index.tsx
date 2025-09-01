import React from 'react'
import "./btnFreya.css"


interface BtnFreyaProps {
    onClick?: () => void;
    className?: string;
}

const BtnFreya: React.FC<BtnFreyaProps> = ({
    onClick,
    className = "",
}) => {

    const active = () => {
        
        document.getElementById("btn-hamburguer-freya")?.classList.toggle("active");
    }

    return (
        <button
            onClick={() => {
                active();
                onClick && onClick();
            }}
            className={`btn-freya ${className}`}
            id="btn-hamburguer-freya"
        >
            <span></span>
        </button>
    );
};

export default BtnFreya;
