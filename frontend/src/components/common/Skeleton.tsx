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
        'animate-pulse bg-[#EDE8F5] dark:bg-[#2A2047] border border-[#E8E1F2]/60 dark:border-[#352B52]',
        variant === 'text' && 'h-4 rounded-lg',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-2xl',
        className
      )}
      {...props}
    />
  );
};
