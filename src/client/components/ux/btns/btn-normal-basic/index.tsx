import React from 'react'
import "./btnNormalBasic.css"

interface BtnNormalBasicProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    id?: string;
}

const BtnNormalBasic: React.FC<BtnNormalBasicProps> = ({
    children,
    onClick,
    className = "",
    id="",
}) => {
    return (
        <div className={`btn-normal-basic ${className}`} id={id}>
            <button onClick={onClick}>{children}</button>
        </div>
    );
};

export default BtnNormalBasic;
