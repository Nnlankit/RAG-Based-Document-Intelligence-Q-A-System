import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Activity, AlertCircle, X, ExternalLink } from 'lucide-react';
import { ActivityTimelineItem } from '../../types/analytics';
import { DocumentItem } from '../../types/document';
import { Conversation } from '../../types/chat';

interface KnowledgeActivityChartProps {
  activityTimeline?: ActivityTimelineItem[];
  documents?: DocumentItem[];
  conversations?: Conversation[];
  isLoading?: boolean;
  error?: Error | null;
}

export const KnowledgeActivityChart: React.FC<KnowledgeActivityChartProps> = ({
  activityTimeline = [],
  documents = [],
  conversations = [],
  isLoading = false,
  error = null,
}) => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const [dateRange, setDateRange] = useState<'7d' | '14d' | '30d'>('7d');
  const [selectedPoint, setSelectedPoint] = useState<{
    name: string;
    date?: string;
    Questions: number;
    Answers: number;
    Documents: number;
  } | null>(null);

  // Build daily timeline from database data
  const normalizedDailyTimeline = useMemo(() => {
    if (activityTimeline && activityTimeline.length > 0) {
      return activityTimeline;
    }

    // Fallback: reconstruct from document and conversation records if timeline not provided
    const daysMap: Record<string, ActivityTimelineItem> = {};
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      daysMap[dateKey] = {
        date: dateKey,
        documents: 0,
        questions: 0,
        answers: 0,
      };
    }

    // Count documents
    documents.forEach((doc) => {
      if (doc.created_at) {
        const key = doc.created_at.slice(0, 10);
        if (daysMap[key]) {
          daysMap[key].documents += 1;
        }
      }
    });

    // Count conversation messages
    conversations.forEach((conv) => {
      if (conv.messages) {
        conv.messages.forEach((msg) => {
          if (msg.created_at) {
            const key = msg.created_at.slice(0, 10);
            if (daysMap[key]) {
              if (msg.role === 'user') {
                daysMap[key].questions += 1;
              } else if (msg.role === 'assistant') {
                daysMap[key].answers += 1;
              }
            }
          }
        });
      }
    });

    return Object.values(daysMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [activityTimeline, documents, conversations]);

  // Aggregate based on timeframe & date range
  const chartData = useMemo(() => {
    if (normalizedDailyTimeline.length === 0) return [];

    const daysCount = dateRange === '7d' ? 7 : dateRange === '14d' ? 14 : 30;
    const sliced = normalizedDailyTimeline.slice(-daysCount);

    if (timeframe === 'weekly') {
      return sliced.map((item) => {
        const parts = item.date.split('-');
        const dateObj = new Date(
          parseInt(parts[0], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[2], 10)
        );
        const dayName = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
        const monthDay = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

        return {
          name: `${dayName} (${monthDay})`,
          shortName: daysCount > 7 ? monthDay : `${dayName} ${dateObj.getDate()}`,
          date: item.date,
          Questions: item.questions,
          Answers: item.answers,
          Documents: item.documents,
        };
      });
    } else {
      // Monthly grouped view
      const totalDays = sliced.length;
      const bucketSize = Math.max(1, Math.ceil(totalDays / 4));
      const buckets = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

      return buckets.map((bucketName, idx) => {
        const start = idx * bucketSize;
        const end = Math.min(start + bucketSize, totalDays);
        const slice = sliced.slice(start, end);

        const questionsSum = slice.reduce((sum, d) => sum + d.questions, 0);
        const answersSum = slice.reduce((sum, d) => sum + d.answers, 0);
        const docsSum = slice.reduce((sum, d) => sum + d.documents, 0);

        return {
          name: bucketName,
          shortName: bucketName,
          Questions: questionsSum,
          Answers: answersSum,
          Documents: docsSum,
        };
      });
    }
  }, [normalizedDailyTimeline, timeframe, dateRange]);

  const totalActivity = useMemo(() => {
    return normalizedDailyTimeline.reduce(
      (sum, item) => sum + item.questions + item.answers + item.documents,
      0
    );
  }, [normalizedDailyTimeline]);

  return (
    <Card className="border border-[#E9E1CC] dark:border-[#303238] bg-[#FFFDF5] dark:bg-[#202124] shadow-card h-full min-h-[300px] flex flex-col justify-between">
      <CardHeader className="h-14 flex items-center justify-between gap-2 px-4 py-2.5 border-b border-[#E9E1CC] dark:border-[#303238]">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-[#202124] dark:text-white truncate">
            Knowledge Activity
          </h3>
          <p className="text-[11px] text-[#77746B] dark:text-[#A99F87] truncate">
            Questions, Answers & Document uploads
          </p>
        </div>

        {/* Date Range & Timeframe Filters */}
        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="text-[10px] font-semibold bg-[#FFF9E8] dark:bg-[#17181A] border border-[#E9E1CC] dark:border-[#303238] text-[#202124] dark:text-[#FAF8F2] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#FFE89A] cursor-pointer"
            title="Filter activity date range"
          >
            <option value="7d">Last 7 Days</option>
            <option value="14d">Last 14 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          <div className="flex items-center gap-0.5 p-0.5 bg-[#FFF9E8] dark:bg-[#17181A] border border-[#E9E1CC] dark:border-[#303238] rounded-lg">
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-all ${
                timeframe === 'weekly'
                  ? 'bg-[#202124] text-white shadow-xs'
                  : 'text-[#77746B] dark:text-[#A99F87] hover:text-[#202124] dark:hover:text-white'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-all ${
                timeframe === 'monthly'
                  ? 'bg-[#202124] text-white shadow-xs'
                  : 'text-[#77746B] dark:text-[#A99F87] hover:text-[#202124] dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-center p-3">
        {isLoading ? (
          <div className="h-44 sm:h-48 w-full flex flex-col items-center justify-center space-y-2">
            <div className="w-8 h-8 border-3 border-[#202124] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#77746B] dark:text-[#A99F87] animate-pulse">
              Aggregating knowledge telemetry...
            </p>
          </div>
        ) : error ? (
          <div className="h-44 sm:h-48 w-full flex flex-col items-center justify-center space-y-2 text-center">
            <AlertCircle className="w-7 h-7 text-[#C94B4B]" />
            <p className="text-xs font-semibold text-[#C94B4B]">
              Failed to load knowledge activity
            </p>
            <p className="text-[11px] text-[#77746B] max-w-xs">
              {error.message || 'Unable to connect to database activity telemetry.'}
            </p>
          </div>
        ) : totalActivity === 0 ? (
          <div className="h-44 sm:h-48 w-full flex flex-col items-center justify-center space-y-2 text-center">
            <div className="w-10 h-10 rounded-xl bg-[#FFF9E8] dark:bg-[#17181A] text-[#202124] dark:text-[#FFE89A] flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#202124] dark:text-white">
                No activity recorded yet
              </h4>
              <p className="text-[11px] text-[#77746B] dark:text-[#A99F87] mt-0.5 max-w-xs">
                Questions asked, AI responses generated, and newly indexed files will plot here dynamically.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-44 sm:h-48 min-h-[175px] w-full pt-1 relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={175}>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                onClick={(e) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    setSelectedPoint(e.activePayload[0].payload);
                  }
                }}
                className="cursor-pointer"
              >
                <defs>
                  {/* Charcoal for Questions (#303238) */}
                  <linearGradient id="charcoalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#303238" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#303238" stopOpacity={0.0} />
                  </linearGradient>
                  {/* Natural Green for Answers (#4D9B45) */}
                  <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4D9B45" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4D9B45" stopOpacity={0.0} />
                  </linearGradient>
                  {/* Golden Yellow for Documents (#E8BD42) */}
                  <linearGradient id="yellowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8BD42" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#E8BD42" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9E1CC" opacity={0.7} />
                <XAxis
                  dataKey="shortName"
                  tick={{ fontSize: 11, fill: '#77746B' }}
                  stroke="#E9E1CC"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#77746B' }}
                  stroke="#E9E1CC"
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#202124',
                    borderColor: '#303238',
                    borderRadius: '1rem',
                    color: '#FAF8F2',
                    fontSize: '12px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#FFE89A', marginBottom: '4px' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconType="circle"
                />
                <Area
                  type="monotone"
                  dataKey="Questions"
                  stroke="#303238"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#charcoalGradient)"
                  isAnimationActive={false}
                  activeDot={{ r: 5, fill: '#303238', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="Answers"
                  stroke="#4D9B45"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#greenGradient)"
                  isAnimationActive={false}
                  activeDot={{ r: 5, fill: '#4D9B45', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="Documents"
                  stroke="#E8BD42"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#yellowGradient)"
                  isAnimationActive={false}
                  activeDot={{ r: 5, fill: '#E8BD42', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Clicked Activity Details Popover */}
            {selectedPoint && (
              <div className="absolute inset-x-2 bottom-2 bg-[#202124]/95 backdrop-blur-md text-white border border-[#303238] rounded-xl p-3 shadow-dropdown flex items-center justify-between gap-3 z-20 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#303238] flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4 text-[#FFE89A]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      Activity on {selectedPoint.name}
                    </p>
                    <p className="text-[11px] text-[#E6E7E8] truncate mt-0.5">
                      {selectedPoint.Questions} Questions • {selectedPoint.Answers} Answers • {selectedPoint.Documents} Uploads
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => navigate('/conversations')}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Chats</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => navigate('/documents')}
                    className="px-2.5 py-1 rounded-lg bg-[#FFE89A] hover:bg-[#F5D670] text-[#202124] text-[11px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Files</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setSelectedPoint(null)}
                    className="p-1 rounded-lg text-[#A4A7AD] hover:text-white hover:bg-white/10 transition-colors ml-1"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
