import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, hoverable = false, children, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-white dark:bg-[#1E1733] border border-[#E8E1F2] dark:border-[#352B52] rounded-2xl transition-all duration-200 shadow-card text-[#17152B] dark:text-[#F5F3FF]',
        hoverable && 'hover:border-[#8B5CF6]/50 dark:hover:border-[#8B5CF6]/60 hover:shadow-card-hover',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={clsx('px-6 py-4 border-b border-[#E8E1F2] dark:border-[#352B52]', className)} {...props}>
    {children}
  </div>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={clsx('p-6', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={clsx('px-6 py-3.5 border-t border-[#E8E1F2] dark:border-[#352B52] bg-[#FAF8FD] dark:bg-[#181228] rounded-b-2xl', className)} {...props}>
    {children}
  </div>
);
