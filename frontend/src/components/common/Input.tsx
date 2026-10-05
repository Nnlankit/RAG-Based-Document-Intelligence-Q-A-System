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
            className="block text-xs font-medium text-[#5A4634] dark:text-[#E5D5BA] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8B6F52] dark:text-[#B9A995]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={clsx(
              'block w-full rounded-lg text-sm bg-[#F7F0E3] dark:bg-[#2B231D] border transition-all duration-150',
              'text-[#30261E] dark:text-[#F4EBDD] placeholder-[#6B5C4D]/80 dark:placeholder-[#B9A995]/80',
              'focus:outline-none focus:ring-2 focus:ring-[#8B6F52] focus:border-[#8B6F52] dark:focus:ring-[#CDB795] dark:focus:border-[#CDB795]',
              leftIcon ? 'pl-9' : 'pl-3.5',
              rightIcon ? 'pr-9' : 'pr-3.5',
              'py-2',
              error
                ? 'border-[#A65D50] dark:border-[#C57466] focus:ring-[#A65D50]'
                : 'border-[#D4C3A5] dark:border-[#554638]',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8B6F52] dark:text-[#B9A995]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-[#A65D50] dark:text-[#C57466]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
