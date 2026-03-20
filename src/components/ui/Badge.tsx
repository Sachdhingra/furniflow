import React, { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'info' | 'success' | 'warning' | 'danger' | 'accent';
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  const variants = {
    default: 'bg-[#2A2A44] text-white',
    info: 'bg-[#4DA8DA]/20 text-[#4DA8DA] border border-[#4DA8DA]/30',
    success: 'bg-[#00D9A5]/20 text-[#00D9A5] border border-[#00D9A5]/30',
    warning: 'bg-[#FFB830]/20 text-[#FFB830] border border-[#FFB830]/30',
    danger: 'bg-[#E94560]/20 text-[#E94560] border border-[#E94560]/30',
    accent: 'bg-gradient-to-r from-[#E94560] to-[#FF6B6B] text-white',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
