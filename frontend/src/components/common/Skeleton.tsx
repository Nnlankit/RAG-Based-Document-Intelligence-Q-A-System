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
        'animate-pulse bg-[#D8C7AB]/70 dark:bg-[#44362A] border border-[#CDBB9D]/40 dark:border-[#524436]',
        variant === 'text' && 'h-4 rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-xl',
        className
      )}
      {...props}
    />
  );
};
