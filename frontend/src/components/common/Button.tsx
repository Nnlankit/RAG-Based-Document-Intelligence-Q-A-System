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
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-[#5A4634] hover:bg-[#463526] text-[#F7F0E3] shadow-sm focus:ring-[#8B6F52] border border-transparent dark:bg-[#E5D5BA] dark:hover:bg-[#D4C3A5] dark:text-[#211B16] dark:focus:ring-[#E5D5BA]',
      secondary:
        'bg-[#E1D2B8] hover:bg-[#D6C4A6] text-[#5A4634] border border-[#CDBB9D] focus:ring-[#8B6F52] dark:bg-[#3D3228] dark:hover:bg-[#4D3E32] dark:text-[#E5D5BA] dark:border-[#554638]',
      accent:
        'bg-[#B87952] hover:bg-[#A26844] text-[#F7F0E3] shadow-sm focus:ring-[#B87952] border border-transparent dark:bg-[#C58A63] dark:hover:bg-[#B47953] dark:text-[#211B16]',
      outline:
        'border border-[#CDBB9D] dark:border-[#554638] text-[#5A4634] dark:text-[#E5D5BA] hover:bg-[#E1D2B8]/40 dark:hover:bg-[#3D3228]/60 focus:ring-[#8B6F52] bg-transparent',
      ghost:
        'bg-transparent hover:bg-[#E1D2B8]/40 dark:hover:bg-[#3D3228]/60 text-[#5A4634] dark:text-[#DCC9AA] hover:text-[#30261E] dark:hover:text-[#F4EBDD] focus:ring-[#8B6F52] border border-transparent',
      danger:
        'bg-[#A65D50] hover:bg-[#884337] text-[#F7F0E3] shadow-sm focus:ring-[#A65D50] border border-transparent dark:bg-[#A65D50] dark:hover:bg-[#884337]',
    };

    const sizes = {
      sm: 'px-2.5 py-1.5 text-xs gap-1.5',
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
