import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardContent } from '../common/Card';

interface DocDistributionChartProps {
  distribution: Record<string, number>;
}

const COLORS = ['#5A4634', '#8B6F52', '#B87952', '#C9AD82', '#657A58'];

export const DocDistributionChart: React.FC<DocDistributionChartProps> = ({
  distribution,
}) => {
  const data = Object.entries(distribution).map(([name, value]) => ({
    name: name.toUpperCase(),
    value,
  }));

  if (data.length === 0) {
    return (
      <Card className="p-6 text-center text-xs text-[#5A4634] dark:text-[#DCC9AA] border border-[#D4C3A5] dark:border-[#524436] bg-[#F7F0E3] dark:bg-[#342A22]">
        No document distribution data.
      </Card>
    );
  }

  return (
    <Card className="border border-[#D4C3A5] dark:border-[#524436] bg-[#F7F0E3] dark:bg-[#342A22]">
      <CardHeader>
        <h4 className="text-xs font-semibold text-[#30261E] dark:text-[#F7F0E3] uppercase tracking-wider">
          Document Formats
        </h4>
        <p className="text-xs text-[#5A4634] dark:text-[#DCC9AA] mt-0.5">
          Distribution across indexed file extensions
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#30261E',
                  borderColor: '#5A4634',
                  borderRadius: '0.75rem',
                  color: '#F7F0E3',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
