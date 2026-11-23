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

// Requirement-aligned palette: PDF (Charcoal), DOCX (Natural Green), TXT (Golden Yellow), MD (Soft Sage)
const TYPE_COLORS: Record<string, string> = {
  PDF: '#202124',
  DOCX: '#4D9B45',
  TXT: '#E8BD42',
  MD: '#82C358',
  OTHER: '#77746B',
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
          color: TYPE_COLORS[upper] || '#77746B',
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
        color: TYPE_COLORS[name] || '#77746B',
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
    <Card className="border border-[#E9E1CC] dark:border-[#303238] bg-[#FFFDF5] dark:bg-[#202124] shadow-card h-full min-h-[300px] flex flex-col justify-between">
      <CardHeader className="h-14 flex items-center justify-between px-4 py-2.5 border-b border-[#E9E1CC] dark:border-[#303238]">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-[#202124] dark:text-white truncate">
            Document Types
          </h3>
          <p className="text-[11px] text-[#77746B] dark:text-[#A99F87] truncate">
            Click segment or legend to filter files
          </p>
        </div>

        <button
          onClick={() => navigate('/documents')}
          className="text-[11px] font-semibold text-[#202124] dark:text-[#FFE89A] hover:underline flex items-center gap-1 shrink-0"
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
            <div className="w-12 h-12 rounded-full border-3 border-dashed border-[#202124]/30 animate-spin" />
            <p className="text-xs text-[#77746B] dark:text-[#A99F87] animate-pulse">
              Loading distribution...
            </p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="py-4 text-center space-y-1.5">
            <AlertCircle className="w-6 h-6 text-[#C94B4B] mx-auto" />
            <p className="text-xs font-semibold text-[#C94B4B]">
              Failed to load distribution
            </p>
            <p className="text-[11px] text-[#77746B] max-w-xs mx-auto">
              {error.message || 'Unable to retrieve document metadata from database.'}
            </p>
          </div>
        ) : total === 0 ? (
          /* Empty State */
          <div className="py-4 text-center space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF9E8] dark:bg-[#17181A] text-[#202124] dark:text-[#FFE89A] flex items-center justify-center mx-auto">
              <FileQuestion className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#202124] dark:text-white">
                No documents indexed yet
              </h4>
              <p className="text-[10px] text-[#77746B] dark:text-[#A99F87] mt-0.5 max-w-xs mx-auto">
                Upload your first document to see format distribution.
              </p>
            </div>
            {onUploadClick && (
              <button
                onClick={onUploadClick}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#202124] hover:bg-[#303238] text-white text-[11px] font-semibold shadow-xs transition-all"
              >
                <Plus className="w-3 h-3 text-[#FFE89A]" />
                <span>Upload Document</span>
              </button>
            )}
          </div>
        ) : (
          /* Render Donut Chart and Legend */
          <div className="flex flex-col items-center justify-between gap-1.5 w-full h-full">
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
                          <div className="bg-[#202124] text-white p-2.5 rounded-xl text-xs border border-[#303238] shadow-dropdown">
                            <p className="font-bold flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              {item.name}
                            </p>
                            <p className="text-[11px] text-[#FAF8F2] mt-1 font-mono">
                              {item.value} {item.value === 1 ? 'doc' : 'docs'} ({item.percentage.toFixed(2)}%)
                            </p>
                            <p className="text-[9px] text-[#FFE89A] mt-1">
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
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <button
                  type="button"
                  onClick={() => navigate('/documents')}
                  className="w-14 h-14 rounded-full flex flex-col items-center justify-center text-center pointer-events-auto cursor-pointer group select-none focus:outline-none"
                  title="View All Documents in Repository"
                >
                  <span className="text-lg font-extrabold text-[#202124] dark:text-white leading-tight group-hover:text-[#4D9B45] transition-colors">
                    {total}
                  </span>
                  <span className="text-[8px] uppercase font-bold tracking-wider text-[#77746B] group-hover:text-[#4D9B45] transition-colors">
                    Total Docs
                  </span>
                </button>
              </div>
            </div>

            {/* Document Types Legend */}
            <div className="w-full space-y-1 pt-0.5">
              {fullData.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleSelectFormat(item.name)}
                  className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-[#FFF9E8] dark:hover:bg-[#303238] transition-all text-[11px] group text-left cursor-pointer active:scale-98"
                  title={`View all ${item.name} documents`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-[#202124] dark:text-[#FAF8F2] truncate text-[11px] group-hover:text-[#4D9B45] dark:group-hover:text-[#FFE89A] transition-colors">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-[10px] text-[#77746B] dark:text-[#A99F87]">
                      {item.value} {item.value === 1 ? 'doc' : 'docs'}
                    </span>
                    <span className="font-bold text-[#202124] dark:text-[#FFE89A] text-[10px] w-10 text-right group-hover:underline">
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
