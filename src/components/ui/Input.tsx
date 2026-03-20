import React, { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#A0A0B8] mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0B8]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full bg-[#0F0F1A] border border-[#3A3A5C] rounded-lg
              px-4 py-3 text-white placeholder-[#6B6B80]
              focus:outline-none focus:border-[#E94560] focus:ring-2 focus:ring-[#E94560]/20
              transition-all duration-200
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-[#E94560]' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-[#E94560]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
