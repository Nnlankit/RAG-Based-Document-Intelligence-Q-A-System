import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, hoverable = false, children, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-white dark:bg-[#202124] border border-[#E9E1CC] dark:border-[#303238] rounded-2xl transition-all duration-200 shadow-card text-[#202124] dark:text-[#FAF8F2]',
        hoverable && 'hover:border-[#FFE89A] dark:hover:border-[#FFE89A]/60 hover:shadow-card-hover',
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
  <div className={clsx('px-6 py-4 border-b border-[#E9E1CC] dark:border-[#303238]', className)} {...props}>
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
  <div className={clsx('px-6 py-3.5 border-t border-[#E9E1CC] dark:border-[#303238] bg-[#FFFDF5] dark:bg-[#17181A] rounded-b-2xl', className)} {...props}>
    {children}
  </div>
);
