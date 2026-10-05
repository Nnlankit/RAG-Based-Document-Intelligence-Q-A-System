import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, hoverable = false, children, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-[#F7F0E3] dark:bg-[#342A22] border border-[#D4C3A5] dark:border-[#554638] rounded-xl transition-all duration-200 shadow-[0_4px_20px_rgba(90,70,52,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] text-[#30261E] dark:text-[#F4EBDD]',
        hoverable && 'hover:border-[#8B6F52] dark:hover:border-[#CDB795] hover:shadow-[0_8px_28px_rgba(90,70,52,0.12)]',
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
  <div className={clsx('px-6 py-4 border-b border-[#D4C3A5]/60 dark:border-[#554638]/70', className)} {...props}>
    {children}
  </div>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => <div className={clsx('p-6', className)} {...props} />;

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={clsx('px-6 py-3 border-t border-[#D4C3A5]/60 dark:border-[#554638]/70 bg-[#F2E9D8]/50 dark:bg-[#2B231D]/50 rounded-b-xl', className)} {...props}>
    {children}
  </div>
);
