import React from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[#17152B] dark:text-[#E2DCF0] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative rounded-xl shadow-xs">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#77738A] dark:text-[#A39EB8]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={clsx(
              'block w-full rounded-xl text-sm bg-white dark:bg-[#1A132C] border transition-all duration-150',
              'text-[#17152B] dark:text-[#F5F3FF] placeholder-[#77738A]/70 dark:placeholder-[#A39EB8]/60',
              'focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] dark:focus:ring-[#8B5CF6] dark:focus:border-[#8B5CF6]',
              leftIcon ? 'pl-10' : 'pl-3.5',
              rightIcon ? 'pr-10' : 'pr-3.5',
              'py-2.5',
              error
                ? 'border-[#DC2626] dark:border-[#EF4444] focus:ring-[#DC2626]'
                : 'border-[#E8E1F2] dark:border-[#352B52]',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#77738A] dark:text-[#A39EB8]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-[#DC2626] dark:text-[#EF4444] font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
