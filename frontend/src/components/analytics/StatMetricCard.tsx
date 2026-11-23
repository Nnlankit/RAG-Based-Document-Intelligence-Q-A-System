import React from 'react';
import { LucideIcon, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Card } from '../common/Card';

interface StatMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconGradient?: string;
  badge?: string;
  trend?: string;
  onClick?: () => void;
}

export const StatMetricCard: React.FC<StatMetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  trend = '+12% this week',
  onClick,
}) => {
  return (
    <Card
      hoverable
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`p-3.5 xl:p-4 border border-[#E9E1CC] dark:border-[#303238] bg-white dark:bg-[#202124] shadow-card transition-all duration-200 group h-full flex flex-col justify-between ${
        onClick
          ? 'cursor-pointer hover:border-[#FFE89A] hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE89A] active:scale-[0.98]'
          : ''
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-[11px] font-bold text-[#77746B] dark:text-[#A99F87] uppercase tracking-wider truncate group-hover:text-[#202124] dark:group-hover:text-white transition-colors">
            {title}
          </span>
          {onClick && (
            <ArrowUpRight className="w-3 h-3 text-[#77746B] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          )}
        </div>
        {/* Soft yellow icon container */}
        <div
          className="w-8 h-8 rounded-xl bg-[#FFE89A] flex items-center justify-center text-[#202124] shadow-xs group-hover:scale-105 transition-transform shrink-0"
        >
          <Icon className="w-4 h-4 text-[#202124]" />
        </div>
      </div>

      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-2xl font-extrabold tracking-tight text-[#202124] dark:text-white">
          {value}
        </span>
        {badge && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#E5F4DC] text-[#245B32] dark:bg-[#1B4526] dark:text-[#DDF2C1] border border-[#C2E599] dark:border-[#3D8036]">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-1 flex items-center justify-between text-[11px]">
        {subtitle && (
          <p className="text-[#77746B] dark:text-[#A99F87] text-[11px] font-normal truncate">
            {subtitle}
          </p>
        )}
        {trend && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#245B32] dark:text-[#DDF2C1] bg-[#E5F4DC] dark:bg-[#1B4526] px-1.5 py-0.5 rounded-md shrink-0">
            <TrendingUp className="w-2.5 h-2.5 text-[#4D9B45]" />
            <span>{trend}</span>
          </span>
        )}
      </div>
    </Card>
  );
};
