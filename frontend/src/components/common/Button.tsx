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
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-[#5920B5] hover:bg-[#481A94] text-white shadow-sm hover:shadow-purple focus:ring-[#8B5CF6] border border-transparent dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] dark:text-white',
      secondary:
        'bg-[#F0EBFA] hover:bg-[#E4DAF8] text-[#5920B5] border border-[#E8E1F2] focus:ring-[#8B5CF6] dark:bg-[#2A2047] dark:hover:bg-[#342758] dark:text-[#DDD6FE] dark:border-[#3E3065]',
      accent:
        'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-sm hover:shadow-purple focus:ring-[#8B5CF6] border border-transparent',
      outline:
        'border border-[#E8E1F2] dark:border-[#352B52] text-[#17152B] dark:text-[#F5F3FF] hover:bg-[#F8F6FC] dark:hover:bg-[#261E3E] focus:ring-[#8B5CF6] bg-white dark:bg-[#1E1733]',
      ghost:
        'bg-transparent hover:bg-[#F0EBFA] dark:hover:bg-[#261E3E] text-[#77738A] dark:text-[#A39EB8] hover:text-[#17152B] dark:hover:text-[#FFFFFF] focus:ring-[#8B5CF6] border border-transparent',
      danger:
        'bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-sm focus:ring-red-500 border border-transparent',
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
