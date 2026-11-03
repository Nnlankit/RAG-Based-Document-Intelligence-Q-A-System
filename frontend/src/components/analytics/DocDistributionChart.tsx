import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, CardContent } from '../common/Card';
import { FileQuestion, AlertCircle, Plus, ExternalLink } from 'lucide-react';
import { DocumentTypeDistributionItem } from '../../types/analytics';

interface DocDistributionChartProps {
  distribution?: DocumentTypeDistributionItem[] | Record<string, number>;
  isLoading?: boolean;
  error?: Error | null;
  onUploadClick?: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  PDF: '#5920B5',
  DOCX: '#8B5CF6',
  TXT: '#A78BFA',
  MD: '#16A34A',
  OTHER: '#77738A',
};

export const DocDistributionChart: React.FC<DocDistributionChartProps> = ({
  distribution,
  isLoading = false,
  error = null,
  onUploadClick,
}) => {
  const navigate = useNavigate();
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  // Normalize input data whether array from backend or record map
  const fullData: (DocumentTypeDistributionItem & { color: string })[] = React.useMemo(() => {
    const categories = ['PDF', 'DOCX', 'TXT', 'MD'];

    if (Array.isArray(distribution) && distribution.length > 0) {
      const total = distribution.reduce((sum, item) => sum + (item.value || 0), 0);
      return distribution.map((item) => {
        const upper = item.name.toUpperCase();
        const pct =
          item.percentage !== undefined
            ? Number(item.percentage)
            : total > 0
            ? Number(((item.value / total) * 100).toFixed(2))
            : 0.0;
        return {
          name: upper,
          value: item.value || 0,
          percentage: pct,
          color: TYPE_COLORS[upper] || '#77738A',
        };
      });
    }

    // Fallback if Record<string, number> provided
    const recordMap = (distribution as Record<string, number>) || {};
    const counts: Record<string, number> = {
      PDF: 0,
      DOCX: 0,
      TXT: 0,
      MD: 0,
    };

    let total = 0;
    Object.entries(recordMap).forEach(([k, v]) => {
      const upper = k.toUpperCase();
      if (counts[upper] !== undefined) {
        counts[upper] += v;
      } else {
        counts[upper] = (counts[upper] || 0) + v;
      }
      total += v;
    });

    return Object.entries(counts).map(([name, value]) => {
      const pct = total > 0 ? Number(((value / total) * 100).toFixed(2)) : 0.0;
      return {
        name,
        value,
        percentage: pct,
        color: TYPE_COLORS[name] || '#77738A',
      };
    });
  }, [distribution]);

  const total = fullData.reduce((sum, item) => sum + item.value, 0);

  // Critical fix: Only pass slices with positive values to Recharts Pie.
  const activeSlices = fullData.filter((item) => item.value > 0);

  const handleSelectFormat = (formatName: string) => {
    const lower = formatName.toLowerCase();
    setSelectedFormat(lower);
    navigate(`/documents?type=${lower}`);
  };

  return (
    <Card className="border border-[#E8E1F2] dark:border-[#352B52] bg-white dark:bg-[#1E1733] shadow-card h-full min-h-[300px] flex flex-col justify-between">
      <CardHeader className="h-14 flex items-center justify-between px-4 py-2.5 border-b border-[#E8E1F2] dark:border-[#352B52]">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-[#17152B] dark:text-white truncate">
            Document Types
          </h3>
          <p className="text-[11px] text-[#77738A] dark:text-[#A39EB8] truncate">
            Click segment or legend to filter files
          </p>
        </div>

        <button
          onClick={() => navigate('/documents')}
          className="text-[11px] font-semibold text-[#5920B5] dark:text-[#A78BFA] hover:underline flex items-center gap-1 shrink-0"
          title="Open Document Repository"
        >
          <span>All</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between p-3">
        {/* Loading State */}
        {isLoading ? (
          <div className="py-6 flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-full border-3 border-dashed border-[#5920B5]/30 animate-spin" />
            <p className="text-xs text-[#77738A] dark:text-[#A39EB8] animate-pulse">
              Loading distribution...
            </p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="py-4 text-center space-y-1.5">
            <AlertCircle className="w-6 h-6 text-rose-500 mx-auto" />
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              Failed to load distribution
            </p>
            <p className="text-[11px] text-[#77738A] max-w-xs mx-auto">
              {error.message || 'Unable to retrieve document metadata from database.'}
            </p>
          </div>
        ) : total === 0 ? (
          /* Empty State */
          <div className="py-4 text-center space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#F8F6FC] dark:bg-[#251B3D] text-[#5920B5] dark:text-[#A78BFA] flex items-center justify-center mx-auto">
              <FileQuestion className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#17152B] dark:text-white">
                No documents indexed yet
              </h4>
              <p className="text-[10px] text-[#77738A] dark:text-[#A39EB8] mt-0.5 max-w-xs mx-auto">
                Upload your first document to see format distribution.
              </p>
            </div>
            {onUploadClick && (
              <button
                onClick={onUploadClick}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#5920B5] hover:bg-[#4C1A9E] text-white text-[11px] font-semibold shadow-purple transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>Upload Document</span>
              </button>
            )}
          </div>
        ) : (
          /* Render Donut Chart and Legend */
          <div className="flex flex-col items-center justify-between gap-1.5 w-full h-full">
            {/* Donut Chart with Centered Total */}
            <div className="relative w-28 h-28 min-h-[112px] shrink-0 flex items-center justify-center cursor-pointer">
              <ResponsiveContainer width="100%" height="100%" minWidth={110} minHeight={110}>
                <PieChart>
                  <Pie
                    data={activeSlices}
                    cx="50%"
                    cy="50%"
                    innerRadius={34}
                    outerRadius={50}
                    paddingAngle={activeSlices.length > 1 ? 4 : 0}
                    dataKey="value"
                    stroke="none"
                    isAnimationActive={false}
                    onClick={(entry) => handleSelectFormat(entry.name)}
                    className="cursor-pointer"
                  >
                    {activeSlices.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={entry.color}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-[#211A35] text-white p-2.5 rounded-xl text-xs border border-[#362C54] shadow-purple">
                            <p className="font-bold flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              {item.name}
                            </p>
                            <p className="text-[11px] text-[#DDD6FE] mt-1 font-mono">
                              {item.value} {item.value === 1 ? 'doc' : 'docs'} ({item.percentage.toFixed(2)}%)
                            </p>
                            <p className="text-[9px] text-[#A78BFA] mt-1">
                              Click to view in repository
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Total Documents in Center */}
              <div
                onClick={() => navigate('/documents')}
                className="absolute inset-0 flex flex-col items-center justify-center text-center cursor-pointer group"
                title="View All Documents in Repository"
              >
                <span className="text-lg font-extrabold text-[#17152B] dark:text-white leading-tight group-hover:text-[#5920B5] transition-colors">
                  {total}
                </span>
                <span className="text-[8px] uppercase font-bold tracking-wider text-[#77738A] group-hover:text-[#5920B5] transition-colors">
                  Total Docs
                </span>
              </div>
            </div>

            {/* Document Types Legend with dynamic counts & percentages */}
            <div className="w-full space-y-1 pt-0.5">
              {fullData.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleSelectFormat(item.name)}
                  className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047] transition-all text-[11px] group text-left cursor-pointer active:scale-98"
                  title={`View all ${item.name} documents`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-[#17152B] dark:text-[#F5F3FF] truncate text-[11px] group-hover:text-[#5920B5] dark:group-hover:text-[#A78BFA] transition-colors">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-[10px] text-[#77738A] dark:text-[#A39EB8]">
                      {item.value} {item.value === 1 ? 'doc' : 'docs'}
                    </span>
                    <span className="font-bold text-[#5920B5] dark:text-[#A78BFA] text-[10px] w-10 text-right group-hover:underline">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
