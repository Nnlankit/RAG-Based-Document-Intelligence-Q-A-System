import React from 'react';
import { clsx } from 'clsx';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  ...props
}) => {
  return (
    <div
      className={clsx(
        'animate-pulse bg-[#F3EFE4] dark:bg-[#26282B] border border-[#E9E1CC]/60 dark:border-[#303238]',
        variant === 'text' && 'h-4 rounded-lg',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-2xl',
        className
      )}
      {...props}
    />
  );
};
