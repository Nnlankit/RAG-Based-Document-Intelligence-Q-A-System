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
    default: 'bg-[#FFF1CC] text-[#202124] dark:bg-[#303238] dark:text-[#FFE89A] border border-[#E9E1CC] dark:border-[#3D4046]',
    neutral: 'bg-[#F3EFE4] text-[#77746B] dark:bg-[#26282B] dark:text-[#A99F87] border border-[#E9E1CC] dark:border-[#303238]',
    success: 'bg-[#E5F4DC] text-[#245B32] dark:bg-[#1B4526] dark:text-[#DDF2C1] border border-[#C2E599] dark:border-[#3D8036]',
    warning: 'bg-[#FFF1CC] text-[#875C0F] dark:bg-[#5E3E08] dark:text-[#FFE89A] border border-[#FFE89A] dark:border-[#875C0F]',
    danger: 'bg-[#FCE8E8] text-[#A63838] dark:bg-[#5C1D1D] dark:text-[#F87171] border border-[#F8C8C8] dark:border-[#8E2828]',
    info: 'bg-[#EAF0F6] text-[#384C62] dark:bg-[#223040] dark:text-[#BAC9D8] border border-[#C7D7E7] dark:border-[#405670]',
    brand: 'bg-[#FFE89A] text-[#202124] dark:bg-[#303238] dark:text-[#FFE89A] border border-[#E9E1CC] dark:border-[#3D4046]',
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
