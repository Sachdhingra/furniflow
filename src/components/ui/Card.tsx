import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export default function Card({ children, className = '', hover = false, onClick, style }: CardProps) {
  return (
    <div 
      className={`
        bg-[#1E1E32] border border-[#3A3A5C] rounded-xl p-6
        shadow-[0_4px_24px_rgba(0,0,0,0.4)]
        ${hover ? 'hover:border-[#E94560] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-200 cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-lg font-semibold text-white ${className}`}>
      {children}
    </h3>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
