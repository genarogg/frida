"use client";
import React from 'react';

interface IconProps {
    icon?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

const Icon: React.FC<IconProps> = ({ icon, className = " ", style }) => {
    return <i className={`icon ${className}`} style={style}>{icon}</i>;
};

export default Icon;
