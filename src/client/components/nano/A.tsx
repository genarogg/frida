"use client";
import React from 'react';
import { Link } from 'react-router-dom';

interface AProps {
  href: string;
  type?: "btn" | "mailto" | "a" | "push";
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const A: React.FC<AProps> = ({ href, type, children, className = " ", onClick, style }) => {

  switch (type) {
    case undefined:
      return (
        <Link to={href} className={className} style={style}>
          {children}
        </Link>
      );
    case "btn":
      return (
        <Link to={href} className={className} style={style} role="button" onClick={onClick}>
          {children}
        </Link>
      );
    case "a":
      return (
        <a href={href} target="_blank" rel="noreferrer" className={className} style={style}>
          {children}
        </a>
      );
    default:
      return null;
  }
};

export default A;