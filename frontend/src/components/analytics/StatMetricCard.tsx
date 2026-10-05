import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '../common/Card';

interface StatMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  badge?: string;
}

export const StatMetricCard: React.FC<StatMetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-[#8B6F52] bg-[#E1D2B8] dark:bg-[#3E3228]',
  badge,
}) => {
  return (
    <Card className="p-5 border border-[#D4C3A5] dark:border-[#524436] bg-[#F7F0E3] dark:bg-[#342A22] shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#5A4634] dark:text-[#DCC9AA] uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-xl ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-[#30261E] dark:text-[#F7F0E3]">
          {value}
        </span>
        {badge && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#657A58]/15 text-[#657A58] dark:text-[#88A676] border border-[#657A58]/30">
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-[#5A4634] dark:text-[#DCC9AA]">{subtitle}</p>
      )}
    </Card>
  );
};
