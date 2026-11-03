import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'brand' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variants = {
    default: 'bg-[#F0EBFA] text-[#5920B5] dark:bg-[#2C214B] dark:text-[#DDD6FE] border border-[#E8E1F2] dark:border-[#3E3065]',
    neutral: 'bg-[#F3F0F8] text-[#77738A] dark:bg-[#271F3F] dark:text-[#A39EB8] border border-[#E8E1F2] dark:border-[#3E3065]',
    success: 'bg-[#DCFCE7] text-[#16A34A] dark:bg-[#143E24] dark:text-[#4ADE80] border border-[#BBF7D0] dark:border-[#1F5E36]',
    warning: 'bg-[#FEF3C7] text-[#D97706] dark:bg-[#3D2C10] dark:text-[#FBBF24] border border-[#FDE68A] dark:border-[#5C4215]',
    danger: 'bg-[#FEE2E2] text-[#DC2626] dark:bg-[#3D1414] dark:text-[#F87171] border border-[#FECACA] dark:border-[#5E1E1E]',
    info: 'bg-[#EDE9FE] text-[#6D28D9] dark:bg-[#2A1F49] dark:text-[#C4B5FD] border border-[#DDD6FE] dark:border-[#433272]',
    brand: 'bg-[#EDE9FE] text-[#5920B5] dark:bg-[#2A1F49] dark:text-[#C4B5FD] border border-[#D5C7EA] dark:border-[#433272]',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={clsx(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
