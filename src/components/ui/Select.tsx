import React, { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#A0A0B8] mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`
            w-full bg-[#0F0F1A] border border-[#3A3A5C] rounded-lg
            px-4 py-3 text-white
            focus:outline-none focus:border-[#E94560] focus:ring-2 focus:ring-[#E94560]/20
            transition-all duration-200 appearance-none cursor-pointer
            ${error ? 'border-[#E94560]' : ''}
            ${className}
          `}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23A0A0B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            backgroundSize: '20px',
          }}
          {...props}
        >
          <option value="" className="bg-[#0F0F1A]">Select an option</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-[#0F0F1A]">
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-sm text-[#E94560]">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
