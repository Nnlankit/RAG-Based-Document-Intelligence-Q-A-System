import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-[#202124] hover:bg-[#303238] text-white shadow-xs focus:ring-[#FFE89A] border border-transparent dark:bg-[#FFE89A] dark:hover:bg-[#F5D670] dark:text-[#202124]',
      secondary:
        'bg-[#DDF2C1] hover:bg-[#D0EABC] text-[#245B32] border border-[#C2E599] focus:ring-[#4D9B45] dark:bg-[#1B4526] dark:hover:bg-[#245B32] dark:text-[#DDF2C1] dark:border-[#3D8036]',
      accent:
        'bg-[#FFE89A] hover:bg-[#F5D670] text-[#202124] font-semibold shadow-xs focus:ring-[#202124] border border-transparent',
      outline:
        'border border-[#E9E1CC] dark:border-[#303238] text-[#202124] dark:text-[#FAF8F2] hover:bg-[#FFF9E8] dark:hover:bg-[#26282B] focus:ring-[#FFE89A] bg-white dark:bg-[#202124]',
      ghost:
        'bg-transparent hover:bg-[#FFF9E8] dark:hover:bg-[#303238] text-[#77746B] dark:text-[#A99F87] hover:text-[#202124] dark:hover:text-[#FFFFFF] focus:ring-[#FFE89A] border border-transparent',
      danger:
        'bg-[#C94B4B] hover:bg-[#A63838] text-white shadow-xs focus:ring-red-400 border border-transparent',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-5 py-2.5 text-base gap-2.5',
      icon: 'p-2 text-sm',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
