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
            className="block text-xs font-semibold text-[#202124] dark:text-[#FAF8F2] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative rounded-xl shadow-xs">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#77746B] dark:text-[#A99F87]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={clsx(
              'block w-full rounded-xl text-sm bg-[#FFFDF5] dark:bg-[#17181A] border transition-all duration-150',
              'text-[#202124] dark:text-[#FAF8F2] placeholder-[#77746B]/70 dark:placeholder-[#A99F87]/60',
              'focus:outline-none focus:ring-2 focus:ring-[#FFE89A] focus:border-[#FFE89A] dark:focus:ring-[#FFE89A] dark:focus:border-[#FFE89A]',
              leftIcon ? 'pl-10' : 'pl-3.5',
              rightIcon ? 'pr-10' : 'pr-3.5',
              'py-2.5',
              error
                ? 'border-[#C94B4B] dark:border-[#C94B4B] focus:ring-[#C94B4B]'
                : 'border-[#E9E1CC] dark:border-[#303238]',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#77746B] dark:text-[#A99F87]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-[#C94B4B] dark:text-[#F87171] font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
