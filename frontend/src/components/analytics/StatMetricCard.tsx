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
  iconGradient = 'from-[#5920B5] to-[#8B5CF6]',
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
      className={`p-3.5 xl:p-4 border border-[#E8E1F2] dark:border-[#352B52] bg-white dark:bg-[#1E1733] shadow-card transition-all duration-200 group h-full flex flex-col justify-between ${
        onClick
          ? 'cursor-pointer hover:border-[#8B5CF6] hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] active:scale-[0.98]'
          : ''
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-[11px] font-bold text-[#77738A] dark:text-[#A39EB8] uppercase tracking-wider truncate group-hover:text-[#5920B5] dark:group-hover:text-[#A78BFA] transition-colors">
            {title}
          </span>
          {onClick && (
            <ArrowUpRight className="w-3 h-3 text-[#77738A] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          )}
        </div>
        <div
          className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${iconGradient} flex items-center justify-center text-white shadow-purple group-hover:scale-105 transition-transform shrink-0`}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>

      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-2xl font-extrabold tracking-tight text-[#17152B] dark:text-white">
          {value}
        </span>
        {badge && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] dark:bg-[#143E24] dark:text-[#4ADE80] border border-[#BBF7D0] dark:border-[#1F5E36]">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-1 flex items-center justify-between text-[11px]">
        {subtitle && (
          <p className="text-[#77738A] dark:text-[#A39EB8] text-[11px] font-normal truncate">
            {subtitle}
          </p>
        )}
        {trend && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#16A34A] dark:text-[#4ADE80] shrink-0">
            <TrendingUp className="w-2.5 h-2.5" />
            <span>{trend}</span>
          </span>
        )}
      </div>
    </Card>
  );
};
