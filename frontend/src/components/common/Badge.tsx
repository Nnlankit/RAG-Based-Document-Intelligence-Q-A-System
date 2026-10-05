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
    default: 'bg-[#9A8B78]/15 text-[#6D5F4D] dark:bg-[#9A8B78]/25 dark:text-[#C5B7A4] border border-[#9A8B78]/30 dark:border-[#9A8B78]/40',
    neutral: 'bg-[#9A8B78]/15 text-[#6D5F4D] dark:bg-[#9A8B78]/25 dark:text-[#C5B7A4] border border-[#9A8B78]/30 dark:border-[#9A8B78]/40',
    success: 'bg-[#657A58]/15 text-[#4E6242] dark:bg-[#657A58]/25 dark:text-[#A7BA9B] border border-[#657A58]/30 dark:border-[#657A58]/40',
    warning: 'bg-[#B38A4A]/15 text-[#8F6A2C] dark:bg-[#B38A4A]/25 dark:text-[#E2BD7E] border border-[#B38A4A]/30 dark:border-[#B38A4A]/40',
    danger: 'bg-[#A65D50]/15 text-[#884337] dark:bg-[#A65D50]/25 dark:text-[#E0988B] border border-[#A65D50]/30 dark:border-[#A65D50]/40',
    info: 'bg-[#8B6F52]/15 text-[#5A4634] dark:bg-[#8B6F52]/25 dark:text-[#E5D5BA] border border-[#8B6F52]/30 dark:border-[#8B6F52]/40',
    brand: 'bg-[#5A4634]/15 text-[#5A4634] dark:bg-[#E5D5BA]/20 dark:text-[#E5D5BA] border border-[#5A4634]/25 dark:border-[#E5D5BA]/35',
    sand: 'bg-[#5A4634]/15 text-[#5A4634] dark:bg-[#E5D5BA]/20 dark:text-[#E5D5BA] border border-[#5A4634]/25 dark:border-[#E5D5BA]/35',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={clsx(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
